import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SearchResult, SearchType } from '../types'
import { geocodeAddress, searchBlock } from '../composables/useAisGeocoder'

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
    expandCondoUnits,
    reset,
  }
})
