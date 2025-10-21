import { scanRepository } from './src/scan-repository.js';
import { writeFile } from './src/io-file.js';

async function main() {
	const repo = await scanRepository('owner', 'repository');

	writeFile('repository.json', JSON.stringify(repo));
};

main();
