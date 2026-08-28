import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import * as qcli from "./qcli";

/**
 * Reads a file and returns its lines as an array of strings.
 *
 * const lines = qfil.getLinesFromFile('../data/flashcards.txt');
 */
export const getLinesFromFile = (filePath: string): string[] => {
	filePath = resolvePath(filePath);
	try {
		const fileContent = fs.readFileSync(filePath, "utf-8");
		return fileContent.split(/\r?\n/);
	} catch (error) {
		console.error(`Error reading file at ${filePath}:`, error);
		return [];
	}
};

export const resolvePath = (filePath: string): string => {
	if (filePath.startsWith("~~/")) {
		return path.join(process.cwd(), "../../", filePath.substring(3));
	}
	return filePath;
};

export const fileExists = (filePath: string): boolean => {
	filePath = resolvePath(filePath);
	return fs.existsSync(filePath);
};

// function that returns the content of a file
export const getStringBlockFromFile = (filePath: string): string => {
	filePath = resolvePath(filePath);
	try {
		const fileContent = fs.readFileSync(filePath, "utf-8");
		return fileContent;
	} catch (error) {
		console.error(`Error reading file at ${filePath}:`, error);
		return "";
	}
};

export const getVariablesFromYamlPathAndFileName = (
	pathAndFileName: string
): Map<string, string> => {
	pathAndFileName = resolvePath(pathAndFileName);
	const variables = new Map<string, string>();
	try {
		const fileContent = fs.readFileSync(pathAndFileName, "utf-8");
		const data = yaml.load(fileContent) as Record<string, any>;
		if (data && typeof data === "object" && !Array.isArray(data)) {
			for (const [key, value] of Object.entries(data)) {
				variables.set(key, String(value));
			}
		}
	} catch (error) {
		console.error(`Error reading YAML file at ${pathAndFileName}:`, error);
	}
	return variables;
};

export default getLinesFromFile;

/**
 * Gets all files from a directory one level deep.
 *
 * const files = qfil.getFilesFromDirectoryOneLevel('../data/');
 */
export const getPathAndFileNamesFromDirectoryOneLevel = (
	directoryPath: string
): string[] => {
	directoryPath = resolvePath(directoryPath);
	try {
		const files = fs.readdirSync(directoryPath);
		return files
			.filter((file) => fs.statSync(`${directoryPath}/${file}`).isFile())
			.map((file) => `${directoryPath}/${file}`);
	} catch (error) {
		console.error(`Error reading directory at ${directoryPath}:`, error);
		return [];
	}
};

/**
 * e.g. D:\\
 */
export const getPathAndFileNamesFromAbsoluteDirectoryOneLevel = (
	directoryPath: string
): string[] => {
	directoryPath = resolvePath(directoryPath);
	try {
		const files = fs.readdirSync(directoryPath);
		return files
			.filter((file) => fs.statSync(`${directoryPath}/${file}`).isFile())
			.map((file) => `${directoryPath}/${file}`);
	} catch (error) {
		console.error(`Error reading directory at ${directoryPath}:`, error);
		return [];
	}
};

/**
 * Gets all files as string array from an an absolute directory
 *
 * const pathAndFileNames = qfil.getFileNamesFromAbsoluteDirectory("D:\\large\\running_pics")
 */
export const getFileNamesFromAbsoluteDirectory = (
	directoryPath: string
): string[] => {
	directoryPath = resolvePath(directoryPath);
	try {
		const dirents = fs.readdirSync(directoryPath, { withFileTypes: true });
		const fileNames: string[] = [];
		for (const dirent of dirents) {
			if (["DumpStack.log.tmp", "pagefile.sys"].includes(dirent.name))
				continue;
			if (dirent.isFile()) {
				fileNames.push(dirent.name);
			}
		}
		return fileNames;
	} catch (err: any) {
		console.error("Error reading directory:", err);
		return [];
	}
};

/**
 * Gets all directories as string array from an absolute directory
 *
 * const directoryNames = getDirectoriesFromAbsoluteDirectory("D:\\large\\running_pics")
 */
export const getDirectoriesFromAbsoluteDirectory = (
	directoryPath: string
): string[] => {
	directoryPath = resolvePath(directoryPath);
	try {
		const dirents = fs.readdirSync(directoryPath, { withFileTypes: true });
		const directoryNames: string[] = [];
		for (const dirent of dirents) {
			if (["DumpStack.log.tmp", "pagefile.sys"].includes(dirent.name))
				continue;
			if (dirent.isDirectory()) {
				directoryNames.push(dirent.name);
			}
		}
		return directoryNames;
	} catch (err: any) {
		console.error("Error reading directory:", err);
		return [];
	}
};

/**
 * Saves a string array to a JSON file.
 *
 * qfil.saveStringArrayToJsonFile(runDirectoryNames, "../../parseddata/runs.json");
 */
export const saveStringArrayToJsonFile = (
	str: string[],
	jsonFileName: string
): void => {
	jsonFileName = resolvePath(jsonFileName);
	try {
		const jsonData = JSON.stringify(str, null, 2);
		fs.writeFileSync(jsonFileName, jsonData, "utf-8");
	} catch (error: any) {
		qcli.message(
			`Error saving strings to ${jsonFileName}: ${error.message}`,
			"error"
		);
	}
};

/**
 * Saves an array of objects to a JSON file.
 *
 * @param objects - The array of objects to save.
 * @param jsonFileName - The name of the JSON file to write to.
 */
export const saveArrayOfObjectsToJsonFile = (
	objects: unknown[],
	jsonFileName: string
): void => {
	jsonFileName = resolvePath(jsonFileName);
	try {
		const jsonData = JSON.stringify(objects, null, 2);
		fs.writeFileSync(jsonFileName, jsonData, "utf-8");
	} catch (error: any) {
		qcli.message(
			`Error saving objects to ${jsonFileName}: ${error.message}`,
			"error"
		);
	}
};
/**
 * Appends a string to a text file.
 *
 * qfil.addToTextFile('../data/log.txt', 'new message\n');
 */
export const addToTextFile = (filePath: string, content: string): void => {
	filePath = resolvePath(filePath);
	try {
		fs.appendFileSync(filePath, content, "utf-8");
	} catch (error: any) {
		qcli.message(
			`Error appending to ${filePath}: ${error.message}`,
			"error"
		);
	}
};

export const addToTextFileBeforeMarker = (
	filePath: string,
	content: string,
	marker: string
): void => {
	filePath = resolvePath(filePath);
	try {
		const fileContent = fs.readFileSync(filePath, "utf-8");
		const parts = fileContent.split(marker);
		if (parts.length > 1) {
			const newContent = parts[0] + content + marker + parts.slice(1).join(marker);
			fs.writeFileSync(filePath, newContent, "utf-8");
		} else {
			qcli.message(
				`Marker "${marker}" not found in ${filePath}`,
				"warning"
			);
		}
	} catch (error: any) {
		qcli.message(
			`Error adding to ${filePath}: ${error.message}`,
			"error"
		);
	}
};

export const writeToFile = (pathAndFileName: string, content: string): void => {
	pathAndFileName = resolvePath(pathAndFileName);
	try {
		const existingContent = fs.readFileSync(pathAndFileName, "utf-8");
		if (existingContent === content) {
			qcli.message(
				`File ${pathAndFileName} is already up-to-date`,
				"info"
			);
			return;
		}
	} catch (error) {
		// if file doesn't exist, it's fine
	}
	fs.writeFileSync(pathAndFileName, content, "utf-8");
};

export const saveLinesToFile = (pathAndFileName: string, lines: string[]): void => {
	pathAndFileName = resolvePath(pathAndFileName);
	try {
		const fileContent = lines.join("\n");
		fs.writeFileSync(pathAndFileName, fileContent, "utf-8");
	} catch (error: any) {
		qcli.message(
			`Error saving lines to ${pathAndFileName}: ${error.message}`,
			"error"
		);
	}
};
export const directoryExists = (directoryPath: string): boolean => {
	directoryPath = resolvePath(directoryPath);
	return fs.existsSync(directoryPath) && fs.statSync(directoryPath).isDirectory();
};

export const createDirectory = (directoryPath: string): void => {
	directoryPath = resolvePath(directoryPath);
	if (!fs.existsSync(directoryPath)) {
		fs.mkdirSync(directoryPath, { recursive: true });
	}
};

export const copyFile = (source: string, destination: string): void => {
	source = resolvePath(source);
	destination = resolvePath(destination);
	try {
		fs.copyFileSync(source, destination);
	} catch (error: any) {
		qcli.message(
			`Error copying file from ${source} to ${destination}: ${error.message}`,
			"error"
		);
	}
};

export const copyDirectory = (source: string, destination: string): void => {
	source = resolvePath(source);
	destination = resolvePath(destination);
	try {
		if (fs.existsSync(source)) {
			fs.cpSync(source, destination, { recursive: true });
		}
	} catch (error: any) {
		qcli.message(
			`Error copying directory from ${source} to ${destination}: ${error.message}`,
			"error"
		);
	}
};
