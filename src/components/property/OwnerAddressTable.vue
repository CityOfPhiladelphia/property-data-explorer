<template>
  <div class="owner-address">
    <h2>{{ address }}</h2>
    <p class="zip-line">PHILADELPHIA, PA {{ formattedZip }}</p>
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
import type { OpaPublic } from '../../types'

const props = defineProps<{ data: OpaPublic; address: string }>()

const ownerDisplay = computed(() => {
  if (Array.isArray(props.data.opa_owners)) {
    return props.data.opa_owners.join(', ')
  }
  return String(props.data.opa_owners || 'N/A')
})

const formattedZip = computed(() => {
  const zip = props.data.zip_code || ''
  return zip.substring(0, 5)
})
</script>

<style scoped>
.owner-address h2 {
  margin-bottom: var(--spacing-xs);
}
.zip-line {
  color: var(--Schemes-On-Surface-Variant);
  margin-bottom: var(--spacing-m);
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
</style>
