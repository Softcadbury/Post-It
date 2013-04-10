/* Initialisation */
$(document).ready(function () {
    initHelpButton();
    displayNotes();
    document.onmousedown = onMouseDown;
    document.onmouseup = onMouseUp;
    document.oncontextmenu = function () { return false; };
});

function onMouseDown(e) {
    if (e.which === 3)
        contextMenuShow(e);

    if (e.which === 1) {
        if (e.target.className.indexOf('drag') != -1)
            dragDown(e);
        if (e.target.id.indexOf('add-note') != -1)
            addNote(e);
        if (e.target.id.indexOf('del-note') != -1)
            deleteNote();

        contextMenuHide(e);
    }
}

function onMouseMove(e) {
    dragMove(e);
}

function onMouseUp(e) {
    dropUp(e);
}

/* Help button management */
function initHelpButton() {
    $('#show_help').css("left", (window.innerWidth - 85) + 'px');
    $('#show_help').css("top", (window.innerHeight - 55) + 'px');

    $('#show_help').click(function () {
        $("#help_content").modal('show');
    });
}

/* Drag and drop management */
var _startX = 0;
var _startY = 0;
var _offsetX = 0;
var _offsetY = 0;
var _dragElement;
var _oldZIndex = 0;

function dragDown(e) {
    _startX = e.clientX;
    _startY = e.clientY;

    _offsetX = extractNumber(e.target.style.left);
    _offsetY = extractNumber(e.target.style.top);

    _oldZIndex = e.target.style.zIndex;
    e.target.style.zIndex = 10000;

    _dragElement = e.target;

    document.onmousemove = onMouseMove;
    document.body.focus();

    return false;
}

function dragMove(e) {
    if (e == null)
        var e = window.event;

    _dragElement.style.left = (_offsetX + e.clientX - _startX) + 'px';
    _dragElement.style.top = (_offsetY + e.clientY - _startY) + 'px';
}

function dropUp(e) {
    if (_dragElement != null) {
        document.onmousemove = null;
        document.onselectstart = null;

        _dragElement.style.zIndex = _oldZIndex;
        _dragElement.ondragstart = null;
        _dragElement = null;

        saveNoteCoord($(e.target).children().attr('id'), e.target.style.left, e.target.style.top);
    }
}

/* Context menu management */
var _note_id_selected = "";

function contextMenuShow(e) {
    $('#del-note').hide();
    $('#context-menu').show();
    $('#context-menu').css("left", e.clientX + 'px');
    $('#context-menu').css("top", e.clientY + 'px');

    if (e.target.className.indexOf('note') != -1) {
        _note_id_selected = e.target.id;
        $('#del-note').show();
    }

    if (e.target.className.indexOf('drag') != -1) {
        _note_id_selected = $(e.target).children()[0].id;
        $('#del-note').show();
    }
}

function contextMenuHide(e) {
    $('#context-menu').hide();
    _note_id_selected = "";
}

/* Note management */
function displayNotes() {
    var noteFound = 0;
    for (var i = 1; noteFound < getNotesNumber(); i++)
        if (getCookie(i + "x") != null && getCookie(i + "x") != "") {
            getNote(i);
            noteFound++;
        }
}

function addNote(e) {
    var nb = getNotesNumber() + 1;
    var x = extractNumber($("#context-menu").css("left")) - 32;
    var y = extractNumber($("#context-menu").css("top"));

    setNotesNumber(nb);

    for (var num = 1; num <= nb; num++)
        if (getCookie(num + "x") == null || getCookie(num + "x") == "") {
            saveNoteCoord(num, x, y);
            getNote(num);
        }
}

function deleteNote() {
    setNotesNumber(getNotesNumber() - 1);
    eraseCookie(_note_id_selected + "x");
    eraseCookie(_note_id_selected + "y");
    eraseCookie(_note_id_selected + "c");
    $("#" + _note_id_selected).parent().remove();
}

/* Save note management */
function setNotesNumber(number) {
    setCookie("n", number);
}

function getNotesNumber() {
    return getCookie("n") == null ? 0 : extractNumber(getCookie("n"));
}

function saveNoteCoord(num, x, y) {
    x = x + "";
    if (x.indexOf('px') != -1)
        x = x.substring(0, x.indexOf('px')); ;

    y = y + "";
    if (y.indexOf('px') != -1)
        y = y.substring(0, y.indexOf('px'));

    setCookie(num + "x", x);
    setCookie(num + "y", y);
}

function saveNoteContent(num, content) {
    setCookie(num + "c", content);
}

function getNote(num) {
    var x = getCookie(num + "x");
    x = x == null ? 0 : x;

    var y = getCookie(num + "y");
    y = y == null ? 0 : y;

    var content = getCookie(num + "c");
    content = content == null ? "" : content;

    $("#container").append('<div class="drag"><textarea class="note" id="' + num +
						   '" type="text">' + unescape(content) + '</textarea></div>');

    $('#' + num).parent().css("left", x + 'px');
    $('#' + num).parent().css("top", y + 'px');

    $("textarea[id=" + num + "]").on('keyup', function () {
        if (textLimit(this, 150))
            saveNoteContent(num, this.value);
    });
}

/* Cookies management */
function setCookie(name, value) {
    var days = 365;
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    var expires = "; expires=" + date.toGMTString();
    document.cookie = name + "=" + escape(value) + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');

    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ')
            c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0)
            return c.substring(nameEQ.length, c.length);
    }

    return null;
}

function eraseCookie(name) {
    setCookie(name, "", -1);
}

/* Textarea limit management */
function textLimit(field, maxlen) {
    if (field.value.length > maxlen) {
        field.value = field.value.substring(0, maxlen);
        alert('Attention, ' + maxlen + ' caractères maximum!');
        return false;
    }

    return true;
}

/* Misc */
function extractNumber(value) {
    var n = parseInt(value);
    return n == null || isNaN(n) ? 0 : n;
}