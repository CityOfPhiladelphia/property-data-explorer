<template>
  <div
    id="app"
    class="grid-y"
  >
    <PhilaHeader
      :app-title="this.$config.app.title"
      :app-logo="appLogo"
      :app-logo-alt="this.$config.app.logoAlt"
    >
      <div slot="mobile-menu">
        <PhilaFooter
          @howToUseLink="toggleModal()"
        />
      </div>
    </PhilaHeader>

    <owner-search-modal />

    <!-- <div :class="'cell medium-auto medium-cell-block-container main-content'"> -->
    <div class="cell medium-auto medium-cell-block-container main-content">
      <div :class="mainContentClass">

        <left-panel
          v-show="leftPanel"
        />

        <map-panel>
          <cyclomedia-widget
            v-if="shouldLoadCyclomediaWidget"
            v-show="cyclomediaActive"
            slot="cycloWidget"
            :orientation="this.$config.cyclomedia.orientation"
            screen-percent="2"
          />

        </map-panel>

      </div>

      <div
        id="results-summary"
        :class="summaryClass"
      >
        <!-- error -->
        <div
          v-show="currentErrorType !== null"
          v-html="errorMessage"
        />
        <div
          v-if="anySearchStatus === 'success'"
          id="clear-results"
          @click="clearResults"
        >
          <a>
            <i class="fa fa-times-circle" />
          </a>
        </div>
        <collection-summary
          v-if="anySearchStatus === 'success'"
          id="collection-summary"
          :options="summaryOptions"
          :slots="summaryOptions.slots"
        />
      </div>

      <div :class="tableClass">
        <data-panel />
      </div>
    </div>

    <PhilaFooter
      v-show="isLarge"
      @howToUseLink="toggleModal()"
    />

    <popover
      v-if="popoverOpen"
      :options="popoverOptions"
      :slots="{'text': popoverText}"
    />
  </div>
</template>

<script>
import { LatLng } from 'leaflet';

import PhilaHeader from './PhilaHeader.vue';
import PhilaFooter from './PhilaFooter.vue';
import MapPanel from './MapPanel.vue';
import DataPanel from './DataPanel.vue';
import LeftPanel from './LeftPanel.vue';
import OwnerSearchModal from './OwnerSearchModal.vue';
import Logo from '@/assets/city-of-philadelphia-logo.png';

export default {
  components: {
    PhilaHeader,
    PhilaFooter,
    MapPanel,
    DataPanel,
    LeftPanel,
    OwnerSearchModal,
    CyclomediaWidget: () => import(/* webpackChunkName: "mbmb_pvm_CyclomediaWidget" */'@phila/vue-mapping/src/cyclomedia/Widget.vue'),
    CollectionSummary: () => import(/* webpackChunkName: "pvc_Callout" */'@phila/vue-comps/src/components/CollectionSummary.vue'),
    Popover: () => import(/* webpackChunkName: "mbmb_pvc_Popover" */'@phila/vue-comps/src/components/Popover.vue'),
  },

  props: {
    appLogo: {
      type: String,
      default: Logo,
    },
  },
  data() {
    return {
      publicPath: '@/assets/',
      isLarge: true,
      'top': 3,
      'bottom': 2,
      hasData: false,
      isModalOpen: false,
      leftPanel: true,
    };
  },
  computed: {
    lastSearchMethod() {
      return this.$store.state.lastSearchMethod;
    },
    activeModal() {
      return this.$store.state.activeModal.featureId;
    },
    activeModalFeature() {
      if (!this.activeModal) {
        // console.log('activeModalFeature computed is running but stopping immediately');
        return null;
      }
      let state = this.$store.state;
      let feature = null;
      if ([ 'geocode', 'reverseGeocode' ].includes(this.lastSearchMethod)) {
        if (state.geocode.related != null && state.geocode.data._featureId != state.activeModal.featureId ) {
          // console.log('first if is running');
          feature = state.geocode.related.filter(object => {
            return object._featureId === state.activeModal.featureId;
            // return object._featureId === state.activeFeature.featureId
          })[0];
        } else {
          // console.log('second if is running');
          feature = state.geocode.data;
        }
      } else if (state.lastSearchMethod === 'owner search') {
        feature = state.ownerSearch.data.filter(object => {
          return object._featureId === state.activeModal.featureId;
        })[0];
      } else if ([ 'shape search', 'buffer search' ].includes(state.lastSearchMethod)) {
        feature = state.shapeSearch.data.rows.filter(object => {
          return object._featureId === state.activeModal.featureId;
        })[0];
      }
      // console.log('activeModalFeature computed is running, feature:', feature);
      return feature;
    },
    popoverOpen() {
      return this.$store.state.popover.open;
    },
    popoverText() {
      return this.$store.state.popover.text;
    },
    popoverOptions() {
      return this.$store.state.popover.options;
    },
    summaryOptions() {
      const options = {
        // dataSources: ['opa_assessment'],
        descriptor: 'parcel',
        // this will include zero quantities
        // includeZeroes: true,
        getValue: function(item) {
          if(item){
            return 1;
          }
        },
        context: {
          singular: function(list) {
            return list + ' result. Select address for details.';
          },
          plural: function(list) {
            return list + ' results. Select address for details.';
          },
          pluralizeList: false,
        },
        types: [
          {
            value: 1,
            label: '',
          },
        ],
        slots: {
          items: function(state) {
            // return state.dorParcels.data;
            // return state.parcels.dor.data;
            if(state.shapeSearch.data != null) {
              return state.shapeSearch.data.rows;
            } else if (state.geocode.data != null && state.geocode.data != "") {
              let geocodeArray = [];
              geocodeArray.push(state.geocode.data.properties);
              if(state.geocode.related != null ) {
                state.geocode.related.map(a => geocodeArray.push(a));
                return geocodeArray;
              }
              return geocodeArray;

            } else if (state.ownerSearch.data != null) {
              return state.ownerSearch.data;
            }
          },
        },
      };
      return options;
    },
    currentErrorType() {
      let error = null;
      if (this.anySearchStatus === 'error'){
        error = 'search';
      } else if (this.$store.state.shapeSearch.status === 'too many') {
        error = 'too_many';
      } else if ( typeof this.$store.state.geocode.data != 'undefined' &&
                    this.$store.state.geocode.data != null &&
                    this.$store.state.geocode.data.ais_feature_type === 'intersection') {
        error = 'intersection';
      } else if (this.anySearchStatus === 'condoWaiting') {
        error = 'condoWaiting';
      }
      return error;
    },
    errorMessage() {
      let error = this.currentErrorType;
      let returnValue;
      // console.log('error: ', error)
      if (error === 'search' | error === 'intersection') {
        returnValue = '<h3>No account found matching that address or owner.<h3>';
      } else if (error === 'too_many') {
        returnValue = '<h3>Too many parcels selected.  Try again.<h3>';
      } else if (error === 'condoWaiting') {
        returnValue = '<h3>Collecting condo data.  Please wait.<h3>';
      }
      return returnValue;
    },
    drawShape() {
      return this.$store.state.drawShape;
    },
    geocodeStatus() {
      return this.$store.state.geocode.status;
    },
    condoStatus() {
      return this.$store.state.condoUnits.status;
    },
    ownerSearchStatus() {
      return this.$store.state.ownerSearch.status;
    },
    ownerSearchTotal() {
      return this.$store.state.ownerSearch.total_size
    },
    shapeSearchStatus() {
      return this.$store.state.shapeSearch.status;
    },
    anySearchStatus() {
      let statusArray = [ this.geocodeStatus, this.ownerSearchStatus, this.shapeSearchStatus, this.condoStatus ];
      let status;
      if (statusArray.includes('waiting')) {
        if (this.condoStatus === 'waiting') {
          status = 'condoWaiting'
        } else {
          status = 'waiting';
        }
      } else if (statusArray.includes('success')) {
        status = 'success';
      } else if (statusArray.includes('error')) {
        status = 'error';
      }
      return status;
    },
    fullScreenMapEnabled() {
      return this.$store.state.fullScreenMapEnabled;
    },
    fullScreenTopicsEnabled() {
      return this.$store.state.fullScreenTopicsEnabled;
    },
    mainContentClass() {
      return this.fullScreenMapEnabled ? 'top-full cell medium-auto grid-x':
        this.fullScreenTopicsEnabled ? 'top-none cell medium-auto grid-x':
          'top-half cell medium-auto grid-x';
    },
    tableClass() {
      return this.fullScreenMapEnabled ? 'bottom-none medium-auto':
        this.fullScreenTopicsEnabled? 'bottom-full medium-auto':
          'bottom-half medium-auto';
    },
    summaryClass() {
      return this.fullScreenMapEnabled ? 'bottom-none': "";
    },
    shouldKeepLeftPanel() {
      if (this.$store.state.sources.opa_assessment.status || this.$store.state.cyclomedia.active) {
        console.log('App.vue shouldKeepLeftPanel first if');
        return false;
      } else if (!this.$store.state.leftPanel) {
        console.log('App.vue shouldKeepLeftPanel second if');
        return false;
      }
      console.log('App.vue shouldKeepLeftPanel neither if');
      return true;

    },
    shouldLoadCyclomediaWidget() {
      return this.$config.cyclomedia.enabled;
      // return this.$config.cyclomedia.enabled && !this.isMobileOrTablet;
    },
    cyclomediaActive() {
      return this.$store.state.cyclomedia.active;
    },
    cycloLatlng() {
      if (this.$store.state.cyclomedia.orientation.xyz !== null) {
        const xyz = this.$store.state.cyclomedia.orientation.xyz;
        return [ xyz[1], xyz[0] ];
      }
      const center = this.$config.map.center;
      return center;

    },
    cycloRotationAngle() {
      return this.$store.state.cyclomedia.orientation.yaw * (180/3.14159265359);
    },
    cycloHFov() {
      return this.$store.state.cyclomedia.orientation.hFov;
    },
  },
  watch: {
    '$route': function(route) {
      // return route.fullPath === '/' ? this.$store.commit('setLeftPanel', true) : "";
      return route.fullPath === '/' ? this.openLeftPanel(true) : this.openLeftPanel(false);
    },
    leftPanel: function(){
      console.log("intro page watcher: ", this.leftPanel)
      this.leftPanel === false ? this.closeModal() : ""
    },
    activeModal() {
      this.$controller.activeFeatureChange();
      this.$store.state.activeModal.featureId !== null ? this.openLeftPanel(true): this.openLeftPanel(false);
    },
    drawShape(nextDrawShape) {
      if (nextDrawShape !== null) {
        this.onDataChange('shapeSearch');
        this.$controller.handleDrawnShape();
        this.$store.commit('setShapeSearchStatus', 'waiting');
      }
    },
    geocodeStatus(nextGeocodeStatus) {
      if (nextGeocodeStatus === 'waiting') {
        this.onDataChange('geocode');
      }
    },
    ownerSearchTotal(newValue) {
      if( newValue > this.$store.state.ownerSearch.data.length ){
        this.$store.commit('setOwnerSearchModal', true);
      }
    },
    ownerSearchStatus(nextOwnerSearchStatus) {
      if (nextOwnerSearchStatus === 'waiting') {
        this.onDataChange('ownerSearch');
      }
    },
    shouldKeepLeftPanel(nextShouldKeepLeftPanel) {
      if (nextShouldKeepLeftPanel === false) {
        // console.log('in watch shouldKeepLeftPanel if, next:', nextShouldKeepLeftPanel);
        this.$data.leftPanel = false;
      }
    },
    activeModalFeature(nextActiveModalFeature) {
      // console.log('watch activeModalFeature is firing, nextActiveModalFeature:', nextActiveModalFeature);
      this.$store.commit('setActiveModalFeature', nextActiveModalFeature);
    },
  },
  mounted() {

  //Adding this function as an event listener so that it can be used to clear when property modal errors on open as well.
  window.addEventListener("keydown", function(e) {
    return e.keyCode === 27 ? this.closePropertyModal() : "";
    }.bind(this), false);

    this.onResize();
    this.$store.commit('setActiveParcelLayer', 'pwd');
    let query = this.$route.query;
    // console.log('App.vue mounted is running, this.$route.query:', this.$route.query);
    if (query.shape) {
      // this.leftPanel = false;
      // this.$store.commit('setLeftPanel', false);
      // let shape = query.shape;
      // shape = shape.slice(2, shape.length-2);
      // shape = shape.split('],[');
      // let test = [];
      // for (let point of shape) {
      //   test.push(point.split(','));
      // }
      // let _latlngs = [];
      // for (let item of test) {
      //   let latlng = new LatLng(parseFloat(item[0]), parseFloat(item[1]));
      //   _latlngs.push(latlng);
      // }
      // const points = { _latlngs };
      this.$controller.handleDrawnShape();
      // this.$controller.getParcelsByPoints(points);
      this.onDataChange('shapeSearch');
    } else if (query.address) {
      // this.leftPanel = false;
      this.closePropertyModal();
      this.$store.commit('setLeftPanel', false);
      // console.log('query.address:', query.address);
      this.$controller.handleSearchFormSubmit(query.address);
      this.onDataChange('geocode');
    } else if (query.owner) {
      // this.leftPanel = false;
      this.closePropertyModal();
      this.$store.commit('setLeftPanel', false);
      // console.log('query.owner:', query.owner);
      this.$controller.handleSearchFormSubmit(query.owner);
      this.onDataChange('ownerSearch');
    } else if (query.buffer) {
      // this.leftPanel = false;
      this.closePropertyModal();
      this.$store.commit('setLeftPanel', false);
      this.$store.commit('setBufferMode', true);
      this.$controller.handleSearchFormSubmit(query.buffer);
      this.onDataChange('bufferSearch');
      this.$store.commit('setLastSearchMethod', 'buffer search');
    }
  },
  // beforeMount(){
  //   return this.$store.state.isMobileOrTablet ? this.$store.commit('setLeftPanel', false) : "";
  // },
  created() {
    window.addEventListener('resize', this.onResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
  methods: {
    closePropertyModal() {
      this.$store.state.activeModal.featureId = null;
      this.$store.commit('setActiveFeature', null);
      this.$nextTick(() => {
        this.$store.state.map.map.invalidateSize();
      });
    },
    openLeftPanel(value){
      console.log('App.vue openLeftPanel is running, value:', value);
      this.$data.leftPanel = value
      this.$store.commit('setFullScreenMapEnabled', value);
      // value = true ? this.$store.commit('setCyclomediaActive', false ): "";
      return this.$store.commit('setLeftPanel', value)
    },
    onDataChange(type) {
      // console.log('onDataChange, type:', type)
      this.$data.hasData = true;
      this.$store.commit('setFullScreenMapEnabled', false);
      // this.leftPanel = false;
      this.closePropertyModal();
      this.$store.commit('setLeftPanel', false);
    },
    clearResults(){
      this.$controller.handleSearchFormSubmit('');
      // console.log("Clear Results", this)
      const prevFullScreenMapEnabled = this.$store.state.FullScreenMapEnabled;
      const nextFullScreenMapEnabled = !prevFullScreenMapEnabled;
      this.$store.commit('setFullScreenMapEnabled', nextFullScreenMapEnabled);
    },
    onResize() {
      if (window.innerWidth > 749) {
        this.$data.isMapVisible = true;
        this.$data.isLarge = true;
      } else {
        this.$data.isLarge = false;
      }
    },
    toggleModal() {
      this.isModalOpen = !this.isModalOpen;
      this.toggleBodyClass('no-scroll');
    },
    showModal() {
      this.isModalOpen = true;
      this.toggleBodyClass('no-scroll');
    },
    closeModal() {
      this.isModalOpen = false;
      this.toggleBodyClass('no-scroll');
    },
    toggleBodyClass(className) {
      const el = document.body;
      return this.isOpen ? el.classList.add(className) : el.classList.remove(className);
    },
  },
};

</script>

<style lang="scss">
@import "@/scss/global.scss";

.toggle-map{
  margin:0 !important;
}

.main-content{
  position: relative;
}

.top-full {
  position: relative;
  top: 0;
  bottom: 0;
}


//TODO, move to standards
@each $value in $colors {
  .#{nth($value, 1)} {
    color: nth($value, 2) !important;
  }
  .bg-#{nth($value, 1)} {
    background-color: nth($value, 2) !important;
  }
  .bdr-#{nth($value, 1)} {
    border-color: nth($value, 2) !important;
  }
}

.no-scroll{
  overflow: hidden;
  height: 100vh;
}
.toggle-map{
  position: fixed;
  bottom:0;
  width: 100%;
  z-index: 900;
}

.step-group{
  margin-left:$spacing-medium;

  .step-label {
    @include secondary-font(400);
    display: inline-block;
    margin-left: -$spacing-medium;
    background: black;
    border-radius: $spacing-extra-large;
    color:white;
    padding: 0 $spacing-small;
    width:$spacing-large;
    height:$spacing-large;
    line-height: $spacing-large;
    text-align: center;
  }
  .step{
    margin-top: -$spacing-large;
    padding-left: $spacing-large;
    padding-bottom: $spacing-large;
    border-left:1px solid black;

    &:last-of-type {
      border:none;
    }

    .step-title{
      @include secondary-font(400);
      font-size:1.2rem;
      margin-bottom: $spacing-small;
    }
  }
}

#app {
  height: 100%;
}

#clear-results {
  display: inline-block !important;
  margin-right: 10px;
}

#collection-summary {
  display: inline-block !important;
}

#data-panel-container .pvc-horizontal-table .pvc-horizontal-table-body .stack>thead>tr>th {
  position: sticky;
  top: -2px !important;
  z-index: 2;
  border-left:1px solid white;
}

#results-summary{
  height: 45px;
  padding: 8px 0px  0px 10px;
  margin: 0 2px 0 2px;
  background-color: #f0f0f0;
  border-style: solid;
  border-color: #0f4d90;
  border-width: 2px 0 0 0 ;
}

// .bottom-half #data-panel-container #lower-toggle-tab {
//   // position: fixed;
//   top: calc(60% - 10px);
// }

// .bottom-full #data-panel-container #lower-toggle-tab {
//   // position: relative;
//   top: 87px;
// }

.bottom-half #data-panel-container #lower-toggle-tab {
    // add height from #results-summary
    top: calc(60% - 25px) !important;
}

.logo {
  line-height: 4em;
  padding-left: 10px;
  width: auto;
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

.condo-button {
  background-color: #5555;
  height: 100%;
  width: 100%;
  text-transform: unset;
  font-family: "Open Sans", Helvetica, Roboto, Arial, sans-serif;
  font-weight: 600;
  padding: 10.5px 0 10.5px 0;
}

.fa-times-circle{
  margin-bottom: 2px;
}

.leaflet-top, .leaflet-bottom {
  z-index: 999 !important;
}

.modal-opacity {
  opacity: 0.2;
}

.pvc-horizontal-table-controls {
  margin-bottom: 0 !important;
}

.pvc-horizontal-table-body {
  padding-top: 0 !important;
  margin-top: 0 !important;
}

.pointer {
  cursor: pointer;
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

.bottom-half #data-panel-container .pvc-horizontal-table .pvc-horizontal-table-body .pvc-export-data-button {
  clear:both;
  z-index: 999;
  top: calc(60% - 7px);
  // right: 70px;
}
.bottom-full #data-panel-container .pvc-horizontal-table .pvc-horizontal-table-body .pvc-export-data-button {
  clear:both;
  z-index: 999;
  top: 93px;
}

@media print {

  .grid-y.medium-grid-frame#application {
    overflow: visible;
  }

  #map-panel-container {
    overflow: visible;
  }

  #results-summary {
    display: none;
  }

  @page {
    margin-top: .5in;
    size: 8.5in 11in;
  }

}


@media screen and (max-width: 750px) {

  #map-panel-container {
    height: 400px;
  }

  #cyclomedia-container {
    height: 200px
  }


  .main-content{
    position: inherit;
  }

  .pl-alert {
    height: 100% !important;
  }

  .pl-alert-body {
    width: 100% !important;
  }

  .pl-alert-close-button {
  color: lightgrey !important;

  }

  #demo-badge {
    top: 25%;
    width: max-content;
  }

  #demo-container {
    padding-left: 15px;
    position: relative;
  }


  .pvc-download-data-button, .pvc-export-data-button {
    visibility: hidden;
    // clear:both;
    // z-index: 999;
    // top: 393px;
  }

  .leaflet-draw-actions {
      left: 42px !important;
  }

  .logo {
    margin-top: auto;
    margin-bottom: auto;
  }

  .app-header .cell .shrink {
    width: 100%;
  }

  .app-divide {
    margin-bottom: 0;
    border: none;
  }

  .app-title {
    max-width: 150px;
  }

  .mobile-menu-content {
    position: fixed;
    bottom: 0;
    width: 100%;
  }

  #results-summary{
    height: 35px;
    padding: 8px 0px  0px 10px;
    margin: 0 2px 0 2px;
    color: rgb(15, 77, 144);
    background-color: #cfcfcf;
    border-style: solid;
    border-color: #0f4d90;
    border-width: 1px 0 1px 0 ;
  }


  thead {
    display: none;
  }

  td {
    clear: both;
    border: none !important;
  }

  th {
    border: 1px solid white !important;
    font-size: unset !important;
  }

  tbody th, tbody td {
    padding: 0.28571rem 0.35714rem 0.35714rem;
  }

  td div svg {
    float: right
  }

}

.step-group{
  margin-left:$spacing-medium;

  .step-label {
    @include secondary-font(400);
    display: inline-block;
    margin-left: -$spacing-medium;
    background: black;
    border-radius: $spacing-extra-large;
    color:white;
    padding: 0 $spacing-small;
    width:$spacing-large;
    height:$spacing-large;
    line-height: $spacing-large;
    text-align: center;
  }
  .step{
    margin-top: -$spacing-large;
    padding-left: $spacing-large;
    padding-bottom: $spacing-large;
    border-left:1px solid black;

    &:last-of-type {
      border:none;
    }

    .step-title{
      @include secondary-font(400);
      font-size:1.2rem;
      margin-bottom: $spacing-small;
    }
  }
}

</style>
