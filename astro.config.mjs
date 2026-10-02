// @ts-check
import { readdirSync } from "node:fs";
import { defineConfig, fontProviders } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import rehypeExternalLinks from "rehype-external-links";

/** @type {import('rehype-external-links').Options} */
const externalLinks = { target: "_blank", rel: ["noopener"] };

/* /writing/ is built but not linked until the first post exists; keep it out
   of the sitemap until then too. */
const hasPosts = readdirSync("./src/content/writing").some((f) =>
	/\.mdx?$/.test(f),
);

export default defineConfig({
	site: "https://horatiu-portfolio.vercel.app",
	/* Both faces are cut to the site's glyphs and weights by
	   scripts/build-fonts.sh. `swap` is only safe because Base.astro holds the
	   page until they load.

	   `fallbacks` must end in system-ui: Astro builds its metric-matched
	   fallback faces from the last generic name, and sans-serif maps only to
	   Arial, which no phone has. */
	fonts: [
		{
			provider: fontProviders.local(),
			name: "Inter",
			cssVariable: "--font-inter",
			fallbacks: ["system-ui"],
			display: "swap",
			options: {
				variants: [
					{
						weight: "400 600",
						style: "normal",
						src: ["./src/assets/fonts/inter-subset.woff2"],
					},
				],
			},
		},
		/* Draws the arrows and the epigraph's ῶ, which Inter has no glyphs for. */
		{
			provider: fontProviders.local(),
			name: "Meslo LGM DZ",
			cssVariable: "--font-meslo",
			fallbacks: ["ui-monospace", "monospace"],
			display: "swap",
			options: {
				variants: [
					{
						weight: 400,
						style: "normal",
						src: ["./src/assets/fonts/meslo-lgmdz-mono-subset.woff2"],
					},
				],
			},
		},
	],
	// MDX inherits markdown.processor below, external links included.
	integrations: [
		mdx(),
		sitemap({
			filter: (page) => hasPosts || !new URL(page).pathname.startsWith("/writing/"),
		}),
	],
	markdown: {
		processor: unified({
			rehypePlugins: [[rehypeExternalLinks, externalLinks]],
		}),
		shikiConfig: {
			themes: {
				light: "vitesse-light",
				dark: "vitesse-dark",
			},
			defaultColor: false,
		},
	},
});
