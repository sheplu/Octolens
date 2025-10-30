import assert from 'node:assert/strict';
import {
	beforeEach, test, mock,
} from 'node:test';

const listRepositorySecrets = mock.fn();
const listBranches = mock.fn();
const listCollaborators = mock.fn();
const listAlertsRepository = mock.fn();
const listEnvironments = mock.fn();
const listReleases = mock.fn();
const getBranchProtection = mock.fn();
const getBranchProtectionAdmin = mock.fn();
const getBranchProtectionPR = mock.fn();
const getDependabot = mock.fn();
const getRepository = mock.fn();
const getTopics = mock.fn();
const getVulnerabilityReporting = mock.fn();
const listCodeownersErrors = mock.fn();
const listLanguages = mock.fn();
const listTags = mock.fn();
const listTeams = mock.fn();

const dependencyMocks = [
	{ name: 'listRepositorySecrets', fn: listRepositorySecrets },
	{ name: 'listBranches', fn: listBranches },
	{ name: 'listCollaborators', fn: listCollaborators },
	{ name: 'listAlertsRepository', fn: listAlertsRepository },
	{ name: 'listEnvironments', fn: listEnvironments },
	{ name: 'listReleases', fn: listReleases },
	{ name: 'getBranchProtection', fn: getBranchProtection },
	{ name: 'getBranchProtectionAdmin', fn: getBranchProtectionAdmin },
	{ name: 'getBranchProtectionPR', fn: getBranchProtectionPR },
	{ name: 'getDependabot', fn: getDependabot },
	{ name: 'getRepository', fn: getRepository },
	{ name: 'getTopics', fn: getTopics },
	{ name: 'getVulnerabilityReporting', fn: getVulnerabilityReporting },
	{ name: 'listCodeownersErrors', fn: listCodeownersErrors },
	{ name: 'listLanguages', fn: listLanguages },
	{ name: 'listTags', fn: listTags },
	{ name: 'listTeams', fn: listTeams },
];

mock.module('@sheplu/yagi/src/actions/secrets.js', {
	namedExports: {
		listRepositorySecrets,
	},
});

mock.module('@sheplu/yagi/src/branches/branches.js', {
	namedExports: {
		listBranches,
	},
});

mock.module('@sheplu/yagi/src/collaborators/collaborators.js', {
	namedExports: {
		listCollaborators,
	},
});

mock.module('@sheplu/yagi/src/dependabot/alerts.js', {
	namedExports: {
		listAlertsRepository,
	},
});

mock.module('@sheplu/yagi/src/deployments/environments.js', {
	namedExports: {
		listEnvironments,
	},
});

mock.module('@sheplu/yagi/src/releases/releases.js', {
	namedExports: {
		listReleases,
	},
});

mock.module('@sheplu/yagi/src/branches/protected-branches.js', {
	namedExports: {
		getBranchProtection,
		getBranchProtectionAdmin,
		getBranchProtectionPR,
	},
});

mock.module('@sheplu/yagi/src/repositories/repositories.js', {
	namedExports: {
		getDependabot,
		getRepository,
		getTopics,
		getVulnerabilityReporting,
		listCodeownersErrors,
		listLanguages,
		listTags,
		listTeams,
	},
});

const { scanRepository, assertCompliance } = await import('../src/scan-repository.js');

beforeEach(() => {
	for (const { name, fn } of dependencyMocks) {
		fn.mock.resetCalls();
		fn.mock.mockImplementation(() => {
			throw new Error(`Unexpected call to ${name}`);
		});
	}
});

test('scanRepository returns base repository data when secondary data is disabled', async () => {
	const repositoryData = {
		id: 101,
		name: 'octolens',
		default_branch: 'main',
		description: 'Octolens repository',
	};

	getRepository.mock.mockImplementation(async (owner, repo) => {
		assert.strictEqual(owner, 'owner');
		assert.strictEqual(repo, 'repository');

		return repositoryData;
	});

	const result = await scanRepository('owner', 'repository');

	assert.notStrictEqual(result, repositoryData);
	assert.deepStrictEqual(result, repositoryData);
	assert.strictEqual(getRepository.mock.callCount(), 1);

	for (const { name, fn } of dependencyMocks) {
		if (name === 'getRepository') {
			continue;
		}

		assert.strictEqual(fn.mock.callCount(), 0, `${name} should not be called`);
	}
});

test('scanRepository collects secondary data when requested', async () => {
	const repositoryData = {
		id: 202,
		name: 'octolens',
		default_branch: 'develop',
		description: 'Octolens repository',
	};

	const dependabotConfig = { enabled: true, paused: false };
	const topicsList = [ 'security', 'compliance' ];
	const vulnerabilityReporting = { status: 'enabled' };
	const codeownerErrors = { status: 'ok' };
	const languages = { javascript: 85, typescript: 15 };
	const tags = [ 'v1.0.0' ];
	const teams = [ 'core', 'security', 'compliance' ];
	const collaborators = [ 'alice', 'bob' ];
	const releases = [ { name: 'v1.0.0' } ];
	const branches = [ 'main', 'develop' ];
	const protection = { required_status_checks: { strict: true } };
	const protectionAdmin = { enabled: true };
	const protectionPR = { required_approving_review_count: 2 };
	const dependabotAlerts = [ { id: 1 } ];
	const secrets = [ { name: 'API_KEY' } ];
	const environments = [ 'dev', 'staging', 'prod' ];

	getRepository.mock.mockImplementation(async () => repositoryData);
	getDependabot.mock.mockImplementation(async () => dependabotConfig);
	getTopics.mock.mockImplementation(async () => topicsList);
	getVulnerabilityReporting.mock.mockImplementation(async () => vulnerabilityReporting);
	listCodeownersErrors.mock.mockImplementation(async () => codeownerErrors);
	listLanguages.mock.mockImplementation(async () => languages);
	listTags.mock.mockImplementation(async () => tags);
	listTeams.mock.mockImplementation(async () => teams);
	listCollaborators.mock.mockImplementation(async () => collaborators);
	listReleases.mock.mockImplementation(async () => releases);
	listBranches.mock.mockImplementation(async () => branches);
	getBranchProtection.mock.mockImplementation(async () => protection);
	getBranchProtectionAdmin.mock.mockImplementation(async () => protectionAdmin);
	getBranchProtectionPR.mock.mockImplementation(async () => protectionPR);
	listAlertsRepository.mock.mockImplementation(async () => dependabotAlerts);
	listRepositorySecrets.mock.mockImplementation(async () => secrets);
	listEnvironments.mock.mockImplementation(async () => environments);

	const result = await scanRepository('owner', 'repository', true);

	assert.deepStrictEqual(result, {
		...repositoryData,
		dependabot: dependabotConfig,
		topicsList,
		vulnerabilityReporting,
		codeownerErrors,
		languages,
		tags,
		teams,
		collaborators,
		releases,
		branches,
		protectionDefaultBranch: {
			protection,
			protectionAdmin,
			protectionPR,
		},
		dependabotAlerts,
		secrets,
		environments,
	});

	assert.strictEqual(getRepository.mock.callCount(), 1);
	assert.deepStrictEqual(getRepository.mock.calls[0].arguments, [ 'owner', 'repository' ]);
	assert.deepStrictEqual(getBranchProtection.mock.calls[0].arguments, [
		'owner',
		'repository',
		'develop',
	]);
	assert.deepStrictEqual(getBranchProtectionAdmin.mock.calls[0].arguments, [
		'owner',
		'repository',
		'develop',
	]);
	assert.deepStrictEqual(getBranchProtectionPR.mock.calls[0].arguments, [
		'owner',
		'repository',
		'develop',
	]);

	for (const { name, fn } of dependencyMocks) {
		assert.strictEqual(fn.mock.callCount(), 1, `${name} should be called once`);
	}
});

test('assertCompliance returns no error when payload matches schema', () => {
	const payload = {
		has_issues: true,
		has_wiki: true,
		license: null,
		web_commit_signoff_required: true,
		visibility: 'private',
		delete_branch_on_merge: true,
		allow_update_branch: true,
		description: 'Repository is compliant',
		default_branch: 'main',
		dependabot: { enabled: true, paused: false },
		security_and_analysis: {
			dependabot_security_updates: {
				status: 'enabled',
			},
		},
		codeownerErrors: { status: 'ok' },
		teams: [ 'core', 'security', 'compliance' ],
		collaborators: [ 'alice' ],
		branches: [ 'main' ],
		dependabotAlerts: [ 'alert-1' ],
		secrets: [ 'secret-1' ],
		environments: [ 'dev', 'staging', 'prod' ],
	};

	const { payload: returnedPayload, error } = assertCompliance(payload);

	assert.strictEqual(error, undefined);
	assert.strictEqual(returnedPayload, payload);
});

test('assertCompliance surfaces validation failures', () => {
	const payload = {
		has_issues: false,
		has_wiki: true,
		license: null,
		web_commit_signoff_required: true,
		visibility: 'private',
		delete_branch_on_merge: true,
		allow_update_branch: true,
		description: 'Repository with issues disabled',
		default_branch: 'main',
		dependabot: { enabled: true, paused: false },
		security_and_analysis: {
			dependabot_security_updates: {
				status: 'enabled',
			},
		},
		codeownerErrors: { status: 'ok' },
		teams: [ 'core', 'security', 'compliance' ],
		collaborators: [ 'alice' ],
		branches: [ 'main' ],
		dependabotAlerts: [ 'alert-1' ],
		secrets: [ 'secret-1' ],
		environments: [ 'dev', 'staging', 'prod' ],
	};

	const { error } = assertCompliance(payload);

	assert.ok(error instanceof Error);
});

test('assertCompliance validates payload with custom schema', () => {
	const customSchema = {
		type: 'object',
		properties: {
			status: { type: 'string', const: 'ok' },
		},
		required: [ 'status' ],
		additionalProperties: false,
	};

	const compliantPayload = { status: 'ok', ignored: 'value' };
	const { error: okError, payload: okPayload } = assertCompliance(
		compliantPayload,
		customSchema,
	);

	assert.strictEqual(okError, undefined);
	assert.deepStrictEqual(okPayload, { status: 'ok' });

	const { error: failError } = assertCompliance({ status: 'fail' }, customSchema);

	assert.ok(failError instanceof Error);
});
