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
