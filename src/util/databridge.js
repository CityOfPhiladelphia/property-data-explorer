// databridge-api on the phila.gov API gateway, called directly - the app's client id
// (a public identifier, not a secret) rides every request.
// Ported from vue3-atlas src/util/databridge.js - keep the timestamp handling in step.
export const DATABRIDGE_URL = 'https://api-prod.phila.gov/databridge-api/v1/get';
export const GATEWAY_CLIENT_ID = process.env.VUE_APP_GATEWAY_CLIENT_ID;

// databridge serializes every timestamp as the table's LOCAL clock reading - sometimes
// bare ('2026-09-10T16:47:51'), sometimes with a false UTC label ('...T16:47:51.000Z') -
// while old carto converts properly ('2026-09-10T20:47:51Z' for the same row). Trusting
// the false Z shifts times 4-5 hours and rolls dates back a day, so every form is read
// as local time and relabeled to real UTC, reproducing old carto's values exactly.
const LOCAL_CLOCK_TIMESTAMP = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.\d{3})?Z?$/;
function normalizeTimestamps(properties) {
  for (const key of Object.keys(properties)) {
    const value = properties[key];
    if (typeof value !== 'string') {
      continue;
    }
    const clock = value.match(LOCAL_CLOCK_TIMESTAMP);
    if (clock) {
      properties[key] = new Date(clock[1]).toISOString().replace('.000Z', 'Z');
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
