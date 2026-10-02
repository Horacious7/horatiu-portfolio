import { getCollection } from "astro:content";
import { projectGroups } from "../content.config";

export async function getProjects() {
	return (
		await getCollection("projects", ({ data }) =>
			import.meta.env.PROD ? data.draft !== true : true,
		)
	).sort(
		(a, b) =>
			projectGroups.indexOf(a.data.group) -
				projectGroups.indexOf(b.data.group) ||
			a.data.order - b.data.order ||
			a.data.title.localeCompare(b.data.title, "en"),
	);
}

export const projectPath = (id: string) => `/projects/${id}/`;

/* The rail's shape: groups in schema order, empty ones dropped. */
export async function getProjectRail() {
	const projects = await getProjects();
	return projectGroups
		.map((group) => ({
			name: group,
			items: projects
				.filter((p) => p.data.group === group)
				.map((p) => ({
					href: projectPath(p.id),
					title: p.data.title,
				})),
		}))
		.filter((g) => g.items.length > 0);
}
