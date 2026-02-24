import type { SearchResult } from '../types'

const AIS_BASE = 'https://api.phila.gov/ais-pde/v1'

// Unit designators used by AIS in Philadelphia addresses
const UNIT_PATTERN = / (APT|UNIT|STE|FL|#)\s*.+$/i

function isUnitAddress(address: string): boolean {
  return UNIT_PATTERN.test(address)
}

function stripUnit(address: string): string {
  return address.replace(UNIT_PATTERN, '')
}

interface AisFeature {
  properties: {
    street_address: string
    opa_account_num: string
    pwd_parcel_id: string
    opa_owners: string[]
    dor_parcel_id: string
  }
  geometry: {
    coordinates: [number, number]
  }
}

interface AisResponse {
  features: AisFeature[]
  total_size: number
}

async function fetchAisPage(encoded: string, page: number): Promise<AisResponse> {
  const key = import.meta.env.VITE_GATEKEEPER_KEY
  const url = `${AIS_BASE}/search/${encoded}?gatekeeperKey=${key}&include_units=true&opa_only=true&sort_field=street_address&page=${page}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`AIS geocode failed: ${response.status}`)
  }
  return response.json()
}

const AIS_PAGE_SIZE = 100

export async function geocodeAddress(input: string): Promise<{
  main: SearchResult
  related: SearchResult[]
}> {
  const encoded = encodeURIComponent(input)
  const data = await fetchAisPage(encoded, 1)

  if (!data.features || data.features.length === 0) {
    throw new Error('No results found')
  }

  // Fetch remaining pages if results are paginated
  if (data.total_size > data.features.length) {
    const totalPages = Math.ceil(data.total_size / AIS_PAGE_SIZE)
    const pagePromises = []
    for (let page = 2; page <= totalPages; page++) {
      pagePromises.push(fetchAisPage(encoded, page))
    }
    const pages = await Promise.all(pagePromises)
    for (const page of pages) {
      data.features.push(...page.features)
    }
  }

  const toSearchResult = (feature: AisFeature, isUnit: boolean): SearchResult => ({
    address: feature.properties.street_address,
    opaNumber: feature.properties.opa_account_num,
    lng: feature.geometry.coordinates[0],
    lat: feature.geometry.coordinates[1],
    isUnit,
    hasCondoUnits: false,
    condoUnitCount: 0,
    pwdParcelId: feature.properties.pwd_parcel_id,
  })

  // Find the building result (no unit designator in address). If the building
  // itself has no OPA record (common for condos), all results are units —
  // synthesize a building row from the base address.
  const buildingFeature = data.features.find(f => !isUnitAddress(f.properties.street_address))

  let main: SearchResult
  let related: SearchResult[]

  if (buildingFeature) {
    main = toSearchResult(buildingFeature, false)
    related = data.features
      .filter(f => f !== buildingFeature)
      .map(f => toSearchResult(f, true))
  } else {
    const baseAddress = stripUnit(data.features[0].properties.street_address)
    main = {
      address: baseAddress,
      opaNumber: `bldg-${data.features[0].properties.pwd_parcel_id}`,
      lng: data.features[0].geometry.coordinates[0],
      lat: data.features[0].geometry.coordinates[1],
      isUnit: false,
      hasCondoUnits: false,
      condoUnitCount: data.total_size,
      pwdParcelId: data.features[0].properties.pwd_parcel_id,
    }
    related = data.features.map(f => toSearchResult(f, true))
  }

  // If there are related units, set the count on the main result
  if (related.length > 0) {
    main.condoUnitCount = data.total_size
  }

  return { main, related }
}

export async function searchBlock(input: string): Promise<{
  results: SearchResult[]
  condoUnits: Map<string, SearchResult[]>
}> {
  const cleaned = input
    .toLowerCase()
    .replace(/blk|block:/gi, '')
    .replace(/block/gi, '')
    .trim()
  const encoded = encodeURIComponent(cleaned)
  const key = import.meta.env.VITE_GATEKEEPER_KEY
  const baseUrl = `https://api.phila.gov/ais_ps/v1/block/${encoded}?gatekeeperKey=${key}`

  const response = await fetch(`${baseUrl}&page=1`)
  if (!response.ok) {
    throw new Error(`Block search failed: ${response.status}`)
  }
  const data: AisResponse = await response.json()
  if (!data.features || data.features.length === 0) {
    return { results: [], condoUnits: new Map() }
  }

  // Fetch remaining pages if paginated
  if (data.total_size > data.features.length) {
    const totalPages = Math.ceil(data.total_size / AIS_PAGE_SIZE)
    const pagePromises = []
    for (let page = 2; page <= totalPages; page++) {
      pagePromises.push(
        fetch(`${baseUrl}&page=${page}`).then(r => r.json() as Promise<AisResponse>)
      )
    }
    const pages = await Promise.all(pagePromises)
    for (const page of pages) {
      data.features.push(...page.features)
    }
  }

  const toSearchResult = (feature: AisFeature, isUnit: boolean): SearchResult => ({
    address: feature.properties.street_address,
    opaNumber: feature.properties.opa_account_num,
    lng: feature.geometry.coordinates[0],
    lat: feature.geometry.coordinates[1],
    isUnit,
    hasCondoUnits: false,
    condoUnitCount: 0,
    pwdParcelId: feature.properties.pwd_parcel_id,
  })

  // Group by pwd_parcel_id to identify condos (multiple features = units)
  const byParcel = new Map<string, AisFeature[]>()
  for (const f of data.features) {
    const pid = f.properties.pwd_parcel_id
    if (!byParcel.has(pid)) byParcel.set(pid, [])
    byParcel.get(pid)!.push(f)
  }

  const results: SearchResult[] = []
  const condoUnits = new Map<string, SearchResult[]>()

  for (const [, features] of byParcel) {
    if (features.length === 1) {
      // Single property — not a condo
      results.push(toSearchResult(features[0], false))
    } else {
      // Multiple features on same parcel — condo building
      const nonUnit = features.find(f => !isUnitAddress(f.properties.street_address))
      let building: SearchResult

      if (nonUnit) {
        building = toSearchResult(nonUnit, false)
      } else {
        // All are units — synthesize a building row from base address
        const baseAddress = stripUnit(features[0].properties.street_address)
        building = {
          address: baseAddress,
          opaNumber: `bldg-${features[0].properties.pwd_parcel_id}`,
          lng: features[0].geometry.coordinates[0],
          lat: features[0].geometry.coordinates[1],
          isUnit: false,
          hasCondoUnits: false,
          condoUnitCount: 0,
          pwdParcelId: features[0].properties.pwd_parcel_id,
        }
      }

      building.hasCondoUnits = true
      building.condoUnitCount = features.length

      const units = features.map(f => toSearchResult(f, true))
      condoUnits.set(building.opaNumber, units)
      results.push(building)
    }
  }

  return { results, condoUnits }
}
