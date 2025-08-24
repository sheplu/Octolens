import { getRepositoriesFromOrganisation } from './src/organisation.js';

async function main() {
	await getRepositoriesFromOrganisation(process.env.ORGANISATION);
};

main();
