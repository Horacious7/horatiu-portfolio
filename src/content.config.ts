import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const writing = defineCollection({
	loader: glob({ base: "./src/content/writing", pattern: "**/*.{md,mdx}" }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(),
		draft: z.boolean().optional(),
	}),
});

/* The rail's groups, ordered as listed here. */
export const projectGroups = ["Products", "Research"] as const;

const projects = defineCollection({
	loader: glob({ base: "./src/content/projects", pattern: "**/*.{md,mdx}" }),
	/* `image()` needs the schema as a function. It resolves each `src` at build
	   time, giving Shot the real dimensions and turning a bad path into a build
	   error rather than a 404. */
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			/* One line: the meta description, and the rail's sub-label. */
			description: z.string(),
			group: z.enum(projectGroups),
			/* Rank within the group; ties fall back to title. */
			order: z.number(),
			years: z.string(),
			role: z.string(),
			status: z.string(),
			tech: z.string(),
			/* `newTab` opens a same-origin link in its own tab, the way the CV
			   does, for files like a paper; external links always do. */
			links: z
				.array(
					z.object({
						label: z.string(),
						href: z.string(),
						newTab: z.boolean().optional(),
					}),
				)
				.optional(),
			features: z.array(z.object({ title: z.string(), body: z.string() })),
			/* Omit `src` and a placeholder frame renders in its place. With a
			   `video` (an .mp4 in src/assets/projects/), `src` is its poster and
			   still supplies the frame's dimensions. `srcDark` and `videoDark`
			   are the same shot drawn for dark mode. */
			shots: z
				.array(
					z
						.object({
							src: image().optional(),
							srcDark: image().optional(),
							video: z.string().optional(),
							videoDark: z.string().optional(),
							alt: z.string().optional(),
							caption: z.string(),
						})
						.refine((s) => !s.video || s.src, {
							message: "A shot with a `video` needs a `src` for its poster.",
						})
						.refine((s) => !s.srcDark || s.src, {
							message: "A shot with a `srcDark` needs a `src` for light mode.",
						})
						.refine((s) => !s.videoDark || (s.video && s.srcDark), {
							message:
								"A shot with a `videoDark` needs a `video` and a `srcDark` poster.",
						}),
				)
				.optional(),
			featured: z.boolean().optional(),
			draft: z.boolean().optional(),
		}),
});

export const collections = { writing, projects };
