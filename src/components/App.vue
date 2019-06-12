<template>
  <div id="app-root">
    <header class="site-header app group hide-print">
      <div class="row expanded">
        <div class="columns">
          <a href="//beta.phila.gov" class="logo">
            <img src="https://standards.phila.gov/img/logo/city-of-philadelphia-yellow-white.png" alt="City of Philadelphia">
          </a>
          <div class="app-divide"></div>
          <div class="page-title-container">
            <a href="#/">
              <h1 class="page-title">Property Data Explorer</h1>
            </a>
          </div>
        </div>
      </div>
    </header>
    <property-card-modal></property-card-modal>

    <div id="components-root">
      <div :class="'flexing ' + this.mapClass">
        <map-panel/>
      </div>
      <div :class="'flexing ' + this.tableClass">
        <full-screen-topics-toggle-tab-vertical/>
        <horizontal-table
          v-show="this.$data.showTable"
          v-if="this.$store.state.lastSearchMethod === 'geocode'"
          padding-top="0"
          :slots="{
            items: geocodeItems,
            buttonFinished: function() {
              $data.showTable = true
              $data.buttonHide = true
            }
          }"
          :options="this.geocodeOptions"
        />
        <horizontal-table
          v-if="this.$store.state.lastSearchMethod === 'owner search'"
          :slots="{
            items: function(state) {
              var data = state.ownerSearch.data;
              return data;
            },
          }"
          :options="this.ownerOptions"
        />
        <horizontal-table
          v-if="this.$store.state.lastSearchMethod === 'shape search'
                && this.$store.state.shapeSearch.data !== null"

          :slots="{
            items: function(state) {
              var data = state.shapeSearch.data.rows;
              return data;
            },
          }"
          :options="this.shapeOptions"
        />
      </div>
    </div>
  </div>
</template>

<script>

  require("sorttable")
  // import * as philaVueComps from '@philly/vue-comps';
  import axios from 'axios';
  import helpers from '../util/helpers';
  import MapPanel from './MapPanel.vue';
  import moment from 'moment';
  import PropertyCardModal from './PropertyCardModal.vue';
  import transforms from '../general/transforms';
  const titleCase = transforms.titleCase.transform;
  // const MapAddressInput = philaVueMapping.MapAddressInput;
  // const Callout = philaVueComps.Callout;
  // const Badge = philaVueComps.Badge;
  // const BadgeCustom = philaVueComps.BadgeCustom;
  // const CollectionSummary = philaVueComps.CollectionSummary;
  // const ExternalLink = philaVueComps.ExternalLink;
  // const FullScreenTopicsToggleTabVertical = philaVueComps.FullScreenTopicsToggleTabVertical;
  // const HorizontalTable = philaVueComps.HorizontalTable;
  // const VerticalTable = philaVueComps.VerticalTable;
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  })

  export default {
    components: {
      MapPanel,
      PropertyCardModal,
      MapAddressInput: () => import(/* webpackChunkName: "pvc_AddressInput" */'@philly/vue-mapping/src/components/MapAddressInput.vue'),
      Callout: () => import(/* webpackChunkName: "pvc_Callout" */'@philly/vue-comps/src/components/Callout.vue'),
      Badge: () => import(/* webpackChunkName: "pvc_Badge" */'@philly/vue-comps/src/components/Badge.vue'),
      BadgeCustom: () => import(/* webpackChunkName: "pvc_BadgeCustom" */'@philly/vue-comps/src/components/BadgeCustom.vue'),
      CollectionSummary: () => import(/* webpackChunkName: "pvc_CollectionSummary" */'@philly/vue-comps/src/components/CollectionSummary.vue'),
      ExternalLink: () => import(/* webpackChunkName: "pvc_ExternalLink" */'@philly/vue-comps/src/components/ExternalLink.vue'),
      FullScreenTopicsToggleTabVertical: () => import(/* webpackChunkName: "pvc_FullScreenTopicsToggleTabVertical" */'@philly/vue-comps/src/components/FullScreenTopicsToggleTabVertical.vue'),
      HorizontalTable: () => import(/* webpackChunkName: "pvc_HorizontalTable" */'@philly/vue-comps/src/components/HorizontalTable.vue'),
      VerticalTable: () => import(/* webpackChunkName: "pvc_VerticalTable" */'@philly/vue-comps/src/components/VerticalTable.vue'),
    },
    data() {
      return {
        'top': 3,
        'bottom': 2,
        'showTable': true,
      }
    },
    watch: {
      '$store.state.drawShape': function() {
        if(this.$store.state.drawShape !== null) {
        this.$controller.geocodeDrawnShape();
        }
      },
      '$store.state.activeModal': function() {
        this.$controller.activeFeatureChange();
      },
      '$store.state.ownerSearch.status': function() {
        if(this.$store.state.ownerSearch.status === 'success') {
          this.$controller.geocodeOwnerSearch()
        }
      },
      't$store.sources.opa_assessment.status': function() {
        if(this.$store.sources.opa_assessment.status === 'success'){
          this.$data.showTable = true
        }
      },
    },

    computed: {
      geocode() {
        return this.$store.state.geocode;
      },
      geocodeItems() {
        let data = [];
        if (this.geocode.data) {
          data.push(this.geocode.data);
        }
        if (this.geocode.related) {
          for (let related of this.geocode.related) {
            data.push(related);
          }
        }
        return data;
      },
      fullScreenMapEnabled() {
        return this.$store.state.fullScreenMapEnabled;
      },
      fullScreenTopicsEnabled() {
        return this.$store.state.fullScreenTopicsEnabled;
      },
      mapClass() {
        return this.fullScreenMapEnabled ? 'top-full':
               this.fullScreenTopicsEnabled ? 'top-none':
               'top-half';
      },
      tableClass() {
        return this.fullScreenMapEnabled ? 'bottom-none':
               this.fullScreenTopicsEnabled? 'bottom-full':
               'bottom-half';
      },
      geocodeOptions() {
        const options = {
          id: 'ownerProperties',
          tableid: 'aaa',
          dataSources: ['opa_assessment'],
          mapOverlay: {},
          clickEnabled: true,
          expandDataDownload: true,
          mailingFields: this.mailingFields,
          tableSort: this.tableSort,
          expandedData: this.expandedData,
          export: {
            formatButtons: {
              csv: "Download CSV",
              mailing: "Mailing Labels"
            }
          },
          expandedData: this.expandedData,
          customClass: {
            table: 'sortable',
            th: function(field) {
              let classType = field === 'Price of Last Sale' ? 'sorttable_numeric':
                              field === 'Market Value' ? 'sorttable_numeric':
                              field === 'Date of Last Sale' ? 'sorttable_ddmm': ''
              return classType

            }
          },
          fields: [
            {
              label: 'Street Address',
              value: function(state, item) {
                if(item.properties.opa_address != "" ) {
                  return titleCase(item.properties.opa_address)
                } else {
                  return titleCase(item.properties.street_address)
                }
              },
            },
            {
              label: 'Market Value',
              value: function(state, item){
                if(state.sources.opa_assessment.targets[item.properties.opa_account_num]){
                  if(typeof state.sources.opa_assessment.targets[item.properties.opa_account_num].data != 'undefined') {
                    return formatter.format(state.sources.opa_assessment.targets[item.properties.opa_account_num].data.market_value)
                  }
                } else {
                  return ''
                }
              },
              components: [
                {
                  type: 'button-comp',
                  slots: {
                    text: 'Click to add units to results.',
                    buttonAction: this.addCondoRecords,
                    buttonFinished() {
                      console.log("button finished running")
                      this.$data.showTable = true
                    },
                  },
                  options: {
                    class: function (state, item) {
                      return state.sources.opa_assessment.targets[item.properties.opa_account_num] ? "" : 'condo-button'
                    },
                    style: function (state, item) {
                      return state.sources.opa_assessment.targets[item.properties.opa_account_num] ? { display: 'none' } : ""
                    },
                  }
                }
              ],
            },
            {
              label: 'Date of Last Sale',
              value: function(state, item) {
                if(item.properties.opa_account_num != ""){
                  if(typeof state.sources.opa_assessment.targets[item.properties.opa_account_num] != 'undefined'){
                    return moment(state.sources.opa_assessment.targets[item.properties.opa_account_num].data.sale_date)
                  .format('MM/DD/YYYY')
                  }
                } else {
                  return "Not Applicable"
                }
              },
              customkey: function(state, item) {
                if(item.properties.opa_account_num != "") {
                  if(typeof state.sources.opa_assessment.targets[item.properties.opa_account_num] != 'undefined'){
                    return moment(state.sources.opa_assessment.targets[item.properties.opa_account_num].data.sale_date).format("YYYYMMDD")
                  } else { return}
                } else {
                  return 0
                }
              }
            },
            {
              label: 'Price of Last Sale',
              value: function(state, item) {
                if(item.properties.opa_account_num != ""){
                  if(typeof state.sources.opa_assessment.targets[item.properties.opa_account_num] != 'undefined'){
                    return formatter.format(state.sources.opa_assessment.targets[item.properties.opa_account_num].data.sale_price)
                  }
                } else {
                  return "Not Applicable"
                }
              },
            },
            {
              label: 'Owner',
              value: function(state, item){
                if (item.properties.opa_owners != '') {
                  return titleCase(item.properties.opa_owners.join(', '));
                } else {
                  return titleCase(item.properties.usps_bldgfirm);
                }
              },
            },
          ],
        }
        return options;
      },
      ownerOptions() {
        const options = {
          id: 'ownerProperties',
          tableid: 'bbb',
          dataSources: ['opa_assessment'],
          mapOverlay: {},
          clickEnabled: true,
          export: {
            formatButtons: {
              csv: "Download CSV",
              mailing: "Mailing Labels"
            }
          },
          expandDataDownload: true,
          mailingFields: this.mailingFields,
          tableSort: this.tableSort,
          expandedData: this.expandedData,
          customClass: {
            table: 'sortable',
            th: function(field) {
              let classType = field === 'Price of Last Sale' ? 'sorttable_numeric':
                              field === 'Market Value' ? 'sorttable_numeric':
                              field === 'Date of Last Sale' ? 'sorttable_ddmmyyyy': ''
              return classType

            }
          },
          fields: [
            {
              label: 'Street Address',
              value: function(state, item) {
                return titleCase(item.properties.opa_address)
              },
            },
            {
              label: 'Market Value',
              value: function(state, item){
                if(state.sources.opa_assessment.targets){}
                return formatter.format(state.sources.opa_assessment.targets[item.properties.opa_account_num.toString()].data.market_value)
              },
            },
            {
              label: 'Date of Last Sale',
              value: function(state, item) {
                return moment(state.sources.opa_assessment.targets[item.properties.opa_account_num].data.sale_date.toString())
                      .format('MM/DD/YYYY')
              },
              customkey: function(state, item) {
                return moment(state.sources.opa_assessment.targets[item.properties.opa_account_num].data.sale_date.toString()).format("YYYYMMDD")
              },
            },
            {
              label: 'Price of Last Sale',
              value: function(state, item) {
                return formatter.format(state.sources.opa_assessment.targets[item.properties.opa_account_num.toString()].data.sale_price)
              },
            },
            {
              label: 'Owner',
              value: function(state, item){
                if (item.properties.opa_owners != '') {
                  return titleCase(item.properties.opa_owners.join(', '));
                } else {
                  return titleCase(item.properties.usps_bldgfirm);
                }
              }
            },
          ],
        }
        return options;
      },
      shapeOptions() {
        const options = {
          id: 'ownerProperties',
          tableid: 'ccc',
          // dataSources: ['opa_assessment'],
          mapOverlay: {},
          clickEnabled: true,
          // downloadButton: true,
          expandDataDownload: true,
          mailingFields: this.mailingFields,
          tableSort: this.tableSort,
          expandedData: this.expandedData,
          export: {
            formatButtons: {
              csv: "Download CSV",
              mailing: "Mailing Labels"
            }
          },
          customClass: {
            table: 'sortable',
            th: function(field) {
              let classType = field === 'Price of Last Sale' ? 'sorttable_numeric':
                              field === 'Market Value' ? 'sorttable_numeric': ''

              return classType

            }
          },
          fields: [
            {
              label: 'Street Address',
              value: function(state, item) {
                if(item.unit != null && item.unit != "") {
                  return titleCase(item.address_std)
                } else {
                  return titleCase(item.location)
                }
              },
            },
            {
              label: 'Market Value',
              value: function(state, item){
                if(item.market_value != "") {
                  return formatter.format(item.market_value)
                } else {
                  return  ''
                }
              },
              components: [
                {
                  type: 'button-comp',
                  slots: {
                    text: 'Click to add units to results.',
                    buttonAction: this.addCondoRecords,
                  },
                  options: {
                    class: function (state, item) {
                      return item.condo ? 'condo-button' : ""
                    },
                    style: function (state, item) {
                      return item.condo ? "" : { display: 'none' }
                    },
                  }
                }
              ],
            },
            {
              label: 'Date of Last Sale',
              value: function(state, item) {
                if (item.sale_date != ""){
                  return moment(item.sale_date).format('MM/DD/YYYY')
                } else {
                  return "Not Applicable"
                }
              },
              customkey: function(state, item) {
                if (item.sale_date != "") {
                  return moment(item.sale_date).format("YYYYMMDD")
                } else {
                  return 0
                }
              }
            },
            {
              label: 'Price of Last Sale',
              value: function(state, item) {
                if (item.sale_price != "") {
                  return formatter.format(item.sale_price)
                } else {
                  return "Not Applicable"
                }
              },
            },
            {
              label: 'Owner',
              value: function(state, item){
                if (item.owner_1 != "") {
                  let owners = item.owner_2 != null ?
                               titleCase(item.owner_1.trim()) + ", " + titleCase(item.owner_2.trim()):
                               titleCase(item.owner_1.trim())

                  return owners
                } else {
                  return ""
                }
              },
            },
          ],
        }
        return options;
      },
    },
    methods: {
      addCondoRecords(state, item) {
        this.$data.showTable = false;
        console.log("this$data.showTable = ", this.$data.showTable)
        let mapUnitIds = function(id) {
          let unitsToAdd = this.$store.state.condoUnits.units[id]
          unitsToAdd.map(
            (item, index) => {
              typeof item.properties != 'undefined' ? item._featureId = item.properties.pwd_parcel_id + "-UNIT-" + index :
              item._featureId = item.pwd_parcel_id + "-UNIT-" + index
            }
          );
          return unitsToAdd
        }
        mapUnitIds = mapUnitIds.bind(this)
        let unitData;
        if(this.$store.state.lastSearchMethod === "geocode") {
          // console.log("Not shape search, input: ", input)

          this.$controller.dataManager.resetData();
          const input = this.$store.state.parcels.pwd.properties.ADDRESS;
          this.$controller.dataManager.clients.condoSearch.fetch(input)

          unitData = mapUnitIds(item._featureId);
          this.$store.commit('setGeocodeRelated', unitData);

          this.$controller.dataManager.fetchData();
        } else {
          let result = this.$store.state.shapeSearch.data.rows.filter(
            row => row._featureId === item._featureId
          )

          // console.log("Matching Id for Units: ", units);
          let units = mapUnitIds(result[0].pwd_parcel_id)
          this.$store.commit('setShapeSearchDataPush', units);

          this.$controller.dataManager.resetData();
          this.$controller.dataManager.didShapeSearch();
        }
        // this.closeModal(state);
      },
      tableSort(fields){

        Array.prototype.move = function (from, to) {
          this.splice(to, 0, this.splice(from, 1)[0]);
        };

        // list needs to be in reverse order
        let tableReorder = [
          "Zoning Description",
          "Zoning Code",
          "Building Description",
          "Building Condition",
          "Land Area (SqFt)",
          "Improvement Area (SqFt)",
          "Homestead Exemption",
          "Price of Last Sale",
          "Date of Last Sale",
          "Market Value",
          "State",
          "City",
          "Zip Code",
          "Street Address",
          "Owner",
          "OPA Account #",
        ];

        for ( let sortLabel of tableReorder) {
          fields.move(fields.map(e => e.label).indexOf(sortLabel), 0)
        }

        return fields

      },
      expandedData() {
        let modalComputed = PropertyCardModal.computed

        return [
            {
              label: 'Zip Code',
              value: function(state, item) {
                let zip = item.properties ? item.properties.zip_code : item.zip_code.substring(0,5)
                return zip
              }
            },
            {
              label: 'City',
              value: function() {return "Philadelphia"}
            },
            {
              label: 'State',
              value: function() {return "PA"}
            },
            {
              label: 'Improvement Area (SqFt)',
              value: function(state, item) {
                if (state.geocode.status === "success"){
                  let obj_id = item.properties.opa_account_num;
                  return state.sources.opa_public.targets[obj_id].data.total_livable_area
                        .toLocaleString('en-US', {
                          minimumFractionDigits: 0
                        })
                } else if (state.ownerSearch.status === "success") {
                  let obj_id = item.properties.opa_account_num;
                  return state.sources.opa_public.targets[obj_id].data.total_livable_area
                        .toLocaleString('en-US', {
                          minimumFractionDigits: 0
                        })
                } else {
                  let obj_id = item.parcel_number;
                  if (obj_id != "") {
                    return state.sources.opa_public.targets[obj_id].data.total_livable_area
                    .toLocaleString('en-US', {
                      minimumFractionDigits: 0
                    })
                  } else {return ""}
                }
              }
            },
            {
              label: 'Land Area (SqFt)',
              value: function(state, item) {
                if (state.geocode.status === "success"){
                  let obj_id = item.properties.opa_account_num;
                  return state.sources.opa_public.targets[obj_id].data.total_area
                        .toLocaleString('en-US', {
                          minimumFractionDigits: 0
                        })
                } else if (state.ownerSearch.status === "success") {
                  let obj_id = item.properties.opa_account_num;
                  return state.sources.opa_public.targets[obj_id].data.total_area
                        .toLocaleString('en-US', {
                          minimumFractionDigits: 0
                        })
                } else {
                  let obj_id = item.parcel_number;
                  if (obj_id != "") {
                    return state.sources.opa_public.targets[obj_id].data.total_area
                    .toLocaleString('en-US', {
                      minimumFractionDigits: 0
                    })
                  } else { return "" }
                }
              },
            },
            {
              label: 'Building Condition',
              value: function(state, item) {
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
                  let obj_id = item.properties.opa_account_num;
                  return cond_code(state.sources.opa_public.targets[obj_id].data.exterior_condition)
                } else if (state.ownerSearch.status === "success") {
                  let obj_id = item.properties.opa_account_num;
                  return cond_code(state.sources.opa_public.targets[obj_id].data.exterior_condition)
                } else {
                  let obj_id = item.parcel_number;
                  if (obj_id != "") {
                    return cond_code(state.sources.opa_public.targets[obj_id].data.exterior_condition)
                  } else { return ""}
                }
              },
            },
            {
              label: 'Building Description',
              value: function(state, item) {
                if (state.geocode.status === "success"){
                  let obj_id = item.properties.opa_account_num;
                  return state.sources.opa_public.targets[obj_id].data.building_code_description
                } else if (state.ownerSearch.status === "success") {
                  let obj_id = item.properties.opa_account_num
                  return state.sources.opa_public.targets[obj_id].data.building_code_description
                } else {
                  let obj_id = item.parcel_number
                  if (typeof obj_id != 'undefined' && obj_id != "") {
                    return state.sources.opa_public.targets[obj_id].data.building_code_description
                  } else {return ""}
                }
              },
            },
            {
              label: 'Homestead Exemption',
              value: function(state, item) {
                if (state.geocode.status === "success"){
                  let obj_id = item.properties.opa_account_num;
                  return state.sources.opa_public.targets[obj_id].data.homestead_exemption
                        .toLocaleString('en-US', {
                          style: "currency",
                          currency:"USD",
                          minimumFractionDigits: 0
                        })
                } else if (state.ownerSearch.status === "success") {
                  let obj_id = item.properties.opa_account_num
                  return state.sources.opa_public.targets[obj_id].data.homestead_exemption
                        .toLocaleString('en-US', {
                          style: "currency",
                          currency:"USD",
                          minimumFractionDigits: 0
                        })

                } else {
                  let obj_id = item.parcel_number
                  if(typeof obj_id != 'undefined' && obj_id != "") {
                    return state.sources.opa_public.targets[obj_id].data.homestead_exemption
                    .toLocaleString('en-US', {
                      style: "currency",
                      currency:"USD",
                      minimumFractionDigits: 0
                    })
                  } else { return ""}
                }
              },
            },
            {
              label: 'OPA Account #',
              value: function(state, item) {
                if (state.geocode.status === "success"){
                  return item.properties.opa_account_num;
                } else if (state.ownerSearch.status === "success") {
                  return item.properties.opa_account_num
                } else {
                  return item.parcel_number
                }
              },
            },
            {
              label: 'Zoning Code',
              value: function(state, item){
                let id = [];
                state.geocode.status === "success"?  id =  item.properties.opa_account_num :
                state.ownerSearch.status === "success" ? id =  item.properties.opa_account_num :
                id = item.parcel_number
                if (typeof id != 'undefined' && id != "") {
                  return state.sources.opa_public.targets[id].data.zoning.trim()
                } else {return ""}
              },
            },
            {
              label: 'Zoning Description',
              value: function (state, item) {
                let id = [];
                state.geocode.status === "success"?  id =  item.properties.opa_account_num :
                state.ownerSearch.status === "success" ? id =  item.properties.opa_account_num :
                id = item.parcel_number
                if (typeof id != 'undefined' && id != "") {
                  const code = state.sources.opa_public.targets[id].data.zoning ;
                  return helpers.ZONING_CODE_MAP[code.trim()];
                } else { return "" }
              },
            },
          ]
      },
      mailingFields(state, item, thisDef) {
        const valueOptions = this.$store.state.lastSearchMethod === "shape search" ? this.shapeOptions :
                             this.$store.state.lastSearchMethod === "owner search" ? this.ownerOptions :
                             this.geocodeOptions
        return  {
          fields: [
            {
              label: 'Owner',
              value: function(state, item) {
                let owner;
                state.lastSearchMethod === "shape search" ?
                                                  owner = item.owner_2 != null ?
                                                          titleCase(item.owner_1.trim()) + "\n" + titleCase(item.owner_2.trim()):
                                                          titleCase(item.owner_1.trim()) :
                state.lastSearchMethod === "owner search" ?
                                                  owner = item.properties.opa_owners.map( a => titleCase(a)).join('\n') :
                                                  owner = titleCase(item.properties.opa_owners.join(' \n '))
                return owner
              },
            },
            {
              label: 'Street Address',
              value: function(state, item) {
                return valueOptions.fields.filter(item => item.label === 'Street Address')[0].value(state, item)
              },
            },
            {
              label: 'Zip Code',
              value: function(state, item) {
                let zip = item.properties ? item.properties.zip_code : item.zip_code.substring(0,5)
                return 'Philadelphia, PA' + zip
              }
            },
          ],
        };
      },
    }
  };

</script>

<style>

#app-root {
  height: 100%
}

#components-root {
  display: flex;
  flex-direction:column;
  height: 90%;
  overflow-y: auto;
  position: relative;
}

.flexing {
  display: flex;
  flex: 1;
  flex-direction: column;
  position: relative;
}

.bottom-full {
  overflow-y: auto;
  flex: 1;
}

.bottom-half {
  overflow-y: auto;
  flex: 2;
}
.bottom-none {
  overflow-y: auto;
  flex: 0;
  display: none;
}

.component-label {
  font-size: 20px;
}

.condo-button {
  background-color: #5555;
  padding: 10.5, 0, 10.5, 0 !important;
  height: 100%;
  width: 100%;
  text-transform: unset;
  font-family: "Open Sans", Helvetica, Roboto, Arial, sans-serif;
  font-weight: 600;
}

.ib {
  display: inline-block;
}

.leaflet-top, .leaflet-bottom {
  z-index: 999 !important;
}

.margin-sides-20 {
  display: block;
  margin-left: 20px;
  margin-right: 20px;
}

.margin-20 {
  margin-left: 20px;
  margin-right: 20px;
  margin-bottom: 20px;
}

.margin-bottom-60 {
  margin-bottom: 60px !important;
}

.pvc-horizontal-table-controls {
  margin-bottom: 0 !important;
}

.pvc-horizontal-table-body {
  padding-top: 0 !important;
  margin-top: 0 !important;
}

.top-half {
  flex: 3;
}

.top-full {
  flex: 1;
}

.top-none {
  flex: 0;
}

th {
  position: sticky;
  top: 0;
  z-index: 2;
}

.pvc-download-data-button, .pvc-export-data-button {
  position: fixed;
  clear:both;
  z-index: 999;
  top: 85px;
  right: 70px;
}

.mailing {
  right: 225px;
}



@media screen and (max-width: 750px) {
  .pvc-download-data-button, .pvc-export-data-button {
    visibility: hidden;
  }
}

@media print, screen and (min-width: 65.625em) {
  .large-12 {
    width: 100%;
  }
}

</style>
