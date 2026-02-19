<template>
  <div class="left-panel-content">
    <div v-if="!ui.activeOpaNumber">
      <IntroContent />
    </div>
    <div v-else>
      <PropertyCard />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '../stores/uiStore'
import IntroContent from './IntroContent.vue'
import PropertyCard from './PropertyCard.vue'

const ui = useUiStore()
</script>

<style scoped>
.left-panel-content {
  padding: var(--spacing-l) var(--spacing-xl);
}
@media (max-width: 1023px) {
  .left-panel-content {
    padding: var(--spacing-m);
  }
}
</style>
