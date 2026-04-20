---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Firewall/Features & Functions/TLS Inspection - Certificates"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Firewall%2FFeatures%20%26%20Functions%2FTLS%20Inspection%20-%20Certificates"
importDate: "2026-04-18"
type: troubleshooting-guide
---

[[_TOC_]]


#TLS inspection
Azure Firewall allows for TLS inspection by inserting a man-in-the-middle Intermediate CA certificate to the Firewall. 
TLS inspection uses this to let the AZFW look into encrypted HTTPS request for malicious signatures. 

![Explaination of TLS inspection Topology.png](/.attachments/image-8445260d-7730-40a0-b994-81d4e855ce37.png)

Topology credit to Eliran 

- Public Doc - Explaining the overall concept and high-level use of certs
- https://docs.microsoft.com/en-us/azure/firewall/premium-features#tls-inspection

- Public Doc - On Specific Cert Requirements
- https://docs.microsoft.com/en-us/azure/firewall/premium-certificates
  - For troubleshooting, there is a documented process to create Self Signed Certificates on the public docs.

## Internal MSFT Information

The Azure Firewall does not directly install the "customer Key-vault certificate" on to the Azfw Instances.  Instead, the Azure platform generates another "short-lived" Intermediate CA across each of the instances. This is why the "customer certificate" requires a minimum CA Path length of 1.

**Another explanation**: The level 1 certificate is put in KV and never actually gets installed on the Azure Firewall instances. It is used to issue certificates for the firewall instances. This is short-lived and rotated intermediate certificate. This happens behind the scenes and is transparent to you as the customer. This intermediate certificate has a path length of 0. This is then the certificate that will issue the proxied Server Certificate to the client. This why the certificate place in the key vault by the customer needs to have a path length of 1. The product group has also confirmed that this design cannot be changed for the Azure Firewall product.

![Visual Explanation of Cert Path Lengths.png](/.attachments/image-425b5b21-6d66-4462-916d-666b3468fc2e.png)

These Azure platform generate certificates re-cycle every 12 hours based on the source code. 
The Azure Instances will refresh this Firewall Manager Cert every 5 min, and check the cert health every 2 hours.

**Reference ICM:** https://portal.microsofticm.com/imp/v3/incidents/details/301800018/home

##Certificates - Azure Platform Logs

### NFVRP - Logs (Cert Installation from Keyvault)

NFVRP: This is where the control plane will reach out to refresh the cert. This happens every 12hrs. 
 
Source Code:[FirewallPolicyCertificatesPeriodicWorkItem.cs - Repos](https://msazure.visualstudio.com/One/_git/Networking-nfv?path=%2Fsrc%2FNfvRp%2FCore%2FWorker%2FWorkitems%2FFirewallPolicy%2FFirewallPolicyCertificatesPeriodicWorkItem.cs&version=GBdevelop2) 
```
public override TimeSpan PeriodicInterval
        {
            get
            {
                return TimeSpan.FromHours(12);
            }
```
[Jarvis Example Link](<https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&offset=-30&offsetUnit=Minutes&UTC=true&ep=Diagnostics%20PROD&ns=nfvrp&en=BackendEvent&conditions=[["CustomerSubscriptionId","contains","xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"]]&clientQuery=where%20Message%20!%3D%20"NfvRp%20is%20not%20expected%20to%20contain%20the%20setting.%20Benign%20Error%20while%20fetching%20setting%20name%20%3D%20RegionalDeploymentMoniker.%20Exception%20%3D%20The%20given%20key%20was%20not%20present%20in%20the%20dictionary."%0Awhere%20it.any("cert")&aggregates=["Count%20by%20Protocol","Count%20by%20Source","Count%20by%20category","Count%20by%20Action"]&chartEditorVisible=true&chartType=line&chartLayers=[["New%20Layer",""]]%20>)
- Namespace: NFVRP
- Event: BackendEvent

- Turning - TLS inspection on.:
- ![Turning - TLS inspection](/.attachments/image-fa5ef2fa-584f-4da3-87eb-3f2ec0b076fe.png)

###GSAGW - Logs (Azure Firewall instances - Checking and Refreshing Certs)
 
GSAGW:  This is where the AZFW instance are setup to check to make sure the check is still valid and also refresh the certificate on there stores.

Source Code:   [certs.go - Repos](https://msazure.visualstudio.com/One/_git/Networking-GSA?path=/src/golang/src/azfw_syncer/certs/certs.go)

[Jarvis Example Link](<https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&offset=-2&offsetUnit=Hours&UTC=true&ep=Diagnostics%20PROD&ns=GSAGW&en=Runtime&scopingConditions=[["Tenant","/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/RESOURCEGROUPNAME/providers/Microsoft.Network/azureFirewalls/AZFWNAME"]]&conditions=[]&clientQuery=orderby%20PreciseTimeStamp%20asc%0Awhere%20it.any("certsyncer")&aggregates=["Count%20by%20Protocol","Count%20by%20Source","Count%20by%20category","Count%20by%20Action"]&chartEditorVisible=true&chartType=line&chartLayers=[["New%20Layer",""]]%20>)
- Namespace: GSAGW
- Event: Runtime 
 
Filter on 
- Tenant = RESOURCE URI
- Or 
- "Any" field contains SUBID
 
All certification operations will have the record "certsyncer". This falls under the "MSG" column.  It is part of the "AZFWSYNCER" app. 

Example: (NO TLS)
- At 13:36 AZFW was created with TLS Inspection NOT enabled
- ![Azfw instances with no TLS](/.attachments/image-144c5a98-51a5-4a73-accd-9ed79d22175c.png)

Example: (Turning on TLS)
- At 13:41, TLS Inspection was enabled
- ![Azure Firewall instance with TLS enabled](/.attachments/image-16896725-ed26-48f9-b557-3c84316f89c0.png)

Example: (CertSyner working every 5 mins)
- ![Certsyner refresh working every 5 mins](/.attachments/image-4cf07c0e-7464-42cb-8ca2-c7c528415182.png)

Example: (Instances checking for Cert Health every 2 hrs)
- [Jarvis Link](<https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&offset=-3&offsetUnit=Hours&UTC=true&ep=Diagnostics%20PROD&ns=GSAGW&en=Runtime&scopingConditions=[["Tenant","/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/RESOURCEGROUPNAME/providers/Microsoft.Network/azureFirewalls/AZFWNAME"]]&conditions=[]&clientQuery=orderby%20PreciseTimeStamp%20asc%0Awhere%20it.any("certsyncer")%0Awhere%20it.any("health")&aggregates=["Count%20by%20Protocol","Count%20by%20Source","Count%20by%20category","Count%20by%20Action"]&chartEditorVisible=true&chartType=line&chartLayers=[["New%20Layer",""]]%20>)
- Look for "HEALTH" in the MSG column
-![Instances checking for Cert Health every 2 hours](/.attachments/image-b6aabe71-a866-4944-a45f-919337536b02.png)







<br>
<hr>
<br>

#AZFW - TLS Ciphers use in the Proxied Connection
When the AZFW perform TLS inspection, it opens its own TLS connection to the destination. 
The internal ciphers of the requirements for this connection are.

- https://portal.microsofticm.com/imp/v3/incidents/details/312219817/home
- All secure Connections from Firewall enforce atleast TLS 1.2 version.
- HTTP custom error code of 465(TLSVersionMismatch) will be thrown if this requirement is not met.
- We don't have list of ciphers supported / documented for TLS version 1.2 or 1.3.
- Client Hello will dictate TLS version(atleast >= TLS 1.2 version is needed) and cipher suite used for connection. 
https://datatracker.ietf.org/doc/html/rfc5246#section-7.3 and 
https://datatracker.ietf.org/doc/html/rfc5246#section-7.4.2  might contain good information on how ciphers are advertised and what suite will be selected in the connection establishment 

Screenshot of Lab TLS HANDSHAKE - Trace taken from Destination Server
- 51..x.x.x IP is AZFW PUBLIC IP
- 10.x.x.x IP is Destination Private IP

![Wireshark of TLS handshake](/.attachments/image-b0fd493a-a176-42f7-bf98-95283693fbb2.png)

![List of TLS 1.2 Ciphers from wireshark](/.attachments/image-419af1c9-5266-4baf-8cb1-52c73e13e0a1.png)

Reference ICM: https://portal.microsofticm.com/imp/v3/incidents/details/312219817/home

<br>
<hr>
<br>

#How to ensure TLS inspection occurs
For TLS inspection to occur for a conversation, the conversation must match application rule.
- Application Rule has a check box to enabled inspection on a match.
  - ![Screenshot of portal with TLS checkbox](/.attachments/image-d78253bb-4755-45e7-9ded-b8836a05dd77.png)
- If traffic matches a network rule, TLS inspection will not occur
- If the customer is using a "WEB Category" with an application rule, some categories are prevented from performing TLS inspection.
  - Choice was made to disable TLS inspection on certain Category that may contain PII. 
  - To confirm if that web Category allows it, you must look at the MSFT JSON file for the web category. 
  - Located on the WEB Categories "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki/855081/Azure-Firewall-Web-Categories"
  - ![View of JSON file with TLS disabled](/.attachments/image-7bafc2f4-2a6c-438b-809d-3b051f339a50.png)
  - This can be overridden by specifying the specific URL of the site and no using web categories.  


#How to check TLS inspection working from customer side
- Run "curl -v https://<someurl>" from a client the is routing through the Azure firewall
- Make sure the request will be processed by an Application Rule with TLS inspection enabled.
- Look for Azure Firewall certificate.

#Additional answers to common questions
1. Why does the private key need to be exportable?
   -  Private Key need to be exportable because it is being used by AZFW, it allows us to attach the key with the certificate in a portable format we use in the firewall.
2. Who can export the private key?
   - Azure Firewall can retrieve the private key using the managed identity that the customer configured in Azure Firewall TLSi settings. 
3. Are the certificates secure on the backend instances?
   -  Azure Firewall backend instances are secured with latest security patches. Customer's private key is never installed in the backend instances. We create short lived certs and keys to install in the instances. Those are created and signed with cx's cert.
4. How can they further secure the private key?
   -  Keyvault is the secure way to store certs in azure. We handle the certs securely and never expose them.
5. Is there any workaround to the password-less requirement?
   - There is no workaround since password protected certificates will require a sharing mechanism with Azure Firewall and there is no supported procedure today to share a password in a secure manner with Azure Firewall backend instances.
