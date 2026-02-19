<template>
  <div class="data-panel-toolbar">
    <div class="toolbar-left">
      <span class="result-count">{{ resultCount }} results</span>
      <button
        v-if="showCondoExpand"
        class="condo-expand-btn"
        @click="$emit('expand-condos')"
      >
        Show condo units
      </button>
    </div>
    <div class="toolbar-right">
      <button class="toolbar-btn" @click="$emit('export-csv')">
        Export CSV
      </button>
      <button class="toolbar-btn" @click="$emit('toggle-expand')">
        {{ expanded ? 'Collapse' : 'Expand' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  resultCount: number
  showCondoExpand: boolean
  expanded: boolean
}>()

defineEmits<{
  'expand-condos': []
  'export-csv': []
  'toggle-expand': []
}>()
</script>

<style scoped>
.data-panel-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-m);
  border-bottom: 1px solid var(--Schemes-Outline);
  background: var(--Schemes-Surface-Container-Low);
  font-family: 'Montserrat', sans-serif;
  font-size: 0.875rem;
}
.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}
.result-count {
  font-weight: 700;
}
.toolbar-btn,
.condo-expand-btn {
  padding: var(--spacing-2xs) var(--spacing-s);
  border: 1px solid var(--Schemes-Outline);
  border-radius: var(--border-radius-s);
  background: var(--Schemes-Background);
  cursor: pointer;
  font-size: 0.8125rem;
  font-family: 'Montserrat', sans-serif;
}
.toolbar-btn:hover,
.condo-expand-btn:hover {
  background: var(--Schemes-Surface-Container);
}
</style>
