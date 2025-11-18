import { listRepositories } from '@sheplu/yagi/src/repositories/repositories.js';
import { assertCompliance, scanRepository } from './scan-repository.js';
import { writeFile } from './io-file.js';

export async function scanRepositoriesFromOrganisation(owner) {
	const repos = await listRepositories(owner);
	const activeRepos = repos.filter((item) => item.archived === false);
	const computedRepos = [];
	const reposCount = activeRepos.length;
	let i = 0;

	for (const repo of activeRepos) {
		const item = await scanRepository(repo.owner.login, repo.name, true);
		const compliance = assertCompliance(item);

		computedRepos.push(compliance);
		console.log(`✅ ${++i} / ${reposCount} - ${repo.full_name}`);
	};

	writeFile('organisation.json', JSON.stringify(computedRepos));
};
