import Vue from 'vue';
import Vuex from 'vuex';
import pvdStore from '@philly/vue-datafetch/src/controller/store';
import pvmStore from '@philly/vue-mapping/src/store';
import pvcStore from '@philly/vue-comps/src/store';
import mergeDeep from './util/merge-deep';

// when you load vuex from a script tag this seems to happen automatically
Vue.use(Vuex);

function createStore(config) {

  const activeSearch = pvdStore.createActivesearch(config);
  const sources = pvdStore.createSources(config);
  const parcels = pvdStore.createParcels(config);

  const initialState = {
    // isMobileOrTablet: isMobileDevice(),
    fullScreen: {
      mapOnly: false,
      topicsOnly: false,
    },
    fullScreenMapEnabled: false,
    fullScreenTopicsEnabled: false,
    candidates: [],
    addressEntered: null,
    parcels,
    sources,
    activeSearch,
    horizontalTables: {
      // table id => filtered rows
      filteredData: {},
    },
    // horizontalTableGroups: createHorizontalTableGroups(config),
    activeFeature: {
      featureId: null,
      tableId: null
    },
    activeModal: {
      featureId: null,
    },
    activeCondo: {
      featureId: null,
    },
    appData: {
      propertyBalance: 0,
    },
    modals: {
      // keys: config.modals,
      open: '',
    },
    map: {}
  };

  const mb = {
    state: initialState,
    getters: {
      // visibleTableIds(state) {
      //   // get active topic
      //
      //   console.log("visibleTableIds is starting");
      //
      //   // get active topic
      //   const activeTopic = state.activeTopic;
      //   const searchMethod = state.lastSearchMethod
      //
      //   console.log( "this.geocodeOptions.tableid", $store.geocodeOptions, "state.lastSearchMethod", state.lastSearchMethod);
      //
      //   const tableid = searchMethod === "geocode" ? typeof this.geocodeOptions !== "undefined" ? this.geocodeOptions.tableid : null :
      //                   searchMethod === "shape search" ? this.shapeOptions.tableid :
      //                   searchMethod === "owner search" ? this.ownerOptions.tableid : null
      //
      //
      //
      //
      // }
    },
    mutations: {
      setCandidates(state, payload) {
        state.candidates = payload;
      },
      setAddressEntered(state, payload) {
        state.addressEntered = payload;
      },
      setIsMobileOrTablet(state, payload) {
        state.isMobileOrTablet = payload;
      },
      setMapOnly(state, payload) {
        state.fullScreen.mapOnly = payload;
      },
      setTopicsOnly(state, payload) {
        state.fullScreen.topicsOnly = payload;
      },
      setFullScreenMapEnabled(state, payload) {
        state.fullScreenMapEnabled = payload;
      },
      setFullScreenTopicsEnabled(state, payload) {
        state.fullScreenTopicsEnabled = payload;
      },
      setLocation(state, payload) {
        state.map.location.lat = payload.lat;
        state.map.location.lng = payload.lng;
      },
      setWatchPositionOn(state, payload) {
        state.map.watchPositionOn = payload;
      },
      setHorizontalTableGroupActiveTable(state, payload) {
        // console.log('setHorizontalTableGroupActiveTable, payload:', payload);
        state.horizontalTableGroups[payload.tableGroupId].activeTableId = payload.activeTableId;
        state.horizontalTableGroups[payload.tableGroupId].activeTable = payload.activeTable;
      },
      setHorizontalTableFilteredData(state, payload) {
        const { tableId, data } = payload;

        // check for not-null table id
        if (!tableId) return;
        state.horizontalTables.filteredData[tableId] = data;
      },
      setMapFilters(state, payload) {
        state.map.filters = payload;
      },

      setMap(state, payload) {
        state.map.map = payload.map;
      },
      setMapBounds(state, payload) {
        // const { northEast, southWest } = payload || {};
        // state.map.bounds.northEast = northEast;
        // state.map.bounds.southWest = southWest;
        state.map.bounds = payload;
      },
      setMapBoundsBasedOnShape(state, payload) {
        state.map.boundsBasedOnShape = payload
      },
      setActiveParcel(state, payload) {
        // console.log('store setActiveParcel:', payload)
        const { parcelLayer, activeParcel, activeAddress, activeMapreg } = payload || {};
        state.parcels[parcelLayer].activeParcel = activeParcel;
        state.parcels[parcelLayer].activeAddress = activeAddress;
        state.parcels[parcelLayer].activeMapreg = activeMapreg;
      },
      setActiveFeature(state, payload) {
        // console.log('store setActiveFeature is running');
        const { featureId, tableId } = payload || {};
        const nextActiveFeature = { featureId, tableId };
        state.activeFeature = nextActiveFeature;
      },
      setActiveModal(state, payload) {
        const { featureId } = payload || {};
        const nextActiveFeature = { featureId };
        state.activeModal = nextActiveFeature;
      },
      setCondoModal(state, payload) {
        const { featureId } = payload || {};
        const nextActiveFeature = { featureId };
        state.activeCondo = nextActiveFeature;
      },
      setImageOverlay(state, payload) {
        state.map.imageOverlay = payload;
      },
      setImageOverlayOpacity(state, payload) {
        state.map.imageOverlayOpacity = payload;
      },
      setCandidates(state, payload) {
        state.candidates = payload;
      },
      setAddressEntered(state, payload) {
        state.addressEntered = payload;
      },

      setPropertyBalance(state, payload) {
        state.appData.propertyBalance = payload;
      },
      setDidToggleModal(state, name) {
        // console.log('setDidToggleModal, name:', name, 'open:', open);
        // console.log('setDidToggleModal, name:', name);
        // state.modals[name].open = open === null ? !state.modals[name].open : open
        state.modals.open = name;
      },



    }
  }

  // let mergeStore = mb;
  let mergeStore = mergeDeep(pvcStore, pvdStore.store);
  mergeStore = mergeDeep(mergeStore, pvmStore);
  mergeStore = mergeDeep(mergeStore, mb);


  // TODO standardize how payloads are passed around/handled
  return new Vuex.Store({
    state: mergeStore.state,
    getters: mergeStore.getters,
    mutations: mergeStore.mutations
  });
}

export default createStore;
