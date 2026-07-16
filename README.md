# Track & Field — Hyper Olympic (HTML5 clone)

A faithful 1:1 clone of Konami's **Track & Field** (Japan: *Hyper Olympic*),
the 1983 arcade game ported to the NES in 1987. Built as vanilla HTML5
Canvas + JS — no dependencies, no build step, no external assets.

## Play

```bash
python3 -m http.server 8004
# then open http://localhost:8004
```

Or just open `index.html` directly in a browser.

## File Structure

```
index.html          Entry point — menu + canvas shell
js/engine.js        Core: constants, input, audio, game loop, state
js/events.js        Event definitions + update/finish logic
js/render.js        All drawing / rendering functions
js/menu.js          Event selection screen
```

Scripts load in order via `<script>` tags (no modules, no build step).

## Menu

The title screen lets you pick:
- **ALL EVENTS** — progression mode (100m → 110m Hurdles → Long Jump → Javelin → Shot Put → High Jump)
- **100M DASH** — play individually
- **110M HURDLES** — play individually
- **LONG JUMP** — play individually
- **JAVELIN THROW** — play individually
- **SHOT PUT** — play individually
- **HIGH JUMP** — play individually

Navigate with **↑ / ↓** or press **1-7** directly. **Enter** to confirm.

## Controls

| Action | Keys |
|---|---|
| Run (alternate!) | **← →**  or  **Z X** |
| Jump hurdle / takeoff | **↑**  or  **Space** |
| Start / Continue | **Enter** |
| Mute audio | **M** |

The run mechanic enforces alternation: pressing the same button twice in a
row does nothing. Tap fast *and* alternately to reach top speed.

## Events (current)

The NES Track & Field progresses through a fixed order of events:

1. **100m Dash** — the foundational running event. Pass 11.50s to qualify.
2. **110m Hurdles** — 10 hurdles evenly spaced over 110m. Pass 15.20s to
   qualify. Each clean hurdle awards **1,000** pts immediately; a clean race
   adds the qualifying bonus + **1,000** pts per second under the qualifying
   time.
3. **Long Jump** — 40m runway + sand pit. Press **↑ / Space** at the board
   to take off, then alternate **← → / Z X** during the flight to pump and
   extend. 3 attempts, best distance counts. Pass 7.50m to qualify.
4. **Javelin Throw** — run up and press **↑ / Space** at the board to enter
   aim mode. The throw angle sweeps back and forth; press **↑ / Space** again
   to release. 3 attempts, best distance counts. Pass 65.00m to qualify.
5. **Shot Put** — run up and press **↑ / Space** at the board to enter aim
   mode. The throw angle sweeps back and forth; press **↑ / Space** again to
   put the shot. 3 attempts, best distance counts. Pass 15.50m to qualify.
6. **High Jump** — run up and press **↑ / Space** at the board to jump over
   the bar. The bar starts at 1.60m and rises 0.20m after each successful
   clearance. 3 attempts total; if you fail an attempt, the bar does not
   move. Best cleared height counts. Pass 2.00m to qualify.

Future events planned: triple jump, archery, skeet shooting — all reusing the
run physics core.

## Faithful constants (NES / arcade)

### Event 1 — 100m Dash
- Distance: **100 m**
- World record: **9.95 s**
- Qualifying time: **11.50 s**

### Event 2 — 110m Hurdles
- Distance: **110 m**, **10 hurdles** evenly spaced (first at 11m, last at 100m)
- World record: **13.20 s** (Nehemiah era)
- Qualifying time: **15.20 s**
- +**1,000 pts** per clean hurdle; stumble penalty (speed ×0.35, 450ms stun) on a hit

### Event 3 — Long Jump
- Runway: **40 m** to the takeoff board, **14 m** sand pit
- World record: **8.90 m**
- Qualifying distance: **7.50 m**
- **3 attempts**, best distance counts
- Jump at board with **↑ / Space**, pump with alternating **← → / Z X** during flight
- Cross the board without jumping = foul (0m for that attempt)
- Score: **5,000** pts qualifying bonus + **1,000** pts per meter over qualify

### Event 4 — Javelin Throw
- Runway: **30 m** to the throwing board
- World record: **89.58 m**
- Qualifying distance: **65.00 m**
- **3 attempts**, best distance counts
- Cross the board without throwing = foul (0m for that attempt)
- Score: **5,000** pts qualifying bonus + **1,000** pts per meter over qualify

### Event 5 — Shot Put
- Runway: **5 m** to the throwing board
- World record: **23.37 m**
- Qualifying distance: **15.50 m**
- **3 attempts**, best distance counts
- Cross the board without putting = foul (0m for that attempt)
- Score: **5,000** pts qualifying bonus + **1,000** pts per meter over qualify

### Event 6 — High Jump
- Runway: **30 m** to the bar
- Starting bar height: **1.60 m**, rises **0.20 m** after each clearance
- World record: **2.15 m**
- Qualifying height: **2.00 m**
- **3 attempts** total; a failed attempt does not raise the bar
- Score: **5,000** pts qualifying bonus + **1,000** pts per meter over qualify

### Global rules
- Lives: **3**, +1 extra every **100,000** points
- Qualifying bonus: **5,000** pts + **1,000** pts/sec under the qualifying time
- New world record bonus: **10,000** pts

## Tech

- Vanilla JS + Canvas 2D
- Fixed-timestep 60 Hz update loop with frame-skip accumulator
- Web Audio API for procedural SFX and BGM (no samples)
- Pixel-art stadium, crowd, athlete, scoreboard drawn with primitives

## Credits / IP

Track & Field / Hyper Olympic © Konami. This is a non-commercial,
educational fan clone. Audio is original and does not reproduce the
copyrighted *Chariots of Fire* melody used by the original.
