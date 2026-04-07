---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Seamless Single Sign On (SSO)/Azure AD Seamless Single Sign On (SSO) - Known Issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Seamless%20Single%20Sign%20On%20%28SSO%29%2FAzure%20AD%20Seamless%20Single%20Sign%20On%20%28SSO%29%20-%20Known%20Issues"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Forest trust with a Seamless SSO enabled forest

We have forest A and B. There is a forest trust between them. Forest A is Seamless SSO enabled. User in Forest B are synced to Microsoft Entra ID. We want that users in forest B benefit from the Seamless SSO feature, but we don't want to enable the feature explicitly for forest B.

In this case an extra configuration step is required that can be done by GPO. **Either option a or b!**

a) On all the clients:

_The policy Computer Configuration ->Administrative Templates -> System -> Kerberos -> Use forest search order_

Enabled
Forest to Search: Forest A

b) On all the Domain Controllers:

_The policy Computer Configuration ->Administrative Templates -> System -> KDC -> Use forest search order_

Enabled
Forest to Search: Forest A
