const CARTO_URL = 'https://phl.carto.com/api/v2/sql'

export async function cartoQuery<T>(sql: string): Promise<T[]> {
  const url = `${CARTO_URL}?q=${encodeURIComponent(sql)}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Carto query failed: ${response.status}`)
  }
  const data = await response.json()
  return data.rows as T[]
}

export function buildInClause(values: string[]): string {
  return values.map(v => `'${v.replace(/'/g, "''")}'`).join(',')
}
