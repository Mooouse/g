# Melody Scanner automated QA

Commit: 7e96c6eb2ea74271ae27ea4ea3d40849ff53f83f
Node: v22.23.3

| Check | Exit code |
| --- | ---: |
| Sprite artwork | 0 |
| Game syntax | 0 |
| Gameplay / mobile test | 1 |

### Gameplay output
~~~
TypeError: sound.rhythm is not a function
    at mainStep (game.js:395:8)
    at Object.loop [as animation] (game.js:410:12)
    at /home/runner/work/g/g/tests/smoke.cjs:34:8
~~~
