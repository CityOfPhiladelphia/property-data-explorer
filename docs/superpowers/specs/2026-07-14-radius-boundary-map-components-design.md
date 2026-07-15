# Radius & Boundary Map Selection Components — Design

*Date: 2026-07-14*
*Driven from: property-data-explorer (`vue3-rewrite` branch)*
*Components land in: phila-ui-4 `packages/map-core`*

## Goal

Add two reusable map controls to `@phila/phila-ui-map-core` that let a user select an
area on the map and get back a geometry:

- **Select Radius** — drop a center point, set a radius, get a circle.
- **Draw Boundaries** — click vertices to draw a polygon.

Consume both in property-data-explorer to power the "search properties within an area"
feature that the old app (property.phila.gov) exposes as two map buttons, and that the
v3 rewrite is currently missing a working UI for.

## Background / current state

- **map-core already has `DrawTool`** — but it is a *measurement* tool (polygon/line
  drawing with a vertex table, per-segment distances, and total length/area). Different
  job from "select the properties inside this shape." It emits only `polygonComplete`.
- **The app's shape search is wired to a dead event.** `MapContainer.vue` renders
  `<DrawTool @draw="handleShapeDraw" />`, but `DrawTool` never emits `draw` (only
  `polygonComplete`). So boundary search does not currently fire at all.
- **The search backend is ready and generic.** `searchStore.doShapeSearch(geojson)`
  converts any GeoJSON → WKT (`useGeojsonToWkt`, which handles Polygon/Point/LineString)
  → `ST_Intersects` against `pwd_parcels`, then loads the intersecting OPA properties.
  A drawn polygon *or* a radius-circle-rendered-as-a-polygon both feed this same path.

The missing piece is genuinely the **map UI that produces the geometry**, not the search.

## Decisions (settled during brainstorming)

1. **Two new, purpose-built components** — `RadiusSelect` + `BoundaryDraw`. Leave the
   existing `DrawTool` untouched. Shared draw-mode plumbing is factored into a composable
   (see below) so the fiddly click-coordination logic is not duplicated.
2. **Radius UX = slider / number input.** After the center click, a floating panel shows
   a radius slider + number field (feet); the circle updates live; a "Search" button
   confirms.
3. **Trigger buttons = icon-only `MapButton`s** with hover tooltips, consistent with the
   other map-core controls (`DrawTool`, `BasemapToggle`). Not the labeled pills of the
   old app.
4. **Components are search-agnostic.** They emit a GeoJSON geometry and know nothing about
   Carto, `pwd_parcels`, or properties. The consuming app wires the emit to its own
   `doShapeSearch`. This keeps map-core reusable and app-specific query logic out of the
   design system.

## Architecture

Both components share the same skeleton:

```
MapButton toggle
  → enter draw mode (cursor + isDrawing coordination with Map.vue)
    → build geometry (radius: center + slider; boundary: click vertices)
      → render a live preview layer (FillLayer + LineLayer [+ vertex CircleLayer])
        → emit a GeoJSON Feature on confirm
          → exit mode; drawn shape stays visible until re-drawn or cleared
```

### Shared composable: `useMapDrawMode.ts`

Holds the plumbing both components need, so each component file stays focused on its own
UX:

- Inject `map`, `isLoaded`, `isDrawing` (the same `isDrawing` provide/inject that
  `DrawTool` uses to block `Map.vue` from emitting `@click` while a draw is active).
- Manage activate/deactivate, canvas cursor, and map-click subscription/cleanup.
- Expose reactive `isActive` state and register/unregister helpers.

`RadiusSelect` and `BoundaryDraw` each own only their geometry-building state and panel UI.

### Emit contract (identical for both)

- `@select` → a GeoJSON **Feature**: `{ type: "Feature", geometry, properties: {} }`.
  Shape matches what `doShapeSearch` reads (`geojson.geometry.{type,coordinates}`).
- `@clear` → the user cancelled or cleared the shape.

## Component APIs

Both live in `map-core/src/components/controls/`, extend the shared `BaseProps`
(`position`, `title`, `icon`, `iconSize`, `size`, `teleportTo`), and are exported from
`src/components/index.ts`.

### `RadiusSelect.vue`

- **Interaction:** `MapButton` toggle → first map click drops the center → `MapFloatingPanel`
  opens with a radius slider + number field (feet) → live circle preview (`FillLayer` +
  `LineLayer`) updates as the value changes → "Search" confirms and emits; "Cancel"/clear
  resets and emits `@clear`.
- **Extra props:** `defaultRadius`, `minRadius`, `maxRadius`, `step` (all feet),
  `segments` (circle smoothness, default 64).
- **Emitted geometry:** a **Polygon** approximating the circle — N points around the
  center computed via a small geodesic-destination helper (~15 lines, no turf dependency).
  Rendering the circle as a Polygon is deliberate: it flows through the app's existing
  `geojsonToWkt` (Polygon branch) and the `shape` URL param with **zero changes**.

### `BoundaryDraw.vue`

- **Interaction:** `MapButton` toggle → click to add vertices → close via
  click-near-first-point, double-click, or a "Finish" button → emits. Live preview
  (`FillLayer` + `LineLayer` + vertex `CircleLayer`); "Cancel"/"Clear" available.
- **Emitted geometry:** a **Polygon**.
- Essentially `DrawTool`'s draw interaction minus the measurement table / distance / area
  machinery.

### Naming

`RadiusSelect` / `BoundaryDraw`. Trivially renameable to `RadiusTool` / `BoundaryTool`
(to echo `DrawTool`) if preferred before implementation.

## App integration (property-data-explorer)

- In `MapContainer.vue`, **remove the dead `<DrawTool @draw="handleShapeDraw" />`** and add:
  ```
  <RadiusSelect  position="top-left" @select="handleShapeSelect" @clear="handleShapeClear" />
  <BoundaryDraw  position="top-left" @select="handleShapeSelect" @clear="handleShapeClear" />
  ```
- `handleShapeSelect(feature)` → `search.doShapeSearch(feature)`.
- `handleShapeClear()` → clear results + drawn shape.
- The drawn shape **stays visible** after search (component-owned state, like `DrawTool`
  keeps completed polygons) so the user sees what they selected.
- `doShapeSearch` already resets `searchResults`, so a new shape replaces the old
  selection for free. Radius emits a Polygon, so it also flows through the existing
  `shape` URL-param path in `App.vue` with no special-casing.
- Remove `DrawTool` from the app's imports (it stays in map-core for other consumers).

### Dev linking (setup risk to resolve first)

The app currently depends on **published** map-core (`1.1.1`). To develop the new
components we re-add a `pnpm.overrides` `link:` to local
`../phila-ui-4/packages/map-core`, and **rebuild map-core after edits** (consumers resolve
`dist/`, not source).

⚠️ **Known skew gotcha:** linking a dev map-core often also requires linking
`@phila/phila-ui-core`, because dev map-core components use unreleased core APIs. The app
is now on published `@phila/phila-ui-core@3.0.0`; the local phila-ui-4 source must be
compatible. **First task in the implementation plan is to stand up and verify this dev
loop** (edit map-core source → rebuild → change shows in the app) before writing component
code, so we are not later fighting stale `dist/` or a version mismatch.

## Out of scope for this bite

- The orphaned `SearchModeSelector` / owner + block search-mode UI — a separate v3 gap.
- **Publishing** map-core to npm — dev via symlink now. A **changeset** is added as part
  of this work (per phila-ui-4 convention), but the actual publish is a later step.
- The measurement `DrawTool` — untouched.
- Automated E2E tests for these components — manual verification this bite; automated
  coverage folds into the later Playwright gap (rewrite plan Task 20).

## Verification

- **map-core:** exercise both components in map-core's own dev/story environment (or the
  app) — radius: center + resize + search emits a valid circle Polygon; boundary: draw +
  close emits a valid Polygon; both clear correctly and coordinate click-blocking with
  `Map.vue` (map `@click` parcel selection still works when neither tool is active).
- **app:** with the dev link live, drawing a boundary and setting a radius each return the
  expected intersecting properties via `doShapeSearch`; the `shape` URL param round-trips.
- Manual click-through of the surrounding views after the `@phila/phila-ui-core@3.0.0`
  major bump, since we are touching the map surface.

## Version control

- map-core work happens on a feature branch in the **phila-ui-4** repo (its own repo),
  with a changeset.
- App integration happens on the property-data-explorer **`vue3-rewrite`** branch (or a
  short-lived branch off it).
- These are two repos; coordinate the dev link between them during development.
