# AGENTS.md

Vanilla HTML5 Canvas + JS clone of Konami's Track & Field (Hyper Olympic).
No dependencies, no build step, no bundler, no package manager, no tests.

## Agent workflow

Before executing any task prompt, **run a quick debug first**:
inspect the current state of the relevant files, verify the issue or goal,
and confirm the change will not break existing behaviour. Only then make edits.

## Running

```bash
python3 -m http.server 8004   # http://localhost:8004
```

Opening `index.html` directly works too, but Web Audio may need a user
gesture — prefer the http.server path.

## Architecture

Scripts load as plain `<script>` tags in `index.html` in load order:
`engine.js` → `events.js` → `render.js` → `menu.js`. **Order matters** —
later files reference globals from earlier ones. There are no ES modules;
all sharing is via top-level `const`/`function` declarations in `engine.js`.

- `js/engine.js` — core: constants, input, Web Audio, scene state, fixed-timestep 60 Hz loop (`loop`/`update`/`render`). Owns `run`, `scene`, `score`, `lives`, `EVENTS`, scene enum.
- `js/events.js` — registers events via `registerEvent(...)` (run, hurdles, longjump, javelin stub) and holds all per-event update/finish logic. The `run` object (built by `startRace`) is the race state; per-event substate lives on `run.lj` / `run.jav`.
- `js/render.js` — all drawing, no state mutation. Reads globals from engine/events.
- `js/menu.js` — menu navigation and event-card screen.

## Conventions

- `"use strict";` at top of every JS file.
- Fixed-timestep loop: `update(1/60)` with a max-5-steps frame-skip accumulator. Game logic must be deterministic in dt — never use wall-clock deltas in update code; always use the `dt` passed in.
- Input is edge-triggered via `pressedThisFrame`, which is cleared at the end of each fixed step (not each rAF). Use `consumeRunPress`/`consumeJumpPress`/`enterPressed` helpers — do not read `keys` directly for discrete actions presses.
- Run mechanic requires **alternating** left/right; `lastRunKey` enforces this. Don't "fix" same-key presses to fire.
- Canvas is 256×240 (NES resolution) and CSS-scaled with `image-rendering:pixelated`. Draw in 256×240 space; never use DPR scaling.
- Magical gameplay constants (qualify times, world records, scoring, pump distance, etc.) are `const` in `engine.js`. Tune there, not inline.
- `Audio.ensure()` must be called from a user gesture before playback will work.

## Adding an event

1. Define it in `js/events.js` with `registerEvent({ name, type, ... })` (see existing entries).
2. Add per-event state initialization in `startRace()` (`engine.js`) — follow the `run.lj` / `run.jav` pattern rather than top-level fields.
3. Implement the update function in `events.js` and dispatch it from `updateRace()`.
4. Add rendering in `render.js`.
5. Update `menu.js` to surface it in the menu and progression order.
6. Update `README.md`'s event list and constants table.

## Getting it wrong

- Don't add a bundler, npm, TypeScript, or tests without asking — this is intentionally zero-tooling.
- Don't split files into modules; the load-order `<script>` setup is deliberate.
- Don't move constants out of `engine.js` or duplicate them inline.
