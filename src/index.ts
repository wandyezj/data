// Script to parse wikipedia animals page for data

import {readFileSync, existsSync, mkdirSync, writeFileSync} from 'fs'
import * as path from 'path'
// practically required
import fetch from "node-fetch";
// Very convenient
import {JSDOM} from "jsdom";

async function getWikipediaAnimalData(cacheDirectory: string) {


    // cache file locally so to not place additional load on the website
    const url = "https://en.wikipedia.org/wiki/List_of_animal_names";
    const file = "wikipedia_list_of_animal_names.html";
    
    if (!existsSync(cacheDirectory)) {
        mkdirSync(cacheDirectory, {recursive:true})
    }

    const filePath = path.join(cacheDirectory, file);

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

interface TableData {
    header: HTMLTableHeaderCellElement[];
    rows: HTMLTableDataCellElement[][];
}



function iterateOverElements<T>(items: {readonly length: number; [index: number]: T; }, callback: (item: T, isFirst: boolean)=> void): void {
    for (let i = 0; i< items.length; i++ ){
        const item = items[i];
        const isFirst = i ===0;
        callback(item, isFirst);
    }
}

function parseHtmlTable(table: HTMLTableElement): TableData {

    const header: HTMLTableHeaderCellElement[] =[];
    const rows: HTMLTableDataCellElement[][] = [];

    const trs = table.getElementsByTagName("tr");

    iterateOverElements(trs, (tr, isFirst) =>{
        const tds = tr.getElementsByTagName("td");
        // check first row for presence of th elements
        if (isFirst && tds.length === 0) {
            const ths = tr.getElementsByTagName("th");
            iterateOverElements(ths, (th) => {
                header.push(th)
            });
        } else {
            const row: HTMLTableDataCellElement[]  = [];
            iterateOverElements(tds, (td) => {
                row.push(td)
            });
            rows.push(row)
        }
    });

    const tableData: TableData = {
        header,
        rows,
    };
    return tableData;
}

async function run() {
    const cacheDirectory = path.join(__dirname, "..", "temp");

    const data = await getWikipediaAnimalData(cacheDirectory)
    const s = data.substring(0,20);
    console.log(s);
    //document.body.innerHTML = "<body><h1>hello</h1></body>"
    // const dom = new JSDOM("<body><h1>hello</h1></body>");
    // const inner = dom.window.document.body.innerHTML;
    // console.log(inner);

    const dom = new JSDOM(data);
    const body = dom.window.document.body;
    const tables = body.getElementsByTagName("table");
    const table = tables[1];
    //const inner = table.innerHTML
    const tableData = parseHtmlTable(table);
    const inner = tableData.header.map(x => x.innerHTML).join("\n")
    +"\n\n\n"+
     tableData.rows.map(x =>x.map(x => x.innerHTML).join("\n")).join("\n\n\n")

    // note wikipedia animal list data is noisy, some categories have multiple
    //console.log("------")
    //console.log(inner);
    writeFileSync(path.join(cacheDirectory, "out.txt"), inner);
    //console.log("------")
    console.log("done")
}

run();




