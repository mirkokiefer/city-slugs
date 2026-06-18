export interface City {
  /** Short, recognizable canonical id (ber, sf, nyc). Equals `slug` when the
   *  city has no curated short form. Globally unique; resolves to this city. */
  id: string;
  /** Written-out canonical slug (berlin, sanfrancisco, newyorkcity).
   *  Globally unique; resolves to this city. */
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

/** Map of id -> city for a tier (short ids: ber, sf, nyc). */
export function byId(tier?: Tier): Map<string, City>;
