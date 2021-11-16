<template>
  <div
    id="app"
    class="grid-y"
  >
    <PhilaHeader
      :app-title="'Property'"
      :sub-title="this.$config.app.subtitle"
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

    <div class="cell medium-auto medium-cell-block-container main-content">
      <div :class="mainContentClass">

        <left-panel
          v-show="leftPanel"
          :foundItemsLength="foundItemsLength"
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
        <collection-summary
          v-if="anySearchStatus === 'success'"
          id="collection-summary"
          :options="summaryOptions"
          :slots="summaryOptions.slots"
        />
        <div
          v-if="anySearchStatus === 'success'"
          id="clear-results"
          @click="clearResults"
        >
          <a>
            <u><b> Clear search</b></u>
          </a>
        </div>
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
          })[0];
        } else {
          // console.log('second if is running');
          feature = state.geocode.data;
        }
      } else if (state.lastSearchMethod === 'owner search' || state.lastSearchMethod === 'block search' ) {
        let searchValue = state.lastSearchMethod === 'owner search' ? "ownerSearch" : "blockSearch"
        console.log('in computed activeModalFeature, state.lastSearchMethod:', state.lastSearchMethod, 'searchValue:', searchValue);
        if (state[searchValue].data) {
          feature = state[searchValue].data.filter(object => {
            return object._featureId === state.activeModal.featureId;
          })[0];
        }
      } else if ([ 'shape search', 'buffer search' ].includes(state.lastSearchMethod)) {
        // console.log('App.vue computed activeModalFeature is running after buffer search');
        if (state.shapeSearch.data) {
          feature = state.shapeSearch.data.rows.filter(object => {
            return object._featureId === state.activeModal.featureId;
          })[0];
        }
      }
      console.log('activeModalFeature computed is running, feature:', feature);
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
    foundItemsLength() {
      // console.log('App.vue computed foundItemsLength, this.$store.state.condoUnits.units:', this.$store.state.condoUnits.units);
      if (this.$store.state.shapeSearch.data != null) {
        if (Object.keys(this.$store.state.condoUnits.units).length) {
          return 2;
        }
        return this.$store.state.shapeSearch.data.rows.length;
      } else if (this.$store.state.geocode.data != null && this.$store.state.geocode.data != "") {
        let geocodeArray = [];
        geocodeArray.push(this.$store.state.geocode.data.properties);
        if (this.$store.state.geocode.related != null ) {
          this.$store.state.geocode.related.map(a => geocodeArray.push(a));
          return geocodeArray.length;
        }
        if (this.$store.state.condoUnits.units) {
          // return >1
          return 2;
        }
        return geocodeArray.length;

      } else if (this.$store.state.blockSearch.data != null) {
        if (this.$store.state.condoUnits.units) {
          return 2;
        }
        return this.$store.state.blockSearch.data.length;
      }
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
          singular: function(list, shape) {
            return 'Showing ' + list + ' result.';
          },
          plural: function(list, shape) {
            return 'Showing ' + list + ' results.';
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
            } else if (state.blockSearch.data != null) {
              return state.blockSearch.data;
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
    blockSearchStatus() {
      return this.$store.state.blockSearch.status;
    },
    shapeSearchStatus() {
      return this.$store.state.shapeSearch.status;
    },
    anySearchStatus() {
      let statusArray = [ this.geocodeStatus, this.ownerSearchStatus, this.shapeSearchStatus, this.condoStatus, this.blockSearchStatus ];
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
      if (!this.$store.state.leftPanel) {
        // console.log('App.vue shouldKeepLeftPanel if');
        return false;
      }
      // console.log('App.vue shouldKeepLeftPanel outside if');
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
    opa() {
      return this.$store.state.sources.opa_assessment;
    },
    opaStatus() {
      if (this.opa && this.opa.status) {
        return this.opa.status;
      }
      return null;
    },
  },
  watch: {
    // $route (to, from){
    //   console.log('watch $route, to:', to, 'from:', from);
    //   if (to.fullPath !== from.fullPath) {
    //     this.reactToRoute2()
    //   }
    // },
    geocodeStatus(nextGeocodeStatus) {
      console.log('watch geocodeStatus, nextGeocodeStatus:', nextGeocodeStatus);
      if (nextGeocodeStatus === 'success') {
        let geocodeType;
        if (this.$store.state.geocode.data) {
          geocodeType = this.$store.state.geocode.data.ais_feature_type;
        }
        if (this.foundItemsLength === 1 && this.$store.state.bufferMode === false && geocodeType !== 'intersection') {
          this.onDataChange('oneItem');
        } else {
          this.onDataChange('multiItem');
        }
      }
    },
    blockSearchStatus(nextBlockSearchStatus) {
      console.log('watch blockSearchStatus, nextBlockSearchStatus:', nextBlockSearchStatus);
      if (nextBlockSearchStatus === 'error') {
        console.log('blockSearchError');
        // let geocodeType;
        // if (this.$store.state.geocode.data) {
        //   geocodeType = this.$store.state.geocode.data.ais_feature_type;
        // }
        // if (this.foundItemsLength === 1 && this.$store.state.bufferMode === false && geocodeType !== 'intersection') {
        //   this.onDataChange('oneItem');
        // } else {
        this.onDataChange('multiItem');
        // }
      }
    },
    leftPanel: function(){
      // console.log("intro page watcher: ", this.leftPanel)
      this.leftPanel === false ? this.closeModal() : ""
    },
    activeModal() {
      // console.log('watch activeModal is firing');
      if (this.$store.state.activeModal.featureId !== null) {
        // console.log('open panel - this.$store.state.activeModal.featureId !== null:', this.$store.state.activeModal.featureId);
        this.openLeftPanel(true);
      } else {
        // console.log('close panel - this.$store.state.activeModal.featureId is null:', this.$store.state.activeModal.featureId);
        this.openLeftPanel(false);
      }
    },
    drawShape(nextDrawShape) {
      if (nextDrawShape !== null) {
        this.$controller.handleDrawnShape();
        this.$store.commit('setShapeSearchStatus', 'waiting');
      }
    },
    foundItemsLength(nextFoundItemsLength) {
      console.log('watch foundItemsLength is firing, nextFoundItemsLength:', nextFoundItemsLength, 'lastSearchMethod:', this.lastSearchMethod, 'bufferMode:', this.$store.state.bufferMode);
      if (!nextFoundItemsLength) {
        return;
      }
      let geocodeType;
      if (this.$store.state.geocode.data) {
        geocodeType = this.$store.state.geocode.data.ais_feature_type;
      }
      if (nextFoundItemsLength === 1 && this.$store.state.bufferMode === false && geocodeType !== 'intersection') {
        this.onDataChange('oneItem');
      } else {
        this.onDataChange('multiItem');
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
      console.log('watch activeModalFeature is firing, nextActiveModalFeature:', nextActiveModalFeature);
      if (nextActiveModalFeature) {
        this.$store.commit('setActiveModalFeature', nextActiveModalFeature);
        this.$controller.activeFeatureChange();
      }
    },
  },
  mounted() {
    //Adding this function as an event listener so that it can be used to clear when property modal errors on open as well.
    window.addEventListener("keydown", function(e) {
      return e.keyCode === 27 ? this.closePropertyModal() : "";
    }.bind(this), false);
    window.onpopstate = this.handlePopStateChange;
    this.onResize();
    this.$store.commit('setActiveParcelLayer', 'pwd');
    this.reactToRoute();
  },
  created() {
    window.addEventListener('resize', this.onResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
  methods: {
    // handlePopStateChange() {
    //   console.log('handlePopStateChange');
    // },
    reactToRoute() {
      let query = this.$route.query;
      console.log('App.vue reactToRoute is running, this.$route.query:', this.$route.query);
      if (query.shape) {
        this.$controller.handleDrawnShape();
        this.onDataChange('shapeSearch');
      } else if (query.address) {
        this.closePropertyModal();
        this.$store.commit('setLeftPanel', false);
        // console.log('query.address:', query.address);
        this.$controller.handleSearchFormSubmit(query.address);
        this.onDataChange('geocode');
      } else if (query.owner) {
        this.closePropertyModal();
        this.$store.commit('setLeftPanel', false);
        // console.log('query.owner:', query.owner);
        this.$controller.handleSearchFormSubmit(query.owner);
        this.onDataChange('ownerSearch');
      } else if (query.buffer) {
        this.closePropertyModal();
        this.$store.commit('setLeftPanel', false);
        this.$store.commit('setBufferMode', true);
        this.$controller.handleSearchFormSubmit(query.buffer);
        this.onDataChange('bufferSearch');
        this.$store.commit('setLastSearchMethod', 'buffer search');
      } else if (query.block) {
        this.closePropertyModal();
        this.$store.commit('setLeftPanel', false);
        // console.log('query.owner:', query.owner);
        this.$controller.handleSearchFormSubmit(query.block);
        this.onDataChange('blockSearch');
      } else if (query.p) {
        this.$controller.handleSearchFormSubmit(query.p);
      }
    },
    handlePopStateChange() {
      let query = this.$route.query;
      console.log('App.vue handlePopStateChange is running, this.route:', this.$route, 'this.$route.query:', this.$route.query);
      if (query.shape) {
        this.$controller.handleDrawnShape();
        // this.onDataChange('shapeSearch');
      } else if (query.address) {
        this.closePropertyModal();
        this.$store.commit('setLeftPanel', false);
        let aisAddress = this.$store.state.geocode.data.properties.street_address;
        console.log('handlePopStateChange query.address:', query.address, 'aisAddress:', aisAddress);
        if (query.address !== aisAddress) {
          this.$controller.handleSearchFormSubmit(query.address);
        }
        // this.onDataChange('geocode');
      } else if (query.owner) {
        this.closePropertyModal();
        this.$store.commit('setLeftPanel', false);
        // console.log('query.owner:', query.owner);
        this.$controller.handleSearchFormSubmit(query.owner);
        // this.onDataChange('ownerSearch');
      } else if (query.buffer) {
        this.closePropertyModal();
        this.$store.commit('setLeftPanel', false);
        this.$store.commit('setBufferMode', true);
        this.$controller.handleSearchFormSubmit(query.buffer);
        // this.onDataChange('bufferSearch');
        this.$store.commit('setLastSearchMethod', 'buffer search');
      } else if (query.block) {
        this.closePropertyModal();
        this.$store.commit('setLeftPanel', false);
        console.log('handlePopStateChange, query.block:', query.block);
        this.$controller.handleSearchFormSubmit(query.block);
        // this.onDataChange('blockSearch');
      } else if (query.p) {
        this.$controller.handleSearchFormSubmit(query.p);
      }
    },
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
      this.$store.commit('setLeftPanel', value);
    },
    onDataChange(type) {
      if (type !== 'oneItem') {
        console.log('onDataChange if is running, type:', type)
        this.$data.hasData = true;
        this.$store.commit('setFullScreenMapEnabled', false);
        this.closePropertyModal();
        this.$store.commit('setLeftPanel', false);
        if (this.lastSearchMethod === 'block search') {
          this.$controller.setRouteByBlockSearch(this.$store.state.blockSearch.input);
        } else if (this.lastSearchMethod === 'shape search') {
          this.$controller.setRouteByShapeSearch();
        } else if (this.lastSearchMethod === 'buffer search') {
          this.$controller.setRouteByBufferSearch();
        } else {
          this.$controller.setRouteByGeocode();
        }
      } else {
        console.log('onDataChange else is running, type:', type, 'this.lastSearchMethod:', this.lastSearchMethod);
        if (['shape search', 'buffer search'].includes(this.lastSearchMethod)) {
          this.$store.commit('setActiveFeature', { featureId: 'feat-shape-0' });
          this.$store.commit('setActiveModal', { featureId: 'feat-shape-0' });
          this.$controller.setRouteByOpaNumber(this.$store.state.parcels.pwd[0].properties.BRT_ID);
        } else if (['block search', 'blockSearch'].includes(this.lastSearchMethod)) {
          console.log('onDataChange else is running, type:', type, 'lastSearchMethod is block search');
          this.$store.commit('setActiveFeature', { featureId: 'feat-block-0' });
          this.$store.commit('setActiveModal', { featureId: 'feat-block-0' });
          this.$controller.setRouteByOpaNumber(this.$store.state.blockSearch.data[0].properties.opa_account_num);
        } else {
          console.log('onDataChange else else is running, this.$store.state.geocode.data.properties.opa_account_num:', this.$store.state.geocode.data.properties.opa_account_num);
          this.$store.commit('setActiveFeature', { featureId: 'feat-geocode-0' });
          this.$store.commit('setActiveModal', { featureId: 'feat-geocode-0' });
          if (this.$store.state.geocode.data.properties.opa_account_num) {
            this.$controller.setRouteByOpaNumber(this.$store.state.geocode.data.properties.opa_account_num);
          }
        }
        this.$data.hasData = true;
        this.$store.commit('setFullScreenMapEnabled', true);
        this.$store.commit('setLeftPanel', true);
      }
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
      this.toggleBodyClass('no-scroll');
    },
    showModal() {
      this.toggleBodyClass('no-scroll');
    },
    closeModal() {
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

button {
  cursor: pointer;
}

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
  margin-left: 10px;
  font-size: 14px;
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
    font-family: 'Montserrat';
   h2 {
    font-size: 13px!important;
    letter-spacing: 2.5px;
    font-weight: 200;
   }
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
