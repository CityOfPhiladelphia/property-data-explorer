import transforms from './general/transforms';
import helpers from './util/helpers';
import map from './general/map';

// data-sources
import opa_assessment from './data-sources/opa-assessment';
import opa_public from './data-sources/opa-public';
// import neighboringProperties from './data-sources/neighboring-properties';

import modalAbout from './components/ModalAbout.vue';

const customComps = {
  'modal-about': modalAbout,
};


var BASE_CONFIG_URL = 'https://cdn.jsdelivr.net/gh/cityofphiladelphia/pde_base_config@3cb644750f4db8619a5b41f5369d1e280678f7bb/config.js';

let config = {
  customComps,
  geocoder: {
    url: function (input) {
      var inputEncoded = encodeURIComponent(input);
      return '//api.phila.gov/ais-pde/v1/search/' + inputEncoded;
    },
    params: {
      gatekeeperKey: process.env.VUE_APP_GATEKEEPER_KEY,
      include_units: true,
      opa_only: true,
    },
  },
  baseConfig: BASE_CONFIG_URL,
  // baseConfig: '//raw.githubusercontent.com/stevetotheizz0/atlas_base_config/master/config.js',
  gatekeeperKey: process.env.VUE_APP_GATEKEEPER_KEY,
  router: {
    enabled: true,
    type: 'vue',
  },
  app: {
    title: 'Property Data Explorer',
    subtitle: 'City of Philadelphia',
    tagLine: 'Explore Property Data',
    logoAlt: 'logo',
  },
  dataPanelWidth: 'whole',
  transforms,
  geolocation: {
    enabled: true,
    icon: [ 'far', 'dot-circle' ],
  },
  addressInput: {
    width: 415,
    mapWidth: 300,
    position: 'right',
    autocompleteEnabled: false,
    autocompleteMax: 15,
    placeholder: 'Search the map',
  },
  cyclomedia: {
    enabled: true,
    orientation: 'vertical',
    measurementAllowed: false,
    popoutAble: true,
    recordingsUrl: 'https://atlas.cyclomedia.com/Recordings/wfs',
    username: process.env.VUE_APP_CYCLOMEDIA_USERNAME,
    password: process.env.VUE_APP_CYCLOMEDIA_PASSWORD,
    apiKey: process.env.VUE_APP_CYCLOMEDIA_API_KEY,
  },
  shapeSearch: {
    url: 'https://phl.carto.com/api/v2/sql',
    options: {
      params: {
        q: function(input){
          var inputEncoded = Object.keys(input).map(k => "'" + input[k] + "'").join(",");
          return "select * from opa_properties_public_pde where pwd_parcel_id IN("+ inputEncoded +")";
        },
      },
    },
  },
  blockSearch: {
    url: function (input) {
      let inputWithoutBlockKeyword = input.trim().toLowerCase().replace("blk" , "").replace("block:", "").replace("block", "");
      var inputEncoded = encodeURIComponent(inputWithoutBlockKeyword);
      return 'https://api.phila.gov/ais_ps/v1/block/' + inputEncoded;
    },
    params: {
      page: 1,
    },
  },
  ownerSearch: {
    url: function (input) {
      var inputEncoded = encodeURIComponent(input);
      return 'https://api.phila.gov/ais_ps/v1/owner/' + inputEncoded;
    },
    params: {
      gatekeeperKey: process.env.VUE_APP_GATEKEEPER_KEY,
      include_units: false,
      opa_only: true,
      page: 1,
    },
  },
  activeSearch: {
    assessmentHistory: {
      type: 'http-get',
      url: 'https://phl.carto.com/api/v2/sql',
      options: {
        params: {
          q: function(input){
            if (typeof input === 'string') {
              return "select * from assessments where parcel_number IN('"+ input +"')";
            }
            var inputEncoded = "'" + input.join("','") + "'";
            return "select * from assessments where parcel_number IN("+ inputEncoded +")";

          },
        },
        success: function(data) {
          return data.rows;
        },
      },
    },
    salesHistory: {
      type: 'http-get',
      url: 'https://phl.carto.com/api/v2/sql',
      options: {
        params: {
          q: function(input){
            if (typeof input === 'string') {
              return "select * from RTT_SUMMARY where opa_account_num = '"+ input +"' AND document_type = 'DEED'";
            }
            var inputEncoded = "'" + input.join("','") + "'";
            return "select * from RTT_SUMMARY where opa_account_num IN("+ inputEncoded +") AND document_type = 'DEED'";

          },
        },
        success: function(data) {
          return data.rows;
        },
      },
    },
  },
  pictometry: {
    enabled: true,
  },
  map,
  mapOverlay: {
    marker: 'geojson',
    style: {
      // radius: 6,
      fillColor: 'blue',
      // fillColor: '#ff3f3f',
      color: '#blue',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.3,
    },
    hoverStyle: {
      // radius: 6,
      fillColor: 'yellow',
      color: 'yellow',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.3,
    },
  },
  parcels: {
    pwd: {
      multipleAllowed: true,
      mapregStuff: false,
      geocodeFailAttemptParcel: null,
      clearStateOnError: false,
      wipeOutOtherParcelsOnReverseGeocodeOnly: true,
      geocodeField: 'PARCELID',
      parcelIdInGeocoder: 'pwd_parcel_id',
      getByLatLngIfIdFails: true,
    },
  },
  dataSources: {
    opa_public,
    opa_assessment,
    // neighboringProperties,
  },
};

export default config;
