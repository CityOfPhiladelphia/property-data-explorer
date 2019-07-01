<template>

  <div
    id="app"
    class="grid-y"
  >
    <PhilaHeader
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

    <div class="cell medium-auto medium-cell-block-container main-content">
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

      <div :class="this.tableClass">
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

  // require("sorttable")
  import PhilaHeader from './PhilaHeader.vue';
  import PhilaFooter from './PhilaFooter.vue';

  import MapPanel from './MapPanel.vue';
  import DataPanel from './DataPanel.vue';
  import PropertyCardModal from './PropertyCardModal.vue';

  export default {
    components: {
      PhilaHeader,
      PhilaFooter,
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
      }
    },
    mounted() {
      this.onResize();
    },
    created() {
      window.addEventListener('resize', this.onResize);
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.onResize);
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
      // '$store.sources.opa_assessment.status': function() {
      //   if(this.$store.sources.opa_assessment.status === 'success'){
      //     this.$data.showTable = true
      //   }
      // },
    },

    computed: {
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
      onResize() {
        if (window.innerWidth > 749) {
          this.$data.isMapVisible = true;
          this.$data.isLarge = true;
        } else {
          this.$data.isLarge = false;
        }
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
  //sass-lint:disable-block no-important
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
// @media screen and (max-width: 749px) {
//   .main-content{
//     margin-top:9rem;
//     margin-bottom:2rem;
//   }
// }
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
//
// #components-root {
//   display: flex;
//   flex-direction:column;
//   height: 90%;
//   overflow-y: auto;
//   position: relative;
// }
//
// .flexing {
//   display: flex;
//   flex: 1;
//   flex-direction: column;
//   position: relative;
// }
//
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

// .component-label {
//   font-size: 20px;
// }
//

a.button {
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

//
// .ib {
//   display: inline-block;
// }

.leaflet-top, .leaflet-bottom {
  z-index: 999 !important;
}

// .margin-sides-20 {
//   display: block;
//   margin-left: 20px;
//   margin-right: 20px;
// }
//
// .margin-20 {
//   margin-left: 20px;
//   margin-right: 20px;
//   margin-bottom: 20px;
// }
//
// .margin-bottom-60 {
//   margin-bottom: 60px !important;
// }
//
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
  position: absolute;
  clear:both;
  z-index: 999;
  display: inline-block;
  top: calc(60% - 5px);
}

.mailing {
  left: 125px;
}



@media screen and (max-width: 750px) {
  .pvc-download-data-button, .pvc-export-data-button {
    visibility: hidden;
  }
}

// @media print, screen and (min-width: 65.625em) {
//   .large-12 {
//     width: 100%;
//   }
// }

</style>
