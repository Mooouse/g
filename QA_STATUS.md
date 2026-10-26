# Melody Scanner automated QA

Commit: bb719c0878ad27bd919bb4967d5cafb474877e81
Node: v22.23.3

| Check | Exit code |
| --- | ---: |
| Sprite artwork | 0 |
| Game syntax | 0 |
| Gameplay / mobile test | 1 |

### Gameplay output
~~~
AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

12 !== 9

    at /home/runner/work/g/g/tests/smoke.cjs:32:72 {
  generatedMessage: true,
  code: 'ERR_ASSERTION',
  actual: 12,
  expected: 9,
  operator: 'strictEqual',
  diff: 'simple'
}
~~~
