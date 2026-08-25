# Scanned Dictionary Browser #

This is a webpage that shows a given page of a scanned dictionary. It can
hold several dictionaries at once, switchable from a dropdown in the
topbar, and remembers per-dictionary state (which one you had open, its
page, its zoom level) across reloads.

## Usage ##

You need to:

- supply images of the dictionary pages
- write a configuration script under `scripts/`, such as
  `scripts/PL_RU_Gassen.js`, such that it
    - sets the (browser tab) title
    - implements a function that compares two words in the dictionary's language
    - contains a list of every page's first word
    - points `images`/`image_extension`/`start_page` at your scanned pages
- add an entry for it to `scripts/manifest.js` - `index.html` and
  `mobile.html` never need editing

## Examples ##

Configured in `scripts/manifest.js` and included in the dropdown:

- `scripts/PL_RU_Gassen.js` - Polish-Russian dictionary
- `scripts/PL_RU_Rozadovskaia.js` - Polish-Russian dictionary
- `scripts/RU_PL_Dvoretskyi.js` - Russian-Polish dictionary

Templates, not wired into the manifest, live under `scripts/Exapmle/` and
have only a handful of placeholder headwords and no scanned pages - they
exist to show how little code is needed for a given script/language, see
below:

- `scripts/Exapmle/hindi.js` - R.S. McGregor's Oxford Hindi-English Dictionary
- `scripts/Exapmle/arabic.js` - Hans Wehr's Arabic-English Dictionary
- `scripts/Exapmle/thai.js` - Mary Haas' Thai-English Dictionary
- `scripts/Exapmle/persian.js` - Aryanpur Concise Persian-English dictionary
- `scripts/Exapmle/english.js`, `polish.js`, `ukrainian.js`, `russian.js`,
  `german.js`, `spanish.js` - plain alphabetic language templates

Note that you still need the scanned data, this project only contains the index.

## Adding a dictionary ##

1. Drop a config script in `scripts/` (copy one of the examples above, or
   a template from `scripts/Exapmle/` for a new language).
2. Add `{ file: "<script-name-without-.js>", label: "<dropdown text>" }` to
   the `DICTIONARIES` array in `scripts/manifest.js`.

`scripts/base.js` loads whichever dictionary is selected by injecting its
`<script>` tag and re-running `init()`, so `index.html`/`mobile.html` stay
generic.

## Word comparison for different languages ##

Arabic, Persian, Thai and Hindi each need bespoke comparison logic because
their scripts have combining marks, contextual letter shaping or vowels that
are written before the consonant they follow, none of which is a simple
character-by-character comparison.

English, Polish, Ukrainian, German and Spanish, by contrast, are plain
alphabetic scripts, so their `wordCompare` just delegates to the browser's
built-in `Intl.Collator` with the right locale tag (`"en"`, `"pl"`, `"uk"`,
`"de"`, `"es"`). That one line already gets case-folding and each language's
native letter order right - e.g. Polish `ą/ć/ę/ł/ń/ó/ś/ź/ż` sorting next to
their base letter rather than after `z`; Ukrainian's `ґ є і ї` (letters
Russian doesn't have) sorting correctly among the rest of the Cyrillic
alphabet; German's `ä/ö/ü/ß` correctly treated as diacritic variants of
`a/o/u/ss` rather than separate letters; and Spanish's `ñ` sorting right
after `n`, with `ll`/`ch` correctly treated as plain two-letter sequences
(the modern rule, since Spanish's 1994 reform - older dictionaries alphabetized
them as separate letters). All of this was verified with Node's `Intl`
implementation, not assumed.

**Russian is the one exception**, and the reason it's worth calling out:
`Intl.Collator("ru")` gives `е` and `ё` the *same primary weight* (a
tailoring left over from `ё` often being typed as `е`), so a later letter
can decide the comparison before the `е`/`ё` difference ever would - e.g. it
ranks `"енот"` *after* `"ёж"`, even though the Russian alphabet
(`а б в г д е ё ж ...`) makes `ё` its own letter strictly between `е` and
`ж`, so every `е`-word must sort before every `ё`-word. `scripts/RU_PL_Dvoretskyi.js`
(and `scripts/Exapmle/russian.js`) therefore use a plain alphabet-position
comparison instead (the same technique as `scripts/Exapmle/arabic.js`), which
sidesteps the issue - Russian has no combining marks or reordering to
justify `Intl.Collator`'s complexity anyway. If you build a real Russian (or
any other) dictionary index, uncomment the `checkData();` call at the top of
your language script and reload the page once - it walks the whole
`headwords` list through your `wordCompare` and alerts on any out-of-order
pair. It would have caught exactly this.

## Zoom and pan ##

The page viewer supports scroll-wheel/pinch zooming and click-or-touch
dragging to pan. The zoom level is remembered per dictionary (and the last
page you had open is remembered too), both across page turns and after
closing the browser, via `localStorage`. Double-click (or double-tap) resets
the zoom. The left/right arrow keys also turn pages, unless the search box
is focused.

## Switching dictionaries ##

The topbar's dropdown (populated from `scripts/manifest.js`) lets you switch
between configured dictionaries without reloading the page. The last
dictionary you had selected is remembered via `localStorage` and reopened on
your next visit.

## Mobile/Tablet-friendly version ##

Use `mobile.html` instead of `index.html` (experimental).

## Third-party assets ##

The topbar layout uses [Bootstrap](https://getbootstrap.com/)'s CSS,
vendored locally at `scripts/vendor/bootstrap.min.css`.
