import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');

const ctx = await esbuild.context({
  entryPoints: ['src/ts/main.ts'],
  outdir: 'theme/dist',
  bundle: true,
  format: 'esm',
  target: 'es2022',
  platform: 'browser',
  minify: !watch,
  sourcemap: watch,
  logLevel: 'info',
});

if (watch) await ctx.watch();
else {
  await ctx.rebuild();
  await ctx.dispose();
}
