import * as process from "process";
import * as standard from "@wandyezj/standard-node";
import * as path from "path";
import { capitalize } from "@wandyezj/standard-node/dist/lib/string";

console.log("CSV To JSON");

function splitCsvLine(line: string): string[] {
    if(line.includes(`"`)) {
        // need special handling for the line
        
        const slices: string[] = [];



        // let insideDoubleQuote = false;
        // let insideComma = true;
        // let lastStart = 0;
        // for(let i = 0; i < line.length; i++) {
        //     const c = line[i];

        //     const isComma = c === `,`;
        //     const isDoubleQuote = c === `"`;

        //     let doSlice = false;

        //     if (insideComma) {
        //         if (!insideDoubleQuote && isComma) {
        //             doSlice = true;
        //             insideComma = false;
        //         }

        //         if (isDoubleQuote) {

        //         }
        //         if (!insideDoubleQuote && isDoubleQuote) {
        //             insideDoubleQuote = true;
        //             lastStart = i + 1;
        //         }

        //     } else if (isComma) {
        //         insideComma = true;
        //         lastStart = i + 1;
    
        //     } else if (insideDoubleQuote) {
        //         if (isDoubleQuote){
        //             doSlice = true;
        //             insideDoubleQuote = false;
        //         }

        //     } else 

        //     if (doSlice) {
        //         const slice = line.substring(lastStart, i);
        //         slices.push(slice);
        //     }
        // }
        
        // if (insideComma) {
        //     const slice = line.substring(lastStart);
        //     slices.push(slice);
        // }

        // if (insideDoubleQuote) {
        //     throw `mismatched doubel quotes`
        // }

        let index = 0;
        let previous = undefined;
        while(index != -1) {
            if (index === previous) {
                console.log("no progress");
                break;
            }
            previous = index;

            const nextCommaIndex = line.indexOf(`,`, index);
            const nextDoubleQuoteIndex = line.indexOf(`"`, index);

            let insideQuote: boolean = 
                // a " is present
                nextDoubleQuoteIndex >=0 
                // it is before the next ,
                && (nextDoubleQuoteIndex < nextCommaIndex || nextCommaIndex < 0)

            let sliceStart = -1;
            let sliceEnd = -1;

            console.log(`i${index} "${nextDoubleQuoteIndex} ,${nextCommaIndex} "<,:${insideQuote}`);

            if (insideQuote) {
                // start quote
                sliceStart = nextDoubleQuoteIndex + 1;
                
                // end quote
                sliceEnd = line.indexOf(`"`, sliceStart);

                if (sliceEnd === -1) {
                    throw `mismatched double quote`;
                }
            } else {
                sliceStart = index;
                sliceEnd = nextCommaIndex;
            }
            
            console.log(`slice: ${sliceStart} ${sliceEnd}`);
            const slice = line.substring(sliceStart, sliceEnd > -1 ? sliceEnd : undefined);
            slices.push(slice);
            console.log(`slice ${slice}`);
            console.log(slices);

            index = line.indexOf(`,`, sliceEnd);
            console.log(`e${index}`);
        }

        return slices;

    } else {
        return line.split(",");
    }
    
}

function testSplitCsvToLine() {
    const tests = [
        [`w,w,w`, `w w w`],
        [`"w"`, `w`],
        [`"w",w`, `w w`],
        [`w,"w"`, `w w`],
        [`w,"w",w`, `w w w`],
        [`,,,`, `   `],
    ]

    tests.forEach((test) => {
        const input = test[0];
        const expected = test[1];

        console.log(`\n\nTest: [${input}]`);
        const actual = splitCsvLine(input).join(" ");

        console.log(`i[${input}] e[${expected}] a[${actual}] pass: ${expected === actual}`);

    });
}

testSplitCsvToLine();

function readCsv(path: string): string[][] {
    const lines = standard.file.readList(path);

    const csvLines = lines.map((line) => {
        return splitCsvLine(line);
    });

    return csvLines;
}

/**
 * splits on whitespaces and -, capitalizes words, and joins them
 * @param words 
 */
export function joinWords(words: string): string{
    return words.split(/(\s|-)/).map((word) => capitalize(word)).join("");
}

/**
 * converts an array or rows to columns to a json object
 * 
 * @param csv 
 * @param items the names of the rows to include, if none is provided uses the first row as the set of names converting them to camelCase
 */
export function csvToJson(data: string[][], items?: string[]): {} {

    const labels = items && items.length > 0 ? items : data.shift();

    const names = labels.map((name) => name ? standard.string.camelCase(joinWords(name)) : name);

    const json = data.map((values) => {
        const o = {};
        for (let i = 0; i < names.length; i++) {
            o[names[i]] = values[i];
        }
        return o;
    })

    return json;
    
}


const parameters = process.argv.slice(2);

console.log(parameters);

const inputFileCsv = parameters.shift();
const outputFileJson = parameters.shift();

const items = parameters;

console.log(`
input: 

${inputFileCsv}

output:

${outputFileJson}

items:
${parameters}

`);

if (inputFileCsv && outputFileJson) {
    const inputFilePathCsv = path.resolve(path.normalize(inputFileCsv));
    const outputFilePathJson = path.resolve(path.normalize(outputFileJson));
    
    
    const data = readCsv(inputFilePathCsv);
    
    // Use the specified items or the first row as the labels
    // const labels = items.length > 0 ? items : data.shift();
    
    
    // const names = labels.map((name) => standard.string.camelCase(joinWords(name)));
    
    // const json = data.map((values) => {
    //     const o = {};
    //     for (let i = 0; i < names.length; i++) {
    //         o[names[i]] = values[i];
    //     }
    //     return o;
    // })
    
    const json = csvToJson(data, items);
    
    standard.file.writeJson(outputFilePathJson, json);
} else {
    console.log("missing arguments");
}

