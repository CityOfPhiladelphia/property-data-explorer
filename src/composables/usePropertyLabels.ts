export const conditionLabels: Record<string, string> = {
  '0': 'Not Applicable',
  '1': 'Newer Construction',
  '2': 'Rehabbed',
  '3': 'Above Average',
  '4': 'Average',
  '5': 'Below Average',
  '6': 'Vacant',
  '7': 'Sealed / Structurally Compromised',
}

export const basementLabels: Record<string, string> = {
  '0': 'None',
  A: 'Full Finished',
  B: 'Full Semi-Finished',
  C: 'Full Unfinished',
  D: 'Partial Finished',
  E: 'Partial Semi-Finished',
  F: 'Partial Unfinished',
  G: 'Unknown',
  H: 'Improved Basement',
  I: 'Finished Basement',
  J: 'Unknown',
}

export const garageLabels: Record<string, string> = {
  A: 'Built-in',
  B: 'Detached',
  C: 'Attached',
  F: 'Integral',
  S: 'Shared',
  T: 'Converted to Living Space',
}

export const fuelLabels: Record<string, string> = {
  A: 'Natural Gas',
  B: 'Oil',
  C: 'Electric',
  D: 'Coal',
  E: 'Solar',
  F: 'Wood',
  G: 'Other',
  H: 'None',
}

export const heaterLabels: Record<string, string> = {
  A: 'Hot Air (Ducts)',
  B: 'Hot Water (Radiators/Baseboard)',
  C: 'Electric Baseboard',
  D: 'Heat Pump',
  E: 'Other',
  F: 'Central',
  G: 'None',
  H: 'Radiant',
}

export const viewLabels: Record<string, string> = {
  '0': 'Not Applicable',
  A: 'Typical/Favorable',
  B: 'Park/Green Area',
  C: 'Skyline/Water',
  D: 'Commercial/Industrial',
  E: 'Adverse',
  H: 'Cemetery',
  I: 'Other',
}

export const trashDayLabels: Record<string, string> = {
  MON: 'Monday',
  TUE: 'Tuesday',
  TUES: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
  SAT: 'Saturday',
  SUN: 'Sunday',
}

export function formatStories(count: number | null, livableArea: number): string {
  if (count == null || count === 0) {
    return livableArea > 0 ? 'Not Available' : 'None'
  }
  return count === 1 ? '1 story' : `${count} stories`
}

export function formatYearBuilt(year: string | null, isEstimate: boolean): string {
  if (!year || year === '0000' || year === '0') return 'N/A'
  return isEstimate ? `${year} (estimated)` : year
}
