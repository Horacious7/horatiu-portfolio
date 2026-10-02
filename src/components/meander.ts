/* The rail's meander: one smooth curve drifting left-right through every
   entry's dot. Shared by Rail.astro's server render (seeded, so builds are
   stable) and its client script (Math.random, re-rolled on section entry). */

const px = (v: number) => Math.round(v * 10) / 10;

/* Catmull-Rom through the points, so the curve stays tangent-smooth at
   every dot without hand-tuned control points. */
function curveD(pts: [number, number][]): string {
	if (pts.length < 2) return "";
	let d = `M${px(pts[0][0])} ${px(pts[0][1])}`;
	for (let i = 1; i < pts.length; i++) {
		const p0 = pts[Math.max(0, i - 2)];
		const p1 = pts[i - 1];
		const p2 = pts[i];
		const p3 = pts[Math.min(pts.length - 1, i + 1)];
		d +=
			`C${px(p1[0] + (p2[0] - p0[0]) / 6)} ${px(p1[1] + (p2[1] - p0[1]) / 6)} ` +
			`${px(p2[0] - (p3[0] - p1[0]) / 6)} ${px(p2[1] - (p3[1] - p1[1]) / 6)} ` +
			`${px(p2[0])} ${px(p2[1])}`;
	}
	return d;
}

/* Dots alternate between a left and a right window (≥5px apart) so the
   drift reads as a wander, never a straight run or a hug of one edge. The
   curve leads in from below the first header and tails out just past the
   last dot, both near the band's center. */
export function meander(ys: number[], y0: number, rand: () => number) {
	const flip = rand() < 0.5 ? 0 : 1;
	const xs = ys.map((_, i) =>
		px(i % 2 === flip ? 8 + rand() * 4 : 17 + rand() * 3),
	);
	const edge = () => px(11 + rand() * 6);
	const last = ys[ys.length - 1] ?? y0;
	const pts: [number, number][] = [
		[edge(), y0],
		...ys.map((y, i): [number, number] => [xs[i], y]),
		[edge(), last + 12],
	];
	return { xs, d: curveD(pts) };
}

/* Fixed-seed generator for the server render — deterministic, so the no-JS
   curve is identical on every build. */
export function seeded(seed = 7): () => number {
	let s = seed >>> 0;
	return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32;
}
