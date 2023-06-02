const fs = require("fs");

const data = fs.readFileSync("dnd-5e-class-spell-lists.md", "utf-8");

const lines = data
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

// Go through each line keep track of the current class
let currentClass = "";
let currentLevel = "";

/**
 * class -> level -> spell
 */
const classSpellsMap = new Map();
for (const line of lines) {
    if (line.startsWith("## ")) {
        if (!line.endsWith(" Spells")) {
            console.log(`Unexpected line: ${line}`);
        }
        currentClass = line.substring(2).trim().split(" ")[0];
    } else if (
        line.startsWith("### ")
    ) {
        if (!(line.endsWith(" Level") || line.endsWith(" Level)"))) {
            console.log(`Unexpected line: ${line}`);
        }
        currentLevel = line.substring(3).trim();
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
    }
}


/*
// Manual checking
console.log(classSpellsMap);

console.log("Classes:");
const levels = [];
for (let className of classSpellsMap.keys()) {
    console.log(className);
    const classSpellLevels = Array.from(classSpellsMap.get(className).keys());
    levels.push(...classSpellLevels);
}

// remove duplicates
const uniqueLevels = [...new Set(levels)];
console.log("Levels:");
console.log(uniqueLevels);
*/

// Break into one list per class