---
name: create-blog
description: Create a new blog post scaffold only after an explicit user request.
---

# Create Blog

Create one empty Markdown scaffold only when user explicitly asks to create a new blog post.

## Workflow

1. **Confirm request.**
   - Require explicit creation intent. Editing or repairing existing posts does not trigger this skill.
   - Require exact post title. If user provides only a topic, ask for title and stop.
   - Completion: exact title and creation intent are known.

2. **Read repository contract.**
   - Read `src/content.config.ts` before writing. Treat its schema as source of truth.
   - Inspect `src/content/blog/` for current naming and frontmatter conventions.
   - Completion: target year, filename, and required fields are resolved from current repository state.

3. **Choose path and branch name.**
   - Use `src/content/blog/<year>/<slug>.md`.
   - Derive short lowercase `<slug>` from title or topic; use hyphens for word boundaries, preferably 1–3 words.
   - Check target path does not already exist. If it exists, stop and report collision; do not overwrite.
   - Suggest `<slug>` as branch name; do not create or switch branches.
   - Completion: unique target path and branch suggestion are recorded.

4. **Write scaffold.**
   - YAML-quote the exact user-provided title safely.
   - Include only these fields:
     - `title`
     - `description: "TBD"`
     - `draft: true`
     - `pubDatetime: <current ISO-8601 datetime with timezone offset>`
   - Leave body empty after closing `---`.
   - Add no tags, author, images, outline, or article text unless user explicitly requests them.
   - Completion: one new file contains valid frontmatter and zero body content.

5. **Verify and open.**
   - Run `git diff --check`.
   - Run `npm run build:check` when available; use its result to catch frontmatter/schema errors.
   - Open file with `code <new-post-path>`.
   - Completion: checks finish, or exact unavailable/failing check is reported, and editor command is issued.

6. **Report.**
   - State created file path.
   - State suggested branch name.
   - State verification result.
   - State clearly that no article content was drafted.

## Scaffold shape

```md
---
title: "<user title>"
description: "TBD"
draft: true
pubDatetime: <current ISO-8601 datetime with timezone offset>
---
```

## Asset paths

When user separately requests post images or assets, use:

- Source content: `src/content/blog/<year>/<slug>.md`
- Public assets: `public/assets/img/<year>/`
- Markdown URL: `/assets/img/<year>/<filename>`

Create asset directories only with explicit asset setup request.
