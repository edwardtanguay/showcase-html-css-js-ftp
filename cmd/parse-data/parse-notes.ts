import { parseOutlineFile } from "./outline-parser.ts";

export function parseNotes(): void {
  parseOutlineFile({
    inputRelativePath: "data/notes.outline.dpod.txt",
    outputRelativePath: "js/data/notes.js",
    exportVarName: "notes",
    imagesRelativeDir: "images/outline"
  });
}
