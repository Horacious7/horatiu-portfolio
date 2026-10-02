# Project screenshots and recordings

Drop screenshots in here, then point the project's frontmatter at them.

Every entry under `shots:` in `src/content/projects/*.mdx` renders a placeholder
frame until it has a `src`. To use a real image, add the file here and fill it
in — the path is relative to the `.mdx` file:

```yaml
shots:
  - src: ../../assets/projects/atlas-search.png
    alt: The answer panel, with a citation open beside the source PDF.
    caption: Asking a question, with the answer cited back to the source page.
```

- `src` is resolved at build time, so a typo fails the build instead of quietly
  serving a 404. Astro reads the real dimensions and writes them onto the tag,
  which is what keeps the page from jumping as each screenshot loads, and it
  re-encodes to webp at a few widths — drop the full-resolution file in and
  don't hand-optimize it.
- `alt` describes the image for screen readers and is worth writing properly.
  Without it the `caption` is used, which is usually the wrong thing to say twice.
- `caption` is always shown under the frame.

The first shot in the list is the cover and sits directly under the title, so it
loads first. Nothing is lazy-loaded: the page holds until every image and video
poster has decoded, then fades in whole, however large the files are.

These live in `src/` rather than `public/` because only files Astro resolves get
dimensions and optimization; anything in `public/` is copied out verbatim.

Placeholders are sized 16:10. Any ratio works and none of them shift the page,
but frames that all share a ratio look considerably calmer stacked up than ones
that don't.

## Light and dark

Media with a theme of its own, like a terminal recording or a chart, can come
in both. `src` (and `video`) are the light versions; add the dark ones beside
them:

```yaml
shots:
  - src: ../../assets/projects/pq-boringtun-benchmarks.png
    srcDark: ../../assets/projects/pq-boringtun-benchmarks-dark.png
    caption: What it costs, measured on a laptop and an edge device.
```

The browser picks by `prefers-color-scheme` and downloads only the one it
shows, and switches if the system theme changes. A recording takes `videoDark`
alongside `srcDark`, its dark poster. Screenshots of an app are what they are;
leave those single.

## Recordings

A shot can be a video instead. Put the `.mp4` here next to a still of its first
frame, and give the shot both:

```yaml
shots:
  - src: ../../assets/projects/ukiyo-editing.png
    video: ../../assets/projects/ukiyo-editing.mp4
    alt: What happens in the recording, for screen readers.
    caption: Editing a file, then opening another from the explorer.
```

- `src` becomes the poster, and still supplies the frame's dimensions. A shot
  with a `video` and no `src` fails the build.
- The video is matched by file name and emitted under a content hash in
  `/_astro/`, so it's cached like every other asset. A missing file fails the
  build too.
- It preloads with the page, then plays muted and looped while it's on screen
  and pauses when it scrolls away. Under reduced motion nothing starts on its
  own; the play button does.
- Unlike images, videos aren't re-encoded. Encode them before dropping them in:
  H.264 in an `.mp4` (the one format every browser plays), no audio track, and
  the index at the front so playback starts before the download finishes:

  ```sh
  ffmpeg -i in.mov -vf fps=30 -c:v libx264 -preset veryslow -crf 24 \
    -pix_fmt yuv420p -movflags +faststart -an out.mp4
  ```

  Terminal recordings compress to almost nothing; anything photographic wants
  a higher `-crf` (28–30) to stay around a couple of megabytes.
