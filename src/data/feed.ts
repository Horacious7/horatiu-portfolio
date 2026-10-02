import rss from "@astrojs/rss";
import { site } from "./site";
import { getPosts, postPath } from "./writing";

export async function feed(context: { site?: URL | undefined }) {
	/* getPosts only hides drafts in a production build; a feed should never
	   carry them. */
	const posts = (await getPosts()).filter((post) => !post.data.draft);

	return rss({
		title: site.name,
		description: site.description,
		site: context.site!,
		customData: "<language>en</language>",
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.date,
			link: postPath(post.id),
		})),
	});
}
