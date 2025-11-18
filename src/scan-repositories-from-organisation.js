import { listRepositories } from '@sheplu/yagi/src/repositories/repositories.js';
import { assertCompliance, scanRepository } from './scan-repository.js';

export async function scanRepositoriesFromOrganisation(owner) {
	const repos = await listRepositories(owner);
	const activeRepos = repos.filter((item) => item.archived === false);
	const computedRepos = [];
	const reposCount = activeRepos.length;
	let i = 0;

	console.log(`Total of repositories fetched: ${reposCount}`);

	for (const repo of activeRepos) {
		const item = await scanRepository(repo.owner.login, repo.name, true);
		const compliance = assertCompliance(item);
		const complianceError = compliance.error ?
			'⚠️' :
			'✨';

		computedRepos.push(compliance);
		console.log(`✅ ${++i} / ${reposCount} - ${repo.full_name} ${complianceError}`);
	};

	return computedRepos;
};
