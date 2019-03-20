<template>
  <div id="map-panel-container"
       :class="this.mapPanelContainerClass"
  >
    <full-screen-map-toggle-tab-vertical v-once />
    <map_ id="map-tag"
          :center="this.$store.state.map.center"
          :zoom="this.$store.state.map.zoom"
          @l-click="handleMapClick"
          @l-moveend="handleMapMove"
          zoom-control-position="bottomright"
          :min-zoom="this.$config.map.minZoom"
          :max-zoom="this.$config.map.maxZoom"
    >
      <!-- loading mask -->
      <div v-show="isGeocoding" class="mb-map-loading-mask">
        <div class="mb-map-loading-mask-inner">
          <i class="fa fa-spinner fa-4x spin"></i>
          <h1>Finding address...</h1>
        </div>
      </div>

      <!-- basemaps -->
      <esri-tiled-map-layer v-for="(basemap, key) in this.$config.map.basemaps"
                            v-if="activeBasemap === key"
                            :key="key"
                            :url="basemap.url"
                            :max-zoom="basemap.maxZoom"
                            :attribution="basemap.attribution"
      />

      <!-- basemap labels and parcels outlines -->
      <esri-tiled-map-layer v-for="(tiledLayer, key) in this.$config.map.tiledLayers"
                            v-if="tiledLayers.includes(key)"
                            :key="key"
                            :url="tiledLayer.url"
                            :zIndex="tiledLayer.zIndex"
                            :attribution="tiledLayer.attribution"
      />

      <esri-tiled-overlay v-for="(tiledLayer, key) in this.$config.map.tiledOverlays"
                          v-if="activeTiledOverlays.includes(key)"
                          :key="key"
                          :url="tiledLayer.url"
                          :zIndex="tiledLayer.zIndex"
                          :opacity="tiledLayer.opacity"
      />

      <!-- dorParcels, pwdParcels, vacantLand, vacantBuilding -->
      <esri-feature-layer v-for="(featureLayer, key) in this.$config.map.featureLayers"
                          v-if="shouldShowFeatureLayer(key, featureLayer.minZoom)"
                          :key="key"
                          :layerName="key"
                          :url="featureLayer.url"
                          :color="featureLayer.color"
                          :fillColor="featureLayer.color"
                          :fillOpacity="featureLayer.fillOpacity"
                          :weight="featureLayer.weight"
                          :style_="featureLayer.style"
                          :minZoom="featureLayer.minZoom"
                          :maxZoom="featureLayer.maxZoom"
                          :zIndex="featureLayer.zIndex"
                          :markerType="featureLayer.markerType"
                          :radius="featureLayer.radius"
                          :interactive="featureLayer.interactive"
      />

      <!-- vector markers -->
      <vector-marker v-for="(marker, index) in markersForAddress"
                     :latlng="marker.latlng"
                     :key="marker.key"
                     :markerColor="marker.color"
                     :icon="marker.icon"
      />

      <!-- vector markers -->
      <vector-marker v-for="(marker, index) in markersForTopic"
                     :latlng="marker.latlng"
                     :key="marker.key"
                     :markerColor="marker.color"
                     :icon="marker.icon"
      />

      <!-- reactive geojson parcels -->
      <geojson v-for="geojsonFeature in geojsonParcels"
               @l-mouseover="handleMarkerMouseover"
               @l-mouseout="handleMarkerMouseout"
               :geojson="geojsonFeature"
               :fillColor="geojsonFeature.properties.fillColor"
               :color="geojsonFeature.properties.color"
               :weight="geojsonFeature.properties.weight"
               :opacity="geojsonFeature.properties.opacity"
               :fillOpacity="geojsonFeature.properties.fillOpacity"
               :data="geojsonFeature.properties"
               :key="geojsonFeature.properties.BRT_ID"
       />



      <!-- CONTROLS: -->
      <!-- basemap control -->
      <control-corner :vSide="'top'"
                      :hSide="'almostright'"
      >
      </control-corner>

      <control-corner :vSide="'top'"
                      :hSide="'almostleft'"
      >
      </control-corner>

      <!-- <basemap-tooltip :position="'topright'"
      /> -->

      <div v-once>
        <basemap-toggle-control v-if="shouldShowImageryToggle"
                                v-once
                                :position="'topright'"
        />
      </div>

      <div v-once>
        <basemap-select-control :position="this.basemapSelectControlPosition" />
      </div>


      <!-- <div v-once
           v-if="this.measureControlEnabled"
      >
        <measure-control :position="'bottomleft'" />
      </div> -->

      <div v-once>
        <legend-control v-for="legendControl in Object.keys(legendControls)"
                        :key="legendControl"
                        :position="'bottomleft'"
                        :options="legendControls[legendControl].options"
                        :items="legendControls[legendControl].data"
        />
      </div>

      <div v-once>
        <location-control v-once
                          v-if="this.geolocationEnabled"
                          :position="'bottomright'"
        />
      </div>

      <!-- <basemap-tooltip :position="'bottomalmostleft'"
      /> -->

      <!-- <scale-control :vSide="'top'"
                     :hSide="'almostright'"
      >
      </scale-control> -->
      <div>
        <div v-once>
          <address-input :position="this.addressInputPosition"
                         :placeholder="this.addressInputPlaceholder"
                         widthFromConfig="350"
          />
          <div v-once class="draw-control">
            <draw-control :position="this.addressInputPosition"
            :control="true"
            />
          </div>
        </div>
      </div>
      <address-candidate-list v-if="this.addressAutocompleteEnabled"
                              :position="this.addressInputPosition"
      />

    </map_>
  </div>
</template>

<script>
  import * as L from 'leaflet';
  import * as philaVueMapping from '@cityofphiladelphia/phila-vue-mapping';

  // mixins
  import markersMixin from './markers-mixin';

  // vue doesn't like it when you import this as Map (reserved-ish word)
  const Map_ = philaVueMapping.Map_;
  const Control = philaVueMapping.Control;
  const DivIconMarker = philaVueMapping.DivIconMarker;
  const AddressInput = philaVueMapping.AddressInput;
  const AddressCandidateList = philaVueMapping.AddressCandidateList;
  const EsriTiledMapLayer = philaVueMapping.EsriTiledMapLayer;
  const EsriTiledOverlay = philaVueMapping.EsriTiledOverlay;
  const EsriFeatureLayer = philaVueMapping.EsriFeatureLayer;
  const Geojson = philaVueMapping.Geojson;
  const CircleMarker = philaVueMapping.CircleMarker;
  // const OpacitySlider = philaVueMapping.OpacitySlider;
  const VectorMarker = philaVueMapping.VectorMarker;
  const PngMarker = philaVueMapping.PngMarker;
  const BasemapToggleControl = philaVueMapping.BasemapToggleControl;
  const BasemapSelectControl = philaVueMapping.BasemapSelectControl;
  const FullScreenMapToggleTabVertical = philaVueMapping.FullScreenMapToggleTabVertical;
  const LocationControl = philaVueMapping.LocationControl;
  const SvgViewConeMarker = philaVueMapping.SvgViewConeMarker;
  const MeasureControl = philaVueMapping.MeasureControl;
  const LegendControl = philaVueMapping.LegendControl;
  const BasemapTooltip = philaVueMapping.BasemapTooltip;
  const DrawControl = philaVueMapping.DrawControl;
  const ControlCorner = philaVueMapping.ControlCorner;

  export default {
    mixins: [
      markersMixin,
    ],
    components: {
      Map_,
      Control,
      DivIconMarker,
      AddressInput,
      AddressCandidateList,
      EsriTiledMapLayer,
      EsriTiledOverlay,
      EsriFeatureLayer,
      Geojson,
      CircleMarker,
      // OpacitySlider,
      VectorMarker,
      PngMarker,
      BasemapToggleControl,
      BasemapSelectControl,
      FullScreenMapToggleTabVertical,
      LocationControl,
      SvgViewConeMarker,
      MeasureControl,
      LegendControl,
      BasemapTooltip,
      ControlCorner,
      DrawControl
    },
    // data: {
    data() {
      const data = {
        zoomToShape: {
          geojsonParcels: [],
          markersForAddress: [],
        },
      };
      return data;
    },
    created() {
      // if there's a default address, navigate to it
      const defaultAddress = this.$config.defaultAddress;
      if (defaultAddress) {
        this.$controller.goToDefaultAddress(defaultAddress);
      }
    },

    computed: {

      drawProps() {

        const draw = {
          polyline: true,
          polygon: false,
          circle: false,
          marker: false,
          rectangle: true,
        };

        return draw
      },

      addressAutocompleteEnabled() {
        // TODO tidy up the code
        if (this.$config.addressInput) {
          if (this.$config.addressInput.autocompleteEnabled === true) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      },
      addressInputPosition() {
        if (this.isMobileOrTablet) {
          return 'topleft'
        } else {
          return 'topalmostleft'
        }
      },
      addressInputPlaceholder() {
        if (this.$config.addressInput) {
          return this.$config.addressInput.placeholder;
        } else {
          return null
        }
      },
      basemapSelectControlPosition() {
        if (this.isMobileOrTablet) {
          return 'topright'
        } else {
          return 'topalmostright'
        }
      },
      shouldShowAddressCandidateList() {
        return this.$store.state.shouldShowAddressCandidateList;
      },
      measureControlEnabled() {
        if (this.$config.measureControlEnabled === false) {
          return false;
        } else {
          return true;
        }
      },
      fullScreenMapEnabled() {
        return this.$store.state.fullScreenMapEnabled;
      },
      mapPanelContainerClass() {
        // return 'medium-12 small-order-1 small-24 medium-order-2 mb-panel mb-panel-map'
        if (this.fullScreenMapEnabled) {
          return 'medium-24 small-order-1 small-24 medium-order-2 mb-panel mb-panel-map'
        } else if (this.fullScreenMapOnly) {
          return 'medium-1 small-order-1 small-1 medium-order-2 mb-panel mb-panel-map'
        } else {
          return 'medium-12 small-order-1 small-24 medium-order-2 mb-panel mb-panel-map'
        }
      },
      isMobileOrTablet() {
        return this.$store.state.isMobileOrTablet;
      },
      geolocationEnabled() {
        if (this.$config.geolocation) {
          return this.$config.geolocation.enabled;
        } else {
          return false;
        }
      },
      legendControls() {
        return this.$config.legendControls || {};
      },
      activeBasemap() {
        const shouldShowImagery = this.$store.state.map.shouldShowImagery;
        if (shouldShowImagery) {
          return this.$store.state.map.imagery;
        }
        const defaultBasemap = this.$config.map.defaultBasemap;
        const basemap = this.$store.state.map.basemap || defaultBasemap;
        return basemap;
      },
      tiledLayers() {
        const activeBasemap = this.activeBasemap;
        const activeBasemapConfig = this.configForBasemap(activeBasemap)

        return activeBasemapConfig.tiledLayers || [];
      },
      activeTiledOverlays() {
        if (!this.activeTopicConfig || !this.activeTopicConfig.tiledOverlays) {
          return [];
        } else {
          return this.activeTopicConfig.tiledOverlays;
        }
      },
      activeFeatureLayers() {
        if (!this.activeTopicConfig || !this.activeTopicConfig.featureLayers) {
          return [];
        } else {
          return this.activeTopicConfig.featureLayers;
        }
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
        } else {
          return this.hasImageryBasemaps;
        }
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
      mapBounds() {
        // TODO calculate map bounds based on leaflet markers above
      },
      boundsBasedOnShape() {
        return this.$store.state.map.boundsBasedOnShape;
      },
      isGeocoding() {
        return this.$store.state.geocode.status === 'waiting';
      },
    },
    watch: {

      geojsonParcels(nextGeojson) {
        let czts = this.activeTopicConfig.zoomToShape;
        let dzts = this.$data.zoomToShape;
        if (!czts || !czts.includes('geojsonParcels')) {
          dzts.geojsonParcels = [];
          return;
        } else {
          dzts.geojsonParcels = nextGeojson;
          // console.log('exiting geojsonParcels');
          this.checkBoundsChanges();
        }
      },

      markersForAddress(nextMarkers) {
        let czts = this.activeTopicConfig.zoomToShape;
        let dzts = this.$data.zoomToShape;
        if (!czts || !czts.includes('markersForAddress')) {
          dzts.markersForAddress = [];
          return;
        } else {
          dzts.markersForAddress = nextMarkers;
          this.checkBoundsChanges();
        }
      },
    },
    methods: {
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

      checkBoundsChanges() {
        let czts = this.activeTopicConfig.zoomToShape;
        if (!czts) {
          return;
        }
        let dzts = this.$data.zoomToShape;
        let tf = [];
        for (let shape of czts) {
          if (dzts[shape] !== false && dzts[shape].length > 0) {
            tf.push(true);
          } else {
            tf.push(false);
          }
        }
        if (tf.includes(false)) {
          return;
        } else {
          this.setMapToBounds();
        }
      },

      setMapToBounds() {
        let featureArray = []
        let czts = this.activeTopicConfig.zoomToShape;
        if (czts) {
          if (czts.includes('geojsonParcels')) {
            for (let geojsonFeature of this.geojsonParcels) {
              featureArray.push(L.geoJSON(geojsonFeature.geojson))
            }
          }
          if (czts.includes('markersForAddress')) {
            for (let marker of this.markersForAddress) {
              featureArray.push(L.marker(marker.latlng))
            }
          }
          if (czts.includes('circleMarkers')) {
            for (let marker of this.circleMarkers) {
              featureArray.push(L.marker(marker.latlng))
            }
          }
          const group = new L.featureGroup(featureArray);
          const bounds = group.getBounds();
          this.$store.commit('setMapBounds', bounds);
        }
      },
      configForBasemap(basemap) {
        return this.$config.map.basemaps[basemap] || {};
      },
      shouldShowGeojson(key) {
        if (this.activeTopicConfig.basemap === 'pwd') {
          return true;
        } else {
          return key === this.activeDorParcel;
        }
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
        const map = this.$store.state.map.map;
        const center = map.getCenter();
        const { lat, lng } = center;
        const coords = [lng, lat];
      },
    }, // end of methods
  }; //end of export
</script>

<style>

input:focus, select:focus, textarea:focus, button:focus {
 outline: none;
}

button {
 padding: inherit !important;
}

  #map-panel-container {
    position: relative;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .leaflet-draw.leaflet-control {
    clear: unset;
    display: inline-block;
    float: right
  }

  .leaflet-draw-toolbar.leaflet-bar.leaflet-draw-toolbar-top {
    width: 49px;
    height: 49px;
  }

  .leaflet-draw-section {
    margin-top: 2px;
  }

  .leaflet-draw-draw-polygon {
    width: 45px !important;
    height: 45px !important;
  }

  .leaflet-touch .leaflet-draw-toolbar .leaflet-draw-draw-polygon {
    background-position: -65px -9px;
    background-size: 540px 60px;
  }

  .leaflet-touch .leaflet-draw-actions {
    left: 60px;
  }

  .pvm-search-control-container {
    display: inline-block;
    float: left;
  }

  .mb-panel-map {
    /*this allows the loading mask to fill the div*/
    position: relative;
  }

  .mb-map-with-widget {
      height: 50%;
    }

  .widget-slot {
    position: relative;
    display: inline-block;
    float: left;
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

  .mb-map-loading-mask-inner {
    position: absolute;
    top: 40%;
    left: 40%;
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
