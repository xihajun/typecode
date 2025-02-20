// global vars
var editor; // code mirror instance
var incompleteMark;
var focused = false;
let invalids = [];
var fileLines;
// WPM tracking
var lastStartTime;
var elapsedTime;

let hash = window.location.hash.substring(1);
let hashBits = hash.split("/");
let repo = hashBits.slice(0, 3).join("/");
let filePath = hashBits.slice(3, hashBits.length).join("/");

// language selector
let languageSelecor = $("#language");
languageSelecor.change(() => {
	let selected = languageSelecor.val();
	var language;
	if (selected == "auto-detect") {
		language = getLanguageByExtension(getFileExtension());
	} else {
		language = languages[selected];
	}
	setLanguage(language);
});
for (key in languages) {
	languageSelecor.append(`<option value="${key}">${key}</option>`);
}

// theme selector
let themeSelector = $("#theme");
themeSelector.change(() => {
	setTheme(themeSelector.val());
	save();
});

//insert
Array.prototype.insert = function ( index, item ) {
    this.splice( index, 0, item );
};
// restart button
$("#restart").click(() => {
	localforage.getItem(repo)
		.then((val) => {
			val[filePath] = {};
			localforage.setItem(repo, val)
				.then(() => {
					window.location.reload();
				})
				.catch((e) => {
					throw e;
				});
		})
		.catch((e) => {
			throw e;
		});
});

// restart button
$("#random").click(() => {

});

// back button
$("#back").click(() => {
	window.location.href = `repo.html#${repo}`;
});
myFunction()

$(document).ready(function() {
	// Paste code modal functionality
	const modal = document.getElementById('paste-modal');
	const pasteBtn = document.getElementById('paste-code');
	const closeBtn = document.querySelector('.close-modal');
	const cancelBtn = document.querySelector('.cancel-btn');
	const confirmBtn = document.querySelector('.confirm-btn');
	const codeInput = document.getElementById('code-input');

	pasteBtn.onclick = function() {
		modal.style.display = 'block';
		codeInput.value = '';
	}

	closeBtn.onclick = function() {
		modal.style.display = 'none';
	}

	cancelBtn.onclick = function() {
		modal.style.display = 'none';
	}

	confirmBtn.onclick = function() {
		const code = codeInput.value.trim();
		if (code) {
			localforage.getItem(repo)
				.then((val) => {
					val[filePath] = {};
					return localforage.setItem(repo, val);
				})
				.then(() => {
					editor.setValue(code);
					setupEditor();
					modal.style.display = 'none';
				})
				.catch((e) => {
					console.error('Error clearing progress:', e);
				});
		}
	}

	window.onclick = function(event) {
		if (event.target == modal) {
			modal.style.display = 'none';
		}
	}
    $('#import-code').click(function() {
        $('#code-file').click();
    });

    $('#code-file').change(function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result;
                editor.setValue(content);
                editor.refresh();
                // Reset typing progress
                restart();
            };
            reader.readAsText(file);
        }
    });
});

// fetch file and setup
function myFunction(){
    // var urls = ['https://raw.githubusercontent.com/xihajun/SmartDevice/main/test1.py',
	//       'https://raw.githubusercontent.com/ZHUANGHP/LeetCode-Solution-Python/master/tree/0094-binary-tree-inorder-traversal-1.py']
	var urls = ['https://raw.githubusercontent.com/xihajun/typecode/main/code/splitmodel.py']
    var url = getRandomSubarray(urls, 1);
    
    //var givenurl = document.getElementById("url").value;

//    if(givenurl){
//	url = givenurl
//	window.url = url
//    }else{
//	window.url = url
//	
//    }
//    
    console.log(url)

   // location.reload()
    if(fileLines==null){
	geturlsetup(url)
    }else{
	document.getElementById("restart").click()
	geturlsetup(url)
	
    }

}

function getRandomSubarray(arr, size) {
    var shuffled = arr.slice(0), i = arr.length, temp, index;
    while (i--) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(0, size);
}
function randomsample(){
    var urls = ['https://raw.githubusercontent.com/xihajun/SmartDevice/main/test1.py']
    var randomFiveNumbers = _.sample(urls, 1);
    

}
function geturlsetup(test){
jQuery.get({
    url: test,
	success: (code) => {
	        fileLines = code.split("\n");
	        fileLines.insert(0, '');

       	        console.log(fileLines)
		getChunk(code)
			.then((chunk) => {
				let lang = getLanguageByExtension(getFileExtension());
				console.log(`Detected language as ${lang.mime}`);
				if (Array.isArray(lang.file)) {
					if (lang.file.length != 0) {
						var req = req = $.getScript(`https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.19.0/mode/${lang.file[0]}/${lang.file[0]}.min.js`);
						for (var i = 1; i < lang.file.length; i++) {
							req = req.then($.getScript(`https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.19.0/mode/${lang.file[i]}/${lang.file[i]}.min.js`));
						}
						req.then(() => {
							setup(chunk, lang.mime);
						});
					} else {
						setup(chunk, lang.mime);
					}
				} else {
					$.getScript(`https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.19.0/mode/${lang.file}/${lang.file}.min.js`, () => {
						setup(chunk, lang.mime);
					});
				}
			})
			.catch((e) => {
				throw e;
			})
	}
});

}
// setup
function setup(data, mime) {
	let el = document.getElementById("editor");
	el.value = data;
	editor = CodeMirror.fromTextArea(el, {
		mode: mime,
		readOnly: true,
		autofocus: true,
		extraKeys: {
			Up: () => {},
			Down: () => {},
			Left: () => {},
			Right: () => {}
		}
	});

	editor.setSize("100%", "100%");

	load()
		.then(save)
		.then(() => {
			incompleteMark = editor.doc.markText(editor.getCursor(), getEndPos(), {
				className: "incomplete"
			});

			resume();

			editor.on("focus", handleFocus);
			editor.on("blur", handleBlur);
			editor.on("mousedown", handleMouseDown);

			document.addEventListener("keypress", handleKeyPress);
			document.addEventListener("keydown", handleKeyDown);

		})
		.catch((e) => {
			throw e;
		});
}

function handleFocus() {
	resume();
}

function handleBlur() {
	pause();
}

function handleMouseDown(instance, event) {
	event.preventDefault();
	editor.focus();
}

function handleKeyPress(event) {
	if (focused) {
		event.preventDefault();

		let pos = editor.getCursor();
		let line = editor.doc.getLine(pos.line);
		let char = line.charCodeAt(pos.ch);
		if (event.charCode != char) {
			markInvalid(pos);
		}
		setCursor({ line: pos.line, ch: pos.ch + 1 });
		updateIncompleteMark();
	}
}

function handleKeyDown(event) {
	if (focused) {
		if (event.keyCode == 8) { // delete
			event.preventDefault();
			handleDelete(event);
		} else if (event.keyCode == 13) { // enter
			event.preventDefault();
			handleEnter(event);
		} else if (event.keyCode == 9) { // tab
			event.preventDefault();
			handleTab(event);
		} else if (event.keyCode == 27) { // escape
			event.preventDefault();
			pause();
		}
	} else {
		if (event.keyCode == 27) {
			event.preventDefault();
			resume();
		}
	}
}

function handleDelete(event) {
	let pos = editor.getCursor();
	if (pos.ch == 0) { // move up 1 line
		moveToEndOfPreviousLine();
	} else { // move back 1 char
		let line = editor.doc.getLine(pos.line);
		if (line.hasOnlyWhiteSpaceBeforeIndex(pos.ch)) {
			moveToEndOfPreviousLine();
		} else {
			setCursor({ line: pos.line, ch: pos.ch - 1 });
		}
	}

	let newPos = editor.getCursor();
	let lineInvalids = invalids[newPos.line];
	if (lineInvalids) {
		let mark = lineInvalids[newPos.ch];
		if (mark) {
			mark.clear();
			lineInvalids.splice(newPos.ch, 1);
		}
	}

	updateIncompleteMark();
}


function isCharacterALetter(char) {
  return (/[a-zA-Z]/).test(char)
}


function handleEnter(event) {
	let pos = editor.getCursor();
	let currentLine = editor.doc.getLine(pos.line);
	let trimmed = currentLine.trim();
	if (editor.getCursor().ch >= currentLine.indexOf(trimmed) + trimmed.length) {
		if (pos.line < editor.doc.size - 1) {
			var newLine = pos.line;
			while (true) {
				newLine++;
				if (newLine >= editor.doc.size) { // go to end of last line
					setCursor(getEndPos());
					break;
				} else { // try go to next line
					let newText = editor.doc.getLine(newLine);
				        let newTrimmed = newText.trim();
				    console.log(isCharacterALetter(newTrimmed[0]))
				    if (newTrimmed.length != 0 & isCharacterALetter(newTrimmed[0]) & newTrimmed[0]!='#') { // [xihajun motified for python only] line is not empty (whitespace-only)
						let ch = newText.indexOf(newTrimmed);
						setCursor({ line: newLine, ch: ch });
						break;
					}
				}
			}
			updateIncompleteMark();
			updateWPM();
			save();
		} else {
			goToNextChunk();
		}
	}
}

function handleTab(event) {
	let pos = editor.getCursor();
	let line = editor.doc.getLine(pos.line);
	if (line.charCodeAt(pos.ch) == 9) {
		setCursor({ line: pos.line, ch: pos.ch + 1 });
	}
}

function moveToEndOfPreviousLine() {
	let pos = editor.getCursor();
	if (pos.line > 0) {
		var newLine = pos.line;
		while (true) {
			newLine--;
			if (newLine < 0) {
				setCursor({ line: 0, ch: 0 });
				break;
			}
			let text = editor.doc.getLine(newLine);
			let trimmed = text.trim();
			if (trimmed.length != 0) {
				let ch = text.indexOf(trimmed) + trimmed.length;
				setCursor({ line: newLine, ch: ch });
				save();
				break;
			}
		}
	} else {
		save();
		goToPrevChunk();
	}
}

function isComplete() {
	if (!areAllNextLinesEmpty()) {
		if (incompleteMark.lines.length != 0) {
			return false;
		}
	}

	for (var i = 0; i < invalids.length; i++) {
		let arr = invalids[i];
		if (arr) {
			for (var j = 0; j < arr.length; j++) {
				// invalid marks are sometimes cleared but not removed
				// this can be checked by checking mark.lines.length != 0
				if (arr[j] && arr[j].lines.length != 0) {
					return false;
				}
			}
		}
	}
	return true;
}

function areAllNextLinesEmpty() {
	let pos = editor.getCursor();
	for (var i = pos.line + 1; i < editor.doc.size; i++) {
		let line = editor.doc.getLine(i);
		if (line.trim().length != 0) {
			return false;
		}
	}
	return true;
}

function getStartPos() {
	var line = 0;
	while (true) {
		let text = editor.doc.getLine(line);
		let trimmed = text.trim();
		if (trimmed.length != 0) {
			return { line: line, ch: text.indexOf(trimmed) };
		}
		line++;
	}
}

function getEndPos() {
	var line = editor.doc.size - 1;
	while (true) {
		if (line <= editor.doc.size) {
			return { line: editor.doc.size - 1, ch: editor.doc.getLine(editor.doc.size - 1).length - 1 };
		}
		let text = editor.doc.getLine(line);
		let trimmed = text.trim();
		if (trimmed.length != 0) {
			return { line: line, ch: text.indexOf(trimmed) + trimmed.length };
		}
		line--;
	}
}

function updateIncompleteMark() {
	incompleteMark.clear();
	incompleteMark = editor.doc.markText(editor.getCursor(), getEndPos(), {
		className: "incomplete"
	});
}

function markInvalid(pos) {
	let mark = editor.doc.markText(pos, {line: pos.line, ch: pos.ch + 1}, {
		className: "invalid"
	});
	if (!invalids[pos.line]) invalids[pos.line] = [];
	invalids[pos.line][pos.ch] = mark;
}

function setLanguage(lang) {
	$.getScript(`https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.19.0/mode/${lang.file}/${lang.file}.min.js`, () => {
		editor.setOption("mode", lang.mime);
		console.log(`Changed language to ${lang.mime}`);
	});
}

function getFileExtension() {
	let parts = filePath.split(".");
	return parts[parts.length - 1];
}
function getChunk(code) {
        // get chuck with smaller size (50 lines) for better readability
	let lines = code.split("\n");
	return localforage.getItem(repo)
		.then((val) => {
			if (val && val[filePath] && val[filePath].chunk) {
				let chunk = val[filePath].chunk;
				let totalChunks = Math.ceil(lines.length / 50);
				if (chunk == totalChunks - 1) {
					return lines.slice(lines.length - (lines.length % 50 || 50), lines.length);
				} else {
					return lines.slice(chunk * 50, Math.min((chunk + 1) * 50, lines.length));
				}
			} else {
				if (!val) val = {};
				if (!val[filePath]) val[filePath] = {};
				val[filePath].chunk = 0;
				localforage.setItem(repo, val)
					.catch((e) => {
						throw e;
					});
				return lines.slice(0, Math.min(50, lines.length));
			}
		})
		.then((lines) => {
			return lines.join("\n");
		});
}
function goToNextChunk() {
	localforage.getItem(repo)
		.then((val) => {
			let chunk = val[filePath].chunk;
			let totalChunks = Math.ceil(fileLines.length / 20);
			if (chunk < totalChunks - 1) {
				val[filePath].chunk++;
				localforage.setItem(repo, val)
					.then(() => {
						window.location.reload();
					})
					.catch((e) => {
						throw e;
					});
			} else {
				window.location.href = `complete.html#${hash}`;
			}
		})
		.catch((e) => {
			throw e;
		});
}

function goToPrevChunk() {
	localforage.getItem(repo)
		.then((val) => {
			let chunk = val[filePath].chunk;
			if (chunk > 0) {
				val[filePath].chunk--;
				localforage.setItem(repo, val)
					.then(() => {
						window.location.reload();
					})
					.catch((e) => {
						throw e;
					});
			}
		})
		.catch((e) => {
			throw e;
		});
}

function load() {
	localforage.getItem("theme")
		.then(loadTheme);
	return localforage.getItem(repo)
		.then((val) => {
			if (val && val[filePath] && val[filePath].hasOwnProperty("chunk") && val[filePath].chunks) {
				let chunk = val[filePath].chunks[val[filePath].chunk];
				loadInvalids(chunk);
				loadCursor(chunk);
				loadElapsedTime(chunk);
			} else {
				save();
			}
		});
}

function save() {
	localforage.setItem("theme", saveTheme());
	return localforage.getItem(repo)
		.then((val) => {
			if (!val) val = {};
			if (!val[filePath]) val[filePath] = {};
			let file = val[filePath];
			
			if (!file.chunk) file.chunk = 0;
			if (!file.chunks) file.chunks = [];
			if (!file.chunks[file.chunk]) file.chunks[file.chunk] = {};
			
			let chunk = file.chunks[file.chunk];
			saveInvalids(chunk);
			saveCursor(chunk);
			saveElapsedTime(chunk);

			localforage.setItem(repo, val)
				.catch((e) => {
					throw e;
				});
		})
		.catch((e) => {
			throw e;
		});
}

function loadInvalids(obj) {
	if (obj && obj.invalids) {
		editor.operation(() => { // buffer all DOM changes together b/c performance
			obj.invalids.forEach(markInvalid);
		});
	}
}

function saveInvalids(obj) {
	let serialized = [];
	for (var i = 0; i < invalids.length; i++) {
		let inner = invalids[i];
		if (!inner) continue;

		for (var j = 0; j < inner.length; j++) {
			let mark = inner[j];
			if (!mark) continue;

			let pos = mark.find();
			if (pos) {
				serialized.push(pos.from);
			}
		}
	}
	obj.invalids = serialized;
}

function loadTheme(theme) {
	if (theme) {
		themeSelector.val(theme);
		setTheme(theme);
	}
}

function saveTheme() {
	return themeSelector.val();
}

function loadCursor(obj) {
	editor.setCursor(obj && obj.cursor ? obj.cursor : getStartPos());
}

function saveCursor(obj) {
	obj.cursor = editor.getCursor();
}

function loadElapsedTime(obj) {
	if (obj && obj.elapsedTime) {
		elapsedTime = obj.elapsedTime;
	} else {
		elapsed = 0;
	}
}

function saveElapsedTime(obj) {
	obj.elapsedTime = elapsedTime;
}

function setTheme(theme) {
	if (theme != "default") {
		$("head").append(`<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.19.0/theme/${theme}.min.css">`);
	}
	editor.setOption("theme", theme);
}

function setCursor(pos) {
	editor.setCursor(pos);
	let end = getEndPos();
	if (pos.line == end.line && pos.ch == end.ch) {
		goToNextChunk();
	} else if (pos.line == 0 && pos.ch == 0) {
		goToPrevChunk();
	}
}

function updateWPM() {
	if (focused) {
		// update elapsed time
		if (!elapsedTime || isNaN(elapsedTime)) {	
			elapsedTime = Date.now() - lastStartTime;
		} else {
			elapsedTime += Date.now() - lastStartTime;
		}
		lastStartTime = Date.now();
	}

	// calculate words typed
	let typed = editor.doc.getRange({ line: 0, ch: 0 }, editor.getCursor());
	let words = typed.split(/[\s,\.]+/).length;
	
	let seconds = elapsedTime / 1000;
	let minutes = seconds / 60;
	$("#wpm").text(Math.round(words / minutes));
}

function pause() {
	focused = false;
	elapsedTime += Date.now() - lastStartTime;
	$("#paused").text("Paused");
	$("#content").addClass("paused");
}

function resume() {
	focused = true;
	lastStartTime = Date.now();
	$("#paused").text("");
	$("#content").removeClass("paused");
}

String.prototype.hasOnlyWhiteSpaceBeforeIndex = function(index) {
	return this.substring(index) == this.trim();
};

// debug helpers
function removeAllInvalids() {
	editor.operation(() => {
		for (var i = 0; i < invalids.length; i++) {
			let inner = invalids[i];
			if (inner) {
				for (var j = 0; j < invalids.length; j++) {
					let mark = inner[j];
					if (mark) {
						mark.clear();
					}
				}
			}
		}
		invalids = [];
	});
}

function goToEnd() {
	editor.setCursor(getEndPos());
	updateIncompleteMark();
	save();
}
