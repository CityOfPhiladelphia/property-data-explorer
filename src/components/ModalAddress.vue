<template>
  <div class="background">
    <h2 class="text-center ">
      <b>Can't Find Your Address?</b>
    </h2>
    <div class="grid-y align-center-middle">

      <div>
        There are some addresses that are difficult for the app to find.
      </div>
      <div>
        Many of them can be easily found using the OPA number associated with the address.
      </div>
      <div>
        To find an OPA number for any address, you can use <a href="https://atlas.phila.gov" target="_blank">atlas.phila.gov</a>.
      </div>
      <div>
        <img src="../assets/atlas-condo.png">
      </div>
      <div>
        You can click straight to the entry in property.phila.gov from the property tab of <a href="https://atlas.phila.gov" target="_blank">atlas.phila.gov</a>.
      </div>
      <div>
        <img src="../assets/atlas-condo-2.png">
      </div>
      <!-- <div class="cell small-9 medium-3 text-center">
        <font-awesome-icon
          icon="map-marker-alt"
          class="fa-3x"
          aria-hidden="true"
        />
      </div>
      <div class="cell small-15 medium-21 text-div">
        <p><b>The single property found or a buffer search will mark the property</b></p>
        <p>You cannot interact with this</p>
      </div> -->

    </div>
  </div>
</template>

<script>

export default {
  name: 'ModalAddress',
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
