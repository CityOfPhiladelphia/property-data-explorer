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
          v-if="this.$store.state.lastSearchMethod === 'geocode'"
          padding-top="0"
          :slots="{
            items: geocodeItems
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
  import axios from 'axios';
  import MapPanel from './MapPanel.vue';
  import * as philaVueComps from '@cityofphiladelphia/phila-vue-comps';
  import moment from 'moment';
  import PropertyCardModal from './PropertyCardModal.vue';
  import transforms from '../general/transforms';
  const titleCase = transforms.titleCase.transform;
  const VerticalTable = philaVueComps.VerticalTable;
  const HorizontalTable = philaVueComps.HorizontalTable;
  const AddressInput = philaVueComps.AddressInput;
  const Callout = philaVueComps.Callout;
  const Badge = philaVueComps.Badge;
  const BadgeCustom = philaVueComps.BadgeCustom;
  const CollectionSummary = philaVueComps.CollectionSummary;
  const ExternalLink = philaVueComps.ExternalLink;
  const FullScreenTopicsToggleTabVertical = philaVueComps.FullScreenTopicsToggleTabVertical;

  export default {
    components: {
      AddressInput,
      Callout,
      Badge,
      BadgeCustom,
      CollectionSummary,
      ExternalLink,
      FullScreenTopicsToggleTabVertical,
      HorizontalTable,
      MapPanel,
      PropertyCardModal,
      VerticalTable,
    },
    data() {
      return {
        'top': 3,
        'bottom': 2,
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
        console.log(this.$store.state.ownerSearch.status)
        if(this.$store.state.ownerSearch.status === 'success') {
          this.$controller.geocodeOwnerSearch()
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
          expandedData: this.expandedData,
          export: {
            formatButtons: {
              csv: "Download CSV",
              mailing: "Mailing Labels"
            }
          },
          expandDataDownload: true,
          expandedData: this.expandedData,
          fields: [
            {
              label: 'Street Address',
              value: function(state, item, controller) {
                return titleCase(item.properties.opa_address)
                // return '<a href=# onclick="'+test+'()">'+item.properties.street_address+' <i class="fa fa-external-link"></i></a>'
              },
            },
            {
              label: 'Market Value',
              value: function(state, item){
                return state.sources.opa_assessment.targets[item.properties.opa_account_num].data.market_value
                      .toLocaleString('en-US', {
                          style: "currency",
                          currency:"USD",
                          minimumFractionDigits: 0
                      });
              },
            },
            {
              label: 'Date of Last Sale',
              value: function(state, item) {
                return moment(state.sources.opa_assessment.targets[item.properties.opa_account_num].data.sale_date)
                      .format('MM/DD/YYYY')
              },
            },
            {
              label: 'Price of Last Sale',
              value: function(state, item) {
                return state.sources.opa_assessment.targets[item.properties.opa_account_num].data.sale_price
                      .toLocaleString('en-US',{
                            style: "currency",
                            currency:"USD",
                            minimumFractionDigits: 0
                      });
              },
            },
            {
              label: 'Owner',
              value: function(state, item){
                return item.properties.opa_owners.toString();
              },
              /* nullValue: 'no date available', */
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
          expandedData: this.expandedData,
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
                return state.sources.opa_assessment.targets[item.properties.opa_account_num.toString()].data.market_value
                      .toLocaleString('en-US',{
                        style: "currency",
                        currency:"USD",
                        minimumFractionDigits: 0
                      });
              },
            },
            {
              label: 'Date of Last Sale',
              value: function(state, item) {
                return moment(state.sources.opa_assessment.targets[item.properties.opa_account_num].data.sale_date.toString())
                      .format('MM/DD/YYYY')
              },
            },
            {
              label: 'Price of Last Sale',
              value: function(state, item) {
                return state.sources.opa_assessment.targets[item.properties.opa_account_num.toString()].data.sale_price
                      .toLocaleString('en-US',{
                        style: "currency",
                        currency:"USD",
                        minimumFractionDigits: 0
                      });
              },
            },
            {
              label: 'Owner',
              value: function(state, item){
                return item.properties.opa_owners.toString();
              },
            },
          ],
        }
        return options;
      },
      shapeOptions() {
        const options = {
          id: 'ownerProperties',
          tableid: 'ccc',
          // dataSources: ['opa'],
          mapOverlay: {},
          clickEnabled: true,
          // downloadButton: true,
          expandDataDownload: true,
          expandedData: this.expandedData,
          export: {
            formatButtons: {
              csv: "Download CSV",
              mailing: "Mailing Labels"
            }
          },
          fields: [
            {
              label: 'Street Address',
              value: function(state, item) {
                return titleCase(item.location)
              },
            },
            {
              label: 'Market Value',
              value: function(state, item){
                return item.market_value.toLocaleString('en-US',{
                      style: "currency",
                      currency:"USD",
                      minimumFractionDigits: 0
                });
              },
            },
            {
              label: 'Date of Last Sale',
              value: function(state, item) {
                return moment(item.sale_date).format('MM/DD/YYYY')
              },
            },
            {
              label: 'Price of Last Sale',
              value: function(state, item) {
                return item.sale_price.toLocaleString('en-US',{
                      style: "currency",
                      currency:"USD",
                      minimumFractionDigits: 0
                });
              },
            },
            {
              label: 'Owner',
              value: function(state, item){
                let owners = item.owner_2.length > 1 ?
                             titleCase(item.owner_1.trim()) + ", " + titleCase(item.owner_2.trim()):
                             titleCase(item.owner_1.trim())

                return owners
              },
            },
          ],
        }
        return options;
      },
    },
    methods: {
      expandedData() {
        const expandedData = {
          fields: [
            {
              label: 'Street Address',
              value: function(state, item) {
                return titleCase(item.location)
              },
            },
          ],
        };
        console.log("expandedData is working");
        return expandedData;
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
