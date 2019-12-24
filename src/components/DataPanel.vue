<template>
  <div id="data-panel-container">
    <!-- <div :class="this.tableClass"> -->
    <full-screen-topics-toggle-tab-vertical
      id="lower-toggle-tab"
    />
    <div
      v-show="loadingData"
      class="spinner-div small-12 cell"
    >
      <font-awesome-icon
        icon="spinner"
        class="fa-4x"
        aria-hidden="true"
      />
      <h3>Loading Data</h3>
    </div>
    <horizontal-table
      v-show="!loadingData"
      v-if="lastSearchMethod === 'geocode' || lastSearchMethod === 'reverseGeocode'"
      padding-top="0"
      :slots="{
        items: geocodeItems,
        buttonFinished: function() {
          $data.showTable = true
          $data.buttonHide = true
        }
      }"
      :options="geocodeOptions"
    />
    <horizontal-table
      v-show="!loadingData"
      v-if="lastSearchMethod === 'owner search'"
      :slots="{
        items: function(state) {
          var data = state.ownerSearch.data;
          return data;
        },
      }"
      :options="ownerOptions"
    />
    <horizontal-table
      v-show="!loadingData"
      v-if="lastSearchMethod === 'shape search' && this.$store.state.shapeSearch.data !== null
        || lastSearchMethod === 'buffer search' && this.$store.state.shapeSearch.data !== null"
      :slots="{
        items: function(state) {
          var data = state.shapeSearch.data.rows;
          return data;
        },
      }"
      :options="shapeOptions"
    />
    <!-- </div> -->
  </div>
</template>

<script>
require("sorttable");
// import { format } from 'date-fns';
import { format, parseISO } from 'date-fns';
import helpers from '../util/helpers';
import transforms from '../general/transforms';
const titleCase = transforms.titleCase.transform;

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
});

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
      'condoExpanded': false,
    };
  },
  computed: {
    lastSearchMethod() {
      return this.$store.state.lastSearchMethod;
    },
    opa() {
      return this.$store.state.sources.opa_assessment;
    },
    opaStatus() {
      // return this.$store.state.sources.opa_assessment.status;
      if (this.opa && this.opa.status) {
        return this.opa.status;
      }
      return null;

    },
    geocode() {
      return this.$store.state.geocode;
    },
    geocodeItems() {
      let data = [];
      if (!this.$data.condoExpanded && this.geocode.data && this.$store.state.condoUnits.units && this.$store.state.parcels.pwd && this.$store.state.parcels.pwd[0].properties && this.$store.state.lastSearchMethod === 'geocode') {
        // console.log('in geocodeItems, in if');
        const parentCondo = this.geocode.data;
        for (let i in parentCondo.properties) {
          parentCondo.properties[i] = "";
        }
        parentCondo.properties.opa_owners = [ "Condominium (" + this.$store.state.condoUnits.units[this.$store.state.parcels.pwd[0].properties.PARCELID].length + " Units)" ];
        parentCondo.properties.street_address = this.$store.state.parcels.pwd[0].properties.ADDRESS;
        parentCondo.properties.opa_address = this.$store.state.parcels.pwd[0].properties.ADDRESS;
        parentCondo.properties.pwd_parcel_id = this.$store.state.parcels.pwd[0].properties.PARCELID;
        parentCondo._featureId = this.$store.state.parcels.pwd[0].properties.PARCELID;
        parentCondo.condo = true;
        data.push(parentCondo);
      } else {
        // console.log('in geocodeItems, in else, this.geocode.data:', this.geocode.data, 'this.geocode.related:', this.geocode.related);
        if (this.geocode.data) {
          data.push(this.geocode.data);
        }
        if (this.geocode.related) {
          for (let related of this.geocode.related) {
            data.push(related);
          }
        }
      }
      return data;
    },

    geocodeOptions() {
      const options = {
        id: 'ownerProperties',
        tableid: 'aaa',
        dataSources: [ 'opa_assessment' ],
        mapOverlay: {},
        clickEnabled: true,
        downloadButton: false,
        expandDataDownload: true,
        mailingFields: this.mailingFields,
        tableSort: this.tableSort,
        expandedData: this.expandedData,
        rowAction: this.rowClick,
        colSpan: {
          condition: 'condo',
          column: 'Market Value',
          span: 3,
        },
        export: {
          formatButtons: {
            csv: "Download CSV",
            mailing: "Mailing Labels",
          },
        },
        customClass: {
          table: 'sortable',
          title: 'Sort results',
          th: function(field) {
            let classType = field === 'Price of Last Sale' ? 'sorttable_numeric pointer':
              field === 'Market Value' ? 'sorttable_numeric pointer':
                field === 'Date of Last Sale' ? 'sorttable_ddmm pointer': 'pointer';
            return classType;

          },
          tr: 'pointer',
        },
        fields: [
          {
            label: 'Street Address',
            value: function(state, item) {
              if( state.lastSearchMethod === "buffer search") {
                return titleCase(item.address_std);
              }
              if(item.properties.opa_address != "" && item.properties.opa_address != null) {
                return titleCase(item.properties.opa_address);
              } else if (typeof item.properties.street_address != 'undefined') {
                return titleCase(item.properties.street_address);
              }
              return;
            },
            customStyle: { float: 'left', 'padding-right': '5px' },
            customClass: "testtest",
            mobileIcon: "info-circle",
            hideMobileIcon: (state, item) => typeof state.sources.opa_assessment.targets[item.properties.opa_account_num] != 'undefined' ? true : false ,
          },
          {
            label: 'Market Value',
            value: function(state, item){
              if(state.sources.opa_assessment.targets[item.properties.opa_account_num]){
                if(typeof state.sources.opa_assessment.targets[item.properties.opa_account_num].data != 'undefined') {
                  return formatter.format(state.sources.opa_assessment.targets[item.properties.opa_account_num].data.market_value);
                }
              } else {
                return '';
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
                    this.$data.showTable = true;
                  },
                },
                options: {
                  class: function (state, item) {
                    console.log('calculating button-comp class');
                    return state.sources.opa_assessment.targets[item.properties.opa_account_num] ? "" : 'condo-button';
                  },
                  style: function (state, item) {
                    return state.sources.opa_assessment.targets[item.properties.opa_account_num] ? { display: 'none' } : "";
                  },
                },
              },
            ],
          },
          {
            label: 'Date of Last Sale',
            value: function(state, item) {
              if (item.properties.opa_account_num != ""){
                if (typeof state.sources.opa_assessment.targets[item.properties.opa_account_num] != 'undefined') {
                  // return format(state.sources.opa_assessment.targets[item.properties.opa_account_num].data.sale_date, 'MM/DD/YYYY');
                  return format(parseISO(state.sources.opa_assessment.targets[item.properties.opa_account_num].data.sale_date), 'MM/dd/yyyy');
                }
              } else {
                return "Not Applicable";
              }
            },
            customKey: function(state, item) {
              if (item.properties.opa_account_num != "") {
                if (typeof state.sources.opa_assessment.targets[item.properties.opa_account_num] != 'undefined') {
                  // return format(state.sources.opa_assessment.targets[item.properties.opa_account_num].data.sale_date, 'MM/DD/YYYY');
                  return format(parseISO(state.sources.opa_assessment.targets[item.properties.opa_account_num].data.sale_date), 'MM/dd/yyyy');
                }
                return;

              }
              return 0;

            },
          },
          {
            label: 'Price of Last Sale',
            value: function(state, item) {
              if(item.properties.opa_account_num != ""){
                if(typeof state.sources.opa_assessment.targets[item.properties.opa_account_num] != 'undefined'){
                  return formatter.format(state.sources.opa_assessment.targets[item.properties.opa_account_num].data.sale_price);
                }
              } else {
                return "Not Applicable";
              }
            },
          },
          {
            label: 'Owner',
            value: function(state, item){
              if (item.properties.opa_owners != '' && typeof item.properties.opa_owners != 'undefined') {
                return item.properties.opa_owners.join(', ');
              }
              return item.properties.usps_bldgfirm;

            },
          },
        ],
      };
      return options;
    },

    ownerOptions() {
      const options = {
        id: 'ownerProperties',
        tableid: 'bbb',
        dataSources: [ 'opa_assessment' ],
        mapOverlay: {},
        clickEnabled: true,
        downloadButton: false,
        expandDataDownload: true,
        mailingFields: this.mailingFields,
        tableSort: this.tableSort,
        expandedData: this.expandedData,
        rowAction: this.rowClick,
        colSpan: {
          condition: 'condo',
          column: 'Market Value',
          span: 3,
        },
        export: {
          formatButtons: {
            csv: "Download CSV",
            mailing: "Mailing Labels",
          },
        },
        customClass: {
          table: 'sortable',
          title: 'Sort results',
          th: function(field) {
            let classType = field === 'Price of Last Sale' ? 'sorttable_numeric pointer':
              field === 'Market Value' ? 'sorttable_numeric pointer':
                field === 'Date of Last Sale' ? 'sorttable_ddmmyyyy pointer': 'pointer';
            return classType;

          },
          tr: 'pointer',
        },
        fields: [
          {
            label: 'Street Address',
            value: function(state, item) {
              return titleCase(item.properties.opa_address);
            },
            hideMobileIcon: true,
            customStyle: { float: 'left', 'padding-right': '5px' },
            mobileIcon: "info-circle",
          },
          {
            label: 'Market Value',
            value: function(state, item) {
              // if(state.sources.opa_assessment.targets){}
              return formatter.format(state.sources.opa_assessment.targets[item.properties.opa_account_num.toString()].data.market_value);
            },
          },
          {
            label: 'Date of Last Sale',
            value: function(state, item) {
              // return format(state.sources.opa_assessment.targets[item.properties.opa_account_num].data.sale_date.toString(), 'MM/DD/YYYY');
              return format(parseISO(state.sources.opa_assessment.targets[item.properties.opa_account_num].data.sale_date.toString()), 'MM/dd/yyyy');
            },
            customKey: function(state, item) {
              // return format(state.sources.opa_assessment.targets[item.properties.opa_account_num].data.sale_date.toString(), 'MM/DD/YYYY');
              return format(parseISO(state.sources.opa_assessment.targets[item.properties.opa_account_num].data.sale_date.toString()), 'MM/dd/yyyy');
            },
          },
          {
            label: 'Price of Last Sale',
            value: function(state, item) {
              return formatter.format(state.sources.opa_assessment.targets[item.properties.opa_account_num.toString()].data.sale_price);
            },
          },
          {
            label: 'Owner',
            value: function(state, item){
              if (item.properties.opa_owners != '') {
                return item.properties.opa_owners.join(', ');
              }
              return item.properties.usps_bldgfirm;

            },
          },
        ],
      };
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
        colSpan: {
          condition: 'condo',
          column: 'Market Value',
          span: 3,
        },
        rowAction: this.rowClick,
        export: {
          formatButtons: {
            csv: "Download CSV",
            mailing: "Mailing Labels",
          },
        },
        customClass: {
          table: 'sortable',
          title: 'Sort results',
          th: function(field) {
            let classType = field === 'Price of Last Sale' ? 'sorttable_numeric pointer':
              field === 'Market Value' ? 'sorttable_numeric pointer': 'pointer';

            return classType;

          },
          tr: 'pointer',
        },
        fields: [
          {
            label: 'Street Address',
            value: function(state, item) {
              if(item.unit != null && item.unit != "") {
                return titleCase(item.address_std);
              }
              return titleCase(item.location);

            },
            customStyle: { float: 'left', 'padding-right': '5px' },
            mobileIcon: "info-circle",
            hideMobileIcon: (state, item) => item.condo ? false : true ,
          },
          {
            label: 'Market Value',
            value: function(state, item){
              if(item.market_value != "") {
                return formatter.format(item.market_value);
              }
              return  '';

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
                    return item.condo ? 'condo-button' : "";
                  },
                  style: function (state, item) {
                    return item.condo ? "" : { display: 'none' };
                  },
                },
              },
            ],
          },
          {
            label: 'Date of Last Sale',
            value: function(state, item) {
              if (item.sale_date != "") {
                // return format(item.sale_date, 'MM/DD/YYYY');
                return format(parseISO(item.sale_date), 'MM/dd/yyyy');
              }
              return "Not Applicable";

            },
            customKey: function(state, item) {
              if (item.sale_date != "") {
                // return format(item.sale_date, 'MM/DD/YYYY');
                return format(parseISO(item.sale_date), 'MM/dd/yyyy');
              }
              return 0;

            },
          },
          {
            label: 'Price of Last Sale',
            value: function(state, item) {
              if (item.sale_price != "") {
                return formatter.format(item.sale_price);
              }
              return "Not Applicable";

            },
          },
          {
            label: 'Owner',
            value: function(state, item){
              if (item.owner_1 != "") {
                let owners = item.owner_2 != null ?
                  item.owner_1.trim() + ", " + item.owner_2.trim():
                  item.owner_1.trim();

                return owners;
              }
              return "";

            },
          },
        ],
      };
      return options;
    },
  },
  watch: {
    opaStatus(nextOpaStatus) {
      if (nextOpaStatus === 'success') {
        this.$data.showTable = true;
        this.$data.loadingData = false;
      } else if (nextOpaStatus === 'waiting') {
        this.$data.condoExpanded = false;
        this.$data.loadingData = true;
      } else {
        this.$data.loadingData = false;
      }
    },
  },
  methods: {
    addCondoRecords(state, item) {
      // console.log('addCondoRecords is running, item:', item);

      this.$data.showTable = false;
      let mapUnitIds = function(id) {
        // console.log('running mapUnitIds, id:', id);
        let unitsToAdd = this.$store.state.condoUnits.units[id];
        unitsToAdd.map(
          (item, index) => {
            typeof item.properties != 'undefined' ? item._featureId = item.properties.pwd_parcel_id + "-UNIT-" + index :
              item._featureId = item.pwd_parcel_id + "-UNIT-" + index;
          },
        );
        // console.log("Units to add: ", unitsToAdd)
        return unitsToAdd;
      };
      mapUnitIds = mapUnitIds.bind(this);
      // console.log('after mapUnitIds');
      let unitData;
      if(this.$store.state.lastSearchMethod === "geocode") {
        this.$data.condoExpanded = true;
      } else if(this.$store.state.lastSearchMethod === "reverseGeocode") {
        // console.log("Not shape search, input: ", input)

        this.$controller.dataManager.resetData();
        this.$controller.dataManager.resetShape();
        const input = this.$store.state.parcels.pwd[0].properties.ADDRESS;
        this.$controller.dataManager.clients.condoSearch.fetch(input);

        unitData = mapUnitIds(item._featureId);
        this.$store.commit('setGeocodeRelated', unitData);

        this.$controller.dataManager.fetchData();
      } else {
        let result = this.$store.state.shapeSearch.data.rows.filter(
          row => row._featureId === item._featureId,
        );
        console.log('addCondoRecords is running, last search method is not geocode, result:', result);

        function arrayObjectIndexOf(myArray, searchTerm, property) {
          for(let i = 0, len = myArray.length; i < len; i++) {
            if (myArray[i][property] === searchTerm) {
              return i;
            }
          }
          return -1;
        }

        let units = mapUnitIds(result[0].pwd_parcel_id);
        units.objIndex = arrayObjectIndexOf(this.$store.state.shapeSearch.data.rows, item._featureId, "_featureId" );

        this.$store.commit('setShapeSearchDataPush', units);

        // console.log('this.$controller.dataManager.resetData() is about to run');
        this.$controller.dataManager.resetData();
        this.$controller.dataManager.fetchData();
      }
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
        "OPA Account Number",
      ];

      for ( let sortLabel of tableReorder) {
        fields.move(fields.map(e => e.label).indexOf(sortLabel), 0);
      }

      return fields;

    },
    rowClick(state, item) {
      let coords = [];
      if( typeof this.geocodeItems[0] != 'undefined') {
        Array.prototype.push.apply(coords, [ this.geocodeItems[0].geometry.coordinates[0],this.geocodeItems[0].geometry.coordinates[1] ]);
      } else if (this.lastSearchMethod === "owner search") {
        Array.prototype.push.apply(coords, [ item.geometry.coordinates[0], item.geometry.coordinates[1] ]);
      } else {
        Array.prototype.push.apply(coords, [ item.geocode_lon, item.geocode_lat ]);
      }
      this.$store.commit('setMapZoom', 18);
      this.$store.commit('setMapCenter', coords);
    },
    expandedData() {
      let modalComputed = PropertyCardModal.computed;

      return [
        {
          label: 'Zip Code',
          value: function(state, item) {
            let zip = item.properties ? item.properties.zip_code : item.zip_code.substring(0,5);
            return zip;
          },
        },
        {
          label: 'City',
          value: function() {
            return "Philadelphia";
          },
        },
        {
          label: 'State',
          value: function() {
            return "PA";
          },
        },
        {
          label: 'Improvement Area (SqFt)',
          value: function(state, item) {
            if (state.geocode.status === "success"){
              let obj_id = item.properties.opa_account_num;
              if (item.properties.opa_account_num === ""){
                return "";
              }
              return state.sources.opa_public.targets[obj_id].data.total_livable_area
                .toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                });

            } else if (state.ownerSearch.status === "success") {
              let obj_id = item.properties.opa_account_num;
              if (item.properties.opa_account_num === ""){
                return "";
              }
              return state.sources.opa_public.targets[obj_id].data.total_livable_area
                .toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                });

            }
            let obj_id = item.parcel_number;
            if (obj_id != "") {
              return state.sources.opa_public.targets[obj_id].data.total_livable_area
                .toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                });
            } return "";

          },
        },
        {
          label: 'Land Area (SqFt)',
          value: function(state, item) {
            if (state.geocode.status === "success"){
              let obj_id = item.properties.opa_account_num;
              if (item.properties.opa_account_num === ""){
                return "";
              }
              return state.sources.opa_public.targets[obj_id].data.total_area
                .toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                });

            } else if (state.ownerSearch.status === "success") {
              let obj_id = item.properties.opa_account_num;
              if (item.properties.opa_account_num === ""){
                return "";
              }
              return state.sources.opa_public.targets[obj_id].data.total_area
                .toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                });

            }
            let obj_id = item.parcel_number;
            if (obj_id != "") {
              return state.sources.opa_public.targets[obj_id].data.total_area
                .toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                });
            }  return "";

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
              return condition;
            };
            if (state.geocode.status === "success"){
              let obj_id = item.properties.opa_account_num;
              if (item.properties.opa_account_num === ""){
                return "";
              }
              return cond_code(state.sources.opa_public.targets[obj_id].data.exterior_condition);

            } else if (state.ownerSearch.status === "success") {
              let obj_id = item.properties.opa_account_num;
              if (item.properties.opa_account_num === ""){
                return "";
              }
              return cond_code(state.sources.opa_public.targets[obj_id].data.exterior_condition);

            }
            let obj_id = item.parcel_number;
            if (obj_id != "") {
              return cond_code(state.sources.opa_public.targets[obj_id].data.exterior_condition);
            }  return "";

          },
        },
        {
          label: 'Building Description',
          value: function(state, item) {
            if (state.geocode.status === "success"){
              let obj_id = item.properties.opa_account_num;
              if (item.properties.opa_account_num === ""){
                return "";
              }
              return state.sources.opa_public.targets[obj_id].data.building_code_description;

            } else if (state.ownerSearch.status === "success") {
              let obj_id = item.properties.opa_account_num;
              return state.sources.opa_public.targets[obj_id].data.building_code_description;
            }
            let obj_id = item.parcel_number;
            if (typeof obj_id != 'undefined' && obj_id != "") {
              return state.sources.opa_public.targets[obj_id].data.building_code_description;
            } return "";

          },
        },
        {
          label: 'Homestead Exemption',
          value: function(state, item) {
            if (state.geocode.status === "success"){
              let obj_id = item.properties.opa_account_num;
              if (item.properties.opa_account_num === ""){
                return "";
              }
              return state.sources.opa_public.targets[obj_id].data.homestead_exemption != null ?
                state.sources.opa_public.targets[obj_id].data.homestead_exemption.toLocaleString('en-US', {
                  style: "currency",
                  currency:"USD",
                  minimumFractionDigits: 0,
                }) : 0;

            } else if (state.ownerSearch.status === "success") {
              let obj_id = item.properties.opa_account_num;
              if (item.properties.opa_account_num === "") {
                return "";
              }
              return state.sources.opa_public.targets[obj_id].data.homestead_exemption != null ?
                state.sources.opa_public.targets[obj_id].data.homestead_exemption.toLocaleString('en-US', {
                  style: "currency",
                  currency:"USD",
                  minimumFractionDigits: 0,
                }) : 0;

            }
            let obj_id = item.parcel_number;
            if(typeof obj_id != 'undefined' && obj_id != "") {
              if(state.sources.opa_public.targets[obj_id].data.homestead_exemption != null) {
                return state.sources.opa_public.targets[obj_id].data.homestead_exemption != null ?
                  state.sources.opa_public.targets[obj_id].data.homestead_exemption.toLocaleString('en-US', {
                    style: "currency",
                    currency:"USD",
                    minimumFractionDigits: 0,
                  }) : 0;
              }   return "";
            }  return "";

          },
        },
        {
          label: 'OPA Account Number',
          value: function(state, item) {
            if (state.geocode.status === "success"){
              return item.properties.opa_account_num;
            } else if (state.ownerSearch.status === "success") {
              return item.properties.opa_account_num;
            }
            return item.parcel_number;

          },
        },
        {
          label: 'Zoning Code',
          value: function(state, item){
            let id = [];
            state.geocode.status === "success"?  id =  item.properties.opa_account_num :
              state.ownerSearch.status === "success" ? id =  item.properties.opa_account_num :
                id = item.parcel_number;
            if (typeof id != 'undefined' && id != "") {
              return state.sources.opa_public.targets[id].data.zoning.trim();
            } return "";
          },
        },
        {
          label: 'Zoning Description',
          value: function (state, item) {
            let id = [];
            state.geocode.status === "success"?  id =  item.properties.opa_account_num :
              state.ownerSearch.status === "success" ? id =  item.properties.opa_account_num :
                id = item.parcel_number;
            if (typeof id != 'undefined' && id != "") {
              const code = state.sources.opa_public.targets[id].data.zoning ;
              return helpers.ZONING_CODE_MAP[code.trim()];
            }  return "";
          },
        },
      ];
    },
    mailingFields(state, item, thisDef) {
      const valueOptions = this.$store.state.lastSearchMethod === "shape search" ? this.shapeOptions :
        this.$store.state.lastSearchMethod === "owner search" ? this.ownerOptions :
          this.geocodeOptions;
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
                  owner = titleCase(item.properties.opa_owners.join(' \n '));
              return owner;
            },
          },
          {
            label: 'Street Address',
            value: function(state, item) {
              return valueOptions.fields.filter(item => item.label === 'Street Address')[0].value(state, item);
            },
          },
          {
            label: 'Zip Code',
            value: function(state, item) {
              let zip = item.properties ? item.properties.zip_code : item.zip_code.substring(0,5);
              return 'Philadelphia, PA' + zip;
            },
          },
        ],
      };
    },
  },
};

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
