<template>
  <div class="valuation-history">
    <h3>Valuation History</h3>
    <table v-if="history.length > 0">
      <thead>
        <tr>
          <th>Year</th>
          <th>Market Value</th>
          <th>Taxable Land</th>
          <th>Taxable Improvement</th>
          <th>Exempt Land</th>
          <th>Exempt Improvement</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in sortedHistory" :key="row.year">
          <td>{{ row.year }}</td>
          <td>{{ formatCurrency(row.market_value) }}</td>
          <td>{{ formatCurrency(row.taxable_land) }}</td>
          <td>{{ formatCurrency(row.taxable_building) }}</td>
          <td>{{ formatCurrency(row.exempt_land) }}</td>
          <td>{{ formatCurrency(row.exempt_building) }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else-if="loading">Loading...</p>
    <p v-else>No valuation history available.</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AssessmentHistoryRecord } from '../../types'
import { formatCurrency } from '../../composables/useFormatters'

const props = defineProps<{
  history: AssessmentHistoryRecord[]
  loading: boolean
}>()

const sortedHistory = computed(() =>
  [...props.history].sort((a, b) => b.year - a.year)
)
</script>

<style scoped>
h3 {
  margin: var(--spacing-m) 0 var(--spacing-s);
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
th, td {
  padding: var(--spacing-xs) var(--spacing-s);
  text-align: left;
  border-bottom: 1px solid var(--Schemes-Outline);
}
th {
  font-weight: 600;
}
</style>
