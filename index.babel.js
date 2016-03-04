"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

window.state = window.state || {};
state.aspectRatio = state.aspectRatio || 16 / 9;
state.currentSlide = state.currentSlide || 0;
state.view = state.view || "slide";
state.isPlaying = typeof state.isPlaying == "undefined" ? true : state.isPlaying;

// Applies the `style` object to the DOM `element`. Special keys:
// - `text`: Create a text node inside with value text.
// - `html`: Use value as innerHTML for node.
// - `attributes`: Apply supplied table as node attributes.
function applyStyle(e, style) {
    for (var k in style) {
        var v = style[k];
        if (k == "text") e.appendChild(document.createTextNode(v));else if (k == "html") e.innerHTML = v;else if (k == "attributes") {
            for (var a in v) {
                e[a] = v[a];
            }
        } else e.style[k] = v;
    }
}

// Create a DOM element with style(s) from arguments.
function e(tag) {
    var e = document.createElement(tag);

    for (var _len = arguments.length, styles = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        styles[_key - 1] = arguments[_key];
    }

    styles.forEach(function (style) {
        return applyStyle(e, style);
    });
    return e;
}

// Return true if we should play animations
function isPlaying() {
    return state.isPlaying && state.view == "slide";
}

// Render DOM for current state. This is called every time state changes.
function render() {
    var body = document.getElementsByTagName("body")[0];
    applyStyle(body, { margin: "0px", padding: "0px", backgroundColor: "#ccc",
        fontFamily: "arial, sans-serif" });
    while (body.lastChild) {
        body.removeChild(body.lastChild);
    }var addDiv = function addDiv(body, arg) {
        return body.appendChild(e("div", { backgroundColor: "#fff", position: "absolute",
            overflow: "hidden", fontSize: arg.width / 32 }, arg));
    };

    var centerDiv = function centerDiv(body) {
        var r = state.aspectRatio;
        var win = { w: window.innerWidth, h: window.innerHeight };
        var sz = win.w / r > win.h ? { w: win.h * r, h: win.h } : { w: win.w, h: win.w / r };
        return addDiv(body, { height: sz.h, width: sz.w, top: (win.h - sz.h) / 2, left: (win.w - sz.w) / 2 });
    };

    var showHelp = function showHelp(body) {
        var w = window.innerWidth;
        var keyboardShortcuts = "<h1>Keyboard Shortcuts</h1>\n            <dl>\n                <dt>&lt;Left&gt; <span style=\"color: #fff\">or</span> k</dt>       <dd>: Previous slide</dd>\n                <dt>&lt;Right&gt; <span style=\"color: #fff\">or</span> j</dt>      <dd>: Next slide</dd>\n                <dt>&lt;space&gt;</dt>      <dd>: Toggle animations</dd>\n                <dt>w</dt>                  <dd>: Toggle aspect ratio (16:9/3:4)</dd>\n                <dt>v</dt>                  <dd>: Toggle view (slides/list)</dd>\n                <dt>r</dt>                  <dd>: Force reload</dd>\n                <dt>h <span style=\"color: #fff\">or</span> ?</dt>             <dd>: Toggle help</dd>\n            </dl>";
        var div = e("div", { html: keyboardShortcuts, fontSize: 13,
            width: 300, left: w - 400, top: 50, backgroundColor: "#000", color: "#fff", padding: 20,
            opacity: 0.8, borderRadius: "10px", position: "fixed" });
        [].forEach.call(div.getElementsByTagName("h1"), function (e) {
            return applyStyle(e, { marginBottom: "1em",
                fontSize: 15, borderBottomStyle: "solid", borderBottomWidth: "1px", paddingBottom: "0.5em" });
        });
        [].forEach.call(div.getElementsByTagName("dt"), function (e) {
            return applyStyle(e, { color: "#ff0", width: 100,
                float: "left", clear: "left", lineHeight: "2em", textAlign: "right", marginRight: "0.5em" });
        });
        [].forEach.call(div.getElementsByTagName("dd"), function (e) {
            return applyStyle(e, { lineHeight: "2em" });
        });
        body.appendChild(div);
    };

    state.canReload = true;
    state.currentSlide = Math.max(0, Math.min(state.currentSlide, slides.length - 1));
    if (window.orientation !== undefined) state.view = Math.abs(window.orientation) === 90 ? "slide" : "list";

    var root = e("div", {});
    if (state.view == "list") {
        var w = 300 * state.aspectRatio,
            h = 300;
        var x = 0,
            y = 0;

        var _loop = function _loop(i) {
            var div = addDiv(root, { left: x, top: y, width: w, height: h });
            (slides[i].template || defaultTemplate)(div, slides[i]);
            x += w + 10;
            if (x + w + 10 > window.innerWidth) {
                x = 0;y += h + 10;
            }
            div.onmousedown = function () {
                state.currentSlide = i;state.view = "slide";render();
            };
        };

        for (var i = 0; i < slides.length; ++i) {
            _loop(i);
        }
    } else (slides[state.currentSlide].template || defaultTemplate)(centerDiv(root), slides[state.currentSlide]);
    body.appendChild(root);

    if (state.showHelp) showHelp(body);

    body.onresize = render;
    body.onorientationchange = render;
    body.onkeydown = function (evt) {
        if (evt.keyCode == 37) state.currentSlide--;else if (evt.keyCode == 39) state.currentSlide++;else return;
        render();
    };
    body.onkeypress = function (evt) {
        var s = String.fromCharCode(evt.which || evt.keyCode);
        if (s == "w") state.aspectRatio = state.aspectRatio > 14 / 9 ? 12 / 9 : 16 / 9;else if (s == "v") state.view = state.view == "list" ? "slide" : "list";else if (s == "?" || s == "h") state.showHelp = !state.showHelp;else if (s == " ") {
            state.isPlaying = !state.isPlaying;
        } else if (s == "k") state.currentSlide--;else if (s == "j") state.currentSlide++;else if (s == "r") {
            _require("index.js");window.setTimeout(render, 200);return;
        } else return;
        render();
    };
    body.ontouchend = function (evt) {
        if (evt.changedTouches[0].clientX > window.innerWidth / 2.0) state.currentSlide++;else state.currentSlide--;
        render();
    };
}

function _require(src) {
    var head = document.getElementsByTagName("head")[0];
    head.removeChild(head.appendChild(e("script", { attributes: { src: src + "?" + performance.now(), charset: "UTF-8" } })));
}

function reload() {
    if (!state.canReload) return;
    _require("index.js");
    render();
}

window.onload = render;
if (state.interval) window.clearInterval(state.interval);
if (window.location.href.startsWith("file://")) state.interval = window.setInterval(reload, 500);

// ------------------------------------------------------------
// Slide templates
// ------------------------------------------------------------

var baseStyle = { position: "absolute", overflow: "hidden", width: "100%", height: "100%" };

function renderMarkdown(md) {
    var unindent = function unindent(s) {
        s = s.replace(/^\s*\n/, ""); // Remove initial blank lines
        var indent = s.match(/^\s*/)[0];
        var matchIndent = new RegExp("^" + indent, "mg");
        return s.replace(matchIndent, "");
    };

    if (typeof marked === "undefined") {
        _require("marked.min.js");
        window.setTimeout(function () {
            setupSlides();render();
        }, 50);
        return "<h1>Loading Markdown...</h1>";
    }

    return marked(unindent(md));
}

function addPlayButton(div) {
    div.appendChild(e("div", { position: "absolute", width: "100%",
        text: "►", textAlign: "center",
        color: "#fff", top: "40%", fontSize: "2em" }));
}

function addElements(div, arg) {
    if (arg.imageUrl) div.appendChild(e("div", baseStyle, { width: "100%", height: "100%",
        backgroundImage: "url('" + arg.imageUrl + "')", backgroundSize: "contain",
        backgroundPosition: "center", backgroundRepeat: "no-repeat" }));
    if (arg.video) {
        var video = arg.video;
        if (isPlaying()) {
            var player = video.youtubeId ? e("object", baseStyle, { attributes: { data: "http://www.youtube.com/embed/" + video.youtubeId + "?autoplay=1&showinfo=0&controls=0" } }) : e("video", baseStyle, { attributes: { src: video.src, autoplay: true, loop: true } });
            div.appendChild(player);
            state.canReload = false;
        } else {
            if (video.youtubeId && !video.thumbnailSrc) video.thumbnailSrc = "http://img.youtube.com/vi/" + video.youtubeId + "/0.jpg";
            if (video.thumbnailSrc) div.appendChild(e("div", baseStyle, {
                backgroundImage: "url('" + video.thumbnailSrc + "')", backgroundSize: "contain",
                backgroundPosition: "center", backgroundRepeat: "no-repeat" }));
            addPlayButton(div);
        }
    }
    if (arg.canvas) {
        (function () {
            var sz = [div.style.width, div.style.height].map(function (e) {
                return parseFloat(e);
            });
            var w = sz[0],
                h = sz[1];
            var canvas = div.appendChild(e("canvas", baseStyle, { attributes: { width: w, height: h } }));
            var ctx = canvas.getContext("2d");
            ctx.translate(w / 2, h / 2);
            ctx.scale(h / 2000, h / 2000);
            if (arg.canvas(ctx, 0) == "animate") {
                if (isPlaying()) {
                    (function () {
                        var start = Date.now();
                        var animate = function animate() {
                            if (document.getElementsByTagName("canvas")[0] != canvas) return;
                            arg.canvas(ctx, (Date.now() - start) / 1000.0);
                            window.requestAnimationFrame(animate);
                        };
                        window.requestAnimationFrame(animate);
                        state.canReload = false;
                    })();
                } else addPlayButton(div);
            }
        })();
    }
    if (arg.title) div.appendChild(e("div", baseStyle, { fontSize: "2em",
        top: "40%", textAlign: "center", html: arg.title }));
    if (arg.subtitle) div.appendChild(e("div", baseStyle, { fontSize: "1em",
        top: "60%", textAlign: "center", html: arg.subtitle }));
    if (arg.h1) div.appendChild(e("div", baseStyle, { fontSize: "1.5em",
        top: "10%", textAlign: "center", html: arg.h1 }));
    if (arg.ul) {
        var c = e("div", baseStyle, { left: "5%", width: "90%", top: "20%" });
        c.appendChild(e("ul", { html: arg.ul }));
        div.appendChild(c);
    }
    if (arg.markdown) arg.html = renderMarkdown(arg.markdown);
    if (arg.html) div.appendChild(e("div", baseStyle, { left: "5%", width: "90%", top: "10%", html: arg.html }));
    if (arg.caption) {
        div.appendChild(e("div", baseStyle, { fontSize: "1em",
            top: "90%", textAlign: "center", html: arg.caption,
            color: arg.captionStyle == "black" ? "#000" : "#fff",
            textShadow: arg.captionStyle == "black" ? "0px 0px 20px #fff" : "0px 0px 20px #000" }));
    }
    [].forEach.call(div.getElementsByTagName("h1"), function (e) {
        return applyStyle(e, {
            textAlign: "center", fontSize: "1.5em", marginTop: 0, fontWeight: "normal" });
    });
    [].forEach.call(div.getElementsByTagName("li"), function (e) {
        return applyStyle(e, { marginBottom: "0.4em" });
    });
}

function defaultTemplate(div, arg) {
    addElements(div, arg);
}

function autoStyle(div, arg) {
    addElements(div, arg);

    var img = div.getElementsByTagName("img")[0];
    if (img) {
        var h1 = div.getElementsByTagName("h1")[0];
        var captionStyle = "white";
        if (img.alt.indexOf("#black") != -1) captionStyle = "black";

        while (div.lastChild) {
            div.removeChild(div.lastChild);
        }return addElements(div, { imageUrl: img.src, caption: h1.innerHTML,
            captionStyle: captionStyle });
    }

    var h2 = div.getElementsByTagName("h2")[0];
    if (h2) {
        var h1 = div.getElementsByTagName("h1")[0];
        while (div.lastChild) {
            div.removeChild(div.lastChild);
        }return addElements(div, { title: h1.innerHTML, subtitle: h2.innerHTML });
    }

    var lis = div.getElementsByTagName("li");
    if (lis) [].forEach.call(lis, function (li) {
        li.style.marginTop = "0.4em";
    });
}

function makeSlides(html) {
    return html.split("<h1").slice(1).map(function (h) {
        return "<h1" + h;
    }).map(function (h) {
        return { template: autoStyle, html: h };
    });
}

// ------------------------------------------------------------
// Slides
// ------------------------------------------------------------

function setupSlides() {
    window.slides = [].concat(_toConsumableArray(makeSlides(renderMarkdown("\n# Stingray Overview\n\n## Niklas Frykholm, 01 March 2016\n\n# Main Stingray Components\n\n![#black](img/data-flow.jpg)\n\n# Data\n\n* Everything is a <em>resource</em> idenitfied by name and type:\n    * `vegetation/trees/05_larch.unit`\n* Source data is in Json (variant)\n* Compiled data matches runtime memory (per platform)\n* Resources are loaded/unloaded together in <em>packages</em>\n* For final distribution, packages are compiled into <em>bundles</em>\n* <tt>/core</tt> — shared resources used by editor\n\n# Sample Data\n\n![](img/sample-data.png)\n\n# Runtime\n\n* C++ based high-performance executable\n* Compiled for each target platform\n* Three flavors: `debug`, `dev`, `release`\n* The windows runtime can also do other stuff\n    * Compile data, serve files, etc\n\n# Runtime\n\n![](img/runtime.png)\n\n# Editor\n\n* Separate executable written in HTML, JavaScript, C# and (a little) C++\n* Front-end is Chromium + JavaScript\n* Backend is C#\n* We also have some old tools written in WPF and WinForms that haven't yet\n  been converted into the new system\n\n# Editor Viewports\n\n![#black](img/editor-viewport.jpg)\n\n# Editor Viewports\n\n* Since everything is web socket based, the editor can connect against remote viewports\n    * Viewport mirrored on iOS, Android, etc\n    * We can also launch the game on these platforms\n* Data on the remote platforms is loaded over a web socket connection to the <em>Asset Server</em>\n\n# Editor\n\n![](img/editor.png)\n\n# Old Tools\n\n![](img/tools.png)\n\n# Development Process\n\n* Goal setting meeting + SCRUM determine tasks\n* Git pull requests + peer review\n* Continuous builds on build server\n* For bigger tasks: SEP (Stingray Enhancement Proposal)\n* Code style guidelines in Git wiki\n\n# Tracking tasks in JIRA\n\n![#black](img/jira.png)\n\n# Pull Request\n\n![#black](img/pull-request.png)\n\n# Build System\n\n* Pre-requisites:\n    * Ruby, Visual Studio, Platform SDKs\n* `make.rb` — Build engine\n    * `spm` (Stingray Package Manager) fetches libs\n    * Cmake builds `.sln` files for Visual Studio\n\n# make.rb\n\n![#black](img/make.png)\n\n# Documentation\n\n* Code comments in `*.h` describe API\n* User documentation written by doc team\n* Markdown formatting used everywhere\n* Adoc — custom system for documenting Lua API\n* Wiki — high level system documentation (when necessary)\n\n# Testing\n\n* Unit tests in source code: `#ifdef UNIT_TESTS`\n    * `stingray_win64_debug_x64.exe --run-unit-tests --test-disk`\n* Regression test system written in Ruby\n    * Runs full projects on multiple platforms\n    * `ruby run_regression_tests.rb`\n* Backend & frontend tests for editor\n\n# Investigating a Running Program\n\n* Console — prints output, can launch other tools\n    * Profiler — top down profiler, explicit scopes\n    * Memory tracker — through console commands\n    * Perfhud — overlay with information\n    * Lua debugger\n\n# Profiler\n\n![#black](img/profiler.png)\n\n# Memory tree\n\n![#black](img/memory-tree.png)\n\n# Building a Game\n\n* Export FBX files with meshes, animations, etc\n* Use editor to set up units, levels, etc\n* Create gameplay\n    * Lua scripting\n    * Flow (graphical scripting)\n    * C API (under development)\n\n# Worlds\n\n* Everything in the game lives in a *World*\n    * Can have multiple worlds for \"inventory rooms\", etc\n* In a world we spawn *Units*\n    * Can contain: meshes, actors, lights, cameras, ...\n* A level is a collection of Units that can be spawned into a World\n\n# Entity/Component\n\n* A replacement for the *Unit* system with a looser coupling\n* Units have a fixed list of things they can contain\n* Entity system can be extended with new components\n    * In progress...\n\n# Lua Scripting\n\n* Gameplay can be written in Lua\n    * Hot-Reloadable\n* Lua API is handwritten for maximum quality\n* Lua has main loop (i.e. not code snippets)\n    * Calls out to update and render worlds\n* Lua is single-threaded — can be performance bottleneck\n\n# Flow\n\n* Visual programming language — used by artists\n* Run by VM internally\n* Nodes defined in C++ or Lua\n\n# Flow\n\n![Flow](img/flow.png)\n\n# Plug-in System\n\n* Allows code to be written in dynamically loaded DLLs\n    * Navigation, Scaleform, HumanIK, Wwise\n* Minimalistic C based interface (ABI)\n* Single entry function, request APIs (structs with functions)\n* Hot-reloadable\n* Plugin C API — make Lua API available through C\n\n# Rendering\n\n* Done on a separate thread\n* Main thread state (mesh positions, etc) mirrored\n* Entirely data driven (layers, shaders, etc)\n\n# Animation\n\n* Animation data exported in *.fbx files\n* Compressed internally to efficient representation\n* *State Machine* specifies blends and transitions\n* Evaluated to compute local position for each bone\n* *SceneGraph* specifies node hierarchy within Unit, computes world position\n  from local\n\n# Other Systems (1)\n\n* Input — abstract controller representation\n* Navigation — Plugin for AI movement\n* Network — Matchmaking, compression, object synchronization\n* Particles — Particle effect simulation\n* Physics — PhysX based, raycasts, bodies, movers, joints, cloth\n\n# Other Systems (2)\n\n* Sound — Wwise and internal\n* Story — Animation system for levels\n* Terrain — Sculpt terrain objects\n* UI — Scaleform and internal\n\n# Foundation\n\n* Platform abstractions for IO, threading, etc\n* Logging, asserts\n* Console server (accepts web socket commands)\n* Memory handling system\n* Collection classes\n\n# Threading\n\n* Two main pipelined threads: core, render\n* Job system — on thread per system core\n* Background threads for background tasks\n* Challenges:\n    * More parallelism\n    * How to prioritize jobs to minimize latency\n    * Multithreading gameplay\n\n# Threads\n\n![#black](img/threads.jpg)\n\n# Memory\n\n* Explicit <tt>Allocator</tt> classes used to allocate memory\n* Different types\n    * `TempAllocator` — for temporary memory\n    * `TraceAllocator` — traces memory use, error on memory leaks\n    * `HeapAllocator` — dlmalloc\n    * `PageAllocator` — backing alloactor for everything\n\n# Collection Classes\n\n* Minimalistic set: `Array`, `HashMap`, `HashSet`, `Vector`\n* No STL\n* `DynamicString` is thin wrapper around `Array<char>`\n* `IdString32/64`: string hashes, used almost everywhere\n\n# Q & A\n\n## Presentation made in [nfslides](https://github.com/niklasfrykholm/nfslides)\n    "))));
}

setupSlides();

