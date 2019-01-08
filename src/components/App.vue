<template>
  <div id="app-root">
    <header class="site-header app group">
      <div class="row expanded">
        <div class="columns">
          <a href="//beta.phila.gov" class="logo">
            <img src="https://standards.phila.gov/img/logo/city-of-philadelphia-yellow-white.png" alt="City of Philadelphia">
          </a>
          <div class="app-divide"></div>
          <div class="page-title-container">
            <a href="#/">
              <h1 class="page-title">Property Reboot</h1>
            </a>
          </div>
        </div>
      </div>
    </header>

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
                && this.$store.state.ownerSearch.data.rows !== null"
          :slots="{
            items: function(state) {
              var data = state.ownerSearch.data.rows;
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
  import philaVueComps from '@cityofphiladelphia/phila-vue-comps';
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
      MapPanel,
      VerticalTable,
      HorizontalTable,
      AddressInput,
      Callout,
      Badge,
      BadgeCustom,
      CollectionSummary,
      ExternalLink,
      FullScreenTopicsToggleTabVertical,
    },
    data() {
      return {
        'top': 3,
        'bottom': 2,
      }
    },

    watch: {
      '$store.state.drawShape': function(){this.$controller.geocodeDrawnShape()}
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
          dataSources: ['opa'],
          mapOverlay: {},
          mouseOverDisabled: true,
          fields: [
            {
              label: 'Street Address',
              value: function(state, item, controller) {
                return item.properties.street_address
                // return '<a href=# onclick="'+test+'()">'+item.properties.street_address+' <i class="fa fa-external-link"></i></a>'
              },
            },
            {
              label: 'Owner',
              value: function(state, item){
                return item.properties.opa_owners.toString();
              },
              /* nullValue: 'no date available', */
            },
            {
              label: 'OPA Account',
              value: function(state, item){
                /* return item.permitdescription */
                return item.properties.opa_account_num
              }
            },
            {
              label: 'Status',
              value: function(state, item){
                /* return item.status */
              }
            },
          ],
        }
        return options;
      },
      ownerOptions() {
        const options = {
          id: 'ownerProperties',
          tableid: 'bbb',
          // dataSources: ['opa'],
          mapOverlay: {},
          mouseOverDisabled: true,
          fields: [
            {
              label: 'Street Address',
              value: function(state, item) {
                return item.properties.street_address
              },
            },
            {
              label: 'Owner',
              value: function(state, item){
                return item.properties.opa_owners.toString();
              },
            },
            {
              label: 'OPA Account',
              value: function(state, item){
                return item.properties.opa_account_num
              }
            },
            {
              label: 'Status',
              value: function(state, item){
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
          // dataSources: ['opa'],
          mapOverlay: {},
          mouseOverDisabled: true,
          fields: [
            {
              label: 'Street Address',
              value: function(state, item) {
                return item.location
              },
            },
            {
              label: 'Owner',
              value: function(state, item){
                return item.owner_1.toString();
              },
            },
            {
              label: 'OPA Account',
              value: function(state, item){
                return item.parcel_number
              }
            },
            {
              label: 'Status',
              value: function(state, item){
              }
            },
          ],
        }
        return options;
      },
    },
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
}

.component-label {
  font-size: 20px;
}

.ib {
  display: inline-block;
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

</style>
