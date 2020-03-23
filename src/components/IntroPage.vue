<template>
  <div
    id="intro-container"
    :class="widgetClass"
  >
    <property-card-modal
      v-if="this.$store.state.activeModal.featureId !== null"
      slot="introPage"
      screen-percent="2"
      />
    <div
      v-if="this.$store.state.activeModal.featureId === null"
      class="introduction"
    >
      <div class="intro-blue">
          <i>Use the Property Data Explorer to get information about a property's ownership,
          sales history, value, and physical characteristics. You can also generate address
          listings near a property or within an area of interest.</i>
      </div>
      <h2>To get started, you can: </h2>
      <div class="spacer" />
      <!-- <p>Here are some things you can do with Property Data Explorer:</p> -->
      <!-- <div class="callout"> -->
      <div>
        <ul class="padded-list fa-ul">
          <li> <span class="fa-li"><i class="far fa-hand-rock"></i></span>
            <h4>Select a location on the map</h4>
            Click or tap on a specific property to view details about it.
          </li>
          <li> <span class="fa-li"><i class="fas fa-search"></i></span>
            <h4>Search on property information</h4>
            type an address, owner name, property account number, or
            Department of Records registry map number into the search box.
          </li>
          <li> <span class="fa-li"><i class="fas fa-circle"></i></span>
            <h4>View Properties within a selected radius</h4>
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

import PropertyCardModal from './PropertyCardModal.vue';

export default {
  components: {
    PropertyCardModal,
  },
  computed: {
    map() {
      return this.$store.state.map.map;
    },
    isMobileOrTablet() {
      return this.$store.state.isMobileOrTablet;
    },
    // fullScreenMapEnabled() {
    //   return this.$store.state.fullScreenMapEnabled;
    // },
    // fullScreenTopicsEnabled() {
    //   return this.$store.state.fullScreenTopicsEnabled;
    // },
    widgetClass() {
      // if (this.fullScreenTopicsEnabled) {
      //   return 'medium-12 small-24 full-topics-open'
      // } else {
      return 'medium-24 small-24';
      // }
    },
    sitePath() {
      if (process.env.VUE_APP_PUBLICPATH) {
        return window.location.origin + process.env.VUE_APP_PUBLICPATH;
      }
      return '';
    },
  },
  watch: {
    // fullScreenMapEnabled() {
    //   this.setDivWidth();
    // },
    // fullScreenTopicsEnabled() {
    //   console.log('IntroPage.vue watch fullScreenTopicEnabled is firing');
    // },
  },
  destroyed() {
    // console.log('intro page destroyed is running');
    this.map.invalidateSize();
  },
};

</script>

<style lang="scss">

#intro-container {
  height: 100%
}

.introduction {
  padding: 28px;
  /* height: 95%; */
  overflow-y: auto;
  height: calc(100% - 122px);
}

.intro-blue {
  background: #daedfe;
  padding: 10px;
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

@media screen and (min-width: 750px) {
  .introduction {
    margin: 30px 40px 0 40px;
    .intro-blue {
        margin: 0 0 24px 0;
    }
  }
}

@media screen and (max-width: 750px) {
  .introduction {
    padding: 28px;
    height: auto;
    // height: calc(100vh - 122px);
  }

  // .padded-list {
  //   padding-left: 4px;
  // }
}

.full-topics-open {
  display: none;
}

</style>
