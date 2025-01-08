import esbuild from "esbuild";
import fs from "fs";
import { basename } from "path";

await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outdir: "dist",
  keepNames: true,
  platform: "node",
  format: "cjs",
  // eslint-disable-next-line no-undef
  minify: (process.env.ESBUILD_MINIFY ?? "") !== "",
});

for (const bot of fs.readdirSync("src/bots")) {
  await esbuild.build({
    entryPoints: ["src/bots/" + bot + "/**/*.ts"],
    outdir: "dist/bots/" + bot,
    keepNames: true,
    platform: "node",
    format: "cjs",
    // eslint-disable-next-line no-undef
    minify: (process.env.ESBUILD_MINIFY ?? "") !== "",
  });
  for (const file of fs.globSync("src/bots/" + bot + "/**/*.{json,yaml,yml}")) {
    fs.copyFileSync(file, "dist/bots/" + bot + "/" + basename(file));
  }
}
