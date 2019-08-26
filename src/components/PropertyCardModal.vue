<template>
  <div :class="['openmaps-about', 'openmaps-modal']"
            v-if="this.$store.state.activeModal.featureId"
  >
    <header class="modal">
      <div class="row expanded">
        <div class="columns">
          <div class="print-logo">
            <img src="https://standards.phila.gov/img/logo/city-of-philadelphia-blue-text.png" alt="City of Philadelphia">
          </div>
          <div class="page-title-container">
            <h1 class="page-title">Property Data Explorer</h1>
          </div>
        </div>
      </div>
    </header>
    <div @click="closeModal" class="openmaps-modal-close hide-print">
      <span class="button-state state-unnamed-state unnamed-state-active">
        <font-awesome-icon icon="times" class="fa-lg" aria-hidden="true" />
      </span>
    </div>
    <div class="openmaps-modal-content">

      <div class="address-header cell small-24 medium-24">
        <div :class="'address-container columns small-24 medium-12 large-12'"
        >

          <div v-if="!this.activeAddress"
               class="default-address-text"
               :style="this.defaultAddressTextPlaceholderStyle"
          >
            {{ this.$config.defaultAddressTextPlaceholder.text }}
          </div>
          <h1 class="address-header-line-1">

            <font-awesome-icon icon="map-marker-alt"/>
            {{ activeAddress }}
          <div class="columns small-24 medium-6 flex-div div-padding-and-margin hide-print">
            <a id="plans-button"
              href="#"
              class="button"
              @click.prevent="print"
            >
              Print
            </a>
            <!-- <p class="p-margin">Print a payment coupon.</p> -->
          </div>
          </h1>
          <div class="address-header-line-2">
            PHILADELPHIA, PA
          </div>
        </div>
      </div>

      <!-- main callout -->
      <callout :slots="this.mainCalloutSlots" />

      <!-- sale vertical table -->
      <div class="spinner-div small-12 cell"
           v-if="!this.$store.state.sources.opa_public.targets[this.activeOpaId].data"
      >
        <font-awesome-icon icon="spinner"
                           class="fa-4x"
                           aria-hidden="true"
        />
        <h3>Loading Sale Data</h3>
      </div>
      <vertical-table :slots="this.saleVerticalTableSlots" />

      <!-- valuation history horizontal table -->
      <div class="spinner-div small-12 cell"
           v-if="!this.$store.state.activeSearch.assessmentHistory.data"
      >
        <font-awesome-icon icon="spinner"
                           class="fa-4x"
                           aria-hidden="true"
        />
        <h3>Loading Valuation History</h3>
      </div>
      <horizontal-table
        v-if="this.$store.state.activeSearch.assessmentHistory.data"
        :slots="{
          title: 'Valuation History',
          items: this.$store.state.activeSearch.assessmentHistory.data
        }"
        :options="this.valuationHistoryHorizontalTableOptions"
      />

      <!-- taxable and exempt land values callout -->
      <callout :slots="this.propValueCalloutSlots" />

      <!-- sales history horizontal table -->
      <div class="spinner-div small-12 cell"
           v-if="!this.$store.state.activeSearch.salesHistory.data"
      >
        <font-awesome-icon icon="spinner"
                           class="fa-4x"
                           aria-hidden="true"
        />
        <h3>Loading Sales History</h3>
      </div>
      <horizontal-table
        v-if="this.$store.state.activeSearch.salesHistory.data"
        :slots="{
          title: 'Sales History',
          items: this.$store.state.activeSearch.salesHistory.data
        }"
        :options="this.salesHistoryHorizontalTableOptions"
      />

      <!-- property details vertical table -->
      <div class="spinner-div small-12 cell"
           v-if="!this.$store.state.sources.opa_public.targets[this.activeOpaId].data"
      >
        <font-awesome-icon icon="spinner"
                           class="fa-4x"
                           aria-hidden="true"
        />
        <h3>Loading Property Details</h3>
      </div>
      <vertical-table :slots="this.propertyDetailsVerticalTableSlots" />

    </div>
  </div>
</template>

<script>
let findConditionCode = function(exterior) {
  const condition = exterior  == 0 ? 'Not Applicable' :
                    exterior  == 2 ? 'Newer Construction / Rehabbed' :
                    exterior  == 3 ? 'Above Average' :
                    exterior  == 4 ? 'Average' :
                    exterior  == 5 ? 'Below Average' :
                    exterior  == 6 ? 'Vacant' :
                    exterior  == 7 ? 'Sealed / Structurally Compromised, Open to the Weather' :
                    'Not available';
  return condition
}

export default {
  name: 'Property-Card-Modal',
  components: {
    Callout: () => import(/* webpackChunkName: "pvc_pcm_Callout" */'@philly/vue-comps/src/components/Callout.vue'),
    TopicComponentGroup: () => import(/* webpackChunkName: "pvc_pcm_TopicComponentGroup" */'@philly/vue-comps/src/components/TopicComponentGroup.vue'),
    BadgeCustom: () => import(/* webpackChunkName: "pvc_pcm_BadgeCustom" */'@philly/vue-comps/src/components/BadgeCustom.vue'),
    HorizontalTable: () => import(/* webpackChunkName: "pvc_pcm_HorizontalTable" */'@philly/vue-comps/src/components/HorizontalTable.vue'),
    VerticalTable: () => import(/* webpackChunkName: "pvc_pcm_VerticalTable" */'@philly/vue-comps/src/components/VerticalTable.vue'),
  },
  computed: {
    lastSearchMethod() {
      return this.$store.state.lastSearchMethod;
    },
    activeModal() {
      return this.$store.state.activeModal;
    },
    activeFeatureId() {
      console.log('PropertyCardModal activeFeatureId computed is running')
      return this.activeModal.featureId;
    },
    activeModalFeature() {
      return this.$store.state.activeModalFeature;
    },
    activeOpaId() {
      let feature = this.activeModalFeature;
      let opaId;
      if (['geocode', 'reverseGeocode', 'owner search'].includes(this.lastSearchMethod)) {
        opaId = feature.properties.opa_account_num;
      } else {
        opaId = feature.parcel_number;
      }
      return opaId;
    },
    activeAddress() {
      let feature = this.activeModalFeature;
      let address;
      if (['geocode', 'reverseGeocode', 'owner search'].includes(this.lastSearchMethod)) {
        address = feature.properties.street_address;
      } else {
        address = feature.address_std;
      }
      return address;
    },

    // zipCode() {
    //   const state = this.$store.state
    //   // let address =  function() {
    //     if (state.geocode.status === "success"){
    //       return titleCase(state.geocode.data.properties.street_address);
    //     } else if (state.lastSearchMethod === "owner search") {
    //       let result = state.ownerSearch.data.filter(object => {
    //         return object._featureId === state.activeModal.featureId
    //       });
    //       return titleCase(result[0].properties.street_address)
    //     } else {
    //       let result = state.shapeSearch.data.rows.filter(object => {
    //         return object._featureId === state.activeModal.featureId
    //       });
    //       return titleCase(result[0].location)
    //     }
    //   // }
    //   // return address;
    // },

    mainCalloutSlots() {
      return {
        text: '\
        Property assessment and sale information for this address. Source: Office of Property Assessments (OPA). OPA was formerly a part of the Bureau of Revision of Taxes (BRT) and some City records may still use that name.\
        ',
      }
    },
    propValueCalloutSlots() {
      return {
        text: '\
        <small> \
        Note: Taxable and exempt land values can represent the contributory value of land in relation to the total market value, or \
        were no structure is present, the value of vacant land. (Consistent with International Association of Assessing Officers (IAAO) standards, \
        the value of an improved parcel is separated into the portion of value attributed to the improvement and the portion of value attributed to the land.)\
        </small> \
        ',
      }
    },
    propertyDetailsVerticalTableSlots() {
      console.log('PropertyCardModal activeFeatureId computed is running')
      let state = this.$store.state;
      let opaPublicData = state.sources.opa_public.targets[this.activeOpaId].data;
      return {
        id: 'propertyDetailsTable',
        dataSources: ['opa_public'],
        title: 'Property Details',
        fields: [
          {
            label: 'OPA Account #',
            value: this.activeOpaId,
          },
          {
            label: 'Homestead Exemption',
            value: function(state) {
              return opaPublicData.homestead_exemption;
            },
            transforms: ['currency'],
          },
          {
            label: 'Building Description',
            value: opaPublicData.building_code_description,
          },
          {
            label: 'Building Condition',
            value: findConditionCode(opaPublicData.exterior_condition),
          },
          {
            label: 'Land Area (SqFt)',
            value: opaPublicData.total_area
              .toLocaleString('en-US', {
                minimumFractionDigits: 0
              })
          },
          {
            label: 'Improvement Area (SqFt)',
            value: opaPublicData.total_livable_area
              .toLocaleString('en-US', {
                minimumFractionDigits: 0
              })
          },
        ],
      }
    },
    saleVerticalTableSlots() {
      let state = this.$store.state;
      let opaAssessmentData = state.sources.opa_assessment.targets[this.activeOpaId].data;
      return {
        id: 'saleTable',
        dataSources: ['opa_public'],
        fields: [
          {
            label: 'Assessed Value',
            value: function(state) {
              return opaAssessmentData.market_value;
            },
            transforms: ['currency'],
          },
          {
            label: 'Sale Date',
            value: function(state) {
              return opaAssessmentData.sale_date;
            },
            transforms: ['date'],
          },
          {
            label: 'Sale Price',
            value: function(state) {
              return opaAssessmentData.sale_price;
            },
            transforms: ['currency'],
          },
        ],
      }
    },

    valuationHistoryHorizontalTableOptions() {
      return {
        id: 'ownerProperties',
        tableid: 'ddd',
        // dataSources: ['opa'],
        mapOverlay: {},
        mouseOverDisabled: true,
        downloadButton: false,
        fields: [
          {
            label: 'Year',
            value: function(state, item){
              return item.year
            }
          },
          {
            label: 'Market Value',
            value: function(state, item){
              return item.market_value
            },
            transforms: ['currency'],
          },
          {
            label: 'Taxable Land',
            value: function(state, item){
              return item.taxable_land
            },
            transforms: ['currency'],
          },
          {
            label: 'Taxable Improvement',
            value: function(state, item){
              return item.taxable_building
            },
            transforms: ['currency'],
          },
          {
            label: 'Exempt Land',
            value: function(state, item){
              return item.exempt_land
            },
            transforms: ['currency'],
          },
          {
            label: 'Exempt Improvement',
            value: function(state, item){
              return item.exempt_building
            },
            transforms: ['currency']
          },
        ],
        sort: {
          // this should return the val to sort on
          getValue: function(item) {
            return item.year;
          },
          // asc or desc
          order: 'desc'
        },
      }
    },

    salesHistoryHorizontalTableOptions() {
      return {
        id: 'salesHistory',
        tableid: 'ddd',
        // dataSources: ['opa'],
        downloadButton: false,
        mapOverlay: {},
        mouseOverDisabled: true,
        fields: [
          {
            label: 'Date',
            value: function(state, item){
              return item.document_date;
            },
            transforms: ['date'],
          },
          {
            label: 'Adjusted Total',
            value: function(state, item){
              return item.adjusted_total_consideration
            },
            transforms: ['currency'],
          },
          {
            label: 'Grantees',
            value: function(state, item){
              return item.grantees
            },
          },
          {
            label: 'Grantors',
            value: function(state, item){
              return item.grantors
            },
          },
          {
            label: 'Document Id',
            value: function(state, item){
              return item.document_id
            },
          },
        ],
        sort: {
          // this should return the val to sort on
          getValue: function(item) {
            return item.document_date;
          },
          // asc or desc
          order: 'desc'
        },
      }
    },
  },
  methods: {
    closeModal(state) {
      this.$store.state.activeModal.featureId = null;
      this.$store.commit('setActiveFeature', null);
      this.$nextTick(() => {
        this.$store.state.map.map.invalidateSize();
      })
    },
    print() {
      window.print()
    },
  },
}
</script>


<style >

@media print {

  * {
    background: none !important;
  }

  a {
    color: #0f4d90 !important;
    font-weight: 300 !important;
  }

  h4 {
    font-weight: 525;
  }

  #components-root, .bottom-half {
    visibility: hidden;
  }

  .address-header[data-v-14c63728] {
    background: #DAEDFC !important;
    -webkit-print-color-adjust: exact;
    color: #0f4d90 !important;
    -webkit-print-color-adjust: exact;
  }

  .external-link svg {
    visibility: hidden;
  }

  .grid-y.medium-grid-frame#application {
    overflow: visible !important;
  }

  .hide-print {
    display: none !important;
    visibility: hidden !important;
  }

  .app-header, .app-footer, #map-panel-container {
    display:none;
  }

  .mb-badge {
    width: 325px !important;
  }

  .mb-badge-header[data-v-7ccdb9d8] {
    font-size: 13pt;
  }

  .openmaps-modal {
    display: inline;
    background: white;
    border-style: none !important;
  }

  .pvc-horizontal-table table tr:nth-child(odd) td {
    background: #eee !important;
    -webkit-print-color-adjust: exact;
  }

  .pvc-horizontal-table-body, .table-container {
    page-break-inside: avoid !important;
  }

  .pvc-download-data-button, .pvc-export-data-button {
    visibility: hidden;
  }


  .table-container[data-v-42075018] {
    padding-top: 1rem !important;
    padding-bottom: 1rem !important;
    margin-bottom: 10px !important;
  }

  .table-container table {
    margin: 1em 0;
    border: 0.3px #ddd solid;
    -webkit-print-color-adjust: exact;
    border-collapse: unset;
  }

}

</style>
<style scoped>


@media print {

  @page {
    size:8.5in 11in;
    margin-top: 2cm
  }

  header.modal {
    visibility: visible !important;
    margin: 5px 20px 40px 20px;
    background: #2176d2;
    display: block !important;
  }

  table {
    border-spacing: 0px;
    page-break-inside: avoid !important;
  }

  thead, th, tr {
    border: 0.3px solid black;
    border-collapse: unset !important;
  }

  #components-root, #map-panel-container {
    display:none;
  }

  .openmaps-modal {
    overflow: visible !important;
    position: absolute !important;
    top: 0 !important;
    padding: 0 !important;
    height: 100%;
    border-style: none !important;
  }

}

@media screen and (max-width: 750px) {
  #plans-button {
    display: none;
  }
  .button-state {
    background: white;
  }

  .openmaps-modal {
    width: 100% !important;
    height: 100% !important;
    margin: 0;
    left: 0 !important;
    right: 0 !important;
  }
}

#plans-button{
  padding: 10.5px 25px 10.5px;
  float: right;
}

header {
  visibility: hidden ;
  display: none;
}

.address-container {
  height: 100%;
  width: 100%;
  align-items: flex-start;
  padding-left: 20px;
  padding-top: 20px;
  padding-bottom: 20px;
}

.address-header {
  background: #daedfe;
  color: #0f4d90;
  /*this keeps the box shadow over the scrollable part of the panel*/
  position: relative;
  z-index: 1;

  -webkit-box-shadow: 0px 5px 7px -2px rgba(0,0,0,0.18);
  -moz-box-shadow: 0px 5px 7px -2px rgba(0,0,0,0.18);
  box-shadow: 0px 5px 7px -2px rgba(0,0,0,0.18);
  display: inline-block;
}

.address-header-line-1 {
  margin-bottom: 0;
  margin-top: 0;
  padding-top: 0px !important;
  padding-bottom: 0px !important;
  padding-right: 8px !important;
  padding-left: 8px !important;
}

.address-header-line-2 {
  padding: 0px;
}

.address-header-line-3 {
  padding: 0px;
}

.default-address-text {
  font-size: 30px;
  line-height: 26px;
  font-family: 'Montserrat', 'Tahoma', sans-serif;
  padding-top: 0px !important;
  padding-bottom: 0px !important;
  padding-right: 8px !important;
  padding-left: 8px !important;
}

.div-padding-and-margin {
  padding-top: 15px;
  margin-bottom: 10px;
}

.flex-div {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.icon-div {
  margin: 10px;
}

.openmaps-modal {
  color: rgb(15, 77, 144);
  height: calc(100% - 44px) ;
  padding: 20px;
  overflow-y: auto;
  position: fixed;
  background: white;
  z-index:1000;
  margin: auto;
  max-width: 1200px;
  left: 2%;
  right: 2%;
  border-style: solid;
  border-width: 4px;
  border-color: #8a8a8a;
}

.openmaps-modal-content{
  width: 95%;
  height: 85%;
  margin: 20px auto;
}

.openmaps-modal-close{
  position: fixed;
  background: transparent;
  height: 30px;
  width: 30px;
  z-index: 999;
}

.openmaps-modal.openmaps-modal--open{
  z-index:1000;
  opacity: 1;
}

.page-title {
  font-size: 28px !important;
  color: rgb(15, 77, 144) !important;
  align-items: baseline;
  margin-bottom: 0;
}

.print-logo {
  display: inline-block;
  width: 40%;
}

.page-title-container {
  display: inline-block;
  padding-left: 10px;
  border-left: 3px solid rgb(15, 77, 144);
  vertical-align: bottom;
  margin-left: 10px;
}

.street-view-image {
  height: 40px;
  width: 73px;
  color: blue;
}

</style>
