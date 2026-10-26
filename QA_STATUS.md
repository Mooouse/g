# Melody Scanner automated QA

Commit: e45495da5f56ee2a7ef8fe425104bc17595ccbc7
Node: v22.23.3

| Check | Exit code |
| --- | ---: |
| Sprite artwork | 0 |
| Game syntax | 0 |
| Gameplay / mobile test | 1 |

### Gameplay output
~~~
AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

15 !== 12

    at /home/runner/work/g/g/tests/smoke.cjs:32:72 {
  generatedMessage: true,
  code: 'ERR_ASSERTION',
  actual: 15,
  expected: 12,
  operator: 'strictEqual',
  diff: 'simple'
}
~~~
