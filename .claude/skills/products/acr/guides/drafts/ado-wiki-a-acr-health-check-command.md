---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/How Tos/ACR Health-Check Command Background"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Health-Check%20Command%20Background"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# ACR Health-Check Command Background

The `az acr check-health` command performs the following checks to help diagnose ACR connectivity and tooling issues:

1. **Docker version check** — Verifies Docker is installed and checks the version. Old Docker versions may not conform to OCI standards, causing unexpected behavior.
2. **Docker pull from MCR** — Verifies that `docker pull` can fetch an image from Microsoft Container Registry (MCR) to confirm basic Docker daemon connectivity.
3. **Azure CLI version check** — Checks the Azure CLI version so users know when to upgrade to access new features.
4. **ACR data endpoint connectivity** — Ensures connectivity to `<registry-name>.azurecr.io` and verifies a token can be obtained, confirming DNS resolution works correctly.
5. **Helm version check** — Ensures Helm is installed and is at or above the minimum supported version.

## Usage

```bash
az acr check-health --name <registry-name> --ignore-errors
```

## Notes

- This command is designed for self-help diagnostics and can be expanded with additional checks
- If you encounter a scenario not covered by the current checks, bring the scenario to the team for support expansion
