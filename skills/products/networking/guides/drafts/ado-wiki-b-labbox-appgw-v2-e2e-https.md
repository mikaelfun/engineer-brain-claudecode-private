---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/LabBox Scenarios/[LabBox] Application Gateway V2 E2E HTTPS"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/LabBox%20Scenarios/%5BLabBox%5D%20Application%20Gateway%20V2%20E2E%20HTTPS"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Labbox: Application Gateway Standard v2 End to End HTTPs

[[_TOC_]]

:star: **IMPORTANT** :star:  
**This Lab will be deployed to your subscription. Please delete the created resources once tests are over.**

## Scenario
This lab deploys a working Application Gateway. The SKU used would be standard V2.  
The Gateway is deployed with a certificate from an internal certificate authority and so is the backend server.  
Users can login to the client Virtual machine and connect to the application gateway.

The certificate on the gateway is deployed with a subject alternate name of *.fabrikam.com.  
After deployment, create an entry in the hostfile of ClientVM1: `site1.fabrikam.com` → public IP of the gateway.  
Host file location: `c:\windows\system32\drivers\etc\hosts`

## LabBox Deployment URL
* **LabBox Beta URL:** https://labboxbeta.azurewebsites.net/api/Labbox?url=https://supportability.visualstudio.com/_git/AzureNetworking?path=/.LabBoxRepo/Layer7/AppGWv2-E2E-HTTPS.json
* **LabBox Production URL:** https://labboxprod.azurewebsites.net/api/Labbox?url=https://supportability.visualstudio.com/_git/AzureNetworking?path=/.LabBoxRepo/Layer7/AppGWv2-E2E-HTTPS.json

## Resources created
- BackendVM1 : VM hosting the application as AppGW backend
- ClientVM1 : VM to connect to AppGW via https://site1.fabrikam.com
- AppGWv2-HTTPS : Application Gateway Standard V2
- AppGWv2-HTTPS-PIP : Public IP of the gateway
- ApplicationGW-Vnet : VNet 10.1.0.0/16 with AppGwV2-Subnet and VM-Subnet
- APPGW-Subnet-NSG : NSG allowing 443 from all IPs + Gateway Manager rules
- VM-Subnet-NSG : NSG allowing RDP from your public IP

## !!! Delete resources!
After testing, delete the Resource Group or individual resources to avoid unnecessary cost.
