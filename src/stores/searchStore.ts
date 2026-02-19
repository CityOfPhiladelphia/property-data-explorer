import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SearchResult, SearchType, OpaPublic } from '../types'
import { geocodeAddress, searchBlock } from '../composables/useAisGeocoder'
import { cartoQuery } from '../composables/useCartoQuery'

export const useSearchStore = defineStore('search', () => {
  const searchType = ref<SearchType>('address')
  const searchInput = ref('')
  const searchStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
  const searchError = ref('')
  const searchResults = ref<SearchResult[]>([])
  const hasCondoUnits = ref(false)

  async function doAddressSearch(input: string) {
    searchType.value = 'address'
    searchInput.value = input
    searchStatus.value = 'loading'
    searchError.value = ''
    searchResults.value = []

    try {
      const { main, related } = await geocodeAddress(input)
      searchResults.value = [main, ...related]
      hasCondoUnits.value = related.length > 0
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
      searchResults.value = await searchBlock(input)
      hasCondoUnits.value = false
      searchStatus.value = 'success'
    } catch (e) {
      searchError.value = e instanceof Error ? e.message : 'Block search failed'
      searchStatus.value = 'error'
    }
  }

  async function expandCondoUnits() {
    if (searchResults.value.length === 0) return

    const mainResult = searchResults.value[0]
    try {
      const { main, related } = await geocodeAddress(mainResult.address)
      const existingOpas = new Set(searchResults.value.map(r => r.opaNumber))
      const newUnits = related.filter(r => !existingOpas.has(r.opaNumber))
      searchResults.value = [...searchResults.value, ...newUnits]
      hasCondoUnits.value = false
    } catch (e) {
      console.error('Condo expansion failed:', e)
    }
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
        pwdParcelId: r.pwd_parcel_id,
      }))
      hasCondoUnits.value = false
      searchStatus.value = 'success'
    } catch (e) {
      searchError.value = e instanceof Error ? e.message : 'Owner search failed'
      searchStatus.value = 'error'
    }
  }

  function reset() {
    searchType.value = 'address'
    searchInput.value = ''
    searchStatus.value = 'idle'
    searchError.value = ''
    searchResults.value = []
    hasCondoUnits.value = false
  }

  return {
    searchType,
    searchInput,
    searchStatus,
    searchError,
    searchResults,
    hasCondoUnits,
    doAddressSearch,
    doBlockSearch,
    doOwnerSearch,
    expandCondoUnits,
    reset,
  }
})
