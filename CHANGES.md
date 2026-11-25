# LUME v0.28 (based on v0.27b)

## Audio performance (glitching on Galaxy Tab S6 / S6 Lite)
- **Master reverb no longer runs when it's off.** The 3.2 s convolution reverb on the master bus was fed
  constantly, even at 0 (the default). It was about 40% of Lume's idle audio work. It is now connected only
  while turned up (and not in FX OFF); after being turned down it finishes its tail and is unhooked.
  Measured: idle audio graph renders ~1.9x faster, busy playing ~1.5x faster.
- **Ringing note tails are now capped.** The 32-voice limit only counted held notes; released notes that
  were still ringing out had no limit. With a long release (e.g. 6 s envelope + unison) and quick chord
  changes, v0.27b reached ~970 oscillators at once; v0.28 holds it to ~130. When ringing tails pass
  120 oscillators (240 with ?full), the oldest released tails fade out in 30 ms. Held notes are never cut.

## UI
- Tapping the deck tabs (RIB L / MELODY / DRONE / ...) quickly no longer leaves several control rows
  stacked on top of each other.

## Offline / PWA
- Service worker: a failed page load (error response) is no longer cached over the good copy.
- Cache version bumped to lume-v28.

## Audio stall recovery
- v0.27b removed the watchdog's "wake the audio" nudge, so a stall that v0.25b recovered from in about half a
  second stayed silent until the restart banner. v0.28 nudges once, only after the audio clock has been frozen
  for ~1.5 s (so it can't interrupt sound that is still playing).

# LUME v0.29

## Pops between notes
- Every chord and melody note gets its own resonant filter, and that filter comes alive on the audio thread a
  few milliseconds after the note's oscillators have started. Its first sample jumped into the middle of a
  waveform, which made a small pop at each note start. The filter now fades its input in over the first ~6 ms.
  In recordings of fast legato and staccato playing, every pop is gone.
- Note releases and the chord duck on right-ribbon strikes now hold the level exactly where it is
  (`cancelAndHoldAtTime`). Before, they re-read a slightly stale value, which could cause a small jump.

## Ribbon load under hard strumming
- Ringing ribbon strings are capped (20 at once, or 32 with ?full). Past that, the oldest fades out in 30 ms.
  In a 16-stroke hard-strum test, peak sounding oscillators dropped from 120 to 50.
- Vibrato and movement/bend buses are only wired into notes while they carry signal. An oscillator with
  anything connected to its detune costs Chrome about 2.5-3x as much, even when the bus is silent.

# LUME v0.30 (sound-engine audit)

Measured offline (render speed vs realtime, best of 4, higher is better), v0.27b -> v0.30:
idle 9.4x -> 21.5x, chord + 6 notes held 5.1x -> 8.8x, 40-string strum 6.1x -> 8.8x.

## Leaks
- Every note left its per-partial gain nodes wired together after it ended (~576 dead links per
  play-through, growing all session). Lume's connection count now stays flat: it was 857 -> 1455 over two
  full feature cycles in v0.29, and is now 256 -> 256.
- The recorder's tap on the master stayed wired (and processing) after recording stopped. It's now unhooked.

## Always-on work removed
- Movement LFOs (one per instrument) were wired into their targets even at depth 0, the default. An LFO
  wired into a filter's frequency makes that filter recompute every sample. They're now only wired in
  while depth is up.

## Engine efficiency
- Lume filter: a rational tanh in place of Math.tanh (within ~2%), and the coefficient during cutoff sweeps
  refreshed every 8 samples instead of every sample.
- FM (DX7) engine: when the poly limit is hit, the stolen voice fades out over 8 ms instead of being cut
  mid-waveform.

## Starts dry (v0.30, your call)
- Defaults are now echo 0, reverb 0, shimmer off and tape hiss 0 on every instrument; effects are opt-in.
  A one-time migration turns off saved settings that are still exactly the old defaults (echo 35% /
  reverb 42%, shimmer on, hiss 50%). Anything you set yourself is kept.
- The shimmer reverb and tape echo now sleep when nothing can feed them (no instrument send up, sparkle off,
  no drums in the last 8 s, not frozen) and their tail has died away. Turning a send up, a drum hit, sparkle
  or FREEZE wakes them before any sound reaches them.
- Measured (offline, best of 3) vs v0.27b: idle 10.2x -> 34.2x, chord + 6 notes 5.5x -> 13.4x realtime.

# LUME v0.31-matrix (experimental, based on v0.30)

## Drum matrix replaces the step sequencer
- The strip under the tab bar is now a 4-track x 16-step drum grid, two bars long (32 steps).
  Each row has its own sound (KICK, SNARE, C-HAT, O-HAT by default), so there are no lanes to switch.
- Steps have three levels: off, ghost (soft) and accent (loud).
- Touch: tap = accent on/off, press and hold = ghost, drag = paint along the row you started on
  (starting on a lit pad erases). Right-click / Shift-click also make ghosts on a computer.
- Row names: tap to hear, press and hold to swap the sound (kick, 808, snare, clap, rim, closed hat,
  open hat, tom, bell). A closed hat chokes a ringing open hat.
- Left strip: REC / PLAY / CLR, PRESET (beat library with AUTO BPM), SWING (0-75%), BAR 1 / BAR 2,
  FOLLOW (view tracks the playing bar) and CPY (bar 1 -> bar 2).
- CLR reads UNDO for four seconds after wiping.
- REC + PLAY: tapping a row name records a hit on the nearest 16th (QUANT off / micro-timing comes later).
- Preset library: 10 new two-bar grooves plus the 14 older beats as "Classics".
- Swing now shows MPC-style numbers: 58% pushes each off-16th about 0.29 of a step late.

## Removed on this branch
- Chord step-sequencing (the CH lane, chord progressions library and chord REC/overdub).

## Fixes
- Moving the tempo or swing slider while playing no longer pushes the next step a whole step later
  on every slider tick.

## Saving
- The bank saves under a new key (lume-dm-bank). On first run it imports a v0.30 bank, turning each
  16-step beat into two identical bars. The v0.30 bank itself is left untouched.
