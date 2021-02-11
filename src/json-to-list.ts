import {readFileJson, readFileList, writeFileJson, writeFileListUnique} from "@wandyezj/standard-node"
import * as path from 'path';
console.log("JSON To LIST");

const parameters = process.argv.slice(2);

console.log(parameters);

const [inputFileJson, outputFileList, extract, outputFileListJson] = parameters;

console.log(`
Input
${inputFileJson}

Output
${outputFileList}

Item
${extract}

outputFileListJson
${outputFileListJson}
`);

const inputFileJsonPath = path.resolve(path.normalize(inputFileJson));
const outputFileListPath =  path.resolve(path.normalize(outputFileList));



const data = readFileJson<any[]>(inputFileJsonPath);
const list = data.map(item =>  item[extract]);
writeFileListUnique(outputFileListPath, list);

if (outputFileListJson) {
    const outputFileListJsonPath = path.resolve(path.normalize(outputFileListJson));
    const items = readFileList(outputFileListPath);
    writeFileJson(outputFileListJsonPath, items);
    //`[\n${list.join(",\n")}\n]`
}


