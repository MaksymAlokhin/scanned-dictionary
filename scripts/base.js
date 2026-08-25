// Basic functionality

var displayed_page = 0;

// Zoom & pan state for the page viewer. The zoom level (but not the pan
// position, since every page has different content) is remembered per
// dictionary - keyed by its image path - across page turns and reloads.
var zoom = { scale: 1, x: 0, y: 0 };
var MIN_ZOOM = 1;
var MAX_ZOOM = 8;

var storageGet = function(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null; // storage unavailable (private browsing, etc.)
  }
};

var storageSet = function(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) { /* ignore */ }
};

var loadZoom = function() {
  var saved = storageGet("scanned-dictionary-zoom:" + images);
  return saved !== null ? parseFloat(saved) : (page_zoom || 1);
};

var loadPage = function() {
  var saved = storageGet("scanned-dictionary-page:" + images);
  var n = saved !== null ? parseInt(saved, 10) : 0;
  return (n >= 0 && n < headwords.length) ? n : 0;
};

var saveZoomTimeout = null;
var saveZoomSoon = function() {
  clearTimeout(saveZoomTimeout);
  saveZoomTimeout = setTimeout(function() {
    storageSet("scanned-dictionary-zoom:" + images, zoom.scale);
  }, 300);
};

var focusSearchTimeout = null;
var focusSearchSoon = function() {
  clearTimeout(focusSearchTimeout);
  focusSearchTimeout = setTimeout(function() {
    document.getElementById("search").focus();
  }, 250);
};

var applyTransform = function() {
  var img = document.getElementById("page");
  img.style.transform =
    "translate(" + zoom.x + "px, " + zoom.y + "px) scale(" + zoom.scale + ")";
};

// When the (scaled) image is smaller than the viewport along an axis,
// center it on that axis; otherwise clamp so it can't be panned out of view.
var clampAxis = function(pos, size, viewportSize) {
  if (size <= viewportSize)
    return (viewportSize - size) / 2;
  return Math.min(0, Math.max(viewportSize - size, pos));
};

var clampPan = function() {
  var img = document.getElementById("page");
  var viewport = document.getElementById("viewport");
  zoom.x = clampAxis(zoom.x, img.offsetWidth * zoom.scale, viewport.clientWidth);
  zoom.y = clampAxis(zoom.y, img.offsetHeight * zoom.scale, viewport.clientHeight);
};

// Zooms so that scale becomes newScale while the point (px, py), given in
// viewport coordinates, stays fixed on screen (e.g. under the cursor).
var zoomAt = function(px, py, newScale) {
  newScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newScale));
  var imgX = (px - zoom.x) / zoom.scale;
  var imgY = (py - zoom.y) / zoom.scale;
  zoom.x = px - imgX * newScale;
  zoom.y = py - imgY * newScale;
  zoom.scale = newScale;
  clampPan();
  applyTransform();
  saveZoomSoon();
};

var resetPan = function() {
  zoom.x = 0;
  zoom.y = 0;
  clampPan();
  applyTransform();
};

// Dictionary switching: each scripts/<file>.js sets globals (init,
// headwords, images, wordCompare, ...) when loaded. We swap dictionaries
// by injecting/replacing a <script> tag and re-running init() once it
// has loaded, rather than requiring index.html to name one statically.
var currentDictScript = null;

var activateDictionary = function() {
  displayed_page = loadPage();
  zoom.scale = loadZoom();
  init(); // defined by the just-loaded dictionary script; ends with display()
};

var loadDictionary = function(file) {
  storageSet("scanned-dictionary-selected", file);
  if (currentDictScript)
    currentDictScript.remove();
  var script = document.createElement("script");
  script.src = "scripts/" + file + ".js";
  script.onload = activateDictionary;
  currentDictScript = script;
  document.head.appendChild(script);
};

var populateDictionaryPicker = function() {
  var select = document.getElementById("dict-select");
  DICTIONARIES.forEach(function(d) {
    var option = document.createElement("option");
    option.value = d.file;
    option.textContent = d.label;
    select.appendChild(option);
  });
  select.addEventListener("change", function() {
    loadDictionary(select.value);
  });

  var saved = storageGet("scanned-dictionary-selected");
  var known = DICTIONARIES.some(function(d) { return d.file === saved; });
  var initial = known ? saved : DICTIONARIES[0].file;
  select.value = initial;
  loadDictionary(initial);
};

var display = function() {
  storageSet("scanned-dictionary-page:" + images, displayed_page);
  var img = document.getElementById("page");
  img.onload = resetPan;
  img.src = images + ("0000" + (start_page + displayed_page)).slice(-4) + image_extension;
};

var search = function(event) {
  if (event.keyCode == 13) {
    var field = document.getElementById("search");
    field.select();
    var text = field.value;
    displayed_page = headwords.length - 1;
    for (var i = 0; i < headwords.length; ++i) {
      var cmp = wordCompare(text, headwords[i]);
      if (cmp == "less") {
        displayed_page = i - 1;
        break;
      } else if (cmp == "equal") {
        displayed_page = i;
        break;
      }
    }
    if (displayed_page < 0)
      displayed_page = 0;
    else if (displayed_page >= headwords.length)
      displayed_page = headwords.length - 1;
    display();
  }
};

var prevPage = function() {
  if (displayed_page > 0) {
    --displayed_page;
    display();
  }
};

var nextPage = function() {
  if (displayed_page < headwords.length - 1) {
    ++displayed_page;
    display();
  }
};

// Consistency check of the supplied headwords
var checkData = function() {
  var result = "";
  for (var i = 1; i < headwords.length; ++i)
    if (wordCompare(headwords[i-1], headwords[i]) == "greater")
      result += headwords[i-1] + " / " + headwords[i] + '\n';
  if (result != "")
    alert("Problems:\n" + result);
};

// Zoom (mouse wheel / pinch) and pan (drag) on the page viewer.
var setupZoomPan = function() {
  var viewport = document.getElementById("viewport");

  var dragging = false;
  var dragStartX, dragStartY, panStartX, panStartY;

  var startDrag = function(x, y) {
    dragging = true;
    dragStartX = x;
    dragStartY = y;
    panStartX = zoom.x;
    panStartY = zoom.y;
    viewport.style.cursor = "grabbing";
  };
  var moveDrag = function(x, y) {
    if (!dragging)
      return;
    zoom.x = panStartX + (x - dragStartX);
    zoom.y = panStartY + (y - dragStartY);
    clampPan();
    applyTransform();
  };
  var endDrag = function() {
    if (!dragging)
      return;
    dragging = false;
    viewport.style.cursor = "grab";
    saveZoomSoon();
    focusSearchSoon();
  };

  viewport.addEventListener("wheel", function(e) {
    e.preventDefault();
    var rect = viewport.getBoundingClientRect();
    var factor = Math.pow(1.0015, -e.deltaY);
    zoomAt(e.clientX - rect.left, e.clientY - rect.top, zoom.scale * factor);
    focusSearchSoon();
  }, { passive: false });

  viewport.addEventListener("mousedown", function(e) {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  });
  window.addEventListener("mousemove", function(e) {
    moveDrag(e.clientX, e.clientY);
  });
  window.addEventListener("mouseup", endDrag);

  viewport.addEventListener("dblclick", function(e) {
    var rect = viewport.getBoundingClientRect();
    zoomAt(e.clientX - rect.left, e.clientY - rect.top, 1);
    focusSearchSoon();
  });

  // Touch: one finger pans, two fingers pinch-zoom.
  var pinchStartDist = null;
  var pinchStartScale = null;

  var touchDist = function(t0, t1) {
    var dx = t0.clientX - t1.clientX;
    var dy = t0.clientY - t1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };
  var touchMid = function(t0, t1, rect) {
    return {
      x: (t0.clientX + t1.clientX) / 2 - rect.left,
      y: (t0.clientY + t1.clientY) / 2 - rect.top
    };
  };

  viewport.addEventListener("touchstart", function(e) {
    if (e.touches.length == 1) {
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length == 2) {
      dragging = false;
      pinchStartDist = touchDist(e.touches[0], e.touches[1]);
      pinchStartScale = zoom.scale;
    }
  }, { passive: true });

  viewport.addEventListener("touchmove", function(e) {
    e.preventDefault();
    if (e.touches.length == 1 && dragging) {
      moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length == 2 && pinchStartDist) {
      var rect = viewport.getBoundingClientRect();
      var dist = touchDist(e.touches[0], e.touches[1]);
      var mid = touchMid(e.touches[0], e.touches[1], rect);
      zoomAt(mid.x, mid.y, pinchStartScale * (dist / pinchStartDist));
    }
  }, { passive: false });

  viewport.addEventListener("touchend", function(e) {
    if (e.touches.length < 2)
      pinchStartDist = null;
    if (e.touches.length === 0)
      endDrag();
  });

  window.addEventListener("resize", function() {
    clampPan();
    applyTransform();
  });
};

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("prev").addEventListener("click", prevPage);
  document.getElementById("next").addEventListener("click", nextPage);
  document.getElementById("search").addEventListener("keypress", search);
  document.addEventListener("keydown", function(e) {
    if (document.activeElement === document.getElementById("search"))
      return; // don't hijack the caret while the user is typing/editing
    if (e.key == "ArrowLeft") {
      prevPage();
      e.preventDefault();
    } else if (e.key == "ArrowRight") {
      nextPage();
      e.preventDefault();
    }
  });
  setupZoomPan();
  populateDictionaryPicker();
});
