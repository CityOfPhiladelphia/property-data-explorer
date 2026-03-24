import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SearchResult, SearchType, OpaPublic } from '../types'
import { geocodeAddress, searchBlock } from '../composables/useAisGeocoder'
import { cartoQuery, buildInClause } from '../composables/useCartoQuery'
import { geojsonToWkt } from '../composables/useGeojsonToWkt'

export const useSearchStore = defineStore('search', () => {
  const searchType = ref<SearchType>('address')
  const searchInput = ref('')
  const searchStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
  const searchError = ref('')
  const searchResults = ref<SearchResult[]>([])
  const condoUnitsCache = ref<Map<string, SearchResult[]>>(new Map())

  async function doAddressSearch(input: string) {
    searchType.value = 'address'
    searchInput.value = input
    searchStatus.value = 'loading'
    searchError.value = ''
    searchResults.value = []

    try {
      const { main, related } = await geocodeAddress(input)
      if (related.length > 0) {
        main.hasCondoUnits = true
        condoUnitsCache.value.set(main.opaNumber, related)
      }
      searchResults.value = [main]
      searchStatus.value = 'success'
    } catch (e) {
      searchError.value = e instanceof Error ? e.message : 'Search failed'
      searchStatus.value = 'error'
    }
  }

  async function doBlockSearch(input: string) {
    searchType.value = 'block'
    searchInput.value = input
    searchStatus.value = 'loading'
    searchError.value = ''
    searchResults.value = []

    try {
      const { results, condoUnits } = await searchBlock(input)
      for (const [key, units] of condoUnits) {
        condoUnitsCache.value.set(key, units)
      }
      searchResults.value = results
      searchStatus.value = 'success'
    } catch (e) {
      searchError.value = e instanceof Error ? e.message : 'Block search failed'
      searchStatus.value = 'error'
    }
  }

  async function expandCondoUnits(opaNumber: string): Promise<string[]> {
    const buildingIndex = searchResults.value.findIndex(r => r.opaNumber === opaNumber)
    if (buildingIndex === -1) return []

    let units = condoUnitsCache.value.get(opaNumber)
    if (!units) {
      try {
        const building = searchResults.value[buildingIndex]
        const { related } = await geocodeAddress(building.address)
        units = related
      } catch (e) {
        console.error('Condo expansion failed:', e)
        return []
      }
    }

    const existingOpas = new Set(searchResults.value.map(r => r.opaNumber))
    const newUnits = units.filter(r => !existingOpas.has(r.opaNumber))

    // Insert units right after the building row
    const updated = [...searchResults.value]
    updated.splice(buildingIndex + 1, 0, ...newUnits)
    updated[buildingIndex] = { ...updated[buildingIndex], hasCondoUnits: false }
    searchResults.value = updated

    condoUnitsCache.value.delete(opaNumber)
    return newUnits.map(u => u.opaNumber)
  }

  async function doOwnerSearch(input: string) {
    searchType.value = 'owner'
    searchInput.value = input
    searchStatus.value = 'loading'
    searchError.value = ''
    searchResults.value = []

    try {
      const escaped = input.replace(/'/g, "''")
      const rows = await cartoQuery<OpaPublic>(
        `SELECT * FROM opa_properties_public_pde WHERE owner_1 ILIKE '%${escaped}%' OR owner_2 ILIKE '%${escaped}%' ORDER BY street_address ASC LIMIT 200`
      )
      searchResults.value = rows.map(r => ({
        address: r.street_address,
        opaNumber: r.parcel_number,
        lng: 0,
        lat: 0,
        isUnit: false,
        hasCondoUnits: false,
        condoUnitCount: 0,
        pwdParcelId: r.pwd_parcel_id,
        aisProperties: null,
      }))
      searchStatus.value = 'success'
    } catch (e) {
      searchError.value = e instanceof Error ? e.message : 'Owner search failed'
      searchStatus.value = 'error'
    }
  }

  async function doShapeSearch(geojson: any) {
    searchType.value = 'shape'
    searchInput.value = JSON.stringify(geojson)
    searchStatus.value = 'loading'
    searchError.value = ''
    searchResults.value = []

    try {
      const wkt = geojsonToWkt(geojson)
      const parcelRows = await cartoQuery<{ pwd_parcel_id: string }>(
        `SELECT pwd_parcel_id FROM pwd_parcels WHERE ST_Intersects(the_geom, ST_GeomFromText('${wkt}', 4326))`
      )

      if (parcelRows.length === 0) {
        searchResults.value = []
        searchStatus.value = 'success'
        return
      }

      const parcelIds = parcelRows.map(r => r.pwd_parcel_id)
      const inClause = buildInClause(parcelIds)
      const opaRows = await cartoQuery<OpaPublic>(
        `SELECT * FROM opa_properties_public_pde WHERE pwd_parcel_id IN (${inClause}) ORDER BY address_std ASC`
      )

      searchResults.value = opaRows.map(r => ({
        address: r.address_std || r.street_address,
        opaNumber: r.parcel_number,
        lng: 0,
        lat: 0,
        isUnit: false,
        hasCondoUnits: false,
        condoUnitCount: 0,
        pwdParcelId: r.pwd_parcel_id,
        aisProperties: null,
      }))
      searchStatus.value = 'success'
    } catch (e) {
      searchError.value = e instanceof Error ? e.message : 'Shape search failed'
      searchStatus.value = 'error'
    }
  }

  function reset() {
    searchType.value = 'address'
    searchInput.value = ''
    searchStatus.value = 'idle'
    searchError.value = ''
    searchResults.value = []
    condoUnitsCache.value.clear()
  }

  return {
    searchType,
    searchInput,
    searchStatus,
    searchError,
    searchResults,
    condoUnitsCache,
    doAddressSearch,
    doBlockSearch,
    doOwnerSearch,
    doShapeSearch,
    expandCondoUnits,
    reset,
  }
})
