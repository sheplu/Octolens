import { listBranches } from '@sheplu/yagi/src/branches/branches.js';
import { listCollaborators } from '@sheplu/yagi/src/collaborators/collaborators.js';
import { listAlertsRepository } from '@sheplu/yagi/src/dependabot/alerts.js';
import { listReleases } from '@sheplu/yagi/src/releases/releases.js';
import {
	getBranchProtection,
	getBranchProtectionAdmin,
	getBranchProtectionPR,
} from '@sheplu/yagi/src/branches/protected-branches.js';
import {
	getDependabot,
	getRepository,
	getTopics,
	getVulnerabilityReporting,
	listCodeownersErrors,
	listLanguages,
	listTags,
	listTeams,
} from '@sheplu/yagi/src/repositories/repositories.js';
import { Ajv } from 'ajv';

export async function scanRepository(owner, repository, secondaryData = false) {
	let promises = [];
	const fetchRepository = await getRepository(owner, repository);
	let result = { ...fetchRepository };

	if (secondaryData) {
		promises.push(
			getDependabot(owner, repository),
			getTopics(owner, repository),
			getVulnerabilityReporting(owner, repository),
			listCodeownersErrors(owner, repository),
			listLanguages(owner, repository),
			listTags(owner, repository),
			listTeams(owner, repository),
			listCollaborators(owner, repository),
			listReleases(owner, repository),
			listBranches(owner, repository),
			getBranchProtection(owner, repository, fetchRepository.default_branch),
			getBranchProtectionAdmin(owner, repository, fetchRepository.default_branch),
			getBranchProtectionPR(owner, repository, fetchRepository.default_branch),
			listAlertsRepository(owner, repository),
		);

		const repo = await Promise.all(promises);
		const additionalData = {
			dependabot: repo[0],
			topicsList: repo[1],
			vulnerabilityReporting: repo[2],
			codeownerErrors: repo[3],
			languages: repo[4],
			tags: repo[5],
			teams: repo[6],
			collaborators: repo[7],
			releases: repo[8],
			branches: repo[9],
			protectionDefaultBranch: {
				protection: repo[10],
				protectionAdmin: repo[11],
				protectionPR: repo[12],
			},
			dependabotAlerts: repo[13],
		};

		result = {
			...result,
			...additionalData,
		};
	}

	return result;
};

const ajv = new Ajv({
	allErrors: true,
	strict: true,
	removeAdditional: 'all',
});

const schema = {
	type: 'object',
	properties: {
		has_issues: { 'type': 'boolean', 'const': true },
		has_wiki: { 'type': 'boolean', 'const': true },
		license: { 'const': null },
		web_commit_signoff_required: { 'type': 'boolean', 'const': true },
		visibility: { 'type': 'string', 'enum': [ 'private', 'internal' ] },
		delete_branch_on_merge: { 'type': 'boolean', 'const': true },
		allow_update_branch: { 'type': 'boolean', 'const': true },
		description: { type: 'string', minLength: 1 },
		default_branch: { type: 'string', not: { 'const': 'master' } },
		dependabot: {
			type: 'object',
			properties: {
				enabled: { 'type': 'boolean', 'const': true },
				paused: { 'type': 'boolean', 'const': false },
			},
		},
		security_and_analysis: {
			type: 'object',
			properties: {
				dependabot_security_updates: {
					type: 'object',
					properties: {
						status: {
							'type': 'string',
							'const': 'enabled',
						},
					},
				},
			},
		},
		codeownerErrors: {
			type: 'object',
			properties: {
				status: {
					type: 'string',
					not: { 'const': '404' },
				},
			},
		},
		teams: {
			type: 'array',
			minLength: 3,
			maxLength: 6,
		},
		collaborators: {
			type: 'array',
			maxLength: 3,
		},
		branches: {
			type: 'array',
			maxLength: 15,
		},
		dependabotAlerts: {
			type: 'array',
			maxLength: 5,
		},
		topics: {
			type: 'array',
			minLength: 1,
		},
	},
	required: [
		'has_issues',
		'has_wiki',
		'license',
		'web_commit_signoff_required',
		'visibility',
		'delete_branch_on_merge',
		'allow_update_branch',
		'description',
		'default_branch',
		'dependabot',
		'security_and_analysis',
		'codeownerErrors',
		'teams',
		'collaborators',
		'branches',
		'dependabotAlerts',
	],
	additionalProperties: true,
};

const validate = ajv.compile(schema);

export function assertCompliance(payload) {
	const ok = validate(payload);
	let err;

	if (!ok) {
		const errors = (validate.errors || []).map((e) => {
			const path = e.instancePath || '(root)';

			return `${path} ${e.message}`;
		});

		err = new Error('Validation failed');
		err.details = errors;
	};

	return {
		payload,
		error: err,
	};
}
