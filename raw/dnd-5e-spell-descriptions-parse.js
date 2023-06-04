/*
Parse out spell description json from the spell descriptions in the markdown file which comes copied from the players handbook.


*/

const fs = require("fs");

/**
 * @type {{name: string;}[]}
 */
const spellListJson = JSON.parse(
    fs.readFileSync("../original/dnd-5e-class-spell-list.json", "utf-8")
);
const validSpellNames = spellListJson.map(({ name }) => name);
const validSpellNamesTest = validSpellNames.map((name) =>
    getSpellNameTest(name)
);

/**
 * Data Description
 * Letters are groups together in strange ways from the copy.
 * @type {string}
 */
const data = fs.readFileSync("dnd-5e-spell-descriptions.md", "utf-8");

const lines = data
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

//
// Pull out spell names
//

function getSpellNameTest(s) {
    const testName = s
        .trim()
        .split(" ")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .join("");
    return testName;
}

/**
 * Is the line a spell name
 * @param {string} s
 * @returns {boolean}
 */
function isLineSpellName(s) {
    const testName = getSpellNameTest(s);
    return validSpellNamesTest.includes(testName);
}

/**
 *
 * @param {string} s
 * @returns {string | undefined}
 */
function matchSpellName(s) {
    const testName = getSpellNameTest(s);
    const index = validSpellNamesTest.indexOf(testName);
    if (index === -1) {
        return undefined;
    }
    return validSpellNames[index];
}

//
// Break up file into individual spell descriptions
//

/**
 * spell -> text
 * @type {{[spell: string]: string}]}}
 */
const spellText = {};

let currentSpell = "";
let currentText = "";
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const spellName = matchSpellName(line);
    if (spellName === undefined) {
        // After the spell name are some more lines of text
        // Add them to the current spell
        currentText += line + "\n";
    } else {
        if (currentSpell !== "") {
            spellText[currentSpell] = currentText;
        }
        currentText = "";
        currentSpell = spellName;
    }
    //console.log(spellName);
}
//console.log(spellText);

//
// Parse out each spell decription further
//

/**
 * Parse out spell text into a json object
 * @param {string} spellText
 */
function parseSpellText(spellText) {
    /*
    
    const school = lines[i+1];

    const castTime = lines[i+2];
    const range = lines[i+3];

    2 nd-level evocation
    Casting Time: a
    Range: a
    Components: V, S, M x
    y
    Duration: d
    */
    
    /**
     * 
     * @param {string} prefix 
     * @param {string} line 
     * @returns 
     */
    function getPrefixLineMatch(prefix, line) {
        line.get
        const [prefix, rest] = line.split(":");

        return line.startsWith(prefix);
    }

    let castingTime = "";
    let range = "";
    let components = "";
    let duration = "";
    let description = "";

    const lines = spellText.split("\n");
    for (const line of lines) {

    }
    
    return {
        raw: spellText,
        castingTime,
        range,
        components,
        duration,
        description,
        raw: spellText,
    };
}

const spellList = Object.getOwnPropertyNames(spellText).map((spellName) => {
    const text = spellText[spellName];
    const name = spellName;
    const props = parseSpellText(text);

    const spell = {
        name,
        ...props,
    };
    return spell;
});

// Output for inspection
fs.writeFileSync(
    "dnd-5e-spell-descriptions-parsed.json",
    JSON.stringify(spellList)
);
