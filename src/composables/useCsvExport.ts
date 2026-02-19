import type { SearchResult, PropertyRecord } from '../types'
import { formatCurrency, formatDate } from './useFormatters'
import {
  conditionLabels,
  formatStories,
  formatYearBuilt,
} from './usePropertyLabels'

const CSV_HEADERS = [
  'Street Address',
  'Market Value',
  'Sale Date',
  'Sale Price',
  'Owner',
  'OPA Account Number',
  'Zip Code',
  'Building Description',
  'Building Condition',
  'Year Built',
  'Building Area',
  'Land Area',
  'Stories',
  'Rooms',
  'Bedrooms',
  'Bathrooms',
  'Homestead Exemption',
  'Zoning',
  'Ward',
  'Ward Division',
  'Council District',
  'Elementary School',
  'Middle School',
  'High School',
  'Police District',
]

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function exportToCsv(
  results: SearchResult[],
  properties: Map<string, PropertyRecord>,
) {
  const rows = results.map(result => {
    const prop = properties.get(result.opaNumber)
    const pub = prop?.publicData
    const assess = prop?.assessment

    return [
      result.address,
      assess ? formatCurrency(assess.market_value) : '',
      assess ? formatDate(assess.sale_date) : '',
      assess ? formatCurrency(assess.sale_price) : '',
      pub?.opa_owners
        ? Array.isArray(pub.opa_owners) ? pub.opa_owners.join(', ') : String(pub.opa_owners)
        : '',
      result.opaNumber,
      pub?.zip_code || '',
      pub?.building_code_description_new || pub?.building_code_description || '',
      pub ? (conditionLabels[String(pub.interior_condition)] || '') : '',
      pub ? formatYearBuilt(pub.year_built, pub.year_built_estimate) : '',
      pub?.total_livable_area ? String(pub.total_livable_area) : '',
      pub?.total_area ? String(pub.total_area) : '',
      pub ? formatStories(pub.number_stories, pub.total_livable_area) : '',
      pub ? String(pub.number_of_rooms || 0) : '',
      pub ? String(pub.number_of_bedrooms || 0) : '',
      pub ? String(pub.number_of_bathrooms || 0) : '',
      pub?.homestead_exemption ? formatCurrency(pub.homestead_exemption) : '',
      pub?.zoning || '',
      pub?.political_ward || '',
      pub?.political_district || '',
      pub?.council_district_2024 || '',
      pub?.elementary_school || '',
      pub?.middle_school || '',
      pub?.high_school || '',
      pub?.police_district || '',
    ].map(v => escapeCsv(String(v)))
  })

  const csv = [CSV_HEADERS.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'property-data.csv'
  link.click()
  URL.revokeObjectURL(url)
}
