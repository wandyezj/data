const fs = require("fs");

const data = fs.readFileSync("dnd-5e-class-spell-lists.md", "utf-8");

const lines = data
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

const validSpellLevels = [
    "Cantrips (0 Level)",
    "1st Level",
    "2nd Level",
    "3rd Level",
    "4th Level",
    "5th Level",
    "6th Level",
    "7th Level",
    "8th Level",
    "9th Level",
];

// Go through each line keep track of the current class
let currentClass = "";
let currentLevel = "";

/**
 * class -> level -> spell
 * @type {Map<string, Map<string, string[]>>}
 */
const classSpellsMap = new Map();

/**
 * spell -> class -> level
 * @type {{[spell: string]: {[className: string]: number}}
 */
const spellClassLevels = {};

for (const line of lines) {
    if (line.startsWith("## ")) {
        if (!line.endsWith(" Spells")) {
            console.log(`Unexpected line: ${line}`);
        }
        currentClass = line.substring(2).trim().split(" ")[0];
    } else if (line.startsWith("### ")) {
        if (!(line.endsWith(" Level") || line.endsWith(" Level)"))) {
            console.log(`Unexpected line: ${line}`);
        }
        const spellLevel = line.substring(3).trim();
        if (validSpellLevels.includes(spellLevel)) {
            currentLevel = spellLevel;
        } else {
            console.log(`Unexpected line (Invalid Spell Level): ${line}`);
        }
        
    } else if (currentClass === "" || currentLevel === "") {
        // skip
    } else {
        const spell = line.trim();
        if (!classSpellsMap.has(currentClass)) {
            classSpellsMap.set(currentClass, new Map());
        }
        const classSpells = classSpellsMap.get(currentClass);
        if (!classSpells.has(currentLevel)) {
            classSpells.set(currentLevel, []);
        }
        classSpells.get(currentLevel).push(spell);

        // Spell Class Level
        if (spellClassLevels[spell] === undefined) {
            spellClassLevels[spell] = {};
        }
        if (spellClassLevels[spell][currentClass] === undefined) {
            const levelNumber = validSpellLevels.indexOf(currentLevel);
            spellClassLevels[spell][currentClass] = levelNumber;
        }
    }
}

// Manual checking
//console.log(classSpellsMap);

console.log("\nClasses:");
const levels = [];
for (let className of classSpellsMap.keys()) {
    console.log(className);
    const classSpellLevels = Array.from(classSpellsMap.get(className).keys());
    levels.push(...classSpellLevels);
}

// remove duplicates
const uniqueLevels = [...new Set(levels)];
console.log("\nLevels:");
console.log(uniqueLevels.join("\n"));

console.log("\nSpells:");
console.log(spellClassLevels);

// Are there any cases of a spell having different spell levels for different classes?
// const allSpells = Object.keys(spellClassLevels);
// const spellsWithDifferentLevels = allSpells.filter((spell) => {
//     const spellClassLevelMap = spellClassLevels[spell];
//     const spellClassLevels = Object.values(spellClassLevelMap);
//     const uniqueSpellClassLevels = [...new Set(spellClassLevels)];
//     return uniqueSpellClassLevels.length > 1;
// });

// const allSpellNames = [];
// for (let className of classSpellsMap.keys()) {
//     const classSpellLevels = classSpellsMap.get(className);
//     for (let level of classSpellLevels.keys()) {
//         const spells = classSpellLevels.get(level);
//         allSpellNames.push(...spells);
//     }
// }

// const uniqueSpellNames = [...new Set(allSpellNames)];

// Break into one list per class

// spell, class level ...
