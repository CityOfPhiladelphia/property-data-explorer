import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const LARGE_BREAKPOINT = 750

export const useUiStore = defineStore('ui', () => {
  const activeOpaNumber = ref<string | null>(null)
  const hoveredOpaNumber = ref<string | null>(null)
  const hoverSource = ref<'table' | 'map' | null>(null)
  const leftPanelOpen = ref(false)
  const dataPanelExpanded = ref(false)
  const fullScreen = ref(false)
  const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200)

  const isLarge = computed(() => windowWidth.value >= LARGE_BREAKPOINT)

  function selectProperty(opaNumber: string) {
    activeOpaNumber.value = opaNumber
    leftPanelOpen.value = true
  }

  function clearSelection() {
    activeOpaNumber.value = null
    leftPanelOpen.value = false
  }

  function initResizeListener() {
    window.addEventListener('resize', () => {
      windowWidth.value = window.innerWidth
    })
  }

  return {
    activeOpaNumber,
    hoveredOpaNumber,
    hoverSource,
    leftPanelOpen,
    dataPanelExpanded,
    fullScreen,
    isLarge,
    selectProperty,
    clearSelection,
    initResizeListener,
  }
})
