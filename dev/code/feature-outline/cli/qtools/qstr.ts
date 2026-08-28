import * as qstr from "./qstr";

/**
 * Generates a 6-character unique identifier (suuid) consisting of random
 * upper and lower case letters and numbers.
 * Example: "nO57aL"
 */
export const generateSuuid = (): string => {
	const characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let suuid = "";
	for (let i = 0; i < 6; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		suuid += characters[randomIndex];
	}
	return suuid;
};

export const getNowDateTimeString = (): string => {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	const hours = String(now.getHours()).padStart(2, "0");
	const minutes = String(now.getMinutes()).padStart(2, "0");
	const seconds = String(now.getSeconds()).padStart(2, "0");
	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * Check if a string is empty.
 *
 * qstr.isEmpty('');
 *
 * true
 */
export const isEmpty = (line: string) => {
	if (line === undefined || line === null) {
		return true;
	}
	line = line.toString();
	return line.trim() === "";
};

// also does full trim, of array and each line
export const convertStringBlockToLines = (
	stringBlock: string,
	trimLines = true
) => {
	let roughLines: string[] = [];

	if (qstr.isEmpty(stringBlock)) {
		return [];
	}
	roughLines = stringBlock.split("\n");
	if (trimLines) {
		roughLines = qstr.trimAllLinesInLinesArray(roughLines);
	} else {
		// remove at least the ending \r (since not trimming is intended for leaving TABs at the end)
		roughLines = qstr.trimAllLinesOfSlashRInLinesArray(roughLines);
	}
	roughLines = qstr.trimLinesOfEndBlanks(roughLines);
	return roughLines;
};

export const trimAllLinesOfSlashRInLinesArray = (lines: string[]) => {
	const newLines: string[] = [];
	lines.forEach(function (line) {
		const newLine = qstr.chopRight(line, "\r");
		newLines.push(newLine);
	});
	return newLines;
};

export const trimAllLinesInLinesArray = (lines: string[]) => {
	const newLines: string[] = [];
	lines.forEach(function (line) {
		const newLine = line.trim();
		newLines.push(newLine);
	});
	return newLines;
};

// returns a lines array so that there are no blank lines at the beginning or end
export const trimLinesOfEndBlanks = (lines: string[]) => {
	lines = qstr.trimBeginningLinesOfBlanks(lines);
	lines = lines.reverse();
	lines = qstr.trimBeginningLinesOfBlanks(lines);
	lines = lines.reverse();
	return lines;
};

// if first line of lines array is blank, it will remove it
// but don't remove any blank lines from middle or end
export const trimBeginningLinesOfBlanks = (lines: string[]) => {
	const newLines: string[] = [];
	let trimmingBlanks = true;
	lines.forEach(function (line) {
		const newLine = line;
		if (trimmingBlanks && line === "") {
			// skip it since it is a preceding blank item
		} else {
			newLines.push(newLine);
			trimmingBlanks = false;
		}
	});
	return newLines;
};

/**
 * Removes text from the end of a string.
 *
 * qstr.chopRight('book-001', '-001');
 *
 * 'book'
 */
export const chopRight = (main: string, textToChop: string) => {
	if (main.endsWith(textToChop)) {
		const len = textToChop.length;
		const mainLen = main.length;
		if (len <= mainLen) {
			return main.substring(0, mainLen - len);
		}
	}
	return main;
};

export const chopLeft = (main: string, textToChop: string) => {
	if (main.startsWith(textToChop)) {
		const len = textToChop.length;
		const mainLen = main.length;
		if (len <= mainLen) {
			return main.substring(len, mainLen);
		}
	}
	return main;
};

export const forceCamelNotation = (term: string) => {
	let r = term;

	// specials
	r = r === "ID-Code" ? "id code" : r;

	// first change all e.g. "single-page" to "single page"
	r = qstr.replaceAll(r, "-", " ");

	// if it is all uppercase (e.g. FAQ) then we want all lower case (faq) and not (fAQ)
	if (qstr.isAllUppercase(r)) {
		r = r.toLowerCase();
	} else {
		// get the pascal notation first
		const pascalNotation = qstr.forcePascalNotation(r);

		// now lowercase the first character
		r = qstr.lowercaseFirstLetter(pascalNotation);
	}

	// make sure no spaces are in the string, e.g. "showcaseType Script" --> "showcaseTypeScript"
	r = qstr.replaceAll(r, " ", "");

	return r;
};

/**
 * REPLACE ALL OCCURANCES IN A STRING:
 *
 * qstr.replaceAll("This is a tost.", "o", "e");
 *
 * "This is a test."
 */
export const replaceAll = (text: string, search: string, replace: string) => {
	return text.split(search).join(replace);
};

export const isAllUppercase = (term: string) => {
	if (term.toUpperCase() === term) {
		return true;
	}
	return false;
};

export const forcePascalNotation = (term: string) => {
	let r = String(term);

	// exceptions
	if (r.toLowerCase() === "id-code") {
		return "IdCode";
	}

	// convert to "First Name"
	r = qstr.forceTitleNotation(r);

	r = qstr.cleanForCamelAndPascalNotation(r);

	// force EVERY word to be uppercase, as it may be here "Save and Close"
	r = qstr.forceCapitalizeFirstCharacterOfEveryWord(r);

	// now simply take all spaces out
	r = qstr.replaceAll(r, " ", "");

	return r;
};

export const lowercaseFirstLetter = (term: string) => {
	return term.charAt(0).toLowerCase() + term.slice(1);
};

// "Project 1: The Book Sections" => "Project 1 The Book Sections"
// "Die fröhliche Wissenschaft" => "Die froehliche Wissenschaft"
export const cleanForCamelAndPascalNotation = (term: string) => {
	let r = term;
	r = qstr.convertForeignCharactersToStandardAscii(r);
	r = r.replace(/[^A-Za-z0-9 ]/g, "");
	return r;
};

// Forces a string to be in title notation, e.g. First Name.
export const forceTitleNotation = (term: string) => {
	let r = term;

	// it is a one-word acronym like "UPS", then just keep it that way
	if (qstr.isAllUppercase(r) && !r.includes(" ")) {
		return r;
	}
	r = term;
	// if at this point we have e.g. "THIS IS A GOOD THING", then lowercase it first here
	if (qstr.isAllUppercase(r)) {
		r = r.toLowerCase();
	}

	// get the text notation, e.g. "first name"
	const textNotation = qstr.forceTextNotation(r);

	// now uppercase the first letter of each word
	const words = qstr.breakIntoParts(textNotation, " ");

	r = "";
	words.forEach(function (word) {
		r += `${qstr.capitalizeFirstLetter(word).trim()} `;
	});

	r = r.trim();

	// handle the punctuation rules for English, lowercase prepositions and articles under 7 letters
	r = qstr.renderEnglishTitleCapitalization(r);

	return r;
};

export const forceCapitalizeFirstCharacterOfEveryWord = (term: string) => {
	let r = "";
	const words = qstr.breakIntoParts(term, " ");
	if (words.length > 0) {
		words.forEach(function (word) {
			r += `${qstr.capitalizeFirstLetter(word)} `;
		});
		r = r.trim();
	}
	return r;
};

// "Die fröhliche Wissenschaft" => "Die froehliche Wissenschaft"
export const convertForeignCharactersToStandardAscii = (term: string) => {
	let r = term;
	// French
	r = r.replace("è", "e");
	r = r.replace("à", "e");
	r = r.replace("ê", "e");
	// todo: add more that you need, with tests

	// German
	r = r.replace("ö", "oe");
	r = r.replace("ß", "ss");
	r = r.replace("ü", "ue");
	r = r.replace("ä", "ae");
	r = r.replace("Ö", "Oe");
	r = r.replace("Ü", "Ue");
	r = r.replace("Ä", "Ae");
	return r;
};

export const forceTextNotation = (term: string) => {
	let r = term;

	r = r.trim();

	// first change delimiters to spaces
	r = qstr.replaceAll(r, "-", " ");
	r = qstr.replaceAll(r, "_", " ");

	// if is all caps like "FIRST ANNUAL REPORT" then we don't want "F I R S T   A N N U A L   R E P O R T"
	// but "first annual report"
	if (qstr.isAllUppercase(r)) {
		r = r.toLowerCase();
	}
	r = qstr.insertSpaceBeforeEveryUppercaseCharacter(r);

	// now lowercase everything
	r = r.toLowerCase();

	r = qstr.forceAllMultipleSpacesToSingleSpace(r);
	r = r.trim();

	return r;
};

export const forceSnakeNotation = (term: string) => {
	let r = qstr.forceTextNotation(term);
	r = qstr.cleanForCamelAndPascalNotation(r);
	r = qstr.replaceAll(r, " ", "_");
	return r;
};

export const forceKebabNotation = (term: string) => {
	let r = qstr.forceTextNotation(term);
	r = qstr.cleanForCamelAndPascalNotation(r);
	r = qstr.replaceAll(r, " ", "-");
	return r;
};

export const snake = (term: string) => qstr.forceSnakeNotation(term);
export const kebab = (term: string) => qstr.forceKebabNotation(term);

export const breakIntoParts = (
	main: string,
	delimiter: string = ",",
	maximumNumberOfParts: number = 0
) => {
	const escapedDelimiter = `\\${delimiter}`;
	const mask = "@@@MASK@@@";
	if (qstr.isEmpty(main)) {
		return [];
	}

	const maskedMain: string = qstr.replaceAll(main, escapedDelimiter, mask);
	const roughParts: string[] = maskedMain.split(delimiter);
	let parts: string[] = [];
	roughParts.forEach((part: string) => {
		let newPart: string = part;
		newPart = newPart.trim();
		parts.push(newPart);
	});
	if (maximumNumberOfParts !== 0 && maximumNumberOfParts < parts.length) {
		const consolidatedParts: string[] = [];
		parts.forEach((part, index) => {
			if (index < maximumNumberOfParts - 1) {
				consolidatedParts.push(part);
			} else {
				const current: string =
					consolidatedParts[maximumNumberOfParts - 1];
				let prefix: string = "";
				if (current !== undefined) {
					prefix = `${current};`;
				}
				consolidatedParts[maximumNumberOfParts - 1] = prefix + part;
			}
		});
		parts = consolidatedParts;
	}

	// unmask
	const unmaskedParts: string[] = [];
	for (const part of parts) {
		const unmaskedPart = qstr.replaceAll(part, mask, delimiter);
		unmaskedParts.push(unmaskedPart);
	}
	parts = unmaskedParts;

	return parts;
};

/**
 * Capitalize the first letter of a string.
 *
 * qstr.capitalizeFirstLetter("this is a sentence.");
 *
 * "This is a sentence."
 */
export const capitalizeFirstLetter = (line: string) => {
	return line.charAt(0).toUpperCase() + line.slice(1);
};

export const renderEnglishTitleCapitalization = (term: string) => {
	let r = term;

	const termsToLowercase = [
		"A",
		"An",
		"The",
		"Or",
		"And",
		"Of",
		"For",
		"With",
		"Into",
		"From",
		"At",
	];

	// mask
	termsToLowercase.forEach(function (termToLowerCase) {
		const searchText = `: ${termToLowerCase} `;
		const replaceText = `:@${termToLowerCase}`;
		r = r.replace(searchText, replaceText);
	});

	termsToLowercase.forEach(function (termToLowerCase) {
		const searchText = ` ${termToLowerCase} `;
		const replaceText = searchText.toLowerCase();
		r = r.replace(searchText, replaceText);
	});

	// unmask
	termsToLowercase.forEach(function (termToLowerCase) {
		const searchText = `:@${termToLowerCase} `;
		const replaceText = `: ${termToLowerCase} `;
		r = r.replace(searchText, replaceText);
	});
	return r;
};

export const insertSpaceBeforeEveryUppercaseCharacter = (term: string) => {
	let r = "";
	const forCheckingTerm = `${term} `;
	for (let i = 0; i < term.length; i += 1) {
		const character = forCheckingTerm.charAt(i);
		// const characterAfter = forCheckingTerm.charAt(i + 1);
		if (qstr.isUppercaseLetter(character)) {
			r += " ";
		}
		r += character;
	}
	r = qstr.forceAllMultipleSpacesToSingleSpace(r);
	return r;
};

export const isUppercaseLetter = (character: string) => {
	const regex = new RegExp("[A-Z]");
	return character.length === 1 && regex.test(character);
};

export const forceAllMultipleSpacesToSingleSpace = (term: string) => {
	return term.replace(/(\s)+/g, " ");
};

export const convertLinesToStringBlock = (lines: string[]) => {
	let r = "";
	let index = 0;
	for (const line of lines) {
		r += line;
		if (index != lines.length - 1) {
			r += "\n";
		}
		index++;
	}
	return r;
};

export const encodeHtml = (text: string): string => {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
};

export const decodeHtml = (html: string): string => {
	const map: Record<string, string> = {
		"&amp;": "&",
		"&lt;": "<",
		"&gt;": ">",
		"&quot;": "\"",
		"&#039;": "'"
	};
	return html.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, m => map[m]);
};

export const convertFromHtml = (text: string) => {
	let r = text;
	r = qstr.encodeHtml(r);
	r = qstr.replaceAll(r, "\n", "\\n");
	r = qstr.replaceAll(r, "\t", "\\t");
	return r;
};

export const unescapeText = (text: string): string => {
	let r = text;
	r = qstr.replaceAll(r, "\\n", "\n");
	return r;
};

export const convertVisibleTabsToSpaces = (text: string) => {
	let r = text;
	r = qstr.replaceAll(r, "\\t", "\t");
	return r;
};

// convert quarterReport to quarterReports
export const forcePlural = (potentialSingularNotation: string) => {
	if (!potentialSingularNotation.endsWith("s")) {
		return `${potentialSingularNotation}s`;
	}
	return potentialSingularNotation;
};

export const wrapAsJsonContent = (innerJsonContent: string) => {
	const lines = qstr.convertStringBlockToLines(innerJsonContent);
	const newLines: string[] = [];
	newLines.push("[");
	for (const line of lines) {
		if (line.startsWith("}") || line.startsWith("{")) {
			newLines.push(`\t${line}`);
		} else {
			newLines.push(`\t\t${line}`);
		}
	}
	newLines.push("]");
	return qstr.convertLinesToStringBlock(newLines);
};


