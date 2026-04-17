---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Entra ID App Management/Application_and_Service_Principal_Object_Management/How to/ADFS to AAD Application Migration Wizard"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Entra%20ID%20App%20Management/Application_and_Service_Principal_Object_Management/How%20to/ADFS%20to%20AAD%20Application%20Migration%20Wizard"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-appex
- cw.comm-adfs
- cw.AAD-ADFS
- SCIM Identity
- ADFS to Entra ID migration
- SSO Configuration
---

# Compliance note
This wiki contains test and/or lab data only.

# Summary

Many customers want to migrate their on-premises AD FS relying party applications to the cloud. The [ADFS Application Activity Report](https://entra.microsoft.com/#view/Microsoft_AAD_IAM/UsageAndInsightsMenuBlade/~/AD%20FS%20application%20activity) blade under Usage & insights is limited to reporting only.

A new **ADFS Application Migration** blade under *Usage & insights* provides tooling support for AD FS to Azure AD Application Migration. Organizations with Azure AD Premium 1 or higher that have **Azure AD Connect Health** installed on-premises will find this interface gives administrators a **guided migration experience** of relying party applications from AD FS to Azure AD.

The new migration dashboard provides three tabs:
- **All Apps**: Application activity report for all SAML apps with sign-in activity
- **Ready to migrate**: Apps ready to migrate with usage statistics (unique user count, successful/failed sign-ins). All RP application configurations imported from on-premises.
- **Ready to configure**: Previously migrated applications, editable under Enterprise applications

> **Note**: Allow 24 hours after corrective actions in the on-premises environment before re-evaluating in the Migration Insights job.

# Scope — What the Migration UX Supports

- New ADFS **Application Migration** blade under *Usage & insights*
- **Ready to migrate** tab lists apps with RP application usage statistics
- All Relying Party application configurations imported from on-premises
- Assisted migration wizard supports:
  - Custom Azure AD application name option
  - **SAML configurations only** — OIDC (OpenID Connect) and WS-Fed are NOT supported
  - *Identifier (Entity ID)* and *Reply URL* used for Single Sign-On settings
  - Permit all / allow specific groups / deny specific groups access policy configuration
  - Claims mapping configuration
  - User assignment

# 16 Migration Rules

When migration issues are detected, the **Next Steps** column provides an *Additional steps required* link. Clicking reveals **16 rules** run against the Relying Party Trust to identify configuration issues. Each rule provides guidance on changes needed before migration.

# Key Requirements

- Azure AD Premium 1 (P1) or higher
- Azure AD Connect Health installed on-premises
- The existing [AD FS Application activity](https://entra.microsoft.com/#view/Microsoft_AAD_IAM/UsageAndInsightsMenuBlade/~/AD%20FS%20application%20activity) report will be retired in future

# Support Boundaries

This feature is supported by the **MSaaS AAD - Applications Premier** team.

- ICM queue: https://msaas.support.microsoft.com/queue/5b6689e1-465c-e711-812a-002dd8151751

# External References

- [AD FS Application Activity Report](https://entra.microsoft.com/#view/Microsoft_AAD_IAM/UsageAndInsightsMenuBlade/~/AD%20FS%20application%20activity)
- [ADFS Migration Wizard deep dive training materials](https://aka.ms/AAh97m0) (Cloud Academy / QA)
