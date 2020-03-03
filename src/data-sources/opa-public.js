export default {
  id: 'opa-public',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  targets: {
    runOnce: true,
    get: function(state) {
      // console.log('opa-public get is running');
      if (state.lastSearchMethod === 'owner search') {
        return state.ownerSearch.data;
      } else if (state.lastSearchMethod === 'shape search' || state.lastSearchMethod === 'buffer search') {
        if (state.shapeSearch.data) {
          return state.shapeSearch.data.rows || [];
        }
      }
      // } else if (state.lastSearchMethod === 'buffer search') {
      //   return state.bufferSearch.data.rows;
      // }
      let opa = [];
      opa.push(state.geocode.data);
      if (state.geocode.related != null){
        for (let relate of state.geocode.related) {
          opa.push(relate);
        }
      }
      // console.log('opa-public, state.geocode.data.condo:', state.geocode.data.condo, 'state.condoUnits.units[Number(state.parcels.pwd[0].properties.PARCELID)][0]:', state.condoUnits.units[Number(state.parcels.pwd[0].properties.PARCELID)][0]);

      // if (state.geocode.data.condo != null && state.geocode.data.condo == true && state.condoUnits.units[Number(state.parcels.pwd[0].properties.PARCELID)].length) {
      // console.log('in opa-public.js, state.geocode.data.condo:', state.geocode.data.condo, 'state.geocode.related:', state.geocode.related);
      // if (state.geocode.related && state.geocode.related.length) {
      if (state.geocode.data.condo != null && state.geocode.data.condo == true) {
      // if (state.geocode.data.condo != null && state.geocode.data.condo == true || typeof state.geocode.data.condo !== undefined && state.geocode.data.condo == true) {
        // console.log('opa-public in if condo is running');
        // opa.push(state.geocode.related[0]);
        opa.push(state.condoUnits.units[Number(state.parcels.pwd[0].properties.PARCELID)][0]);
      }
      return opa;

    },
    getTargetId: function(target) {
      // console.log('opa-public getTargetId is running:', target);
      if(target.properties){
        return target.properties.opa_account_num;
      } else if(target.parcel_number === null) {
        return;
      }
      // console.log('opa-public getTargetId is running, target.parcel_number:', target.parcel_number);
      return target.parcel_number;

    },
  },
  options: {
    params: {
      q: function(input){
        // console.log('opa-public.js, input:', input);
        return "select * from opa_properties_public_pde where parcel_number IN("+ input +")";
      },
      // var inputEncoded = Object.keys(input).map(k => "'" + input[k] + "'").join(",");
    },
    success: function(data) {
      return data.rows;
    },
  },
};
