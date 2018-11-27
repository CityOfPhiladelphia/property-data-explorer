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
      url: 'https://data.phila.gov/resource/w7rb-qrn8.json',
      options: {
        params: {
          parcel_number: function(feature) { return feature.properties.opa_account_num; }
        },
        success: function(data) {
          return data[0];
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
