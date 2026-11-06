// databridge-api on the phila.gov API gateway, called directly.
// Ported from vue3-atlas src/util/databridge.js - keep the timestamp handling in step.
export const DATABRIDGE_URL = 'https://api-prod.phila.gov/databridge-api/v1/get';
// the app's client id for the gateway - one id covers databridge, AIS search and AIS
// autocomplete. Only the local dev server sends it: the gateway recognizes the deployed
// origins itself and can't do that for localhost, which every app shares. Undefined in
// any build, so call sites omit the client_id param entirely
export const GATEWAY_CLIENT_ID = process.env.NODE_ENV === 'development' ? process.env.VUE_APP_GATEWAY_CLIENT_ID : undefined;

// databridge serializes timestamps as real UTC (since 2026-10-23), spelled two ways:
// '2026-09-02T13:30:00+00:00' on table= (PostgREST) and '2026-09-02T13:30:00.000Z' on
// sql= (Carto V3). Both are rewritten to carto's spelling - a trailing Z, no milliseconds -
// so every downstream date check sees what it always saw; the instant is not changed. A bare
// reading with no zone at all ('2026-09-02T09:30:00', a table the gateway hasn't converted)
// is still the Philadelphia clock, read as local time and relabeled to real UTC.
const UTC_TIMESTAMP = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.\d{3})?(?:Z|\+00:00)$/;
const LOCAL_CLOCK_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
function normalizeTimestamps(properties) {
  for (const key of Object.keys(properties)) {
    const value = properties[key];
    if (typeof value !== 'string') {
      continue;
    }
    const utc = value.match(UTC_TIMESTAMP);
    if (utc) {
      properties[key] = `${utc[1]}Z`;
    } else if (LOCAL_CLOCK_TIMESTAMP.test(value)) {
      properties[key] = new Date(value).toISOString().replace('.000Z', 'Z');
    }
  }
  return properties;
}

// unwraps the databridge envelope (data.features[].properties) to the carto rows
// shape the datafetch success handlers return
export function databridgeRows(data) {
  if (!data || !data.data || !data.data.features) {
    return [];
  }
  return data.data.features.map((f) => normalizeTimestamps(f.properties));
}
