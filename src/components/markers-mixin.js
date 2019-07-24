import VectorIcon from 'leaflet-vector-icon';
import { divIcon } from 'leaflet';
import { Marker } from 'leaflet';

export default {

  watch: {
    activeFeature(nextActiveFeature, prevActiveFeature) {
      // console.log('WATCH active feature', prevActiveFeature, '=>', nextActiveFeature);

      const layerMap = this.$store.state.map.map._layers;
      const layers = Object.values(layerMap);

      let updateFeaturePrev,
          updateFeatureNext,
          featureIdPrev,
          featureIdNext,
          matchingLayerNext,
          matchingLayerPrev;

      if (prevActiveFeature && prevActiveFeature.featureId) {
        // console.log('first');
        updateFeaturePrev = prevActiveFeature;
        featureIdPrev = this.identifyMarker(prevActiveFeature);
        matchingLayerPrev = layers.filter(layer => {
          const options = layer.options || {};
          const data = options.data;
          // console.log("data: ", data)
          if (!data) return;
          const layerFeatureId = data.PARCELID;
          // console.log("layerFeatureId: ", layerFeatureId, "featureIdPrev: ", featureIdPrev)
          return layerFeatureId === featureIdPrev;
        })[0];
        // console.log("matchingLayerPrev", matchingLayerPrev)
        this.updateMarkerFillColor(matchingLayerPrev);
      }

      if (nextActiveFeature && nextActiveFeature.featureId) {
        updateFeatureNext = nextActiveFeature;
        featureIdNext = this.identifyMarker(updateFeatureNext);
        // console.log('second, nextActiveFeature.featureId:', nextActiveFeature.featureId, 'featureIdNext:', featureIdNext);
        matchingLayerNext = layers.filter(layer => {
          const options = layer.options || {};
          const data = options.data;
          // console.log("data: ", data)
          if (!data) return;
          // console.log(layer)
          const layerFeatureId = layer.options.data.PARCELID;
          // const layerFeatureId = layer.feature.properties.PARCELID;
          // console.log("layerFeatureId: ", layerFeatureId, "featureIdNext: ", featureIdNext, 'nextActiveFeature.featureId:', nextActiveFeature.featureId);
          if (layerFeatureId === nextActiveFeature.featureId || layerFeatureId === featureIdNext) {
            return true;
          }
          // return layerFeatureId === featureIdNext;
        })[0];
        // console.log('matchingLayerNext:', matchingLayerNext);
        this.updateMarkerFillColor(matchingLayerNext);
        // this.bringMarkerToFront(matchingLayerNext);
      }

    },
  },
  computed: {
    locationMarker() {
      const latlngArray = [this.$store.state.map.location.lat, this.$store.state.map.location.lng]
      const marker = {
        latlng: latlngArray,
        radius: 6,
        fillColor: '#ff3f3f',
        color: '#ff0000',
        weight: 1,
        opacity: 1,
        fillOpacity: 1.0
      }
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
        const latlng = [...geocodeGeom.coordinates].reverse();
        const key = this.geocodeResult.properties.street_address;
        const color = '#2176d2';
        const markerType = 'geocode';
        const icon = {
          prefix: 'fas',
          icon: 'map-marker-alt',
          shadow: true,
          size: 50,
        }
        const addressMarker = {latlng, key, color, markerType, icon};
        markers.push(addressMarker);
      }
      return markers;
    },

    markersForBufferSearch() {
      // console.log('markers-mixin.js markersForBufferSearch computed is running');
      const markers = [];
      // geocoded address marker
      const geocodeGeom = this.lastGeocodeGeom;
      if (this.identifyFeature === 'address-marker' && Object.keys(geocodeGeom).length > 0) {
        const latlng = [...geocodeGeom.coordinates].reverse();
        const key = this.lastGeocodeResult.properties.street_address;
        const color = '#2176d2';
        const markerType = 'geocode';
        const icon = {
          prefix: 'fas',
          icon: 'map-marker-alt',
          shadow: true,
          size: 50,
        }
        const addressMarker = {latlng, key, color, markerType, icon};
        markers.push(addressMarker);
      }
      return markers;
    },

    // returns geojson parcels to be rendered on the map along with
    // necessary props.
    geojsonParcels() {
      let features;
      if(this.pwdParcel){
        let props = {};
        // console.log("this.pwdParcel: ", this.pwdParcel)
        features = this.pwdParcel;
        props.color = 'blue';
        props.fillColor = 'blue';
        props.weight = 2;
        props.opacity = 1;
        props.fillOpacity = 0.3;
        if(features.length > 1) {
          features.forEach( feature => Object.assign(feature.properties, props));
        } else if (typeof features[0] !== 'undefined') {
          // console.log("features:", features)
          Object.assign(features[0].properties, props);
          features = [features[0]]
        } else {
          Object.assign(features.properties, props);
          features = [features]
        }
      }
      // console.log("feature from geojsonParcels: ", features)
      return features;
    },

    markersForTopic() {
      const markers = [];

      // marker for topic from config
      const topicMarkers = this.activeTopicConfig.markersForTopic;
      if (topicMarkers) {
        const state = this.$store.state;
        const topicData = topicMarkers.data(state);
        if (topicData !== null) {

            const latlng = [topicData[topicMarkers.lat], topicData[topicMarkers.lng]];
            const key = topicData[topicMarkers.key];
            const color = topicMarkers.color || 'green';
            const markerType = 'overlay';
            const icon = topicMarkers.icon;
            const markerObject = {latlng, key, color, markerType, icon};
            markers.push(markerObject);
          // }
        }
      }
      return markers;
    },

    circleMarkers() {
      const filteredData = this.$store.state.horizontalTables.filteredData;
      // const filteredData = this.filteredData;
      let circleMarkers = [];

      // get visible tables based on active topic
      const tableIds = this.$store.getters.visibleTableIds;

      // console.log('computed circleMarkers is rerunning, filteredData:', filteredData, 'tableIds:', tableIds);

      for (let tableId of tableIds) {
        const tableConfig = this.getConfigForTable(tableId) || {};
        // console.log('tableId:', tableId, 'tableConfig:', tableConfig);
        const mapOverlay = (tableConfig.options || {}).mapOverlay;

        if (!mapOverlay || mapOverlay.marker !== 'circle') {
          continue;
        }

        const items = filteredData[tableId];

        if (items.length < 1) {
          continue;
        }

        const style = mapOverlay.style;

        // go through rows
        for (let item of items) {
          // console.log('tableId', tableId)
          let latlng;

          // TODO - get geometry field name from config
          if (item.geometry) {
            const [x, y] = item.geometry.coordinates;
            latlng = [y, x];
          } else if (item.lat) {
            latlng = [item.lat, item.lng]
            // if (item.point_x) {
            //   latlng = [item.point_y, item.point_x];
            // } else if (item.geocode_x) {
            //   latlng = [item.geocode_y, item.geocode_x];
            // }
          }

          // check for active feature TODO - bind style props to state
          let props = Object.assign({}, style);
          props.latlng = latlng;
          props.featureId = item._featureId;
          props.tableId = tableId;
          circleMarkers.push(props);
        }
      }

      return circleMarkers;
    },

    tableMarkers() {
      const filteredData = this.$store.state.horizontalTables.filteredData;
      // const filteredData = this.filteredData;
      let tableMarkers = [];

      // get visible tables based on active topic
      const tableIds = this.$store.getters.visibleTableIds;

      // console.log('computed tableIdMarkers is rerunning, filteredData:', filteredData, 'tableIds:', tableIds);

      for (let tableId of tableIds) {
        const tableConfig = this.getConfigForTable(tableId) || {};
        // console.log('tableId:', tableId, 'tableConfig:', tableConfig);
        const mapOverlay = (tableConfig.options || {}).mapOverlay;

        if (!mapOverlay || mapOverlay.marker !== 'vector') {
          continue;
        }

        const items = filteredData[tableId];

        if (items.length < 1) {
          continue;
        }

        const style = mapOverlay.style;

        // go through rows
        for (let item of items) {
          // console.log('tableId', tableId)
          let latlng;

          // TODO - get geometry field name from config
          if (item.geometry) {
            const [x, y] = item.geometry.coordinates;
            latlng = [y, x];
          } else if (item.lat) {
            latlng = [item.lat, item.lng]
            // if (item.point_x) {
            //   latlng = [item.point_y, item.point_x];
            // } else if (item.geocode_x) {
            //   latlng = [item.geocode_y, item.geocode_x];
            // }
          }

          // check for active feature TODO - bind style props to state
          let props = Object.assign({}, style);
          props.latlng = latlng;
          props.featureId = item._featureId;
          props.tableId = tableId;
          tableMarkers.push(props);
        }
      }

      return tableMarkers;
    },


    // returns other geojson from config
    geojsonForTopic() {
      const features = [];
      const topicGeojson = this.activeTopicConfig.geojsonForTopic;
      if (topicGeojson) {
        const state = this.$store.state;
        const topicData = topicGeojson.data(state);
        if (topicData !== null) {
          for (let geojson of topicData) {
            let props = Object.assign({}, topicGeojson.style);
            props.key = geojson[topicGeojson.key];
            props.geojson = geojson
            features.push(props);
          }
        }
      }
      return features;
    },

    // these geojson features will have mouseover and mouseout events,
    // for highlighting horizontal table rows
    reactiveGeojsonFeatures() {
      const features = [];
      let style;

      if (this.$store.state.shapeSearch.data !== null) {

        let item = this.$store.state.shapeSearch.data.rows;
        let props = Object.assign({}, style);

        props.featureId = item._featureId || null;
        features.push(props);
      }
      return features;

    },

    leafletMarkers() {
      // console.log("leafletMarkers is running")
      const markers = [];

      markers.push.apply(markers, this.markers);
      // console.log("this.geojsonParcels: ", this.geojsonParcels)
      markers.push.apply(markers, this.geojsonParcels);

      return markers;
    },
  },
  methods: {
    identifyMarker(feature) {
      // console.log('identifyMarker starting: feature.featureId', feature.featureId, 'feature.featureId.toString().slice(0,6):', feature.featureId.toString().slice(0,6));
      let featureId;
      if (this.$store.state.geocode.status === "success" && this.$store.state.lastSearchMethod !== 'shape search') {
        const geocodeId = this.$store.state.geocode.data._featureId;
        // console.log('identifyMarker, geocode.status is success, geocodeId:', geocodeId);
        // featureId = this.$store.state.geocode.data._featureId === parseInt(feature.featureId.toString().slice(0,6)) ?
        if (geocodeId === feature.featureId || geocodeId === parseInt(feature.featureId.toString().slice(0,6))) {
          featureId = parseInt(this.$store.state.geocode.data.properties.pwd_parcel_id);
          // featureId = geocodeId;
        } else {
          featureId = null;
        }
        // Number(this.$store.state.geocode.data.properties.pwd_parcel_id) : null


      } else if (this.$store.state.ownerSearch.status === "success" ) {
        let result = this.$store.state.ownerSearch.data.filter( function(object) {
          return object._featureId === parseInt(feature.featureId.toString().slice(0,6));
        });
        // console.log(result)
        featureId = result.length > 0 ? Number(result[0].properties.pwd_parcel_id) : null


      } else if (this.$store.state.shapeSearch.status === "success") {
        let result = this.$store.state.shapeSearch.data.rows.filter( function(object) {
          // return object._featureId === parseInt(feature.featureId.toString().slice(0,6));
          return object._featureId === feature.featureId;
        });
        if(typeof result[0] != 'undefined'){
          featureId = Number(result[0].pwd_parcel_id)
        } else { return }
      } else {
        featureId = null
      }
      // console.log('end of identifyMarker, featureId:', featureId);
      return featureId
    },
    identifyRow(featureId) {
      // console.log("identifyRow starting", featureId)
      let rowId;
      if (this.$store.state.geocode.status === "success" && this.$store.state.lastSearchMethod !== 'shape search') {
        // console.log(this.$store.state.geocode.data)
        let pwd_parcel_id = Number(this.$store.state.geocode.data.properties.pwd_parcel_id);
        // console.log("opa_account_num: ", pwd_parcel_id, "featureId: ", featureId)
        rowId = pwd_parcel_id === featureId ? this.$store.state.geocode.data._featureId : null;
        // console.log("rowId from geocode success: ", rowId)
      } else if (this.$store.state.ownerSearch.status === "success" ) {
          let result = this.$store.state.ownerSearch.data.filter( function(object) {
            // console.log("object.properties.pwd_parcel_id: ", object.properties.pwd_parcel_id, "featureId: ", featureId)
          return Number(object.properties.pwd_parcel_id) === featureId
        });
        rowId = result[0]._featureId
      } else if (this.$store.state.shapeSearch.status === "success") {
        let result = this.$store.state.shapeSearch.data.rows.filter( function(object){
          return object.pwd_parcel_id === featureId
        });
        if(typeof result[0] != 'undefined') {
          rowId = result[0]._featureId
        } else {
          // console.log("rowId = null")
          rowId = null
        }
      } else {
        // console.log("rowId = null")
        rowId = null
      }
      // console.log("rowId: ", rowId)
      return rowId
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

        if (table) return table;

        // try inner comps
        for (let comp of comps) {
          const options = comp.options || {};

          const innerComps = options.components || options.tables || [];

          if (innerComps.length > 0) {
            const innerTable = this.getTableFromComps(innerComps, tableId);
            // console.log('table on 2nd try', innerTable, innerComps);

            if (innerTable) return innerTable;
          }
        }
      }
    },
    bringMarkerToFront(circleMarker) {
      // put marker on top
      const el = circleMarker._path;

      // remove from parent
      const group = circleMarker._renderer._rootGroup;
      group.removeChild(el);

      // append to end (which brings it to the front)
      group.appendChild(el);
    },
    handleMarkerMouseover(e) {
      // console.log('handleMarkerMouseover is starting');
      if (!this.isMobileOrTablet) {
        // console.log('handleMarkerMouseover actions are running, e.target.options:', e.target.options);
        const { target } = e;
        // console.log('PARCEL ID target:', target);
        const featureId  = this.identifyRow(target.options.data.PARCELID);
        // console.log('featureId: ', featureId, "target: ", target);
        this.$store.commit('setActiveFeature',  {featureId} );
      }
    },
    handleMarkerMouseout(e) {
      // console.log('handleMarkerMouseout is starting');
      // if (!this.isMobileOrTablet) {
        // console.log('handleMarkerMouseout actions are running');
        const { target } = e;
        this.$store.commit('setActiveFeature', null);
      // }
    },
    updateMarkerFillColor(marker) {
      // console.log('updateMarkerFillColor is running, marker:', marker)
      // get next fill color
      // console.log("Marker: ", marker)
      // console.log(this.$store.state.geocode.data._featureId)
      if(typeof marker != 'undefined') {
        // console.log("marker.options.data: ", marker.options.data)
        const featureId = Number(marker.options.data.PARCELID);
        const activeFeature = this.$store.state.activeFeature;
        // highlight. we're doing this here (non-reactively) because binding the
        // fill color property was not performing well enough.
        const nextStyle = Object.assign({}, marker.options);
        // console.log("Marker: ", marker)
        // console.log("fillColor: ", nextFillColor, "nextStyle: ", nextStyle)
        const nextFillColor = this.fillColorForOverlayMarker(featureId, activeFeature);
        nextStyle.fillColor = nextFillColor;
        marker.setStyle(nextStyle);
        // console.log("nextFillColor: ", nextFillColor)
      }
    },
    styleForMarker(markerId) {
      // get map overlay style and hover style for table
      const mapOverlay = this.$config.mapOverlay;
      const { style, hoverStyle } = mapOverlay;
      // console.log("style: ", style, "hoverStyle: ", hoverStyle)

      // compare id to active feature id
      const activeFeature = this.activeFeature;
      const useHoverStyle = (
        markerId === activeFeature.featureId
      );
      // console.log("markerId: ", markerId, "activeFeature.featureId: ", activeFeature.featureId)
      const curStyle = useHoverStyle ? hoverStyle : style;

      return curStyle;
    },
  }
};
