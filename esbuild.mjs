import esbuild from 'esbuild'
import fs from 'fs'

await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outdir: 'dist',
    platform: 'node',
  // eslint-disable-next-line no-undef
  minify: (process.env.ESBUILD_MINIFY ?? '') !== '',
})

for (const bot of fs.readdirSync('src/bots')) {
    await esbuild.build({
        entryPoints: ['src/bots/' + bot + '/**/*.ts'],
        outdir: 'dist/bots/' + bot,
        // eslint-disable-next-line no-undef
        minify: (process.env.ESBUILD_MINIFY ?? '') !== '',
      })
}