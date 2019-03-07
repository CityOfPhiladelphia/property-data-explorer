import VectorIcon from 'leaflet-vector-icon';
import { divIcon } from 'leaflet';
import { Marker } from 'leaflet';

export default {
  watch: {
    activeFeature(nextActiveFeature, prevActiveFeature) {
      console.log('WATCH active feature', prevActiveFeature, '=>', nextActiveFeature);
      const layerMap = this.$store.state.map.map._layers;
      const layers = Object.values(layerMap);
      if (prevActiveFeature && prevActiveFeature.featureId) {
        this.identifyMarker(prevActiveFeature, layers);
      }
      if (nextActiveFeature && nextActiveFeature.featureId) {
        this.identifyMarker(nextActiveFeature, layers);
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
        } else {
          Object.assign(features.properties, props);
          features = [features]
        }
      }
      console.log("features: ", features)
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

      console.log('computed tableIdMarkers is rerunning, filteredData:', filteredData, 'tableIds:', tableIds);

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

      // const filteredData = this.$store.state.horizontalTables.filteredData;
      // // get visible tables based on active topic
      // const tableIds = this.$store.getters.visibleTableIds;
      //
      // for (let tableId of tableIds) {
      //   const tableConfig = this.getConfigForTable(tableId) || {};
      //   const mapOverlay = (tableConfig.options || {}).mapOverlay;
      //
      //   if (!mapOverlay || mapOverlay.marker !== 'geojson') {
      //     continue;
      //   }
      //
      //   const items = filteredData[tableId];
      //
      //   if (items.length < 1) {
      //     continue;
      //   }
      //
      //   const style = mapOverlay.style;
      //   items.push(tableId);
      //
      //   // go through rows

      let style;

      if (this.$store.state.shapeSearch.data !== null) {

        let item = this.$store.state.shapeSearch.data.rows;

        let props = Object.assign({}, style);

        // props.geojson = item.geometry;
        // props.key = item.id;
        props.featureId = item._featureId || null;
        // props.tableId = items[items.length-1];
        features.push(props);
        // }
      }
      return features;

    },

    leafletMarkers() {
      console.log("leafletMarkers is running")
      const markers = [];

      markers.push.apply(markers, this.markers);
      markers.push.apply(markers, this.geojsonParcels);

      return markers;
    },
  },
  methods: {
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
      console.log('handleMarkerMouseover is starting');
      if (!this.isMobileOrTablet) {
        // console.log('handleMarkerMouseover actions are running');
        const { target } = e;
        console.log('target:', target);
        // console.log('target:', target, 'featureId:', featureId, 'tableId:', tableId);
        const { featureId, tableId } = target.options.data;
        this.$store.commit('setActiveFeature', { featureId, tableId });
      }
    },
    handleMarkerClick(e) {
      // console.log('handleMarkerClick is starting');
      if (this.isMobileOrTablet) {
        // console.log('handleMarkerClick actions are running');
        const { target } = e;
        const { featureId, tableId } = target.options.data;
        // console.log('target:', target, 'featureId:', featureId, 'tableId:', tableId);
        this.$store.commit('setActiveFeature', { featureId, tableId });
      }
    },
    handleMarkerMouseout(e) {
      console.log('handleMarkerMouseout is starting');
      // if (!this.isMobileOrTablet) {
        // console.log('handleMarkerMouseout actions are running');
        const { target } = e;
        this.$store.commit('setActiveFeature', null);
      // }
    },
    identifyMarker(feature, layers) {
      console.log('identifyMarker is running, feature:', feature, "layers: ", layers);

      let featureId

      if (this.$store.state.geocode.status === "success"){
        featureId = this.$store.state.geocode.data.properties.opa_account_num
      } else if (this.$store.state.ownerSearch.status === "success") {
        let result = this.$store.state.ownerSearch.data.filter(object => {
          return object._featureId === feature.featureId
        });
        featureId = result[0].properties.opa_account_num
      } else {
        let result = this.$store.state.shapeSearch.data.rows.filter(object => {
          return object._featureId === feature.featureId
        });
        featureId = result[0].parcel_number
      }


      console.log("featureId: ", featureId);
      const matchingLayer = layers.filter(layer => {
        const options = layer.options || {};
        console.log("options: ", options)
        const data = options.data;
        console.log("data: ", data)
        if (!data) return;
        const layerFeatureId = data.BRT_ID;
        console.log("layerFeatureId: ", layerFeatureId)
        // const layerTableId = data.tableId;
        // return layerFeatureId === featureId && layerTableId === tableId;
        return layerFeatureId === featureId;
      })[0];
      console.log('identifyMarker, matchingLayer:', matchingLayer);
      // if (matchingLayer.options.icon) {
      //   this.updateVectorMarkerColor(matchingLayer);
      // } else {
      //   this.updateMarkerFillColor(matchingLayer);
      // }
    },

    updateMarkerFillColor(marker) {
      // console.log('updateMarkerFillColor, marker:', marker);
      // get next fill color
      const featureId = marker.options.data.BRT_ID;
      const nextFillColor = this.fillColorForCircleMarker(featureId);

      // highlight. we're doing this here (non-reactively) because binding the
      // fill color property was not performing well enough.
      const nextStyle = Object.assign({}, marker.options);
      nextStyle.fillColor = nextFillColor;
      marker.setStyle(nextStyle);
    },

    fillColorForCircleMarker(markerId) {
      // console.log('markerId: ', markerId);
      // get map overlay style and hover style for table
      // const tableConfig = this.getConfigForTable(tableId);

      console.log(this)


      const mapOverlay = tableConfig.options.mapOverlay;
      const { style, hoverStyle } = mapOverlay;

      // compare id to active feature id
      const activeFeature = this.activeFeature;
      const useHoverStyle = (
        markerId === activeFeature.featureId
      );
      const curStyle = useHoverStyle ? hoverStyle : style;

      return curStyle.fillColor;
    },

    updateVectorMarkerColor(marker) {
      console.log('updateMarkerFillColor, marker:', marker);
      // get next fill color
      const { featureId } = marker.options.data;
      const nextStyle = this.styleForMarker(featureId );
      console.log('nextStyle:', nextStyle);
      let icon;
      if (marker.options.icon) {
        icon = new divIcon({
          html: '<i class="'+ nextStyle.prefix + ' fa-' + nextStyle.fa + ' fa-' + nextStyle.size + 'x" style="color: ' + nextStyle.fillColor + '"></i>',
          iconSize: [20, 20],
          className: 'myDivIcon'
        })
      }
      console.log('updateMarkerFillColor icon created:', icon);

      // highlight. we're doing this here (non-reactively) because binding the
      // fill color property was not performing well enough.
      marker.setIcon(icon);
    },

    styleForMarker(markerId, tableId) {
      // get map overlay style and hover style for table
      const tableConfig = this.getConfigForTable(tableId);
      const mapOverlay = tableConfig.options.mapOverlay;
      const { style, hoverStyle } = mapOverlay;

      // compare id to active feature id
      const activeFeature = this.activeFeature;
      const useHoverStyle = (
        markerId === activeFeature.featureId &&
        tableId === activeFeature.tableId
      );
      const curStyle = useHoverStyle ? hoverStyle : style;

      return curStyle;
    },
  }
};
