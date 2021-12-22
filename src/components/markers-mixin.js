import throttle from 'lodash-es/throttle';

export default {

  watch: {
    activeFeature(nextActiveFeature, prevActiveFeature) {
      console.log('WATCH active feature', prevActiveFeature, '=>', nextActiveFeature);

      if (prevActiveFeature && prevActiveFeature.featureId) {
        this.geojsonActiveParcelSources = [];
      }

      if (nextActiveFeature && nextActiveFeature.featureId) {
        let updateFeatureNext = nextActiveFeature.featureId;
        let pwdParcels = this.$store.state.parcels.pwd;
        let currentShape;
        let shapes = [];

        if (this.$store.state.shapeSearch.data) {
          shapes = this.$store.state.shapeSearch.data.rows;
          for (let shape of shapes) {
            if (shape._featureId === updateFeatureNext) {
              for (let parcel of pwdParcels) {
                if (parcel.properties.PARCELID === shape.pwd_parcel_id) {
                  currentShape = parcel;
                  break;
                }
              }
              break;
            }
          }
        } else if (this.$store.state.blockSearch.data) {
          shapes = this.$store.state.blockSearch.data;
          // console.log('activeFeature, shapes:', shapes);
          for (let shape of shapes) {
            if (shape._featureId == updateFeatureNext) {
              for (let parcel of pwdParcels) {
                // console.log('activeFeature shape loop, inside if, shape._featureId:', shape._featureId, 'updateNeatureNext:', updateFeatureNext, 'parcel.properties.PARCELID:', parcel.properties.PARCELID, 'shape.properties.pwd_parcel_id:', shape.properties.pwd_parcel_id);
                if (parcel.properties.PARCELID == shape.properties.pwd_parcel_id) {
                  currentShape = parcel;
                  break;
                }
              }
              break;
            }
          }
        } else {
          currentShape = pwdParcels[0];
        }

        // console.log('markers-mixin.js watch activeFeature, updateFeatureNext:', updateFeatureNext, 'shapes:', shapes, 'currentShape:', currentShape);
        if (currentShape) {
          this.geojsonActiveParcelSources = [
            {
              'type': 'geojson',
              'data': {
                'type': 'Feature',
                'geometry': {
                  'type': 'Polygon',
                  'coordinates': currentShape.geometry.coordinates,
                },
              },
            },
          ];
        }
      }
    },
  },
  computed: {
    currentBuffer() {
      return this.$store.state.bufferShape;
    },
    locationMarker() {
      const latlngArray = [ this.$store.state.map.location.lat, this.$store.state.map.location.lng ];
      const marker = {
        latlng: latlngArray,
        radius: 6,
        fillColor: '#ff3f3f',
        color: '#ff0000',
        weight: 1,
        opacity: 1,
        fillOpacity: 1.0,
      };
      return marker;
    },

    // returns map markers as simple object with a geometry property, key,
    // and optional properties for symbology
    markersForAddress() {
      // console.log('markers-mixin.js markersForAddress computed is running');
      const markers = [];
      // geocoded address marker
      const geocodeGeom = this.geocodeGeom;
      if (this.identifyFeature === 'address-marker' && geocodeGeom) {
        const latlng = [ ...geocodeGeom.coordinates ].reverse();
        const key = this.geocodeResult.properties.street_address;
        const color = '#2176d2';
        const markerType = 'geocode';
        const icon = {
          prefix: 'fas',
          icon: 'map-marker-alt',
          shadow: true,
          size: 50,
        };
        const addressMarker = {
          latlng, key, color, markerType, icon
        };
        markers.push(addressMarker);
      }
      return markers;
    },

    // returns geojson parcels to be rendered on the map along with
    // necessary props.
    geojsonParcels() {
      console.log('markers-mixin.js, recalculating geojsonParcels');
      let features;
      let shapes = [];
      let blockShapes = [];
      if (this.$store.state.shapeSearch.data) {
        shapes = this.$store.state.shapeSearch.data.rows;
      } else if (this.$store.state.blockSearch.data) {
        blockShapes = this.$store.state.blockSearch.data;
      }
      if (this.pwdParcel){
        let props = {};
        console.log('markers-mixin.js, recalculating geojsonParcels, this.pwdParcel:', this.pwdParcel);
        features = this.pwdParcel;
        if(features.length > 1) {
          // features.forEach( feature => Object.assign(feature.properties, props));
          for (let feature of features) {
            // console.log('feature:', feature, 'shapes:', shapes);
            if (shapes.length) {
              for (let shape of shapes) {
                if (shape.pwd_parcel_id === feature.properties.PARCELID) {
                  feature.properties._featureId = shape._featureId;
                  break;
                }
              }
            } else if (blockShapes.length) {
              for (let shape of blockShapes) {
                // console.log('blockShapes loop, shape.properties.pwd_parcel_id:', shape.properties.pwd_parcel_id, 'feature.properties.PARCELID:', feature.properties.PARCELID);
                if (shape.properties.pwd_parcel_id == feature.properties.PARCELID) {
                  feature.properties._featureId = shape._featureId;
                  break;
                }
              }
            }
          }
        } else if (typeof features[0] !== 'undefined') {
          // console.log("features:", features)
          Object.assign(features[0].properties, props);
          features = [ features[0] ];
          features[0].properties._featureId = 'feat-geocode-0';
        } else {
          Object.assign(features.properties, props);
          features = [ features ];
        }
      }
      console.log('markers-mixin.js, recalculating geojsonParcels, features: ', features);
      return features;
    },
  },
  methods: {
    identifyRow(featureId) {
      console.log("identifyRow starting", featureId);
      let rowId;
      if (this.$store.state.geocode.status === "success" && this.$store.state.lastSearchMethod !== 'shape search' && this.$store.state.lastSearchMethod !== 'buffer search') {
        // console.log(this.$store.state.geocode.data)
        let pwd_parcel_id = Number(this.$store.state.geocode.data.properties.pwd_parcel_id);
        // console.log("opa_account_num: ", pwd_parcel_id, "featureId: ", featureId)
        rowId = pwd_parcel_id === featureId ? this.$store.state.geocode.data._featureId : null;
        // console.log("rowId from geocode success: ", rowId)
      } else if (this.$store.state.ownerSearch.status === "success" && this.$store.state.lastSearchMethod !== 'shape search' && this.$store.state.lastSearchMethod !== 'buffer search') {
        let result = this.$store.state.ownerSearch.data.filter( function(object) {
          // console.log("object.properties.pwd_parcel_id: ", object.properties.pwd_parcel_id, "featureId: ", featureId)
          return Number(object.properties.pwd_parcel_id) === featureId;
        });
        rowId = result[0]._featureId;
      }  else if (this.$store.state.blockSearch.status === "success" && this.$store.state.lastSearchMethod !== 'shape search' && this.$store.state.lastSearchMethod !== 'buffer search') {
        let result = this.$store.state.blockSearch.data.filter( function(object) {
          // console.log("object.properties.pwd_parcel_id: ", object.properties.pwd_parcel_id, "featureId: ", featureId)
          return Number(object.properties.pwd_parcel_id) === featureId;
        });
        rowId = result[0]._featureId;
      } else if (this.$store.state.shapeSearch.status === "success") {
        let result = this.$store.state.shapeSearch.data.rows.filter( function(object){
          return object.pwd_parcel_id === featureId;
        });
        if(typeof result[0] != 'undefined') {
          rowId = result[0]._featureId;
        } else {
          // console.log("rowId = null")
          rowId = null;
        }
      } else {
        // console.log("rowId = null")
        rowId = null;
      }
      // console.log("rowId: ", rowId)
      return rowId;
    },
    getTableFromComps(comps, tableId) {
      const matchingComps = comps.filter(comp => {
        return (
          comp.type === 'horizontal-table' &&
          comp._id == tableId
        );
      }) || [];
      return matchingComps[0];
    },
    getConfigForTable(tableId) {
      const topics = this.$config.topics || [];

      for (let topic of topics) {
        const comps = topic.components || [];

        // try outer comps
        const table = this.getTableFromComps(comps, tableId);

        if (table) {
          return table;
        }

        // try inner comps
        for (let comp of comps) {
          const options = comp.options || {};

          const innerComps = options.components || options.tables || [];

          if (innerComps.length > 0) {
            const innerTable = this.getTableFromComps(innerComps, tableId);
            // console.log('table on 2nd try', innerTable, innerComps);

            if (innerTable) {
              return innerTable;
            }
          }
        }
      }
    },
    handleMarkerMouseover: throttle(function (e) {
    // handleMarkerMouseover(e) {
      // console.log('handleMarkerMouseover is starting');
      if (!this.isMobileOrTablet) {
        // console.log('handleMarkerMouseover actions are running, e.target.options:', e.target.options);
        // const { target } = e;
        console.log('handleMarkerMouseover, e:', e, 'e.mapboxEvent:', e.mapboxEvent, 'e.mapboxEvent.features[0].properties.parcelId:', e.mapboxEvent.features[0].properties.parcelId);
        // const featureId  = this.identifyRow(target.options.data.PARCELID);
        let value = e.mapboxEvent.features[0].properties.parcelId;
        // const featureId  = this.identifyRow(e.layerId);
        const featureId  = this.identifyRow(value);
        // console.log('featureId: ', featureId, "target: ", target);
        this.$store.commit('setActiveFeature', { featureId });
      }
    }, 20,
    ),
    handleMarkerMouseout(e) {
      if (!this.isMobileOrTablet) {
        console.log('handleMarkerMouseout is starting, e:', e);
        let value = e.component.source.data.properties.featureId;
        console.log('handleMarkerMouseout is starting, e:', e, 'value:', value);
        // if (!this.isMobileOrTablet) {
        // console.log('handleMarkerMouseout actions are running');
        // const { target } = e;
        if (this.activeFeature.featureId === value) {
          this.$store.commit('setActiveFeature', null);
        }
      }
    },
  },
};
