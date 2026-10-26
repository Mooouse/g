# Melody Scanner automated QA

Commit: 9589b44f66a25b3d0f10fe5560db9c8e3e17e599
Node: v22.23.3

| Check | Exit code |
| --- | ---: |
| Sprite artwork | 0 |
| Game syntax | 0 |
| Gameplay / mobile test | 1 |

### Gameplay output
~~~
TypeError: sound.hit is not a function
    at damageBlock (game.js:91:30)
    at emitInstrument (game.js:115:2)
    at Object.scan (game.js:370:316)
    at /home/runner/work/g/g/tests/smoke.cjs:35:16
~~~
