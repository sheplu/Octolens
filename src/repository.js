import { getCodeowners, getDependabot, getRepositoryTeams } from "@sheplu/yagi";

export async function computeRepository(owner, repository) {
	let repositoryPromises = [];
	repositoryPromises.push(
		getRepositoryTeams(owner, repository),
		getDependabot(owner, repository),
		getCodeowners(owner, repository)
	);

	const data = await Promise.all(repositoryPromises);

	return {
		teams: data[0],
		dependabot: data[1],
		codeowners: data[2],
	}
};
