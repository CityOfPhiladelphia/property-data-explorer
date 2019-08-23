<template>

  <div
    id="app"
    class="grid-y"
  >
    <PhilaHeader :class="this.openModal"
      :app-title="this.$config.app.title"
      :app-tag-line="this.$config.app.tagLine"
      :app-logo="appLogo"
      :app-logo-alt="this.$config.app.logoAlt"
    >
      <div slot="mobile-menu">
        <PhilaFooter
          @howToUseLink="toggleModal()"
        />
      </div>
    </PhilaHeader>
    <property-card-modal></property-card-modal>

    <div :class="'cell medium-auto medium-cell-block-container main-content ' + this.openModal">
      <div :class="this.mapClass">
        <map-panel>
          <intro-page
            v-if="introPage"
            slot="introPage"
            screen-percent="2"
          />
          <cyclomedia-widget
            v-if="this.shouldLoadCyclomediaWidget"
            v-show="cyclomediaActive"
            slot="cycloWidget"
            screen-percent="2"
          />
        </map-panel>
      </div>

      <div
        id="results-summary"
        :class="this.summaryClass"
      >
        <collection-summary
          v-if="this.anySearchStatus === 'success'"
          :options="this.summaryOptions"
          :slots="this.summaryOptions.slots"
        />

        <!-- error -->
        <div v-html="this.errorMessage"
             v-show="this.currentErrorType !== null"
        />
      </div>

      <div :class="this.tableClass + this.openModal">
        <data-panel />
      </div>

    </div>

    <PhilaFooter
      v-show="isLarge"
      @howToUseLink="toggleModal()"
    />

    <popover
      v-if="popoverOpen"
      :options="this.popoverOptions"
      :slots="{'text': this.popoverText}"
    />

  </div>
</template>

<script>
  import { LatLng } from 'leaflet';

  import PhilaHeader from './PhilaHeader.vue';
  import PhilaFooter from './PhilaFooter.vue';

  import MapPanel from './MapPanel.vue';
  import DataPanel from './DataPanel.vue';
  import IntroPage from './IntroPage.vue';
  import PropertyCardModal from './PropertyCardModal.vue';
  import Logo from '@/assets/city-of-philadelphia-logo.png';

  export default {
    components: {
      PhilaHeader,
      PhilaFooter,
      MapPanel,
      DataPanel,
      IntroPage,
      PropertyCardModal,
      CyclomediaWidget: () => import(/* webpackChunkName: "mbmb_pvm_CyclomediaWidget" */'@philly/vue-mapping/src/cyclomedia/Widget.vue'),
      CollectionSummary: () => import(/* webpackChunkName: "pvc_Callout" */'@philly/vue-comps/src/components/CollectionSummary.vue'),
      Popover: () => import(/* webpackChunkName: "mbmb_pvc_Popover" */'@philly/vue-comps/src/components/Popover.vue'),
    },

    props: {
      appLogo: {
        type: String,
        default: Logo,
      }
    },
    data() {
      return {
        publicPath: '@/assets/',
        isLarge: true,
        'top': 3,
        'bottom': 2,
        hasData: false,
        isModalOpen: false,
        introPage: true,
      }
    },
    mounted() {
      this.onResize();
      let query = this.$route.query;
      // console.log('App.vue mounted is running, this.$route.query:', this.$route.query);
      if (query.shape) {
        // this.introPage = false;
        this.$store.commit('setIntroPage', false);
        let shape = query.shape;
        shape = shape.slice(2, shape.length-2);
        shape = shape.split('],[')
        let test = []
        for (let point of shape) {
          test.push(point.split(','))
        }
        let _latlngs = []
        for (let item of test) {
          let latlng = new LatLng(parseFloat(item[0]), parseFloat(item[1]))
          _latlngs.push(latlng)
        }
        const points = { _latlngs }
        this.$controller.getParcelsByPoints(points);
        this.onDataChange('shapeSearch');
      } else if (query.address) {
        // this.introPage = false;
        this.$store.commit('setIntroPage', false);
        // console.log('query.address:', query.address);
        this.$controller.handleSearchFormSubmit(query.address);
        this.onDataChange('geocode');
      } else if (query.owner) {
        // this.introPage = false;
        this.$store.commit('setIntroPage', false);
        // console.log('query.owner:', query.owner);
        this.$controller.handleSearchFormSubmit(query.owner);
        this.onDataChange('ownerSearch');
      } else if (query.buffer) {
        // this.introPage = false;
        this.$store.commit('setIntroPage', false);
        this.$store.commit('setBufferMode', true);
        this.$controller.handleSearchFormSubmit(query.buffer);
        this.onDataChange('bufferSearch');
        this.$store.commit('setLastSearchMethod', 'buffer search');
      }
    },
    created() {
      window.addEventListener('resize', this.onResize);
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.onResize);
    },
    watch: {
      activeModal() {
        this.$controller.activeFeatureChange();
      },
      drawShape(nextDrawShape) {
        if (nextDrawShape !== null) {
          this.onDataChange('shapeSearch');
          this.$controller.getParcelsByDrawnShape();
          this.$store.commit('setShapeSearchStatus', 'waiting');
        }
      },
      geocodeStatus(nextGeocodeStatus) {
        if (nextGeocodeStatus === 'waiting') {
          this.onDataChange('geocode');
        }
      },
      ownerSearchStatus(nextOwnerSearchStatus) {
        if (nextOwnerSearchStatus === 'waiting') {
          this.onDataChange('ownerSearch');
        }
      },
      shouldKeepIntroPage(nextShouldKeepIntroPage) {
        if (nextShouldKeepIntroPage === false) {
          this.$data.introPage = false;
        }
      },
      activeModalFeature(nextActiveModalFeature) {
        // console.log('watch activeModalFeature is firing, nextActiveModalFeature:', nextActiveModalFeature);
        this.$store.commit('setActiveModalFeature', nextActiveModalFeature);
      }
    },
    computed: {
      lastSearchMethod() {
        return this.$store.state.lastSearchMethod;
      },
      activeModal() {
        return this.$store.state.activeModal.featureId
      },
      activeModalFeature() {
        if (!this.activeModal) {
          // console.log('activeModalFeature computed is running but stopping immediately');
          return null
        }
        let state = this.$store.state;
        let feature = null;
        if (['geocode', 'reverseGeocode'].includes(this.lastSearchMethod)) {
          if (state.geocode.related != null && state.geocode.data._featureId != state.activeModal.featureId ) {
            // console.log('first if is running');
            feature = state.geocode.related.filter(object => {
              return object._featureId === state.activeModal.featureId
              // return object._featureId === state.activeFeature.featureId
            })[0];
          } else {
            // console.log('second if is running');
            feature = state.geocode.data;
          }
        } else if (state.lastSearchMethod === 'owner search') {
          feature = state.ownerSearch.data.filter(object => {
            return object._featureId === state.activeModal.featureId
          })[0];
        } else if (['shape search', 'buffer search'].includes(state.lastSearchMethod)) {
          feature = state.shapeSearch.data.rows.filter(object => {
            return object._featureId === state.activeModal.featureId
          })[0];
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
            singular: function(list){ return 'Showing ' + list + ' result'},
            plural: function(list){ return 'Showing ' + list + ' results'},
            pluralizeList: false
          },
          types: [
            {
              value: 1,
              label: ''
            },
          ],
          slots: {
            items: function(state) {
              // return state.dorParcels.data;
              // return state.parcels.dor.data;
              if(state.shapeSearch.data != null) {
                return state.shapeSearch.data.rows
              } else if (state.geocode.data != null && state.geocode.data != "") {
                let geocodeArray = []
                geocodeArray.push(state.geocode.data.properties)
                if(state.geocode.related != null ) {
                  state.geocode.related.map(a => geocodeArray.push(a))
                  return geocodeArray
                } else {
                return geocodeArray
                }
              } else if (state.ownerSearch.data != null) {
                  return state.ownerSearch.data
              }
            }
          }
        }
        return options
      },
      currentErrorType() {
        let error = null
        if (this.anySearchStatus === 'error'){
          error = 'search'
        } else if (this.$store.state.shapeSearch.status === 'too many') {
          error = 'too_many'
        }
        return error;
      },
      errorMessage() {
        let error = this.currentErrorType;
        if (error === 'search') {
          return '<h3>Could not locate records for that address.<h3>';
        } else if (error === 'too_many') {
          return '<h3>Too many parcels selected.  Try again.<h3>';
        }
      },
      drawShape() {
        return this.$store.state.drawShape;
      },
      geocodeStatus() {
        return this.$store.state.geocode.status;
      },
      ownerSearchStatus() {
        return this.$store.state.ownerSearch.status;
      },
      shapeSearchStatus() {
        return this.$store.state.shapeSearch.status;
      },
      anySearchStatus() {
        let statusArray = [this.geocodeStatus, this.ownerSearchStatus, this.shapeSearchStatus];
        let status;
        if (statusArray.includes('waiting')) {
          status = 'waiting';
        } else if (statusArray.includes('success')) {
          status = 'success';
        } else if (statusArray.includes('error')) {
          status = 'error';
        }
        return status
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
      summaryClass() {
        return this.fullScreenMapEnabled ? 'bottom-none': ""
      },
      openModal() {
        // console.log("openModal: ", this.activeModal)
        return this.activeModal != null ? 'modal-opacity' : ""
      },
      shouldKeepIntroPage() {
        if (this.$store.state.sources.opa_assessment.status || this.$store.state.cyclomedia.active) {
          return false;
        } else if (!this.$store.state.introPage) {
          return false;
        } else {
          return true;
        }
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
    methods: {
      onDataChange(type) {
        // console.log('onDataChange, type:', type)
        this.$data.hasData = true;
        this.$store.commit('setFullScreenMapEnabled', false);
        // this.introPage = false;
        this.$store.commit('setIntroPage', false);
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
    }
  };

</script>

<style lang="scss">
@import "@/scss/global.scss";

.toggle-map{
  margin:0 !important;
}
// .main-content{
//   margin-top:.5rem;
// }

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
  height: 100%
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

.bottom-full #data-panel-container #lower-toggle-tab {
  // position: relative;
  top: 87px;
}

.bottom-half #data-panel-container #lower-toggle-tab {
    // add height from #results-summary
    top: calc(60% - 14px) !important;
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

.pvc-export-data-button {
  position: fixed;
  float: right !important;
}

.csv {
  right: 5px !important;
}

.mailing {
  right: 137px !important;
}

// .mailing {
//   left: 125px;
// }

@media print {
  #results-summary {
    display: none;
  }
}


@media screen and (max-width: 750px) {

  #demo-badge {
    top: 25%;
    position: absolute;
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
