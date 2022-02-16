"use strict";

const testLine = "「これは……《テスト》でーす――。〈テスト〉【テスト】だよ、ね？　そう!!」";
const div = document.getElementById("p-1");

const addSpanToChar = (line) => {
    let str = line;
    // str = str.replace(/「/g, "<span class='startBracket'>「</span>");
    // str = str.replace(/…/g, "<span class='leader'>…</span>");
    // str = str.replace(/―/g, "<span class='dash'>―</span>");
    // str = str.replace(/ー/g, "<span class='hyphen'>ー</span>");
    // str = str.replace(/」/g, "<span class='endBracket'>」</span>");
    return str;
}

const createLines = (line) => {
    let str = "";
    for (let i = 0; i < 15; i++){
        const rotated = addSpanToChar(line);
        str += "<p id='line-" + i + "'>" + rotated + "</p>";
    }
    return str;
}

div.innerHTML = createLines(testLine);