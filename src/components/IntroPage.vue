<template>
  <div id="intro-container"
       :class="this.widgetClass + ' introduction'"
  >
    <h2>Property Data Explorer is your front door to the City of Philadelphia.</h2>
    <p>Here are some things you can do with Property Data Explorer:</p>
    <div class="callout">
      <ul>
        <li>Get the history of permits, licenses, and inspections at any address</li>
        <li>Research real estate information including property values, zoning, and document archives</li>
        <li>Get easy access to a variety of hard-to-find City resources</li>
        <li>View recent activity around your address, such as crimes, 311 service requests, and more</li>
        <li>Explore historical imagery and maps</li>
      </ul>
    </div>
    <p>To get started, click anywhere on the map, or type an address, intersection, property assessment account number, or Department of Records Map Registry number into the search box.</p>
    <!-- <p>To get started, click anywhere on the map, or type an address, intersection, property assessment account number, or Department of Records Map Registry number into the search box.</p>
    <p>To get started, click anywhere on the map, or type an address, intersection, property assessment account number, or Department of Records Map Registry number into the search box.</p>
    <p>To get started, click anywhere on the map, or type an address, intersection, property assessment account number, or Department of Records Map Registry number into the search box.</p>
    <p>To get started, click anywhere on the map, or type an address, intersection, property assessment account number, or Department of Records Map Registry number into the search box.</p> -->
  </div>
</template>

<script>

  export default {
    destroyed() {
      // console.log('intro page destroyed is running');
      this.map.invalidateSize();
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
          return 'medium-12 small-24'
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
    }
  }

</script>

<style>

.introduction {
  padding: 30px;
  /* height: 70%; */
  overflow-y: auto;
}

.full-topics-open {
  display: none;
}

</style>
