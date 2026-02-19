<template>
  <div class="sales-history">
    <h3>Sales History</h3>
    <table v-if="history.length > 0">
      <thead>
        <tr>
          <th>Date</th>
          <th>Price</th>
          <th>Grantors</th>
          <th>Grantees</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in sortedHistory" :key="row.document_id">
          <td>{{ formatDate(row.document_date) }}</td>
          <td>{{ formatCurrency(row.adjusted_total_consideration) }}</td>
          <td>{{ row.grantors }}</td>
          <td>{{ row.grantees }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else-if="loading">Loading...</p>
    <p v-else>No sales history available.</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SalesHistoryRecord } from '../../types'
import { formatCurrency, formatDate } from '../../composables/useFormatters'

const props = defineProps<{
  history: SalesHistoryRecord[]
  loading: boolean
}>()

const sortedHistory = computed(() =>
  [...props.history].sort((a, b) =>
    (b.document_date || '').localeCompare(a.document_date || '')
  )
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
