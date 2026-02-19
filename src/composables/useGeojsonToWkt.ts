export function geojsonToWkt(geojson: any): string {
  if (!geojson || !geojson.geometry) {
    throw new Error('Invalid GeoJSON: missing geometry')
  }

  const { type, coordinates } = geojson.geometry

  switch (type) {
    case 'Polygon':
      return `POLYGON((${coordinates[0].map((c: number[]) => `${c[0]} ${c[1]}`).join(',')}))`
    case 'Point':
      return `POINT(${coordinates[0]} ${coordinates[1]})`
    case 'LineString':
      return `LINESTRING(${coordinates.map((c: number[]) => `${c[0]} ${c[1]}`).join(',')})`
    default:
      throw new Error(`Unsupported geometry type: ${type}`)
  }
}
