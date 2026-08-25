// Initialization. Should end with a call to display().
var init = function() {
  //checkData();                  // comment out when all data has been checked
  document.title = "Example Russian Dictionary";
  display();
};

// Unlike Polish/Ukrainian/German/Spanish, Russian can't just delegate to
// Intl.Collator: verified with Node's Intl implementation, the default "ru"
// collation gives 'е' and 'ё' the SAME primary weight (a historical
// tailoring, since ё is often typed as е). That means a later letter can
// decide the comparison before the е/ё difference is ever considered, e.g.
// Intl.Collator says "енот" > "ёж" - wrong, since the Russian alphabet
// (а б в г д е ё ж з ...) makes ё its own letter strictly between е and ж,
// so every е-word must sort before every ё-word regardless of what follows.
// A plain alphabet-position comparison (as used for arabic.js) sidesteps
// this entirely, since Russian has no combining marks or reordering to
// justify Intl.Collator's extra complexity anyway.
var alphabet = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя";

// Returns "less" when a < b, "equal" when a = b, "greater" when a > b.
var wordCompare = function(a, b) {
  var canonicalForm = function(word) { return word.toLowerCase().replace(/-/g, ""); };
  a = canonicalForm(a);
  b = canonicalForm(b);
  var i = 0;
  while (true) {
    if (i == a.length && i == b.length)
      return "equal";
    if (i == a.length)
      return "less";
    if (i == b.length)
      return "greater";
    var x = alphabet.indexOf(a[i]);
    var y = alphabet.indexOf(b[i]);
    if (x < 0 || y < 0)
      return undefined;
    if (x < y)
      return "less";
    if (x > y)
      return "greater";
    ++i;
  }
};

var page_zoom = 1.5;

// Dictionary pages
// NB: this is example data only - supply your own scanned pages and
// first-word-per-page list, as described in the README.
var images = "data/russian-";
var image_extension = ".png";
var start_page = 0;
var headwords = [               // first words in each page
"арбуз",    // а
"банан",    // б
"вода",     // в
"гора",     // г
"дом",      // д
"единица",  // е
"ёлка",     // ё - a rare but real case: must sort after ALL е-words
"жаба",     // ж
"зима",     // з
"игра",     // и
"йод",      // й
"кот",      // к
"лес",      // л
"мама",     // м
"ночь",     // н
"окно",     // о
"пёс",      // п
"рыба",     // р
"сон",      // с
"трава",    // т
"улица",    // у
"файл",     // ф
"хлеб",     // х
"цветок",   // ц
"чай",      // ч
"школа",    // ш
"щука",     // щ
"эхо",      // э
"юрист",    // ю
"яблоко"    // я
];
