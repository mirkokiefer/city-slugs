---
license: cc-by-4.0
language:
  - en
tags:
  - cities
  - geonames
  - geocoding
  - timezone
  - gazetteer
  - slugs
pretty_name: City Slugs
size_categories:
  - 100K<n<1M
configs:
  - config_name: default
    data_files:
      - split: train
        path: city-slugs.parquet
---

# City Slugs

**Two canonical, URL-safe identifiers for each of 234,136 cities and towns
worldwide** (every GeoNames populated place with population ≥ 500), fixed by a
deterministic rule:

- **`id`** — the short, recognizable form: `ber`, `sf`, `nyc`, `tyo` for cities
  with a curated metro / airport / colloquial code; equal to the slug otherwise.
- **`slug`** — the written-out form: `berlin`, `sanfrancisco`, `newyorkcity`.

Both are globally unique and resolve to the same city. Geocoding ids (GeoNames
ids, place ids) are stable but opaque; names are readable but ambiguous (there
are six Heidelbergs). This dataset gives each place a single readable
identifier that survives in a URL, a config file, or a conversation.

## Schema

| column | type | notes |
|---|---|---|
| `id` | string | short canonical id (`ber`); equals `slug` when no curated short form |
| `slug` | string | written-out canonical slug (`berlin`) |
| `name` | string | display name |
| `country` | string | ISO 3166-1 alpha-2 |
| `region` | string \| null | GeoNames admin-1 name, present where it disambiguates |
| `timezone` | string | IANA zone |
| `lat`, `lng` | float | coordinates, rounded to 2 decimals (~1 km) |
| `population` | int | GeoNames population |

```
id   slug          name             country  population
ber  berlin        Berlin           DE        3644826
sf   sanfrancisco  San Francisco    US         864816
nyc  newyorkcity   New York City    US        8804190
—    heidelberg    Heidelberg       DE         160355
—    paloalto      Palo Alto        US          66853
```

## Assignment rules

**Slugs** are claimed in global population order; each city takes the shortest
free form: `name` → `name_cc` → `name_cc_region` → `name_cc_region_N`. The bare
name goes to the most populous bearer (`paloalto` = Palo Alto, California),
namesakes fall to the disambiguated forms (`paloalto_mx`).

**Ids** equal the slug unless a curated short form exists, claimed over the
same namespace (so an id never collides with another city's slug): colloquial
name (`sf`) → metro code (`nyc`) → iconic airport code (`ber`, curated
allow-list — cryptic codes like `bom`/`msy` stay search aliases) → else `id =
slug`.

Deterministic: the same GeoNames snapshot yields the same assignment. Treat
published ids and slugs as append-only.

## Usage

```python
from datasets import load_dataset
ds = load_dataset("mirkokiefer/city-slugs", split="train")
ds.filter(lambda r: r["country"] == "DE" and r["population"] > 50000)
```

```python
import duckdb
duckdb.sql("SELECT id, slug, name FROM 'city-slugs.parquet' WHERE id != slug LIMIT 10")
```

## Provenance & license

Derived from [GeoNames](https://www.geonames.org) (`cities500` +
`admin1CodesASCII`), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/);
this dataset is published under the same license.

Also available as an npm package (`city-slugs`, with JSON tiers + a `byId` /
`bySlug` API) and on [GitHub](https://github.com/mirkokiefer/city-slugs).
Born in [Zeit — a world clock for iPhone, Mac, and the web](https://zeit.xyz),
where the ids power short share URLs (`zeit.xyz/?c=ber,sf,nyc`).
