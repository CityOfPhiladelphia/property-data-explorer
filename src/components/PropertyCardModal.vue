<template>
  <section :class="['openmaps-about' ,'openmaps-modal']"
            v-if="this.$store.state.activeFeature.featureId"
  >
    <div @click="closeModal" class="openmaps-modal-close">
      <span class="button-state state-unnamed-state unnamed-state-active">
        <font-awesome-icon icon="times" class="fa-lg" aria-hidden="true" />
      </span>
    </div>
    <div class="openmaps-modal-content">

      <div class="address-header cell small-24 medium-24">
        <div :class="'address-container columns small-24 medium-12 large-12'"
        >

          <div v-if="!this.address"
               class="default-address-text"
               :style="this.defaultAddressTextPlaceholderStyle"
          >
            {{ this.$config.defaultAddressTextPlaceholder.text }}
          </div>
          <h1 class="address-header-line-1">

            <font-awesome-icon icon="map-marker-alt"/>
            {{ address }}
          </h1>
          <div class="address-header-line-2">
            PHILADELPHIA, PA
          </div>
        </div>
      </div>

      <callout
      :slots="this.callout"
      :options="this.callout"
      />

      <vertical-table
        :slots="this.vtableOptions"
        :options="this.vtableOptions"
      />

      <horizontal-table
        v-if="this.$store.state.activeSearch.data"
        :slots="{
          title: 'Valuation History',
          items: this.$store.state.activeSearch.data.rows
        }"
        :options="this.activeOptions"
      />

      <vertical-table
        :slots="this.pSaleOptions"
        :options="this.pSaleOptions"
      />
      <vertical-table
        :slots="this.pDetailOptions"
        :options="this.pDetailOptions"
      />

      <badge-custom
        :slots="{
          title: 'Base District'
        }"
        :options="this.zoningBadgeOptions"
      />

    </div>
  </section>
</template>

<script>
import * as philaVueComps from '@cityofphiladelphia/phila-vue-comps';
const BadgeCustom = philaVueComps.BadgeCustom;
const Callout = philaVueComps.Callout;
const HorizontalTable = philaVueComps.HorizontalTable;
const VerticalTable = philaVueComps.VerticalTable;
import helpers from '../util/helpers';
import moment from 'moment';
import transforms from '../general/transforms';
const titleCase = transforms.titleCase.transform;

export default {
  components: {
    Callout,
    BadgeCustom,
    VerticalTable,
    HorizontalTable,
  },
  name: 'Property-Card-Modal',
  computed: {
    activeFeature() {
      // console.log("Active Feature.....");
      return this.$store.state.activeFeature;
    },
    // this returns the address shown in the address header
    address() {

      const state = this.$store.state
      let address =  function() {
        if (state.geocode.status === "success"){
          return titleCase(state.geocode.data.properties.street_address)
        } else if (state.ownerSearch.status === "success") {
          let result = state.ownerSearch.data.filter(object => {
            return object._featureId === state.activeFeature.featureId
          });
          return titleCase(result[0].properties.street_address)
        } else {
          let result = state.shapeSearch.data.rows.filter(object => {
            return object._featureId === state.activeFeature.featureId
          });
          return titleCase(result[0].location)
        }
      }

      return address();
    },
    zipCode() {
      // const geocode = this.geocode;
      // if (!geocode) return null;
      // const zipCode = geocode.properties.zip_code;
      // const zip4 = geocode.properties.zip_4;
      // const parts = [zipCode];
      // if (zip4) parts.push(zip4);
      // return parts.join('-');

      const state = this.$store.state
      let address =  function() {
        if (state.geocode.status === "success"){
          return titleCase(state.geocode.data.properties.street_address);
        } else if (state.ownerSearch.status === "success") {
          let result = state.ownerSearch.data.filter(object => {
            return object._featureId === state.activeFeature.featureId
          });
          return titleCase(result[0].properties.street_address)
        } else {
          let result = state.shapeSearch.data.rows.filter(object => {
            return object._featureId === state.activeFeature.featureId
          });
          return titleCase(result[0].location)
        }
      }

      return address;


    },
    callout() {
      const options = {
        text: '\
        Property assessment and sale information for this address. Source: Office of Property Assessments (OPA). OPA was formerly a part of the Bureau of Revision of Taxes (BRT) and some City records may still use that name.\
        ',
      }
      return options;
    },
    zoningBadgeOptions(){
      const options = {
        titleBackground: '#58c04d',
        components: [
          {
            type: 'horizontal-table',
            options: {
              shouldShowFilters: false,
              shouldShowHeaders: false,
              id: 'baseZoning',
              fields: [
                {
                  label: 'Code',
                  value: function(state, item){
                    return item.data.zoning
                  },
                  transforms: [
                    'nowrap',
                    'bold'
                  ]
                },
                {
                  label: 'Description',
                  value: function (state, item) {
                    const code = item.data.zoning ;
                    return helpers.ZONING_CODE_MAP['"'+code.toUpperCase()+'"'];
                  },
                },
              ], // end fields
            },
            slots: {
              items(state, item) {
                let id = [];
                if (state.geocode.status === "success"){
                  id =  state.geocode.data.properties.opa_account_num;
                } else if (state.ownerSearch.status === "success") {
                  let result = state.ownerSearch.data.filter(
                    object => { return object._featureId === state.activeFeature.featureId }
                  );
                  id =  result[0].properties
                } else {
                  let result = state.shapeSearch.data.rows.filter(
                    object => { return object._featureId === state.activeFeature.featureId }
                  );
                  id = result[0].parcel_number
                }
                const target = new Array(state.sources.opa_public.targets[id]) || {};
                return target.map( item => Object.assign({}, { random: Math.random(), }, item) )
              },
            }
          }
        ]
      }
      return options
    },
    pDetailOptions() {
      const options = {
        id: 'modalProperties',
        title: "Property Details",
        fields: [
          {
            label: 'OPA Account #',
            value: function(state) {
              if (state.geocode.status === "success"){
                return state.geocode.data.properties.opa_account_num;
              } else if (state.ownerSearch.status === "success") {
                let result = state.ownerSearch.data.filter(object => {
                  return object._featureId === state.activeFeature.featureId
                });
                return result[0].properties.opa_account_num
              } else {
                let result = state.shapeSearch.data.rows.filter(object => {
                  return object._featureId === state.activeFeature.featureId
                });
                return result[0].parcel_number
              }
            },
          },
          {
            label: 'Homestead Exemption',
            value: function(state) {
              if (state.geocode.status === "success"){
                let obj_id = state.geocode.data.properties.opa_account_num;
                return state.sources.opa_public.targets[obj_id].data.homestead_exemption
                      .toLocaleString('en-US', {
                        style: "currency",
                        currency:"USD",
                        minimumFractionDigits: 0
                      })
              } else if (state.ownerSearch.status === "success") {
                let result = state.ownerSearch.data.filter(object => {
                  return object._featureId === state.activeFeature.featureId
                });
                let obj_id = result[0].properties.opa_account_num
                return state.sources.opa_public.targets[obj_id].data.homestead_exemption
                      .toLocaleString('en-US', {
                        style: "currency",
                        currency:"USD",
                        minimumFractionDigits: 0
                      })

              } else {
                let result = state.shapeSearch.data.rows.filter(object => {
                  return object._featureId === state.activeFeature.featureId
                });
                let obj_id = result[0].parcel_number
                return state.sources.opa_public.targets[obj_id].data.homestead_exemption
                      .toLocaleString('en-US', {
                        style: "currency",
                        currency:"USD",
                        minimumFractionDigits: 0
                      })
              }
            },
          },
          {
            label: 'Building Description',
            value: function(state) {
              if (state.geocode.status === "success"){
                let obj_id = state.geocode.data.properties.opa_account_num;
                return state.sources.opa_public.targets[obj_id].data.building_code_description
              } else if (state.ownerSearch.status === "success") {
                let result = state.ownerSearch.data.filter(object => {
                  return object._featureId === state.activeFeature.featureId
                });
                let obj_id = result[0].properties.opa_account_num
                return state.sources.opa_public.targets[obj_id].data.building_code_description

              } else {
                let result = state.shapeSearch.data.rows.filter(object => {
                  return object._featureId === state.activeFeature.featureId
                });
                let obj_id = result[0].parcel_number
                return state.sources.opa_public.targets[obj_id].data.building_code_description
              }
            },
          },
          {
            label: 'Building Condition',
            value: function(state) {
                const cond_code = function(exterior) {
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
              if (state.geocode.status === "success"){
                let obj_id = state.geocode.data.properties.opa_account_num;
                return cond_code(state.sources.opa_public.targets[obj_id].data.exterior_condition)
              } else if (state.ownerSearch.status === "success") {
                let result = state.ownerSearch.data.filter(object => {
                  return object._featureId === state.activeFeature.featureId
                });
                let obj_id = result[0].properties.opa_account_num
                return cond_code(state.sources.opa_public.targets[obj_id].data.exterior_condition)

              } else {
                let result = state.shapeSearch.data.rows.filter(object => {
                  return object._featureId === state.activeFeature.featureId
                });
                let obj_id = result[0].parcel_number
                return cond_code(state.sources.opa_public.targets[obj_id].data.exterior_condition)
              }
            },
          },
          {
            label: 'Land Area (SqFt)',
            value: function(state) {
              if (state.geocode.status === "success"){
                let obj_id = state.geocode.data.properties.opa_account_num;
                return state.sources.opa_public.targets[obj_id].data.total_area
                      .toLocaleString('en-US', {
                        minimumFractionDigits: 0
                      })
              } else if (state.ownerSearch.status === "success") {
                let result = state.ownerSearch.data.filter(object => {
                  return object._featureId === state.activeFeature.featureId
                });
                let obj_id = result[0].properties.opa_account_num
                return state.sources.opa_public.targets[obj_id].data.total_area
                      .toLocaleString('en-US', {
                        minimumFractionDigits: 0
                      })
              } else {
                let result = state.shapeSearch.data.rows.filter(object => {
                  return object._featureId === state.activeFeature.featureId
                });
                let obj_id = result[0].parcel_number
                return state.sources.opa_public.targets[obj_id].data.total_area
                      .toLocaleString('en-US', {
                        minimumFractionDigits: 0
                      })
              }
            },
          },
          {
            label: 'Improvement Area (SqFt)',
            value: function(state) {
              if (state.geocode.status === "success"){
                let obj_id = state.geocode.data.properties.opa_account_num;
                return state.sources.opa_public.targets[obj_id].data.total_livable_area
                      .toLocaleString('en-US', {
                        minimumFractionDigits: 0
                      })
              } else if (state.ownerSearch.status === "success") {
                let result = state.ownerSearch.data.filter(object => {
                  return object._featureId === state.activeFeature.featureId
                });
                let obj_id = result[0].properties.opa_account_num
                return state.sources.opa_public.targets[obj_id].data.total_livable_area
                      .toLocaleString('en-US', {
                        minimumFractionDigits: 0
                      })
              } else {
                let result = state.shapeSearch.data.rows.filter(object => {
                  return object._featureId === state.activeFeature.featureId
                });
                let obj_id = result[0].parcel_number
                return state.sources.opa_public.targets[obj_id].data.total_livable_area
                      .toLocaleString('en-US', {
                        minimumFractionDigits: 0
                      })
              }
            },
          },
        ],
      }
      return options;
    },
    pSaleOptions() {
      const options = {
        id: 'modalProperties',
        title: "Sale Details",
        fields: [
          {
            label: 'Sale Price',
            value: function(state) {
              if (state.geocode.status === "success"){
                return state.sources.opa_assessment.targets[state.geocode.data.properties.opa_account_num].data.sale_price
                      .toLocaleString('en-US', {
                        style: "currency",
                        currency:"USD",
                        minimumFractionDigits: 0
                      })
              } else if (state.ownerSearch.status === "success") {
                let key = state.ownerSearch.data.filter(object => {
                  return object._featureId === state.activeFeature.featureId
                } );
                return state.sources.opa_assessment.targets[key[0].properties.opa_account_num].data.sale_price
                      .toLocaleString('en-US', {
                        style: "currency",
                        currency:"USD",
                        minimumFractionDigits: 0
                      })
              } else {
                let result = state.shapeSearch.data.rows.filter(object => {
                  return object._featureId === state.activeFeature.featureId
                });
                return result[0].sale_price
                      .toLocaleString('en-US', {
                        style: "currency",
                        currency:"USD",
                        minimumFractionDigits: 0
                      })
              }
            },
          },
          {
            label: 'Sale Date',
            value: function(state) {
              if (state.geocode.status === "success"){
                return moment(state.sources.opa_assessment.targets[state.geocode.data.properties.opa_account_num].data.sale_date)
                      .format('MM/DD/YYYY')
              } else if (state.ownerSearch.status === "success") {
                let key = state.ownerSearch.data.filter(object => {
                  return object._featureId === state.activeFeature.featureId
                } );
                return moment(state.sources.opa_assessment.targets[key[0].properties.opa_account_num].data.sale_date)
                      .format('MM/DD/YYYY')
              } else {
                let result = state.shapeSearch.data.rows.filter(object => {
                  return object._featureId === state.activeFeature.featureId
                });
                return moment(result[0].sale_price)
                      .format('MM/DD/YYYY')
              }
            },
          },
        ],
      }
      return options;
    },
    activeOptions() {
      const options = {
        id: 'ownerProperties',
        tableid: 'ddd',
        // dataSources: ['opa'],
        mapOverlay: {},
        mouseOverDisabled: true,
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
      return options;
    },
    vtableOptions() {
      const options = {
        id: 'modalProperties',
        fields: [
          {
            label: 'OPA Account #',
            value: function(state) {
              if (state.geocode.status === "success"){
                return state.geocode.data.properties.opa_account_num;
              } else if (state.ownerSearch.status === "success") {
                let result = state.ownerSearch.data.filter(object => {
                  return object._featureId === state.activeFeature.featureId
                });
                return result[0].properties.opa_account_num
              } else {
                let result = state.shapeSearch.data.rows.filter(object => {
                  return object._featureId === state.activeFeature.featureId
                });
                return result[0].parcel_number
              }
            },
          },
          {
            label: 'Owners',
            value: function(state){
              if (state.geocode.status === "success"){
                return titleCase(state.geocode.data.properties.opa_owners.toString());
              } else if (state.ownerSearch.status === "success") {
                let result = state.ownerSearch.data.filter(object => {
                  return object._featureId === state.activeFeature.featureId
                });
                return titleCase(result[0].properties.opa_owners.toString())
              } else {
                let result = state.shapeSearch.data.rows.filter(object => {
                  return object._featureId === state.activeFeature.featureId
                });
                let owners = result[0].owner_2.length > 1 ?
                             titleCase(result[0].owner_1) + ", " + titleCase(result[0].owner_2):
                             titleCase(result[0].owner_1)

                return owners
              }
            },
          },
          {
            label: 'OPA Address',
            value: function(state) {
              if (state.geocode.status === "success"){
                return titleCase(state.geocode.data.properties.street_address);
              } else if (state.ownerSearch.status === "success") {
                let result = state.ownerSearch.data.filter(object => {
                  return object._featureId === state.activeFeature.featureId
                });
                return titleCase(result[0].properties.street_address)
              } else {
                let result = state.shapeSearch.data.rows.filter(object => {
                  return object._featureId === state.activeFeature.featureId
                });
                return titleCase(result[0].location)
              }
            },
          },
        ],
        externalLink: {
          action: function() {
            return 'View the Real Estate Tax Balance';
          },
          href: function() {
            return '//legacy.phila.gov/revenue/realestatetax/';
          }
        },
      }
      return options;
    }
  },
  methods: {
    closeModal (state) {
      this.$store.state.activeFeature.featureId = null;
    },
  },
}
</script>

<style scoped>

  .address-container {
    height: 100%;
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

.icon-div {
  margin: 10px;
}

.text-div {

}

.street-view-image {
  height: 40px;
  width: 73px;
  color: blue;
}

.openmaps-modal {
  color: rgb(15, 77, 144);
  width: 97%;
  height: 80%;
  padding: 20px;
  overflow: hidden;
  position: absolute;
  top: 70px;
  left: 10px;
  background: white;
  z-index:1000;
}

.openmaps-modal.openmaps-modal--open{
  z-index:1000;
  opacity: 1;
}

.openmaps-modal-content{
  width: 95%;
  height: 85%;
  margin: 20px auto;
  overflow-y: auto;
}

.openmaps-modal-close{
  position: absolute;
  top:15px;
  left:15px;
  background: white;
  height: 30px;
  width: 30px;
}

</style>
