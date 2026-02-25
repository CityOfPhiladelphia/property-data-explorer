<template>
  <PhilaMap
    :center="[-75.1635, 39.9526]"
    :zoom="12"
    :enable-cyclomedia="true"
    :cyclomedia-config="cyclomediaConfig"
    @click="handleMapClick"
  >
    <MapSearchControl
      position="top-left"
      :geocode="false"
      @search="handleSearch"
    />
    <BasemapToggle position="top-right" />
    <DrawTool position="top-left" @draw="handleShapeDraw" />
    <MapNavigationControl position="bottom-left" />
    <GeolocationButton position="bottom-left" />
    <MapLoadingOverlay
      :visible="search.searchStatus === 'loading'"
      text="Finding address..."
    />

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
  MapLoadingOverlay,
  fetchParcelGeometry,
  queryParcelAtPoint,
} from '@phila/phila-ui-map-core'
import type { CyclomediaConfig } from '@phila/phila-ui-map-core'
import { useSearchStore } from '../stores/searchStore'
import { usePropertyStore } from '../stores/propertyStore'
import { useUiStore } from '../stores/uiStore'
import { useRouter } from 'vue-router'

const search = useSearchStore()
const property = usePropertyStore()
const ui = useUiStore()
const router = useRouter()

const cyclomediaConfig: CyclomediaConfig = {
  username: import.meta.env.VITE_CYCLOMEDIA_USERNAME || '',
  password: import.meta.env.VITE_CYCLOMEDIA_PASSWORD || '',
  apiKey: import.meta.env.VITE_CYCLOMEDIA_API_KEY || '',
  srs: 'EPSG:4326',
  locale: 'en-US',
}

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

const BLOCK_PREFIXES = ['block:', 'block ', 'blk ']

function isBlockSearch(query: string): boolean {
  const lower = query.trim().toLowerCase()
  return BLOCK_PREFIXES.some(prefix => lower.startsWith(prefix))
}

async function handleSearch(query: string) {
  if (!query) return

  const isBlock = isBlockSearch(query)

  if (isBlock) {
    await search.doBlockSearch(query)
  } else {
    await search.doAddressSearch(query)
  }

  if (search.searchStatus === 'success' && search.searchResults.length > 0) {
    const opaNumbers = search.searchResults.map(r => r.opaNumber)
    const fetchPromise = property.fetchProperties(opaNumbers)

    if (isBlock) {
      router.push({ query: { block: query } })
    } else {
      const firstResult = search.searchResults[0]
      if (!firstResult.hasCondoUnits) {
        ui.selectProperty(firstResult.opaNumber)
      }
      router.push({ query: { p: firstResult.opaNumber } })
    }

    await fetchPromise
    await updateMapFeatures()
  }
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

async function handleMapClick(e: { lngLat: { lng: number; lat: number } }) {
  const { lng, lat } = e.lngLat
  const result = await queryParcelAtPoint(lng, lat)
  if (result?.address) {
    await search.doAddressSearch(result.address)
    if (search.searchStatus === 'success' && search.searchResults.length > 0) {
      const opaNumbers = search.searchResults.map(r => r.opaNumber)
      const fetchPromise = property.fetchProperties(opaNumbers)
      const firstResult = search.searchResults[0]
      if (!firstResult.hasCondoUnits) {
        ui.selectProperty(firstResult.opaNumber)
      }
      router.push({ query: { p: firstResult.opaNumber } })
      await fetchPromise
      await updateMapFeatures()
    }
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
