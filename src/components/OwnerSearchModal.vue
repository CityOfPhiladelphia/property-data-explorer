<template>
  <div>
    <div id="owner-wrapper"
      v-if="this.$store.state.ownerSearchModal"
    >
      <div id="owner-modal" >
        Only <b>{{ this.totalRecords }}</b> out of <b>{{ this.$store.state.ownerSearch.total_size }}</b> total results displayed.
        Please try again with a more specific owner name.
        <button
          class="openmaps-modal-close hide-print"
          @click="closeModal"
        >
        Close
        </button>
      </div>
    </div>
  </div>
</template>

<script>


export default {
  name: 'OwnerSearchModal',
  components: {
  },
  computed: {
    totalRecords() {
      return this.$store.state.ownerSearch.data.length
    }
  },
  methods: {
    closeModal(state) {
      this.$store.commit('setOwnerSearchModal', false);
      this.$store.commit('setOwnerSearchTotal', null);
    },
  },
};
</script>


<style scoped>

button {
  display: block;
  margin: auto;
  margin-top: 10px;
  background-color: #0f4d90;
  color: white;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
}

#owner-wrapper {
  z-index: 1000;
  height: 100%;
  width: 100%;
  position: absolute;
  background-color: transparent;
}

#owner-modal {
  position: absolute;
  background: white;
  padding: 15px;
  z-index: 1001;
  width: 250px;
  left: calc( 50% - 100px);
  top: 25%;
  border: #2176d2 solid 2px;
}



</style>
