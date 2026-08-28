import * as fs from "fs";
import * as path from "path";
import * as qfil from "../qtools/qfil";
import * as qstr from "../qtools/qstr";
import * as qcli from "../qtools/qcli";

export interface OutlineItem {
	id: string;
	body: string;
	indent: number;
	image: string;
}

export class OutlineParser {
	static execute() {
		const parser = new OutlineParser();
		parser.parse();
	}

	parse() {
		const inputPath = "data/dijon.outline.dpod.txt";
		const outputDir = "data-parsed";
		const outputPath = "data-parsed/dijon.json";

		if (!qfil.fileExists(inputPath)) {
			qcli.message(`Fichier introuvable: ${inputPath}`, "error");
			return;
		}

		const lines = qfil.getLinesFromFile(inputPath);
		const items: OutlineItem[] = [];

		for (const line of lines) {
			if (qstr.isEmpty(line)) {
				continue;
			}

			// Calculate indent count (leading tabs)
			let indent = 0;
			while (indent < line.length && line.charAt(indent) === "\t") {
				indent++;
			}

			// Strip leading tabs
			let content = line.substring(indent);

			// Strip "- " prefix if present
			if (content.startsWith("- ")) {
				content = content.substring(2);
			} else if (content.startsWith("-")) {
				content = content.substring(1);
			}

			let image = "";
			const tagMatch = content.match(/##([a-zA-Z0-9_\-]+)\s*$/);
			if (tagMatch) {
				const tag = tagMatch[1];
				// Remove tag from content
				content = content.replace(/##[a-zA-Z0-9_\-]+\s*$/, "").trimEnd();

				// Search in public/images/outline for file with matching name and extension
				const outlineImgDir = "public/images/outline";
				let foundFileName = "";
				if (qfil.directoryExists(outlineImgDir)) {
					const files = fs.readdirSync(outlineImgDir);
					const matchedFile = files.find((f) => {
						const ext = path.extname(f).toLowerCase();
						const base = path.basename(f, path.extname(f)).toLowerCase();
						return (
							base === tag.toLowerCase() &&
							[".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)
						);
					});
					if (matchedFile) {
						foundFileName = matchedFile;
					}
				}

				if (foundFileName) {
					image = foundFileName;
				} else {
					image = `NOT_FOUND:${tag}`;
				}
			}

			const id = qstr.generateSuuid();
			items.push({
				id,
				body: content,
				indent,
				image
			});
		}

		if (!qfil.directoryExists(outputDir)) {
			qfil.createDirectory(outputDir);
		}

		qfil.saveArrayOfObjectsToJsonFile(items, outputPath);
		qcli.message(`Données converties avec succès dans ${outputPath} (${items.length} éléments)`, "success");
	}
}
