---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/LabBox Scenarios/[LabBox] Application Gateway TLS Proxy"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/LabBox%20Scenarios/%5BLabBox%5D%20Application%20Gateway%20TLS%20Proxy"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Labbox: Application Gateway TLS Proxy

[[_TOC_]]

:star: **IMPORTANT** :star:  
**This Lab will be deployed to your subscription. Please delete the created resources once tests are over.**

## Scenario
This lab deploys a working Application Gateway for TLS Proxy feature. The SKU used would be standard V2. The Gateway is deployed with a certificate from an internal self-signed certificate authority and so is the backend server. Users can login to the backend Virtual machine and connect to the application gateway. 

To access the application gateway after deployment, you would need to get the public IP address assigned to the Application Gateway and replace x.x.x.x with the public IP address.

```
curl -kv --resolve https.internal.fabrikam.com:443:x.x.x.x https://https.internal.fabrikam.com
```

## LabBox Deployment URL
* **LabBox Beta URL:** https://labboxbeta.azurewebsites.net/api/LabBox?url=https://supportability.visualstudio.com/_git/AzureNetworking?path=/.LabBoxRepo/Layer7/deploy_appgw_tls_proxy.json
* **LabBox Production URL:** https://labboxbeta.azurewebsites.net/api/LabBox?url=https://supportability.visualstudio.com/_git/AzureNetworking?path=/.LabBoxRepo/Layer7/deploy_appgw_tls_proxy.json

## Resources created
- AppGw-Tls-Proxy : Application Gateway V2
- BackendVM0-2 : Backend Windows IIS VMs
- NSG-SubnetAppGw : NSG for Subnet of Application Gateway
- NSG-SubnetVM: NSG for Subnet of Backend VMs
- VNet-AppGw : Virtual network for the lab (10.1.0.0/16)

## !!! Delete resources!
After testing, delete the Resource Group or individual resources to avoid unnecessary cost.

## Contributor(s)
- Michael Lee
