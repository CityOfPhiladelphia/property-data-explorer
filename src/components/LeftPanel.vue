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
        spin
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
        Use the Property App to get information about a property's ownership,
        sales history, value, and physical characteristics. You can also generate address
        listings near a property or within a selected area.
      </div>
      <div class="spacer" />
      <h2>To get started, you can: </h2>
      <div>
        <ul class="padded-list fa-ul">
          <li> <span class="fa-li"><i class="fas fa-search"></i></span>
            <h3>Search by using property information</h3>
            <ul>
              <li>Type an address, property account number, or Department of Records registry map number in the search box.</li>
              <li>For inquiries about the specific property, scroll down to the Property Details section and click on &ldquo;submit an official inquiry&rdquo;.</li>
              <li>To find all properties on a block, type &ldquo;block:&rdquo; before the address.</li>
            </ul>
            <p class="red">*Property Search no longer allows searches by owner name due to privacy concerns.</p>
          </li>
          <li> <span class="fa-li"><i class="far fa-hand-rock"></i></span>
            <h3>Select a location on the map</h3>
            <ul>
              <li>Click or tap on a specific property to view details about it.</li>
            </ul>
          </li>
          <li> <span class="fa-li"><i class="fas fa-circle"></i></span>
            <h3>View properties within a selected radius</h3>
            <ul>
              <li>Use this tool to select a point on the map and view details about all properties within a 250-foot radius.</li>
            </ul>
          </li>
          <li> <span class="fa-li"><i class="fas fa-hexagon"></i></span>
            <h3>View properties within drawn boundaries</h3>
            <ul>
              <li>Use this tool to draw a shape on the map and view details about all properties within its boundaries.</li>
            </ul>
          </li>
        </ul>
      </div>
      <div class="spacer" />
      <div class="intro-blue">
        <h2 class="mt-0">Need Additional Help?</h2>
        If the address or property account number does not appear in your search, you can still
        submit an <a target="_blank" href="https://opainquiry.phila.gov/opa.apps/help/PropInq.aspx">official inquiry</a>
        or call OPA at <a href="tel:+12156864334">(215) 686-4334</a> if you:
        <ul class="mb-0">
          <li>Have a property question</li>
          <li>Need to update property or contact information</li>
          <li>Need to correct an error on a property record</li>
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

.inline-block {
  display: inline-block;
}

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

.intro-red {
  color: black;
  // font-weight: bold;
  background: #fed0d0;
  padding: 10px;
}

.intro-blue {
  background: #daedfe;
  padding: 10px;
}

.red {
  color: #cc3000;
  padding-top: 5px;
}

.spacer {
  height: 15px;
}

.introduction {
  a {
    text-decoration: underline;
  }
  h2 {
    font-size: 22px;
    margin-bottom: 0.75rem;
  }
  h3 {
    font-size: 17px;
    margin-bottom: 0.25rem;
  }
  .padded-list > li {
    margin-bottom: 1.25rem;
    > .fa-li {
      font-size: 17px;
      line-height: 1.4;
    }
  }
}

// .padded-list {
//   padding-left: 14px;
//   li {
//     padding: 16px 20px 0 14px;
//   }
//   li:nth-child(4){
//     list-style-image: url("../../public/images/Hexagon.png");
//     }
// }

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
