"use strict";

let div = document.getElementById("box");
const p = document.getElementById("scale_p");
const pRuby = document.getElementById("scale_p_ruby");
const maxWidth = p.clientWidth; // 一行の最大幅
const lineHeight = p.clientHeight; // 一行の高さ（ルビなし）
const rubyLineHeight = pRuby.clientHeight; // 一行の高さ（ルビあり）
const fontSize = 20;
const maxChars = Math.floor(maxWidth / fontSize); // 1行あたりの最大文字数
const testLine = "「あのさ、｜空《スウィート・スカイ・ハニー》ちゃん。｜今度《ネクスト》の｜休み《ヴァケーション》、よかったら｜ご飯《サイゼ》でも一緒にどうかな。なんて」";

// エスケープした山括弧を元に戻す
const getBackMountBracket = (line) => {
    let str = line;
    str = str.replace(/〈〈/g, "《");
    str = str.replace(/〉〉/g, "》");
    return str;
}

// 「｜《」など、山括弧をそのまま使いたい場合のエスケープ処理
// 《》をいったん〈〈　〉〉に変換する
const escapeMountBracket = (line) => {
    // const zenkaku = /(?:[　！”＃＄％＆’（）＊＋，－．／：；＜＝＞？＠［￥］＾＿‘｛｜｝￣])|(?:[、。・゛゜´｀¨ヽヾゝゞ〃仝々〆〇ー―‐＼～～∥…‥“〔〕〈〉《》「」『』【】±×÷≠≦≧∞∴♂♀°′″℃￠￡§☆★○●◎◇◇◆□■△▲▽▼※〒→←↑↓〓])|(?:[０-９])|(?:[Ａ-Ｚ])|(?:[ａ-ｚ])|(?:[ぁ-ん])|(?:[ァ-ヶ])|(?:[Α-Ωα-ω])|(?:[А-Яа-я])|(?:[\u2570-\u25ff])|(?:[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])/g;
    if(line.indexOf("｜《") > -1){
        // const line = "<6>大晦日</6>";
        // const replaced = line.replace(/\<([1-7])\>(.*)\<\/.\>/g, "<span class='f$1'>$2</span>"); // <span class='f6'>大晦日</span>
        return line.replace(/｜《(.*)》/g, "〈〈$1〉〉");
    }
    return  line;
}

const encodeRuby = (line) => {
    if(line.indexOf("｜") > -1
        && line.indexOf("《") > -1
        && line.indexOf("》") > -1)
    {
        return line.replace(
            /｜(.*)《(.*)》/g,
            "<ruby><rb>$1</rb><rp>(</rp><rt>$2</rt><rp>)</rp></ruby>"
        );
    }
    return line;
}

// 実際に appendChild() することなく、オーバーサイズルビ含む行を数値計算だけで分割する
// 1行あたりの最大文字数内にオーバーサイズルビがあるか確認する
// ルビが最大文字数内にある場合、
// ルビ漢字とフリガナの文字数を両方検出して、
// 長い方が行の外にはみ出すかどうかを検出する。
// フリガナの方は漢字の2倍が長さとなる。
// ルビが行に収まるならルビ行、そうでないならルビなし行。
// 改行ルビ跨ぎ問題があるので、オーバーサイズがあるかないかはあまり関係ない

// 禁則処理の問題もある。最終行の最終文字が
// 「　『　【　（　《　〈　――　……　などであった場合、
// あるいは次ページの最初の文字が
// ー　、　。　」　』　】　）　》　〉　――　……　などであった場合、
// 次のページに回す必要がある。
// これは特殊ルビ処理の後でやるべき。

// 数値計算なら、<ruby>にエンコードする必要はないんじゃなかろうか。

// const lineIncludesRuby = (line) => {
//     if(line.indexOf("<ruby>") > -1){
//         // console.log("ruby exists");
//     }
// }

// encodeRuby() の逆
const decodeRuby = (line) => {
    let str = line;
    if(str.indexOf("<ruby><rb>") > -1
        && str.indexOf("</rb><rp>(</rp><rt>") > -1
        && str.indexOf("</rt><rp>)</rp></ruby>") > -1)
    {
        str = str.replace(/<ruby><rb>/g, "｜");
        str = str.replace(/<\/rb><rp>\(<\/rp><rt>/g, "《");
        str = str.replace(/<\/rt><rp>\)<\/rp><\/ruby>/g, "》");
        return str;
    }
}

const oversizeExists = (line) => {
    return true;
}

// オーバーサイズルビがある場合、何文字超過するか返す
// 超過する文字数よりも、何文字にしたら一行に収まるか返した方がいいね
const getNumOfExcessChars = (line) => {
    let str = line;
    let num = 0;
    let excessSum = 0;
    while(true){
        if(str.substr(num, 1) === "｜"
            && str.substr(num, 2) !== "《")
        {
            const bar = str.indexOf("｜");
            const start = str.indexOf("《");
            const end = str.indexOf("》");
            const rb = start - bar - 1; // 漢字の文字数
            const rt = end - start -1; // フリガナの文字数
            console.log("str: " + str);
            console.log("rb: " + rb);
            console.log("rt: " + rt);
            let excess = 0;
            if(rt > rb * 2){
                // 漢字1文字に対しフリガナ3文字だと、スケールは1.5文字分となる。よって最後に Math.ceil
                excess = rt / 2 - rb;
                excessSum += excess;
                console.log("excess: " + excess);
                console.log("excessSum: " + excessSum);
            }
            if(num + rb + excess > maxChars){
                return Math.ceil(excessSum);
            } else {
                // 堕天男　｜堕天男《ルシファー》
                num += rb + excess;
            }
            // str = str.replace(/｜(.*)《(.*)》/, "‖$1≪$2≫"); // なぜか二重山括弧だけ2番め以降が変換される
            str = str.replace("｜", "‖");
            str = str.replace("《", "≪");
            str = str.replace("》", "≫");
        }
        if(num >= maxChars){
            return Math.ceil(excessSum);
        } else {
            num++;
        }
        if(num > 5000){
            return -1; // 無限ループエラー対策
        }
    }

}

const separateLine = (line) => {
    const ruby = line.indexOf("<ruby>");
    if(ruby > -1 && ruby < maxChars){
        if(oversizeExists()){

        }
        // console.log("ruby exists");
        return [line.substr(0, maxChars), line.substr(maxChars)];
    } else {
        return [line.substr(0, maxChars), line.substr(maxChars)];
    }
}

// console.log(separateLine(encodeRuby(testLine)));
// const str = "俺の名は｜堕天男《ルシファー》。";
// const replaced = str.replace(/｜(.*)《(.*)》/g, "<ruby><rb>$1</rb><rp>(</rp><rt>$2</rt><rp>)</rp></ruby>");
// console.log(replaced);

// const str = "俺の名は｜《ルシファー》――";
// const replaced = str.replace(/｜《(.*)》/g, "〈〈$1〉〉");
// console.log(replaced);

const testLine2 = "１２３４５｜６《だだだだだだ》７８９｜０《ぜろす》１２３４５｜６《シックスセックス》７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０";

// console.log(testLine2.replace(/｜(.*)《(.*)》/, "‖$1≪$2≫"));

console.log(getNumOfExcessChars(testLine2));

let newP = document.createElement("p");
newP.innerHTML = encodeRuby(testLine);
div.appendChild(newP);