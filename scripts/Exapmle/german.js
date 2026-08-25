// Initialization. Should end with a call to display().
var init = function() {
  //checkData();                  // comment out when all data has been checked
  document.title = "Example German Dictionary";
  display();
};

// German has no combining marks or contextual reshaping, so Intl.Collator
// handles it directly - and, verified with Node's Intl implementation, it
// gets the tricky part right too: ä/ö/ü are NOT separate letters in the
// German alphabet, only diacritic variants of a/o/u (unlike Russian's ё,
// see russian.js), so Intl.Collator correctly lets a later letter decide
// the comparison when needed (e.g. "arbeit" < "ärger" since r < r then
// b < g, not because of the umlaut), and correctly folds ß together with
// "ss" for ordering purposes.
var collator = new Intl.Collator("de", { sensitivity: "base", numeric: true });

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
var images = "data/german-";
var image_extension = ".png";
var start_page = 0;
var headwords = [               // first words in each page
"apfel",
"ärger",
"backen",
"büro",
"chemie",
"dach",
"drüben",
"ecke",
"fenster",
"gabel",
"haus",
"insel",
"jacke",
"kaffee",
"lampe",
"maße",
"nacht",
"ofen",
"öffnen",
"papier",
"quelle",
"rathaus",
"straße",
"tisch",
"über",
"vase",
"wagen",
"zug"
];
