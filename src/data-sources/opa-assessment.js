import { DATABRIDGE_URL, GATEWAY_CLIENT_ID, databridgeRows } from '../util/databridge';

export default {
  id: 'opa-assessment',
  type: 'http-get',
  url: DATABRIDGE_URL,
  targets: {
    runOnce: true,
    get: function(state) {
      // console.log('opa-assessment get is running');
      if (state.lastSearchMethod === 'owner search'|| state.lastSearchMethod === 'block search') {
        return state.lastSearchMethod === 'owner search' ? state.ownerSearch.data : state.blockSearch.data;
      } else if (state.lastSearchMethod === 'shape search' || state.lastSearchMethod === 'buffer search') {
        if (state.shapeSearch.data) {
          return state.shapeSearch.data.rows || [];
        }
      }
      let opa = [];
      opa.push(state.geocode.data);
      if (state.geocode.related != null){
        for (let relate of state.geocode.related) {
          opa.push(relate);
        }
      }
      // if (state.geocode.related && state.geocode.related.length) {
      if (state.geocode.data.condo != null && state.geocode.data.condo == true) {
        // console.log('opa-assessment in if condo is running');
        // opa.push(state.geocode.data);
        let idNumber = state.parcels.pwd ? Number(state.parcels.pwd[0].properties.parcelid) : state.geocode.data.properties.dor_parcel_id;
        opa.push(state.condoUnits.units[idNumber][0]);
      }
      return opa;

    },
    getTargetId: function(target) {
      if(target.properties){
        return target.properties.opa_account_num;
      }
      // console.log('opa-assessment getTargetId is running, target.parcel_number:', target.parcel_number);
      return target.parcel_number;

    },
  },
  options: {
    params: {
      table: 'opa_properties_public_pde',
      fields: 'parcel_number,market_value,sale_date,sale_price',
      where: function(feature) {
        return "parcel_number IN (" + feature + ")";
      },
      limit: 999,
      client_id: GATEWAY_CLIENT_ID,
    },
    success: function(data) {
      return databridgeRows(data);
    },
  },
};
