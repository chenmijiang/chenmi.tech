import { execFile } from "node:child_process";
import { chmod, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import sharp from "sharp";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const scriptPath = path.resolve("scripts/compress-images.mjs");

async function createRepository() {
  const rootDir = await mkdtemp(path.join(tmpdir(), "compress-images-"));
  await mkdir(path.join(rootDir, "public", "assets", "img"), { recursive: true });
  await mkdir(path.join(rootDir, "src", "content"), { recursive: true });
  await execFileAsync("git", ["init", "--quiet"], { cwd: rootDir });
  return rootDir;
}

async function createPng(filePath: string, width = 64, height = 32) {
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 20, g: 100, b: 180, alpha: 0.5 },
    },
  })
    .png()
    .toFile(filePath);
}

async function track(rootDir: string, ...files: string[]) {
  await execFileAsync("git", ["add", "--", ...files], { cwd: rootDir });
}

async function runScript(rootDir: string, write = false) {
  return execFileAsync("node", [scriptPath, ...(write ? ["--write"] : [])], {
    cwd: rootDir,
    encoding: "utf8",
  });
}

describe("image compression", () => {
  it("reports work without changing files by default", async () => {
    const rootDir = await createRepository();
    const source = path.join(rootDir, "public/assets/img/photo.png");
    const post = path.join(rootDir, "src/content/post.md");
    await createPng(source);
    await writeFile(post, "![Photo](/assets/img/photo.png)\n");
    await track(rootDir, "public/assets/img/photo.png", "src/content/post.md");

    const { stdout } = await runScript(rootDir);

    expect(stdout).toContain("DRY-RUN convert: public/assets/img/photo.png");
    await expect(readFile(source)).resolves.toBeInstanceOf(Buffer);
    await expect(readFile(path.join(rootDir, "public/assets/img/photo.webp"))).rejects.toThrow();
    await expect(readFile(post, "utf8")).resolves.toBe("![Photo](/assets/img/photo.png)\n");
  });

  it("converts referenced images, limits their longest edge, and updates references", async () => {
    const rootDir = await createRepository();
    const source = path.join(rootDir, "public/assets/img/wide.jpg");
    const target = path.join(rootDir, "public/assets/img/wide.webp");
    const post = path.join(rootDir, "src/content/post.md");
    await createPng(source, 2400, 1200);
    await writeFile(post, '<img src="/assets/img/wide.jpg?version=1" alt="Wide">\n');
    await track(rootDir, "public/assets/img/wide.jpg", "src/content/post.md");

    const { stdout } = await runScript(rootDir, true);
    const metadata = await sharp(target).metadata();

    expect(stdout).toContain("Done: 1 planned, 1 converted, 1 deleted, 1 references updated");
    expect(metadata).toMatchObject({ format: "webp", width: 1600, height: 800 });
    await expect(readFile(source)).rejects.toThrow();
    await expect(readFile(post, "utf8")).resolves.toContain("/assets/img/wide.webp?version=1");
  });

  it("updates encoded references with spaces and parentheses in tracked TSX files", async () => {
    const rootDir = await createRepository();
    const source = path.join(rootDir, "public/assets/img/hash # (photo).png");
    const target = path.join(rootDir, "public/assets/img/hash # (photo).webp");
    const component = path.join(rootDir, "src/content/image.tsx");
    await createPng(source);
    await writeFile(component, 'export const image = "/assets/img/hash%20%23%20(photo).png";\n');
    await track(rootDir, "public/assets/img/hash # (photo).png", "src/content/image.tsx");

    await runScript(rootDir, true);

    await expect(readFile(source)).rejects.toThrow();
    await expect(readFile(target)).resolves.toBeInstanceOf(Buffer);
    await expect(readFile(component, "utf8")).resolves.toContain("hash%20%23%20(photo).webp");
  });

  it("deletes unreferenced source images without creating replacements", async () => {
    const rootDir = await createRepository();
    const source = path.join(rootDir, "public/assets/img/unused.png");
    const target = path.join(rootDir, "public/assets/img/unused.webp");
    await createPng(source);
    await track(rootDir, "public/assets/img/unused.png");

    const { stdout } = await runScript(rootDir, true);

    expect(stdout).toContain("WRITE delete unused: public/assets/img/unused.png");
    await expect(readFile(source)).rejects.toThrow();
    await expect(readFile(target)).rejects.toThrow();
  });

  it("rolls back earlier migrations when a later write fails", async () => {
    const rootDir = await createRepository();
    const firstSource = path.join(rootDir, "public/assets/img/a.png");
    const firstTarget = path.join(rootDir, "public/assets/img/a.webp");
    const secondSource = path.join(rootDir, "public/assets/img/b.png");
    const firstPost = path.join(rootDir, "src/content/a.md");
    const secondPost = path.join(rootDir, "src/content/b.md");
    await createPng(firstSource);
    await createPng(secondSource);
    await writeFile(firstPost, "![A](/assets/img/a.png)\n");
    await writeFile(secondPost, "![B](/assets/img/b.png)\n");
    await track(
      rootDir,
      "public/assets/img/a.png",
      "public/assets/img/b.png",
      "src/content/a.md",
      "src/content/b.md"
    );
    await chmod(secondPost, 0o444);

    try {
      await expect(runScript(rootDir, true)).rejects.toBeDefined();
    } finally {
      await chmod(secondPost, 0o644);
    }

    await expect(readFile(firstSource)).resolves.toBeInstanceOf(Buffer);
    await expect(readFile(secondSource)).resolves.toBeInstanceOf(Buffer);
    await expect(readFile(firstTarget)).rejects.toThrow();
    await expect(readFile(firstPost, "utf8")).resolves.toContain("a.png");
    await expect(readFile(secondPost, "utf8")).resolves.toContain("b.png");
  });

  it("does not change files when a target WebP has different content", async () => {
    const rootDir = await createRepository();
    const source = path.join(rootDir, "public/assets/img/photo.png");
    const target = path.join(rootDir, "public/assets/img/photo.webp");
    const post = path.join(rootDir, "src/content/post.md");
    await createPng(source);
    await sharp({
      create: {
        width: 10,
        height: 10,
        channels: 3,
        background: "red",
      },
    })
      .webp()
      .toFile(target);
    await writeFile(post, "![Photo](/assets/img/photo.png)\n");
    await track(
      rootDir,
      "public/assets/img/photo.png",
      "public/assets/img/photo.webp",
      "src/content/post.md"
    );

    await expect(runScript(rootDir, true)).rejects.toMatchObject({
      stderr: expect.stringContaining("already exists with different content"),
    });
    await expect(readFile(source)).resolves.toBeInstanceOf(Buffer);
    await expect(readFile(post, "utf8")).resolves.toContain("photo.png");
  });

  it("does not delete an image when conversion fails", async () => {
    const rootDir = await createRepository();
    const source = path.join(rootDir, "public/assets/img/broken.png");
    const post = path.join(rootDir, "src/content/post.md");
    await writeFile(source, "not an image");
    await writeFile(post, "![Broken](/assets/img/broken.png)\n");
    await track(rootDir, "public/assets/img/broken.png", "src/content/post.md");

    await expect(runScript(rootDir, true)).rejects.toBeDefined();
    await expect(readFile(source, "utf8")).resolves.toBe("not an image");
    await expect(readFile(post, "utf8")).resolves.toContain("broken.png");
  });
});
