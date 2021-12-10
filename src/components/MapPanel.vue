<template>
  <div
    id="map-panel-container"
    :class="mapPanelContainerClass + ' surrounding-div print-hide'"
  >

    <full-screen-map-toggle-tab-vertical
      v-if="!leftPanel && !this.fullScreenTopicsEnabled"
      v-once
    />

    <!-- <div
      class="grid-x"
    > -->
    <div
      id="map-tag"
      :class="mapPanelClass"
    >
    <!-- :class="'grid-x ' + mapPanelClass" -->
    <!-- class="grid-x" -->

      <MglMap
        :map-style.sync="$config.mbStyle"
        :bounds="boundsProp"
        :zoom="$store.state.map.zoom"
        :center="$store.state.map.center"
        :cyclo-orientation="currentCycloOrientation"
        @click="handleMapClick"
        @moveend="handleMapMove"
        @load="onMapLoaded"
        @preload="onMapPreloaded"
      >

        <MglRasterLayer
          v-for="(basemapSource, key) in basemapSources"
          v-if="shouldShowRasterLayer && activeBasemap === key"
          :key="key"
          :sourceId="activeBasemap"
          :layerId="activeBasemap"
          :layer="basemapSource.layer"
          :source="basemapSource.source"
          :before="basemapsBefore"
        />

        <MglRasterLayer
          v-for="(basemapLabelSource, key) in basemapLabelSources"
          v-if="shouldShowRasterLayer && tiledLayers.includes(key)"
          :key="key"
          :sourceId="key"
          :layerId="key"
          :layer="basemapLabelSource.layer"
          :source="basemapLabelSource.source"
          :before="basemapsBefore"
        />

        <MglMarker
          v-for="(marker) in markersForAddress"
          :key="marker.key"
          :coordinates="[marker.latlng[1], marker.latlng[0]]"
          :color="marker.color"
          :icon="marker.icon"
          :anchor="'bottom'"
        />

        <mapbox-basemap-select-control />

        <MglGeojsonLayer
          v-for="(geojsonParcelSource, index) in geojsonParcelSources"
          :key="'dorParcelLine'+index"
          :source-id="'geojsonParcel'+index"
          :source="geojsonParcelSource"
          :layer-id="'geojsonParcelLine'+index"
          :layer="geojsonParcelLineLayer"
          :clear-source="true"
        />

        <MglGeojsonLayer
          v-for="(geojsonParcelSource, index) in geojsonParcelSources"
          :key="'dorParcelFill'+index"
          :source-id="'geojsonParcel'+index"
          :source="geojsonParcelSource"
          :layer-id="'geojsonParcelFill'+index"
          :layer="geojsonParcelFillLayer"
          :clear-source="true"
        />

        <MglButtonControl
          :button-id="'buttonId-01'"
          :button-class="'right top-button-1'"
          :image-link="basemapImageLink"
          :image-align="'top'"
          @click="handleBasemapToggleClick"
        />

        <MglButtonControl
          v-if="shouldShowCyclomediaButton"
          :button-id="'buttonId-03'"
          :button-class="cyclomediaActive ? 'right top-button-2 active' : 'right top-button-2 inactive'"
          :image-link="sitePath + '/images/cyclomedia.png'"
          @click="handleCyclomediaButtonClick"
        />

        <mapbox-address-input
          :placeholder="addressInputPlaceholder"
          :width-from-config="addressInputWidth"
          @handle-search-form-submit="handleSearchFormSubmit"
        />

        <buffer-control
          :button-height="'45px'"
          :button-width="'100%'"
          :position="'top-left'"
          :top="'80px'"
          :left="'30px'"
          :class="buttonClass + ' buffer-control ' + bufferButtonActiveClass"
        />

        <!-- <div class="draw-control"> -->
        <draw-control
          :control="true"
          :button-height="'45px'"
          :button-width="'100%'"
          :position="'top-left'"
          :top="'94px'"
          :left="'30px'"
          :class="buttonClass + ' buffer-control ' + bufferButtonActiveClass"
          @drawModeChange="handleDrawModeChange"
          @drawButtonClicked="handleDrawButtonClick"
          @drawFinish="handleDrawFinish"
        />
        <!-- :position="'bottom-left'" -->
        <!-- </div> -->

      </MglMap>


    </div>
    <slot
      class="widget-slot"
      name="cycloWidget"
    />



  </div>
</template>

<script>


import bbox from '@turf/bbox';
import bboxPolygon from '@turf/bbox-polygon';
import destination from '@turf/destination';
import distance from '@turf/distance';
import midpoint from '@turf/midpoint';
import area from '@turf/area';
// import convertArea from '@turf/convertArea';
import { point, polygon, convertArea, featureCollection } from '@turf/helpers';

// import * as L from 'leaflet';
import { featureGroup, geoJSON, marker } from 'leaflet';
// import 'leaflet/dist/leaflet.css';

import 'maplibre-gl/dist/maplibre-gl.css';
// import 'mapbox-gl/dist/mapbox-gl.css';

const FeatureGroup = featureGroup;
const GeoJSON = geoJSON;
const Lmarker = marker;
// const FeatureGroup = L.default.featureGroup;
// const GeoJSON = L.default.geoJSON;
// const Lmarker = L.default.marker;

// mixins
import markersMixin from './markers-mixin';
import cyclomediaMixin from '@phila/vue-mapping/src/cyclomedia/map-panel-mixin-update.js';


// components
import CyclomediaRecordingsClient from '@phila/vue-mapping/src/cyclomedia/recordings-client.js';
import ControlCorner from '@phila/vue-mapping/src/leaflet/ControlCorner.vue';
import FullScreenMapToggleTab from '@phila/vue-mapping/src/components/FullScreenMapToggleTab.vue';
import FullScreenMapToggleTabVertical from '@phila/vue-mapping/src/components/FullScreenMapToggleTabVertical.vue';
import Map_ from '@phila/vue-mapping/src/leaflet/Map.vue';
import LocationControl from '@phila/vue-mapping/src/components/LocationControl.vue';
import BasemapToggleControl from '@phila/vue-mapping/src/components/BasemapToggleControl.vue';
import BasemapSelectControl from '@phila/vue-mapping/src/components/BasemapSelectControl.vue';
import PictometryButton from '@phila/vue-mapping/src/pictometry/Button.vue';
import CyclomediaButton from '@phila/vue-mapping/src/cyclomedia/Button.vue';
import MeasureControl from '@phila/vue-mapping/src/components/MeasureControl.vue';
import LegendControl from '@phila/vue-mapping/src/components/LegendControl.vue';
import MapAddressInput from '@phila/vue-mapping/src/components/MapAddressInput.vue';
import DrawControl from '@phila/vue-mapping/src/mapbox/UI/controls/MbDrawControl.vue';
import BufferControl from '@phila/vue-mapping/src/components/BufferControl.vue';

export default {
  name: 'MapPanel',
  components: {
    DrawControl,
    BufferControl,
    Control: () => import(/* webpackChunkName: "mbmp_pvm_Control" */'@phila/vue-mapping/src/leaflet/Control.vue'),
    EsriTiledMapLayer: () => import(/* webpackChunkName: "mbmp_pvm_EsriTiledMapLayer" */'@phila/vue-mapping/src/esri-leaflet/TiledMapLayer.vue'),
    // EsriTiledOverlay: () => import(/* webpackChunkName: "mbmp_pvm_EsriTiledOverlay" */'@phila/vue-mapping/src/esri-leaflet/TiledOverlay.vue'),
    EsriDynamicMapLayer: () => import(/* webpackChunkName: "mbmp_pvm_EsriDynamicMapLayer" */'@phila/vue-mapping/src/esri-leaflet/DynamicMapLayer.vue'),
    EsriFeatureLayer: () => import(/* webpackChunkName: "mbmp_pvm_EsriFeatureLayer" */'@phila/vue-mapping/src/esri-leaflet/FeatureLayer.vue'),
    Geojson: () => import(/* webpackChunkName: "mbmp_pvm_Geojson" */'@phila/vue-mapping/src/leaflet/Geojson.vue'),
    Polygon_: () => import(/* webpackChunkName: "mbmp_pvm_Geojson" */'@phila/vue-mapping/src/leaflet/Polygon.vue'),
    CircleMarker: () => import(/* webpackChunkName: "mbmp_pvm_CircleMarker" */'@phila/vue-mapping/src/leaflet/CircleMarker.vue'),
    VectorMarker: () => import(/* webpackChunkName: "mbmp_pvm_VectorMarker" */'@phila/vue-mapping/src/components/VectorMarker.vue'),
    PngMarker: () => import(/* webpackChunkName: "mbmp_pvm_PngMarker" */'@phila/vue-mapping/src/components/PngMarker.vue'),
    CyclomediaRecordingCircle: () => import(/* webpackChunkName: "mbmp_pvm_CyclomediaRecordingCircle" */'@phila/vue-mapping/src/cyclomedia/RecordingCircle.vue'),
    SvgViewConeMarker: () => import(/* webpackChunkName: "mbmp_pvm_CyclomediaSvgViewConeMarker" */'@phila/vue-mapping/src/cyclomedia/SvgViewConeMarker.vue'),
    BasemapTooltip: () => import(/* webpackChunkName: "mbmp_pvm_BasemapTooltip" */'@phila/vue-mapping/src/components/BasemapTooltip.vue'),
    ControlCorner,
    FullScreenMapToggleTab,
    FullScreenMapToggleTabVertical,
    Map_,
    LocationControl,
    BasemapToggleControl,
    BasemapSelectControl,
    PictometryButton,
    CyclomediaButton,
    MeasureControl,
    LegendControl,
    MapAddressInput,
    MglMap: () => import(/* webpackChunkName: "pvm_MglMap" */'@phila/vue-mapping/src/mapbox/map/MaplibreGlMap.vue'),
    // MglMap: () => import(/* webpackChunkName: "pvm_MglMap" */'@phila/vue-mapping/src/mapbox/map/GlMap.vue'),
    MglMarker: () => import(/* webpackChunkName: "pvm_MglMarker" */'@phila/vue-mapping/src/mapbox/UI/Marker.vue'),
    MglIcon: () => import(/* webpackChunkName: "mbmp_pvm_MglIcon" */'@phila/vue-mapping/src/mapbox/UI/Icon.vue'),
    MglCircleMarker: () => import(/* webpackChunkName: "pvm_MglCircleMarker" */'@phila/vue-mapping/src/mapbox/UI/CircleMarker.vue'),
    MglTriangleMarker: () => import(/* webpackChunkName: "pvm_MglTriangleMarker" */'@phila/vue-mapping/src/mapbox/UI/TriangleMarker.vue'),
    MglNavigationControl: () => import(/* webpackChunkName: "pvm_MglNavigationControl" */'@phila/vue-mapping/src/mapbox/UI/controls/NavigationControl'),
    MglGeolocateControl: () => import(/* webpackChunkName: "pvm_MglGeolocateControl" */'@phila/vue-mapping/src/mapbox/UI/controls/GeolocateControl'),
    MglDistanceMeasureControl: () => import(/* webpackChunkName: "pvm_MglDrawDistanceMeasureControl" */'@phila/vue-mapping/src/mapbox/UI/controls/DistanceMeasureControl.vue'),
    MglRasterLayer: () => import(/* webpackChunkName: "pvm_MglRasterLayer" */'@phila/vue-mapping/src/mapbox/layer/RasterLayer.vue'),
    MglButtonControl: () => import(/* webpackChunkName: "pvm_MglButtonControl" */'@phila/vue-mapping/src/mapbox/UI/controls/ButtonControl.vue'),
    MglControlContainer: () => import(/* webpackChunkName: "pvm_MglControlContainer" */'@phila/vue-mapping/src/mapbox/UI/controls/ControlContainer.vue'),
    MglImageLayer: () => import(/* webpackChunkName: "pvm_MglImageLayer" */'@phila/vue-mapping/src/mapbox/layer/ImageLayer'),
    MglVectorLayer: () => import(/* webpackChunkName: "pvm_MglVectorLayer" */'@phila/vue-mapping/src/mapbox/layer/VectorLayer'),
    MbIcon: () => import(/* webpackChunkName: "pvm_MbIcon" */'@phila/vue-mapping/src/mapbox/UI/MbIcon'),
    MbMeasureTool: () => import(/* webpackChunkName: "pvm_MbMeasureTool" */'@phila/vue-mapping/src/mapbox/MbMeasureTool'),
    MglGeojsonLayer: () => import(/* webpackChunkName: "pvm_MglGeojsonLayer" */'@phila/vue-mapping/src/mapbox/layer/GeojsonLayer'),
    MglPopup: () => import(/* webpackChunkName: "pvm_MglPopup" */'@phila/vue-mapping/src/mapbox/UI/Popup'),
    OverlayLegend: () => import(/* webpackChunkName: "pvm_OverlayLegend" */'@phila/vue-mapping/src/mapbox/OverlayLegend'),
    MapboxAddressInput: () => import(/* webpackChunkName: "pvm_MapboxAddressInput" */'@phila/vue-mapping/src/mapbox/MapboxAddressInput'),
    MapboxBasemapSelectControl: () => import(/* webpackChunkName: "pvm_MapboxBasemapSelectControl" */'@phila/vue-mapping/src/mapbox/UI/controls/BasemapSelectControl'),
    MglFontAwesomeMarker: () => import(/* webpackChunkName: "pvm_MglFontAwesomeMarker" */'@phila/vue-mapping/src/mapbox/UI/FontAwesomeMarker.vue'),
  },
  mixins: [
    markersMixin,
    cyclomediaMixin,
  ],
  // props: {
  //   leftPanel: {
  //     type: Boolean,
  //     value: true,
  //   },
  // },
  data() {
    const data = {
      zoomToShape: {
        geojsonParcels: [],
        markersForAddress: [],
      },
      lastGeocodeGeom: {},
      lastGeocodeResult: {},
      buttonDimensions: {
        'barHeight': '49px',
        'barLineHeight': '49px',
        'buttonHeight': '45px',
        'buttonWidth': '45px',
        'buttonLineHeight': '45px',
      },
      geojsonParcelSources: null,
      // geojsonParcelSources: {
      //   'type': 'geojson',
      //   'data': {
      //     'type': 'Feature',
      //     'geometry': {
      //       'type': 'Polygon',
      //       'coordinates': [],
      //     },
      //   },
      // },
      geojsonParcelFillLayer: {
        'id': 'geojsonParcelFill',
        'type': 'fill',
        // 'source': 'geojsonParcel',
        'layout': {},
        'paint': {
          'fill-color': 'blue',
          // 'fill-color': 'rgb(0,102,255)',
          'fill-opacity': 0.3,
        },
      },
      geojsonParcelLineLayer: {
        'id': 'geojsonParcelLine',
        'type': 'line',
        // 'source': 'geojsonParcel',
        'layout': {},
        'paint': {
          'line-color': 'blue',
          'line-width': 2,
        },
      },
      draw: {
        mode: null,
        selection: null,
        // currentShape: null,
        labelLayers: [],
        currentArea: null,
      },
    };
    return data;
  },

  computed: {
    // geocodeZoom() {
    //   if (this.$config.map.geocodeZoom) {
    //     return this.$config.map.geocodeZoom;
    //   }
    //   return 18;
    // },
    isLarge() {
      return this.$store.state.isLarge;
    },
    currentCycloOrientation() {
      let value;
      if (this.isLarge && !this.leftPanel) {
        value = 'horizontal';
      } else {
        value = 'vertical';
      }
      return value;
    },
    boundsProp() {
      let bounds = this.$store.state.map.bounds;
      // console.log('boundsProps, bounds:', bounds);
      let finalBounds;

      if (bounds._northEast && bounds._northEast.lat != null) {
        finalBounds = [[ bounds._southWest.lng, bounds._southWest.lat ], [ bounds._northEast.lng, bounds._northEast.lat ]];
      } else if (bounds._northEast && bounds._northEast.lat == null) {
        // finalBounds = [[ -75.0936906502695, 39.999379013777684 ], [ -75.23325134973207, 39.9072659724458 ]];
      } else {
        finalBounds = bounds;
      }
      return finalBounds;
    },
    basemapImageLink() {
      if (this.activeBasemap === 'pwd' || this.activeBasemap === 'dor') {
        return window.location.origin + '/images/imagery_small.png';
      } else {
        return window.location.origin + '/images/basemap_small.png';
      }
    },
    basemapSources() {
      return this.$config.basemapSources;
    },
    basemapLabelSources() {
      return this.$config.basemapLabelSources;
    },
    overlaySources() {
      return this.$config.overlaySources;
    },
    shouldShowRasterLayer() {
      let value = true;
      if (this.$config.map.tiles === 'hosted') {
        value = false;
      }
      return value;
    },
    basemapsBefore() {
      let value = [
        'gl-draw-line.hot',
        'gl-draw-polygon-fill.hot',
        'gl-draw-polygon-stroke-active.hot',
        'gl-draw-polygon-and-line-vertex-halo-active.hot',
        'gl-draw-polygon-and-line-vertex-active.hot',
        'gl-draw-line-static',
      ];
      if (this.imageOverlay != null) {
        value.push(this.imageOverlay);
      }
      if (this.geojsonParcels) {
        // console.log('computing basemapsBefore, this.geojsonParcels.length:', this.geojsonParcels.length);
        for (let i=0; i<this.geojsonParcels.length; i++) {
          value.push('geojsonParcelLine' + i);
          value.push('geojsonParcelFill' + i);
        }
      }
      return value;
    },

    leftPanel() {
      return this.$store.state.leftPanel;
    },
    isMobileOrTablet() {
      return this.$store.state.isMobileOrTablet;
    },
    fullScreenTopicsEnabled() {
      return this.$store.state.fullScreenTopicsEnabled;
    },
    mapDivClass() {
      if (this.cyclomediaActive) {
        return 'map-div-cyclo';
      }
      return 'map-div';

    },
    bufferButtonActiveClass() {
      // console.log("bufferButtonActiveClass: ", this.$store.state.bufferMode);
      return this.$store.state.bufferMode ? '' : 'inactive-buffer-button';
    },
    drawButtonActiveClass() {
      // console.log("bufferButtonActiveClass: ", this.$store.state.bufferMode);
      return this.$store.state.drawStart === null ? 'inactive-draw-button' : '';
    },
    buttonClass() {
      if (this.isMobileOrTablet) {
        return 'mobile-button';
      }
      return 'non-mobile-button pointer';

    },
    lastSearchMethod() {
      return this.$store.state.lastSearchMethod;
    },
    drawProps() {
      const draw = {
        polyline: true,
        polygon: false,
        circle: false,
        marker: false,
        rectangle: true,
      };

      return draw;
    },
    addressAutocompleteEnabled() {
      // TODO tidy up the code
      if (this.$config.addressInput) {
        if (this.$config.addressInput.autocompleteEnabled === true) {
          return true;
        }
        return false;
      }
      return false;
    },
    addressInputPosition() {
      return 'topleft';
    },
    addressInputWidth() {
      if (this.$config.addressInput) {
        return this.$config.addressInput.mapWidth;
      }
      return 300;
    },
    addressInputPlaceholder() {
      if (this.$config.addressInput) {
        return this.$config.addressInput.placeholder;
      }
      return null;
    },
    basemapSelectControlPosition() {
      return 'topalmostright';
    },
    shouldShowAddressCandidateList() {
      return this.$store.state.shouldShowAddressCandidateList;
    },
    measureControlEnabled() {
      if (this.$config.measureControlEnabled === false) {
        return false;
      }
      return true;
    },
    fullScreenMapEnabled() {
      return this.$store.state.fullScreenMapEnabled;
    },
    mapPanelContainerClass() {
      if (this.leftPanel) {
        return 'small-24 small-order-1 medium-12 medium-order-2';
      }
      return 'small-24 small-order-1 medium-24 medium-order-2 grid-x';
    },
    mapPanelClass() {
      if (!this.leftPanel && this.isLarge && this.$store.state.cyclomedia.active) {
        // return 'small-24 medium-24 map-panel-class-50';
        return 'small-24 medium-12 map-panel-class';
      } else if (this.$store.state.cyclomedia.active) {
        return 'small-24 medium-24 map-panel-class-50';
      } else {
        return 'small-24 medium-24 map-panel-class';
      }
      // return 'small-24 medium-24 map-panel-class';
    },
    loadingMaskLeft() {
      if (this.$store.state.cyclomedia.active) {
        return 'mb-map-loading-mask-inner left-fifteen';
      }
      return 'mb-map-loading-mask-inner left-forty';
    },
    geolocationEnabled() {
      if (this.$config.geolocation) {
        return this.$config.geolocation.enabled;
      }
      return false;
    },
    legendControls() {
      return this.$config.legendControls || {};
    },
    activeBasemap() {
      const shouldShowBasemapSelectControl = this.$store.state.map.shouldShowBasemapSelectControl;
      if (shouldShowBasemapSelectControl) {
        return this.$store.state.map.imagery;
      }
      const defaultBasemap = this.$config.map.defaultBasemap;
      const basemap = this.$store.state.map.basemap || defaultBasemap;
      return basemap;
    },
    tiledLayers() {
      const activeBasemap = this.activeBasemap;
      const activeBasemapConfig = this.configForBasemap(activeBasemap);
      return activeBasemapConfig.tiledLayers || [];
    },
    activeFeatureLayers() {
      if (!this.activeTopicConfig || !this.activeTopicConfig.featureLayers) {
        return [];
      }
      return this.activeTopicConfig.featureLayers;
    },
    activeFeature() {
      return this.$store.state.activeFeature;
    },
    basemaps() {
      return Object.values(this.$config.map.basemaps);
    },
    imageryBasemaps() {
      return this.basemaps.filter(basemap => basemap.type === 'imagery');
    },
    hasImageryBasemaps() {
      return this.imageryBasemaps.length > 0;
    },
    shouldShowImageryToggle() {
      if (this.$config.map.imagery) {
        return this.hasImageryBasemaps && this.$config.map.imagery.enabled;
      }
      return this.hasImageryBasemaps;
    },
    identifyFeature() {
      let configFeature;
      if (this.geocodeType === 'intersection') {
        configFeature = "address-marker";
      } else if (this.activeTopicConfig.identifyFeature) {
        configFeature = this.activeTopicConfig.identifyFeature;
      } else {
        if (this.$config) {
          configFeature = this.$config.map.defaultIdentifyFeature;
        }
      }
      return configFeature;
    },
    activeTopic() {
      return this.$store.state.activeTopic;
    },
    activeTopicConfig() {
      const key = this.activeTopic;
      let config;

      // if no active topic, return null
      if (key) {
        config = this.$config.topics.filter((topic) => {
          return topic.key === key;
        })[0];
      }
      return config || {};
    },
    activeParcelLayer() {
      return this.activeTopicConfig.parcels;
    },
    pwdParcel() {
      return this.$store.state.parcels.pwd;
    },
    geocodeResult() {
      return this.$store.state.geocode.data || {};
    },
    geocodeGeom() {
      return this.geocodeResult.geometry;
    },
    geocodeType() {
      return this.geocodeResult.ais_feature_type;
    },
    streetAddress() {
      return this.geocodeResult.properties.street_address;
    },
    // mapBounds() {
    //   // TODO calculate map bounds based on leaflet markers above
    // },
    boundsBasedOnShape() {
      return this.$store.state.map.boundsBasedOnShape;
    },
    isGeocoding() {
      return this.$store.state.geocode.status === 'waiting';
    },

    cycloLatlng() {
      if (this.$store.state.cyclomedia.orientation.xyz !== null) {
        const xyz = this.$store.state.cyclomedia.orientation.xyz;
        return [ xyz[1], xyz[0] ];
      }
      const center = this.$config.map.center;
      return center;

    },
    cycloRotationAngle() {
      return this.$store.state.cyclomedia.orientation.yaw;// * (180/3.14159265359);
    },
    cycloHFov() {
      return this.$store.state.cyclomedia.orientation.hFov;
    },
    shouldShowCyclomediaButton() {
      return this.$config.cyclomedia.enabled;
    },
    sitePath() {
      if (process.env.VUE_APP_PUBLICPATH) {
        return window.location.origin + process.env.VUE_APP_PUBLICPATH;
      }
      return '';
    },
  },
  watch: {
    geocodeGeom(nextGeocodeGeom) {
      if (nextGeocodeGeom) {
        this.lastGeocodeGeom = nextGeocodeGeom;
      }
    },
    geocodeResult(nextGeocodeResult) {
      console.log('watch geocodeResult is running, nextGeocodeResult:', nextGeocodeResult);
      if (Object.keys(nextGeocodeResult).length > 0) {
        this.lastGeocodeResult = nextGeocodeResult;
        if (nextGeocodeResult._featureId) {
          let store = this.$store;
          let config = this.$config;
          const myMethod = (function() {
            console.log('myMethod is running, store:', store, 'nextGeocodeResult:', nextGeocodeResult, 'store.state:', store.state, 'config:', config);
            store.commit('setMapCenter', nextGeocodeResult.geometry.coordinates);
            store.commit('setMapZoom', config.map.zoom);
          }).bind(store, config);
          setTimeout(myMethod, 250);
        }
      }
    },
    geojsonParcels(nextGeojson) {
      // console.log('watch geojsonParcels is running, nextGeojson:', nextGeojson);
      // if (nextGeojson[0]) {
      //   // console.log('watch geojsonParcels is running, nextGeojson:', nextGeojson, 'nextGeojson[0].geojson:', nextGeojson[0].geojson);
      //   this.$data.geojsonParcelSource.data.geometry.coordinates = nextGeojson[0].geometry.coordinates;
      // } else {
      //   this.$data.geojsonParcelSource.data.geometry.coordinates = [];
      // }
      let value = []
      for (let parcel of nextGeojson) {
        console.log('in loop, parcel:', parcel);
        value.push(
          {
            'type': 'geojson',
            'data': {
              'type': 'Feature',
              'geometry': {
                'type': 'Polygon',
                'coordinates': parcel.geometry.coordinates,
              },
            },
          },
        )
      }
      this.geojsonParcelSources = value;

      if (!this.$store.state.mapViewWasSetOnAppLoad && this.lastSearchMethod === 'shape search') {
        console.log('watch geojsonParcels is affecting things');
        this.setMapToBounds();
        this.$store.commit('setMapViewWasSetOnAppLoad', true);
      } else if (this.$store.state.lastSearchMethod === 'block search') {
        console.log(this.$store.state.parcels.pwd[0].geometry.coordinates[0][0]);
        this.$store.commit('setMapCenter', this.$store.state.parcels.pwd[0].geometry.coordinates[0][0]);
      }
    },
    leftPanel(nextLeftPanel) {
      // console.log('MapPanel.vue watch leftPanel is firing, nextLeftPanel:', nextLeftPanel);
      if (this.$store.state.geocode.data && Object.keys(this.$store.state.geocode.data).length > 0) {
        this.lastGeocodeResult = this.$store.state.geocode.data;
        if (this.$store.state.geocode.data._featureId) {
          let store = this.$store;
          let config = this.$config;
          const myMethod = (function() {
            store.commit('setMapCenter', store.state.geocode.data.geometry.coordinates);
            store.commit('setMapZoom', config.map.zoom);
          }).bind(store, config);
          setTimeout(myMethod, 250);
        }
      }
      this.$nextTick(() => {
        this.$store.map.resize();
      });
    },
    cyclomediaActive(value) {
      this.$nextTick(() => {
        this.$store.map.resize();
        // this.$store.state.map.map.invalidateSize();
      });
    },
  },
  created() {
    // if there's a default address, navigate to it
    const defaultAddress = this.$config.defaultAddress;
    if (defaultAddress) {
      this.$controller.goToDefaultAddress(defaultAddress);
    }

    const cyclomediaConfig = this.$config.cyclomedia || {};
    if (cyclomediaConfig.enabled) {
      // create cyclomedia recordings client
      this.$cyclomediaRecordingsClient = new CyclomediaRecordingsClient(
        this.$config.cyclomedia.recordingsUrl,
        this.$config.cyclomedia.username,
        this.$config.cyclomedia.password,
        4326,
      );
    }

    // console.log('MapPanel.vue created, this.isMobileOrTablet:', this.isMobileOrTablet);
    if (this.isMobileOrTablet) {
      this.$data.buttonDimensions = {
        'barHeight': '30px',
        'barWidth': '30px',
        'barLineHeight': '30px',
        'buttonHeight': '30px',
        'buttonWidth': '30px',
        'buttonLineHeight': '30px',
      };
    }
  },
  mounted() {
    // console.log('MapPanel mounted is running, DrawControl', DrawControl)
    const map = this.$store.state.map.map;
    this.$store.commit('setImagery', 'imagery2020');
  },
  methods: {
    onMapLoaded(event) {
      console.log('onMapLoaded is running, event.map:', event.map, this.$store.state.map);
      this.$store.map = event.map;
    },
    onMapPreloaded(event) {
      let logo = document.getElementsByClassName('mapboxgl-ctrl-logo');
      // console.log('MapPanel onMapPreloaded, logo:', logo, 'logo.length:', logo.length, 'logo.item(0):', logo.item(0));
      logo[0].remove();
      let attrib = document.getElementsByClassName('mapboxgl-ctrl-attrib');
      attrib[0].remove();
    },
    handleBasemapToggleClick() {
      // console.log('handleBasemapToggleClick, this.$store.map.getStyle().layers:', this.$store.map.getStyle().layers);
      const prevShouldShowBasemapSelectControl = this.$store.state.map.shouldShowBasemapSelectControl;
      const nextShouldShowBasemapSelectControl = !prevShouldShowBasemapSelectControl;
      this.$store.commit('setShouldShowBasemapSelectControl', nextShouldShowBasemapSelectControl);
    },
    handleCyclomediaButtonClick(e) {
      // console.log('handleCyclomediaButtonClick is running');
      if (!this.cyclomediaInitializationBegun) {
        this.$store.commit('setCyclomediaInitializationBegun', true);
      }
      const willBeActive = !this.$store.state.cyclomedia.active;

      this.$store.commit('setCyclomediaActive', willBeActive);
    },
    handleSearchFormSubmit(value) {
      // console.log('MapPanel.vue handleSearchFormSubmit is running');
      this.$controller.handleSearchFormSubmit(value);
    },
    fillColorForOverlayMarker(markerId, activeFeature) {
      // get map overlay style and hover style for table
      const mapOverlay = this.$config.mapOverlay;
      const { style, hoverStyle } = mapOverlay;

      // compare id to active feature id
      // console.log("this.identifyMarker(activeFeatureId): ", this.identifyMarker(activeFeature))
      const useHoverStyle = (
        activeFeature.featureId ? markerId === this.identifyMarker(activeFeature) : null
      );
      const curStyle = useHoverStyle ? hoverStyle : style;

      return curStyle.fillColor;
    },
    setMapToBounds() {
      console.log('setMapToBounds is running, this.geojsonParcels:', this.geojsonParcels);
      let featureArray = [];
      for (let geojsonFeature of this.geojsonParcels) {
        featureArray.push(GeoJSON(geojsonFeature));
      }

      const theFeatureCollection = featureCollection(featureArray);
      console.log('featureArray:', featureArray, 'theFeatureCollection:', theFeatureCollection);
      const bounds = bbox(theFeatureCollection);

      // const group = new FeatureGroup(featureArray);
      // const bounds = group.getBounds();
      this.$store.commit('setMapBounds', bounds);
    },
    configForBasemap(basemap) {
      return this.$config.map.basemaps[basemap] || {};
    },
    shouldShowGeojson(key) {
      if (this.activeTopicConfig.basemap === 'pwd') {
        return true;
      }
      return key === this.activeDorParcel;

    },
    shouldShowFeatureLayer(key) {
      if (this.activeFeatureLayers.includes(key)) {
        return true;
      }
      return false;
    },
    handleMapClick(e) {
      let drawMode = this.$data.draw.mode;
      let drawLayers = this.$store.map.queryRenderedFeatures(e.mapboxEvent.point).filter(feature => [ 'mapbox-gl-draw-cold', 'mapbox-gl-draw-hot' ].includes(feature.source));
      console.log('MapPanel.vue handleMapClick, drawMode:', drawMode, 'e:', e, 'this.$store.map.getStyle():', this.$store.map.getStyle(), 'this.$store.state.drawStart:', this.$store.state.drawStart);

      if (!drawLayers.length && drawMode !== 'draw_polygon') {
      // if (drawMode !== 'draw_polygon') {
        this.$controller.handleMapClick(e);
      }
    },
    handleDrawModeChange(e) {
      console.log('MapPanel.vue handleDrawModeChange is running, e:', e, 'e.mode:', e.mode, 'this.$store.map.getStyle():', this.$store.map.getStyle());
      this.$data.draw.mode = e.mode;
      // let currentShape = this.$data.draw.currentShape;

      if (e.mode === 'simple_select') {// && currentShape) {
        this.handleDrawFinish();
      }
    },
    handleDrawFinish(e) {
      let draw = this.$store.state.draw;
      let data = draw.getAll();
      console.log('MapPanel.vue handleDrawFinish is running, data:', data);
      this.$store.commit('setDrawShape', data.features[0].geometry.coordinates[0]);
      this.$store.state.draw.trash();
    },
    handleDrawButtonClick() {
      console.log('MapPanel.vue handleDrawButtonClick is running');
    },
    handleMapMove(e) {
      console.log('handleMapMove is firing, this.$store.map:', this.$store.map, 'this.$store.state.map:', this.$store.state.map);
      const map = this.$store.map;
      const center = map.getCenter();
      const { lat, lng } = center;
      const coords = [ lng, lat ];

      const cyclomediaConfig = this.$config.cyclomedia || {};

      if (cyclomediaConfig.enabled) {
        // update cyclo recordings
        this.updateCyclomediaRecordings();
        this.$store.commit('setCyclomediaLatLngFromMap', [ lat, lng ]);
      }
    },
  }, // end of methods
}; //end of export
</script>

<style lang="scss">

  .top-button-1 {
    top: 0px;
  }

  .top-button-2 {
    top: 46px;
  }

  // .top-button-3 {
  //   top: 92px;
  // }

  .map-panel-class {
    // display: inline-block
    position: relative;
  }

  .map-panel-class-50 {
    position: relative;
    height: 50% !important;
  }

  #map-tag {
    height: 100%;
  }

  button.pvm-search-control-button {
    background: color(dark-ben-franklin) !important;
  }

  .pvm-search-control-input {
    border-color: color(dark-ben-franklin) !important;
  }


  @media print {
    .print-hide {
      display: none;
    }
  }

  // CSS FOR LARGE SCREEN APP
  @media screen and (min-width: 750px) {

    // .map-div {
    //   height: 100%;
    // }
    //
    // .map-div-cyclo {
    //   height: 100%;
    // }
    #map-panel-container {
      position: relative;
    }

    .leaflet-bar {
      button, a.leaflet-draw-draw-polygon {
        font-family: 'Montserrat';
        font-weight: 600;
      }
    }

    .leaflet-nearleft2.non-mobile-corner {
      position: absolute;
      bottom: 0px;
      top: -1px;
      left: 370px;
      // left: 420px;
      padding-bottom: 10px;
      z-index: 500;
    }

    .leaflet-nearleft2.mobile-corner {
      position: absolute;
      bottom: 0px;
      padding-bottom: 10px;
      z-index: 500;
      right: 10px !important;
      top: 132px !important;
    }

    .leaflet-almostbottom {
      position: absolute;
      bottom: 90px;
      left: 0px;
      padding-bottom: 10px;
      z-index: 500;
    }

    .leaflet-almostright {
      position: absolute;
      top: 0px;
      right: 60px;
      padding-bottom: 10px;
      z-index: 500;
    }

    .leaflet-touch .leaflet-draw-toolbar .leaflet-draw-draw-polygon {
      background-position: -65px -9px;
      background-size: 540px 60px;
    }

    // BUFFER TOOL
    // the .mobile-button class is at the same level as leaflet-bar...
    .mobile-button {
      width: 34px !important;
      height: 34px !important;
    }

    .mobile-button > button {
      width: 30px !important;
      height: 30px !important;
    }

    .mobile-button > button > span > svg {
      padding-top: 3px !important;
      height: 24px;
      left: -3px;
      top: 2px;
      position: absolute;
    }

    // DRAW TOOL
    // this sets the size of the outer button for the draw tool
    .mobile-corner > div > div > .leaflet-draw-toolbar.leaflet-bar.leaflet-draw-toolbar-top {
      width: 34px !important;
      height: 34px !important;
    }

    .non-mobile-corner > div > div > .leaflet-draw-toolbar.leaflet-bar.leaflet-draw-toolbar-top {
      height: 49px !important;
    }

    // this anchor tag comes from the draw control, and can't be accessed or changed
    .mobile-corner > div > div > div> a {
      width: 30px !important;
      height: 30px !important;
    }

    .non-mobile-corner > div > div > div> a {
      width: 230px !important;
      height: 45px !important;
    }

    .mobile-corner > div > div > div > .leaflet-draw-draw-polygon {
      background-position: -73px -15px !important;
    }

    .leaflet-touch .leaflet-draw-actions {
      left: 230px;
    }

    .leaflet-bar button {
      padding: inherit !important;
    }


    //CSS for search buttons

    .leaflet-bar.leaflet-draw-toolbar>a.leaflet-draw-draw-polygon,
    .leaflet-bar.leaflet-control.buffer-control button,
    .leaflet-bar.leaflet-control.buffer-control .leaflet-buffer-actions {
      border-radius: 0;
    }

    .leaflet-bar.leaflet-control.buffer-control :focus {
      outline: none;
    }

    .leaflet-control-container div .pvm-container-non-mobile,
    div.buffer-control.leaflet-bar.inactive-buffer-button,
    .inactive-draw-button .leaflet-draw .leaflet-draw-section {
      &:hover:after {
        font-family: "Open Sans" !important;
        background: #d3d3d3;
        align-items: center;
        opacity: 0.8;
        display: flex;
        color: #000;
        padding: 7px;
      }
    }

    .leaflet-control-container>div{
      // width: 100%;
      .pvm-container-non-mobile {
        &:hover:after {
          content: "Enter an address, property acct #, or registry map #. Type “block:” before the address to search by block.";
          height: 100%;
          width: 100%;
          min-width: 350px;
          position: absolute;
          left: 295px;
        }
      }
    }

    div.buffer-control.leaflet-bar.inactive-buffer-button {
      &:hover:after {
        content: "Select a point on the map to show all parcels within 250-foot radius.";
        width: 183%;
        height: 45px;
      }
    }

    div.buffer-control.leaflet-bar div.leaflet-buffer-actions,
    .leaflet-draw-section .leaflet-draw-actions {
      font-family: 'Open Sans';
      background: #d3d3d3;
      margin-left: 2px;
      opacity: 0.8;
      top: 0px !important;
      left: 207px;
      height: 45px;
      ul, li, a {
        height: inherit;
        color: #000;
      }
      li:not(:first-child) {
        border-left: 1px solid #AAA;
        border-left-width: 1px;
        border-left-style: solid;
        border-left-color: rgb(170, 170, 170);
      }
      a {
        background-color: transparent;
        border: none;
      }
    }

    div.buffer-control.leaflet-bar {
      display: flex;
      border: none;
      button{
        min-width: 209px !important;
      }
      button.inactive.pointer {
        background-color: color(dark-ben-franklin);
        span>svg {
          color: white;
        }
      }
      button.active {
          background-color: white;
          min-width: 199px;
          border: 2px solid color(dark-ben-franklin);
          span>svg { color: color(dark-ben-franklin);
          }
          &:after {
            background: white;
            color: color(dark-ben-franklin);
          }
      }
      button {
        min-width: 198px;
        display: flex;
        span {
          margin-left: 5px;
          }
        &:hover{
          display: flex;
        }
        &:after {
          // content: "Select Radius";
          font-weight: normal;
          padding: 3px 10px 0 10px;
          position: relative;
          color: white;
          align-items: center;
        }
      }
      .leaflet-buffer-actions {
        left: 197px;
        li {
          padding: 0;
        }
        ul, li, a {
          line-height: 45px;
          text-align: center;
        }
      }
    }

    .inactive-draw-button .leaflet-draw .leaflet-draw-section {
      &:hover:after {
        content: "Draw a shape on the map.";
      }
    }

    .leaflet-draw.leaflet-control .leaflet-draw-section .leaflet-draw-draw-polygon,
     div.buffer-control.leaflet-bar button {
      &:after {
        text-transform: uppercase;
        font-size: 16px;
        line-height: 35px;
      }
    }

    .leaflet-draw.leaflet-control {
      display: flex;
      .leaflet-draw-draw-polygon {
        width: 100%;
        height: 100%;
      }
      .leaflet-draw-section {
        display: flex;
        .leaflet-draw-toolbar {
          border: none;
        }
        a.leaflet-draw-toolbar-button-enabled {
          max-height: 45px;
          background-color: white !important;
          border: 2px solid color(dark-ben-franklin);
          background-image: url("../assets/search-button-images/spritesheet-2-blue.png") !important;
          &:after {
            padding: 3px 8px 3px 8px;
            background: white !important;
            padding-top: 4px;
            padding-bottom: 2px;
            color: color(dark-ben-franklin);
          }
        }
        .leaflet-draw-draw-polygon {
          background-image: url("../assets/search-button-images/spritesheet-2-white.png");
          background-color: color(dark-ben-franklin);
          &:after {
            content: "Draw Boundaries";
            padding: 5px 10px 5px 10px;
            color: white;
            font-weight: normal !important;
            background: color(dark-ben-franklin);
            display: flex;
            align-items: center;
            margin-left: 40px;
          }
        }
        .leaflet-draw-actions {
          left: 227px;
          height: 45px;
          a {
            top: 15%;
            position: relative;
          }
        }
      }
    }
  }
  // END OF CSS FOR LARGE SCREEN APP


  // CSS FOR SMALL SCREEN APP
  @media screen and (max-width: 750px) {

    .height-50 {
      height: 50%;
    }

    .leaflet-control-zoom, .leaflet-control-zoom {
      display: none !important;
    }

    .leaflet-control-container>.leaflet-top.leaflet-left {
      right: 0;
    }

    .buffer-control, .leaflet-draw {
      position: absolute;
      bottom: 0px;
      padding-bottom: 10px;
      z-index: 500;
      right: 0;
    }

    .buffer-control {
      top: 78px;
      left: unset;
    }

    .leaflet-draw {
      top: 116px;
    }

    .mobile-corner.leaflet-almostright {
      position: absolute;
      top: 50px;
      right: 60px;
      padding-bottom: 10px;
      z-index: 500;
    }

    .leaflet-almostbottom {
      position: absolute;
      bottom: 10px;
      left: 0px;
      padding-bottom: 10px;
      z-index: 500;
    }

    // BOTH TOOLS
    .leaflet-draw-toolbar.leaflet-bar.leaflet-draw-toolbar-top,
    .leaflet-bar.easy-button-container.leaflet-control {
      width: 30px !important;
      height: 30px !important;
      margin-right: 10px;
    }

    // BUFFER TOOL
    .leaflet-bar.easy-button-container.leaflet-control > button {
      width: 26px !important;
      height: 26px !important;
    }

    // DRAW TOOL
    .leaflet-draw-draw-polygon {
      width: 26px !important;
      height: 26px !important;
    }

    .leaflet-touch .leaflet-draw-toolbar .leaflet-draw-draw-polygon {
      background-position: -31px -1px;
    }

    // IMAGERY AND CYCLOMEDIA BUTTONS
    .button-state > img {
      height: 26px;
    }

    // CYCLOMEDIA BUTTON
    .leaflet-touch .leaflet-bar button {
      line-height: unset;
    }
  }
  // END OF CSS FOR SMALL SCREEN APP


</style>


<style scoped>

  input:focus, select:focus, textarea:focus, button:focus {
  outline: none;
  }

  .surrounding-div {
    height: 100%;
  }

  .mb-map-loading-mask {
    position: absolute;
    top: 0;
    height: 100%;
    width: 100%;
    background: rgba(0, 0 ,0 , 0.25);
    z-index: 999;
    text-align: center;
    vertical-align: middle;
  }

  .left-fifteen {
    left: 15%;
  }

  .left-forty {
    left: 40%;
  }

  .mb-map-loading-mask-inner {
    position: absolute;
    top: 40%;
  }

  /*small retina*/
  @media
  (-webkit-min-device-pixel-ratio: 2),
  (min-resolution: 192dpi),
  (max-width: 39.9375em) {
    .mb-search-control-input {
      max-width: 250px;
    }
  }

</style>
