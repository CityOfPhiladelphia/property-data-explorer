// shout out to airyland
// https://github.com/airyland/vue-config/blob/main/index.js

export default (Vue, config) => {
  Vue.mixin({
    created() {
      this.$config = config;
    },
  });
};
