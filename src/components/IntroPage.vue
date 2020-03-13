<template>
  <div
    id="intro-container"
    :class="widgetClass + ' introduction'"
  >
    <div class="intro-blue">
        <i>Use the Property Data Explorer to get information about a property's ownership,<br>
        sales history, value, and physical characteristics. You can also generate address<br>
        listings near a property or within an area of interest.</i>
    </div>
    <h2>To get started, you can: </h2>
    <div class="spacer" />
    <!-- <p>Here are some things you can do with Property Data Explorer:</p> -->
    <!-- <div class="callout"> -->
    <div>
      <ul class="padded-list">
        <li>
          <h4>Select a location on the map</h4>
          Click or tap on a specific property to view details about it.
        </li>
        <li>
          <h4>Search on property information</h4>
          type an address, owner name, property account number, or
          Department of Records registry map number into the search box.
        </li>
        <li>
          <h4>View Properties within a selected radius</h4>
          Use this tool to select a point on the map and view details about all
          properties within a 250-foot radius.
        </li>
        <li>
          <h4>Select a location on the map</h4>
          Use this tool to draw a shape on the map and view details about all
          properties within its boundaries.
        </li>
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
      return 'medium-24 small-24';
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

.intro-blue {
  background: #daedfe;
  padding: 10px;
}

.spacer {
  height: 20px;
}

.padded-list {
  padding-left: 14px;
  li {
    padding: 10px 20px 0 0;
  }
  li:nth-child(1){
    list-style-image:url(https://cdn1.iconfinder.com/data/icons/mimiGlyphs/16/envelope_mail.png)
    }
  li:nth-child(2){
    list-style-image:url(https://cdn1.iconfinder.com/data/icons/mimiGlyphs/16/envelope_mail.png)
    }
  li:nth-child(3){
    list-style-image:url(https://cdn1.iconfinder.com/data/icons/mimiGlyphs/16/envelope_mail.png)
    }
  li:nth-child(4){
    list-style-image:url(https://cdn1.iconfinder.com/data/icons/mimiGlyphs/16/envelope_mail.png)
    }
}

@media screen and (min-width: 750px) {
  .introduction {
    margin: 30px 40px 0 40px;
    .intro-blue {
        margin: 0 0 35px 0;
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
