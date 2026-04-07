---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway for Containers (formerly Azure Traffic Controller)/LabBox Scenarios/[LabBox] Application Gateway for Container"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/LabBox%20Scenarios/%5BLabBox%5D%20Application%20Gateway%20for%20Container"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Labbox: Application Gateway for Container

[[_TOC_]]

> **IMPORTANT**: This Lab will be deployed to your subscription. Please delete the created resources once tests are over.

## Scenario

This lab deploys a functional Application Gateway for Containers alongside an AKS cluster. Before proceeding with the deployment, there are two important considerations:

1. **Selecting a LAB Scenario**: You need to choose one of the available LAB scenarios. Currently, there are five different scenarios provided based on [publicly available documents](https://learn.microsoft.com/en-us/azure/application-gateway/for-containers/overview)
2. **Choosing the Appropriate Region**: Ensure that the region you select supports both required features: [Federated Credential](https://learn.microsoft.com/en-us/azure/application-gateway/for-containers/overview#supported-regions) and [Application Gateway for Containers](https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation-considerations#unsupported-regions-user-assigned-managed-identities).

**Deployment time: approximately 15min**

## How to test access to application

Once the lab is deployed, you can find the deployed scenario and FQDN of the frontend on Application Gateway for Container in the Outputs.

The Lab is deployed based on How-to Guide in the public documentation:
- [Lab1 - TLS/SSL Offload](https://learn.microsoft.com/en-us/azure/application-gateway/for-containers/how-to-ssl-offloading-gateway-api?tabs=alb-managed#test-access-to-the-application)
- [Lab2 - Header Rewrite](https://learn.microsoft.com/en-us/azure/application-gateway/for-containers/how-to-header-rewrite-gateway-api?tabs=alb-managed#test-access-to-the-application)
- [Lab3 - URL Redirect](https://learn.microsoft.com/en-us/azure/application-gateway/for-containers/how-to-url-redirect-gateway-api?tabs=alb-managed#test-access-to-the-application)
- [Lab4 - URL Rewrite](https://learn.microsoft.com/en-us/azure/application-gateway/for-containers/how-to-url-rewrite-gateway-api?tabs=alb-managed#test-access-to-the-application)
- [Lab5 - Multi-site hosting](https://learn.microsoft.com/en-us/azure/application-gateway/for-containers/how-to-multiple-site-hosting-gateway-api?tabs=alb-managed#test-access-to-the-application)

For Lab1 TLS offloading test:
```bash
fqdn="<FQDN value from the Output>"
curl -k https://$fqdn/
```

## LabBox Deployment URLs

- **LabBox Beta URL:** https://labboxbeta.azurewebsites.net/api/LabBox?url=https://supportability.visualstudio.com/_git/AzureNetworking?path=/.LabBoxRepo/Layer7/deploy_appgw_for_container.json
- **LabBox Production URL:** https://labboxbeta.azurewebsites.net/api/LabBox?url=https://supportability.visualstudio.com/_git/AzureNetworking?path=/.LabBoxRepo/Layer7/deploy_appgw_for_container.json

## Resources created

- `aksALBcluster`: Kubernetes service
- `azure-alb-identity`: Managed Identity
- `userMidToRunScript`: Managed Identity for deployment script
- `DeploymentScriptForSshkey`: SSH key generation script
- `RunDeploymentScriptToDeployAppGw`: AGC deployment script
- `mySSHKey`: SSH Key for AKS cluster
- `Vnet-AppGw-Container`: Virtual Network
- `MC_<RG>_<Region>`: AKS managed resource group
- `alb-xxxxxx`: Application Gateway for Container

## Delete resources after testing!

After you are done with testing, delete the created resources to avoid unnecessary cost. If you deployed in a separate Resource Group, delete the entire Resource Group.
