---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Entra ID App Management/Application_and_Service_Principal_Object_Management/Troubleshooting/Identifier troubleshooting flow"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FApplication_and_Service_Principal_Object_Management%2FTroubleshooting%2FIdentifier%20troubleshooting%20flow"
importDate: "2026-04-06"
type: troubleshooting-guide
tags:
  - SSO
  - SAML
  - Identifier
  - EntityID
  - enterprise-app
  - flowchart
---

# SSO Troubleshoot Integration Workflow — Identifier Troubleshooting Flow

> **Note**: This page is primarily a visual flowchart (decision tree image). The content below preserves the original wiki structure; the full diagram is accessible via the sourceUrl above.

**Tags**: cw.Entra, cw.comm-appex, SCIM Identity, Single Sign On configuration, SSO Configuration, Enterprise Applications

## Overview

This troubleshooting flow is a decision tree specifically focused on **Identifier (Entity ID / Audience)** configuration issues in SAML SSO for Enterprise Applications in Microsoft Entra ID.

## Common Identifier Issues Covered

- **Identifier mismatch**: The Identifier configured in Entra ID does not match what the Service Provider (SP) sends in the SAML AuthnRequest `Issuer` field.
- **Duplicate Identifiers**: Attempting to use the same Identifier across multiple applications (see SAML Multi-Instancing guide).
- **Identifier format errors**: Wild-card patterns, trailing slashes, or case sensitivity mismatches.
- **Application registered in wrong tenant**: Identifier not found because app is registered in a different directory.

## Decision Flow Summary

1. Check if the SAML AuthnRequest `Issuer` matches the Identifier configured in Entra ID Enterprise App > Single sign-on > Basic SAML Configuration.
2. If mismatch → Update the Identifier in Entra ID to match the SP-sent value.
3. If Identifier is correct → Check Reply URL (ACS URL) configuration.
4. If Identifier conflicts with another app → See SAML Multi-Instancing workaround.

## Related Resources

- [SAML Multi-Instancing guide](./ado-wiki-a-saml-multi-instancing-lab.md)
- [Gallery Apps Configuration troubleshooting flow](./ado-wiki-a-gallery-apps-config-troubleshooting-flow.md)
- Microsoft Docs: [AADSTS error codes](https://learn.microsoft.com/en-us/entra/identity-platform/reference-error-codes)
