import { assertCompliance, scanRepository } from './src/scan-repository.js';
import { scanRepositoriesFromOrganisation } from './src/scan-repositories-from-organisation.js';
import { writeFile } from './src/io-file.js';

async function main() {
	const owner = 'my-org';
	const repository = 'my-repository';
	const repo = await scanRepository(owner, repository, true);
	const compliance = assertCompliance(repo);

	writeFile('repository.json', JSON.stringify(repo));
	writeFile('compliance.json', JSON.stringify(compliance));

	const org = await scanRepositoriesFromOrganisation(owner);

	writeFile('organisation.json', JSON.stringify(org));
};

main();
