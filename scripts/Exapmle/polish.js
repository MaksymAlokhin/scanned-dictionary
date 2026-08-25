// Initialization. Should end with a call to display().
var init = function() {
  //checkData();                  // comment out when all data has been checked
  document.title = "Example Polish Dictionary";
  display();
};

// Like English, Polish has no combining marks or contextual reshaping, so
// Intl.Collator handles it directly - it already knows that the extra
// letters (ą, ć, ę, ł, ń, ó, ś, ź, ż) sort right after their base letter
// rather than at the end of the alphabet (which is what plain Unicode
// code-point order would give).
var collator = new Intl.Collator("pl", { sensitivity: "base", numeric: true });

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
var images = "data/polish-";
var image_extension = ".png";
var start_page = 0;
var headwords = [               // first words in each page
"auto",     // a
"babcia",   // b
"cebula",   // c
"ćma",      // ć
"dom",      // d
"ekran",    // e
"fasola",   // f
"gwiazda",  // g
"herbata",  // h
"igła",     // i
"jajko",    // j
"kot",      // k
"las",      // l
"łąka",     // ł
"mama",     // m
"noc",      // n
"okno",     // o
"pies",     // p
"rower",    // r
"sen",      // s
"śnieg",    // ś
"tata",     // t
"ulica",    // u
"woda",     // w
"zamek",    // z
"źle",      // ź
"żaba"      // ż
];
