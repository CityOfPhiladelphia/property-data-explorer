<template>
  <PhilaMap
    :center="[-75.1635, 39.9526]"
    :zoom="12"
  >
    <MapSearchControl
      position="top-left"
      @result="handleSearchResult"
      @error="handleSearchError"
    />
    <MapNavigationControl position="top-right" />
    <GeolocationButton position="top-right" />
    <BasemapToggle position="bottom-right" />
    <DrawTool @draw="handleShapeDraw" />

    <FillLayer
      v-if="parcelGeojson"
      id="parcel-fill"
      :source="parcelSource"
      :paint="{
        'fill-color': '#2176d2',
        'fill-opacity': 0.3,
        'fill-outline-color': '#2176d2',
      }"
    />
    <CircleLayer
      v-if="markerGeojson"
      id="address-markers"
      :source="markerSource"
      :paint="{
        'circle-radius': 6,
        'circle-color': '#2176d2',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      }"
    />
  </PhilaMap>
</template>

<script setup lang="ts">
import { ref, computed, watch, toRaw } from 'vue'
import {
  Map as PhilaMap,
  MapSearchControl,
  MapNavigationControl,
  GeolocationButton,
  BasemapToggle,
  FillLayer,
  CircleLayer,
  DrawTool,
  fetchParcelGeometry,
} from '@phila/phila-ui-map-core'
import type { AisGeocodeResult } from '@phila/phila-ui-map-core'
import { useSearchStore } from '../stores/searchStore'
import { usePropertyStore } from '../stores/propertyStore'
import { useUiStore } from '../stores/uiStore'
import { useRouter } from 'vue-router'

const search = useSearchStore()
const property = usePropertyStore()
const ui = useUiStore()
const router = useRouter()

const parcelGeojson = ref<any>(null)
const markerGeojson = ref<any>(null)

const parcelSource = computed(() => ({
  type: 'geojson' as const,
  data: JSON.parse(JSON.stringify(toRaw(parcelGeojson.value))),
}))

const markerSource = computed(() => ({
  type: 'geojson' as const,
  data: JSON.parse(JSON.stringify(toRaw(markerGeojson.value))),
}))

async function handleSearchResult(result: AisGeocodeResult) {
  const address = result.properties.street_address
  await search.doAddressSearch(address)
  if (search.searchStatus === 'success' && search.searchResults.length > 0) {
    const opaNumbers = search.searchResults.map(r => r.opaNumber)
    await property.fetchProperties(opaNumbers)
    ui.selectProperty(search.searchResults[0].opaNumber)
    router.push({ query: { p: search.searchResults[0].opaNumber } })
    await updateMapFeatures()
  }
}

function handleSearchError(error: string) {
  console.error('Search error:', error)
}

async function handleShapeDraw(geojson: any) {
  await search.doShapeSearch(geojson)
  if (search.searchStatus === 'success') {
    const opaNumbers = search.searchResults.map(r => r.opaNumber)
    if (opaNumbers.length <= 200) {
      await property.fetchProperties(opaNumbers)
    }
    router.push({ query: { shape: JSON.stringify(geojson) } })
  }
}

async function updateMapFeatures() {
  if (search.searchResults.length === 0) {
    parcelGeojson.value = null
    markerGeojson.value = null
    return
  }

  markerGeojson.value = {
    type: 'FeatureCollection',
    features: search.searchResults.map(r => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [r.lng, r.lat] },
      properties: { opaNumber: r.opaNumber, address: r.address },
    })),
  }

  const firstResult = search.searchResults[0]
  if (firstResult.pwdParcelId) {
    try {
      parcelGeojson.value = await fetchParcelGeometry(firstResult.pwdParcelId)
    } catch (e) {
      console.error('Failed to fetch parcel geometry:', e)
    }
  }
}

watch(() => search.searchResults, updateMapFeatures)
</script>
