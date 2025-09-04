import {
	getCodeowners,
	getDependabot,
	getRepositoryTeams,
	listCollaborators,
	getRepositoryLanguages,
	listTags,
	getTopics,
	listRepositoryEnvironments,
	getRepositorySecrets,
	listReleases,
} from '@sheplu/yagi';

export async function computeRepository(owner, repository) {
	let repositoryPromises = [];

	repositoryPromises.push(
		getRepositoryTeams(owner, repository),
		getDependabot(owner, repository),
		getCodeowners(owner, repository),
		listCollaborators(owner, repository, 'direct'),
		getRepositoryLanguages(owner, repository),
		listTags(owner, repository),
		getTopics(owner, repository),
		listRepositoryEnvironments(owner, repository),
		getRepositorySecrets(owner, repository),
		listReleases(owner, repository),
	);

	const data = await Promise.all(repositoryPromises);

	return {
		teams: data[0],
		dependabot: data[1],
		codeowners: data[2],
		collaborators: data[3],
		languages: data[4],
		tags: data[5],
		topics: data[6],
		environments: data[7],
		secrets: data[8],
		releases: data[9],
	};
};
