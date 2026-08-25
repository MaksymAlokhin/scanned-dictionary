// Initialization. Should end with a call to display().
var init = function() {
  //checkData();                  // comment out when all data has been checked
  document.title = "Example English Dictionary";
  display();
};

// English collation is plain: no combining marks or contextual reordering
// like Arabic/Persian/Thai/Hindi need, so the built-in Intl.Collator (which
// already knows how to case-fold and to treat runs of digits as numbers)
// is all that's required.
var collator = new Intl.Collator("en", { sensitivity: "base", numeric: true });

// Returns "less" when a < b, "equal" when a = b, "greater" when a > b.
var wordCompare = function(a, b) {
  // Some dictionaries list bound morphemes with a leading/trailing hyphen
  // (e.g. "-ness"); ignore hyphens so they sort with their base form.
  var canonicalForm = function(word) { return word.replace(/-/g, ""); };
  var d = collator.compare(canonicalForm(a), canonicalForm(b));
  return d < 0 ? "less" : d > 0 ? "greater" : "equal";
};

var page_zoom = 1.5;

// Dictionary pages
// NB: this is example data only - supply your own scanned pages and
// first-word-per-page list, as described in the README.
var images = "data/english-";
var image_extension = ".jpg";
var start_page = 0;
var headwords = [               // first words in each page
"apple",
"banana",
"cat",
"dog",
"eagle",
"forest",
"garden",
"house",
"ice",
"jungle",
"kite",
"lemon",
"mountain",
"night",
"ocean",
"piano",
"queen",
"river",
"stone",
"tree",
"umbrella",
"valley",
"winter",
"xylophone",
"yellow",
"zebra"
];
