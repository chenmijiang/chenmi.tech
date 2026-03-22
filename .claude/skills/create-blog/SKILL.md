---
name: create-blog
description: Use when user explicitly asks to create a new blog post, scaffold a blog markdown file, or invokes a create-blog workflow for this repository.
---

# Create Blog

Create a new blog post scaffold for this repository without inventing content.

## Core Rule

- Never create a new blog post unless the user explicitly asks for it.
- If the user says "new blog post" but does not provide a topic or title, ask for the topic/title first.
- When creating the file, scaffold only the minimum valid frontmatter and no body content.

## Repository Rules

These rules are project-specific and must override generic blog-writing habits:

- Blog files live under `src/content/blog/<year>/<slug>.md`.
- Pick a short slug from the topic/title, ideally 1-3 words, all lowercase, with hyphens instead of spaces.
- Use the same slug as the default branch name suggestion.
- Frontmatter for a newly scaffolded post must be minimal:
  - `title`: use the exact user-provided title
  - `description`: set to `"TBD"`
  - `draft`: set to `true`
  - `pubDatetime`: set to today's datetime in ISO-8601 format with timezone offset
- Do not add body content.
- Do not invent an outline.
- Do not add tags, featured flags, author, heroImage, source, or other optional fields unless the user explicitly asks.
- After creating the file, open it with `code <new-post-path>`.

## Content Collection Constraints

The blog collection accepts many optional fields, but a new scaffold should keep only the minimum required placeholders:

```yaml
---
title: "<user title>"
description: "TBD"
draft: true
pubDatetime: 2026-03-22T12:00:00+08:00
---
```

- `pubDatetime` must use ISO-8601 format.
- The file extension should default to `.md`.
- The post body should remain empty after the closing frontmatter fence.

## Workflow

1. Confirm explicit intent.
   - If the user did not explicitly ask to create a post, do not scaffold anything.
   - If title/topic is missing, ask for it before proceeding.

2. Derive naming.
   - Convert the title/topic into a short slug.
   - Determine the current year for the directory segment.
   - Use scaffold path: `src/content/blog/<year>/<slug>.md`
   - Use branch suggestion: `<slug>`

3. Create the scaffold.
   - Create the markdown file at the target path.
   - Insert only the minimal frontmatter template.
   - Leave the body empty.

4. Open the file.
   - Run `code <new-post-path>`.

5. Report the result.
   - Tell the user the created file path.
   - Tell the user the suggested branch name.
   - Do not pretend the article has been drafted.

## Resource Paths

If the user later adds images or other post assets, follow these repository paths:

- Blog content: `src/content/blog/<year>/<slug>.md`
- Public blog image assets: `/public/assets/img/<year>/<slug>/`
- In-post image references should point to `/assets/img/<year>/<slug>/<filename>`

Do not create asset folders during the initial scaffold unless the user asks for image setup.

## Output Template

When scaffolding a new post, use this exact shape:

```md
---
title: "<user title>"
description: "TBD"code
draft: true
pubDatetime: <today ISO-8601 datetime>
---
```

## Common Mistakes

- Creating a post without explicit user consent.
- Proceeding without a title/topic.
- Adding tags or other metadata the user did not request.
- Writing a draft outline or article body automatically.
- Using the wrong path such as `src/pages/` instead of `src/content/blog/`.
- Forgetting to open the created file in the editor.
