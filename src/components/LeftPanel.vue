<template>
  <div
    id="intro-container"
    class="small-24 small-order-2 medium-12 medium-order-1"
  >
    <!-- v-show="loadingData" -->
    <div
      v-show="this.$store.state.activeModal.featureId != null && !activeAddressKnown || condoUnitsStatus == 'waiting'"
      class="loading-mask"
    >
      <font-awesome-icon
        icon="spinner"
        size="6x"
        aria-hidden="true"
      />
    </div>

    <property-card
      v-show="this.$store.state.activeModal.featureId !== null"
      :foundItemsLength="foundItemsLength"
    />

    <div
      v-if="this.$store.state.activeModal.featureId === null"
      class="introduction"
    >

      <div class="intro-blue">
          <i>Use the Property App to get information about a property's ownership,
          sales history, value, and physical characteristics. You can also generate address
          listings near a property or within an area of interest.</i>
      </div>
      <h2>To get started, you can: </h2>
      <div class="spacer" />
      <!-- <p>Here are some things you can do with Property:</p> -->
      <!-- <div class="callout"> -->
      <div>
        <ul class="padded-list fa-ul">
          <li> <span class="fa-li"><i class="far fa-hand-rock"></i></span>
            <h4>Select a location on the map</h4>
            Click or tap on a specific property to view details about it.
          </li>
          <li> <span class="fa-li"><i class="fas fa-search"></i></span>
            <h4>Search on property information</h4>
            Type an address, property account number, or
            Department of Records registry map number into the search box.
            Enter "block:" before the address to find all properties on the block.
            <p class="red">*Property Search is no longer allowing Search By Owner due to privacy concerns.</p>
          </li>
          <li> <span class="fa-li"><i class="fas fa-circle"></i></span>
            <h4>View properties within a selected radius</h4>
            Use this tool to select a point on the map and view details about all
            properties within a 250-foot radius.
          </li>
          <li>
            <h4>View properties within drawn boundaries</h4>
            Use this tool to draw a shape on the map and view details about all
            properties within its boundaries.
          </li>
        </ul>
      </div>
    </div>

  </div>
</template>

<script>

import PropertyCard from './PropertyCard.vue';

export default {
  components: {
    PropertyCard,
  },
  props: {
    foundItemsLength: {
      type: Number,
      default: 1,
    },
  },
  computed: {
    condoUnitsStatus() {
      return this.$store.state.condoUnits.status;
    },
    loadingData() {
      return this.$store.state.loadingData;
    },
    activeAddressKnown() {
      return this.$store.state.activeAddressKnown;
    },
    map() {
      return this.$store.state.map.map;
    },
    isMobileOrTablet() {
      return this.$store.state.isMobileOrTablet;
    },
    sitePath() {
      if (process.env.VUE_APP_PUBLICPATH) {
        return window.location.origin + process.env.VUE_APP_PUBLICPATH;
      }
      return '';
    },
  },
  destroyed() {
    // console.log('intro page destroyed is running');
    // this.map.invalidateSize();
    this.$store.map.resize();
  },
};

</script>

<style lang="scss">

.warning {
  display: flex;
  div.icon {
    margin-top: auto;
    margin-bottom: auto;
  }
  .fa-exclamation-triangle{
    margin-right: 10px;
  }
}

#intro-container {
  height: 100%;
}

.loading-mask {
  /*display: inline;*/
  position: absolute;
  top: 0;
  height: 450%;
  width: 100%;
  background: rgba(0, 0 ,0 , 0.5);
  z-index: 1000;
  text-align: center;
  vertical-align: middle;
  padding-top: 250px;
}

// .introduction {
//   overflow-y: auto;
//   top: 0;
//   bottom: 0;
//   position: absolute;
//   // height: calc(100% - 122px);
// }

.intro-blue {
  background: #daedfe;
  padding: 10px;
}

.red {
  color: red;
  padding-top: 5px;
}

.spacer {
  height: 15px;
}

.padded-list {
  padding-left: 14px;
  li {
    padding: 16px 20px 0 14px;
  }
  li:nth-child(4){
    list-style-image: url("../../public/images/Hexagon.png");
    }
}

@media print {
  #intro-container {
    overflow-y: visible;
  }
  .grid-x > #intro-container.medium-12 {
    width: 100%;
  }
  #ownerProperties, #salesHistory {
   thead>tr,  tbody>tr  {
      display: revert;
      td, th {
        display: revert;
      }
    }

  }
}

@media screen and (min-width: 750px) {
  #intro-container {
    position: relative;
      overflow-y: auto;
  }
  .introduction {
    padding: 38px 46px 0 46px;
    .intro-blue {
        margin: 0 0 24px 0;
    }
  }
}

@media screen and (max-width: 750px) {
  .introduction {
    padding: 28px 28px 0 28px;
  }

  // .padded-list {
  //   padding-left: 4px;
  // }
}

.full-topics-open {
  display: none;
}

</style>
