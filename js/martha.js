/*!
 * Copyright 2022 Oqaasileriffik <oqaasileriffik@oqaasileriffik.gl> at https://oqaasileriffik.gl/
 *
 * This project is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This project is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this project.  If not, see <http://www.gnu.org/licenses/>.
 */

(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory);
	}
	else if (typeof module === 'object' && module.exports) {
		module.exports = factory();
	}
	else {
		root.martha = factory();
	}
}(typeof self !== 'undefined' ? self : this, function () {
	'use strict';

	let g_tts = {
		todo: [],
		i: 0,
		audio: [],
		a: 0,
		du: 0,
		};

	// Formats a floating point timestamp, e.g. 62.54 into 1:03
	function formatTime(t) {
		let m = Math.floor(t/60);
		t -= m*60;
		t = Math.ceil(t);
		if (t.toString().length < 2) {
			t = '0'+t.toString();
		}
		return m+':'+t;
	}

	// Expands a potentially partial selection to encompass whole words, minus whitespace
	function expandToWord(range) {
		if (range.collapsed) {
			return;
		}

		while (range.startOffset > 0 && /\w/.test(range.toString()[0])) {
			range.setStart(range.startContainer, range.startOffset - 1);
		}
		if (/\s/.test(range.toString()[0])) {
			range.setStart(range.startContainer, range.startOffset + 1);
		}

		while (range.endOffset < range.endContainer.length && /\w/.test(range.toString()[range.toString().length - 1])) {
			range.setEnd(range.endContainer, range.endOffset + 1);
		}
		if (/\s/.test(range.toString()[range.toString().length - 1])) {
			range.setEnd(range.endContainer, range.endOffset - 1);
		}
	}

	// Finds text nodes in the Range, but excludes ones not currently rendered. Also excludes ones matching the `except` condition.
	function findVisibleTextNodesInRange(range, except) {
		let tns = [];
		let foundStart = false;
		let foundEnd = false;

		function _findVisibleTextNodesInRange(node) {
			if (node == range.startContainer) {
				foundStart = true;
			}

			if (node.nodeType === Node.TEXT_NODE) {
				// Strip Google Docs bullet marks so those elements are not considered visible text
				let nv = node.nodeValue.replace(/\u200b/g, '').replace(/[●○■❖➢❏➔◆★]+/g, '');
				if (/\w/.test(nv) && foundStart) {
					tns.push(node);
				}
			}
			else if (node.nodeType === Node.ELEMENT_NODE) {
				if (typeof except === 'string' && node.matches(except)) {
					//console.log([node, except]);
					return;
				}
				if (node.nodeName === 'STYLE' || node.nodeName === 'SCRIPT') {
					return;
				}
				let sts = window.getComputedStyle(node);
				if (sts.display === 'none' || sts.visibility === 'hidden' || sts.visibility === 'collapse') {
					return;
				}
				for (let i=0 ; !foundEnd && i < node.childNodes.length ; ++i) {
					_findVisibleTextNodesInRange(node.childNodes[i]);
				}
			}

			if (node == range.endContainer) {
				foundEnd = true;
			}
		}

		_findVisibleTextNodesInRange(range.commonAncestorContainer);

		return tns;
	}

	// Removes all the word highlight wrappings and hides the playback control bar
	function clearTTS() {
		let ns = document.querySelectorAll('.martha-tts');
		for (let i=0 ; i<ns.length ; ++i) {
			if (ns[i].previousSibling && ns[i].previousSibling.nodeType === Node.TEXT_NODE) {
				ns[i].previousSibling.textContent += ns[i].textContent;
				ns[i].parentNode.removeChild(ns[i]);
			}
			else if (ns[i].nextSibling && ns[i].nextSibling.nodeType === Node.TEXT_NODE) {
				ns[i].nextSibling.textContent = ns[i].textContent + ns[i].nextSibling.textContent;
				ns[i].parentNode.removeChild(ns[i]);
			}
			else {
				ns[i].parentNode.replaceChild(document.createTextNode(ns[i].textContent), ns[i]);
			}
		}
		document.getElementById('martha-controls').setAttribute('style', 'display: none');
	}

	// Plays the next audio chunk, if there is one. If there isn't, wipes all state.
	function playNext() {
		++g_tts.a;
		if (g_tts.a < g_tts.audio.length) {
			g_tts.audio[g_tts.a].p.play();
		}
		else {
			clearTTS();
		}
	}

	// Figures out which token matches the current timestamp and highlights that. Also updates the playback controls.
	function updatePlayback() {
		if (!g_tts.audio.length || g_tts.a >= g_tts.audio.length) {
			return;
		}
		let w = 0;
		for (let i=0 ; i<g_tts.audio[g_tts.a].ts.length ; ++i) {
			if (g_tts.audio[g_tts.a].ts[i][0] >= g_tts.audio[g_tts.a].p.currentTime) {
				break;
			}
			w = i;
		}
		let ns = document.querySelectorAll('.martha-current');
		for (let i=0 ; i<ns.length ; ++i) {
			ns[i].classList.remove('martha-current');
		}
		document.getElementById('martha-'+g_tts.a+'-'+w).classList.add('martha-current');

		// Update playback controls
		let du = g_tts.audio[g_tts.a].td + g_tts.audio[g_tts.a].p.currentTime;
		document.getElementById('martha-ctime').textContent = formatTime(du);
		document.getElementById('martha-seeker').value = du;
	}

	// Handles a new chunk loaded, and queues the next load
	function loadedRemote() {
		let rv = JSON.parse(this.responseText);
		let p = new Audio('https://oqaasileriffik.gl/martha/data/'+rv.fn.substr(0, 2)+'/'+rv.fn.substr(2, 2)+'/'+rv.fn);
		p.addEventListener('ended', playNext);
		p.addEventListener('timeupdate', updatePlayback);

		g_tts.audio.push({
			p: p,
			td: g_tts.du,
			du: rv.du,
			ts: rv.ts,
			});
		g_tts.du += rv.du;
		document.getElementById('martha-seeker').max = g_tts.du;
		document.getElementById('martha-ttime').textContent = formatTime(g_tts.du);
		document.getElementById('martha-controls').removeAttribute('style');

		// Break the source text node into spans of individual words so they can be highlighted
		let html = document.createDocumentFragment();
		let txt = g_tts.todo[g_tts.i].textContent;
		for (let i=0 ; i<rv.ts.length ; ++i) {
			let pos = txt.indexOf(rv.ts[i][1]);
			if (pos === -1) {
				continue;
			}
			if (pos > 0) {
				let prefix = txt.substr(0, pos);
				html.appendChild(document.createTextNode(prefix));
				txt = txt.substr(pos);
			}

			let span = document.createElement('span');
			span.setAttribute('id', 'martha-'+g_tts.i+'-'+i);
			span.setAttribute('class', 'martha-tts');
			span.textContent = txt.substr(0, rv.ts[i][1].length);
			html.appendChild(span);
			txt = txt.substr(rv.ts[i][1].length);
		}
		if (txt.length) {
			html.appendChild(document.createTextNode(txt));
		}
		g_tts.todo[g_tts.i].parentNode.replaceChild(html, g_tts.todo[g_tts.i]);

		// If this is the first chunk of a new session, start playing immediately
		if (g_tts.i === 0) {
			g_tts.audio[0].p.play();
		}

		// Queue next MP3
		++g_tts.i;
		loadRemote();
	}

	// Call the Martha backend to generate MP3 and token offsets
	function loadRemote() {
		if (g_tts.i < g_tts.todo.length) {
			let rq = new XMLHttpRequest();
			rq.addEventListener('load', loadedRemote);
			rq.open('GET', 'https://oqaasileriffik.gl/martha/tts/?n=json&t='+encodeURIComponent(g_tts.todo[g_tts.i].textContent.trim()));
			rq.send();
		}
	}

	// Read all text in a list of Ranges
	function speakRanges(rngs) {
		// Stop any existing playback
		if (g_tts.audio.length && g_tts.a < g_tts.audio.length) {
			g_tts.audio[g_tts.a].p.pause();
		}
		// Change existing wrapped tokens so they won't conflict with new reading
		let ns = document.querySelectorAll('.martha-tts');
		for (let i=0 ; i<ns.length ; ++i) {
			ns[i].removeAttribute('id');
			ns[i].classList.add('martha-tts-old');
		}

		// Reset all state
		g_tts = {
			todo: [],
			i: 0,
			audio: [],
			a: 0,
			du: 0,
			};

		for (let i=0 ; i<rngs.length ; ++i) {
			let rng = rngs[i];
			let tns = findVisibleTextNodesInRange(rng, '.martha-skip');

			// Handle the case where a Range only partially covers a text node
			// Most of this is only relevant for ranges from Selection, since other ranges' startContainer is not a text node
			if (rng.startContainer === tns[0]) {
				if (rng.startContainer !== rng.endContainer) {
					// Prefix is the text before the selection
					let prefix = rng.cloneRange();
					prefix.setStart(rng.startContainer, 0);
					prefix.setEnd(rng.startContainer, rng.startOffset);

					// Suffix is the selected text
					let suffix = rng.cloneRange();
					suffix.setEndAfter(rng.startContainer);
					console.log([prefix.toString(), suffix.toString()]);

					let html = document.createDocumentFragment();
					if (prefix.toString().length) {
						html.appendChild(document.createTextNode(prefix.toString()));
					}
					let span = document.createElement('span');
					span.setAttribute('id', 'martha-'+g_tts.todo.length);
					span.setAttribute('class', 'martha-tts');
					span.textContent = suffix.toString();
					html.appendChild(span);
					g_tts.todo.push(span);
					rng.startContainer.parentNode.replaceChild(html, rng.startContainer);
				}
				else {
					// Prefix is the text before the selection
					let prefix = rng.cloneRange();
					prefix.setStart(rng.startContainer, 0);
					prefix.setEnd(rng.startContainer, rng.startOffset);

					// Middle is the selected text
					let middle = rng.cloneRange();

					// Suffix is the text after the selection
					let suffix = rng.cloneRange();
					suffix.setStart(rng.endContainer, rng.endOffset);
					suffix.setEndAfter(rng.endContainer);

					let html = document.createDocumentFragment();
					if (prefix.toString().length) {
						html.appendChild(document.createTextNode(prefix.toString()));
					}
					let span = document.createElement('span');
					span.setAttribute('id', 'martha-'+g_tts.todo.length);
					span.setAttribute('class', 'martha-tts');
					span.textContent = middle.toString();
					html.appendChild(span);
					if (suffix.toString().length) {
						html.appendChild(document.createTextNode(suffix.toString()));
					}
					g_tts.todo.push(span);
					rng.startContainer.parentNode.replaceChild(html, rng.startContainer);
				}
				tns.shift();
			}

			// For selections, pop the last text node to handle after the loop
			let last = null;
			if (rng.endContainer === tns[tns.length-1]) {
				last = tns.pop();
			}

			// Wrap all text nodes in spans so we can find them again
			for (let j=0 ; j<tns.length ; ++j) {
				let html = document.createDocumentFragment();
				let span = document.createElement('span');
				span.setAttribute('id', 'martha-'+g_tts.todo.length);
				span.setAttribute('class', 'martha-tts');
				span.textContent = tns[j].textContent;
				html.appendChild(span);
				g_tts.todo.push(span);
				tns[j].parentNode.replaceChild(html, tns[j]);
			}

			if (last) {
				// Prefix is the selected text
				let prefix = rng.cloneRange();
				prefix.setStartBefore(rng.endContainer);

				// Suffix is the text after the selection
				let suffix = rng.cloneRange();
				suffix.setStart(rng.endContainer, rng.endOffset);
				suffix.setEndAfter(rng.endContainer);

				console.log([prefix.toString(), suffix.toString()]);

				let html = document.createDocumentFragment();
				let span = document.createElement('span');
				span.setAttribute('id', 'martha-'+g_tts.todo.length);
				span.setAttribute('class', 'martha-tts');
				span.textContent = prefix.toString();
				html.appendChild(span);
				if (suffix.toString().length) {
					html.appendChild(document.createTextNode(suffix.toString()));
				}
				g_tts.todo.push(span);
				rng.endContainer.parentNode.replaceChild(html, rng.endContainer);
			}
		}

		// Queue loading the first MP3
		loadRemote();
	}

	// Button callback to read based on button data attributes
	function buttonRead(e) {
		e.preventDefault();
		clearTTS();
		let art = [];
		if (this.hasAttribute('data-martha-id')) {
			art.push(document.getElementById(this.getAttribute('data-martha-id')));
		}
		else if (this.hasAttribute('data-martha-select')) {
			let ns = document.querySelectorAll(this.getAttribute('data-martha-select'));
			for (let i=0 ; i<ns.length ; ++i) {
				art.push(ns[i]);
			}
		}
		else if (this.hasAttribute('data-martha-parent')) {
			for (let n = this ; n && n.parentNode != n ; n = n.parentNode) {
				if (n.nodeType === Node.ELEMENT_NODE && n.matches(this.getAttribute('data-martha-parent'))) {
					art.push(n);
					break;
				}
			}
		}
		else {
			for (let n = this ; n && n.parentNode != n ; n = n.parentNode) {
				if (n.classList.contains('martha-article')) {
					art.push(n);
					break;
				}
			}
		}
		if (!art.length) {
			alert('No target found via martha-id, martha-select, martha-parent, or parent .martha-article to start from!');
			return false;
		}

		let rngs = [];
		for (let i=0 ; i<art.length ; ++i) {
			let rng = new Range();
			rng.selectNodeContents(art[i]);
			rngs.push(rng);
		}
		speakRanges(rngs);
		return false;
	}

	function buttonSelected(e) {
		e.preventDefault();
		let sel = window.getSelection();
		if (sel.type !== 'Range') {
			alert('Must select a text range!');
			return false;
		}

		let rngs = [];
		for (let i = 0; i < sel.rangeCount; ++i) {
			rngs[i] = sel.getRangeAt(i).cloneRange();
			expandToWord(rngs[i]);
		}
		sel.removeAllRanges();
		speakRanges(rngs);
		return false;
	}

	function contentLoaded() {
		// Find all buttons and make them do stuff
		let ns = document.querySelectorAll('.martha-button');
		for (let i=0 ; i<ns.length ; ++i) {
			ns[i].addEventListener('click', buttonRead);
		}

		// Append the CSS style
		let html = document.createDocumentFragment();
		let style = document.createElement('style');
		style.setAttribute('id', 'martha-style');
		style.textContent = '#martha-selected {position: absolute; background-color: white; box-shadow: 0px 0px 5px 5px white; cursor: pointer;} #martha-controls {position: fixed; bottom: 0; display: flex; width: 100%; justify-content: center;} #martha-controls > div { border: 1px solid white; background-color: black; color: white; padding: 1ex; font-size: 1.2em;} #martha-controls img {height: 30px} .martha-brand {margin-left: 2ex; display: inline-block; text-align: center;} .martha-current {box-shadow: 0px 2px 2px 2px rgba(255, 0, 0, 0.75);}';
		document.head.appendChild(style);

		// Create the popup button for selections, if it doesn't already exist
		let button = document.getElementById('martha-selected');
		if (!button) {
			html = document.createDocumentFragment();
			let div = document.createElement('div');
			div.setAttribute('id', 'martha-selected');
			div.setAttribute('style', 'display: none');
			div.setAttribute('class', 'martha-skip');
			let button = document.createElement('button');
			button.innerHTML = '&#x1F508; Read selection';
			button.addEventListener('click', buttonSelected);
			div.appendChild(button);
			html.appendChild(div);
			document.body.appendChild(html);
		}
		else {
			button.addEventListener('click', buttonSelected);
		}

		// Create the playback controls
		html = document.createDocumentFragment();
		let div = document.createElement('div');
		div.setAttribute('id', 'martha-controls');
		div.setAttribute('style', 'display: none');
		div.innerHTML = '<div><tt id="martha-ctime" title="Current time">0:00</tt> <input id="martha-seeker" type="range" step="0.1" min="0" max="100" title="Seek in playback"> <tt id="martha-ttime" title="Total duration">0:00</tt> <button id="martha-play" title="Play/Pause">&#x23EF;</button> <button id="martha-stop" title="Stop">&#x23F9;</button> <div class="martha-brand"><a href="https://oqaasileriffik.gl/" target="_blank" title="Martha text-to-speech by Oqaasileriffik"><img src="https://oqaasileriffik.gl/wp-content/uploads/2021/04/knot2.png"></a></div></div>';
		html.appendChild(div);
		document.body.appendChild(html);

		// Make the playback controls do something
		document.getElementById('martha-seeker').addEventListener('change', function() {
			if (!g_tts.audio.length || g_tts.a >= g_tts.audio.length) {
				return;
			}
			g_tts.audio[g_tts.a].p.pause();
			g_tts.audio[g_tts.a].p.currentTime = 0;
			for (g_tts.a = 0 ; g_tts.a<g_tts.audio.length ; ++g_tts.a) {
				if (g_tts.audio[g_tts.a].td + g_tts.audio[g_tts.a].du >= this.value) {
					g_tts.audio[g_tts.a].p.currentTime = this.value - g_tts.audio[g_tts.a].td;
					g_tts.audio[g_tts.a].p.play();
					break;
				}
			}
		});
		document.getElementById('martha-play').addEventListener('click', function() {
			if (!g_tts.audio.length || g_tts.a >= g_tts.audio.length) {
				return;
			}
			if (g_tts.audio[g_tts.a].p.paused) {
				g_tts.audio[g_tts.a].p.play();
			}
			else {
				g_tts.audio[g_tts.a].p.pause();
			}
		});
		document.getElementById('martha-stop').addEventListener('click', function() {
			if (!g_tts.audio.length || g_tts.a >= g_tts.audio.length) {
				return;
			}
			g_tts.audio[g_tts.a].p.pause();
			clearTTS();
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', contentLoaded);
	}
	else {
		contentLoaded();
	}

	document.addEventListener('selectionchange', function() {
		let sel = window.getSelection();
		if (sel.type !== 'Range') {
			document.getElementById('martha-selected').setAttribute('style', 'display: none');
			return;
		}

		let pos = sel.getRangeAt(0).getClientRects()[0];
		document.getElementById('martha-selected').setAttribute('style', 'left: '+pos.x+'px; top: '+(pos.y - 50)+'px');
	});

	// Export useful functions. This shows up in browsers as e.g. martha.click()
	return {
		click: buttonRead,
		};
}));
