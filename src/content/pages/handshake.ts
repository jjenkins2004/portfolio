import type { ExperiencePageData } from '../../components/ProjectPage/ExperiencePage';

// The pipeline as it stood in mid July: one agent per box, a task moves down only when the box above passes.
const firstIdeasFlow = `┌──────────────────────────────────────────────────────────────────────────┐
│ {{proposal}}                                                                 │
│ an agent writes up the task idea: what gets built, what gets broken, and │
│ how a model would fix it                                                 │
│                                                                          │
│ ((why: the platform requires an approved proposal before anything gets))     │
│ ((built))                                                                    │
└──────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ {{contract}}                                                                 │
│ an agent writes the rules of the system: every behavior it has to have,  │
│ and the reference data behind those behaviors                            │
│                                                                          │
│ ((why: each agent had its own idea of correct, so the tests, the))           │
│ ((instruction, and the solution drifted apart. now all three come from the)) │
│ ((contract))                                                                 │
└──────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ {{build}}                                                                    │
│ an agent builds the working system to the contract, then a second agent  │
│ rebuilds it and checks every rule holds                                  │
│                                                                          │
│ ((why: creates the world the faults get injected into, and proves the task)) │
│ ((is solvable))                                                              │
└──────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ {{challenge}}                                                                │
│ an agent breaks the system, writes the fix and the tests, then a model   │
│ tries the task blind. if it solves it, the task goes back for another    │
│ round                                                                    │
│                                                                          │
│ ((why: a model has to fail or the task is not hard, and finding out here))   │
│ ((is cheaper than a CI run))                                                 │
└──────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ {{calibrate}}                                                                │
│ makes sure the golden solution passes the tests, no solution fails them, │
│ and the built image holds no leaked solution                             │
│                                                                          │
│ ((why: the platform rejects a task that fails any of the three gates, so))   │
│ ((failures show up here and not in CI))                                      │
└──────────────────────────────────────────────────────────────────────────┘`;

export const handshake: ExperiencePageData = {
  slug: 'handshake',
  org: 'handshake',
  role: 'AI Engineer Fellow',
  dates: 'Apr 2026 - now',
  line: 'Evaluation work on frontier AI models at Handshake AI: benchmark tasks, golden solutions, adversarial tests, and head-to-head model comparisons. My main project was an agent pipeline that builds terminal benchmark tasks and hardens them until the models fail, with over 30 tasks accepted.',
  concepts: 'agent-run pipelines · LLM evaluation · difficulty calibration',
  stack: 'Python · Docker · GitHub · Linux',
  sections: [
    {
      title: 'context',
      body: "Handshake AI is the part of Handshake that builds evaluation and training data for AI labs, with contracted engineers and domain experts doing the work. I joined as an AI Engineer Fellow in April 2026 and have worked on three projects, each a different kind of evaluation. On Helix I turned real production pull requests into evaluation tasks: a golden solution plus adversarial tests that fail on the base commit and pass on the fix. On Ivy I ran two frontier coding agents against one spec in matched containers and scored the comparison. On Dynamo I wrote tasks end to end for Terminal-Bench 2, a benchmark for coding agents working in a terminal, and reviewed other fellows' tasks.",
    },
    {
      title: 'dynamo pipeline',
      note: 'case study',
      body: 'I built an agent pipeline for Dynamo to help create over 30 novel failure-inducing tasks.',
      subs: [
        {
          title: 'evolution',
          layout: 'snake',
          subs: [
            {
              title: 'v0',
              line: 'a straight line of steps',
              body: "v0 was hard-coded, reworked from the pipeline I had built for Ivy, an earlier project. One agent drafted a task proposal and a critic agent said whether it was hard enough, back and forth for up to three rounds. Then four agents wrote the solution, the tests, the Dockerfile, and the task instruction. A calibration step checked that the solution scored 1.0 on the tests, a do-nothing attempt failed them, and the solution was not baked into the Docker image. A fix agent got up to three rounds on anything that broke. No model was ever asked to solve the task before I pushed it. It worked at first, but not consistently.",
            },
            {
              title: 'flaky CI, unbeatable models',
              line: 'hours per CI run to find out a task was too easy',
              body: "Handshake's CI decided whether a task was good enough. Every push ran a frontier model against the task several times, and the task passed only if the model solved it at least once and failed at least half the time. Those runs took hours, some errored for reasons unrelated to the task, and some died halfway through. I would wait six hours to find out a task was not good enough, push a fix, and wait again.",
            },
            {
              title: 'first ideas for difficulty',
              line: 'a proposal, a contract, and one blind trial a round',
              body: "Early tasks shipped too easy because one agent wrote the broken environment, the solution, and the tests in one shot, so I split the work into steps, each with its own goal and its own checks.",
              media: [{ kind: 'pre', pre: firstIdeasFlow, tight: true }],
            },
            {
              title: 'the soundness check',
              line: 'a new requirement broke every task my pipeline made',
              body: "Handshake added a soundness check on every task's pull request. Every rule a task's tests graded had to be derivable from the files shipped with the task, so a model could never be marked wrong for something it had no way to know. That broke every task I had. They were only hard because of hidden rules a model could not derive. Once I edited those tasks to be sound, a frontier model read the rules and solved the tasks easily.",
            },
            {
              title: 'stacking levers',
              line: 'no single thing makes a model fail',
              body: "After the soundness check I went back to the drawing board and iterated. I built four tasks and hardened each one over four to six rounds. Each round tested one lever (one thing added to make the task harder). Every lever was built correctly but the model solved the task anyway, so every round I threw away what didn't work and tested a new lever.\n\nOut of luck, one task finally made the model fail. I started dissecting what made this one work by isolating the 'killer' lever. Weirdly, when I removed the levers that seemed useless, the model started solving the task again. That's when I realized every lever has an influence on later outcomes even if it doesn't seem to be what makes the model fail. Getting past a lever costs the model turns and context, and the later levers only work on a model that has already spent both. I had been grading levers on whether they made the model fail, when I should have graded them on whether they did what they were built to do. Once I graded them that way and stacked them, the failures came back and the tasks stayed sound. Now the pipeline keeps every lever unless I can prove it did nothing.",
            },
            {
              title: 'loosening guessed requirements',
              line: 'the proposal and the contract guessed at difficulty before the build, and the challenge round had to obey them',
              body: "The proposal and the contract both designed a task's difficulty on paper, before anything was built to measure it against. I trusted them because each one had an adversarial critic arguing with it for rounds, and I assumed that was a good enough measure of difficulty. It was not. A critic reading a design can only guess how a model will do on it, so the challenge round was stuck obeying those guesses. Task after task hit a wall there and never reached the difficulty bar. I kept having to step in and tell the pipeline to break the original contract and its assumptions, and once that was every run, I deleted the contract, and then the proposal.",
            },
            {
              title: 'difficulty by trial results',
              line: 'a blind model tries the task and its whole path says where to harden next',
              body: "Difficulty came from the blind trials. A blind model attempts the task and I get its whole path, every file it opened and every experiment it ran. That path shows exactly where levers worked or really bit, and where the model was weak and strong. So the next round knows exactly how to harden instead of guessing where it should.",
            },
            {
              title: 'one agent holds the context',
              line: 'the challenge round needs shared context, so the driving agent runs it and keeps that context',
              body: "The challenge round became so iterative and important that it needed a lot of shared context between rounds. Without it, a fresh edit agent each round went back on the last round's reasoning and rounds looped over and over making no progress. So the driving agent, the one agent steering the whole pipeline, runs the round through commands and stores the shared context: what each round did and how it performed. All of it took hundreds of CI pushes and thousands of local blind trials.",
            },
          ],
        },
        {
          title: 'architecture',
          body: 'The final version of the pipeline, the one that produced tasks consistently.',
          media: [
            {
              kind: 'anim',
              ms: 30,
              run: 18,
              tight: true,
              // the driving agent's path: down the line, into each stage and back out, two laps around challenge and publish
              path: [
                [4, 79], [7, 79], [7, 67], [10, 67], [10, 79], [14, 79],
                [14, 67], [17, 67], [17, 79], [21, 79], [21, 67], [31, 67],
                [31, 79], [21, 79], [21, 67], [31, 67], [31, 79], [35, 79],
                [35, 67], [40, 67], [40, 79], [44, 79], [44, 67], [48, 67],
                [48, 79], [52, 79], [52, 67], [61, 67], [61, 79], [52, 79],
                [52, 67], [61, 67], [61, 79], [62, 79],
              ],
              base: `┌─ {{initialize}} ────────────────────────────────────────────────────┐
│ creates workspace                                                │
│                                                                  │     {{driving agent}}
│ [[output              driving agent prompt]]                         │
└──────────────────────────────────────────────────────────────────┘           │
                                                                               │
┌─ {{setup}} ─────────────────────────────────────────────────────────┐            │
│ forks and clones the task repo, then writes the initial seed     │   ◀───────┤
│ (a short brief of the task to build).                            │           │
│                                                                  │           │
│ [[output              the seed, and the task on a new branch]]       │   ───────▶│
└──────────────────────────────────────────────────────────────────┘           │
                                                                               │
┌─ {{construct}} ─────────────────────────────────────────────────────┐            │
│ builds the working baseline the seed describes and checks it     │   ◀───────┤
│ runs in the image.                                               │           │
│                                                                  │           │
│ [[output              the task baseline]]                            │   ───────▶│
└──────────────────────────────────────────────────────────────────┘           │
                                                                               │
┌─ {{challenge}} ─────────────────────────────────────────────────────┐            │
│ turns the baseline into a task that frontier models fail.        ├─────◀─────┤
│ each round: an edit, then blind trials, then the driving agent   │           │
│ picks the next change from what the trials show.                 │           │
│                                                                  │           │
│   driving agent commands                                         │           │
│   {{edit}}        one authoring round by a fresh agent               ▼           ▲
│   {{evaluate}}    QC checks, golden solution, answer leak audit,     │           │
│               then 3 blind trials                                │           │
│   {{finish}}      when trials ((fail consistently)), freeze the task     │           │
│                                                                  │           │
│ [[output              frozen hard task]]                             ├─────▶─────┤
└──────────────────────────────────────────────────────────────────┘           │
                                                                               │
┌─ {{calibrate}} ─────────────────────────────────────────────────────┐            │
│ runs the task in docker to check Dynamo's requirements:          │   ◀───────┤
│ the golden solution scores 1.0, the image hides no answers,      │           │
│ an untouched container fails every test. when a check            │           │
│ fails, deploys a fix agent and reruns.                           │           │
│                                                                  │           │
│ [[output              the calibration report]]                       │   ───────▶│
└──────────────────────────────────────────────────────────────────┘           │
                                                                               │
┌─ {{submit}} ────────────────────────────────────────────────────────┐            │
│ static checks on the task files, nothing built or run:           │   ◀───────┤
│ metadata, labels, instruction bans, everything a PR check        │           │
│ would reject. then a read-only review and packaging.             │           │
│                                                                  │           │
│ [[output              the packaged task]]                            │   ───────▶│
└──────────────────────────────────────────────────────────────────┘           │
                                                                               │
┌─ {{publish}} ───────────────────────────────────────────────────────┐            │
│ pushes the branch, opens the PR, watches its checks.             ├─────◀─────┤
│                                                                  │           │
│   driving agent commands                                         │           │
│   {{publish}}        push the branch, open or update the PR          │           │
│   {{gh pr checks}}   poll every ten minutes for pass or fail         │           │
│   {{fix subagent}}   ((a failed check)): small fix, then calibrate,      ▼           ▲
│                  submit, publish again. if the flaw is           │           │
│                  fundamental, stop.                              │           │
│                                                                  │           │
│ [[output              passed PR]]                                    ├─────▶─────┤
└──────────────────────────────────────────────────────────────────┘           ┴`,
            },
          ],
        },
      ],
    },
    {
      title: 'lessons',
      subs: [
        {
          title: 'the agent runner',
          body: "A long pipeline needs a runner, and there are two extremes. One agent does everything, so its context explodes over a run that takes hours, and this introduces nondeterminism. Or deterministic code drives everything and calls bounded subagents. That only covers documented cases, and a pipeline like this needs reasoning on the fly, retries with a different approach, sometimes a change to the whole task.\n\nI ended up in between. A driving agent runs the pipeline through stages and commands that are code. Code owns everything that has to be exact: building, scoring, the checks, persistence. The agent owns every decision: what to change, whether another measurement is worth its cost, when to stop. The tradeoff is that it costs more and runs slower than a code-driven pipeline, in exchange for flexibility and autonomy. This was the better structure for a pipeline with so many variables.",
        },
        {
          title: 'evidence over agent reasoning',
          body: "Early on every difficulty verdict was an agent reasoning about what a solver would find hard, and tasks that cleared every gate still got solved by the blind trials. The evidence that held up was the blind trial results: the scores, and one report per run on the path the tested agent took, where it looked, what it built, where it stopped. So the critic loops came out, and the driving agent's job became reading those reports and picking the next change from them. An agent reasoning about an outcome is a guess. Measure the outcome and decide from that.",
        },
      ],
    },
  ],
};
