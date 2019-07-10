<template>

  <div
    id="app"
    class="grid-y"
  >
    <PhilaModal
      v-show="isModalOpen"
      @close="closeModal"
    >
      <div slot="body">
        <div class="step-group">
          <div class="step-label">
            1
          </div>
          <div class="step">
            <div class="step-title">
              Step 1
            </div>
            <div class="step-content" />
          </div>
          <div class="step-label">
            2
          </div>
          <div class="step">
            <div class="step-title">
              Step 2
            </div>
            <div class="step-content" />
          </div>
          <div class="step-label">
            3
          </div>
          <div class="step">
            <div class="step-title">
              Step 3
            </div>
            <div class="step-content" />
          </div>
        </div>
      </div>
    </PhilaModal>
    <PhilaHeader :class="this.openModal"
      :app-title="this.$config.app.title"
      :app-tag-line="this.$config.app.tagLine"
      :app-logo="`${publicPath}logo.png`"
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
          <cyclomedia-widget
            v-if="this.shouldLoadCyclomediaWidget"
            v-show="cyclomediaActive"
            slot="cycloWidget"
            screen-percent="2"
          />
        </map-panel>
      </div>

      <div :class="this.tableClass + this.openModal">
        <data-panel />
      </div>

    </div>

    <PhilaFooter
      v-show="isLarge"
      @howToUseLink="toggleModal()"
    />

  </div>
</template>

<script>

  import PhilaHeader from './PhilaHeader.vue';
  import PhilaFooter from './PhilaFooter.vue';
  import PhilaModal from './PhilaModal.vue';

  import MapPanel from './MapPanel.vue';
  import DataPanel from './DataPanel.vue';
  import PropertyCardModal from './PropertyCardModal.vue';

  export default {
    components: {
      PhilaHeader,
      PhilaFooter,
      PhilaModal,
      MapPanel,
      DataPanel,
      PropertyCardModal,
      CyclomediaWidget: () => import(/* webpackChunkName: "mbmb_pvm_CyclomediaWidget" */'@philly/vue-mapping/src/cyclomedia/Widget.vue'),
    },

    data() {
      return {
        publicPath: process.env.BASE_URL,
        isLarge: true,
        'top': 3,
        'bottom': 2,
        hasData: false,
        isModalOpen: false,
      }
    },
    mounted() {
      this.onResize();
      console.log('App.vue mounted is running, this.$route:', this.$route);
    },
    created() {
      window.addEventListener('resize', this.onResize);
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.onResize);
    },
    watch: {
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
    },
    computed: {
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
      fullScreenMapEnabled() {
        return this.$store.state.fullScreenMapEnabled;
      },
      fullScreenTopicsEnabled() {
        return this.$store.state.fullScreenTopicsEnabled;
      },
      activeModal() {
        return this.$store.state.activeModal.featureId
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
      openModal() {
        // console.log("openModal: ", this.activeModal)
        return this.activeModal != null ? 'modal-opacity' : ""
      },
      shouldLoadCyclomediaWidget() {
        return this.$config.cyclomedia.enabled && !this.isMobileOrTablet;
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
        console.log('onDataChange, type:', type)
        this.$data.hasData = true;
        this.$store.commit('setFullScreenMapEnabled', false);
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

th {
  position: sticky;
  top: 0;
  z-index: 2;
}

.pvc-download-data-button, .pvc-export-data-button {
  float: right !important;
  position: sticky;
  padding: 5px;
  z-index: 999;
  margin-top: 2px !important;
  margin-bottom: 0px !important;
  top: 0;
}

.mailing {
  left: 125px;
}

@media screen and (max-width: 750px) {
  .pvc-download-data-button, .pvc-export-data-button {
    visibility: hidden;
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
