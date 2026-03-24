<template>
  <div class="owner-address">
    <div class="address-banner">
      <div class="address-banner-left">
        <svg class="pin-icon" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
        </svg>
        <div>
          <h2>{{ address }}</h2>
          <span v-if="data.condo" class="condo-badge">Condo</span>
          <p class="zip-line">PHILADELPHIA, PA {{ formattedZip }}</p>
        </div>
      </div>
      <button class="print-btn" @click="handlePrint" title="Print">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
        </svg>
        PRINT
      </button>
    </div>
    <table>
      <tbody>
        <tr>
          <th>OPA Account #</th>
          <td>{{ data.parcel_number }}</td>
        </tr>
        <tr>
          <th>Owner</th>
          <td>{{ ownerDisplay }}</td>
        </tr>
        <tr v-if="data.mailing_street">
          <th>Mailing Address</th>
          <td>
            {{ data.mailing_street }}<br>
            {{ data.mailing_city_state }} {{ data.mailing_zip }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { OpaPublic, AisProperties } from '../../types'

const props = defineProps<{ data: OpaPublic; address: string; aisProperties: AisProperties | null }>()

const ownerDisplay = computed(() => {
  return [props.data.owner_1, props.data.owner_2].filter(Boolean).join(', ') || 'N/A'
})

const formattedZip = computed(() => {
  if (props.aisProperties?.zip_code) {
    const zip5 = props.aisProperties.zip_code
    const zip4 = props.aisProperties.zip_4
    return zip4 ? `${zip5}-${zip4}` : zip5
  }
  return props.data.zip_code || ''
})

function handlePrint() {
  window.print()
}
</script>

<style scoped>
.address-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--Palettes-Tertiary-Tertiary-750);
  padding: var(--spacing-m) var(--spacing-xl);
  margin: 0 calc(-1 * var(--spacing-xl)) var(--spacing-m);
}
.address-banner-left {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-s);
}
.pin-icon {
  flex-shrink: 0;
  margin-top: 2px;
}
.owner-address h2 {
  margin: 0 0 var(--spacing-xs);
}
.zip-line {
  color: var(--Schemes-On-Surface-Variant);
  margin: 0;
}
.print-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 2px solid currentColor;
  background: transparent;
  font-weight: 600;
  font-size: 0.8125rem;
  cursor: pointer;
  white-space: nowrap;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  padding: var(--spacing-xs) var(--spacing-s);
  text-align: left;
  border-bottom: 1px solid var(--Schemes-Outline);
}
th {
  font-weight: 600;
  width: 40%;
}
.condo-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--Schemes-Primary-Container);
  color: var(--Schemes-On-Primary-Container);
  border-radius: 4px;
  margin-bottom: var(--spacing-s);
}
</style>
