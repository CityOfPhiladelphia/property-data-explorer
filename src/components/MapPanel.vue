<template>
  <div
    id="map-panel-container"
    :class="mapPanelContainerClass + ' surrounding-div grid-frame print-hide'"
  >
  <!-- class="surrounding-div grid-frame print-hide" -->

  <!-- :class="mapPanelContainerClass + ' surrounding-div print-hide'" -->
  <!-- class="surrounding-div grid-x grid-frame" -->
  <!-- this.mapDivClass -->
  <!-- :class="'medium-grid-frame surrounding-div ' + this.mapDivClass" -->

    <full-screen-map-toggle-tab-vertical
      v-if="!this.$store.state.leftPanel"
      v-once
    />

    <div
      id="map-tag"
      class="grid-x"
    >
      <map_
        id="map-object"
        :class="mapPanelClass + ' ' + drawButtonActiveClass"
        :center="this.$store.state.map.center"
        :zoom="this.$store.state.map.zoom"
        attribution-position="bottomleft"
        zoom-control-position="bottomleft"
        :min-zoom="this.$config.map.minZoom"
        :max-zoom="this.$config.map.maxZoom"
        @l-click="handleMapClick"
        @l-moveend="handleMapMove"
      >

        <!-- loading mask -->
        <div
          v-show="isGeocoding"
          class="mb-map-loading-mask"
        >
          <div :class="loadingMaskLeft">
            <i class="fa fa-spinner fa-4x spin" />
            <h1>Finding address...</h1>
          </div>
        </div>

        <!-- basemaps -->
        <esri-tiled-map-layer
          v-for="(basemap, key) in this.$config.map.basemaps"
          v-if="activeBasemap === key"
          :key="key"
          :url="basemap.url"
          :max-zoom="basemap.maxZoom"
          :attribution="basemap.attribution"
        />

        <!-- basemap labels and parcels outlines -->
        <esri-tiled-map-layer
          v-for="(tiledLayer, key) in this.$config.map.tiledLayers"
          v-if="tiledLayers.includes(key)"
          :key="key"
          :url="tiledLayer.url"
          :z-index="tiledLayer.zIndex"
          :attribution="tiledLayer.attribution"
        />

        <!-- <esri-tiled-overlay v-for="(tiledLayer, key) in this.$config.map.tiledOverlays"
                            v-if="activeTiledOverlays.includes(key)"
                            :key="key"
                            :url="tiledLayer.url"
                            :zIndex="tiledLayer.zIndex"
                            :opacity="tiledLayer.opacity"
        /> -->

        <!-- dorParcels, pwdParcels, vacantLand, vacantBuilding -->
        <esri-feature-layer
          v-for="(featureLayer, key) in this.$config.map.featureLayers"
          v-if="shouldShowFeatureLayer(key, featureLayer.minZoom)"
          :key="key"
          :layer-name="key"
          :url="featureLayer.url"
          :color="featureLayer.color"
          :fill-color="featureLayer.color"
          :fill-opacity="featureLayer.fillOpacity"
          :weight="featureLayer.weight"
          :style_="featureLayer.style"
          :min-zoom="featureLayer.minZoom"
          :max-zoom="featureLayer.maxZoom"
          :z-index="featureLayer.zIndex"
          :marker-type="featureLayer.markerType"
          :radius="featureLayer.radius"
          :interactive="featureLayer.interactive"
        />

        <!-- reactive geojson parcels -->
        <geojson
          v-for="geojsonFeature in geojsonParcels"
          :key="geojsonFeature.properties.PARCELID"
          :geojson="geojsonFeature"
          :fill-color="geojsonFeature.properties.fillColor"
          :color="geojsonFeature.properties.color"
          :weight="geojsonFeature.properties.weight"
          :opacity="geojsonFeature.properties.opacity"
          :fill-opacity="geojsonFeature.properties.fillOpacity"
          :data="geojsonFeature.properties"
          @l-mouseover="handleMarkerMouseover"
          @l-mouseout="handleMarkerMouseout"
        />

        <polygon_
          v-if="currentBuffer !== null"
          :latlngs="currentBuffer"
        />
        <!-- :fillColor="'green'" -->
        <!-- :color="'red'"
        :weight="2" -->
        <!-- :fillColor="geojsonFeature.properties.fillColor"
        :weight="geojsonFeature.properties.weight"
        :opacity="geojsonFeature.properties.opacity"
        :fillOpacity="geojsonFeature.properties.fillOpacity"
        :data="geojsonFeature.properties"
        :key="geojsonFeature.properties.PARCELID" -->

        <!-- vector markers -->
        <vector-marker
          v-for="marker in markersForAddress"
          :key="marker.key"
          :latlng="marker.latlng"
          :marker-color="marker.color"
          :icon="marker.icon"
          :interactive="false"
        />

        <!-- buffer search needs a marker that can't be the geocode marker -->
        <vector-marker
          v-for="marker in markersForBufferSearch"
          v-if="lastSearchMethod === 'buffer search'"
          :key="marker.key + '1'"
          :latlng="marker.latlng"
          :marker-color="marker.color"
          :icon="marker.icon"
        />

        <!-- vector markers -->
        <vector-marker
          v-for="marker in markersForTopic"
          :key="marker.key"
          :latlng="marker.latlng"
          :marker-color="marker.color"
          :icon="marker.icon"
        />




        <!-- CONTROLS: -->
        <!-- basemap control -->
        <control-corner
          :v-side="'top'"
          :h-side="'almostright'"
        />

        <control-corner
          :v-side="'almosttop'"
          :h-side="'almostright'"
        />

        <control-corner
          :v-side="'top'"
          :h-side="'nearleft'"
        />

        <control-corner
          :v-side="'top'"
          :h-side="'nearleft2'"
        />

        <control-corner
          :v-side="'almostbottom'"
          :h-side="'left'"
        />

        <!-- <basemap-tooltip :position="'topright'"
        /> -->

        <div v-once>
          <basemap-toggle-control
            v-if="shouldShowImageryToggle"
            v-once
            :position="'topright'"
          />
        </div>

        <div v-once>
          <basemap-select-control :position="basemapSelectControlPosition" />
        </div>

        <!-- <div v-once
             v-if="this.measureControlEnabled"
        >
          <measure-control :position="'bottomleft'" />
        </div> -->

        <div v-once>
          <legend-control
            v-for="legendControl in Object.keys(legendControls)"
            :key="legendControl"
            :position="'bottomleft'"
            :options="legendControls[legendControl].options"
            :items="legendControls[legendControl].data"
          />
        </div>

        <div v-once>
          <location-control
            v-if="geolocationEnabled"
            v-once
            :position="'almostbottomleft'"
            :title="'Locate me'"
          />
        </div>

        <!-- location marker -->
        <circle-marker
          v-if="this.$store.state.map.location.lat != null"
          :key="Math.random()"
          :latlng="locationMarker.latlng"
          :radius="locationMarker.radius"
          :fill-color="locationMarker.fillColor"
          :color="locationMarker.color"
          :weight="locationMarker.weight"
          :opacity="locationMarker.opacity"
          :fill-opacity="locationMarker.fillOpacity"
        />

        <div>
          <!-- <div v-once> -->
          <map-address-input
            :position="'topleft'"
            :placeholder="addressInputPlaceholder"
            :width-from-config="addressInputWidth"
            static="true"
            @handle-search-form-submit="handleSearchFormSubmit"
          />
          <!-- :width-from-config="addressInputWidth" -->

          <buffer-control
            :button-height="'45px'"
            :button-width="'100%'"
            :position="'topleft'"
            :class="buttonClass + ' buffer-control ' + bufferButtonActiveClass"
            @click="handleBufferClick"
          />

          <div
            class="draw-control"
            @click="handleDrawControlClick"
          >
            <draw-control
              :control="true"
              :position="'topleft'"
              @click="handleDrawControlClick"
            />
          </div>

          <!-- </div> -->
        </div>


        <address-candidate-list
          v-if="addressAutocompleteEnabled"
          :position="addressInputPosition"
        />

        <!-- marker using a png and ablility to rotate it -->
        <png-marker
          v-if="cyclomediaActive"
          :icon="sitePath + 'images/camera.png'"
          :latlng="cycloLatlng"
          :rotation-angle="cycloRotationAngle"
        />

        <!-- marker using custom code extending icons - https://github.com/iatkin/leaflet-svgicon -->
        <svg-view-cone-marker
          v-if="cyclomediaActive"
          :latlng="cycloLatlng"
          :rotation-angle="cycloRotationAngle"
          :h-fov="cycloHFov"
        />

        <div v-once>
          <cyclomedia-button
            v-if="shouldShowCyclomediaButton"
            v-once
            :position="'topright'"
            :link="'cyclomedia'"
            :img-src="sitePath + 'images/cyclomedia.png'"
            @click="handleCyclomediaButtonClick"
          />
        </div>

        <cyclomedia-recording-circle
          v-for="recording in cyclomediaRecordings"
          v-if="cyclomediaActive"
          :key="recording.imageId"
          :image-id="recording.imageId"
          :latlng="[recording.lat, recording.lng]"
          :size="1.2"
          :color="'#3388ff'"
          :weight="1"
          @l-click="handleCyclomediaRecordingClick"
        />
      </map_>

      <slot
      class="widget-slot"
      name="cycloWidget"
      />

    </div>


  </div>
</template>

<script>
// import * as L from 'leaflet';
import { featureGroup, geoJSON, marker } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const FeatureGroup = featureGroup;
const GeoJSON = geoJSON;
const Lmarker = marker;
// const FeatureGroup = L.default.featureGroup;
// const GeoJSON = L.default.geoJSON;
// const Lmarker = L.default.marker;

// mixins
import markersMixin from './markers-mixin';
import cyclomediaMixin from '@phila/vue-mapping/src/cyclomedia/map-panel-mixin.js';


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
import DrawControl from '@phila/vue-mapping/src/components/DrawControl.vue';
import BufferControl from '@phila/vue-mapping/src/components/BufferControl.vue';


export default {
  name: 'MapPanel',
  components: {
    DrawControl,
    BufferControl,
    // DrawControl: () => import(/* webpackChunkName: "mbmp_pvm_DrawControl" */'@phila/vue-mapping/src/components/DrawControl.vue'),
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
  },
  mixins: [
    markersMixin,
    cyclomediaMixin,
  ],
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
    };
    return data;
  },

  computed: {
    isMobileOrTablet() {
      return this.$store.state.isMobileOrTablet;
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
      // if (this.isMobileOrTablet) {
      return 'topleft';
      // } else {
      //   return 'topnearleft'
      // }
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
      // if (this.isMobileOrTablet) {
      //   return 'almosttopalmostright'
      // } else {
      return 'topalmostright';
      // }
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
      if (this.$store.state.leftPanel) {
        return 'small-24 small-order-1 medium-12 medium-order-2';
      }
      return 'small-24 small-order-1 medium-24 medium-order-2';
    },
    mapPanelClass() {
      if (this.$store.state.leftPanel && this.$store.state.cyclomedia.active) {
        return 'small-24 medium-24 map-panel-class-50';
      } else if (this.$store.state.cyclomedia.active) {
        return 'small-24 medium-12 map-panel-class';
      }
      return 'small-24 medium-24 map-panel-class';
    },
    loadingMaskLeft() {
      if (this.$store.state.cyclomedia.active) {
        return 'mb-map-loading-mask-inner left-fifteen';
      }
      return 'mb-map-loading-mask-inner left-forty';

    },
    // mapPanelContainerClass() {
    //   if (this.$store.state.cyclomedia.active) {
    //     return 'medium-12 small-order-1 small-24 medium-order-1'
    //   } else {
    //     return 'medium-24 small-order-1 small-24 medium-order-1'
    //   }
    // },
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
    // activeTiledOverlays() {
    //   if (!this.activeTopicConfig || !this.activeTopicConfig.tiledOverlays) {
    //     return [];
    //   } else {
    //     return this.activeTopicConfig.tiledOverlays;
    //   }
    // },
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
      // console.log('watch geocodeResult is running, nextGeocodeResult:', nextGeocodeResult);
      if (Object.keys(nextGeocodeResult).length > 0) {
        this.lastGeocodeResult = nextGeocodeResult;
        if (nextGeocodeResult._featureId) {
          this.$store.commit('setMapCenter', nextGeocodeResult.geometry.coordinates);
          this.$store.commit('setMapZoom', this.geocodeZoom);
        }
      }
    },
    geojsonParcels(nextGeojson) {
      // console.log('watch geojsonParcels is running');
      if (!this.$store.state.mapViewWasSetOnAppLoad && this.lastSearchMethod === 'shape search') {
        // console.log('watch geojsonParcels is affecting things');
        this.setMapToBounds();
        this.$store.commit('setMapViewWasSetOnAppLoad', true);
      } else if(this.$store.state.lastSearchMethod === 'block search') {
      // console.log(this.store.state.parcels.pwd[0].geometry.coordinates[0][0]);
      this.$store.commit('setMapCenter', this.$store.state.parcels.pwd[0].geometry.coordinates[0][0]);
      }
    },
    cyclomediaActive(value) {
      this.$nextTick(() => {
        this.$store.state.map.map.invalidateSize();
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
  },
  methods: {
    handleSearchFormSubmit(value) {
      // console.log('MapPanel.vue handleSearchFormSubmit is running');
      this.$controller.handleSearchFormSubmit(value);
    },
    handleBufferClick() {
      // console.log('handleBufferClick is running');
    },
    handleDrawControlClick() {
      // console.log('handleDrawControlClick is running');
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
      // console.log('setMapToBounds is running, this.geojsonParcels:', this.geojsonParcels);
      let featureArray = [];
      for (let geojsonFeature of this.geojsonParcels) {
        featureArray.push(GeoJSON(geojsonFeature));
      }
      const group = new FeatureGroup(featureArray);
      const bounds = group.getBounds();
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
      if(this.$store.state.drawStart === null) {
        this.$controller.handleMapClick(e);
      }
    },
    handleMapMove(e) {
      // console.log('handleMapMove is firing')
      const map = this.$store.state.map.map;
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

  .map-panel-class {
    position: relative;
  }

  .map-panel-class-50 {
    position: relative;
    height: 50%;
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
          content: "Enter an address, owner, property acct #, or registry map #. Type “block:” before the address to search by block.";
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
          content: "Select Radius";
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
