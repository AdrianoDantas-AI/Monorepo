-- S2-003: geospatial and route-tracking supporting indexes
CREATE EXTENSION IF NOT EXISTS postgis;

-- Spatial index for proximity/filter queries on stops coordinates.
CREATE INDEX IF NOT EXISTS stops_location_gix
ON "stops"
USING GIST (ST_SetSRID(ST_MakePoint("lng", "lat"), 4326));

-- Composite index optimized for trip route leg traversal.
CREATE INDEX IF NOT EXISTS legs_trip_stop_pair_idx
ON "legs" ("trip_id", "from_stop_id", "to_stop_id");

-- Helper index for progress lookups in active tracking flows.
CREATE INDEX IF NOT EXISTS route_tracks_trip_progress_idx
ON "route_tracks" ("trip_id", "progress_pct");
