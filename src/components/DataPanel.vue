<template>
  <div class="data-panel">
    <DataPanelToolbar
      :result-count="search.searchResults.length"
      @mailing-labels="handleMailingLabels"
      @export-csv="handleExportCsv"
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
    const isBuilding = result.condoUnitCount > 0

    // Condo building rows: no assessment data, show unit count as owner
    if (isBuilding) {
      const unitLabel = `Condominium (${result.condoUnitCount} Units)`
      return {
        opaNumber: result.opaNumber,
        address: result.address,
        isUnit: result.isUnit,
        isBuilding: true,
        hasCondoUnits: result.hasCondoUnits,
        marketValue: '',
        saleDate: '',
        salePrice: '',
        owner: unitLabel,
      }
    }

    return {
      opaNumber: result.opaNumber,
      address: result.address,
      isUnit: result.isUnit,
      isBuilding: false,
      hasCondoUnits: false,
      marketValue: prop?.assessment
        ? formatCurrency(prop.assessment.market_value)
        : '...',
      saleDate: prop?.assessment
        ? formatDate(prop.assessment.sale_date)
        : '...',
      salePrice: prop?.assessment
        ? formatCurrency(prop.assessment.sale_price)
        : '...',
      owner: prop?.publicData?.owner_1
        ? [prop.publicData.owner_1, prop.publicData.owner_2].filter(Boolean).join(', ')
        : '...',
    }
  })
})

function handleRowSelect(opaNumber: string) {
  // Condo building rows have no property data — ignore clicks
  if (opaNumber.startsWith('bldg-')) return

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

function handleMailingLabels() {
  // TODO: implement mailing labels
}

function handleExportCsv() {
  exportToCsv(search.searchResults, property.properties)
}
</script>
