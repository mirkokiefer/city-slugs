// city-slugs — canonical slugs for the world's cities.
// Bundled tiers: "1m" (561), "100k" (6k), "15k" (34k). The full 233k dataset
// is on the repo / CDN — see README.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const cache = new Map();

/** All cities at a population tier, sorted by population (descending). */
export function cities(tier = "15k") {
  if (!["1m", "100k", "15k"].includes(tier)) {
    throw new Error(`Unknown tier "${tier}" — bundled tiers: 1m, 100k, 15k`);
  }
  if (!cache.has(tier)) {
    const path = fileURLToPath(new URL(`./data/city-slugs-${tier}.json`, import.meta.url));
    cache.set(tier, JSON.parse(readFileSync(path, "utf8")));
  }
  return cache.get(tier);
}

/** Map of slug -> city for a tier. */
export function bySlug(tier = "15k") {
  const key = "bySlug:" + tier;
  if (!cache.has(key)) {
    cache.set(key, new Map(cities(tier).map((c) => [c.slug, c])));
  }
  return cache.get(key);
}

/** Map of id -> city for a tier (short ids: ber, sf, nyc). */
export function byId(tier = "15k") {
  const key = "byId:" + tier;
  if (!cache.has(key)) {
    cache.set(key, new Map(cities(tier).map((c) => [c.id, c])));
  }
  return cache.get(key);
}
