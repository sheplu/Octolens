import { listRepositories } from '@sheplu/yagi';
import { writeFile } from './io-file.js';
import { computeRepository } from './repository.js';

export async function getRepositoriesFromOrganisation(organisation, path = 'repositories.json') {
	const repositories = await listRepositories(organisation);
	const cleanedRepositories = [];

	for await (const repository of repositories) {
		const fullRepository = await computeRepository(
			organisation,
			repository.name,
			repository.default_branch,
		);

		cleanedRepositories.push({ ...cleanRepositoryObject(repository), ...fullRepository });
	}

	writeFile(path, JSON.stringify(cleanedRepositories));

	return cleanedRepositories;
};

function cleanRepositoryObject(repository) {
	return {
		'id': repository.id,
		'name': repository.name,
		'full_name': repository.full_name,
		'private': repository.private,
		'description': repository.description,
		'fork': repository.fork,
		'created_at': repository.created_at,
		'updated_at': repository.updated_at,
		'pushed_at': repository.pushed_at,
		'size': repository.size,
		'language': repository.language,
		'has_issue': repository.has_issue,
		'has_wiki': repository.has_wiki,
		'archived': repository.archived,
		'disabled': repository.disabled,
		'license': repository.license,
		'web_commit_signoff_required': repository.web_commit_signoff_required,
		'topics': repository.topics,
		'visibility': repository.visibility,
		'default_branch': repository.default_branch,
		'permissions': repository.permissions,
		'security_and_analysis': repository.security_and_analysis,
	};
};
