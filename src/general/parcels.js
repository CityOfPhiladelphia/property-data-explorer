export default {
  pwd: {
    multipleAllowed: true,
    geocodeFailAttemptParcel: null,
    clearStateOnError: false,
    wipeOutOtherParcelsOnReverseGeocodeOnly: true,
    geocodeField: 'parcelid',
    parcelIdInGeocoder: 'pwd_parcel_id',
    getByLatLngIfIdFails: false,
  },
  dor: {
    multipleAllowed: true,
    geocodeFailAttemptParcel: 'pwd',
    clearStateOnError: true,
    wipeOutOtherParcelsOnReverseGeocodeOnly: false,
    geocodeField: 'MAPREG',
    parcelIdInGeocoder: 'dor_parcel_id',
    getByLatLngIfIdFails: true,
  },
};
