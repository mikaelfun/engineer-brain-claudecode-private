---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACStor/Platform and Tooling/Geneva logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACStor/Platform%20and%20Tooling/Geneva%20logs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Access Geneva Logs for ACStor

1. Go to <https://portal.microsoftgeneva.com>
2. Select Logs `DGrep` from the left menu
3. Set the following values:
    - Endpoint: `Diagnostic PROD`
    - Namespace: `ACStor`
    - Event: `ACStor`
4. Click search
5. Once logs are fetched, use the KQL to perform client-side query on the logs fetched.

Example: [query](https://portal.microsoftgeneva.com/s/AC5D951A) looks for <container-name> logs from <cluster-name> cluster. You also can add other fields for querying.
