# Melody Scanner automated QA

Commit: 556a94d38089a445c6c34a274039d3d7e4361d46
Node: v22.23.3

| Check | Exit code |
| --- | ---: |
| Sprite artwork | 0 |
| Game syntax | 0 |
| Gameplay / mobile test | 1 |

### Gameplay output
~~~
AssertionError [ERR_ASSERTION]: high DPI backing store avoids upscaled blurry canvas
    at /home/runner/work/g/g/tests/smoke.cjs:58:8 {
  generatedMessage: false,
  code: 'ERR_ASSERTION',
  actual: false,
  expected: true,
  operator: '==',
  diff: 'simple'
}
~~~
