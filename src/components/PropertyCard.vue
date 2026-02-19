<template>
  <div class="property-card" v-if="property.activeProperty">
    <button class="close-button" @click="ui.clearSelection()">&times;</button>

    <div v-if="property.activeProperty.status === 'loading'" class="loading-state">
      Loading property data...
    </div>

    <template v-else-if="property.activeProperty.publicData">
      <OwnerAddressTable
        :data="property.activeProperty.publicData"
        :address="selectedAddress"
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
    </template>

    <div v-else class="no-data-state">
      No property data found for {{ ui.activeOpaNumber }}.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { usePropertyStore } from '../stores/propertyStore'
import { useUiStore } from '../stores/uiStore'
import { formatCurrency, formatDate } from '../composables/useFormatters'
import OwnerAddressTable from './property/OwnerAddressTable.vue'
import ValuationHistory from './property/ValuationHistory.vue'
import SalesHistory from './property/SalesHistory.vue'
import PropertyDetails from './property/PropertyDetails.vue'

const property = usePropertyStore()
const ui = useUiStore()

const selectedAddress = computed(() => {
  const pub = property.activeProperty?.publicData
  return pub?.street_address || pub?.opa_address || ''
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
}
.close-button {
  position: absolute;
  top: var(--spacing-xs);
  right: var(--spacing-xs);
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: var(--spacing-xs);
  line-height: 1;
}
.loading-state,
.no-data-state {
  padding: var(--spacing-m);
}
.card-section {
  margin: var(--spacing-m) 0;
}
.card-section h3 {
  margin-bottom: var(--spacing-s);
}
.card-section table {
  width: 100%;
  border-collapse: collapse;
}
.card-section th, .card-section td {
  padding: var(--spacing-xs) var(--spacing-s);
  text-align: left;
  border-bottom: 1px solid var(--Schemes-Outline);
}
.card-section th {
  font-weight: 600;
  width: 40%;
}
</style>
