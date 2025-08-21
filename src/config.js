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


// var BASE_CONFIG_URL = 'https://cdn.jsdelivr.net/gh/cityofphiladelphia/pde_base_config@3cb644750f4db8619a5b41f5369d1e280678f7bb/config.js';

let config = {
  carto: {
    baseurl: 'https://phl.carto.com/api/v2/sql',
  },
  defaultAddressTextPlaceholder: {
    text: 'Address',
  },
  resetDataOnGeocode: true,
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
      sort_field: 'street_address',
    },
  },
  // baseConfig: BASE_CONFIG_URL,
  // baseConfig: '//raw.githubusercontent.com/stevetotheizz0/atlas_base_config/main/config.js',
  gatekeeperKey: process.env.VUE_APP_GATEKEEPER_KEY,
  router: {
    enabled: true,
    type: 'vue',
    geocode: 'opa',
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
          return "select * from opa_properties_public_pde where pwd_parcel_id IN("+ inputEncoded +") ORDER BY address_std ASC";
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
  // ownerSearch: {
  //   url: function (input) {
  //     var inputEncoded = encodeURIComponent(input);
  //     return 'https://api.phila.gov/ais_ps/v1/owner/' + inputEncoded;
  //   },
  //   params: {
  //     gatekeeperKey: process.env.VUE_APP_GATEKEEPER_KEY,
  //     include_units: false,
  //     opa_only: true,
  //     page: 1,
  //   },
  // },
  activeSearch: {
    assessmentHistory: {
      type: 'http-get',
      url: 'https://phl.carto.com/api/v2/sql',
      options: {
        params: {
          q: function(input){
            if (input) {
              if (typeof input === 'string') {
                return "select * from assessments where parcel_number IN('"+ input +"')";
              }
              var inputEncoded = "'" + input.join("','") + "'";
              return "select * from assessments where parcel_number IN("+ inputEncoded +")";
            }
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
            if (input) {
              if (typeof input === 'string') {
                return "select * from RTT_SUMMARY where opa_account_num = '"+ input +"' AND document_type = 'DEED'";
              }
              var inputEncoded = "'" + input.join("','") + "'";
              return "select * from RTT_SUMMARY where opa_account_num IN("+ inputEncoded +") AND document_type = 'DEED'";
            }
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
  mbStyle: {
    version: 8,
    sources: {
      pwd: {
        tiles: [
          'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer/tile/{z}/{y}/{x}',
        ],
        type: 'raster',
        tileSize: 256,
      },
    },
    layers: [
      {
        id: 'pwd',
        type: 'raster',
        source: 'pwd',
      },
    ],
  },
  basemapSources: {
    pwd: {
      source: {
        tiles: [
          'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer/tile/{z}/{y}/{x}',
          // '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap_Labels/MapServer/tile/{z}/{y}/{x}'
        ],
        type: 'raster',
        tileSize: 256,
      },
      layer: {
        id: 'pwd',
        type: 'raster',
      },
    },
    imagery2024: {
      source: {
        tiles: [
          'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2024_1in/MapServer/tile/{z}/{y}/{x}',
        ],
        type: 'raster',
        tileSize: 256,
      },
      layer: {
        id: 'imagery2024',
        type: 'raster',
      },
    },
    imagery2023: {
      source: {
        tiles: [
          'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2023/MapServer/tile/{z}/{y}/{x}',
        ],
        type: 'raster',
        tileSize: 256,
      },
      layer: {
        id: 'imagery2023',
        type: 'raster',
      },
    },
    imagery2022: {
      source: {
        tiles: [
          'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2022_2in/MapServer/tile/{z}/{y}/{x}',
        ],
        type: 'raster',
        tileSize: 256,
      },
      layer: {
        id: 'imagery2022',
        type: 'raster',
      },
    },
    imagery2020: {
      source: {
        tiles: [
          'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2020_3in/MapServer/tile/{z}/{y}/{x}',
        ],
        type: 'raster',
        tileSize: 256,
      },
      layer: {
        id: 'imagery2020',
        type: 'raster',
      },
    },
    imagery2019: {
      source: {
        tiles: [
          'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2019_3in/MapServer/tile/{z}/{y}/{x}',
          // '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap_Labels/MapServer/tile/{z}/{y}/{x}'
        ],
        type: 'raster',
        tileSize: 256,
      },
      layer: {
        id: 'imagery2019',
        type: 'raster',
      },
    },
    imagery2018: {
      source: {
        tiles: [
          'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2018_3in/MapServer/tile/{z}/{y}/{x}',
        ],
        type: 'raster',
        tileSize: 256,
      },
      layer: {
        id: 'imagery2018',
        type: 'raster',
      },
    },
    imagery2017: {
      source: {
        tiles: [
          'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2017_3in/MapServer/tile/{z}/{y}/{x}',
        ],
        type: 'raster',
        tileSize: 256,
      },
      layer: {
        id: 'imagery2017',
        type: 'raster',
      },
    },
    imagery2016: {
      source: {
        tiles: [
          'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2016_3in/MapServer/tile/{z}/{y}/{x}',
        ],
        type: 'raster',
        tileSize: 256,
      },
      layer: {
        id: 'imagery2016',
        type: 'raster',
      },
    },
    imagery2015: {
      source: {
        tiles: [
          'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2015_3in/MapServer/tile/{z}/{y}/{x}',
        ],
        type: 'raster',
        tileSize: 256,
      },
      layer: {
        id: 'imagery2015',
        type: 'raster',
      },
    },
    imagery2012: {
      source: {
        tiles: [
          'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2012_3in/MapServer/tile/{z}/{y}/{x}',
        ],
        type: 'raster',
        tileSize: 256,
      },
      layer: {
        id: 'imagery2012',
        type: 'raster',
      },
    },
    imagery2010: {
      source: {
        tiles: [
          'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2010_3in/MapServer/tile/{z}/{y}/{x}',
        ],
        type: 'raster',
        tileSize: 256,
      },
      layer: {
        id: 'imagery2010',
        type: 'raster',
      },
    },
    imagery2008: {
      source: {
        tiles: [
          'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2008_3in/MapServer/tile/{z}/{y}/{x}',
        ],
        type: 'raster',
        tileSize: 256,
      },
      layer: {
        id: 'imagery2008',
        type: 'raster',
      },
    },
    imagery2004: {
      source: {
        tiles: [
          'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2004_6in/MapServer/tile/{z}/{y}/{x}',
        ],
        type: 'raster',
        tileSize: 256,
      },
      layer: {
        id: 'imagery2004',
        type: 'raster',
      },
    },
    imagery1996: {
      source: {
        tiles: [
          'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_1996_6in/MapServer/tile/{z}/{y}/{x}',
        ],
        type: 'raster',
        tileSize: 256,
      },
      layer: {
        id: 'imagery1996',
        type: 'raster',
      },
    },
    historic1962: {
      source: {
        tiles: [
          'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/HistoricLandUse_1962/MapServer/tile/{z}/{y}/{x}',
        ],
        type: 'raster',
        tileSize: 256,
      },
      layer: {
        id: 'historic1962',
        type: 'raster',
      },
    },
    historic1942: {
      source: {
        tiles: [
          'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/HistoricLandUse_1942/MapServer/tile/{z}/{y}/{x}',
        ],
        type: 'raster',
        tileSize: 256,
      },
      layer: {
        id: 'historic1942',
        type: 'raster',
      },
    },
    historic1910: {
      source: {
        tiles: [
          'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/HistoricBromleyAtlas_1910/MapServer/tile/{z}/{y}/{x}',
        ],
        type: 'raster',
        tileSize: 256,
      },
      layer: {
        id: 'historic1910',
        type: 'raster',
      },
    },
    historic1895: {
      source: {
        tiles: [
          'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/HistoricBromleyAtlas_1895/MapServer/tile/{z}/{y}/{x}',
        ],
        type: 'raster',
        tileSize: 256,
      },
      layer: {
        id: 'historic1895',
        type: 'raster',
      },
    },
    historic1875: {
      source: {
        tiles: [
          'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/HistoricGMHopkinsAtlas_1875/MapServer/tile/{z}/{y}/{x}',
        ],
        type: 'raster',
        tileSize: 256,
      },
      layer: {
        id: 'historic1875',
        type: 'raster',
      },
    },
    historic1860: {
      source: {
        tiles: [
          'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/HistoricHexamerLocherAtlas_1860/MapServer/tile/{z}/{y}/{x}',
        ],
        type: 'raster',
        tileSize: 256,
      },
      layer: {
        id: 'historic1860',
        type: 'raster',
      },
    },
  },
  basemapLabelSources:{
    cityBasemapLabels: {
      source: {
        tiles: [ 'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap_Labels/MapServer/tile/{z}/{y}/{x}' ],
        type: 'raster',
        tileSize: 256,
      },
      layer: {
        id: 'cityBasemapLabels',
        type: 'raster',
      },
    },
    imageryBasemapLabels: {
      source: {
        tiles: [ 'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_Labels/MapServer/tile/{z}/{y}/{x}' ],
        type: 'raster',
        tileSize: 256,
      },
      layer: {
        id: 'imageryBasemapLabels',
        type: 'raster',
      },
    },
  },
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
      geocodeField: 'parcelid',
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
