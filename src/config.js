import transforms from './util/transforms';
import helpers from './util/helpers';
import map from './general/map';

let config = {
  baseConfig: 'https://cdn.rawgit.com/ajrothwell/atlas_base_config/d95ed79d/config.js',
  gatekeeperKey: '82fe014b6575b8c38b44235580bc8b11',
  router: {
    enabled: true
  },
  transforms,
  cyclomedia: {
    enabled: true,
    measurementAllowed: false,
    popoutAble: true,
  },
  shapeSearch: {

    url: 'https://phl.carto.com/api/v2/sql',
    options: {
      params: {
        q: function(input){
          var inputEncoded = Object.keys(input).map(k => "'" + input[k] + "'").join(",");
          return "select * from opa_properties_public where parcel_number IN("+ inputEncoded +")"
        }
      },
    }
  },
  ownerSearch: {
    url: function (input) {
      var inputEncoded = encodeURIComponent(input);
      return '//api.phila.gov/ais/v1/owner/' + inputEncoded;
    },
    params: {
      gatekeeperKey: '82fe014b6575b8c38b44235580bc8b11',
      include_units: true,
    },
  },
  activeSearch: {
      type: 'http-get',
      url: 'https://phl.carto.com/api/v2/sql',
        options: {
          params: {
              q: function(feature){ return "select * from assessments where parcel_number = '" + feature + "'"},
          },
          success: function(data) {
            return data;
          }
        }
    },
  pictometry: {
    enabled: true,
  },
  map,
  parcels: {
    pwd: {
      multipleAllowed: false,
      geocodeFailAttemptParcel: null,
      clearStateOnError: false,
      wipeOutOtherParcelsOnReverseGeocodeOnly: true,
      geocodeField: 'PARCELID',
      parcelIdInGeocoder: 'pwd_parcel_id',
      getByLatLngIfIdFails: false
    },
  },
  dataSources: {
    opa_public: {
      type: 'http-get',
      url: 'https://phl.carto.com/api/v2/sql',
      targets: {
        runOnce: true,
        get: function(state) {
          if (state.lastSearchMethod === 'owner search') {
            return state.ownerSearch.data
          } else if (state.lastSearchMethod === 'shape search') {
            return state.shapeSearch.data.rows
          } else {
            let opa = []
            opa.push(state.geocode.data);
            for (let relate of state.geocode.related) {
              opa.push(relate);
            }
            return opa;
          }
        },
        getTargetId: function(target) {
          if(target.properties){
            return target.properties.opa_account_num;
          } else {
            return target.parcel_number
          }
        }
      },
      options: {
        params: {
          q: function(input){
            // var inputEncoded = Object.keys(input).map(k => "'" + input[k] + "'").join(",");
            return "select * from opa_properties_public where parcel_number IN("+ input +")"
          }
        },
        success: function(data) {
          return data.rows;
        }
      }
    },
    opa_assessment: {
      type: 'http-get',
      url: 'https://phl.carto.com/api/v2/sql',
      targets: {
        runOnce: true,
        get: function(state) {
          // console.log('opa get is running');
          if (state.lastSearchMethod === 'owner search') {
            return state.ownerSearch.data
          } else if (state.lastSearchMethod === 'shape search') {
            return state.shapeSearch.data.rows
          } else {
            let opa = []
            opa.push(state.geocode.data);
            for (let relate of state.geocode.related) {
              opa.push(relate);
            }
            return opa;
          }
        },
        getTargetId: function(target) {
          if(target.properties){
            return target.properties.opa_account_num;
          } else {
            return target.parcel_number
          }
        }
      },
      options: {
        params: {
          // parcel_number: function(feature) {
          q: function(feature) {
            return "SELECT parcel_number, market_value, sale_date, sale_price FROM opa_properties_public WHERE parcel_number IN (" + feature + ")";
          }
        },
        success: function(data) {
          return data.rows;
        }
      }
    },
  }
}

export default config;
