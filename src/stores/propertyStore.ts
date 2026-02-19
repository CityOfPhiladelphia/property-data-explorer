import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  PropertyRecord,
  OpaAssessment,
  OpaPublic,
  AssessmentHistoryRecord,
  SalesHistoryRecord,
} from '../types'
import { cartoQuery, buildInClause } from '../composables/useCartoQuery'
import { useUiStore } from './uiStore'

const MAX_BATCH_SIZE = 200

export const usePropertyStore = defineStore('property', () => {
  const properties = ref<Map<string, PropertyRecord>>(new Map())

  const activeProperty = computed(() => {
    const ui = useUiStore()
    if (!ui.activeOpaNumber) return null
    return properties.value.get(ui.activeOpaNumber) ?? null
  })

  async function fetchProperties(opaNumbers: string[]) {
    if (opaNumbers.length === 0) return

    // Skip already-loaded properties
    const toFetch = opaNumbers.filter(opa => {
      const existing = properties.value.get(opa)
      return !existing || existing.status === 'error'
    })
    if (toFetch.length === 0) return

    // Mark as loading
    for (const opa of toFetch) {
      properties.value.set(opa, {
        assessment: null,
        publicData: null,
        assessmentHistory: [],
        salesHistory: [],
        status: 'loading',
      })
    }

    // Batch into chunks to stay within Carto query limits
    for (let i = 0; i < toFetch.length; i += MAX_BATCH_SIZE) {
      const batch = toFetch.slice(i, i + MAX_BATCH_SIZE)
      const inClause = buildInClause(batch)

      try {
        const [assessmentRows, publicRows] = await Promise.all([
          cartoQuery<OpaAssessment>(
            `SELECT parcel_number, market_value, sale_date, sale_price FROM opa_properties_public_pde WHERE parcel_number IN (${inClause})`
          ),
          cartoQuery<OpaPublic>(
            `SELECT * FROM opa_properties_public_pde WHERE parcel_number IN (${inClause})`
          ),
        ])

        const assessmentMap = new Map(assessmentRows.map(r => [r.parcel_number, r]))
        const publicMap = new Map(publicRows.map(r => [r.parcel_number, r]))

        for (const opa of batch) {
          const existing = properties.value.get(opa)!
          existing.assessment = assessmentMap.get(opa) ?? null
          existing.publicData = publicMap.get(opa) ?? null
          existing.status = 'success'
        }
      } catch (e) {
        for (const opa of batch) {
          const existing = properties.value.get(opa)!
          existing.status = 'error'
        }
      }
    }
  }

  async function fetchHistory(opaNumber: string) {
    const record = properties.value.get(opaNumber)
    if (!record) return
    if (record.assessmentHistory.length > 0 || record.salesHistory.length > 0) return

    const escaped = opaNumber.replace(/'/g, "''")

    try {
      const [assessmentHistory, salesHistory] = await Promise.all([
        cartoQuery<AssessmentHistoryRecord>(
          `SELECT * FROM assessments WHERE parcel_number = '${escaped}'`
        ),
        cartoQuery<SalesHistoryRecord>(
          `SELECT * FROM RTT_SUMMARY WHERE opa_account_num = '${escaped}' AND document_type = 'DEED'`
        ),
      ])

      record.assessmentHistory = assessmentHistory
      record.salesHistory = salesHistory
    } catch (e) {
      console.error(`Failed to fetch history for ${opaNumber}:`, e)
    }
  }

  function clear() {
    properties.value = new Map()
  }

  return {
    properties,
    activeProperty,
    fetchProperties,
    fetchHistory,
    clear,
  }
})
