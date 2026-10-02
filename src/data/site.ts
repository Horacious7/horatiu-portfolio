/* Site metadata, links, and the copy most likely to change. */

/* `newTab` forces target=_blank for same-origin links the http check misses —
   the CV opens in its own tab so it doesn't navigate away from the page. */
type SiteLink = { label: string; href: string; newTab?: boolean };

/* Flip this on once the English CV exists. */
const showCV = false;

export const site = {
	name: "Horațiu-Gabriel Maier",
	/* The free Vercel URL until maierhoratiu.dev is registered. Change it here
	   and in astro.config.mjs. */
	url: "https://horatiu-portfolio.vercel.app",
	role: "Data engineer",
	description:
		"Horațiu-Gabriel Maier is a data engineer in Cluj-Napoca, Romania, building data pipelines, full-stack products, and the tooling around them.",
	openToWork: true,
	xHandle: "horacious7",
	links: [
		{ label: "X", href: "https://x.com/horacious7" },
		{ label: "GitHub", href: "https://github.com/Horacious7" },
		{
			label: "LinkedIn",
			href: "https://www.linkedin.com/in/hora%C8%9Biu-gabriel-maier-514417313/",
		},
		{ label: "Email", href: "mailto:maierhoratiu7@gmail.com" },
		...(showCV
			? [{ label: "CV", href: "/Horatiu-Gabriel-Maier-CV.pdf", newTab: true }]
			: []),
	] satisfies SiteLink[],
	/* The only wording about current and past employers on the site. The owner
	   approves it word for word; nothing else about Porsche Engineering goes
	   anywhere else. */
	work: [
		"I'm a data engineer at Porsche Engineering in Cluj, working on data and automation. I build Databricks and PySpark pipelines and small dashboards, and Power Platform apps and flows, including AI models trained and deployed from the platform. I've automated parts of my team's workflow with GitHub Copilot, including an MCP server I wrote. I also work directly with clients on technical consulting and represent Romania in the company's student organisation.",
		"Before that I was a Deployment Lead at SAP Romania (Feb–Aug 2025), delivering SAP Ariba Sourcing implementations, with Groovy scripting in SAP Cloud Integration, for a team spread across four countries.",
	],
};
