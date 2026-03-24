<template>
  <div class="property-card" v-if="property.activeProperty">
    <a class="back-to-results" href="#" @click.prevent="ui.clearSelection()">Back to results</a>

    <div v-if="property.activeProperty.status === 'loading'" class="loading-state">
      Loading property data...
    </div>

    <template v-else-if="property.activeProperty.publicData">
      <OwnerAddressTable
        :data="property.activeProperty.publicData"
        :address="selectedAddress"
        :ais-properties="selectedAisProperties"
      />

      <div class="card-section">
        <h3>Current Assessment</h3>
        <table>
          <tr>
            <th>Market Value</th>
            <td>{{ formatCurrency(property.activeProperty.publicData.market_value) }}</td>
          </tr>
          <tr>
            <th>Sale Date</th>
            <td>{{ formatDate(property.activeProperty.publicData.sale_date) }}</td>
          </tr>
          <tr>
            <th>Sale Price</th>
            <td>{{ formatCurrency(property.activeProperty.publicData.sale_price) }}</td>
          </tr>
        </table>
      </div>

      <ValuationHistory
        :history="property.activeProperty.assessmentHistory"
        :loading="property.activeProperty.assessmentHistory.length === 0"
      />

      <SalesHistory
        :history="property.activeProperty.salesHistory"
        :loading="property.activeProperty.salesHistory.length === 0"
      />

      <PropertyDetails :data="property.activeProperty.publicData" />

      <div class="external-links">
        <h3>Related Resources</h3>
        <ul>
          <li>
            <a :href="'https://property.phila.gov/?' + ui.activeOpaNumber" target="_blank" rel="noopener">
              Property Inquiry
            </a>
          </li>
          <li>
            <a :href="'https://atlas.phila.gov/' + encodeURIComponent(selectedAddress)" target="_blank" rel="noopener">
              Atlas
            </a>
          </li>
        </ul>
      </div>
    </template>

    <div v-else class="no-data-state">
      No property data found for {{ ui.activeOpaNumber }}.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useSearchStore } from '../stores/searchStore'
import { usePropertyStore } from '../stores/propertyStore'
import { useUiStore } from '../stores/uiStore'
import { formatCurrency, formatDate } from '../composables/useFormatters'
import OwnerAddressTable from './property/OwnerAddressTable.vue'
import ValuationHistory from './property/ValuationHistory.vue'
import SalesHistory from './property/SalesHistory.vue'
import PropertyDetails from './property/PropertyDetails.vue'

const search = useSearchStore()
const property = usePropertyStore()
const ui = useUiStore()

const selectedResult = computed(() => {
  return search.searchResults.find(r => r.opaNumber === ui.activeOpaNumber) || null
})

const selectedAddress = computed(() => {
  if (selectedResult.value) return selectedResult.value.address
  const pub = property.activeProperty?.publicData
  return pub?.location || pub?.address_std || ''
})

const selectedAisProperties = computed(() => {
  return selectedResult.value?.aisProperties || null
})

watch(() => ui.activeOpaNumber, (opaNumber) => {
  if (opaNumber) {
    property.fetchHistory(opaNumber)
  }
}, { immediate: true })
</script>

<style scoped>
.property-card {
  position: relative;
  font-size: 0.9375rem;
}
.back-to-results {
  display: block;
  text-align: right;
  margin-bottom: var(--spacing-xs);
  font-size: 0.875rem;
  color: var(--colors-Dark-Ben-Franklin-Blue);
  text-decoration: none;
}
.back-to-results:hover {
  text-decoration: underline;
}
.loading-state,
.no-data-state {
  padding: var(--spacing-m) 0;
  color: var(--Schemes-On-Surface-Variant);
}
.card-section {
  margin: var(--spacing-l) 0;
}
.card-section h3 {
  margin-bottom: var(--spacing-s);
  font-size: 1rem;
}
.card-section table {
  width: 100%;
  border-collapse: collapse;
}
.card-section th, .card-section td {
  padding: var(--spacing-xs) var(--spacing-s);
  text-align: left;
  border-bottom: 1px solid var(--Schemes-Outline);
  font-size: 0.875rem;
  line-height: 1.4;
}
.card-section th {
  font-weight: 600;
  width: 40%;
  color: var(--Schemes-On-Surface-Variant);
}
.external-links {
  margin: var(--spacing-l) 0;
}
.external-links h3 {
  margin-bottom: var(--spacing-s);
  font-size: 1rem;
}
.external-links ul {
  list-style: none;
  padding: 0;
}
.external-links li {
  padding: var(--spacing-xs) 0;
}
</style>
