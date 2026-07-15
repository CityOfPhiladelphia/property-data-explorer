# Radius & Boundary Map Selection Components — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two reusable map controls to `@phila/phila-ui-map-core` — `RadiusSelect` (drop a center, set a radius) and `BoundaryDraw` (click a polygon) — that emit a GeoJSON Feature, and consume them in property-data-explorer to power area-based property search.

**Architecture:** Both components share a `useMapDrawMode` composable that handles the map-click subscription, crosshair cursor, and `isDrawing` coordination with `Map.vue`. Each component owns only its own geometry-building + panel UI, and emits a search-agnostic `@select` Feature. The app wires `@select` to its existing `searchStore.doShapeSearch(geojson)` (WKT → `ST_Intersects` on `pwd_parcels`). The radius circle is emitted as a Polygon so it flows through the existing WKT/URL-param code unchanged.

**Tech Stack:** Vue 3 `<script setup>` + TypeScript, MapLibre GL (via map-core's inject-based `Map.vue`), Vitest (repo-root runner), Storybook (component verification), pnpm workspaces + changesets.

## Global Constraints

- **Two repos.** Component code lands in **phila-ui-4** (`packages/map-core`); integration lands in **property-data-explorer** (`vue3-rewrite` branch). Each task states which repo it commits to.
- **Code style differs per repo.** map-core: **semicolons + double quotes** (match `DrawTool.vue`/`types.ts`). property-data-explorer: **no semicolons + single quotes** (match `MapContainer.vue`/`searchStore.ts`). Match the file you're in.
- **map-core dev loop:** run `pnpm dev:lib` (`vite build --watch`) in `packages/map-core` so `dist/` rebuilds on save; consumers resolve `dist/`, not source. If the app doesn't pick up a change, clear its Vite cache (`rm -rf node_modules/.vite`) and restart.
- **Andy runs all dev servers and watchers himself** (`pnpm dev:lib`, `pnpm dev`, `pnpm storybook`). Verification steps that need a running server are confirmed by Andy in the browser — do not start servers.
- **Versioning via changesets.** Never hand-edit `package.json` versions. Add a changeset; name the file with 3 random words (per phila-ui-4 convention).
- **Breaking changes are acceptable in map-core** (barely adopted) — no backward-compat shims.
- **Node 24 is already active** in tool shells — do not run `nvm use`.

---

## Task 1: Stand up & verify the map-core dev link

**Goal:** Prove the edit → rebuild → see-in-app loop works before writing component code. This is the highest-risk setup step (known core-skew gotcha), so it goes first and gates everything else.

**Files:**
- Modify (property-data-explorer): `package.json` — add `pnpm.overrides`
- Branch (phila-ui-4): create `feat/map-radius-boundary-select`

**Interfaces:**
- Produces: a working local link so later tasks' map-core exports are importable in the app.

- [ ] **Step 1: Create the map-core feature branch (phila-ui-4 repo)**

```bash
cd ../phila-ui-4
git checkout -b feat/map-radius-boundary-select
```

- [ ] **Step 2: Add the pnpm override in property-data-explorer**

In `property-data-explorer/package.json`, add (or extend) a `pnpm.overrides` block. Use `link:` (not `file:`) so it's a live symlink:

```json
"pnpm": {
  "overrides": {
    "@phila/phila-ui-map-core": "link:../phila-ui-4/packages/map-core"
  }
}
```

- [ ] **Step 3: Reinstall so the link resolves**

```bash
cd property-data-explorer
pnpm install
```
Expected: no errors; `node_modules/@phila/phila-ui-map-core` is a symlink to the local package.

- [ ] **Step 4: Andy starts the watch build + app dev server**

Ask Andy to run, in two terminals:
- `cd ../phila-ui-4/packages/map-core && pnpm dev:lib`
- `cd property-data-explorer && pnpm dev`

- [ ] **Step 5: Verify the loop with a throwaway edit**

Temporarily edit `phila-ui-4/packages/map-core/src/components/controls/DrawTool.vue` — change the default `title` prop from `"Draw Tool"` to `"Draw Tool LINK-TEST"`. Save. Ask Andy to hover the draw button in the app and confirm the tooltip shows `LINK-TEST`.

⚠️ If it does NOT update: `rm -rf property-data-explorer/node_modules/.vite`, ask Andy to restart `pnpm dev`. If it still fails, the `@phila/phila-ui-core` versions are likely skewed — add `"@phila/phila-ui-core": "link:../phila-ui-4/packages/core"` to the overrides, `pnpm install`, and retry. Resolve this before continuing.

- [ ] **Step 6: Revert the throwaway edit**

Restore `DrawTool.vue`'s title to `"Draw Tool"`. Confirm the app reverts.

- [ ] **Step 7: Commit the override (property-data-explorer)**

```bash
cd property-data-explorer
git add package.json pnpm-lock.yaml
git commit -m "chore: link local map-core for radius/boundary component dev"
```

---

## Task 2: Circle-to-polygon geometry helper (TDD)

**Goal:** A pure function that converts a center + radius (feet) into a closed Polygon approximating a circle. This is the one fully unit-tested piece.

**Files:** (phila-ui-4)
- Create: `packages/map-core/src/utils/circle.ts`
- Test: `packages/map-core/src/utils/circle.test.ts`

**Interfaces:**
- Produces: `circlePolygon(center: [number, number], radiusFeet: number, segments?: number): PolygonGeometry` — imported by `RadiusSelect.vue` (Task 5). `PolygonGeometry` is the existing type in `controls/types.ts`.

- [ ] **Step 1: Write the failing test**

Create `packages/map-core/src/utils/circle.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { circlePolygon } from "./circle";

// Haversine distance in feet, for assertions.
function distanceFeet(a: number[], b: number[]): number {
  const R = 6378137;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h)) * 3.28084;
}

const CENTER: [number, number] = [-75.1635, 39.9526]; // Philadelphia

describe("circlePolygon", () => {
  it("returns a closed Polygon with segments+1 coordinates", () => {
    const poly = circlePolygon(CENTER, 500, 64);
    expect(poly.type).toBe("Polygon");
    expect(poly.coordinates[0]).toHaveLength(65);
    expect(poly.coordinates[0][0]).toEqual(poly.coordinates[0][64]);
  });

  it("places every vertex within 1 ft of the requested radius", () => {
    const radius = 500;
    const poly = circlePolygon(CENTER, radius, 64);
    for (const pt of poly.coordinates[0]) {
      expect(Math.abs(distanceFeet(CENTER, pt) - radius)).toBeLessThan(1);
    }
  });

  it("grows with radius", () => {
    const small = circlePolygon(CENTER, 100, 32);
    const big = circlePolygon(CENTER, 1000, 32);
    expect(distanceFeet(CENTER, big.coordinates[0][0])).toBeGreaterThan(
      distanceFeet(CENTER, small.coordinates[0][0]),
    );
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd phila-ui-4 && pnpm vitest run packages/map-core/src/utils/circle.test.ts`
Expected: FAIL — cannot resolve `./circle`.

- [ ] **Step 3: Write the implementation**

Create `packages/map-core/src/utils/circle.ts`:

```ts
import type { PolygonGeometry } from "../components/controls/types";

const EARTH_RADIUS_M = 6378137; // WGS84 equatorial radius
const FEET_PER_METER = 3.28084;

/**
 * Build a Polygon approximating a circle of `radiusFeet` around `center` ([lng, lat]).
 * Vertices are placed with a geodesic destination formula so the ring is a true circle
 * on the ground. The ring is explicitly closed (first coordinate === last).
 */
export function circlePolygon(
  center: [number, number],
  radiusFeet: number,
  segments = 64,
): PolygonGeometry {
  const [lng, lat] = center;
  const angularDistance = radiusFeet / FEET_PER_METER / EARTH_RADIUS_M;
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;

  const ring: number[][] = [];
  for (let i = 0; i < segments; i++) {
    const bearing = (2 * Math.PI * i) / segments;
    const sinLat =
      Math.sin(latRad) * Math.cos(angularDistance) +
      Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(bearing);
    const pointLat = Math.asin(sinLat);
    const pointLng =
      lngRad +
      Math.atan2(
        Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latRad),
        Math.cos(angularDistance) - Math.sin(latRad) * sinLat,
      );
    ring.push([(pointLng * 180) / Math.PI, (pointLat * 180) / Math.PI]);
  }
  ring.push(ring[0]); // close the ring

  return { type: "Polygon", coordinates: [ring] };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd phila-ui-4 && pnpm vitest run packages/map-core/src/utils/circle.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit (phila-ui-4)**

```bash
cd phila-ui-4
git add packages/map-core/src/utils/circle.ts packages/map-core/src/utils/circle.test.ts
git commit -m "feat(map-core): add circlePolygon geometry helper"
```

---

## Task 3: Shared types + `useMapDrawMode` composable

**Goal:** Add the component prop/emit types and the shared draw-mode plumbing both components consume.

**Files:** (phila-ui-4)
- Modify: `packages/map-core/src/components/controls/types.ts` (append new types)
- Create: `packages/map-core/src/composables/useMapDrawMode.ts`

**Interfaces:**
- Produces:
  - `SelectFeature`, `RadiusSelectProps`, `RadiusSelectEmits`, `BoundaryDrawProps`, `BoundaryDrawEmits` (in `controls/types.ts`)
  - `useMapDrawMode(onClick: (e: MapMouseEvent) => void): { map, isLoaded, isActive: Ref<boolean>, activate(): void, deactivate(): void }`
- Consumes: `PolygonGeometry`, `MapControlPosition`, `BaseProps`, `ComponentSize`, `Component` — all already in `types.ts`.

- [ ] **Step 1: Append component types to `controls/types.ts`**

Add at the end of `packages/map-core/src/components/controls/types.ts`:

```ts
// ============================================
// RadiusSelect.vue / BoundaryDraw.vue Types
// ============================================

export interface SelectFeature {
  type: "Feature";
  geometry: PolygonGeometry;
  properties: Record<string, unknown>;
}

export interface RadiusSelectProps extends BaseProps {
  icon?: Component | string;
  position?: MapControlPosition;
  title?: string;
  iconSize?: number;
  size?: ComponentSize;
  teleportTo?: HTMLElement | null;
  /** Initial radius in feet. Default 250. */
  defaultRadius?: number;
  /** Minimum radius in feet. Default 50. */
  minRadius?: number;
  /** Maximum radius in feet. Default 1000. */
  maxRadius?: number;
  /** Slider/number step in feet. Default 10. */
  step?: number;
  /** Polygon segments approximating the circle. Default 64. */
  segments?: number;
}

export interface RadiusSelectEmits {
  (e: "select", feature: SelectFeature): void;
  (e: "clear"): void;
}

export interface BoundaryDrawProps extends BaseProps {
  icon?: Component | string;
  position?: MapControlPosition;
  title?: string;
  iconSize?: number;
  size?: ComponentSize;
  teleportTo?: HTMLElement | null;
}

export interface BoundaryDrawEmits {
  (e: "select", feature: SelectFeature): void;
  (e: "clear"): void;
}
```

- [ ] **Step 2: Create the composable**

Create `packages/map-core/src/composables/useMapDrawMode.ts`:

```ts
import { inject, ref, onBeforeUnmount, type Ref } from "vue";
import type { Map as MapLibreMap, MapMouseEvent } from "maplibre-gl";

export interface UseMapDrawModeReturn {
  map: Ref<MapLibreMap | null> | undefined;
  isLoaded: Ref<boolean> | undefined;
  isActive: Ref<boolean>;
  activate: () => void;
  deactivate: () => void;
}

/**
 * Shared plumbing for map controls that put the map into a "draw" mode.
 *
 * Toggles the crosshair cursor, coordinates with Map.vue's `isDrawing` inject
 * (so parcel @click handlers don't fire mid-draw), and registers a single map
 * click handler that is attached only while the mode is active.
 *
 * @param onClick called for each map click while the mode is active.
 */
export function useMapDrawMode(onClick: (e: MapMouseEvent) => void): UseMapDrawModeReturn {
  const map = inject<Ref<MapLibreMap | null>>("map");
  const isLoaded = inject<Ref<boolean>>("isLoaded");
  const isDrawing = inject<Ref<boolean>>("isDrawing", ref(false));
  const isActive = ref(false);

  const handleClick = (e: MapMouseEvent): void => onClick(e);

  function activate(): void {
    if (!map?.value || isActive.value) return;
    isActive.value = true;
    isDrawing.value = true;
    map.value.getCanvas().style.cursor = "crosshair";
    map.value.on("click", handleClick);
  }

  function deactivate(): void {
    isActive.value = false;
    isDrawing.value = false;
    if (!map?.value) return;
    map.value.off("click", handleClick);
    map.value.getCanvas().style.cursor = "";
  }

  onBeforeUnmount(() => {
    try {
      if (map?.value) map.value.off("click", handleClick);
    } catch {
      // map already torn down during hot reload
    }
  });

  return { map, isLoaded, isActive, activate, deactivate };
}
```

- [ ] **Step 3: Type-check**

Run: `cd phila-ui-4 && pnpm --filter @phila/phila-ui-map-core type-check`
Expected: no errors.

- [ ] **Step 4: Commit (phila-ui-4)**

```bash
cd phila-ui-4
git add packages/map-core/src/components/controls/types.ts packages/map-core/src/composables/useMapDrawMode.ts
git commit -m "feat(map-core): add draw-mode composable and radius/boundary types"
```

---

## Task 4: `BoundaryDraw` component

**Goal:** Icon button that toggles polygon-draw mode; click to add vertices; close by clicking the first vertex or a "Search this area" button; emits a Polygon Feature.

**Files:** (phila-ui-4)
- Create: `packages/map-core/src/components/controls/BoundaryDraw.vue`
- Create: `packages/map-core/stories/BoundaryDraw.stories.ts`
- Modify: `packages/map-core/src/components/index.ts`

**Interfaces:**
- Consumes: `useMapDrawMode` (Task 3), `BoundaryDrawProps`/`BoundaryDrawEmits`/`SelectFeature` (Task 3), `MapButton`, `MapFloatingPanel`, `FillLayer`, `LineLayer`, `CircleLayer`.
- Produces: `<BoundaryDraw @select @clear />` exported from map-core, consumed in Task 7.

- [ ] **Step 1: Create the component**

Create `packages/map-core/src/components/controls/BoundaryDraw.vue`:

```vue
<script setup lang="ts">
import { ref, computed } from "vue";
import MapButton from "./MapButton.vue";
import MapFloatingPanel from "./MapFloatingPanel.vue";
import FillLayer from "../layers/FillLayer.vue";
import LineLayer from "../layers/LineLayer.vue";
import CircleLayer from "../layers/CircleLayer.vue";
import { useMapDrawMode } from "../../composables/useMapDrawMode";
import { IconPencil } from "@phila/phila-ui-core/icons";
import type { MapMouseEvent } from "maplibre-gl";
import type { BoundaryDrawProps, BoundaryDrawEmits } from "./types";

const props = withDefaults(defineProps<BoundaryDrawProps>(), {
  position: "top-left",
  title: "Draw boundaries",
});
const emit = defineEmits<BoundaryDrawEmits>();

const iconToUse = props.icon || IconPencil;

const points = ref<[number, number][]>([]);
const closed = ref(false);

const { map, isActive, activate, deactivate } = useMapDrawMode(handleMapClick);

function handleMapClick(e: MapMouseEvent): void {
  if (closed.value) return;
  const p: [number, number] = [e.lngLat.lng, e.lngLat.lat];
  if (points.value.length >= 3 && map?.value) {
    const first = map.value.project(points.value[0]);
    const click = map.value.project(p);
    if (Math.hypot(first.x - click.x, first.y - click.y) < 12) {
      finish();
      return;
    }
  }
  points.value.push(p);
}

function toggle(): void {
  if (isActive.value) {
    cancel();
    return;
  }
  points.value = [];
  closed.value = false;
  activate();
}

function finish(): void {
  if (points.value.length < 3) return;
  const ring = [...points.value, points.value[0]];
  closed.value = true;
  deactivate();
  emit("select", {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [ring] },
    properties: {},
  });
}

function cancel(): void {
  const hadShape = closed.value;
  points.value = [];
  closed.value = false;
  deactivate();
  if (hadShape) emit("clear");
}

const previewSource = computed(() => {
  const coords = points.value.map(p => [p[0], p[1]]);
  const geometry =
    coords.length >= 3
      ? { type: "Polygon" as const, coordinates: [[...coords, coords[0]]] }
      : coords.length === 2
        ? { type: "LineString" as const, coordinates: coords }
        : { type: "Point" as const, coordinates: coords[0] ?? [0, 0] };
  return {
    type: "geojson" as const,
    data: { type: "Feature" as const, properties: {}, geometry },
  };
});

const vertexSource = computed(() => ({
  type: "geojson" as const,
  data: {
    type: "FeatureCollection" as const,
    features: points.value.map(p => ({
      type: "Feature" as const,
      properties: {},
      geometry: { type: "Point" as const, coordinates: p },
    })),
  },
}));

const hasShape = computed(() => points.value.length > 0);
</script>

<template>
  <FillLayer
    v-if="points.length >= 3"
    id="boundary-draw-fill"
    :source="previewSource"
    :paint="{ 'fill-color': '#2176d2', 'fill-opacity': 0.2 }"
  />
  <LineLayer
    v-if="points.length >= 2"
    id="boundary-draw-line"
    :source="previewSource"
    :paint="{ 'line-color': '#2176d2', 'line-width': 2 }"
  />
  <CircleLayer
    v-if="hasShape"
    id="boundary-draw-vertices"
    :source="vertexSource"
    :paint="{
      'circle-radius': 4,
      'circle-color': '#2176d2',
      'circle-stroke-color': '#fff',
      'circle-stroke-width': 2,
    }"
  />

  <MapButton
    :icon="iconToUse"
    :position="props.position"
    :title="props.title"
    :icon-size="props.iconSize"
    :size="props.size"
    :teleport-to="props.teleportTo"
    :toggleable="true"
    :active="isActive"
    @click="toggle"
  />

  <MapFloatingPanel
    :visible="isActive"
    :position="props.position"
    :offset="{ x: 0, y: 10 }"
  >
    <div class="boundary-draw-panel">
      <p class="boundary-draw-hint">
        Click to add points. Click the first point (or the button) to finish.
      </p>
      <div class="boundary-draw-actions">
        <button type="button" class="bd-cancel" @click="cancel">Cancel</button>
        <button type="button" class="bd-finish" :disabled="points.length < 3" @click="finish">
          Search this area
        </button>
      </div>
    </div>
  </MapFloatingPanel>
</template>

<style>
.boundary-draw-panel {
  min-width: 220px;
}
.boundary-draw-hint {
  margin: 0 0 10px;
  font-size: 13px;
  color: #444;
}
.boundary-draw-actions {
  display: flex;
  gap: 8px;
}
.boundary-draw-actions button {
  flex: 1;
  padding: 8px 10px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.boundary-draw-actions .bd-cancel {
  background-color: #6c757d;
  color: #fff;
}
.boundary-draw-actions .bd-finish {
  background-color: #2176d2;
  color: #fff;
}
.boundary-draw-actions .bd-finish:disabled {
  background-color: #9dc3ec;
  cursor: not-allowed;
}
</style>
```

- [ ] **Step 2: Export from the package barrel**

In `packages/map-core/src/components/index.ts`, next to the other control exports add:

```ts
export { default as BoundaryDraw } from "./controls/BoundaryDraw.vue";
```
and add to the type re-export from `./controls/types` (extend the existing `export type { ... } from "./controls/types";` grouping, or add a new one):

```ts
export type {
  BoundaryDrawProps,
  BoundaryDrawEmits,
  SelectFeature,
} from "./controls/types";
```

- [ ] **Step 3: Create a Storybook story**

Create `packages/map-core/stories/BoundaryDraw.stories.ts`:

```ts
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Map from "../src/components/Map.vue";
import BoundaryDraw from "../src/components/controls/BoundaryDraw.vue";
import { toRefs } from "vue";

const meta: Meta<typeof BoundaryDraw> = {
  title: "Map Core/BoundaryDraw",
  component: BoundaryDraw,
  tags: ["autodocs", "status:beta"],
  argTypes: {
    position: {
      control: "select",
      options: ["top-left", "top-right", "bottom-left", "bottom-right"],
    },
  },
  parameters: { layout: "padded" },
  render: args => ({
    components: { Map, BoundaryDraw },
    setup() {
      const onSelect = (f: unknown) => console.log("select", f);
      const onClear = () => console.log("clear");
      return { ...toRefs(args), onSelect, onClear };
    },
    template: `
      <div style="position: relative; width: 600px; height: 400px;">
        <Map :center="[-75.1635, 39.9526]" :zoom="14">
          <BoundaryDraw :position="position" @select="onSelect" @clear="onClear" />
        </Map>
      </div>
    `,
  }),
};
export default meta;
type Story = StoryObj<typeof BoundaryDraw>;
export const Default: Story = { args: { position: "top-left" } };
```

- [ ] **Step 4: Type-check**

Run: `cd phila-ui-4 && pnpm --filter @phila/phila-ui-map-core type-check`
Expected: no errors.

- [ ] **Step 5: Verify in Storybook (Andy)**

Ask Andy to run `pnpm storybook` and open **Map Core/BoundaryDraw**. Confirm: clicking the pencil button enters draw mode; map clicks add vertices with a blue outline + dots; clicking the first vertex or "Search this area" logs a `select` Feature with a closed Polygon; "Cancel" exits. Confirm the browser console shows a Polygon whose ring's first and last coordinates match.

- [ ] **Step 6: Commit (phila-ui-4)**

```bash
cd phila-ui-4
git add packages/map-core/src/components/controls/BoundaryDraw.vue \
        packages/map-core/stories/BoundaryDraw.stories.ts \
        packages/map-core/src/components/index.ts
git commit -m "feat(map-core): add BoundaryDraw selection control"
```

---

## Task 5: `RadiusSelect` component

**Goal:** Icon button that toggles radius mode; first map click drops the center; a floating panel with a slider + number field sets the radius; a live circle preview updates; "Search this area" emits the circle as a Polygon Feature.

**Files:** (phila-ui-4)
- Create: `packages/map-core/src/components/controls/RadiusSelect.vue`
- Create: `packages/map-core/stories/RadiusSelect.stories.ts`
- Modify: `packages/map-core/src/components/index.ts`

**Interfaces:**
- Consumes: `useMapDrawMode` (Task 3), `circlePolygon` (Task 2), `RadiusSelectProps`/`RadiusSelectEmits` (Task 3), `MapButton`, `MapFloatingPanel`, `FillLayer`, `LineLayer`, `CircleLayer`.
- Produces: `<RadiusSelect @select @clear />` exported from map-core, consumed in Task 7.

- [ ] **Step 1: Create the component**

Create `packages/map-core/src/components/controls/RadiusSelect.vue`:

```vue
<script setup lang="ts">
import { ref, computed } from "vue";
import MapButton from "./MapButton.vue";
import MapFloatingPanel from "./MapFloatingPanel.vue";
import FillLayer from "../layers/FillLayer.vue";
import LineLayer from "../layers/LineLayer.vue";
import CircleLayer from "../layers/CircleLayer.vue";
import { useMapDrawMode } from "../../composables/useMapDrawMode";
import { circlePolygon } from "../../utils/circle";
import { IconLocationCrosshairs } from "@phila/phila-ui-core/icons";
import type { MapMouseEvent } from "maplibre-gl";
import type { RadiusSelectProps, RadiusSelectEmits } from "./types";

const props = withDefaults(defineProps<RadiusSelectProps>(), {
  position: "top-left",
  title: "Select radius",
  defaultRadius: 250,
  minRadius: 50,
  maxRadius: 1000,
  step: 10,
  segments: 64,
});
const emit = defineEmits<RadiusSelectEmits>();

const iconToUse = props.icon || IconLocationCrosshairs;

const center = ref<[number, number] | null>(null);
const radius = ref<number>(props.defaultRadius);

const { isActive, activate, deactivate } = useMapDrawMode(handleMapClick);

function handleMapClick(e: MapMouseEvent): void {
  // First click sets the center; further clicks are ignored (radius set via panel).
  if (center.value) return;
  center.value = [e.lngLat.lng, e.lngLat.lat];
}

function toggle(): void {
  if (isActive.value) {
    cancel();
    return;
  }
  center.value = null;
  radius.value = props.defaultRadius;
  activate();
}

const circle = computed(() =>
  center.value ? circlePolygon(center.value, radius.value, props.segments) : null,
);

const circleSource = computed(() => ({
  type: "geojson" as const,
  data: circle.value
    ? { type: "Feature" as const, properties: {}, geometry: circle.value }
    : { type: "FeatureCollection" as const, features: [] },
}));

const centerSource = computed(() => ({
  type: "geojson" as const,
  data: center.value
    ? {
        type: "Feature" as const,
        properties: {},
        geometry: { type: "Point" as const, coordinates: center.value },
      }
    : { type: "FeatureCollection" as const, features: [] },
}));

function search(): void {
  if (!circle.value) return;
  deactivate();
  emit("select", { type: "Feature", geometry: circle.value, properties: {} });
}

function cancel(): void {
  const hadCenter = center.value !== null;
  center.value = null;
  deactivate();
  if (hadCenter) emit("clear");
}
</script>

<template>
  <FillLayer
    v-if="center"
    id="radius-select-fill"
    :source="circleSource"
    :paint="{ 'fill-color': '#2176d2', 'fill-opacity': 0.15 }"
  />
  <LineLayer
    v-if="center"
    id="radius-select-line"
    :source="circleSource"
    :paint="{ 'line-color': '#2176d2', 'line-width': 2 }"
  />
  <CircleLayer
    v-if="center"
    id="radius-select-center"
    :source="centerSource"
    :paint="{
      'circle-radius': 5,
      'circle-color': '#2176d2',
      'circle-stroke-color': '#fff',
      'circle-stroke-width': 2,
    }"
  />

  <MapButton
    :icon="iconToUse"
    :position="props.position"
    :title="props.title"
    :icon-size="props.iconSize"
    :size="props.size"
    :teleport-to="props.teleportTo"
    :toggleable="true"
    :active="isActive"
    @click="toggle"
  />

  <MapFloatingPanel
    :visible="isActive"
    :position="props.position"
    :offset="{ x: 0, y: 10 }"
  >
    <div class="radius-select-panel">
      <p v-if="!center" class="radius-select-hint">Click the map to set a center point.</p>
      <template v-else>
        <label class="radius-select-label" for="radius-select-input">Radius (ft)</label>
        <div class="radius-select-controls">
          <input
            type="range"
            :min="props.minRadius"
            :max="props.maxRadius"
            :step="props.step"
            v-model.number="radius"
          />
          <input
            id="radius-select-input"
            type="number"
            :min="props.minRadius"
            :max="props.maxRadius"
            :step="props.step"
            v-model.number="radius"
          />
        </div>
        <div class="radius-select-actions">
          <button type="button" class="rs-cancel" @click="cancel">Cancel</button>
          <button type="button" class="rs-search" @click="search">Search this area</button>
        </div>
      </template>
    </div>
  </MapFloatingPanel>
</template>

<style>
.radius-select-panel {
  min-width: 240px;
}
.radius-select-hint {
  margin: 0;
  font-size: 13px;
  color: #444;
}
.radius-select-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}
.radius-select-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.radius-select-controls input[type="range"] {
  flex: 1;
}
.radius-select-controls input[type="number"] {
  width: 72px;
}
.radius-select-actions {
  display: flex;
  gap: 8px;
}
.radius-select-actions button {
  flex: 1;
  padding: 8px 10px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.radius-select-actions .rs-cancel {
  background-color: #6c757d;
  color: #fff;
}
.radius-select-actions .rs-search {
  background-color: #2176d2;
  color: #fff;
}
</style>
```

- [ ] **Step 2: Export from the package barrel**

In `packages/map-core/src/components/index.ts` add:

```ts
export { default as RadiusSelect } from "./controls/RadiusSelect.vue";
```
and add `RadiusSelectProps`, `RadiusSelectEmits` to the `export type { ... } from "./controls/types";` grouping introduced in Task 4.

- [ ] **Step 3: Create a Storybook story**

Create `packages/map-core/stories/RadiusSelect.stories.ts`:

```ts
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Map from "../src/components/Map.vue";
import RadiusSelect from "../src/components/controls/RadiusSelect.vue";
import { toRefs } from "vue";

const meta: Meta<typeof RadiusSelect> = {
  title: "Map Core/RadiusSelect",
  component: RadiusSelect,
  tags: ["autodocs", "status:beta"],
  argTypes: {
    position: {
      control: "select",
      options: ["top-left", "top-right", "bottom-left", "bottom-right"],
    },
  },
  parameters: { layout: "padded" },
  render: args => ({
    components: { Map, RadiusSelect },
    setup() {
      const onSelect = (f: unknown) => console.log("select", f);
      const onClear = () => console.log("clear");
      return { ...toRefs(args), onSelect, onClear };
    },
    template: `
      <div style="position: relative; width: 600px; height: 400px;">
        <Map :center="[-75.1635, 39.9526]" :zoom="14">
          <RadiusSelect :position="position" @select="onSelect" @clear="onClear" />
        </Map>
      </div>
    `,
  }),
};
export default meta;
type Story = StoryObj<typeof RadiusSelect>;
export const Default: Story = { args: { position: "top-left" } };
```

- [ ] **Step 4: Type-check**

Run: `cd phila-ui-4 && pnpm --filter @phila/phila-ui-map-core type-check`
Expected: no errors.

- [ ] **Step 5: Verify in Storybook (Andy)**

Ask Andy to open **Map Core/RadiusSelect**. Confirm: clicking the button enters mode + shows "Click the map to set a center point"; clicking the map drops a center dot and a circle; dragging the slider / editing the number resizes the circle live; "Search this area" logs a `select` Feature with a closed Polygon of ~65 coordinates; "Cancel" clears.

- [ ] **Step 6: Commit (phila-ui-4)**

```bash
cd phila-ui-4
git add packages/map-core/src/components/controls/RadiusSelect.vue \
        packages/map-core/stories/RadiusSelect.stories.ts \
        packages/map-core/src/components/index.ts
git commit -m "feat(map-core): add RadiusSelect selection control"
```

---

## Task 6: Changeset for the new components

**Goal:** Record the map-core feature for versioning (minor bump). No manual version edits.

**Files:** (phila-ui-4)
- Create: `.changeset/<three-random-words>.md`

- [ ] **Step 1: Create the changeset file**

Create `phila-ui-4/.changeset/plum-otter-anchor.md` (use any 3 random words for the filename):

```markdown
---
"@phila/phila-ui-map-core": minor
---

Add RadiusSelect and BoundaryDraw map controls for area-based selection. Both emit a
GeoJSON Feature (`@select`) and a `@clear` event; RadiusSelect renders the circle as a
Polygon for easy WKT conversion.
```

- [ ] **Step 2: Commit (phila-ui-4)**

```bash
cd phila-ui-4
git add .changeset/plum-otter-anchor.md
git commit -m "chore(map-core): changeset for radius/boundary controls"
```

---

## Task 7: App integration (property-data-explorer)

**Goal:** Replace the dead `<DrawTool @draw>` wiring with the two new controls, wired to `doShapeSearch` and a clear handler. Verify end-to-end area search.

**Files:** (property-data-explorer)
- Modify: `src/components/MapContainer.vue`

**Interfaces:**
- Consumes: `RadiusSelect`, `BoundaryDraw` from `@phila/phila-ui-map-core`; `search.doShapeSearch(geojson)` and `search.reset()` from `useSearchStore` (already imported in this file).

- [ ] **Step 1: Swap the imports**

In `src/components/MapContainer.vue`, in the `@phila/phila-ui-map-core` import block (around lines 59–72), remove `DrawTool,` and add `RadiusSelect,` and `BoundaryDraw,`. Also import the icons at the top of `<script setup>`:

```ts
import { faDrawPolygon, faBullseye } from '@fortawesome/free-solid-svg-icons'
```
(These override the map-core defaults so the app's buttons read clearly. If the app's `Icon`/FontAwesome setup doesn't render raw definitions, drop the `:icon` bindings in Step 2 and the map-core defaults — `IconPencil` / `IconLocationCrosshairs` — apply instead. Confirm in Step 4.)

- [ ] **Step 2: Swap the template controls**

In `src/components/MapContainer.vue`, replace line 17 (`<DrawTool position="top-left" @draw="handleShapeDraw" />`) with:

```html
<RadiusSelect position="top-left" :icon="faBullseye" @select="handleShapeSelect" @clear="handleShapeClear" />
<BoundaryDraw position="top-left" :icon="faDrawPolygon" @select="handleShapeSelect" @clear="handleShapeClear" />
```

- [ ] **Step 3: Replace the handler**

In `src/components/MapContainer.vue`, replace the existing `handleShapeDraw` function (around lines 240–242) with:

```ts
async function handleShapeSelect(feature: { geometry: unknown }) {
  await search.doShapeSearch(feature)
}

function handleShapeClear() {
  search.reset()
}
```
(`search.doShapeSearch` reads `feature.geometry`; the emitted Feature satisfies that. `search.reset()` is exported from the store and clears results + search state.)

- [ ] **Step 4: Verify end-to-end (Andy)**

With `pnpm dev:lib` (map-core) and `pnpm dev` (app) running, ask Andy to:
1. Click **Draw boundaries**, draw a polygon around a block, finish → the results table fills with the properties inside; the polygon stays drawn.
2. Click **Select radius**, click a center, set ~300 ft, "Search this area" → results update to properties within the circle.
3. Confirm the `shape` URL param appears and a refresh restores the selection.
4. Confirm normal address search and map-click parcel selection still work when neither tool is active (no click-blocking leak).

- [ ] **Step 5: Commit (property-data-explorer)**

```bash
cd property-data-explorer
git add src/components/MapContainer.vue
git commit -m "feat: replace draw wiring with RadiusSelect + BoundaryDraw area search"
```

---

## Self-Review notes

- **Spec coverage:** search-agnostic emit (Tasks 4/5), shared composable (Task 3), radius slider/number + circle-as-Polygon (Tasks 2/5), icon buttons via `MapButton` (Tasks 4/5), remove dead `@draw` wiring (Task 7), dev-link-first with core-skew fallback (Task 1), changeset (Task 6). Out-of-scope items (SearchModeSelector, npm publish, DrawTool, E2E) intentionally absent.
- **Type consistency:** `SelectFeature.geometry: PolygonGeometry` (Task 3) matches `circlePolygon`'s return (Task 2) and both components' emits (Tasks 4/5). `useMapDrawMode(onClick)` signature is consumed identically in Tasks 4/5.
- **Known soft spots flagged inline:** (a) the app FontAwesome-vs-core-Icon rendering is confirmed in Task 7 Step 4 with a documented fallback to map-core's default icons; (b) automated component tests are intentionally deferred to the later Playwright gap — only the pure `circlePolygon` helper is unit-tested, matching map-core's current test maturity.
