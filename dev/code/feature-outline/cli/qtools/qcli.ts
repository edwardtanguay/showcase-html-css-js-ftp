// qcli = quick tools for CLI commands

type CliMessageKind = "info" | "error" | "success" | "warning" | "doing";

/**
 * prints a CLI message
 *
 */
export const message = (
	line: string,
	kind: CliMessageKind = "success"
): void => {
	switch (kind) {
		case "info":
			console.log(`ℹ️  ${line}`);
			break;
		case "error":
			console.log(`❌ ${line}`);
			break;
		case "warning":
			console.log(`⚠️  ${line}`);
			break;
		case "doing":
			console.log(`⏳ ${line}`);
			break;
		default:
			console.log(`✅ ${line}`);
			break;
	}
};
