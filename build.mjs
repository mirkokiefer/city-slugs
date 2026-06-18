// build.mjs — derive every distribution format from data/city-slugs.csv.
//   node build.mjs
// Emits: full JSON, compact map JSON, scale subsets (CSV+JSON), SQLite, Parquet.
//
// Two identifiers per city, both unique and resolvable:
//   id   — the short, recognizable form (ber, sf, nyc); equals slug when the
//          city has no curated short form.
//   slug — the written-out form (berlin, sanfrancisco, newyorkcity).

import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";

const csv = readFileSync("data/city-slugs.csv", "utf8").trimEnd().split("\n");
const header = csv[0].split(",");

function parseLine(line) {
  const out = [];
  let cur = "", q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; }
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

const rows = csv.slice(1).map(parseLine).map((f) => ({
  id: f[0], slug: f[1], name: f[2], country: f[3], region: f[4] || null,
  timezone: f[5], lat: +f[6], lng: +f[7], population: +f[8],
}));
console.log(`parsed ${rows.length} rows`);

// full JSON
writeFileSync("data/city-slugs.json", JSON.stringify(rows));

// compact map JSON: [id, slug, name, lat, lng, population]
writeFileSync(
  "data/city-slugs.min.json",
  JSON.stringify(rows.map((r) => [r.id, r.slug, r.name, r.lat, r.lng, r.population]))
);

// scale subsets
const csvEscape = (v) => (/[",]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
const toCsv = (rs) =>
  [header.join(",")].concat(rs.map((r) =>
    [r.id, r.slug, r.name, r.country, r.region ?? "", r.timezone, r.lat, r.lng, r.population]
      .map((v) => csvEscape(String(v))).join(","))).join("\n") + "\n";
for (const [label, min] of [["1m", 1_000_000], ["100k", 100_000], ["15k", 15_000]]) {
  const subset = rows.filter((r) => r.population >= min);
  writeFileSync(`data/city-slugs-${label}.csv`, toCsv(subset));
  writeFileSync(`data/city-slugs-${label}.json`, JSON.stringify(subset));
  console.log(`subset ${label}: ${subset.length} cities`);
}

// SQLite (optional — skipped if sqlite3 is unavailable)
try {
  rmSync("data/city-slugs.db", { force: true });
  execSync(`sqlite3 data/city-slugs.db <<'SQL'
CREATE TABLE cities (id TEXT, slug TEXT, name TEXT, country TEXT, region TEXT,
  timezone TEXT, lat REAL, lng REAL, population INTEGER);
.mode csv
.import --skip 1 data/city-slugs.csv cities
CREATE UNIQUE INDEX idx_cities_id ON cities(id);
CREATE UNIQUE INDEX idx_cities_slug ON cities(slug);
CREATE INDEX idx_cities_name ON cities(name);
CREATE INDEX idx_cities_population ON cities(population);
SQL`);
  console.log("sqlite ok");
} catch (e) { console.warn("sqlite skipped:", e.message); }

// Parquet (optional — skipped if python/pandas is unavailable)
try {
  execSync(`python3 -c "
import pandas as pd
df = pd.read_csv('data/city-slugs.csv')
df.to_parquet('data/city-slugs.parquet', index=False)
print('parquet ok,', len(df), 'rows')
"`, { stdio: "inherit" });
} catch (e) { console.warn("parquet skipped:", e.message); }
