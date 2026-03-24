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
          :class="{
            'is-selected': row.opaNumber === ui.activeOpaNumber,
            'is-hovered': row.opaNumber === ui.hoveredOpaNumber,
            'is-unit': row.isUnit,
            'is-building': row.isBuilding,
          }"
          @click="$emit('select', row.opaNumber)"
          @mouseenter="ui.hoveredOpaNumber = row.opaNumber"
          @mouseleave="ui.hoveredOpaNumber = null"
        >
          <td>
            <span v-if="row.isUnit" class="unit-indent"></span>{{ row.address }}
            <button
              v-if="row.hasCondoUnits"
              class="condo-expand-btn"
              @click.stop="$emit('expand-condos', row.opaNumber)"
            >
              + Units
            </button>
          </td>
          <template v-if="row.marketValue === '...'">
            <td colspan="4" class="loading-cell">
              <span class="spinner"></span> Loading data...
            </td>
          </template>
          <template v-else>
            <td>{{ row.marketValue }}</td>
            <td>{{ row.saleDate }}</td>
            <td>{{ row.salePrice }}</td>
            <td>{{ row.owner }}</td>
          </template>
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
    isUnit: boolean
    isBuilding: boolean
    marketValue: string
    saleDate: string
    salePrice: string
    owner: string
    hasCondoUnits: boolean
  }>
}>()

defineEmits<{
  select: [opaNumber: string]
  'expand-condos': [opaNumber: string]
}>()
</script>

<style scoped>
.results-table-container {
  overflow-x: auto;
}
.results-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
  font-family: 'Montserrat', sans-serif;
}
.results-table th,
.results-table td {
  padding: var(--spacing-xs) var(--spacing-s);
  text-align: left;
  white-space: nowrap;
  border-bottom: 1px solid var(--Schemes-Outline);
}
.results-table th {
  font-weight: 700;
  background: #444;
  color: #fff;
  position: sticky;
  top: 0;
  font-size: 0.75rem;
  letter-spacing: 0.03em;
  border-bottom: none;
}
.results-table tbody tr {
  cursor: pointer;
}
.results-table tbody tr:nth-child(even) {
  background: var(--Schemes-Surface-Container-Low);
}
.results-table tbody tr:hover,
.results-table tbody tr.is-hovered {
  background: #fff9c4;
}
.results-table tbody tr.is-selected {
  background: var(--Schemes-Primary-Container);
}
.results-table tbody tr.is-building {
  cursor: default;
}
.results-table tbody tr.is-building:hover {
  background: inherit;
}
.results-table tbody tr.is-unit {
  color: var(--Schemes-On-Surface-Variant);
}
.unit-indent {
  display: inline-block;
  width: 1.5em;
}
.condo-expand-btn {
  margin-left: var(--spacing-s);
  padding: 1px var(--spacing-xs);
  font-size: 0.6875rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  border: 1px solid var(--colors-Dark-Ben-Franklin-Blue);
  border-radius: var(--border-radius-s);
  background: var(--Schemes-Background);
  color: var(--colors-Dark-Ben-Franklin-Blue);
  cursor: pointer;
}
.condo-expand-btn:hover {
  background: var(--colors-Dark-Ben-Franklin-Blue);
  color: #fff;
}
.loading-cell {
  color: var(--Schemes-On-Surface-Variant);
  font-style: italic;
}
.spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid var(--Schemes-Outline);
  border-top-color: var(--colors-Dark-Ben-Franklin-Blue);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  vertical-align: middle;
  margin-right: 6px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
