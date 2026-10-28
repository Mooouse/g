# Melody Scanner — audio asset credits

All instrument audio is bundled under `assets/audio/` so the game plays without an external sample CDN. Music performance code is in `sample-audio.js`.

## Recorded piano — CC0 1.0

- **Meta Open Sound — Meta Piano**. Four independently recorded piano keys from the project's `meta-piano/ogg` set, medium velocity layer.
- Source: https://github.com/facebookincubator/Meta-open-sound/tree/main/systems/instruments/meta-piano
- License: https://creativecommons.org/publicdomain/zero/1.0/
- Local files: `piano-C4.ogg`, `piano-E4.ogg`, `piano-G4.ogg`, `piano-C5.ogg`.

## Recorded ukulele — CC0 1.0

- **FreePats — Ukulele**, recorded by Mateusz Dąbrowski (2026).
- Source: https://github.com/freepats/ukulele1
- License: https://creativecommons.org/publicdomain/zero/1.0/
- Local files: `uke-C4.flac`, `uke-E4.flac`, `uke-G4.flac`, `uke-A4.flac`.

## Recorded electric guitar — CC0 1.0

- **FreePats — FSBS Electric Guitar Clean**, bridge pickups, recorded from an electric guitar via amplifier/effects.
- Source: https://github.com/freepats/electric-guitar-FSBS-clean
- License: https://creativecommons.org/publicdomain/zero/1.0/
- Local files: `guitar-E3.flac`, `guitar-E4.flac`, `guitar-G4.flac`, `guitar-C5.flac`.
- Higher instrument levels add in-engine amplifier drive, filtering and guitar chords. These are not separate guitar recordings.

## Recorded acoustic drums — CC BY 4.0

**Drum samples provided by DrumGizmo.org.**

- The acoustic MuldjordKit was recorded by **Lars Muldjord**; adapted into the FreePats SFZ bank by FreePats contributors.
- Original project: https://www.drumgizmo.org/
- Sample repository: https://github.com/freepats/muldjordkit
- License: https://creativecommons.org/licenses/by/4.0/
- Local files: `drum-kick.flac`, `drum-snare.flac`, `drum-hat.flac`, `drum-openhat.flac`, `drum-tom.flac`, `drum-crash.flac`.
- Edits: the original recordings are not modified. The game controls playback envelope, volume, gain and occasional pitch, and layers the kit hits into different grooves by instrument level.

**License compliance:** the recorded drum kit retains attribution in this file and in the in-game settings footer. The recorded CC0 instruments may be played, modified and redistributed without attribution, but sources are given for transparency.

Fallback audio for browsers that cannot decode a sample is generated procedurally at runtime. Neither third-party API keys nor external sound libraries are required.
