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
import App from './components/App.vue';
import mergeDeep from './util/merge-deep';
import config from './config.js';


import { library } from '@fortawesome/fontawesome-svg-core';
import { faCaretDown } from '@fortawesome/pro-solid-svg-icons/faCaretDown';
import { faCaretUp } from '@fortawesome/pro-solid-svg-icons/faCaretUp';
import { faMapMarkerAlt } from '@fortawesome/pro-solid-svg-icons/faMapMarkerAlt';
library.add(faCaretDown, faCaretUp, faMapMarkerAlt);
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import '../node_modules/phila-standards/dist/css/phila-app.min.css';
import helpers from './util/helpers';
import 'leaflet/dist/leaflet.css';
import 'leaflet-easybutton/src/easy-button.css';
import 'leaflet-measure/dist/leaflet-measure.css';
import './styles.css';

import philaVueMapping from '@cityofphiladelphia/phila-vue-mapping';
import philaVueComps from '@cityofphiladelphia/phila-vue-comps';
import philaVueDatafetch from '@cityofphiladelphia/phila-vue-datafetch';
const controllerMixin = philaVueDatafetch.controllerMixin;

const clientConfig = config;
const baseConfigUrl = config.baseConfig;

var BASE_CONFIG_URL = 'https://cdn.jsdelivr.net/gh/ajrothwell/mapboard-base-config@74cf4692237e16757681f6860b936efd734c27d8/config.js';

function initVue(config) {
  const store = createStore(config);

  // make config accessible from each component via this.$config
  Vue.use(configMixin, config);

  // mix in controller
  Vue.use(controllerMixin, { config, store });

  Vue.component('font-awesome-icon', FontAwesomeIcon)
  // mount main vue
  const vm = new Vue({
    el: '#vue-app',
    render: h => h(App),
    store
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

    initVue(config);
  }).catch(err => {
    console.error('Error loading base config:', err);
  });

} else {
  initVue(clientConfig);
}
