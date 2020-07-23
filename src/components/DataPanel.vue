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
      v-if="lastSearchMethod === 'owner search'
        || lastSearchMethod === 'block search'"
      :slots="{
        items: function(state) {
          let data = [];
          if (state.lastSearchMethod === 'owner search') {
            data = state.ownerSearch.data;
          } else {
            data = state.blockSearch.data;
          } 
          return data
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

// import PropertyCard from './PropertyCard.vue';

export default {
  components: {
    Callout: () => import(/* webpackChunkName: "pvc_Callout" */'@phila/vue-comps/src/components/Callout.vue'),
    Badge: () => import(/* webpackChunkName: "pvc_Badge" */'@phila/vue-comps/src/components/Badge.vue'),
    BadgeCustom: () => import(/* webpackChunkName: "pvc_BadgeCustom" */'@phila/vue-comps/src/components/BadgeCustom.vue'),
    CollectionSummary: () => import(/* webpackChunkName: "pvc_CollectionSummary" */'@phila/vue-comps/src/components/CollectionSummary.vue'),
    ExternalLink: () => import(/* webpackChunkName: "pvc_ExternalLink" */'@phila/vue-comps/src/components/ExternalLink.vue'),
    FullScreenTopicsToggleTabVertical: () => import(/* webpackChunkName: "pvc_FullScreenTopicsToggleTabVertical" */'@phila/vue-comps/src/components/FullScreenTopicsToggleTabVertical.vue'),
    HorizontalTable: () => import(/* webpackChunkName: "pvc_HorizontalTable" */'@phila/vue-comps/src/components/HorizontalTable.vue'),
    VerticalTable: () => import(/* webpackChunkName: "pvc_VerticalTable" */'@phila/vue-comps/src/components/VerticalTable.vue'),
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
    geocodeStatus() {
      return this.$store.state.geocode.status;
    },
    geocodeItems() {
      let data = [];
      // if (!this.$data.condoExpanded && this.geocode.data && this.$store.state.condoUnits.units && this.$store.state.parcels.pwd && this.$store.state.parcels.pwd[0].properties && this.$store.state.lastSearchMethod === 'geocode') {
      if (!this.$data.condoExpanded && this.geocode.data && this.$store.state.condoUnits.units && this.$store.state.parcels.pwd && this.$store.state.parcels.pwd[0].properties) {
      // if (this.geocode.data && this.$store.state.condoUnits.units && this.$store.state.parcels.pwd && this.$store.state.parcels.pwd[0].properties) {
        // console.log('in geocodeItems, in if');
        const parentCondo = this.geocode.data;
        for (let i in parentCondo.properties) {
          parentCondo.properties[i] = "";
        }
        if (this.$store.state.condoUnits.units[this.$store.state.parcels.pwd[0].properties.PARCELID]) {
          parentCondo.properties.opa_owners = [ "Condominium (" + this.$store.state.condoUnits.units[this.$store.state.parcels.pwd[0].properties.PARCELID].length + " Units)" ];
        }
        parentCondo.properties.street_address = this.$store.state.parcels.pwd[0].properties.ADDRESS;
        parentCondo.properties.opa_address = this.$store.state.parcels.pwd[0].properties.ADDRESS;
        parentCondo.properties.pwd_parcel_id = this.$store.state.parcels.pwd[0].properties.PARCELID;
        parentCondo._featureId = this.$store.state.parcels.pwd[0].properties.PARCELID;
        // parentCondo.condo = true;
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
            csv: {text: ' Download CSV', icon: 'download'},
            mailing: {text: "Mailing Labels", icon: 'envelope'}
          },
        },
        customClass: {
          table: 'sortable',
          title: 'Sort results',
          th: function(field) {
            let classType = field === 'Price of Last Sale' ? 'sorttable_numeric pointer':
              field === 'Market Value' ? 'sorttable_numeric pointer':
                field === 'Date of Last Sale' ? 'sorttable_numeric pointer': 'pointer';
            return classType;

          },
          tr: 'pointer',
        },
        fields: [
          {
            label: 'Street Address',
            shouldBeBold: true,
            value: function(state, item) {
              let address;
              if( state.lastSearchMethod === "buffer search") {
                address = titleCase(item.address_std);
              } else if (typeof item.properties.street_address != 'undefined') {
                address = titleCase(item.properties.street_address);
              } else if(item.properties.opa_address != "" && item.properties.opa_address != null) {
                address = titleCase(item.properties.opa_address);
              }
              return address;
            },
            customStyle: { float: 'left', 'padding-right': '5px' },
            customClass: "address-field faux-link",
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
                    // console.log("button finished running")
                    this.$data.showTable = true;
                  },
                },
                options: {
                  class: function (state, item) {
                    // console.log('calculating button-comp class, item.properties.opa_account_num:', item.properties.opa_account_num, typeof state.sources.opa_assessment.targets[item.properties.opa_account_num]);
                    // return state.sources.opa_assessment.targets[item.properties.opa_account_num] ? "" : 'condo-button';
                    if (typeof state.sources.opa_assessment.targets[item.properties.opa_account_num] != 'undefined') {
                      return '';
                    } else {
                      return 'condo-button';
                    }
                  },
                  style: function (state, item) {
                    // return state.sources.opa_assessment.targets[item.properties.opa_account_num] ? { display: 'none' } : "";
                    if (typeof state.sources.opa_assessment.targets[item.properties.opa_account_num] != 'undefined') {
                      return { display: 'none' };
                    } else {
                      return '';
                    }
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
                  if (state.sources.opa_assessment.targets[item.properties.opa_account_num].data.sale_date != null) {
                  return format(parseISO(state.sources.opa_assessment.targets[item.properties.opa_account_num].data.sale_date), 'MM/dd/yyyy');
                  } else {
                    return "Not Applicable"
                  }
                }
              } else {
                return "Not Applicable"
              }
            },
            customKey: function(state, item) {
              if (item.properties.opa_account_num != "") {
                if (typeof state.sources.opa_assessment.targets[item.properties.opa_account_num] != 'undefined') {
                  // console.log(state.sources.opa_assessment.targets[item.properties.opa_account_num].data.sale_date);
                  return format(parseISO(state.sources.opa_assessment.targets[item.properties.opa_account_num].data.sale_date), 'yyyyMMdd');
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
                  if(state.sources.opa_assessment.targets[item.properties.opa_account_num].data.sale_price != null) {
                    return formatter.format(state.sources.opa_assessment.targets[item.properties.opa_account_num].data.sale_price);
                  } else {
                    return "Not Applicable"
                  }
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
      const rowClick = this.rowClick;
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
            csv: {text: ' Download CSV', icon: 'download'},
            mailing: {text: "Mailing Labels", icon: 'envelope'}
          },
        },
        customClass: {
          table: 'sortable',
          title: 'Sort results',
          th: function(field) {
            let classType = field === 'Price of Last Sale' ? 'sorttable_numeric pointer':
              field === 'Market Value' ? 'sorttable_numeric pointer':
                field === 'Date of Last Sale' ? 'sorttable_numeric pointer': 'pointer';
            return classType;

          },
          tr: 'pointer',
        },
        fields: [
          {
            label: 'Street Address',
            customClass: "address-field faux-link",
            value: function(state, item) {
              // console.log(item.properties)
              return titleCase(item.properties.opa_address);
            },
            hideMobileIcon: true,
            customStyle: { float: 'left', 'padding-right': '5px' },
            mobileIcon: "info-circle",
          },
          {
            label: 'Market Value',
            value: function(state, item){
              if(state.sources.opa_assessment.targets[item.properties.opa_account_num]){
                if(typeof state.sources.opa_assessment.targets[item.properties.opa_account_num].data != 'undefined') {
                      return formatter.format(state.sources.opa_assessment.targets[item.properties.opa_account_num.toString()].data.market_value);
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
                    // console.log("button finished running")
                    this.$data.showTable = true;
                  },
                },
                options: {
                  class: function (state, item) {
                    // console.log('calculating button-comp class, item.properties.opa_account_num:', item.properties.opa_account_num, typeof state.sources.opa_assessment.targets[item.properties.opa_account_num]);
                    // return state.sources.opa_assessment.targets[item.properties.opa_account_num] ? "" : 'condo-button';
                    if (typeof state.sources.opa_assessment.targets[item.properties.opa_account_num] != 'undefined') {
                      return '';
                    } else {
                      return 'condo-button';
                    }
                  },
                  style: function (state, item) {
                    // return state.sources.opa_assessment.targets[item.properties.opa_account_num] ? { display: 'none' } : "";
                    if (typeof state.sources.opa_assessment.targets[item.properties.opa_account_num] != 'undefined') {
                      return { display: 'none' };
                    } else {
                      return '';
                    }
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
                  // console.log(item.properties.opa_account_num, state.sources.opa_assessment.targets[item.properties.opa_account_num] )
                  // return format(state.sources.opa_assessment.targets[item.properties.opa_account_num].data.sale_date, 'MM/DD/YYYY');
                  return format(parseISO(state.sources.opa_assessment.targets[item.properties.opa_account_num].data.sale_date.toString()), 'MM/dd/yyyy');
                }
              } else {
                return "Not Applicable";
              }
            },
            customKey: function(state, item) {
              if (item.properties.opa_account_num != "") {
                if (typeof state.sources.opa_assessment.targets[item.properties.opa_account_num] != 'undefined') {
                  // console.log(state.sources.opa_assessment.targets[item.properties.opa_account_num].data.sale_date);
                  return format(parseISO(state.sources.opa_assessment.targets[item.properties.opa_account_num].data.sale_date.toString()), 'yyyyMMdd');
                }
                return;

              }
              return 0;

            },
          },

          // {
          //   label: 'Date of Last Sale',
          //   value: function(state, item) {
          //     // return format(state.sources.opa_assessment.targets[item.properties.opa_account_num].data.sale_date.toString(), 'MM/DD/YYYY');
          //     return format(parseISO(state.sources.opa_assessment.targets[item.properties.opa_account_num].data.sale_date.toString()), 'MM/dd/yyyy');
          //   },
          //   customKey: function(state, item) {
          //     // return format(state.sources.opa_assessment.targets[item.properties.opa_account_num].data.sale_date.toString(), 'MM/DD/YYYY');
          //     return format(parseISO(state.sources.opa_assessment.targets[item.properties.opa_account_num].data.sale_date.toString()), 'yyyyMMdd');
          //   },
          // },


          {
            label: 'Price of Last Sale',
            value: function(state, item) {
              if(item.properties.opa_account_num != ""){
                if(typeof state.sources.opa_assessment.targets[item.properties.opa_account_num] != 'undefined'){
                   return formatter.format(state.sources.opa_assessment.targets[item.properties.opa_account_num.toString()].data.sale_price);
                }
              } else {
                return "Not Applicable";
              }
            },
          },

          // {
          //   label: 'Price of Last Sale',
          //   value: function(state, item) {
          //     return formatter.format(state.sources.opa_assessment.targets[item.properties.opa_account_num.toString()].data.sale_price);
          //   },
          // },
          {
            label: 'Owner',
            value: function(state, item){
              if (item.properties.opa_owners != '') {
                return item.properties.opa_owners.lrength > 1 ? item.properties.opa_owners.join(', ') : item.properties.opa_owners;
              }
              return item.properties.usps_bldgfirm;
            },
            components: [
              {
                type: 'button-comp',
                slots: {
                  buttonAction(state, item) {event.stopPropagation(), rowClick(state, item) },
                  text: function(state){
                    let buttonClass = state.lastSearchMethod === 'block search' ? '<i class="fas fa-location-arrow hide"></i>' : '<i class="fas fa-location-arrow"></i>'
                    return buttonClass
                  },
                },
                options: {
                  stopClickedChange: true,
                  class: "owner-locate-button",
                },
              },
            ],
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
            csv: {text: ' Download CSV', icon: 'download'},
            mailing: {text: "Mailing Labels", icon: 'envelope'}
          },
        },
        customClass: {
          table: 'sortable',
          title: 'Sort results',
          th: function(field) {
            let classType = field === 'Price of Last Sale' ? 'sorttable_numeric pointer':
              field === 'Market Value' ? 'sorttable_numeric pointer':
                field === 'Date of Last Sale' ? 'sorttable_numeric pointer': 'pointer';
            return classType;

          },
          tr: 'pointer',
        },
        fields: [
          {
            label: 'Street Address',
            customClass: "address-field faux-link",
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
              if (item.sale_date != "" && item.sale_date != null) {
                // return format(item.sale_date, 'MM/DD/YYYY');
                return format(parseISO(item.sale_date), 'MM/dd/yyyy');
              }
              return "Not Applicable";

            },
            customKey: function(state, item) {
              if (item.sale_date != "" && item.sale_date != null) {
                // console.log(   format(parseISO(item.sale_date), 'yyyyMMdd')  );
                return format(parseISO(item.sale_date), 'yyyyMMdd');
              }
              return 0;

            },
          },
          {
            label: 'Price of Last Sale',
            value: function(state, item) {
              if (item.sale_price != "" && item.sale_price != null) {
                return formatter.format(item.sale_price);
              }
              return "Not Applicable";

            },
          },
          {
            label: 'Owner',
            value: function(state, item){
              if (item.owner_1 != "" && item.owner_1 != null) {
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
        // this.$data.condoExpanded = false;
        this.$data.loadingData = true;
      } else {
        this.$data.loadingData = false;
      }
    },
    geocodeStatus(nextGeocodeStatus) {
      if (nextGeocodeStatus === 'waiting') {
        this.$data.condoExpanded = false;
      }
    }
  },
  methods: {
    activeOpaId(state, item) {
      let opaId;
      if(item.condo) {
        opaId = "";
        } else {
          if (![ 'geocode', 'reverseGeocode', 'owner search' ].includes(this.lastSearchMethod)) {
            opaId = item.parcel_number;
          } else {
            opaId = item.properties.opa_account_num;
          }
      }
      return opaId;
    },
    opaPublicData(state, item) {
      return typeof state.sources.opa_public.targets[this.activeOpaId(state, item)] === 'undefined' ? "" :
             state.sources.opa_public.targets[this.activeOpaId(state, item)].data;
    },
    addCondoRecords(state, item) {
      // console.log('addCondoRecords is running, item:', item);

      this.$data.showTable = false;
      this.$data.condoExpanded = true;
      let mapUnitIds = function(id) {
        // console.log('running mapUnitIds, id:', id, this.$store.state.condoUnits.units[id]);
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
      // console.log('after mapUnitIds', item);
      let unitData;
      if (this.$store.state.lastSearchMethod === 'block search') {
          let result = this.$store.state.blockSearch.data.filter(
          row => row._featureId === item._featureId,
        );
      // console.log("block button: ", item, "result: ", result);

      function arrayObjectIndexOf(myArray, searchTerm, property) {
          for(let i = 0, len = myArray.length; i < len; i++) {
            if (myArray[i][property] === searchTerm) {
              return i;
            }
          }
          return -1;
      }

      let units = mapUnitIds(result[0].properties.pwd_parcel_id);
      // console.log("arrayObjectIndexOf: ", this.$store.state.blockSearch.data, item._featureId );
      units.objIndex = arrayObjectIndexOf(this.$store.state.blockSearch.data, item._featureId, "_featureId" );

      // console.log("mapped unit id's: ", units);
      this.$store.commit('setBlockSearchDataPush', units);
      this.$controller.dataManager.resetData();
      this.$controller.dataManager.fetchData();


      } else if (this.$store.state.lastSearchMethod === 'geocode') {
        this.$controller.dataManager.resetData();
        this.$data.condoExpanded = true;
        const input = this.$store.state.parcels.pwd[0].properties.ADDRESS;
        this.$controller.dataManager.clients.condoSearch.fetch(input);
        unitData = mapUnitIds(item._featureId);
        // console.log('in addCondoRecords, lastSearchMethod = geocode');
        this.$store.commit('setGeocodeRelated', unitData);
        this.$controller.dataManager.fetchData();
      } else if (this.$store.state.lastSearchMethod === 'reverseGeocode' ) {
      // if (this.$store.state.lastSearchMethod === 'reverseGeocode' || this.$store.state.lastSearchMethod === 'geocode') {
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
      // console.log("Row Click")
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
      // let modalComputed = PropertyCard.computed;
      let opaPublicData = this.opaPublicData;

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
            let livable_area = opaPublicData(state, item).total_livable_area
            if (typeof livable_area === 'undefined' | livable_area === ""){
              return "";
            } else {
               return livable_area.toLocaleString('en-US', {
                        maximumFractionDigits: 0,
                      });;
            }
          },
        },
        {
          label: 'Land Area (SqFt)',
          value: function(state, item) {
            let total_area = opaPublicData(state, item).total_area
            if (typeof total_area === 'undefined' | total_area === ""){
              return "";
            } else {
               return total_area.toLocaleString('en-US', {
                        maximumFractionDigits: 0,
                      });;
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
              return condition;
            };
            let exterior = opaPublicData(state, item).exterior_condition
            if (typeof exterior != 'undefined' && exterior != "") {
              return cond_code(exterior);
            } return "";
          },
        },
        {
          label: 'Building Description',
          value: function(state, item) {
            let description = opaPublicData(state, item).building_code_description
            if (typeof description != 'undefined' && description != "") {
              return description;
            } return "";
          },
        },
        {
          label: 'Homestead Exemption',
          value: function(state, item) {
            let homestead = opaPublicData(state, item).homestead_exemption
            if (typeof homestead != 'undefined' && homestead != "" ) {
              return homestead != null ?
                      homestead.toLocaleString('en-US', {
                        style: "currency",
                        currency:"USD",
                        minimumFractionDigits: 0,
                      }) : "";
            } return ""
          },
        },
        {
          label: 'OPA Account Number',
          value: function(state, item) {
            // console.log("line 761 item: ", item)
            if(typeof item.parcel_number != 'undefined') {
              return item.parcel_number
            } else {
              return item.properties.opa_account_num
            }

            // if (state.geocode.status === "success"){
            //   console.log("line 761 item: ", item)
            //   return item.properties.opa_account_num;
            // } else if (state.ownerSearch.status === "success") {
            //   return item.properties.opa_account_num;
            // }
            // return item.parcel_number;

          },
        },
        {
          label: 'Year Built',
          value: function(state, item){
              let yearBuilt = opaPublicData(state, item).year_built;
              if(typeof yearBuilt != 'undefined' && yearBuilt != ""){
                yearBuilt = yearBuilt === '0000'? 'Not Available' :
                            yearBuilt === null? 'Not Available' :
                            yearBuilt + (opaPublicData(state, item).year_built_estimate ? ' (estimated)' : '');
                return yearBuilt
              } return ''
          },
        },
        {
          label: 'Number of Stories',
          value: function(state, item){
            let opaPublicDataResult = opaPublicData(state, item);
            if(typeof opaPublicDataResult != 'undefined' && opaPublicDataResult != ""){
              return  opaPublicDataResult.number_stories === null ? "Not Available" :
                      opaPublicDataResult.number_stories.toString().length > 0 ?
                      opaPublicDataResult.number_stories === 0 ?
                      opaPublicDataResult.total_livable_area > 0 ? 'Not Available':
                      'None' :
                      opaPublicDataResult.number_stories === 1 ? '1 story' :
                      (opaPublicDataResult.number_stories + ' stories') : ''
            } return ''
          },
        },
        {
          label: 'Rooms',
          value: function(state, item){
            let rooms = opaPublicData(state, item).number_of_rooms;
            rooms = !(opaPublicData(state, item).total_livable_area > 0) ? 'None' :
                       typeof rooms === 'undefined' | rooms === null  ? 'Not Available' :
                       rooms;
            return rooms
            },
        },
        {
          label: 'Bedrooms',
          value: function(state, item){
            let bedrooms = opaPublicData(state, item).number_of_bedrooms;
            bedrooms = !(opaPublicData(state, item).total_livable_area > 0) ? 'None' :
                       typeof bedrooms === 'undefined' | bedrooms === null  ? 'Not Available' :
                       bedrooms;
            return bedrooms
            },
        },
        {
          label: 'Bathrooms',
          value: function(state, item){
            let bathrooms = opaPublicData(state, item).number_of_bathrooms;
            bathrooms = !(opaPublicData(state, item).total_livable_area > 0) ? 'None' :
                        typeof bathrooms === 'undefined' | bathrooms === null  ? 'Not Available' :
                bathrooms;
            return bathrooms
          },
        },
        {
            label: 'Features',
            value: function(state, item) {
              let basements, fireplaces, garages, buildings, view;
              let features = [];

              switch (opaPublicData(state, item).basements) {
              case null: basements= null;
                break;
              case '0': basements= null;
                break;
              case 'A': basements = 'Full Finished basement';
                break;
              case 'B': basements = 'Full Semi-finished basement';
                break;
              case 'C': basements = 'Full Unfinished basement';
                break;
              case 'D': basements = 'Full basement';
                break;
              case 'E': basements = 'Finished partial basement';
                break;
              case 'F': basements = 'Semi-finished partial basement';
                break;
              case 'G': basements = 'Unfinished partial basement';
                break;
              case 'H': basements = 'Partial basement';
                break;
              case 'I': basements = 'Finished basement';
                break;
              case 'J': basements = 'Unfinished basement';
                break;
              }

              fireplaces = opaPublicData(state, item).fireplaces === 1 ?
                opaPublicData(state, item).fireplaces + ' fireplace' :
                opaPublicData(state, item).fireplaces === 0 |
                opaPublicData(state, item).fireplaces === null |
                typeof opaPublicData(state, item).fireplaces === 'undefined' ? null :
                opaPublicData(state, item).fireplaces + ' fireplaces ';

              switch (opaPublicData(state, item).garage_type) {
              case null : garages = null;
                break;
              case '0' : garages = null;
                break;
              case 'A': garages = 'Built-in/Basement garage';
                break;
              case 'B': garages = 'Attached garage';
                break;
              case 'C': garages = 'Detached garage';
                break;
              case 'F': garages = 'Converted garage';
                break;
              case 'S': garages = 'Self-park garage';
                break;
              case 'T': garages = 'Attendant parking';
                break;
              }

              switch (opaPublicData(state, item).view_type) {
              case '0': view = null;
                break;
              case 'A': view = 'View of cityscape/skyline';
                break;
              case 'B': view = 'View of river/creek';
                break;
              case 'C': view = 'View of park/green area';
                break;
              case 'D': view = 'View of commercial area';
                break;
              case 'E': view = 'View of industrial area';
                break;
              case 'H': view = 'View of historic edifice or landmark';
                break;
              case 'I': view = null;
                break;
              case null : view = null;
                break;
              }

              garages = opaPublicData(state, item).garage_spaces === 1 ?
                garages + ' (' + opaPublicData(state, item).garage_spaces + ' space)' :
                opaPublicData(state, item).garage_spaces === 0 |
                opaPublicData(state, item).garage_spaces === null |
                typeof opaPublicData(state, item).garage_spaces === 'undefined'? null :
                  garages + ' (' + opaPublicData(state, item).garage_spaces + ' spaces)';

              let toPush = [basements, fireplaces, garages, view];
              toPush.map(a => a != null ? features.push(a):'');
              return features.length === 0 ? 'None' : features.length === 1 ? features : features.join(', ');
          },
        },
        {
          label: 'Heating and Utilities',
          value: function(state, item){


              let heat = [];

              switch (opaPublicData(state, item).fuel) {
              case 'A' : heat.push('Natural gas heating');
                break;
              case 'B' : heat.push('Oil fuel heating');
                break;
              case 'C' : heat.push('Electric heating');
                break;
              case 'D' : heat.push('Coal heating');
                break;
              case 'E' : heat.push('Solar heating');
                break;
              case 'F' : heat.push('Woodstove heating');
                break;
              case 'G' : null;
                break;
              case 'H' : null;
                break;
              case null : null;
                break;
              }

              switch (opaPublicData(state, item).type_heater) {
              case 'A' : heat.push('Duct (heated air) heaters');
                break;
              case 'B' : heat.push('Radiator/baseboard (heated water) heaters');
                break;
              case 'C' : heat.push('Baseboard (electric) heaters');
                break;
              case 'D' : null;
                break;
              case 'E' : null;
                break;
              case 'F' : heat.push('Woodstove heating');
                break;
              case 'G' : heat.push('Radiant heaters');
                break;
              case 'H' : null;
                break;
              case null : null;
                break;
              }

              opaPublicData(state, item).central_air === 'Y' ? heat.push('Has central air') : null;
              opaPublicData(state, item).sewer === 'Y' ? heat.push( 'City sewer') : null;

              let heatOutput = [];
              heat.map(a => a != null ? heatOutput.push(a):'');
              return heatOutput.length === 0 ? '' : heatOutput.length === 1 ? heatOutput : heatOutput.join(', ');

              return heat.join('<br>');

          },
        },
        {
          label: 'Frontage',
          value: function(state, item) {
            let frontage =  opaPublicData(state, item).frontage === null ? 'Not Available ' :
              typeof opaPublicData(state, item).frontage === 'undefined' ? 'Not Available ' :
              opaPublicData(state, item).frontage.toFixed(0) + ' ft';
            return frontage
          },
        },
        {
          label: 'Beginning Point',
          value: function(state, item) {
            let point = opaPublicData(state, item).beginning_point;
            return point === null ? "":
              typeof point === 'undefined' ? "":
                point.replace(/"/g, '""').trim()
          },
        },
        {
          label: 'Zoning Code',
          value: function(state, item){
            let id = [];
            if(typeof item.parcel_number != 'undefined') {
              id = item.parcel_number
            } else {
              id =  item.properties.opa_account_num
            }
            // state.geocode.status === "success"?  id =  item.properties.opa_account_num :
            //   state.ownerSearch.status === "success" ? id =  item.properties.opa_account_num :
            //     id = item.parcel_number;
            if (typeof state.sources.opa_public.targets[id] != 'undefined' && id != "") {
              return state.sources.opa_public.targets[id].data.zoning.trim();
            } return "";
          },
        },
        {
          label: 'Zoning Description',
          value: function (state, item) {
            let id = [];
         if(typeof item.parcel_number != 'undefined') {
              id = item.parcel_number
            } else {
              id =  item.properties.opa_account_num
            }
            // state.geocode.status === "success"?  id =  item.properties.opa_account_num :
            //   state.ownerSearch.status === "success" ? id =  item.properties.opa_account_num :
            //     id = item.parcel_number;
            if (typeof state.sources.opa_public.targets[id] != 'undefined' && id != "") {
              const code = state.sources.opa_public.targets[id].data.zoning ;
              return helpers.ZONING_CODE_MAP[code.trim()];
            }  return "";
          },
        },
        {
          label: 'Ward',
          value: function(state, item) {
            return opaPublicData(state, item).political_ward;
          },
        },
        {
          label: 'Ward Division',
          value: function(state, item) {
            return opaPublicData(state, item).political_district;
          },
        },
        {
          label: 'Council District',
          value: function(state, item) {
            return opaPublicData(state, item).council_district_2016;
          },
        },
        {
          label: 'Elementary School',
          value: function(state, item) {
            return opaPublicData(state, item).elementary_school;
          },
        },
        {
          label: 'Middle School',
          value: function(state, item) {
            return opaPublicData(state, item).middle_school;
          },
        },
        {
          label: 'High School',
          value: function(state, item) {
            return opaPublicData(state, item).high_school;
          },
        },
        {
          label: 'Police District',
          value: function(state, item) {
            return opaPublicData(state, item).police_district;
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

<style lang="scss">

.faux-link {
  cursor: pointer;
  color: color(dark-ben-franklin);
  font-weight: bold;
  div{
    text-decoration: underline !important
  }
}

@media print {
  #data-panel-container {
    display: none;
  }
}

.address-field .popover-link {
  border-bottom: 1px solid;
  color: #0f4d90;
}

a.button.owner-locate-button {
  float: right;
  color: #444;
  background-color: transparent;
  padding: 2px 3px 2px 5px;
}

.data-panel.container {
  justify-content: center;
}

.hide {
  display: none;
}

.spinner-div {
  padding-top: 40px;
  padding-bottom: 20px;
  text-align: center;
}

</style>
