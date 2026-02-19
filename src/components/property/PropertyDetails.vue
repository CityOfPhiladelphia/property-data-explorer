<template>
  <div class="property-details">
    <h3>Property Details</h3>
    <table>
      <tbody>
        <tr>
          <th>Description</th>
          <td>{{ data.building_code_description_new || data.building_code_description || 'N/A' }}</td>
        </tr>
        <tr>
          <th>Condition</th>
          <td>{{ conditionLabels[String(data.interior_condition)] || 'N/A' }}</td>
        </tr>
        <tr>
          <th>Year Built</th>
          <td>{{ formatYearBuilt(data.year_built, data.year_built_estimate) }}</td>
        </tr>
        <tr>
          <th>Building Area</th>
          <td>{{ data.total_livable_area ? data.total_livable_area.toLocaleString() + ' sq ft' : 'N/A' }}</td>
        </tr>
        <tr>
          <th>Land Area</th>
          <td>{{ data.total_area ? data.total_area.toLocaleString() + ' sq ft' : 'N/A' }}</td>
        </tr>
        <tr>
          <th>Stories</th>
          <td>{{ formatStories(data.number_stories, data.total_livable_area) }}</td>
        </tr>
        <tr>
          <th>Rooms / Beds / Baths</th>
          <td>{{ data.number_of_rooms || 0 }} / {{ data.number_of_bedrooms || 0 }} / {{ data.number_of_bathrooms || 0 }}</td>
        </tr>
        <tr>
          <th>Basement</th>
          <td>{{ basementLabels[data.basements || ''] || 'N/A' }}</td>
        </tr>
        <tr v-if="data.fireplaces">
          <th>Fireplaces</th>
          <td>{{ data.fireplaces }}</td>
        </tr>
        <tr>
          <th>Garage</th>
          <td>{{ garageLabels[data.garage_type || ''] || 'None' }}{{ data.garage_spaces ? ' (' + data.garage_spaces + ' spaces)' : '' }}</td>
        </tr>
        <tr>
          <th>Heating</th>
          <td>{{ heaterLabels[data.type_heater || ''] || 'N/A' }}</td>
        </tr>
        <tr>
          <th>Fuel</th>
          <td>{{ fuelLabels[data.fuel || ''] || 'N/A' }}</td>
        </tr>
        <tr>
          <th>Central Air</th>
          <td>{{ data.central_air === 'Y' ? 'Yes' : 'No' }}</td>
        </tr>
        <tr>
          <th>Sewer</th>
          <td>{{ data.sewer === 'Y' ? 'Yes' : 'No' }}</td>
        </tr>
        <tr>
          <th>Frontage</th>
          <td>{{ data.frontage ? data.frontage + ' ft' : 'N/A' }}</td>
        </tr>
        <tr>
          <th>Zoning</th>
          <td>{{ data.zoning || 'N/A' }}</td>
        </tr>
        <tr>
          <th>Homestead</th>
          <td>{{ data.homestead_exemption ? formatCurrency(data.homestead_exemption) : 'None' }}</td>
        </tr>
        <tr><th colspan="2" class="section-header">Location</th></tr>
        <tr>
          <th>Ward / Division</th>
          <td>{{ data.political_ward || 'N/A' }} / {{ data.political_district || 'N/A' }}</td>
        </tr>
        <tr>
          <th>Council District</th>
          <td>{{ data.council_district_2024 || 'N/A' }}</td>
        </tr>
        <tr>
          <th>Police District</th>
          <td>{{ data.police_district || 'N/A' }}</td>
        </tr>
        <tr>
          <th>Census Tract</th>
          <td>{{ data.census_tract || 'N/A' }}</td>
        </tr>
        <tr>
          <th>L&amp;I District</th>
          <td>{{ data.li_district || 'N/A' }}</td>
        </tr>
        <tr><th colspan="2" class="section-header">Schools</th></tr>
        <tr>
          <th>Elementary</th>
          <td>{{ data.elementary_school || 'N/A' }}</td>
        </tr>
        <tr>
          <th>Middle</th>
          <td>{{ data.middle_school || 'N/A' }}</td>
        </tr>
        <tr>
          <th>High</th>
          <td>{{ data.high_school || 'N/A' }}</td>
        </tr>
        <tr v-if="trashDay"><th colspan="2" class="section-header">Services</th></tr>
        <tr v-if="trashDay">
          <th>Trash Day</th>
          <td>{{ trashDay }}</td>
        </tr>
        <tr v-if="recyclingDay">
          <th>Recycling Day</th>
          <td>{{ recyclingDay }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { OpaPublic } from '../../types'
import { formatCurrency } from '../../composables/useFormatters'
import {
  conditionLabels,
  basementLabels,
  garageLabels,
  fuelLabels,
  heaterLabels,
  trashDayLabels,
  formatStories,
  formatYearBuilt,
} from '../../composables/usePropertyLabels'

const props = defineProps<{ data: OpaPublic }>()

const trashDay = computed(() =>
  props.data.rubbish_recycle_day
    ? trashDayLabels[props.data.rubbish_recycle_day] || props.data.rubbish_recycle_day
    : null
)

const recyclingDay = computed(() =>
  props.data.secondary_rubbish_day
    ? trashDayLabels[props.data.secondary_rubbish_day] || props.data.secondary_rubbish_day
    : null
)
</script>

<style scoped>
h3 {
  margin: var(--spacing-m) 0 var(--spacing-s);
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
.section-header {
  background: var(--Schemes-Surface-Container);
  padding: var(--spacing-s);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
