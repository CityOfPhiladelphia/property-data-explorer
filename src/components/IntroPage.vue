<template>
  <div
    id="intro-container"
    :class="widgetClass + ' introduction'"
  >
    <h2>Welcome to the new Property Data Explorer for the City of Philadelphia</h2>
    <div class="spacer" />
    <!-- <p>Here are some things you can do with Property Data Explorer:</p> -->
    <!-- <div class="callout"> -->
    <div>
      Search for one or more properties to
      <ul class="padded-list">
        <li>Get information about property ownership, value, and physical characteristics.</li>
        <li>Look up the history of sales and assessments for a property.</li>
        <li>Quickly compare properties on a block or within a nearby area.</li>
        <li>Generate address listings near a property or within an area of interest.</li>
        <li> Find properties anywhere in the city owned by an individual or company.</li>
      </ul>
    </div>
    <div>
      To get started, you can
      <ul class="padded-list">
        <li>Click anywhere on the map.</li>
        <li>Use <i class="fas fa-circle" /> to search near a property or <i class="fas fa-hexagon" /> to draw an area.</li>
        <li>Type an address, owner name, property account number, or Department of Records Map Registry number into the search box.</li>
      </ul>
    </div>
  </div>
</template>

<script>

export default {
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
      return 'medium-12 small-24';
      // }
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

.introduction {
  padding: 28px;
  /* height: 95%; */
  overflow-y: auto;
  height: calc(100vh - 122px);
}

.spacer {
  height: 20px;
}

.padded-list {
  padding-left: 14px;
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
