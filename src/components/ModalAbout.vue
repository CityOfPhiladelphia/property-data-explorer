<template>
  <div class="background">
    <h2 class="text-center ">
      <b>How to use Property</b>
    </h2>
    <div class="grid-x align-center-middle">
      <div class="cell small-9 medium-3 text-center">
        <font-awesome-icon
          icon="search"
          class="fa-3x"
          aria-hidden="true"
        />
      </div>
      <div class="cell small-15 medium-21 text-div">
        <p><b>Search for a single address, property account number, or Department of Records Map Registry number</b></p>
        <p>The map will move to the location that you have searched</p>
      </div>

      <div class="cell small-9 medium-3 text-center">
        <font-awesome-icon
          icon="search"
          class="fa-3x"
          aria-hidden="true"
        />
      </div>
      <div class="cell small-15 medium-21 text-div">
        <p><b>Search for a person's name</b></p>
        <p>The map will not move to any locations found, because there may be multiple</p>
      </div>

      <div class="cell small-9 medium-3 text-center">
        <font-awesome-icon
          icon="circle"
          class="fa-3x"
          aria-hidden="true"
        />
      </div>
      <div class="cell small-15 medium-21 text-div">
        <p><b>Search by buffer</b></p>
        <p>This will find every property within 250 feet of the property that you click</p>
      </div>

      <div class="cell small-9 medium-3 text-center">
        <img
          class="pentagon-image"
          :src="'images/pentagon.png'"
        />
      </div>
      <div class="cell small-15 medium-21 text-div">
        <p><b>Draw a shape on the map</b></p>
        <p>This will return every property in the shape you draw (as long as there are fewer than 200 properties)</p>
      </div>

      <div class="cell small-9 medium-3 text-center">
        <font-awesome-icon
          icon="map-marker-alt"
          class="fa-3x"
          aria-hidden="true"
        />
      </div>
      <div class="cell small-15 medium-21 text-div">
        <p><b>The single property found or a buffer search will mark the property</b></p>
        <p>You cannot interact with this</p>
      </div>

      <div class="cell small-9 medium-3 text-center">
        <img
          class="street-view-image"
          :src="'images/cyclomedia_blue.png'"
        >
      </div>
      <div class="cell small-15 medium-21 text-div">
        <p><b>Toggle on and off street view</b></p>
        <p>Half of the map panel will be taken up by the street view. If you are zoomed in far enough, circles will appear along the streets in the map.  Click on a circle to change the street view location to that point.</p>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'ModalAbout',
};
</script>

<style scoped>

  p {
      margin-bottom: 2px;
    }

  .topic {
    border-radius: 10px;
    border-style: solid;
    margin-bottom: 4px;
  }

  .background {
    border-radius: 20px;
    background-color: white;
    color: rgb(15, 77, 144);
    padding: 20px;
  }

  .text-div {
    padding-left: 10px;
    margin-top: 15px;
    margin-bottom: 15px;
  }

  .street-view-image {
    width: 50px;
    height: 60px;
  }

  .pentagon-image {
    width: 80px;
    height: 80px;
  }

  @media screen and (max-width: 750px) {

    .background {
      height: 80% !important;
    }

  }

</style>
