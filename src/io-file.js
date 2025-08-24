import { writeFileSync } from 'node:fs';

export function writeFile(path, data) {
	try {
		writeFileSync(path, data);
	} catch (error) {
		console.error(error);
	}
};
