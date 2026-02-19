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

export async function geocodeAddress(input: string): Promise<{
  main: SearchResult
  related: SearchResult[]
}> {
  const encoded = encodeURIComponent(input)
  const key = import.meta.env.VITE_GATEKEEPER_KEY
  const url = `${AIS_BASE}/search/${encoded}?gatekeeperKey=${key}&include_units=true&opa_only=true&sort_field=street_address`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`AIS geocode failed: ${response.status}`)
  }
  const data: AisResponse = await response.json()

  if (!data.features || data.features.length === 0) {
    throw new Error('No results found')
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

export async function searchBlock(input: string): Promise<SearchResult[]> {
  const cleaned = input
    .toLowerCase()
    .replace(/blk|block:/gi, '')
    .replace(/block/gi, '')
    .trim()
  const encoded = encodeURIComponent(cleaned)
  const key = import.meta.env.VITE_GATEKEEPER_KEY
  const url = `https://api.phila.gov/ais_ps/v1/block/${encoded}?gatekeeperKey=${key}&page=1`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Block search failed: ${response.status}`)
  }
  const data: AisResponse = await response.json()

  return (data.features || []).map(f => ({
    address: f.properties.street_address,
    opaNumber: f.properties.opa_account_num,
    lng: f.geometry.coordinates[0],
    lat: f.geometry.coordinates[1],
    isUnit: false,
    hasCondoUnits: false,
    condoUnitCount: 0,
    pwdParcelId: f.properties.pwd_parcel_id,
  }))
}
