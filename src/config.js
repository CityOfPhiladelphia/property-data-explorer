import transforms from './util/transforms';
import helpers from './util/helpers';
import map from './general/map';

let config = {
  baseConfig: '//raw.githubusercontent.com/stevetotheizz0/atlas_base_config/master/config.js',
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
          return "select * from opa_properties_public_test where pwd_parcel_id IN("+ inputEncoded +")"
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
                return "select * from assessments where parcel_number IN('"+ input +"')"
              } else {
                var inputEncoded = "'" + input.join("','") + "'";
                return "select * from assessments where parcel_number IN("+ inputEncoded +")"
              }
            }
          },
          success: function(data) {
            return data.rows;
          }
        }
    },
    salesHistory: {
      type: 'http-get',
      url: 'https://phl.carto.com/api/v2/sql',
      options: {
        params: {
          q: function(input){
            if (typeof input === 'string') {
              return "select * from RTT_SUMMARY where opa_account_num = '"+ input +"' AND document_type = 'DEED'"
            } else {
              var inputEncoded = "'" + input.join("','") + "'";
              return "select * from RTT_SUMMARY where opa_account_num IN("+ inputEncoded +") AND document_type = 'DEED'"
            }
          }
        },
        success: function(data) {
          return data.rows;
        }
      }
    }
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
      fillOpacity: 0.3
    },
    hoverStyle: {
      // radius: 6,
      fillColor: 'yellow',
      color: 'yellow',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.3
    }
  },
  parcels: {
    pwd: {
      multipleAllowed: true,
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
            // console.log(state.shapeSearch.data)
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
            return target.properties.pwd_parcel_id;
          } else {
            return target.pwd_parcel_id
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
