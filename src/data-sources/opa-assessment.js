export default {
  id: 'opa-assessment',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
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

        // let idNumber = state.parcels.pwd ? Number(state.parcels.pwd[0].properties.PARCELID) : state.geocode.data.properties.dor_parcel_id;
        let idNumber = 101;
        let unitKeys = Object.keys(state.condoUnits.units);
        console.log('opa-assessment.js idNumber:', idNumber, 'unitKeys:', unitKeys);
        // if (Object.keys(state.condoUnits.units)
        opa.push(state.condoUnits.units[idNumber][0]);
        // if (unitKeys[0] !== '') {
        //   opa.push(state.condoUnits.units[idNumber][0]);
        // } else {
        //   opa.push(state.condoUnits.units[''][0]);
        // }
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
      q: function(feature) {
        return "SELECT parcel_number, market_value, sale_date, sale_price FROM opa_properties_public_pde WHERE parcel_number IN (" + feature + ")";
      },
    },
    success: function(data) {
      return data.rows;
    },
  },
};
