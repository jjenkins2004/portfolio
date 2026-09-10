import type { ExperiencePageData } from '../../components/ProjectPage/ExperiencePage';

// Draft wording — Joshua rewrites in his voice.
export const handshake: ExperiencePageData = {
  slug: 'handshake',
  org: 'handshake',
  role: 'AI Engineer Fellow',
  dates: 'Apr 2026 - now',
  line: 'Evaluation work for frontier coding models at Handshake AI: benchmark tasks, golden solutions, adversarial tests, and head-to-head model comparisons. I built a pipeline for every project, and the framework underneath became stepper.',
  concepts: 'LLM evaluation · benchmark task design · adversarial testing · agent-run pipelines',
  stack: 'Python · Bash · Docker · stepper · Playwright',
  sections: [
    {
      title: 'context',
      body: "Handshake AI is the part of Handshake that builds evaluation and training data for AI labs, with contracted engineers and domain experts doing the work. I joined as an AI Engineer Fellow in April 2026 and have worked on three projects, each a different kind of evaluation. On Helix I turned real production pull requests into evaluation tasks: a golden solution plus adversarial tests that fail on the base commit and pass on the fix. On Ivy I ran two frontier coding agents against one spec in matched containers and scored the comparison. On Dynamo I wrote tasks end to end for Terminal-Bench 2, a benchmark for coding agents working in a terminal, and reviewed other fellows' tasks.\n\nEvery project meant repeating the same careful work many times against strict delivery requirements, so I built a pipeline for each one. Coding agents wrote the pipelines and built the tasks. I decided what a task should look like, watched what worked and what didn't, and changed the pipeline to match. By the third project the framework under the pipelines had become [stepper](#/projects/stepper). Across Helix and Ivy I delivered hundreds of tasks. Dynamo's pipeline changed the most, so it is the case study for the rest of this page. About 30 Dynamo tasks were accepted.",
    },
    {
      title: 'the evolution',
      subs: [
        {
          title: 'v0 and the CI bill',
          when: 'Jul 5 - 15',
          body: "v0 was a hard-coded straight line of steps. Construct the task, sabotage it by planting the bug the solver has to find and fix, write the instruction, calibrate each test, then run blind trials through harbor, the benchmark's own runner that builds a task's image and scores an agent's attempt at it. It worked at first, but not consistently. Handshake then tightened the requirements, adding soundness checks, and their review pipeline got longer and slower. Building something scrappy locally and pushing it to CI to see if it passed was costing me dozens of hours of CI time per task. So I built a local pipeline that catches everything CI catches, and the 30 findings CI raised on one batch became the first local checks.",
        },
        {
          title: 'first ideas for difficulty',
          when: 'Jul 21 - 25',
          body: 'I kept adding steps in front of the build: a proposal, a contract, a gate that rejected weak designs, a mandate to overload the solver (the agent attempting the task) with context. All of them were guesses about what makes a task hard. In the end I only trusted the blind trials. Three agents that have never seen the answer try the task, and I only count it as hard if they fail. The pipeline was also getting long and runs took hours, so it moved onto stepper and got checkpointing between steps.',
        },
        {
          title: 'stacking levers',
          when: 'Jul 27',
          body: 'I built four tasks, hardened each over four to six rounds, and every one was either solved or abandoned. Every lever that failed had been tried on its own: more rules, scattering the data across files, a tool that lies, a longer recovery chain, context overload, forcing the solver to adapt. Each one did what it was built to do and the solver still solved the task. The difficulty loop, those hardening rounds, was also cutting any mechanism the solver got past, which turned out to be a mistake. Getting past a mechanism costs turns and context, and the rest of the run builds on the work it forces, so a lever that fails alone can still use up the context or turns that let a later one work. One run beat every parsing obstacle perfectly, and the parser it wrote to get past them became the tool it won with. Now I keep every lever unless I have evidence it did nothing, and I stack several at once.',
        },
        {
          title: 'one recipe, no examples',
          when: 'Jul 27 - 28',
          body: 'Once I could see what was working, I merged weeks of guidance docs into one recipe. I also stripped every worked example out of the prompts, because the agents were cloning past tasks instead of designing their own. I cut one task shape too, the one where the task ships a spec and grades how closely the solver follows it. Implementing a spec is just a lot of correct work, and a lot of work on its own is not enough to make frontier models fail.',
        },
        {
          title: 'kill the proposal',
          when: 'Jul 28',
          body: 'The proposal step always looked good on paper and mostly failed in reality. It could not predict what the build would run into, and every step after it was forced to obey it. I caught myself telling the driving agent (the one that runs every step after a person kicks off the run) to ditch the proposal and change the task however it wanted, and the results got much better, so I built that into the pipeline. Seeding the task design became the first step and the proposal was parked.',
        },
        {
          title: 'one agent holds the context',
          when: 'Jul 29',
          body: 'The difficulty loop ran in code, with a fresh editing agent every round. Even with shared notes, the new agents kept reversing earlier decisions, because they were not there for the details that forced them. Runs never converged on a design. So I took the loop out of the code and turned it into seven commands that one driving agent runs itself, holding the whole history of the task in its context. The whole evolution took hundreds of CI pushes and thousands of local blind trials.',
        },
      ],
    },
    {
      title: 'work',
      mediaFirst: true,
      subs: [
        {
          title: 'the stage graph',
          media: [
            {
              kind: 'pre',
              pre: `$ python -m src.cli --task {{<name>}} --list
[tasker]
  initialize: probe, write_runner_prompt
  setup:      fetch_repo, seed, write_reference
  construct:  scaffold, build
  calibrate:  calibrate
  submit:     preflight, self_review, bundle_submission`,
              caption: 'challenge, the loop that makes a task hard, runs between construct and calibrate',
            },
          ],
          body: 'Each stage is a stepper stage and each step writes its output to disk, so recovery is re-running the failed step. A person runs the first step once, then pastes a generated prompt into a driving agent that runs everything after.',
        },
        {
          title: 'who runs whom',
          media: [
            {
              kind: 'pre',
              pre: `{{person}}           runs the first step once, then pastes the generated
                 prompt into the driving agent
{{driving agent}}    runs every step after; holds the whole task history;
                 decides what to change next
{{internal agents}}  dispatched by steps and commands, 15 prompts
  diagnostician  read: one question, read-only
  edit agent     edit: one authoring round under a directive
  fix agent      calibrate: runs when a gate fails
{{solvers}}          three per round through harbor, never see the answer;
                 the task is hard only if they fail
{{code}}             decides only whether the task is broken;
                 never decides what to change next`,
            },
          ],
          body: 'The driving agent makes every judgement call. The code only checks whether a task is broken.',
        },
        {
          title: 'three layers',
          media: [
            {
              kind: 'pre',
              pre: `{{stepper}}      the pipeline framework: @step, Stage, Pipeline,
             disk persistence, a Hooks seam
             [[import it, never edit it]]
{{haikit}}       the shared services: the agent CLI wrapper, Docker,
             Playwright, subprocess
             [[extend from here, never edit it]]
{{dynamo}}       this repo: the pipeline's stages, prompts, config,
             and the dynamo-only services (harbor, verify, workspace)
             [[edit here]]`,
            },
          ],
          body: 'Anything only one pipeline uses lives in that pipeline\'s repo. When dynamo needed a longer timeout on prompt-only calls, it wrapped haikit\'s function and changed one default instead of editing haikit.',
        },
        {
          title: 'the challenge commands',
          media: [
            {
              kind: 'pre',
              pre: `$ python -m src.cli.challenge --task {{<name>}} ...
  open       seed the workspace, start its history and ledger
  read       dispatch a read-only diagnostician at one question
  edit       one authoring round, under your directive
  evaluate   QC, then the blind trials, then the analyses
  clock      set the solver clock
  finish     QC, gate, promote the workspace
  git        any git command against the workspace history`,
              caption: 'the driving agent runs these; the code never decides what to change next',
            },
          ],
          body: 'Making a task hard means editing it, measuring it, and deciding what to change next, over and over. The first version hard-coded that loop, every decision from a lookup table. Now the agent holding the whole picture runs it through these commands. The agent gets no say when a task is broken rather than weak. An unparseable manifest, a solution copied into the image, or a golden run that fails all stop `evaluate` before it spends any trials.',
        },
        {
          title: 'blind trials',
          media: [
            {
              kind: 'pre',
              lang: 'python',
              pre: `trials = await asyncio.gather(
    *(
        run_blind(
            task_path=task_path,
            output_dir=output_dir,
            runs_dir=runs_dir,
            round_no=round_no,
            label=_TRIAL_LABELS[i],
        )
        for i in range(TRIALS_PER_ROUND)   # 3
    )
)
scored = scored_trials(list(trials))`,
            },
          ],
          body: 'Three agents run at once through harbor, so a round resolves 2-1 or 3-0 instead of a coin flip. Before a trial counts, the code reads from the transcript which model actually ran, checks that the run took at least three turns, and scans for a login failure. Otherwise a run that never authenticated scores exactly like a hard task.',
        },
        {
          title: 'calibrate and the clean image',
          media: [
            {
              kind: 'pre',
              lang: 'python',
              pre: `def image_contamination(image: str) -> list[str]:
    """Paths of solve.sh / test.sh baked into the image. Must be empty to ship."""
    result = subprocess.run(
        ["docker", "run", "--rm", image, "/bin/bash", "-lc",
         "find / \\( -name solve.sh -o -name test.sh \\) 2>/dev/null"],
        capture_output=True, text=True,
    )
    return [line for line in result.stdout.splitlines() if line.strip()]`,
            },
          ],
          body: 'Calibrate runs three gates in order, all measured by harbor: the golden solution scores 1.0 with every test passing, the image contains no solution or test script, and every test fails on an untouched workspace. The image is named by a hash of the folder that defines it, so identical inputs share one image and different tasks can never collide.',
        },
        {
          title: 'history outside the tree',
          media: [
            {
              kind: 'pre',
              pre: `tasks/<name>/
├── repo/task/                   the task itself; harbor runs here
├── workspaces/<stage>/          one isolated working copy per stage
├── output/<stage>/<step>.json   every step's saved artifact
├── {{challenge_history.git/}}       the git dir, outside every work tree
├── challenge_ledger.md
└── submission/`,
            },
          ],
          body: 'The challenge workspace gets a full git history, but its `.git` lives one level up. No git metadata can reach the Docker build context, get promoted into the task, or land in the pull request. A stage works on its copy and promotes it over the real task only on a clean exit, so a crash never leaves the task half-written.',
        },
      ],
    },
    {
      title: 'lessons',
      subs: [
        {
          title: 'an agent rewrote the pipeline',
          body: 'An edit agent decided the harness was broken, reached out of its workspace, and rewrote the blind-trial code and its own prompts. Every internal agent prompt now ends with two hard rules: never write outside your directory, and never declare the tooling broken. If you think it is, say so in your report and keep working.',
        },
        {
          title: 'the fix agent that scored the wrong task',
          body: 'A Windows file lock left the task folder empty halfway through a promotion. A calibration fix agent, the one that runs when a calibrate gate fails, repopulated it from a stale sibling workspace, scored that at 1.0, and reported success. The only tell was the test names in the log. Submit got a deterministic gate that checks the task on disk, and the whole stack went Linux-only.',
        },
        {
          title: 'prompts were 83% boilerplate',
          body: "Handshake's workflow spec, the document that says what a valid task looks like, went into all 15 internal agent prompts in full. The calibration fixer was 94% workflow document, shipping the Dockerfile base-image table and three worked examples on every call. About 500 lines of one prompt described checks a program could run better, and the agent then graded its own work in a free-text field that nothing checked. Documents are now sliced by heading, each prompt asks for its sections, seven checks moved into code, and an agent with file tools gets a path instead of a document.",
        },
      ],
    },
  ],
};
