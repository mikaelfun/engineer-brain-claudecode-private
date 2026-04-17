---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Hello for Business/WHfB: Whats New"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FStrongAuth%20Passwordless%28WHfB%20FIDO%20phone%20based%29%2FHello%20for%20Business%2FWHfB%3A%20Whats%20New"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# What's New

This page is intended to share new features and enhancements designed to improve security and user experience using Windows Hello for Business.

## Deploying Certificates to Key Trust Users to Enable RDP

There is a new public WHFB doc for Hybrid Key Trust deployment for RDP scenarios.

Please see: [Deploying Certificates to Key Trust Users to Enable RDP](https://docs.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/hello-deployment-rdp-certs)

## Synchronous Certificate enrollment is available for Hybrid Certificate Trust deployments

**Before**: Users would create their PIN. Afterwards, notify the user their PIN would be ready later (after the public key was synchronized to the on-premises AD using AAD Connect).

**Now:** Users create their PIN and then enroll for their certificate during Windows Hello provisioning. The user can immediately use their certificate and PIN or biometrics for authentication.

This article explains the process of provisioning in a synchronous certificate trust deployment in a federated environment, detailing each step from access token request to certificate installation.

Please see: [Hybrid Azure AD joined provisioning in a synchronous Certificate Trust deployment in a Federated environment](https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/431139/Hybrid-Azure-AD-joined-provisioning-in-a-synchronous-Certificate-Trust-deployment-in-a-Federated-environment)
