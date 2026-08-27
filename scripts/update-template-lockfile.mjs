#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const templateDir = resolve(root, "template");
const templatePkgPath = resolve(templateDir, "package.json");

const rootPkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const pnpmVer = String(rootPkg.packageManager).replace(/^pnpm@/, "");
const nodeVer = String(rootPkg.engines.node).match(/[\d.]+/)?.[0] ?? "";

const slug = "template";
const description = "template";

const original = readFileSync(templatePkgPath, "utf8");
const substituted = original
  .split("__PNPM_VERSION__").join(pnpmVer)
  .split("__NODE_VERSION__").join(nodeVer)
  .split("__PROJECT_SLUG__").join(slug)
  .split("__PROJECT_DESCRIPTION__").join(description);

try {
  writeFileSync(templatePkgPath, substituted);
  execSync("pnpm install --ignore-scripts", { cwd: templateDir, stdio: "inherit" });
} finally {
  // Always restore the placeholder template manifest so the repo never stores concrete values.
  writeFileSync(templatePkgPath, original);
}

console.log(
  `template/pnpm-lock.yaml regenerated (pnpm@${pnpmVer}, node ${nodeVer}); template/package.json placeholders restored.`
);
