import type { ProjectPageData } from '../../components/ProjectPage/ProjectPage';

// Draft wording — Joshua rewrites in his voice.
export const stepper: ProjectPageData = {
  slug: 'stepper',
  name: 'stepper',
  dates: 'Jul 2026 – now',
  line: 'Typed execution framework for long-running AI pipelines — the engine under Silky, jobby, and investing-tools.',
  concepts: 'graph execution · checkpoint & resume · typed pipelines', // TODO: Joshua's wording
  stack: 'Python · AsyncIO · Pydantic',
  github: 'github.com/jjenkins2004/stepper',
  problem: {
    body: 'LLM pipelines run long and fail late. When step 14 of 17 dies three hours in, rerunning from zero burns real money and real time — and most orchestrators either assume short jobs or arrive attached to a platform. I wanted something tiny that makes a crashed run resume exactly where it died.',
  },
  features: [
    {
      title: 'the whole surface is one class',
      body: 'Steps are plain async functions. A flow is a class that composes them — and a flow mounts inside another flow like any step.',
      media: [
        {
          kind: 'pre',
          lang: 'python',
          pre: `class TaxFlow(Flow[Order]):
    order = require(Order)                    # what this flow needs

    @step
    async def with_tax(self, o=depends(order)) -> Order:
        return Order(total=int(o.total * 1.2))

    edges = (edge(START).to(with_tax), edge(with_tax).to(EXIT))


class CheckoutFlow(Flow[str]):
    @step
    async def build(self) -> Order:
        return Order(total=100)

    taxed = TaxFlow.bind(order=build)         # mounting a flow is the call

    @step
    async def summary(self, o=depends(taxed)) -> str:
        return f"order total: {o.total}"

    edges = (edge(START).to(build), edge(build).to(taxed),
             edge(taxed).to(summary), edge(summary).to(EXIT))


asyncio.run(CheckoutFlow().run(run_id="run-1"))`,
        },
      ],
    },
    {
      title: 'the run lives on disk',
      body: "Every node's path is its persist key, so a run directory reads as the run itself — no dashboard required.",
      media: [
        {
          kind: 'pre',
          pre: `output/run-1/checkout/build.json              Order(total=100)
output/run-1/checkout/taxed/with_tax.json     Order(total=120)
output/run-1/checkout/summary.txt             "order total: 120"
output/run-1/checkout/_loop_cursor.json       where each graph got to`,
        },
      ],
    },
    {
      title: 'crash, then resume',
      body: 'Re-run with the same run id: finished steps replay from disk, execution rejoins mid-loop exactly where it died.',
    },
    {
      title: 'edges, loops, hooks',
      body: 'edge(a).to(b, c, d) fans out and edge(b, c, d).to(m) joins; cycles are declared edges, checkpointed like everything else. Tracing, metrics and retries attach through hooks — no vendored observability.',
    },
  ],
  difficulties: [
    {
      title: 'errors at import, not at hour two',
      body: "A flow's declaration is entirely about itself — nothing resolves by name, proximity, or guesswork — so the whole graph is checkable the moment the module loads. Unbound inputs, mistyped bindings, unreachable nodes, branches that can't finish: all raise at import. The cost is ceremony — every input declared, every mount bound explicitly. The payoff is that a three-hour pipeline cannot die at hour two from a typo'd wire.",
    },
    {
      // TODO: Joshua's wording
      title: 'resuming a run that died mid-loop',
      body: "A loop isn't a list of steps — it's a cycle the run may have gone around three times when it crashed. Checkpointing that means persisting not just values but where each graph got to (the _loop_cursor files), so a resumed run replays finished iterations from disk and rejoins the cycle exactly where it broke.",
    },
  ],
};
