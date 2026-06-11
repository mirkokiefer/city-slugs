export interface City {
  slug: string;
  name: string;
  country: string;
  region: string | null;
  timezone: string;
  lat: number;
  lng: number;
  population: number;
}

export type Tier = "1m" | "100k" | "15k";

/** All cities at a population tier, sorted by population (descending). */
export function cities(tier?: Tier): City[];

/** Map of slug -> city for a tier. */
export function bySlug(tier?: Tier): Map<string, City>;
