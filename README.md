# Personal site

A personal site with three pages, styled after NMR spectroscopy. It is plain HTML, CSS and
JavaScript, with no build step and no dependencies, so it runs as-is on GitHub Pages.

- **Home** (`index.html`): your name over a scroll-driven FID → spectrum, an About section, and links.
- **Publications** (`publications.html`): a map of every paper by date and research theme, drawn like a
  2D NMR spectrum, a panel showing the selected paper, and the full list, CV style, newest first.
- **Code** (`code.html`): coding projects, each with the context behind it and a GitHub link if public.

## Run it locally

From this folder:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Refresh the page after each edit.

## Edit your content

| What | Where |
| --- | --- |
| Papers | `data/publications.js` (the field list is at the top of the file); each paper's `theme` sets its row on the map, and `PUB_THEMES` lists the rows |
| Coding projects (Code page and the strip on Home) | `data/code.js`; add a `github` link for public ones |
| About text and profile links | the hero section of `index.html` |
| Your photo (in the About text) | `assets/profile.jpg` (square, face centred) |
| Home hero: signal strip height, and how long the first screen holds | `--band-h` and `--hold` in `css/style.css` |
| Home hero: how long the finished spectrum stays before the page moves on | `REST` at the top of `js/hero.js` (the last fifth of `--hold`) |
| Home hero: the spectra (and adding your own) | `data/spectra.js`. Each visit shows the next one from `SPECTRUM_ROTATION`, in a shuffled order; list just one to always show it. Preview any with `index.html?spectrum=caffeine` |
| Home hero: phase correction and hover readout | `PHASE` and `HOVER` at the top of `js/hero.js` (both on) |
| Home hero: line strength behind your name | `--signal-alpha` in `css/style.css` |
| Page titles: size, and height below the menu bar (Publications and Code match your name on Home) | `--title-size` and `--title-top` in `css/style.css` |
| Name in the header and footer | `index.html`, `publications.html`, `code.html` |
| Colours and fonts | the variables at the top of `css/style.css` |
| Figures for papers | images and videos in `assets/pubs/`, your own animations in `anims/` (see `anims/README.md`); then reference them from `data/publications.js` |

### A figure for each paper

Each paper can have one `media` entry:

```js
media: { type: "image", src: "assets/pubs/my-figure.png", alt: "What it shows" }
media: { type: "video", src: "assets/pubs/my-movie.mp4" }        // plays muted on a loop
media: { type: "animation", name: "precession" }                  // a canvas animation: built in, or yours in anims/
media: { type: "embed", src: "https://..." }                      // an iframe, e.g. a Mol* viewer
```

The built-in animations are `precession`, `rotor`, `contour` and `pulse`, all in `js/anim.js`.
Your own go in `anims/<name>.js`, one per paper, and load when that paper is shown. Start from
`anims/template.js`. `anims/README.md` has the full brief (sizes, colours, style) and a prompt
for starting a new one, and `anims/preview.html?name=<name>` shows one at every size in light
and dark. Animations only run while they are on screen, and they hold still for visitors who
have asked their system to reduce motion.

## Put it on GitHub Pages

The site goes live at `https://jtolchard.github.io`, from a public repository with exactly that name.

1. On GitHub, create a new repository at <https://github.com/new>. Name it `jtolchard.github.io`,
   make it **Public**, and leave "Add a README", `.gitignore` and licence off, so it starts empty.
2. From this folder, push the site to it:

   ```bash
   git init -b main
   git add .
   git commit -m "First version of my site"
   git remote add origin git@github.com:jtolchard/jtolchard.github.io.git
   git push -u origin main
   ```

3. In the repository, open **Settings → Pages**. Under "Build and deployment", the source should be
   **Deploy from a branch**, with `main` and `/ (root)`. Set it if it isn't.
4. After a minute or two (the repository's **Actions** tab shows progress), the site is live at
   <https://jtolchard.github.io>.

### Updating it later

```bash
git add .
git commit -m "What changed"
git push
```

Each push goes live within a minute or two. Browsers keep old copies, so reload with Cmd+Shift+R.

`.nojekyll` tells GitHub to serve the files exactly as they are, without its Jekyll processing.
`.gitignore` keeps Claude's preview settings (`.claude/`) and macOS `.DS_Store` files out of the
repository.

A GitHub Pages site is always public, even when it's built from a private repository (that needs
GitHub Pro). Only GitHub Enterprise Cloud organisations can restrict who sees one. To show a
work-in-progress version to only a few people, host it on Cloudflare Pages behind Cloudflare
Access (an email-code login, free for small groups) until it's ready, then publish here.

## Files

```
index.html  publications.html  code.html
css/style.css          all styling
js/nmr.js              the FFT behind the home page spectrum
js/plot.js             colours and canvas helpers
js/anim.js             animations for paper figures
js/publications.js     the publications page: detail panel and full list
js/pubmap.js           the publications map (2D contours, or stacked traces on phones)
js/hero.js             home page hero: scroll-driven FID → spectrum
js/code.js             code page
js/latest.js           home page: your newest paper and the project strip
data/                  your content: publications, projects, home-page spectra
anims/                 your own paper animations, their brief, a template and a preview page
assets/                favicon, your photo, and figures for papers (assets/pubs/)
.nojekyll  .gitignore  GitHub Pages and git settings (see above)
```
