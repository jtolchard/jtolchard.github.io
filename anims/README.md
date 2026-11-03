# Paper animations

Each paper on the Publications page has a figure panel. It can show a small looping canvas animation, an image, a video or an embed. Papers without their own figure show a stand-in animation for their theme. This folder holds your own animations, one file per paper.

## Adding one

1. **Make the file.** Copy `anims/template.js` to `anims/<name>.js` and change the name inside `Anim.register("<name>", …)` to match. Use the paper's `id` from `data/publications.js` as the name, e.g. `avr3a11-2025`. Names can use letters, digits, `-` and `_`.
2. **Point the paper at it.** In `data/publications.js`, on that paper:
   ```js
   media: { type: "animation", name: "avr3a11-2025", alt: "One sentence on what the animation shows" }
   ```
3. **Look at it.** Start the local server from the site folder (`python3 -m http.server 8000`), then open:
   - `http://localhost:8000/anims/preview.html?name=avr3a11-2025` shows every size, in light and dark, with a time scrubber.
   - `http://localhost:8000/publications.html#avr3a11-2025` shows it in place.

You don't add any script tags. The page loads `anims/<name>.js` the first time that paper is shown. If the file is missing or throws an error, the panel falls back to the theme's stand-in, and the browser console says why.

## The spec

### Size

The panel is always **4:3**. Its size depends on the screen:

| Screen | Panel (CSS px) |
| --- | --- |
| desktop (wide) | 417 × 312 |
| laptop, 1024 px | 401 × 300 |
| tablet (panel stacks above the text) | up to 660 × 495 |
| phone | 292 × 219 |
| small phone, 320 px | 237 × 177 |

- Design at 417 × 312, and check it at 237 × 177 and 660 × 495.
- Lay everything out from `w` and `h`, never at fixed positions.
- The canvas is already sharp on high-DPI screens, so draw in CSS pixels.
- Keep labels at least 12 px from the edges.

### Colours

Only ever use colours through `th` (e.g. `th.spec`), never as hex values. That way the animation follows light and dark mode, which can change while it's on screen. Read `th` inside the frame function rather than saving its colours when the file loads.

| `th.` | Role | Light | Dark |
| --- | --- | --- | --- |
| `ink` | main lines, outlines, key labels | `#1d2126` | `#e9e7e3` |
| `soft` | secondary text | `#464b53` | `#c2c0bc` |
| `muted` | labels, ticks, dashed guides | `#7b8089` | `#8d939b` |
| `rule` | frames, axis lines | `#e6e2db` | `#2a2f35` |
| `grid` | faint grid lines | `#f0eee9` | `#1c2025` |
| `bg` | the panel behind the animation | `#fdfcfa` | `#111316` |
| `surface` | fills for solid objects (e.g. a rotor body) | `#ffffff` | `#171a1e` |
| `fid` | **blue**: time domain, signals, "before", inputs | `#2563b8` | `#6aa5ff` |
| `spec` | **orange**: frequency domain, results, "after", emphasis | `#d4461a` | `#ff8857` |
| `green` | extra: one object that needs a colour of its own (e.g. a battery). Use sparingly | `#7cb594` | `#5d9c79` |
| `red` | extra: one object that needs a colour of its own (e.g. RF pulses). Use sparingly | `#b8233f` | `#ff6b7f` |
| `mono` | label font: IBM Plex Mono, 12 px | | |

The site's colour language: blue is the time domain and orange is the frequency domain. The home page's FID→spectrum strip fades from one to the other, and you can do the same with a `fid`→`spec` gradient. Use `muted` and `rule` for scaffolding (axes, guides) so that the blue and orange carry the meaning. For transparency use `ctx.globalAlpha`, and reset it to 1 afterwards.

These values mirror `css/style.css`. If you change them there, the site and the preview page follow, and this table goes out of date.

### The function

```js
Anim.register("<name>", function (ctx, w, h, t, th) { … });
Anim.register("<name>", function (ctx, w, h, t, th) { … }, { loop: 7, still: 5.5 });   // optional
```

- **`ctx`** is the 2D canvas context.
- **`w` and `h`** are the panel size in CSS pixels.
- **`t`** is seconds since the paper was shown.
- **`th`** holds the colours above.

How it runs:
- It's called every frame while the panel is on screen, so clear the canvas (`ctx.clearRect(0, 0, w, h)`) and redraw everything each time. Leave the background clear, because the panel colour shows through.
- **Loop** with `t % CYCLE`. About 5–10 s works well, with a short hold on the end state before it restarts. Pass the loop's length as `{ loop: CYCLE }` in the third argument to `Anim.register`: clicking the figure on the Publications page opens it larger, with a scrubber that runs across one loop (and starts again from the left each time it repeats). Without `loop`, the enlarged view has no scrubber.
- **Reduced motion:** visitors who ask for reduced motion see a single still frame at **t = 3.1 s**, so make sure that frame tells the story on its own. If the story takes longer than that to build, pass `{ still: <seconds> }` as a third argument to `Anim.register` to choose a later frame. The preview's still-frame button follows it.
- **Do one-off work once.** Do it at the top of the file (as `template.js` does with its noise), not in the frame function, and keep each frame cheap.
- **Keep it self-contained.** No DOM access, event listeners, timers, libraries or external files.

Helpers:
- `Anim.label(ctx, th, "text", x, y, align, colour)` draws a 12 px mono label, vertically centred. `align` and `colour` are optional; the colour defaults to `th.muted`.
- `Anim.seeded(42)` returns a repeatable random number generator (each call gives 0 … 1). Use it so the "random" parts look the same every visit.

### Style

- **One idea per animation.** It should explain the paper's main point to a scientist from a neighbouring field, in the spirit of setosa.io: calm, clear and explanatory.
- **Lines:** 1–1.6 px for most lines, 2–2.4 px for the one thing that matters.
- **No decoration:** no drop shadows, glows or 3D effects, and no gradients other than `fid`→`spec`.
- **Few labels**, set in 12 px mono. Don't add a title, because the paper's title sits right beside the panel.
- **Motion:** smooth and unhurried. Nothing should flash more than three times a second.
- **Alt text:** give the `media` entry an `alt` that describes what the animation shows, for screen readers.

The built-in examples (`precession`, `rotor`, `contour`, `pulse`) are in `js/anim.js`.

### Images, videos and embeds instead

- **Image:** `{ type: "image", src: "assets/pubs/<name>.png", alt: "…" }`. Make it 4:3 at 1200 × 900 px. SVG, PNG or WebP all work. For other shapes, add `fit: "contain"` to stop cropping.
- **Video:** `{ type: "video", src: "assets/pubs/<name>.mp4", poster: "assets/pubs/<name>.jpg" }`. Use MP4 (H.264) at 4:3, 1200 × 900 or 960 × 720, as a silent seamless loop, ideally under 4 MB, with a poster frame. It plays muted and on loop, and shows controls instead for reduced-motion visitors. A video's background can't follow dark mode, so a canvas animation is preferable when colours matter.
- **Embed:** `{ type: "embed", src: "https://…" }`, e.g. a Mol* viewer of a deposited structure.

## A prompt to start from

Paste this into a new Claude session, filling in the paper details at the bottom. In Claude Code, open it in this site's folder so Claude can read the files and test in the browser. Elsewhere, the prompt carries everything needed.

```text
I'd like a custom animation for one of my papers on my personal website. The site is plain
HTML/CSS/JS with no build step and no libraries. Each paper has a figure panel that can show a
small looping canvas animation. If you can read my site's files, start with anims/README.md,
anims/template.js and the built-in animations in js/anim.js, and follow them exactly.

Steps
1. Read the paper details below and suggest three concepts for a short looping animation that
   explains its main point to a scientist from a neighbouring field. For each one: a sentence on
   the idea, what moves, and what the still frame (t = 3.1 s) would show. Then wait for me to choose.
2. Build the chosen one as anims/<id>.js, registered as Anim.register("<id>", fn).
3. Hook it up in data/publications.js on that paper:
   media: { type: "animation", name: "<id>", alt: "<one sentence on what it shows>" }
4. Check it in anims/preview.html?name=<id> (light and dark, every size) and on
   publications.html#<id>. If you can't run my site, also give me one standalone HTML test page
   that defines a minimal Anim.register / Anim.label / Anim.seeded and the two colour sets
   below, and shows the animation at 417×312 and 237×177 in light and dark.

Contract
- fn(ctx, w, h, t, th) is called every frame while the panel is on screen. ctx: 2D context;
  w, h: CSS pixels (high-DPI is already handled); t: seconds since shown; th: colours.
  Clear with ctx.clearRect(0, 0, w, h) and redraw everything each frame; leave the background clear.
- Loop with t % CYCLE (5–10 s, with a short hold on the end state). Reduced-motion visitors see
  only the frame at t = 3.1 s, so it must work as a still. (If the story needs longer, pass
  { still: <seconds> } as a third argument to Anim.register to pick a later frame.) Also pass
  { loop: CYCLE } there, so the enlarged view's scrubber knows the loop's length.
- Do one-off work at file load and keep each frame cheap. No DOM, listeners, timers, libraries or
  external files. Helpers: Anim.label(ctx, th, text, x, y, align, colour) for 12px mono labels;
  Anim.seeded(n) for repeatable random numbers.

Size
- Always 4:3: 417×312 on desktop, 292×219 on phones, 237×177 on small phones, up to 660×495 on
  tablets. Lay everything out from w and h; keep labels at least 12px from the edges.

Colours (use only th.<name>, never hex, so it follows light/dark mode; hex given for reference)
  th.ink      main lines, outlines, key labels      light #1d2126   dark #e9e7e3
  th.soft     secondary text                        light #464b53   dark #c2c0bc
  th.muted    labels, ticks, dashed guides          light #7b8089   dark #8d939b
  th.rule     frames, axis lines                    light #e6e2db   dark #2a2f35
  th.grid     faint grid lines                      light #f0eee9   dark #1c2025
  th.bg       panel background (leave clear)        light #fdfcfa   dark #111316
  th.surface  fills for solid objects               light #ffffff   dark #171a1e
  th.fid      BLUE: time domain, signals, before    light #2563b8   dark #6aa5ff
  th.spec     ORANGE: frequency domain, results     light #d4461a   dark #ff8857
  th.green    extra: one object needing its own colour, sparingly  light #7cb594   dark #5d9c79
  th.red      extra: one object needing its own colour, sparingly  light #b8233f   dark #ff6b7f
  th.mono     label font, IBM Plex Mono at 12px
  Blue is the time domain and orange the frequency domain; a fid→spec gradient is the site's
  signature. Scaffolding in muted/rule so blue and orange carry the meaning.

Style
- One idea, explained calmly and clearly (in the spirit of setosa.io/ev). Lines 1–1.6px, 2–2.4px
  for the one thing that matters. No shadows, glows, 3D or other gradients. Few labels, 12px mono,
  no title (the paper title sits beside the panel). Smooth, unhurried motion; nothing flashing.

Paper
- id (from data/publications.js):
- title:
- DOI:
- the one thing I want people to take away:
- (optional) an idea, figure or system I'd like it to show:
```
