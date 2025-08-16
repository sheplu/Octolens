import { getRepositoryTeams } from "@sheplu/yagi";

export async function computeRepository(owner, repository) {
	let repositoryPromises = [];
	repositoryPromises.push(
		getRepositoryTeams(owner, repository)
	);

	const data = await Promise.all(repositoryPromises);

	return {
		teams: data[0]
	}
};
