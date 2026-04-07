---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Entra ID App Management/Application_and_Service_Principal_Object_Management/How to/AWS CLI Integration with Azure AD"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Entra%20ID%20App%20Management/Application_and_Service_Principal_Object_Management/How%20to/AWS%20CLI%20Integration%20with%20Azure%20AD"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-appex
- SCIM Identity
- SSO Configuration
- Single Sign On configuration
---

# Compliance note
This wiki contains test/lab data only.

# Summary

**Microsoft Entra authentication for AWS CLI** is a new tool that helps customers migrate away from AD FS by allowing Azure AD to facilitate the SAML sign-in of the AWS CLI.

A new `MSEntraAuthAWSCLI.exe` binary run from a command shell provides AWS CLI integration to facilitate Azure AD authentication.

## Authentication Flows

- **Interactive**: `MSEntraAuthAWSCLI.exe` opens a browser initiating the [authorization code flow](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow). User is prompted for credentials at the Azure sign-in page.
- **Non-interactive** (not publicly released as of April 2024): No browser access available. CLI triggers the [device code flow](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-device-code). User visits https://microsoft.com/devicelogin and enters a one-time passcode from another device.

After sign-in, user is presented with a choice of AWS roles to activate (navigate with arrow keys, space bar to select).

**Supported platforms**: MacOS, Linux, Windows (AMD64 or ARM architecture)

# Support Boundaries

| Scenario | Support Team | Support Area Path |
|---|---|---|
| Configuration of "AWS Single-Account Access" enterprise app | Application experience | Azure\AAD App Integration\Enterprise Applications\SSO configuration |
| Clicking "AWS Single-Account Access" from MyApp portal fails | Application experience | Azure\AAD App Integration\Issues Signing In to Applications\Gallery applications |
| AWS Roles not listed after MSEntraAuthAWSCLI.exe sign-in succeeds (despite Provisioning success in Audit log) | Application experience | Azure\AAD App Integration\Enterprise Applications\SSO configuration |
| Cloud Sync Provisioning of AWS Roles to users/groups | Provisioning | Azure\AAD User Provisioning\Cloud Sync\Troubleshoot cloud sync |
| Windows or Linux SSO using Chromium browser in Interactive flow fails | Azure AD Device Registration | Azure\AAD Directories, Domains, Objects\Devices\Access Issues on Joined or Registered devices |
| Azure key vault Creation and Secret access issues | MSaaS Information Protection | Azure\Key Vault\Key Vault Administration |
| Azure Storage account issues | MSaaS POD Azure IaaS Storage | Azure\Storage Account Management |
| Azure Function app issues | App Service Dev | Azure\Function App |

# Requirements

- AWS IAM IdP enabled subscription
- Azure AD Tenant
- [AWS Single-Account Access](https://portal.azure.com/#view/Microsoft_AAD_IAM/CloudPlatformChildrenGrid/platformApplicationId/8b1025e4-1dd2-430b-a150-2ef79cd700f5/platformName/Amazon%20Web%20Services%20(AWS)) gallery application created and configured per: [Tutorial: Azure AD SSO integration with AWS Single-Account Access](https://learn.microsoft.com/en-us/azure/active-directory/saas-apps/amazon-web-service-tutorial)
- Azure AD Connect Cloud Sync or SCIM provisioning configured to provision AWS roles to users/groups assigned to the enterprise app
- `MSEntraAuthAWSCLI.exe` binary (available for MacOS, Linux, Windows AMD64/ARM)
- Azure key vault (for Non-interactive flow to store AWS account credentials)

> **Note**: This feature is a new tool — not publicly released as of April 2024 for non-interactive mode.

# Troubleshooting Notes

- If AWS Roles are not listed after sign-in, verify provisioning in Azure AD → Enterprise apps → "AWS Single-Account Access" → Provisioning → Audit logs. Roles should be provisioned to the user's account before sign-in.
- If Interactive browser SSO fails on Windows/Linux Chromium, check device registration state — may need AAD Join or HAADJ for SSO to work.
- For device code flow: user must visit https://microsoft.com/devicelogin and enter the one-time passcode shown by the CLI within the allowed timeframe.

# External Documentation

- [Public documentation: Grant Active Directory federated users access to the API or AWS CLI](https://repost.aws/knowledge-center/adfs-grant-ad-access-api-cli)
- [Tutorial: Azure AD SSO integration with AWS Single-Account Access](https://learn.microsoft.com/en-us/azure/active-directory/saas-apps/amazon-web-service-tutorial)
- [Microsoft identity platform and OAuth 2.0 authorization code flow](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)
- [Device code flow](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-device-code)
