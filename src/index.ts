// Script to parse wikipedia animals page for data

import {readFileSync, existsSync, mkdirSync, writeFileSync} from 'fs'
import * as path from 'path'
// practically required
import fetch from "node-fetch";
// Very convenient
import {JSDOM} from "jsdom";

async function getWikipediaAnimalData() {

    // cache file locally so to not place additional load on the website
    const url = "https://en.wikipedia.org/wiki/List_of_animal_names";
    const file = "wikipedia_list_of_animal_names.html";
    const temp = path.join(__dirname, "..", "temp");
    if (!existsSync(temp)) {
        mkdirSync(temp, {recursive:true})
    }

    const filePath = path.join(temp, file);

    // check if file is already cached
    if (!existsSync(filePath)) {
        // fetch and store in temp
        const result = await fetch(url);
        const text = await result.text();
        writeFileSync(filePath, text);
    }

    const data = readFileSync(filePath, "utf8");
    return data;
}


// // function to parse out tables from HTML
// // does not cover nested tables
// function parseTableStrings(html: string): string[] {
//     const openTagDelimiter = "<table";
//     const closeTagDelimeter = "</table"; 

//     const starts = html.split(openTagDelimiter);
//     // remove first
//     starts.shift()

//     const groups = starts.map((chunk) => {
//         const pieces = chunk.split(closeTagDelimeter);
//         return pieces[1];
//     }).map(chunk => )

// }

async function run() {
    const data = await getWikipediaAnimalData()
    const s = data.substring(0,20);
    console.log(s);
    //document.body.innerHTML = "<body><h1>hello</h1></body>"
    // const dom = new JSDOM("<body><h1>hello</h1></body>");
    // const inner = dom.window.document.body.innerHTML;
    // console.log(inner);

    const dom = new JSDOM(data);
    const body = dom.window.document.body;
    const tables = body.getElementsByTagName("table");
    const inner = tables[0].innerHTML
    console.log(inner);
    console.log("done")
}

run();




