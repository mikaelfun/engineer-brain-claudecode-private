---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra application proxy - Resource Based Kerberos Delegation"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20application%20proxy%20-%20Resource%20Based%20Kerberos%20Delegation"
importDate: "2026-04-07"
type: troubleshooting-guide
---

Resource Based Kerberos Constrained Delegation is used when the application and the connector are not in the same domain.

[Kerberos Constrained Delegation for single sign-on to your apps with Application Proxy](https://learn.microsoft.com/entra/identity/app-proxy/how-to-configure-sso-with-kcd)

Resource based Constrained Delegation is a model which works by allowing the resource control over what services at the middle tier are allowed to delegate to it. For example, in Microsoft Entra Application Proxy scenarios the middle tier would be the connector. If using Resource Based Delegation, you would configure the Proxy connector service to be "trusted" by adding it to the PrincipalsAllowedToDelegateToAccount attribute on the end resource's service account.

**Requirements:**

- 2-way forest trust between the forests.
- At least one Windows Server 2012 or newer should be installed in the domain in both forests.
- The suffix of the registered SPN should be in accordance with name suffix routing. (configured on the trust - Name Suffix Routing tab)
- if you use a flat SPN like http/example, you have to configure Kerberos Forest Search Order, KFSO on the domain controllers. (Avoid this, if it's possible)

**How to configure Resource Based Kerberos Constrained Delegation.**

[Configure Kerberos constrained delegation (KCD) on a managed domain](https://docs.microsoft.com/azure/active-directory-domain-services/active-directory-ds-enable-kcd)

See the section titled: Resource-based KCD

(Execute the steps as domain administrator and always from an elevated PowerShell. We will run all the commands in the forest of the backend server.)

1) Register the SPN.

Determine what AD account is used as the service account for the Web application, and its type: domain user or domain computer account. Run the command accordingly.

Setting on a domain user:
`setspn -u -s <SPN> <FLAT_USERNAME>`

Setting on a domain computer account:
`setspn -s <SPN> <FLAT_COMPUTERNAME_OF_THE_BACKEND_SERVER>`

2) Configure the SPN for the MEAP app in SSO settings on the Entra Portal.

3) Configure the Resource Based Kerberos Constrained Delegation

```powershell
$computer = Get-ADComputer -Identity <FLAT_NAME_OF_THE_CONNECTOR_SERVER> -server <FQDN_OF_ONE_OF_THE_DCs_FROM_THE_DOMAIN_OF_THE_CONNECTOR_SERVER>

# Setting for a domain user:
Set-ADUser -identity <FLAT_USERNAME> -PrincipalsAllowedToDelegateToAccount $computer

# Setting for a domain computer account:
Set-ADComputer -identity <FLAT_COMPUTERNAME_OF_THE_BACKEND_SERVER> -PrincipalsAllowedToDelegateToAccount $computer
```

**Important Note:**

For previous working cross forest scenarios where due to some Customer's specific configuration or error during initial setup phase **Kerberos Unconstrained Delegation** was configured instead of the **Resource Based Kerberos Constrained Delegation**, after July 2019 updates, authentication requests will fail. Active Directory domain controllers will intentionally block unconstrained delegation across forest, external, and quarantined trusts.

The recommendation is always to configure Microsoft Entra Application Proxy scenarios according to documentation: **Resource Based Kerberos Constrained Delegation**.

Reference: https://support.microsoft.com/help/4490425/updates-to-tgt-delegation-across-incoming-trusts-in-windows-server
