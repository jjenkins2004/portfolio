import type { ProjectPageData } from '../../components/ProjectPage/ProjectPage';

// Draft wording — Joshua rewrites in his voice.
export const stepper: ProjectPageData = {
  slug: 'stepper',
  name: 'stepper',
  dates: 'Jul - Aug 2026',
  line: 'Checkpointed, step-based execution for long-running Python pipelines. The execution framework behind a lot of my other projects.',
  concepts: 'graph execution · checkpoint & resume · import-time validation',
  stack: 'Python · asyncio · Pydantic',
  github: 'github.com/jjenkins2004/stepper',
  problem: {
    body: "Long-running flows need checkpointing between steps: run a step, look at exactly what it produced, fix it, rerun from there without touching the steps that already worked. I couldn't find a library that actually does this. pydantic-graph gives you a typed graph but no retries or resume. Prefect is the closest thing, but it's a whole platform with a server and a UI, built for running production pipelines on a schedule, not for running one flow on your laptop and looking at one step's output. stepper is ~2,500 lines with one dependency. When you define the graph, it checks the whole thing as soon as Python imports the file: if a step asks for data that no other step produces, a type doesn't match, or a branch can never reach the end, you get an error before anything runs. Every step writes its output to disk, and if the run crashes, even in the middle of a loop, it picks back up where it stopped.",
  },
  features: [
    {
      title: 'steps and edges',
      media: [
        {
          kind: 'pre',
          lang: 'python',
          pre: `class CheckoutFlow(Flow[str]):
    @step
    async def build(self) -> Order:
        return Order(total=100)

    @step
    async def summary(self, o=depends(build)) -> str:   # o is build's output,
        return f"order total: {o.total}"                # loaded from the run

    edges = (edge(START).to(build),
             edge(build).to(summary),
             edge(summary).to(EXIT))

asyncio.run(CheckoutFlow().run(run_id="run-1"))`,
        },
      ],
      body: 'Steps are plain async functions. `depends` wires their data, `edges` declares the order from `START` to `EXIT`, and `run` walks the graph one node at a time. The return type says what gets saved: `build` returns an `Order`, so an `Order` is what gets written to disk and what `summary` gets handed.',
    },
    {
      title: 'the run lives on disk',
      media: [
        {
          kind: 'pre',
          pre: `output/run-1/checkout/build.json        Order(total=100)
output/run-1/checkout/summary.txt       "order total: 100"
output/run-1/checkout/_loop_cursor.json where the run got to`,
        },
      ],
      body: 'Each step saves its output under its own path, so the run folder is one file per step. If I want to see what a step produced, I open the file.',
    },
    {
      title: 'crash, then resume',
      media: [
        {
          kind: 'pre',
          lang: 'python',
          pre: `# same run_id: finished steps replay from disk,
# the run picks up where it died
asyncio.run(CheckoutFlow().run(run_id="run-1"))

# or rerun a single step against what's already there
asyncio.run(CheckoutFlow().run("build", run_id="run-1"))`,
        },
      ],
      body: 'Finished steps just load their saved output instead of running again, and the run continues from where it broke. A path argument runs one step or one subtree by itself, which is how you poke at a single step until it is solid.',
    },
    {
      title: 'branch and loop',
      media: [
        {
          kind: 'pre',
          lang: 'python',
          pre: `class ChallengeFlow(Flow[Analysis]):
    @step
    async def edit(self, prev: Analysis | None = optional_depends("analysis")) -> Draft: ...

    @step
    async def audit(self, draft=depends(edit)) -> AuditResult: ...

    @step
    async def analysis(self, draft=depends(edit)) -> Analysis: ...

    edges = (
        edge(START).to(edit),
        edge(edit).to(audit),
        edge(audit).when(lambda r: r.passed).to(EXIT).otherwise(analysis),
        edge(analysis)
            .when(lambda r: r.rounds >= 8).to(EXIT)
            .otherwise(edit),
    )`,
        },
      ],
      body: "The `.when()` conditions look at a step's typed output to pick the branch, `.otherwise` is required so a condition can never leave the run stuck with nowhere to go, and a loop is just an edge pointing back up. The framework doesn't count loop rounds itself: `r.rounds` is just a field one of the steps wrote, saved to disk like every other output.",
    },
    {
      title: 'fan out, fan back in',
      media: [
        {
          kind: 'pre',
          lang: 'python',
          pre: `edges = (
    edge(START).to(brief),
    edge(brief).to(images, copy, pricing),         # fans out
    edge(images, copy, pricing).to(assemble),      # and back together
    edge(assemble).to(EXIT),
)`,
        },
      ],
      body: "Several targets on one edge run at the same time; if one fails, the others get cancelled. You don't say where the parallel arms meet back up. stepper figures that out itself, and only that meeting step is allowed to read all of their outputs. How it finds that step is the first difficulty below.",
    },
    {
      title: 'nest flows inside flows',
      media: [
        {
          kind: 'pre',
          lang: 'python',
          pre: `class TaxFlow(Flow[Order]):
    order = require(Order)                    # what this flow needs

    @step
    async def with_tax(self, o=depends(order)) -> Order:  # o = the Order bind hands in
        return Order(total=int(o.total * 1.2))

    edges = (edge(START).to(with_tax), edge(with_tax).to(EXIT))

class CheckoutFlow(Flow[str]):
    @step
    async def build(self) -> Order:
        return Order(total=100)

    taxed = TaxFlow.bind(order=build)         # nest TaxFlow, feed it build's output

    @step
    async def summary(self, o=depends(taxed)) -> str:  # o = the nested flow's output
        return f"order total: {o.total}"

    edges = (edge(START).to(build), edge(build).to(taxed),
             edge(taxed).to(summary), edge(summary).to(EXIT))`,
        },
      ],
      body: 'You can drop a whole flow inside another one and it behaves like a single step: `require` says what it needs, `bind` supplies it. Nest the same flow twice with different bindings and each gets its own folder on disk (`taxed/with_tax.json`). Same rules at every level.',
    },
    {
      title: 'hooks instead of built-in tracing',
      media: [
        {
          kind: 'pre',
          lang: 'python',
          pre: `class LogfireHooks:
    @contextmanager
    def step(self, *, path, input_type, output_type):
        report = StepReport()
        with logfire.span("step {path}", path=path) as span:
            yield report        # framework fills this after the step runs
            if report.has_output:
                span.set_attribute("output", report.output)

await MyFlow().run(hooks=[LogfireHooks(), MetricsHooks()])`,
        },
      ],
      body: "A hook wraps each step: some code runs right before the step and some right after (it's a Python context manager). Pass a list and every hook wraps every step. Whatever a hook logs and the files on disk end up with the same names, because a step is named by its path everywhere. Tracing, metrics, and retries all live in hooks, which is how stepper gets away with depending on Pydantic and nothing else.",
    },
  ],
  difficulties: [
    {
      title: 'where do parallel arms rejoin?',
      body: "Since you never declare the join, stepper has to figure out on its own where the parallel paths meet again. The obvious approach, just following the graph forward from the fan-out, breaks as soon as an arm has its own branch, its own loop, or another fan-out inside it. So the join is the nearest node that every path to EXIT has to pass through. The textbook name for that is the immediate post-dominator. One wrinkle: the same step can fan out on one branch and run normally on another, and those two cases can need different joins. So each fan-out gets its own stand-in node in the graph, and the join is computed per fan-out, not per step. Then five sanity checks make sure the section between the fan-out and the join really works as one self-contained piece of the graph. The test file has around 35 tests, each named for a graph shape that must be rejected.",
      media: [
        {
          kind: 'pre',
          pre: `      .--> A ---------------------------.
      |                                 |
fan --+                                 +--> J --> EXIT
      |                                 |
      '--> B --+--> B1 --.              |
               |         +--> B3 -------'
               '--> B2 --'

  every path from fan to EXIT crosses J first, so join(fan) = J`,
        },
        {
          kind: 'pre',
          pre: `edge(check).when(ready).to(extra, common).otherwise(common)
# raises at import: an arm is only ever entered
# through its fan-out; route to 'join' instead`,
        },
      ],
    },
    {
      title: 'errors at import',
      body: "`depends()` loads its data from disk, so if the step that produces it never ran, you don't get `None`, you get a crash halfway through a run. So stepper checks this while the file loads: a step can only read data that every possible path to it has already produced. Loops follow the same rule: the first time around, last round's data doesn't exist yet, so a step that reads it has to mark it optional with `optional_depends`. At a join the rule loosens: by the time the join runs, every arm has finished, so it can read all of them. And if one parallel arm reads another arm's output, there's no guarantee which finishes first, so stepper rejects it at import and tells you to read both from the step where the arms meet.",
      media: [
        {
          kind: 'pre',
          pre: `condition, only one path runs:

     .--> a  writes X --.
  s -+                  +--> t      t reads X: error at import,
     '--> b  writes Y --'           the path through b never made X

fan-out, all arms finish before the join:

     .--> a  writes X --.
  s -+                  +--> j      j reads X and Y: allowed
     '--> b  writes Y --'           a reads Y: error, no arm order`,
        },
      ],
    },
    {
      title: 'resuming a crashed run',
      body: "The checkpoint is one field: the name of the next node. Everything else a resumed run needs was already written by the steps themselves, so there is no snapshot to keep in sync. The real work is deciding what happens when things go wrong. A failed checkpoint write never fails the step. A corrupt or outdated checkpoint means the run starts over from the top, though finished steps still replay from disk. Storage that can't be read at all stops the run, because pretending it's a first run would repeat side effects. And if the checkpoint points inside a fan-out arm, stepper refuses to resume there: one arm would rerun alone while the join reads stale outputs from the other arms.",
    },
  ],
};
