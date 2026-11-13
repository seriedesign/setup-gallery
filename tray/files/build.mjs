// Build Tray: esbuild (JS/TS) + sass + esbuild (minify CSS).
// Entrypoints por convenção: qualquer arquivo na raiz de resources/js ou resources/scss
// que não comece com "_" vira um arquivo em theme/js ou theme/css.
// *-critical.scss também vira theme/elements/snippets/<nome>.html com <style> inline.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";
import * as sass from "sass";

const watch = process.argv.includes("--watch");
const SRC = "resources";
const OUT = "theme";
const target = ["es2020", "safari15"]; // piso do Swiper 11 (esbuild não rebaixa destructuring p/ safari14)

const entries = (dir, re) =>
	fs.existsSync(dir)
		? fs
				.readdirSync(dir)
				.filter((f) => re.test(f) && !f.startsWith("_"))
				.map((f) => path.join(dir, f))
		: [];

// No dev, cada rebuild roda o lint da pasta antes; com erro, nada é gerado.
const biome = "node_modules/@biomejs/biome/bin/biome";
const lint = (dir) =>
	spawnSync(process.execPath, [biome, "lint", dir], { stdio: "inherit" })
		.status === 0;

// ---------- JS / TS ----------
const jsOptions = {
	entryPoints: entries(`${SRC}/js`, /\.(js|ts)$/),
	outdir: `${OUT}/js`,
	bundle: true,
	minify: !watch,
	sourcemap: watch ? "inline" : false,
	format: "iife",
	target,
	legalComments: "none",
	logLevel: "info",
	// CSS importado dentro do JS (ex.: swiper/css) sai como theme/js/<nome>.css
	loader: { ".woff2": "file", ".png": "file", ".svg": "file" },
};

// Grava só se o conteúdo mudou: o `tray watch` sobe todo arquivo com data nova.
const writeIfChanged = (file, data) => {
	if (fs.existsSync(file) && fs.readFileSync(file, "utf8") === data) return;
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, data);
};

// ---------- CSS / SCSS ----------
// Entrada → arquivos que o Sass carregou nela (ela mesma e os parciais importados).
const cssDeps = new Map();

async function buildCss(file) {
	const name = path.basename(file).replace(/\.s?css$/, "");
	const t = Date.now();
	try {
		const { css, loadedUrls } = await sass.compileAsync(file, {
			loadPaths: ["node_modules"],
			style: "expanded",
		});
		cssDeps.set(
			path.resolve(file),
			new Set(
				loadedUrls
					.filter((u) => u.protocol === "file:")
					.map((u) => fileURLToPath(u)),
			),
		);
		const out = await esbuild.transform(css, {
			loader: "css",
			minify: !watch,
			target,
		});
		writeIfChanged(`${OUT}/css/${name}.css`, out.code);
		if (name.endsWith("-critical")) {
			writeIfChanged(
				`${OUT}/elements/snippets/${name}.html`,
				`<style id="style-${name}">${out.code}</style>\n`,
			);
		}
		console.log(`  css  ${name}.css  ${Date.now() - t}ms`);
	} catch (e) {
		console.error(`  css  ${name}: ${e.message}`);
		if (!watch) process.exitCode = 1;
	}
}
const cssEntries = () => entries(`${SRC}/scss`, /\.s?css$/);
const buildAllCss = () => Promise.all(cssEntries().map(buildCss));

if (watch) {
	const lintPlugin = {
		name: "lint",
		setup(b) {
			b.onStart(() =>
				lint(`${SRC}/js`) ? undefined : { errors: [{ text: "lint falhou" }] },
			);
		},
	};
	const ctx = await esbuild.context({ ...jsOptions, plugins: [lintPlugin] });
	await ctx.watch();
	if (lint(`${SRC}/scss`)) await buildAllCss();
	else console.error("  css  lint falhou, nada gerado");
	// Só as entradas que carregaram algum arquivo alterado (ou a própria entrada, se é nova).
	const affected = (changed) =>
		cssEntries().filter((e) => {
			const deps = cssDeps.get(path.resolve(e));
			return (
				!deps || [...changed].some((f) => f === path.resolve(e) || deps.has(f))
			);
		});
	let timer;
	const changed = new Set();
	fs.watch(`${SRC}/scss`, { recursive: true }, (_, filename) => {
		if (filename) changed.add(path.resolve(SRC, "scss", filename));
		clearTimeout(timer);
		timer = setTimeout(() => {
			const lote = affected(changed);
			changed.clear();
			if (!lote.length) return;
			if (lint(`${SRC}/scss`)) Promise.all(lote.map(buildCss));
			else console.error("  css  lint falhou, nada gerado");
		}, 50);
	});
	console.log("watching...");
} else {
	await Promise.all([esbuild.build(jsOptions), buildAllCss()]);
}
