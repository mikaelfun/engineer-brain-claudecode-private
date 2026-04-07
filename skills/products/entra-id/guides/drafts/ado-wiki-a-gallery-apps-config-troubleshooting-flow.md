---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Entra ID App Management/Application_and_Service_Principal_Object_Management/Troubleshooting/Gallery Applications Configuration troubleshooting flow"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FApplication_and_Service_Principal_Object_Management%2FTroubleshooting%2FGallery%20Applications%20Configuration%20troubleshooting%20flow"
importDate: "2026-04-06"
type: troubleshooting-guide
tags:
  - SSO
  - gallery-app
  - SAML
  - OAuth
  - enterprise-app
  - flowchart
---

# SSO Configuration Workflow — Gallery Apps Configuration Troubleshooting Flow

> **Note**: This page is primarily a visual flowchart (decision tree image). The content below preserves the original wiki structure; the full diagram is accessible via the sourceUrl above.

**Tags**: cw.Entra, cw.comm-appex, SCIM Identity, Single Sign On configuration, SSO Configuration, Enterprise Applications

## Overview

This troubleshooting flow covers the SSO configuration workflow for Gallery Applications in Microsoft Entra ID. It is structured as a visual decision tree to guide support engineers through common configuration issues with gallery app SSO setup.

**Flow coverage includes:**
- Gallery app SSO configuration validation steps
- SAML vs. OAuth/OIDC flow selection
- Identifier (Entity ID) configuration checks
- Reply URL / Redirect URI validation
- Certificate and signing configuration
- User assignment and access issues

## Related Resources

- [Identifier troubleshooting flow](./ado-wiki-a-identifier-troubleshooting-flow.md)
- [User assignment troubleshooting flow](../../../known-issues references in JSONL)
- Microsoft Docs: [Configure SAML-based SSO for enterprise applications](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/configure-saml-single-sign-on)
