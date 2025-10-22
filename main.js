import { assertCompliance, scanRepository } from './src/scan-repository.js';
import { writeFile } from './src/io-file.js';

async function main() {
	const repo = await scanRepository('owner', 'repository', true);

	writeFile('repository.json', JSON.stringify(repo));
	const compliance = assertCompliance(repo);

	writeFile('compliance.json', JSON.stringify(compliance));
};

main();
