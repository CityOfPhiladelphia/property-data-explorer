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
  padding: var(--spacing-xs) var(--spacing-s);
  border-bottom: 1px solid var(--Schemes-Outline);
  background: var(--Schemes-Surface);
}
.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.result-count {
  font-weight: 600;
}
.toolbar-btn,
.condo-expand-btn {
  padding: 4px 12px;
  border: 1px solid var(--Schemes-Outline);
  border-radius: 4px;
  background: var(--Schemes-Surface);
  cursor: pointer;
  font-size: 0.875rem;
}
.toolbar-btn:hover,
.condo-expand-btn:hover {
  background: var(--Schemes-Surface-Container);
}
</style>
