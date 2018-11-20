<template>
  <!-- <section :class="['openmaps-about' ,'openmaps-modal', {'openmaps-modal--open': modals.about.open}]" -->
  <section :class="['openmaps-about' ,'openmaps-modal']"
           v-show="modals.open === 'true'">
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
    shouldBeOpen() {
      this.modals.open = 'true'
      return this.modals.open
    },
    modals() {
      return this.$store.state.modals;
    },
    ownerOptions() {
      const options = {
        id: 'ownerProperties',
        dataSources: ['opa'],
        title: "",
        fields: [
          {
            label: 'Street Address',
            value: function() {
              return 'test message'
              // return state.sources.opa.data.state_code
            }
          },
          {
            label: 'Owner',
            value: function(){
              return 'test message'
              // return state.sources.opa.data.owner_1
            },
          },
        ],
      }
      return options;
    },
  },
  methods: {
    closeModal () {
      this.$store.state.modals = 'false;'
      // this.$store.commit('setDidToggleModal', { name: 'help', open: false });
    },
  }
}
</script>

<style scoped>
/* <style lang="scss" scoped> */

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
