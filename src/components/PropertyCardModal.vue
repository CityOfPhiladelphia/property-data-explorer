<template>
  <section :class="['openmaps-about' ,'openmaps-modal']"
            v-if="this.$store.state.activeFeature.featureId"
  >
    <div @click="closeModal" class="openmaps-modal-close">
      <span class="button-state state-unnamed-state unnamed-state-active">
        <font-awesome-icon icon="times" class="fa-lg" aria-hidden="true" />
      </span>
    </div>
    <div class="openmaps-modal-content">

      <vertical-table
        :slots="this.ownerOptions"
        :options="this.ownerOptions"
      />

    </div>
  </section>
</template>

<script>
import philaVueComps from '@cityofphiladelphia/phila-vue-comps';
const VerticalTable = philaVueComps.VerticalTable;

export default {
  components: {
    VerticalTable,
  },
  name: 'Property-Card-Modal',
  computed: {
    activeFeature() {
      // console.log("Active Feature.....");
      return this.$store.state.activeFeature;
    },
    ownerOptions() {
      const options = {
        id: 'ownerProperties',
        title: "Property Details",
        fields: [
          {
            label: 'Owner',
            value: function(state){
              if (state.geocode.status === "success"){
                return state.geocode.data.properties.opa_owners.toString();
              } else {
                let result = state.ownerSearch.data.filter(object => {
                  return object._featureId === state.activeFeature.featureId
                });
                return result[0].properties.opa_owners.toString()
              }
            },
          },
          {
            label: 'Street Address',
            value: function(state) {
              if (state.geocode.status === "success"){
                return state.geocode.data.properties.street_address;
              } else {
                let result = state.ownerSearch.data.filter(object => {
                  return object._featureId === state.activeFeature.featureId
                });
                return result[0].properties.street_address
              }
            },
          },
          {
            label: 'OPA Account',
            value: function(state) {
              if (state.geocode.status === "success"){
                return state.geocode.data.properties.opa_account_num;
              } else {
                let result = state.ownerSearch.data.filter(object => {
                  return object._featureId === state.activeFeature.featureId
                });
                return result[0].properties.opa_account_num
              }
            },
          },
        ],
      }
      return options;
    },
  },
  methods: {
    closeModal (state) {
      this.$store.state.activeFeature.featureId = null;
    },
  },
}
</script>

<style scoped>

.icon-div {
  margin: 10px;
}

.text-div {

}

.street-view-image {
  height: 40px;
  width: 73px;
  color: blue;
}

.openmaps-modal {
  color: rgb(15, 77, 144);
  width: 97%;
  height: 80%;
  padding: 20px;
  overflow: hidden;
  position: absolute;
  top: 70px;
  left: 10px;
  background: white;
  z-index:1000;
}

.openmaps-modal.openmaps-modal--open{
  z-index:1000;
  opacity: 1;
}

.openmaps-modal-content{
  width: 95%;
  height: 85%;
  margin: 20px auto;
  overflow-y: auto;
}

.openmaps-modal-close{
  position: absolute;
  top:15px;
  left:15px;
  background: white;
  height: 30px;
  width: 30px;
}

</style>
