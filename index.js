"use strict";

window.state = window.state || {};
state.aspectRatio = state.aspectRatio || (16/9);
state.currentSlide = state.currentSlide || 0;
state.view = state.view || "slide";
state.isPlaying = typeof state.isPlaying == "undefined" ? true : state.isPlaying;

// Applies the `style` object to the DOM `element`. Special keys:
// - `text`: Create a text node inside with value text.
// - `html`: Use value as innerHTML for node.
// - `attributes`: Apply supplied table as node attributes.
function applyStyle(e, style)
{
    for (let k in style) {
        const v = style[k];
        if (k == "text")        e.appendChild(document.createTextNode(v));
        else if (k == "html")   e.innerHTML = v;
        else if (k == "attributes") {for (let a in v) e[a] = v[a];}
        else                    e.style[k] = v;
    }
}

// Create a DOM element with style(s) from arguments.
function e(tag, ...styles)
{
    const e = document.createElement(tag);
    styles.forEach(style => applyStyle(e, style));
    return e;
}

// Return true if we should play animations
function isPlaying()
{
    return state.isPlaying && state.view == "slide";
}

// Render DOM for current state. This is called every time state changes.
function render()
{
    const body = document.getElementsByTagName("body")[0];
    applyStyle(body, {margin: "0px", padding: "0px", backgroundColor: "#ccc",
        fontFamily: "arial, sans-serif"});
    while (body.lastChild) body.removeChild(body.lastChild);

    const addDiv = function(body, arg)
    {
        return body.appendChild( e("div", {backgroundColor: "#fff", position: "absolute",
            overflow: "hidden", fontSize: arg.width/32}, arg) );
    };

    const centerDiv = function(body)
    {
        const r = state.aspectRatio;
        const win = {w: window.innerWidth, h: window.innerHeight};
        const sz = win.w / r > win.h ? {w: win.h * r, h: win.h} : {w: win.w, h: win.w / r};
        return addDiv(body, {height: sz.h, width: sz.w, top: (win.h - sz.h)/2, left: (win.w - sz.w)/2});
    };

    const showHelp = function(body)
    {
        const w = window.innerWidth;
        const keyboardShortcuts =
            `<h1>Keyboard Shortcuts</h1>
            <dl>
                <dt>&lt;Left&gt;</dt>       <dd>: Previous slide</dd>
                <dt>&lt;Right&gt;</dt>      <dd>: Next slide</dd>
                <dt>&lt;space&gt;</dt>      <dd>: Toggle animations</dd>
                <dt>w</dt>                  <dd>: Toggle aspect ratio (16:9/3:4)</dd>
                <dt>v</dt>                  <dd>: Toggle view (slides/list)</dd>
                <dt>r</dt>                  <dd>: Force reload</dd>
                <dt>h <span style="color: #fff">or</span> ?</dt>             <dd>: Toggle help</dd>
            </dl>`;
        const div = e("div", {html: keyboardShortcuts, fontSize: 13,
            width: 300, left: w-400, top: 50, backgroundColor: "#000", color: "#fff", padding: 20,
            opacity: 0.8, borderRadius: "10px", position: "fixed"});
        [].forEach.call(div.getElementsByTagName("h1"), e => applyStyle(e, {marginBottom: "1em",
            fontSize: 15, borderBottomStyle: "solid", borderBottomWidth: "1px", paddingBottom: "0.5em"}));
        [].forEach.call(div.getElementsByTagName("dt"), e => applyStyle(e, {color: "#ff0", width: 100,
            float: "left", clear: "left", lineHeight: "2em", textAlign: "right", marginRight: "0.5em"}));
        [].forEach.call(div.getElementsByTagName("dd"), e => applyStyle(e, {lineHeight: "2em"}));
        body.appendChild(div);
    };

    state.canReload = true;
    state.currentSlide = Math.max(0, Math.min(state.currentSlide, slides.length-1));

    const root = e("div", {});
    if (state.view == "list") {
        const w = 200 * state.aspectRatio, h = 200;
        let x = 0, y = 0;
        for (let i=0; i<slides.length; ++i) {
            const div = addDiv(root, {left: x, top: y, width: w, height: h});
            (slides[i].template || defaultTemplate)(div, slides[i]);
            x += w + 10;
            if (x + w + 10 > window.innerWidth)
                {x=0; y += h + 10;}
            div.onmousedown = () => {state.currentSlide = i; state.view = "slide"; render();};
        }
    } else
        (slides[state.currentSlide].template || defaultTemplate)(centerDiv(root), slides[state.currentSlide]);
    body.appendChild(root);

    if (state.showHelp) showHelp(body);

    body.onresize = render;
    body.onkeydown = function (evt) {
        if (evt.keyCode == 37)          state.currentSlide--;
        else if (evt.keyCode == 39)     state.currentSlide++;
        else return;
        render();
    };
    body.onkeypress = function (evt) {
        const s = String.fromCharCode(evt.which || evt.keyCode)
        if (s == "w")                   state.aspectRatio = state.aspectRatio > 14/9 ? 12/9 : 16/9;
        else if (s == "v")              state.view = state.view == "list" ? "slide" : "list";
        else if (s == "?" || s == "h")  state.showHelp = !state.showHelp;
        else if (s == " ")              {state.isPlaying = !state.isPlaying; reload();}
        else if (s != "r")              return;
        render();
    };
    body.ontouchend = function (evt) {
        if (evt.changedTouches[0].clientX > (window.innerWidth/2.0)) state.currentSlide++;
        else state.currentSlide--;
        render();
    };
}

function require(src)
{
    const head = document.getElementsByTagName("head")[0];
    head.removeChild(head.appendChild(e("script",
        {attributes: {src: `${src}?${performance.now()}`, charset: "UTF-8"}})));
}

function reload()
{
    if (!state.canReload) return;
    require("index.js");
    render();
}

window.onload = render;
if (state.interval) window.clearInterval(state.interval);
if (window.location.href.startsWith("file://"))
    state.interval = window.setInterval(reload, 500);

// ------------------------------------------------------------
// Slide templates
// ------------------------------------------------------------

var baseStyle = {position: "absolute", overflow: "hidden", width: "100%", height: "100%"};

function renderMarkdown(md)
{
    const unindent = function(s) {
        s = s.replace(/^\s*\n/, ""); // Remove initial blank lines
        const indent = s.match(/^\s*/)[0];
        const matchIndent = new RegExp(`^${indent}`, "mg");
        return s.replace(matchIndent, "");
    };

    if (typeof marked === "undefined") {
        require("marked.min.js");
        window.setTimeout(render, 50);
        return "";
    }

    return marked(unindent(md));
}

function addElements(div, arg)
{
    if (arg.imageUrl)
        div.appendChild( e("div", baseStyle, {width: "100%", height: "100%",
            backgroundImage: `url('${arg.imageUrl}')`, backgroundSize: "contain",
            backgroundPosition: "center", backgroundRepeat: "no-repeat"}));
    if (arg.video) {
        const video = arg.video;
        if (isPlaying()) {
            const player = video.youtubeId
                ? e("object", baseStyle, {attributes: {data: `http://www.youtube.com/embed/${video.youtubeId}?autoplay=1&showinfo=0&controls=0`}})
                : e("video", baseStyle, {attributes: {src: video.src, autoplay: true, loop: true}}) ;
            div.appendChild(player);
            state.canReload = false;
        } else {
            if (video.youtubeId && !video.thumbnailSrc)
                video.thumbnailSrc = `http://img.youtube.com/vi/${video.youtubeId}/0.jpg`;
            if (video.thumbnailSrc)
                div.appendChild( e("div", baseStyle, {
                    backgroundImage: `url('${video.thumbnailSrc}')`, backgroundSize: "contain",
                    backgroundPosition: "center", backgroundRepeat: "no-repeat"}));
        }
    }
    if (arg.canvas) {
        const sz = [div.style.width, div.style.height].map(e => parseFloat(e));
        const w = sz[0], h = sz[1];
        const canvas = div.appendChild(e("canvas", baseStyle, {attributes: {width:w, height:h}}));
        const ctx = canvas.getContext("2d");
        ctx.translate(w/2, h/2);
        ctx.scale(h/2000, h/2000);
        if (arg.canvas(ctx, 0) == "animate" && isPlaying()) {
            const start = Date.now();
            const animate = function() {
                if (document.getElementsByTagName("canvas")[0] != canvas) return;
                arg.canvas(ctx, (Date.now() - start)/1000.0);
                window.requestAnimationFrame(animate);
            };
            window.requestAnimationFrame(animate);
            state.canReload = false;
        }
    }
    if (arg.title)
        div.appendChild( e("div", baseStyle, {fontSize: "2em",
            top: "40%", textAlign: "center", text: arg.title}) );
    if (arg.subtitle)
        div.appendChild( e("div", baseStyle, {fontSize: "1em",
            top: "60%", textAlign: "center", text: arg.subtitle}) );
    if (arg.h1)
        div.appendChild( e("div", baseStyle, {fontSize: "1.5em",
            top: "10%", textAlign: "center", text: arg.h1} ));
    if (arg.ul) {
        const c = e("div", baseStyle, {left: "5%", width: "90%", top: "20%"});
        c.appendChild( e("ul", {html: arg.ul}) );
        div.appendChild(c);
    }
    if (arg.markdown)
        arg.html = renderMarkdown(arg.markdown);
    if (arg.html)
        div.appendChild( e("div", baseStyle, {left: "5%", width: "90%", top: "10%", html: arg.html}) );
    if (arg.caption)
        div.appendChild( e("div", baseStyle, {fontSize: "1em",
            top: "90%", textAlign: "center", text: arg.caption, color: "#fff",
            textShadow: "0px 0px 20px #000"} ));

    [].forEach.call(div.getElementsByTagName("h1"), e => applyStyle(e, {
        textAlign: "center", fontSize: "1.5em", marginTop: 0, fontWeight: "normal"}));
    [].forEach.call(div.getElementsByTagName("li"), e => applyStyle(e, {marginBottom: "0.4em"}));
}

function defaultTemplate(div, arg)
{
    addElements(div, arg);
}

function autoStyle(div, arg)
{
    addElements(div, arg);

    var img = div.getElementsByTagName("img")[0];
    if (img) {
        var h1 = div.getElementsByTagName("h1")[0];
        while (div.lastChild) div.removeChild(div.lastChild);
        return addElements(div, {imageUrl: img.src, caption: h1.innerHTML});
    }

    var h2 = div.getElementsByTagName("h2")[0];
    if (h2) {
        var h1 = div.getElementsByTagName("h1")[0];
        while (div.lastChild) div.removeChild(div.lastChild);
        return addElements(div, {title: h1.innerHTML, subtitle: h2.innerHTML});
    }
}

function makeSlides(html)
{
    return html.split("<h1").slice(1)
        .map(h => "<h1" + h)
        .map(h => {return {template: autoStyle, html: h}});
}

// ------------------------------------------------------------
// Slides
// ------------------------------------------------------------

var slides = [
    ...makeSlides(renderMarkdown(`
# Stingray Overview

## Niklas Frykholm, 01 March 2016

# Main Stingray Components

![](img/data-flow.jpg)

# Data

* Everything is a <em>resource</em> idenitfied by name and type: \`vegetation/trees/05_larch.unit\`
* Source data is in JSON
* Compiled data matches runtime memory (per platform)
* Resources are loaded/unloaded together in <em>packages</em>
* For final distribution, packages are compiled into <em>bundles</em>.
* Core - shared resources

# Runtime

* C++ based high-performance executable
* Compiled for each target platform
* Three flavors: debug, dev, release
* The windows runtime can also do other stuff: compile data, serve files, etc

# Editor

* Separate executable written in HTML, JavaScript, C# and (a little) C++
* Front-end is Chromium + JavaScript
* Backend is C#
* We also have some old tools written in C# WPF/WinForms that haven't yet
        been converted into the new system

# Editor Viweports

![](img/editor-viewport.jpg)

# Editor Viewports

* Since everything is Websocket based, the editor can connect against remote viewports
* Viewport mirrored on iOS, Android, etc
* We can also launch the game on these platforms
* Data on the remote platforms is loaded over a Websocket connection to the <em>Asset Server</em>

# Development

* Git
* Pull requests + peer review
* CI builds
* Goal settings meeting
* Scrum

# Build System

* Cmake
* spm
* make.rb

# Documentation

* Markdown
* Adoc
* Wiki

# Testing

* Unit tests
* Regression tests
* Backend & frontend tests

# Investigating a Running Program

* Profiler
* Memory tracker
* Perfhud
* Lua debugger
* Console

# Building a Game

* Editing data
* Lua scripting
* Flow
* Plugins
* C API
* Script data

# Entity

# Flow

# UI

* Built-in UI
* Scaleform

# World

* Worlds, units & levels
* Lights, cameras, volumes, sounds

# Network

* Matchmaking
* Network compressed protocol
* Object synchronization
* RPCs

# Particle System

* Future ideas - bufferbuffer

# Plugin System

* Plugin C API
* Hot-Reloadable plugins
* Single function, request interfaces

# Rendering

* Meshes
* Materials/shaders
* Post effects

# Lua Scripting

* Hand-written Interfaces
* Hot-Reloadable
* Single threaded
* Adoc documentation

# Sound

* Wwise integration
* Controlled through events/parameters
* Old, internal sound system (timpani)/li>

# Story

* Animation system for levels
* Draw curves controlling properties

# Terrain

# Navigation

# Animation

* Low level curve evaluation
* High-level state machine with blending

# Input

* Abstract "controllers" with axes and buttons

# Physics

* Rigid body simulation -- PhysX
* Raycasts -- queries
* "Mover" -- character controller
* Joints, connecting bodies
* Vehicles
* APEX Cloth -- cloth simulation
* Vector fields -- wind simulation

# Scene Graphs

* Hierarchical simulation
* Local and world transforms
* Linking of objects

# Collection Classes

* Minimalistic set: Array, HashMap, HashSet, Vector
* No STL
* No string class -- Array&lt;char&gt;
* IdString32/64 -- string hashes, used almost everywhere

# Compiling Resources

* JSON representation
* Parsed into <tt>DynamicConfigValue</tt> -- C++ representation
* Packed into packed data representation
* Same on disk and in memory

# Utility

* ConsoleServer -- WebSocket for external to connect to
* XASSERT() -- asserts with callstack generation
* logging::info() -- logging
* Logged to file and console server

# IO

* File system abstraction <tt>IFileSystem</tt>
* Backend can be real file system, network, bundle or memory

# Memory

* Explicit allocators <tt>Allocator</tt> -- passed to systems
* Different types
* TempAllocator -- for temporary memory
* TraceAllocator -- traces memory use, error on memory leaks
* PageAllocator at foundation

# Threading

* Two main pipelined threads: core, render
* Job system -- perfect subscription
* Background threads for background tasks
* Challenge: More paralelism
* Challenge: How prioritize jobs
* Challenge: Multithread of gameplay

# Q & A

* Presentation made in [nfslides](https://github.com/niklasfrykholm/nfslides)
    `)),
]
