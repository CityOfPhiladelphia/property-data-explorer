<template>
  <div class="results-table-container">
    <table class="results-table">
      <thead>
        <tr>
          <th>Address</th>
          <th>Market Value</th>
          <th>Sale Date</th>
          <th>Sale Price</th>
          <th>Owner</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows"
          :key="row.opaNumber"
          :class="{ 'is-selected': row.opaNumber === ui.activeOpaNumber }"
          @click="$emit('select', row.opaNumber)"
        >
          <td>{{ row.address }}</td>
          <td>{{ row.marketValue }}</td>
          <td>{{ row.saleDate }}</td>
          <td>{{ row.salePrice }}</td>
          <td>{{ row.owner }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '../stores/uiStore'

const ui = useUiStore()

defineProps<{
  rows: Array<{
    opaNumber: string
    address: string
    marketValue: string
    saleDate: string
    salePrice: string
    owner: string
  }>
}>()

defineEmits<{
  select: [opaNumber: string]
}>()
</script>

<style scoped>
.results-table-container {
  overflow-x: auto;
}
.results-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
.results-table th,
.results-table td {
  padding: var(--spacing-xs) var(--spacing-s);
  text-align: left;
  white-space: nowrap;
  border-bottom: 1px solid var(--Schemes-Outline);
}
.results-table th {
  font-weight: 600;
  background: var(--Schemes-Surface);
  position: sticky;
  top: 0;
}
.results-table tr {
  cursor: pointer;
}
.results-table tr:hover {
  background: var(--Schemes-Surface-Container);
}
.results-table tr.is-selected {
  background: var(--Schemes-Primary-Container);
}
</style>
