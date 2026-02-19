<template>
  <div class="data-panel">
    <DataPanelToolbar
      :result-count="search.searchResults.length"
      :expanded="ui.dataPanelExpanded"
      @export-csv="handleExportCsv"
      @toggle-expand="ui.dataPanelExpanded = !ui.dataPanelExpanded"
    />
    <ResultsTable
      :rows="tableRows"
      @select="handleRowSelect"
      @expand-condos="handleExpandCondos"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSearchStore } from '../stores/searchStore'
import { usePropertyStore } from '../stores/propertyStore'
import { useUiStore } from '../stores/uiStore'
import { useRouter } from 'vue-router'
import { formatCurrency, formatDate } from '../composables/useFormatters'
import { exportToCsv } from '../composables/useCsvExport'
import DataPanelToolbar from './DataPanelToolbar.vue'
import ResultsTable from './ResultsTable.vue'

const search = useSearchStore()
const property = usePropertyStore()
const ui = useUiStore()
const router = useRouter()

const tableRows = computed(() => {
  return search.searchResults.map(result => {
    const prop = property.properties.get(result.opaNumber)
    return {
      opaNumber: result.opaNumber,
      address: result.address,
      hasCondoUnits: result.hasCondoUnits,
      marketValue: prop?.assessment
        ? formatCurrency(prop.assessment.market_value)
        : '...',
      saleDate: prop?.assessment
        ? formatDate(prop.assessment.sale_date)
        : '...',
      salePrice: prop?.assessment
        ? formatCurrency(prop.assessment.sale_price)
        : '...',
      owner: prop?.publicData?.opa_owners
        ? Array.isArray(prop.publicData.opa_owners)
          ? prop.publicData.opa_owners.join(', ')
          : String(prop.publicData.opa_owners)
        : '...',
    }
  })
})

function handleRowSelect(opaNumber: string) {
  ui.selectProperty(opaNumber)
  property.fetchHistory(opaNumber)
  router.push({ query: { p: opaNumber } })
}

async function handleExpandCondos(opaNumber: string) {
  const newOpas = await search.expandCondoUnits(opaNumber)
  if (newOpas.length > 0) {
    await property.fetchProperties(newOpas)
  }
}

function handleExportCsv() {
  exportToCsv(search.searchResults, property.properties)
}
</script>
