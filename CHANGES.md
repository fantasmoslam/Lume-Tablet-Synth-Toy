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
