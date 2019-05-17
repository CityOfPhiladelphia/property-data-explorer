<template>
  <section :class="['openmaps-about' ,'openmaps-modal']"
            v-if="this.$store.state.activeCondo.featureId"
  >

    <div @click="closeModal" class="openmaps-modal-close hide-print">
      <span class="button-state state-unnamed-state unnamed-state-active">
        <font-awesome-icon icon="times" class="fa-lg" aria-hidden="true" />
      </span>
    </div>

    <div class="openmaps-modal-content">
      <b><big>{{ address }}</big></b> has records for <b><big>{{ totalRecords}}</big></b> units. Click
        the button below to add these records to the search results table.
      <a class="button condo-records-button center-button"
         @click="this.addCondoRecords"
      >
        Add records to results.
      </a>
    </div>
  </section>
</template>

<script>

import transforms from '../general/transforms';
const titleCase = transforms.titleCase.transform;

export default {
  components: {
  },
  name: 'Condo-Card-Modal',
  computed: {
    activeCondo() {
      return this.$store.state.activeCondo;
    },
    address() {

      const state = this.$store.state
      let address =  function() {
        if (state.geocode.status === "success"){
          return titleCase(state.geocode.data.properties.street_address)
        } else if (state.ownerSearch.status === "success") {
          let result = state.ownerSearch.data.filter(object => {
            return object._featureId === state.activeCondo.featureId
          });
          return titleCase(result[0].properties.street_address)
        } else {
          let result = state.shapeSearch.data.rows.filter(object => {
            return object._featureId === state.activeCondo.featureId
          });
          return titleCase(result[0].location)
        }
      }
      return address();
    },
    totalRecords() {
      let featureId;
      if (this.$store.state.lastSearchMethod === "shape search") {
        let result = this.$store.state.shapeSearch.data.rows.filter(
          object => {
            return object._featureId === this.$store.state.activeCondo.featureId }
          );
        featureId = result[0].pwd_parcel_id;
      } else {
        featureId = this.$store.state.activeCondo.featureId;
      }
      return this.$store.state.condoUnits.units[featureId].length
    }
  },
  methods: {
    closeModal (state) {
      this.$store.state.activeCondo.featureId = null;
      this.$store.commit('setActiveFeature', null);
    },
    addCondoRecords(state) {
      let mapUnitIds = function(id) {
        var i = 0;
        let unitsToAdd = this.$store.state.condoUnits.units[id]
        unitsToAdd.map(
          a => {
            typeof a.properties != 'undefined' ? a._featureId = a.properties.pwd_parcel_id + "-UNIT-" + i :
            a._featureId = a.pwd_parcel_id + "-UNIT-" + i, i++
          }
        );
        return unitsToAdd
      }
      mapUnitIds = mapUnitIds.bind(this)
      let unitData;
      if(this.$store.state.lastSearchMethod === "geocode") {
        unitData = mapUnitIds(this.$store.state.activeCondo.featureId);
        this.$store.commit('setGeocodeRelated', unitData);
        this.$controller.dataManager.fetchData();
      } else {
        let result = this.$store.state.shapeSearch.data.rows.filter(
          a => a._featureId === this.$store.state.activeCondo.featureId
        )
        let units = mapUnitIds(result[0].pwd_parcel_id)
        // console.log("Matching Id for Units: ", units);
        this.$store.commit('setShapeSearchDataPush', units);
        this.$controller.dataManager.resetData();
        this.$controller.dataManager.didShapeSearch();
      }
      this.closeModal(state);
    }
  },
}
</script>



<style scoped>

.center-button {
  display: flex;
  position: absolute;
  bottom: 15px;
  left: 14%;
}

.openmaps-modal {
  padding: 10px;
  color: rgb(15, 77, 144);
  width: 350px;
  height: 175px;
  position: fixed;
  background: white;
  z-index:1000;
  margin: auto;
  left: 2%;
  right: 2%;
  top: 32%;
}

.openmaps-modal-content{
  padding: 30px 10px 10px 10px;
  margin: auto;
  height: 100%;
  display: table;
}

.openmaps-modal-close{
  position: fixed;
  background: transparent;
  height: 30px;
  width: 30px;
}

.openmaps-modal.openmaps-modal--open{
  z-index:1000;
  opacity: 1;
}

</style>
