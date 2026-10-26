# Publishing on iDos Games (idosgames.com)

iDos Games hosts the game itself: one **Title** per game, its build served from the platform's hosts and framed on the
Title's idosgames.com page. A framed game may reach only the platform's hosts, so it can't load another portal's SDK.

## Build

```bash
gp build <game> --target idos        # in a game repository: scripts/gp.sh build --target idos
```

The same game as the CrazyGames upload (one self-contained `index.html`, relative paths), with **no portal SDK**: the
game's portal is none, so it plays as a plain web build — no ads (rewarded offers unavailable, the host's
`NoAdProvider`), saves in the browser's localStorage, the language from the browser. Written to
`games/<id>/upload-idos/`: `index.html` and `<id>-idos.zip` (index.html at the zip's root) — the file to upload. Only
portal games (`channel: crazygames`).

The iDos SDK (`@idosgames/*`: sign-in, store, rewarded ads through its store) is not built in: a game needs it only to
use the platform's own services, and none of our games do yet.

## Upload (the iDos Games MCP server)

The owner creates the Title in the iDos cabinet and grants the connector `build:write` (Connected apps); there is no
tool that creates a Title. Then:

1. `list_my_titles` → the game's TitleID (the live one, not `-DEV`).
2. `begin_build_upload { title_id }` → `build_id`, a one-hour `upload_url`.
3. `curl -T games/<id>/upload-idos/<id>-idos.zip "<upload_url>"` (a plain PUT, no headers).
4. `finish_build_upload { title_id, build_id, label: "<version>" }` → a TestUrl: open it and check the game starts.
5. The same call with `deploy: true` puts that version live on the Title's address and its idosgames.com page.

Record the game, its repository and commit, the TitleID and build_id in `publisher/idosgames.yaml`.
