// Initialization. Should end with a call to display().
var init = function() {
  //checkData();                  // comment out when all data has been checked
  document.title = "Example Spanish Dictionary";
  display();
};

// Spanish has no combining marks or contextual reshaping, so Intl.Collator
// handles it directly. Verified with Node's Intl implementation: ñ is
// correctly treated as its own letter after n (no primary-weight collision
// like Russian's ё), and "ll"/"ch" are correctly treated as plain two-letter
// sequences rather than the separate alphabet letters they used to be
// before Spanish's 1994 orthographic reform (so "luz" sorts after "llave",
// matching modern dictionaries, not before it as older ones would have it).
var collator = new Intl.Collator("es", { sensitivity: "base", numeric: true });

// Returns "less" when a < b, "equal" when a = b, "greater" when a > b.
var wordCompare = function(a, b) {
  var canonicalForm = function(word) { return word.replace(/-/g, ""); };
  var d = collator.compare(canonicalForm(a), canonicalForm(b));
  return d < 0 ? "less" : d > 0 ? "greater" : "equal";
};

var page_zoom = 1.5;

// Dictionary pages
// NB: this is example data only - supply your own scanned pages and
// first-word-per-page list, as described in the README.
var images = "data/spanish-";
var image_extension = ".png";
var start_page = 0;
var headwords = [               // first words in each page
"abeja",
"boca",
"casa",
"chico",
"dedo",
"escuela",
"flor",
"gato",
"hielo",
"idea",
"jardín",
"koala",
"libro",
"llave",
"mesa",
"niño",
"oso",
"pan",
"queso",
"ratón",
"sol",
"taza",
"uva",
"vaca",
"yeso",
"zapato"
];
