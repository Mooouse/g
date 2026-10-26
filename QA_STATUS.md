# Melody Scanner automated QA

Commit: 21924c898646c95add2e79a13a25adc4f9a99677
Node: v22.23.3

| Check | Exit code |
| --- | ---: |
| Sprite artwork | 0 |
| Game syntax | 0 |
| Gameplay / mobile test | 1 |

### Gameplay output
~~~
AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

7 !== 16

    at /home/runner/work/g/g/tests/smoke.cjs:27:57
    at Object.<anonymous> (/home/runner/work/g/g/tests/smoke.cjs:45:3)
    at Module._compile (node:internal/modules/cjs/loader:1781:14)
    at Object..js (node:internal/modules/cjs/loader:1913:10)
    at Module.load (node:internal/modules/cjs/loader:1505:32)
    at Function._load (node:internal/modules/cjs/loader:1309:12)
    at wrapModuleLoad (node:internal/modules/cjs/loader:254:19)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:171:5)
    at node:internal/main/run_main_module:36:49 {
  generatedMessage: true,
  code: 'ERR_ASSERTION',
  actual: 7,
  expected: 16,
  operator: 'strictEqual',
  diff: 'simple'
}
~~~
