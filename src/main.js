/*
                                          __                         ___.                  __
_____________  ____ ______   ____________/  |_ ___.__. _______   ____\_ |__   ____   _____/  |_
\____ \_  __ \/  _ \\____ \_/ __ \_  __ \   __<   |  | \_  __ \_/ __ \| __ \ /  _ \ /  _ \   __\
|  |_> >  | \(  <_> )  |_> >  ___/|  | \/|  |  \___  |  |  | \/\  ___/| \_\ (  <_> |  <_> )  |
|   __/|__|   \____/|   __/ \___  >__|   |__|  / ____|  |__|    \___  >___  /\____/ \____/|__|
|__|                |__|        \/             \/                   \/    \/
*/


import Vue from 'vue';
import axios from 'axios';
import createStore from './store';
import configMixin from './util/config-mixin';
import mergeDeep from './util/merge-deep';
import config from './config.js';

import * as faAll from './fa.js';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import controllerMixin from '@phila/vue-datafetch/src/controller.js';

// console.log('in pde main.js, createStore:', createStore, 'controllerMixin:', controllerMixin);

const clientConfig = config;
const baseConfigUrl = config.baseConfig;

// import '../node_modules/phila-standards/dist/css/phila-app.min.css';
// import helpers from './util/helpers';
import 'phila-standards/dist/css/phila-app.min.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-easybutton/src/easy-button.css';
import 'leaflet-measure/dist/leaflet-measure.css';
// import './styles.css';

import router from './router';

import App from './components/App.vue';

function initVue(config) {

  // make config accessible from each component via this.$config
  Vue.use(configMixin, config);

  const store = createStore(config);
  let opts = { config, store };

  // console.log('in initVue, config:', config, 'store:', store, 'router:', router);
  // mix in controller
  // Vue.use(controllerMixin, { config, store, router });
  Vue.use(controllerMixin, { config, store, router });

  Vue.component('font-awesome-icon', FontAwesomeIcon);

  const customComps = config.customComps || [];
  // console.log('mapboard main.js, customComps:', customComps);
  for (let key of Object.keys(customComps)) {
    Vue.component(key, customComps[key]);
  }
  // mount main vue
  const vm = new Vue({
    el: '#vue-app',
    render: h => h(App),
    router,
    store,
  });
}

// if there is a base config, get base config
if (baseConfigUrl) {
  axios.get(baseConfigUrl).then(response => {
    const data = response.data;
    const baseConfigFn = eval(data);
    const { gatekeeperKey } = clientConfig;
    const baseConfig = baseConfigFn({ gatekeeperKey });

    // deep merge base config and client config
    const config = mergeDeep(baseConfig, clientConfig);
    // console.log('in axios, about to call initVue, config:', config);

    initVue(config);
  }).catch(err => {
    // console.error('Error loading base config:', err);
  });

} else {
  initVue(clientConfig);
}
