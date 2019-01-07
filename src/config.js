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
    url: function () {
      return 'https://phl.carto.com/api/v2/sql';
    },
    type: 'http-get',
    options: {
      // params: {
      //   q: function(feature){ return "select * from li_permits where address = '" + feature.properties.street_address + "' or addresskey = '" + feature.properties.li_address_key.toString() + "'"},
      // }
      params: {
        q: function(){
          "select * from opa_properties_public where parcel_number IN('662055200')"
        }
      }
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
  pictometry: {
    enabled: true,
  },
  map,
  // modals: [''],
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
    // ownerOPA: {
    //   options: {
    //     params: {
    //       q: function (opa_account_array){
    //         return "SELECT * FROM \"phl-gsg\".opa_properties_public WHERE parcel_number = ANY('{" + opa_account_array + "}'::text[])"
    //       }
    //     }
    //   }
    // },
    opa: {
      type: 'http-get',
      url: 'https://phl.carto.com/api/v2/sql',
      // url: 'https://data.phila.gov/resource/w7rb-qrn8.json',
      targets: {
        runOnce: true,
        get: function(state) {
          // console.log('opa get is running');
          if (state.lastSearchMethod === 'owner search') {
            // console.log('lastSearchMethod = owner search');
            return state.ownerSearch.data
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
          // console.log('in getTargetId, target:', target);
          return target.properties.opa_account_num;
          // return target._featureId;
        }
      },
      options: {
        params: {
          // parcel_number: function(feature) {
          q: function(feature) {
            // console.log('feature:', feature);
            // return 'select * from opa_properties_public where parcel_number IN (' + feature.properties.opa_account_num + ')';
            return "SELECT parcel_number, market_value, sale_date, sale_price FROM opa_properties_public WHERE parcel_number IN (" + feature + ")";
          }
        },
        success: function(data) {
          return data.rows;
        }
      }
    },
    // liPermits: {
    //   type: 'http-get',
    //   url: 'https://phl.carto.com/api/v2/sql',
    //   options: {
    //     params: {
    //       q: function(feature){ return "select * from li_permits where address = '" + feature.properties.street_address + "' or addresskey = '" + feature.properties.li_address_key.toString() + "'"},
    //     }
    //   }
    // },
  }
}

export default config;
