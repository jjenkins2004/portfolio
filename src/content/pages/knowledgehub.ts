import type { ProjectPageData } from '../../components/ProjectPage/ProjectPage';

export const knowledgehub: ProjectPageData = {
  slug: 'knowledgehub',
  name: 'KnowledgeHub',
  dates: 'Aug 2026',
  line: 'A shared knowledge base any AI agent can read and edit from anywhere. Includes enforced structure for fast knowledge retrieval and multi-user support.',
  concepts: 'all-or-nothing commits · edit by heading · zero dependencies',
  stack: 'TypeScript · Node · MCP · Docker',
  github: 'github.com/jjenkins2004/knowledgehub',
  problem: {
    body: "KnowledgeHub started at [Silky](/experience/silky). Keeping two separate sets of notes in sync by hand was a pain. A client texted me, I forwarded it to my cofounder, he updated his notes, I updated mine. All of that happened on our phones, multiple times a day. We wanted to dump knowledge in, have an AI parse out the important points, and push them to a shared base. Surprisingly, there weren't any easy existing solutions. An agent reading and writing Google Drive directly is janky. Notion costs a subscription, and an agent writes into it through a block API instead of plain text files. A repo cloned to my laptop only exists on my laptop, and a phone can't run git.\n\nSo I built it myself. The base is a GitHub repo of markdown files with a small server in front. I went with GitHub instead of building my own storage because it was the fastest way to get something working. It's an ecosystem we already knew, hosting is free, and edit history comes built in. My coding agent and the AI on my phone could now read and edit the same knowledge base. It has since grown past Silky. My investing research, cooking recipes, and tennis lessons each live in their own repo now.",
    media: [
      {
        kind: 'pre',
        pre: `  agent --- ((tool call)) --> {{knowledgehub}} --- reads, writes -->  /\\_/\\
                                                             ( o.o )
  agent <-- [[result]] ------ {{knowledgehub}} <-- new commit ------  > ^ <
                                                              github`,
        caption: 'The agent talks to the server over MCP, the open standard that lets any AI agent call outside tools. The server does every read and write against GitHub.',
      },
    ],
  },
  features: [
    {
      title: 'in action',
      media: [
        {
          kind: 'chat',
          turns: [
            {
              role: 'user',
              text: 'Call with the client just ended. They want the sizing table in inches, not cm. Save that.',
            },
            {
              role: 'ai',
              text: 'On it. Checking what the base already says about sizing.',
              tools: ['overview(repo: "silky")', 'read_md(repo: "silky", "clients/acme.md")'],
            },
            {
              role: 'ai',
              text: 'Saved as one commit to silky. The sizing section of clients/acme.md now reads in inches.',
              tools: ['commit_edits({ message: "acme: sizing in inches", edits: [...] })'],
            },
          ],
        },
      ],
      body: 'The agent reads the base before it writes.',
    },
    {
      title: 'enforced structure',
      media: [
        {
          kind: 'pre',
          pre: `                     {{silky/}}
                     [[INDEX.md]]
                        │
      ┌─────────────────┼────────────────┐
  {{clients/}}          {{projects/}}        {{meetings/}}
  [[INDEX.md]]          [[INDEX.md]]         2026-08.md
  acme.md           redesign.md
  birch.md`,
        },
      ],
      body: "Every repo starts with an INDEX.md at its root, and folders can carry their own. create_repo refuses to create a repo without one, and overview returns it verbatim on every call. The agent is told to keep it current whenever it restructures anything. File names alone don't say what's inside, so the index spells out which file answers which question. That matters most on writes. New knowledge lands in the file where it belongs, instead of every agent inventing its own filing until the base rots into scattered notes. Every path also comes back with its size, so a read can skip a big file it does not need.",
    },
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
      body: "These seven tools let an agent work in a repo without ever cloning it.",
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
      body: "An edit_section op, one of the edits a commit_edits batch can carry, points at a heading instead of rewriting the file. A section runs from its heading to the next one at the same or a shallower level, and the mode says what to do with it: replace it, append to it, prepend to it, or delete it. I picked headings over str_replace and line numbers. Replacing a section through str_replace means quoting the whole thing back character for character, and one whitespace difference is a miss. Line numbers go stale the moment anyone else commits, and models miscount them anyway. A heading name survives both. It also matches how a knowledge base is organized, so 'update the sizing section of acme.md' is exactly one call. When a name matches more than one place, the server refuses and lists every candidate with its full path rather than guessing which one was meant.",
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
      ],
      body: "The first version of this server was a passthrough to GitHub's own MCP tools, and those make a separate commit for every file they write, so one logical change came out as a trail of commits. Now every edit in a batch is applied in memory first, and either the whole batch lands as one commit or nothing is written. Deleting or overwriting a whole file also requires expect_sha, a fingerprint of the file as it currently stands, so the agent can never destroy content it has not looked at.",
    },
  ],
  difficulties: [
    {
      title: 'no native inline edits',
      media: [
        {
          kind: 'pre',
          pre: `---
title: notes
---            a legal heading underline: a naive scan turns
               "title: notes" into a heading

<!-- toc -->   opens AND closes an HTML block on the same line

    # indented four spaces, so this is code, not a heading`,
          caption: 'The three cases that forced the parser.',
        },
      ],
      body: "GitHub's API cannot edit part of a file. The contents API takes a whole new file body, and the lower level git data API also only deals in whole files. Every edit tool the server offers is really an in-memory transform: fetch the current bytes, apply the change myself, hand the whole result back. That layer grew to about 960 lines, written from scratch because the server has zero dependencies. The matching half is strict. An old_string, the exact text an edit wants replaced, has to appear verbatim and exactly once or the server refuses and lists every line it found. The markdown half became a small CommonMark block parser, because a naive scan for lines starting with # gets fooled. YAML front matter, the metadata block at the top of a markdown file, ends in three dashes, which is also legal markdown for underlining a heading. And a one-line `<!-- toc -->` comment once wedged the scanner open to the end of the file, so editing the section before it deleted the rest of the document. Putting bytes back was its own problem: real files mix line ending styles, open with an invisible byte order mark, or end without a final newline, and the obvious split-and-join rewrites every one of those. So the document model remembers the exact terminator of every line, and an edit only changes the lines it touched.",
    },
    {
      title: 'preventing racing writes',
      body: "Two people can push to the same branch at the same time, and GitHub itself catches that much: the server moves the branch pointer without force, and GitHub refuses the move if someone else pushed first. The dangerous part is the retry. Edits like str_replace carry no file version, so replaying one on top of the other person's newer commit would quietly overwrite their work and still report success. My test probe caught the server doing exactly that. The fix is to snapshot the blob SHA of every file the batch of edits touches. A blob SHA is git's fingerprint for one file's exact contents. On a retry the server compares those fingerprints between the two attempts, and if any touched file changed it refuses and sends back the file's new contents so the edit can be rewritten against them. It compares per-file fingerprints instead of the branch pointer on purpose, since the pointer moves when anyone pushes anything, and that would turn every unrelated push into a failure. If the other person's commit touched none of the batch's files, the retry just rebuilds on top of their commit and lands.",
    },
  ],
};
