// Initialization. Should end with a call to display().
var init = function() {
  //checkData();                  // comment out when all data has been checked
  document.title = "Example Ukrainian Dictionary";
  display();
};

// Ukrainian is a plain alphabetic script (no combining marks or contextual
// reshaping), so Intl.Collator handles it directly. Its alphabet differs
// from Russian's: it has ґ, є, і, ї (Russian doesn't), and lacks ё, ъ, ы, э
// (which Russian has) - Intl.Collator("uk", ...) already knows the correct
// order (а б в г ґ д е є ж з и і ї й к л м н о п р с т у ф х ц ч ш щ ь ю я).
var collator = new Intl.Collator("uk", { sensitivity: "base", numeric: true });

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
var images = "data/ukrainian-";
var image_extension = ".png";
var start_page = 0;
var headwords = [               // first words in each page
"акула",   // а
"банан",   // б
"вода",    // в
"гора",    // г
"ґанок",   // ґ
"дім",     // д
"екран",   // е
"єнот",    // є
"жаба",    // ж
"зима",    // з
"індик",   // і
"їжак",    // ї
"кіт",     // к
"ліс",     // л
"мама",    // м
"ніч",     // н
"осінь",   // о
"пес",     // п
"риба",    // р
"сон",     // с
"тато",    // т
"улиця",   // у
"файл",    // ф
"хліб",    // х
"цукор",   // ц
"чай",     // ч
"школа",   // ш
"щука",    // щ
"юрист",   // ю
"яблуко"   // я
];
