import type { APIContext } from "astro";
import { feed } from "../data/feed";

export const GET = (context: APIContext) => feed(context);
