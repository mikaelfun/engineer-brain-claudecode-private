---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/How Tos/ACR Health-Check Command Background"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR/How%20Tos/ACR%20Health-Check%20Command%20Background"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ACR Health-Check Command Background

The `az acr check-health` command performs the following checks:

1. Check docker is installed and check version. Old docker doesn't conform to the OCI spec, hence some functionality might not work as expected.
2. Check you can use `docker pull` an image from MCR.
3. Check Azure CLI version so users know to upgrade to try out new features.
4. Ensure we can connect to the data endpoint of `<reg name>.azurecr.io` and get a token back — so DNS works.
5. Ensure the helm is installed and newer than the minimum version.

**NOTE:** This command can be expanded to add more checks for self-help.

## Owner and Contributors

**Owner:** Naomi Priola <Naomi.Priola@microsoft.com>
**Contributors:** Ines Monteiro, Karina Jacamo, johngose, Arindam Dhar
