export default {
  id: 'opa-public',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  targets: {
    runOnce: true,
    get: function(state) {
      // console.log("opa_public get running")
      if (state.lastSearchMethod === 'owner search') {
        return state.ownerSearch.data
      } else if (state.lastSearchMethod === 'shape search') {
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
      if(target.properties){
        return target.properties.opa_account_num;
      } else if(target.parcel_number === null) {
        return
      } else {
        return target.parcel_number
      }
    }
  },
  options: {
    params: {
      q: function(input){
        // var inputEncoded = Object.keys(input).map(k => "'" + input[k] + "'").join(",");
        return "select * from opa_properties_public where parcel_number IN("+ input +")"
      }
    },
    success: function(data) {
      return data.rows;
    }
  }
}
