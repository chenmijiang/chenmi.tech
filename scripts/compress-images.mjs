#!/usr/bin/env node

import { execFile } from "node:child_process";
import { access, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import sharp from "sharp";

const execFileAsync = promisify(execFile);

const ASSETS_DIR = path.join("public", "assets");
const SOURCE_EXTENSION_RE = /\.(?:png|jpe?g)$/i;
const TEXT_EXTENSION_RE = /\.(?:astro|md|mdx|html|css|js|jsx|mjs|cjs|ts|tsx|json|webmanifest)$/i;
const MAX_SIZE = 1600;
const WEBP_QUALITY = 80;

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findSourceImages(directory) {
  if (!(await exists(directory))) return [];

  const images = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      images.push(...(await findSourceImages(entryPath)));
    } else if (entry.isFile() && SOURCE_EXTENSION_RE.test(entry.name)) {
      images.push(entryPath);
    }
  }
  return images.sort();
}

async function getTrackedTextFiles(rootDir) {
  const { stdout } = await execFileAsync("git", ["ls-files", "-z", "--cached"], {
    cwd: rootDir,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });

  return stdout
    .split("\0")
    .filter(Boolean)
    .filter((file) => TEXT_EXTENSION_RE.test(file));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceReference(content, reference, replacement) {
  const pattern = new RegExp(
    `${escapeRegExp(reference)}(?=[?#][^\\s"'<>]*|[\\s"'\`<>()[\\]]|$)`,
    "g"
  );
  let replacements = 0;
  const updated = content.replace(pattern, () => {
    replacements += 1;
    return replacement;
  });
  return { content: updated, replacements };
}

function encodePath(reference) {
  return reference.split("/").map(encodeURIComponent).join("/");
}

function referenceCandidates(source, trackedFile, rootDir) {
  const publicRelative = relativePath(path.join(rootDir, "public"), source);
  const rootRelative = relativePath(rootDir, source);
  const fileRelative = relativePath(path.dirname(path.resolve(rootDir, trackedFile)), source);
  const candidates = new Map();

  for (const [reference, replacement] of [
    [`/${publicRelative}`, `/${publicRelative.replace(SOURCE_EXTENSION_RE, ".webp")}`],
    [`/${rootRelative}`, `/${rootRelative.replace(SOURCE_EXTENSION_RE, ".webp")}`],
    [rootRelative, rootRelative.replace(SOURCE_EXTENSION_RE, ".webp")],
    [publicRelative, publicRelative.replace(SOURCE_EXTENSION_RE, ".webp")],
    [fileRelative, fileRelative.replace(SOURCE_EXTENSION_RE, ".webp")],
    [`./${fileRelative}`, `./${fileRelative.replace(SOURCE_EXTENSION_RE, ".webp")}`],
  ]) {
    candidates.set(reference, replacement);
    candidates.set(encodePath(reference), encodePath(replacement));
  }

  return candidates;
}

async function scanReferences(rootDir, trackedFiles, sources) {
  const references = new Map(sources.map((source) => [path.resolve(source), []]));

  for (const trackedFile of trackedFiles) {
    const content = await readFile(path.resolve(rootDir, trackedFile), "utf8");
    for (const source of sources) {
      for (const [reference, replacement] of referenceCandidates(source, trackedFile, rootDir)) {
        const { replacements } = replaceReference(content, reference, replacement);
        if (replacements) {
          references.get(path.resolve(source)).push({ trackedFile, reference, replacement });
        }
      }
    }
  }

  return references;
}

async function encodeWebp(source) {
  return sharp(source)
    .rotate()
    .resize({
      width: MAX_SIZE,
      height: MAX_SIZE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}

function relativePath(rootDir, filePath) {
  return path.relative(rootDir, filePath).replaceAll(path.sep, "/");
}

export async function compressImages({
  rootDir = process.cwd(),
  write = false,
  log = console.log,
} = {}) {
  const assetsRoot = path.resolve(rootDir, ASSETS_DIR);
  const sources = await findSourceImages(assetsRoot);
  const trackedFiles = await getTrackedTextFiles(rootDir);
  const references = await scanReferences(rootDir, trackedFiles, sources);
  const errors = [];
  const plans = [];
  const targetSources = new Map();

  for (const source of sources) {
    const target = source.replace(SOURCE_EXTENSION_RE, ".webp");
    const sourceReferences = references.get(path.resolve(source)) ?? [];
    const otherSource = targetSources.get(target);
    if (otherSource) {
      errors.push(
        `${relativePath(rootDir, source)} and ${relativePath(rootDir, otherSource)} map to ${relativePath(rootDir, target)}`
      );
      plans.push({ source, target, references: sourceReferences, action: "blocked" });
      continue;
    }
    targetSources.set(target, source);

    if (!sourceReferences.length) {
      plans.push({ source, target, references: sourceReferences, action: "delete" });
      continue;
    }

    const output = await encodeWebp(source);
    let targetState = "new";

    if (await exists(target)) {
      const currentTarget = await readFile(target);
      if (currentTarget.equals(output)) {
        targetState = "matching";
      } else {
        errors.push(`${relativePath(rootDir, target)} already exists with different content`);
        targetState = "conflict";
      }
    }

    plans.push({
      source,
      target,
      output,
      references: sourceReferences,
      action: targetState === "conflict" ? "blocked" : "convert",
      targetState,
    });
  }

  for (const plan of plans) {
    const action = plan.action === "delete" ? "delete unused" : plan.action;
    log(`${write ? "WRITE" : "DRY-RUN"} ${action}: ${relativePath(rootDir, plan.source)}`);
  }
  for (const error of errors) log(`ERROR ${error}`);

  if (errors.length) {
    throw new Error(
      `Image compression aborted with ${errors.length} error(s):\n${errors.join("\n")}`
    );
  }

  if (!write) {
    return { converted: 0, deleted: 0, planned: plans.length, referencesUpdated: 0 };
  }

  const sourceBackups = new Map();
  const textBackups = new Map();
  const createdTargets = [];
  let converted = 0;
  let deleted = 0;
  let referencesUpdated = 0;

  try {
    for (const plan of plans) {
      sourceBackups.set(plan.source, await readFile(plan.source));

      if (plan.action === "delete") {
        await unlink(plan.source);
        deleted += 1;
        continue;
      }
      if (plan.action === "blocked") continue;

      if (plan.targetState === "new") {
        await writeFile(plan.target, plan.output, { flag: "wx" });
        createdTargets.push(plan.target);
        converted += 1;
      }

      const referencesByFile = new Map();
      for (const reference of plan.references) {
        const fileReferences = referencesByFile.get(reference.trackedFile) ?? [];
        fileReferences.push(reference);
        referencesByFile.set(reference.trackedFile, fileReferences);
      }
      for (const [trackedFile, fileReferences] of referencesByFile) {
        const absoluteFile = path.resolve(rootDir, trackedFile);
        let content = await readFile(absoluteFile, "utf8");
        if (!textBackups.has(absoluteFile)) textBackups.set(absoluteFile, content);
        for (const { reference, replacement } of fileReferences) {
          const replaced = replaceReference(content, reference, replacement);
          content = replaced.content;
          referencesUpdated += replaced.replacements;
        }
        await writeFile(absoluteFile, content);
      }

      for (const { trackedFile, reference } of plan.references) {
        const content = await readFile(path.resolve(rootDir, trackedFile), "utf8");
        if (content.includes(reference)) {
          throw new Error(
            `Refusing to delete ${relativePath(rootDir, plan.source)}; old reference remains`
          );
        }
      }

      await unlink(plan.source);
      deleted += 1;
    }
  } catch (error) {
    const rollbackResults = await Promise.allSettled([
      ...[...textBackups].map(([filePath, content]) => writeFile(filePath, content)),
      ...[...sourceBackups].map(([filePath, content]) => writeFile(filePath, content)),
      ...createdTargets.map((filePath) => unlink(filePath)),
    ]);
    const rollbackErrors = rollbackResults
      .filter((result) => result.status === "rejected")
      .map((result) => result.reason);
    if (rollbackErrors.length) {
      throw new AggregateError([error, ...rollbackErrors], "Image migration and rollback failed");
    }
    throw error;
  }

  return { converted, deleted, planned: plans.length, referencesUpdated };
}

async function main() {
  const args = process.argv.slice(2);
  const unknownArgs = args.filter((arg) => arg !== "--write");
  if (unknownArgs.length) {
    throw new Error(`Unknown argument(s): ${unknownArgs.join(", ")}`);
  }

  const result = await compressImages({ write: args.includes("--write") });
  console.log(
    `Done: ${result.planned} planned, ${result.converted} converted, ${result.deleted} deleted, ${result.referencesUpdated} references updated`
  );
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
