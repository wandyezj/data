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

const validClassNames = [
    "Bard",
    "Cleric",
    "Druid",
    "Paladin",
    "Ranger",
    "Sorcerer",
    "Warlock",
    "Wizard",
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
 * class -> level
 * @typedef {{[className: string]: number}} ClassLevel
 */

/**
 * spell -> class -> level
 * @typedef {{[spell: string]: ClassLevel}} SpellClassLevel
 */

/**
 * All spell class levels parsed from spells list markdown
 * @type {SpellClassLevel}
 */
const spellClassLevels = {};

for (const line of lines) {
    if (line.startsWith("## ")) {
        if (!line.endsWith(" Spells")) {
            console.log(`Unexpected line: ${line}`);
        }
        const className = line.substring(2).trim().split(" ")[0];
        if (validClassNames.includes(className)) {
            currentClass = className;
        } else {
            console.log(`Unexpected line (Invalid Class Name): ${line}`);
            currentClass = "";
        }
    }
    else if (currentClass === "") {
        // skip
    } else if (line.startsWith("### ")) {
        if (!(line.endsWith(" Level") || line.endsWith(" Level)"))) {
            console.log(`Unexpected line: ${line}`);
        }
        const spellLevel = line.substring(3).trim();
        if (validSpellLevels.includes(spellLevel)) {
            currentLevel = spellLevel;
        } else {
            console.log(`Unexpected line (Invalid Spell Level): ${line}`);
            currentLevel = "";
        }
    } else if (currentLevel === "") {
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

/**
 *
 * @param {SpellClassLevel} spellClassLevels
 */
function getUniqueClassNames(spellClassLevels) {
    const classNames = [];
    Object.getOwnPropertyNames(spellClassLevels).forEach((spell) => {
        const classes = Object.getOwnPropertyNames(spellClassLevels[spell]);
        classNames.push(...classes);
    });
    const uniqueClassNames = [...new Set(classNames)];
    return uniqueClassNames;
}

/**
 *
 * @param {ClassLevel} classLevel
 * @returns {number[]} unique levels
 */
function getUniqueLevels(classLevel) {
    const levels = Object.getOwnPropertyNames(classLevel).map(
        (className) => classLevel[className]
    );
    const uniqueLevels = [...new Set(levels)];
    return uniqueLevels;
}

/**
 * Are there any cases of a spell having different spell levels for different classes?
 * @param {SpellClassLevel} spellClassLevels
 * @returns {string[]} spells with different class levels
 */
function spellsNamesWithDifferentClassLevels(spellClassLevels) {
    const differentSpells = [];
    for (const spell of Object.getOwnPropertyNames(spellClassLevels)) {
        const classLevels = spellClassLevels[spell];
        const uniqueLevels = getUniqueLevels(classLevels);
        if (uniqueLevels.length > 1) {
            console.error(
                `ERROR: Spell ${spell} has different levels for different classes: ${JSON.stringify(
                    classLevels
                )}`
            );
            differentSpells.push(spell);
        }
    }
    return differentSpells;
}
const spellsWithDifferentLevels =
    spellsNamesWithDifferentClassLevels(spellClassLevels);
if (spellsWithDifferentLevels.length > 0) {
    console.error(
        "ERROR: spells exist with different levels for different classes"
    );
}

/**
 * All spell names in alphabetical order
 */
const spellNames = Object.getOwnPropertyNames(spellClassLevels);
spellNames.sort();

/**
 * Information about the spell
 * @type {{name: string; level:string; classes: string[]}[]}
 */
const spellList = spellNames.map((name) => {
    const classLevels = spellClassLevels[name];
    const uniqueLevels = getUniqueLevels(classLevels);
    if (uniqueLevels.length > 1) {
        console.log(
            `ERROR: Spell ${name} has different levels for different classes`
        );
    }

    const level = uniqueLevels[0];
    const classes = Object.getOwnPropertyNames(classLevels);
    classes.sort();
    return {
        name,
        level,
        classes,
    };
});

//console.log(spellList);

//
// output JSON
//

fs.writeFileSync("dnd-5e-class-spell-list.json", JSON.stringify(spellList));

//
// output TSV
//
const spellTsv = spellList
    .map(
        ({ name, level, classes }) => `${name}\t${level}\t${classes.join(" ")}`
    )
    .join("\n");

fs.writeFileSync("dnd-5e-class-spell-lists.tsv", spellTsv);

//
// Unique Class Names
//

// const names = getUniqueClassNames(spellClassLevels);
// names.sort();
// console.log(names.join(", "));
