import type { ProjectPageData } from '../../components/ProjectPage/ProjectPage';

// Draft wording — Joshua rewrites in his voice.
export const knowledgehub: ProjectPageData = {
  slug: 'knowledgehub',
  name: 'KnowledgeHub',
  dates: 'Aug 2026',
  line: 'A shared knowledge base any agent can read and edit from anywhere. Includes enforced structure for fast knowledge retrieval and multi-user support.',
  concepts: 'all-or-nothing commits · edit by heading · zero dependencies',
  stack: 'TypeScript · Node · MCP · Docker',
  github: 'github.com/jjenkins2004/knowledgehub',
  problem: {
    body: "KnowledgeHub started at [Silky](#/experience/silky). Keeping two separate sets of notes in sync by hand was a pain. A client texted me, I forwarded it to my cofounder, he updated his notes, I updated mine. All of that happened on our phones, multiple times a day. We wanted to dump knowledge in, have an AI parse out the important points, and push them to a shared base. Surprisingly, there weren't any easy existing solutions. An agent reading and writing Google Drive directly is janky. Notion costs a subscription, and an agent writes into it through a block API instead of plain text files. A repo cloned to my laptop only exists on my laptop, and a phone can't run git.\n\nSo I built it myself. The base is a GitHub repo of markdown files with a small server in front. I went with GitHub instead of building my own storage because it was the fastest way to get something working. It's an ecosystem we already knew, hosting is free, and edit history comes built in. My coding agent and the AI on my phone could now read and edit the same knowledge base. It has since grown past Silky. My investing research, cooking recipes, and tennis lessons live there too.",
    media: [
      {
        kind: 'pre',
        pre: `the pieces
  any MCP client       the agent side, anything that speaks MCP
  knowledgehub         one container, no database
  api.github.com       GitHub's REST API, no git binary anywhere

every tool call, one hop each way
  client --- MCP tool call ------> server
  server --- REST, with a PAT ---> api.github.com
  server <-- JSON ---------------- api.github.com
  client <-- tool result --------- server

what the middle holds
  the server speaks MCP itself and runs its own OAuth sign-in
  the secret typed at connect time picks which GitHub PAT is used
  no state but in-memory caches: restart it and nothing is lost`,
        caption: "PAT = a GitHub personal access token; its scopes, set on GitHub's side, are the only permission boundary.",
      },
    ],
  },
  features: [
    {
      title: 'agent tools',
      media: [
        {
          kind: 'pre',
          pre: `overview       the repo's own index file plus every path, one call
list_md        every markdown file with its size and blob SHA
read_md        up to 20 files in one call, one shared size cap
history        commits newest first, for the repo or one path
show_commit    author, full message, per-file diff
commit_edits   up to 100 edits across files, one commit
create_repo    a new repo, seeded with its index file`,
        },
      ],
      body: "These seven tools let an agent work in a repo without ever cloning it. overview is the entry point: one call returns the repo's index file verbatim plus the full file list, so the model knows where things live before it reads anything.",
    },
    {
      title: 'one commit per change',
      media: [
        {
          kind: 'pre',
          lang: 'typescript',
          pre: `commit_edits({
  message: "docs: restructure",
  edits: [
    { op: "str_replace",  path: "guide.md",
      old_string: "step one", new_string: "step 1" },
    { op: "edit_section", path: "guide.md",
      heading: "Usage", mode: "replace", content: "run it fast" },
    { op: "write",        path: "new.md",
      content: "# New\\n\\nfresh\\n" },
    { op: "delete",       path: "docs/old.md",
      expect_sha: "<blob sha from list_md>" },
  ],
})`,
          caption: 'A real batch from the test suite. It touches three files and lands as a single commit.',
        },
        {
          kind: 'pre',
          pre: `what one commit_edits call sends

plan      only GET requests, nothing on github changes yet
  read the branch pointer, its head commit, the old file tree
  read every file the batch touches
  apply all edits in memory, validate every op
  any failure stops here, zero write requests sent

execute   the same three write requests, every time
  POST /git/trees      the new file tree, built on the old one
  POST /git/commits    the new commit pointing at that tree
  PATCH /git/refs      the branch move, with force:false
                       github refuses it if anyone pushed first`,
        },
      ],
      body: "The server reads everything the batch needs first, applies all of it in memory, and only then sends GitHub the same three write requests every time: the new file tree, the new commit, and the branch move. There is no pending state anywhere: a file keeps its old contents until commit_edits returns the finished commit. Deleting a file, or replacing its entire contents, requires expect_sha, a fingerprint of the file as it currently stands, so the model can never destroy content it has not looked at.",
    },
    {
      title: 'edit by heading',
      media: [
        {
          kind: 'pre',
          lang: 'typescript',
          pre: `{ op: "edit_section", heading: "Install", mode: "replace", ... }

// two sections named Install? address by path or by occurrence
{ op: "edit_section", heading: "Guide > Install", ... }
{ op: "edit_section", heading: "Install#2", ... }`,
        },
      ],
      body: "The model points at a heading instead of rewriting the file. A section runs to the next heading at the same or a shallower level, and when a name matches more than one place, the server refuses and lists every candidate with its full path rather than guessing which one was meant.",
    },
    {
      title: 'when an edit misses',
      media: [
        {
          kind: 'pre',
          pre: `Nothing was committed — 1 operation(s) could not be applied,
and this tool is all-or-nothing.

• edits[0] (str_replace guide.md): No replacement was performed:
  old_string did not appear verbatim in guide.md.
Did you mean to match one of these actual lines from guide.md?
  line 7: step 1

This batch is held as retry_ref r_b99c0a — resend it unchanged with
commit_edits({message, retry_ref:"r_b99c0a"}) once the cause is fixed.`,
          caption: 'Real output from a failed batch. The server never fuzzy-matches, because a wrong guess about which bytes to overwrite corrupts the file silently.',
        },
      ],
      body: "A missed match comes back with more than a bare error. The server checks whether the replacement text is already in the file, since the edit may have landed on an earlier try, and suggests the closest real lines to what the model was hunting for. The failed batch is held for 30 minutes under a retry_ref, so a fixed version can be resent without retyping every edit. The test suite runs 350 assertions against a fake GitHub built into the tests, and 63 of them pin down bugs found by deliberately trying to break the server.",
    },
  ],
  difficulties: [
    {
      title: 'finding a heading',
      media: [
        {
          kind: 'pre',
          pre: `---
title: notes
---            a legal setext underline: a naive scan turns
               "title: notes" into a heading

<!-- toc -->   opens AND closes an HTML block on the same line

    # indented four spaces, so this is code, not a heading`,
          caption: 'Three markdown lines that fool a naive heading scan.',
        },
      ],
      body: "edit_section needs to know where every section starts, and a regex for lines starting with # gets that wrong in ways that eat real content. YAML front matter, the metadata block at the top of many markdown files, ends with three dashes. Three dashes are also legal markdown for underlining a heading, so a naive scan invents a heading named after the last line of the front matter, and an edit lands inside it. The worst case was HTML. In CommonMark, the standard markdown spec, a one-line `<!-- toc -->` comment opens and closes an HTML block on the same line. Until I tested the end condition on the opening line itself, that comment wedged the scanner open to the end of the file. Every heading after it disappeared, and editing the section before it deleted the rest of the document. So the heading scanner grew into a small CommonMark block parser that tracks code fences, indented code, blockquotes, underline-style headings, and all seven HTML block types.",
    },
    {
      title: 'races against github',
      body: "Three different race conditions show up when the writer is an HTTP API instead of a local clone. The simplest one, two writers pushing at the same time, is handled by GitHub itself: the server moves the branch pointer without force, and GitHub refuses the move if someone else pushed first. The retry after that refusal is the trap. Operations like str_replace carry no expected file version, so replaying them on top of the other person's newer commit could quietly overwrite their work and still report success. Instead the server compares its before and after snapshots and refuses the retry if any file the batch touches has changed, and it hands back the new contents so the edit can be rewritten against them. The read-your-own-writes race actually bit me: for a few seconds after a push, asking GitHub where the branch points can still return the old commit, so a second edit got planned against a commit the server itself had just replaced, and a file created moments earlier looked like it did not exist. The fix is to remember the last SHA the server pushed to each branch and re-poll up to three times, at 300, 600, then 900 milliseconds, until GitHub shows a commit at least that new.",
    },
  ],
};
