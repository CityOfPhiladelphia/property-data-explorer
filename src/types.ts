export interface OpaAssessment {
  parcel_number: string
  market_value: number
  sale_date: string | null
  sale_price: number
}

export interface OpaPublic {
  parcel_number: string
  street_address: string
  opa_account_num: string
  opa_address: string
  zip_code: string
  opa_owners: string[] | string
  usps_bldgfirm: string | null
  pwd_parcel_id: string
  dor_parcel_id: string
  condo: boolean
  market_value: number
  sale_date: string | null
  sale_price: number
  total_livable_area: number
  total_area: number
  interior_condition: number
  building_code_description_new: string | null
  building_code_description: string | null
  year_built: string
  year_built_estimate: boolean
  number_stories: number
  number_of_rooms: number
  number_of_bedrooms: number
  number_of_bathrooms: number
  basements: string | null
  fireplaces: number
  garage_type: string | null
  garage_spaces: number
  view_type: string | null
  fuel: string | null
  type_heater: string | null
  central_air: string
  sewer: string
  frontage: number
  beginning_point: string
  zoning: string
  homestead_exemption: number
  political_ward: string
  political_district: string
  council_district_2024: string
  elementary_school: string
  middle_school: string
  high_school: string
  police_district: string
  census_tract: string
  li_district: string
  rubbish_recycle_day: string | null
  secondary_rubbish_day: string | null
  owner_1: string | null
  owner_2: string | null
  mailing_care_of: string
  mailing_address_1: string
  mailing_street: string
  mailing_address_2: string
  mailing_city_state: string
  mailing_zip: string
  address_std: string | null
  location: string | null
}

export interface AssessmentHistoryRecord {
  parcel_number: string
  year: number
  market_value: number
  taxable_land: number
  taxable_building: number
  exempt_land: number
  exempt_building: number
}

export interface SalesHistoryRecord {
  document_date: string
  adjusted_total_consideration: number
  grantees: string
  grantors: string
  document_id: string
}

export interface SearchResult {
  address: string
  opaNumber: string
  lng: number
  lat: number
  isUnit: boolean
  pwdParcelId: string | null
}

export interface PropertyRecord {
  assessment: OpaAssessment | null
  publicData: OpaPublic | null
  assessmentHistory: AssessmentHistoryRecord[]
  salesHistory: SalesHistoryRecord[]
  status: 'idle' | 'loading' | 'success' | 'error'
}

export type SearchType = 'address' | 'block' | 'owner' | 'shape'
