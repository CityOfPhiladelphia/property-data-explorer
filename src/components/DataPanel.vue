<template>
  <div id="data-panel-container">

    <!-- <div :class="this.tableClass"> -->
      <full-screen-topics-toggle-tab-vertical id="lower-toggle-tab"
      />
      <div class="spinner-div small-12 cell"
           v-show="this.loadingData"
      >
        <font-awesome-icon icon="spinner"
                           class="fa-4x"
                           aria-hidden="true"
        />
        <h3>Loading Data</h3>
      </div>
      <horizontal-table
        v-show="!this.loadingData"
        v-if="this.lastSearchMethod === 'geocode' || this.lastSearchMethod === 'reverseGeocode'"
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
        v-show="!this.loadingData"
        v-if="this.lastSearchMethod === 'owner search'"
        :slots="{
          items: function(state) {
            var data = state.ownerSearch.data;
            return data;
          },
        }"
        :options="this.ownerOptions"
      />
      <horizontal-table
        v-show="!this.loadingData"
        v-if="this.lastSearchMethod === 'shape search' && this.$store.state.shapeSearch.data !== null
              || this.lastSearchMethod === 'buffer search' && this.$store.state.shapeSearch.data !== null"
        :slots="{
          items: function(state) {
            var data = state.shapeSearch.data.rows;
            return data;
          },
        }"
        :options="this.shapeOptions"
      />
    <!-- </div> -->

  </div>
</template>

<script>
require("sorttable")
import moment from 'moment';
import helpers from '../util/helpers';
import transforms from '../general/transforms';
const titleCase = transforms.titleCase.transform;

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0
})

import PropertyCardModal from './PropertyCardModal.vue';

export default {
  components: {
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
      'showTable': false,
      'loadingData': false,
    }
  },
  watch: {
    opaStatus(nextOpaStatus) {
      if (nextOpaStatus === 'success') {
        this.$data.showTable = true;
        this.$data.loadingData = false;
      } else if (nextOpaStatus === 'waiting') {
        this.$data.loadingData = true;
      } else {
        this.$data.loadingData = false;
      }
    },
  },
  computed: {
    lastSearchMethod() {
      return this.$store.state.lastSearchMethod;
    },
    opa() {
      return this.$store.state.sources.opa_assessment;
    },
    opaStatus() {
      if (this.opa) {
        if (this.opa.status) {
          return this.opa.status
        } else{
          return null;
        }
      } else {
        return null;
      }
    },
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
    geocodeOptions() {
      const options = {
        id: 'ownerProperties',
        tableid: 'aaa',
        dataSources: ['opa_assessment'],
        mapOverlay: {},
        clickEnabled: true,
        downloadButton: false,
        expandDataDownload: true,
        mailingFields: this.mailingFields,
        tableSort: this.tableSort,
        expandedData: this.expandedData,
        rowAction: this.rowClick,
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

          },
          tr: 'pointer',
        },
        fields: [
          {
            label: 'Street Address',
            value: function(state, item) {
              if( state.lastSearchMethod === "buffer search") {
                return titleCase(item.address_std)
              } else {
                if(item.properties.opa_address != "" ) {
                  return titleCase(item.properties.opa_address)
                } else {
                  return titleCase(item.properties.street_address)
                }
              }
            },
            customStyle: {float: 'left', 'padding-right': '5px'},
            mobileIcon: "info-circle",
            hideMobileIcon: (state, item) => typeof state.sources.opa_assessment.targets[item.properties.opa_account_num] != 'undefined' ? true : false ,
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
        downloadButton: false,
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
        rowAction: this.rowClick,
        customClass: {
          table: 'sortable',
          th: function(field) {
            let classType = field === 'Price of Last Sale' ? 'sorttable_numeric':
                            field === 'Market Value' ? 'sorttable_numeric':
                            field === 'Date of Last Sale' ? 'sorttable_ddmmyyyy': ''
            return classType

          },
          tr: 'pointer',
        },
        fields: [
          {
            label: 'Street Address',
            value: function(state, item) {
              return titleCase(item.properties.opa_address)
            },
            customStyle: {float: 'left', 'padding-right': '5px'},
            mobileIcon: "info-circle"
          },
          {
            label: 'Market Value',
            value: function(state, item) {
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
        downloadButton: false,
        expandDataDownload: true,
        mailingFields: this.mailingFields,
        tableSort: this.tableSort,
        expandedData: this.expandedData,
        rowAction: this.rowClick,
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

          },
          tr: 'pointer',
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
            customStyle: {float: 'left', 'padding-right': '5px'},
            mobileIcon: "info-circle",
            hideMobileIcon: (state, item) => item.condo ? false : true ,
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
      console.log('addCondoRecords is running');
      this.$data.showTable = false;
      let mapUnitIds = function(id) {
        // console.log('running mapUnitIds');
        let unitsToAdd = this.$store.state.condoUnits.units[id]
        unitsToAdd.map(
          (item, index) => {
            typeof item.properties != 'undefined' ? item._featureId = item.properties.pwd_parcel_id + "-UNIT-" + index :
            item._featureId = item.pwd_parcel_id + "-UNIT-" + index
          }
        );
        // console.log("Units to add: ", unitsToAdd)
        return unitsToAdd
      }
      mapUnitIds = mapUnitIds.bind(this)
      // console.log('after mapUnitIds');
      let unitData;
      if(this.$store.state.lastSearchMethod === "geocode" || this.$store.state.lastSearchMethod === "reverseGeocode") {
        // console.log("Not shape search, input: ", input)

        this.$controller.dataManager.resetData();
        const input = this.$store.state.parcels.pwd.properties.ADDRESS;
        this.$controller.dataManager.clients.condoSearch.fetch(input)

        unitData = mapUnitIds(item._featureId);
        this.$store.commit('setGeocodeRelated', unitData);

        this.$controller.dataManager.fetchData();
      } else {
        // console.log('last search method is not geocode')
        let result = this.$store.state.shapeSearch.data.rows.filter(
          row => row._featureId === item._featureId
        )

        function arrayObjectIndexOf(myArray, searchTerm, property) {
            for(let i = 0, len = myArray.length; i < len; i++) {
                if (myArray[i][property] === searchTerm) return i;
            }
            return -1;
        }

        let units = mapUnitIds(result[0].pwd_parcel_id)
        units.objIndex = arrayObjectIndexOf(this.$store.state.shapeSearch.data.rows, item._featureId, "_featureId" )

        this.$store.commit('setShapeSearchDataPush', units);

        // console.log('this.$controller.dataManager.resetData() is about to run');
        this.$controller.dataManager.resetData();
        // console.log('this.$controller.dataManager.didShapeSearch() is about to run');
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
    rowClick(state, item) {
      let coords = [];
      if( typeof this.geocodeItems[0] != 'undefined') {
        Array.prototype.push.apply(coords, [this.geocodeItems[0].geometry.coordinates[0],this.geocodeItems[0].geometry.coordinates[1]])
      } else if (this.lastSearchMethod === "owner search") {
        Array.prototype.push.apply(coords, [item.geometry.coordinates[0], item.geometry.coordinates[1]])
      } else {
        Array.prototype.push.apply(coords, [item.geocode_lon, item.geocode_lat])
      }
      this.$store.commit('setMapCenter', coords);
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
                if (item.properties.opa_account_num === ""){
                  return ""
                } else {
                  return state.sources.opa_public.targets[obj_id].data.total_livable_area
                        .toLocaleString('en-US', {
                          minimumFractionDigits: 0
                        })
                }
              } else if (state.ownerSearch.status === "success") {
                let obj_id = item.properties.opa_account_num;
                if (item.properties.opa_account_num === ""){
                  return ""
                } else {
                return state.sources.opa_public.targets[obj_id].data.total_livable_area
                      .toLocaleString('en-US', {
                        minimumFractionDigits: 0
                      })
                }
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
                if (item.properties.opa_account_num === ""){
                  return ""
                } else {
                return state.sources.opa_public.targets[obj_id].data.total_area
                      .toLocaleString('en-US', {
                        minimumFractionDigits: 0
                      })
                }
              } else if (state.ownerSearch.status === "success") {
                let obj_id = item.properties.opa_account_num;
                if (item.properties.opa_account_num === ""){
                  return ""
                } else {
                  return state.sources.opa_public.targets[obj_id].data.total_area
                        .toLocaleString('en-US', {
                          minimumFractionDigits: 0
                        })
                }
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
                if (item.properties.opa_account_num === ""){
                  return ""
                } else {
                  return cond_code(state.sources.opa_public.targets[obj_id].data.exterior_condition)
                }
              } else if (state.ownerSearch.status === "success") {
                let obj_id = item.properties.opa_account_num;
                if (item.properties.opa_account_num === ""){
                  return ""
                } else {
                  return cond_code(state.sources.opa_public.targets[obj_id].data.exterior_condition)
                }
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
                if (item.properties.opa_account_num === ""){
                  return ""
                } else {
                  return state.sources.opa_public.targets[obj_id].data.building_code_description
                }
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
                if (item.properties.opa_account_num === ""){
                  return ""
                } else {
                  return state.sources.opa_public.targets[obj_id].data.homestead_exemption != null ?
                         state.sources.opa_public.targets[obj_id].data.homestead_exemption.toLocaleString('en-US', {
                          style: "currency",
                          currency:"USD",
                          minimumFractionDigits: 0
                        }) : 0
                }
              } else if (state.ownerSearch.status === "success") {
                let obj_id = item.properties.opa_account_num
                if (item.properties.opa_account_num === "") {
                  return ""
                } else {
                  return state.sources.opa_public.targets[obj_id].data.homestead_exemption != null ?
                         state.sources.opa_public.targets[obj_id].data.homestead_exemption.toLocaleString('en-US', {
                          style: "currency",
                          currency:"USD",
                          minimumFractionDigits: 0
                        }) : 0
                }
              } else {
                let obj_id = item.parcel_number
                if(typeof obj_id != 'undefined' && obj_id != "") {
                  if(state.sources.opa_public.targets[obj_id].data.homestead_exemption != null) {
                    return state.sources.opa_public.targets[obj_id].data.homestead_exemption != null ?
                           state.sources.opa_public.targets[obj_id].data.homestead_exemption.toLocaleString('en-US', {
                            style: "currency",
                            currency:"USD",
                            minimumFractionDigits: 0
                          }) : 0
                  }  else { return ""}
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
              state.lastSearchMethod === "shape search" || state.lastSearchMethod === "buffer search" ?
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
}

</script>

<style>

@media print {
  #data-panel-container {
    display: none;
  }
}

.data-panel.container {
  justify-content: center;
}

.spinner-div {
  padding-top: 40px;
  padding-bottom: 20px;
  text-align: center;
}

</style>
