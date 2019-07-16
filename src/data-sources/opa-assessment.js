export default {
  id: 'opa-assessment',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  targets: {
    runOnce: true,
    get: function(state) {
      // console.log('opa-assessment get is running');
      if (state.lastSearchMethod === 'owner search') {
        return state.ownerSearch.data
      } else if (state.lastSearchMethod === 'shape search' || state.lastSearchMethod === 'buffer search') {
        return state.shapeSearch.data.rows
      } else {
        let opa = []
        opa.push(state.geocode.data);
        if (state.geocode.related != null){
          for (let relate of state.geocode.related) {
            opa.push(relate);
          }
        }
        if (state.geocode.data.condo != null && state.geocode.data.condo == true) {
          opa.push(state.condoUnits.units[Number(state.parcels.pwd.properties.PARCELID)][0]);
        }
        return opa;
      }
    },
    getTargetId: function(target) {
      // console.log('opa-assessment getTargetId is running');
      if(target.properties){
        return target.properties.opa_account_num;
      } else {
        return target.parcel_number
      }
    }
  },
  options: {
    params: {
      q: function(feature) {
        return "SELECT parcel_number, market_value, sale_date, sale_price FROM opa_properties_public WHERE parcel_number IN (" + feature + ")";
      }
    },
    success: function(data) {
      return data.rows;
    }
  }
}
