<template>
  <div id="modal">
    <div class="modal-container">
      <div class="modal-wrapper">
        <div class="modal-container-inner">
          <div class="modal-header">
            <button
              type="button"
              class="btn-close"
              aria-label="Close modal"
              @click="close"
            >
              <font-awesome-icon icon="times" />
            </button>
            <slot name="header" />
          </div>
          <div class="modal-body">
            <slot name="body" />
          </div>
          <div class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
      <div
        class="modal-bg"
        @click="close"
      />
    </div>
  </div>
</template>
<script>
export default {
  name: 'Modal',
  methods: {
    close() {
      this.$emit('close');
    },
  },
};
</script>

<style lang="scss">
.btn-close{
  float:right;
}
.modal-container {
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: table;
}

.modal-bg {
  position: fixed;
  z-index: 999;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  display: table;
}

@media screen and (min-width: 40em) {
  .modal-wrapper {
    top: 30vh;
    left: 50vh;
    right: 50vh;
  }
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
  position: fixed;
  z-index: 9998;
  top: 20%;
  left: 20%;
}


.modal-container-inner {
  width: 300px;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all .3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.modal-body {
  margin: 2rem 0;
}

</style>
