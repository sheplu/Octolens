# Octolens

**Security & Configuration Auditing for GitHub Repositories**

OctoLens is a CLI tool that scans and analyzes GitHub repositories — individually, in bulk, or across entire organizations — to produce detailed reports on:

- **Security posture** – vulnerabilities, secret leaks, insecure configurations.
- **Configuration compliance** – repository settings, governance rules, industry standards.
- **Best practices** – branch protection, workflow safety, and repository hygiene.

Whether you’re running a compliance audit, reviewing security health, or ensuring consistent configuration across teams, OctoLens delivers clear, actionable insights.

## ✨ Features

- 🔍 **Full-Org Scanning** – Audit one, multiple, or all repositories in a GitHub organization.
- 📋 **Detailed Reports** – Export findings in human-readable or machine-consumable formats (JSON, Markdown, HTML).
- 🛡 **Security Checks** – Detect risky settings, missing protections, and potential vulnerabilities.
- ⚙ **Configuration Review** – Validate settings against good practices and compliance requirements.
- 🧭 **Customizable Rules** – Extend or override checks to match your own standards.

## 🚀 Installation

```bash
# Install globally via npm
npm install -g @sheplu/octolens

# Or run via npx
npx @sheplu/octolens <command>
```

## 🔍 Checks Performed

- Branch Protection Rules – required reviews, status checks, force push restrictions.
- Secret Detection – scan for keys, tokens, and sensitive strings.
- Workflow Security – GitHub Actions pinned versions and allowed actions list.
- Repo Settings – visibility, forking policy, issues enabled, wiki status.
- Dependency Health – dependabot enabled, outdated dependencies.
- License & Docs – presence of license, README, and contributing guidelines.

## 📂 Output Formats

- JSON – For automation and CI pipelines.
- Markdown – For reports and documentation.
- HTML – For compliance reviews.

## 🛠 Configuration

OctoLens can be customized with a `octolens.config.json` file in your project root or home directory.

**Example:**

```json
{
  "rules": {
    "branch_protection_required_reviews": true,
    "secret_scan_enabled": true,
    "license_required": true
  },
  "output": {
    "format": "markdown",
    "file": "./reports/audit.md"
  }
}
```
