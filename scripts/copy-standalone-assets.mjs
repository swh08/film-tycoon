import { cp, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();

async function copyIfExists(source, target) {
  if (!existsSync(source)) return;
  await mkdir(path.dirname(target), { recursive: true });
  await cp(source, target, { recursive: true, force: true });
}

await copyIfExists(
  path.join(root, ".next", "static"),
  path.join(root, ".next", "standalone", ".next", "static"),
);

await copyIfExists(
  path.join(root, "public"),
  path.join(root, ".next", "standalone", "public"),
);
