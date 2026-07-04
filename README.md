# Track & Field — Hyper Olympic (HTML5 clone)

A faithful 1:1 clone of Konami's **Track & Field** (Japan: *Hyper Olympic*),
the 1983 arcade game ported to the NES in 1987. Built as a single HTML5
Canvas file — no dependencies, no build step, no external assets.

## Play

```bash
python3 -m http.server 8004
# then open http://localhost:8004
```

Or just open `index.html` directly in a browser.

## Controls

| Action | Keys |
|---|---|
| Run (alternate!) | **← →**  or  **Z X** |
| Jump hurdle | **↑**  or  **Space** |
| Start / Continue | **Enter** |
| Mute audio | **M** |

The run mechanic enforces alternation: pressing the same button twice in a
row does nothing. Tap fast *and* alternately to reach top speed. For the
hurdles event, time a jump with **↑** / **Space** just before each hurdle —
hit one and you'll stumble and bleed speed.

## Events (current)

The NES Track & Field progresses through a fixed order of events. The first
two are implemented on top of the same run engine:

1. **100m Dash** — the foundational running event. Pass 11.50s to qualify.
2. **110m Hurdles** — 10 hurdles evenly spaced over 110m. Pass 15.20s to
   qualify. Each clean hurdle awards **1,000** pts immediately; a clean race
   adds the qualifying bonus + **1,000** pts per second under the qualifying
   time.

Future events planned: long jump, javelin, high jump, triple jump, archery,
skeet shooting — all reusing the run physics core.

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
