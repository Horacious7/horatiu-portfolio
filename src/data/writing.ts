import { getCollection } from "astro:content";

export async function getPosts() {
	return (
		await getCollection("writing", ({ data }) =>
			import.meta.env.PROD ? data.draft !== true : true,
		)
	).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const postPath = (id: string) => `/writing/${id}/`;

export const postDateFmt = new Intl.DateTimeFormat("en", {
	month: "long",
	day: "numeric",
	year: "numeric",
});

/* The rail's shape: posts under the year they were published, newest first.
   Posts are already sorted by date, so the years come out ordered too. */
export async function getWritingRail() {
	const posts = await getPosts();
	const groups: {
		name: string;
		items: { href: string; title: string }[];
	}[] = [];
	for (const post of posts) {
		const name = String(post.data.date.getFullYear());
		if (groups.at(-1)?.name !== name) groups.push({ name, items: [] });
		groups.at(-1)?.items.push({
			href: postPath(post.id),
			title: post.data.title,
		});
	}
	return groups;
}
