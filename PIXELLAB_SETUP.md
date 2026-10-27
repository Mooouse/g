# PixelLab art production — safe setup

**State:** prepared; not launched. The PixelLab API key is NOT stored in GitHub code or commit history. This repository cannot generate any images until an owner configures the GitHub Actions secret `PIXELLAB_API_KEY`. Do not paste it into public files, pull requests, issue comments, workflow arguments, or logs.

## One-time owner setup

1. Open **Settings → Secrets and variables → Actions**: https://github.com/Mooouse/g/settings/secrets/actions
2. Click **New repository secret**.
3. Set **Name** to `PIXELLAB_API_KEY`, and paste the existing PixelLab API token as the **Secret**.
4. Open https://github.com/Mooouse/g/actions/workflows/pixellab-v2.yml and choose **Run workflow** with **mode = pilot**. The pilot uses at most **one** generation and checkpoints the image privately with respect to the API secret (the art itself is stored on the GitHub branch). This does **not** publish the art to the live game.
5. Review `https://github.com/Mooouse/g/blob/generated/pixellab-v1/assets/pixellab/keyboard_1.png`. If the style is good, select **mode = full** for the next manual run. It fills the remaining assets, but does NOT change the published game.
6. After checking the artwork, create a PR from `generated/pixellab-v1` to `main`, or ask ChatGPT to make and merge the PR with its GitHub connection. It includes the new `art.js`, `game.js` cache key, `index.html`, and all the independent PixelLab PNGs. Don't deploy until approval.

## Budget, deduplication and consistency

- **40** maximum total generation attempts for this project.
- **36** planned: **24 instruments** (4 families, six levels each) and **12 environment/UI sprites**. The other four are reserved for manual corrections, not automatically consumed.
- **Pilot** is one of the planned 36; it is not an extra charge.
- The generator stores a request checkpoint **before each** paid API request and the generated PNG **after** it; it will skip successfully saved images. Failed or uncertain requests stop, rather than automatically retry and potentially spend another credit.
- It generates **one sprite per request**, in a single palette/style brief rather than generating an enormous unreviewed image collage.
- A custom transparent native-resolution pixel PNG is saved as `assets/pixellab/<name>.png` for each item.
- Existing approved artwork remains untouched at `assets/approved`. Existing playable imagery remains at `assets/pixel` until manual approval of the PixelLab batch.
- The complete production brief is `tools/pixellab_plan.py`. No API token appears in any of these files.

### Levels

| Family | Levels | Progression examples |
| --- | --- | --- |
| Keyboards | 1–6 | mini keyboard → analog synth → polysynth → stage keyboard → dual-tier stage rig → concert mega-synth |
| Ukulele | 1–6 | soprano → concert → tenor → electric/acoustic → resonator → futuristic custom |
| Drums | 1–6 | three-piece beginner → rock kit → extended → fusion → double-kick arena → symphonic mega-rig |
| Electric guitar | 1–6 | single-cut → SG double-cut → Strat-type → offset Jazzmaster-type → Flying V → sci-fi custom |

Native sprite sizes are attached to each level in `tools/pixellab_plan.py` (one grid tile is 64×64 native pixels). Each next level has a distinctly different construction instead of a simple recolor.

### Technical steps and security

`tools/generate_pixellab.py` calls the documented PixelLab API endpoint `POST https://api.pixellab.ai/v2/create-image-pixen` with the Bearer token from the environment variable. The image response is validated and saved. For the full batch, `tools/activate_pixellab.py` prepares a **staging branch** with 24-family-tier merge chains and UI assets. Tests must pass before anything is promoted to the live site. The script itself has no permission to use credits outside a launched GitHub Action.

**Do not claim that images have been generated or that PixelLab limits have been spent until the GitHub run confirms it.**
