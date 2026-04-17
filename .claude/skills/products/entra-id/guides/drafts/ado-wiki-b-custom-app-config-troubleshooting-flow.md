---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Entra ID App Management/Application_and_Service_Principal_Object_Management/Troubleshooting/Custom App Configuration troubleshooting flow"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Entra%20ID%20App%20Management/Application_and_Service_Principal_Object_Management/Troubleshooting/Custom%20App%20Configuration%20troubleshooting%20flow"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# SSO Configuration Workflow — Custom App Configuration

This page contains a visual troubleshooting flow diagram for Custom Enterprise App SSO configuration issues.

The workflow is represented as an image diagram (see source wiki for the visual flowchart):

**Source diagram:** Custom_App_Configuration.jpg (available at source URL above)

## Usage

When troubleshooting SSO configuration for a custom (non-gallery) Enterprise Application, use this workflow to identify which configuration area is causing the issue.

Key areas covered by the workflow:
- App registration vs Enterprise App configuration
- SSO method selection (SAML, OIDC, Password-based, Linked)
- Certificate and token signing configuration
- User assignment and attribute mapping
- Claims configuration

## Related Resources

- [Entra ID Application Management wiki](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=183936)
- For SAML SSO troubleshooting: see `onenote-fiddler-sso-provisioning-troubleshoot.md`
- For app registration issues: see `ado-wiki-b-entra-id-app-registrations.md`
- For scoping questions: see `ado-wiki-b-application-sp-scoping-guide.md`
