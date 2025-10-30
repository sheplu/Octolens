import { listRepositorySecrets } from '@sheplu/yagi/src/actions/secrets.js';
import { listBranches } from '@sheplu/yagi/src/branches/branches.js';
import { listCollaborators } from '@sheplu/yagi/src/collaborators/collaborators.js';
import { listAlertsRepository } from '@sheplu/yagi/src/dependabot/alerts.js';
import { listEnvironments } from '@sheplu/yagi/src/deployments/environments.js';
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
import { readFileSync } from 'node:fs';

const defaultComplianceSchema = JSON.parse(
	readFileSync(new URL('./default-compliance-schema.json', import.meta.url), 'utf8'),
);

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
			listRepositorySecrets(owner, repository),
			listEnvironments(owner, repository),
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
			secrets: repo[14],
			environments: repo[15],
		};

		result = {
			...result,
			...additionalData,
		};
	}

	return result;
};

export function assertCompliance(payload, complianceSchema = defaultComplianceSchema) {
	const ajv = new Ajv({
		allErrors: true,
		strict: true,
		removeAdditional: 'all',
	});

	const validate = ajv.compile(complianceSchema);

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
