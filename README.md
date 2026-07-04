# Track & Field — 100m Dash

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
| Start / Continue | **Enter** |
| Mute audio | **M** |

The run mechanic enforces alternation: pressing the same button twice in a
row does nothing. Tap fast *and* alternately to reach top speed.

## Events (current)

v1 ships just the 100m dash — the foundational running event. Other NES
events (110m hurdles, long jump, javelin, high jump, triple jump, archery,
skeet shooting) are planned additions on top of the same run engine.

## Faithful constants (NES / arcade)

- Distance: **100 m**
- World record: **9.95 s**
- Qualifying time: **11.50 s**
- Lives: **3**, +1 extra every **100,000** points
- Qualifying bonus: **5,000** pts + **1,100** pts/sec under 11.50
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
