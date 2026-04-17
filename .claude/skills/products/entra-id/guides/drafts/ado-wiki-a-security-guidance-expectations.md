---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Identity Protection/Entra ID Protection Security Guidance Expectations and Other Considerations"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Identity%20Protection%2FEntra%20ID%20Protection%20Security%20Guidance%20Expectations%20and%20Other%20Considerations"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Entra ID Protection Security Guidance Expectations and Other Considerations

## Overview

CSS is encouraged to advise customers seeking to harden their Entra ID environments according to security best practices in a best-effort capacity. However, support work typically entails addressing scope-specific issues through troubleshooting (break-fix scenarios).

## Scope Boundaries

- Customers seeking long-term security conversations involving new controls or technologies should discuss with their CSAM and/or customer engineer(s).
- Customers without CSAM/CE should refer to public documentation and open new support cases for specific issues.
- Authentication team can share best practices and recommendations but actions should remain within the scope of the support case.

## CIRT Engagement

In confirmed compromise scenarios, customers may be eligible for CIRT team support. Engage CIRT with collaboration using SAP: **Azure / Security Incident Response / Malicious Azure Activity Detected / Confirmed Azure AD Account compromised**. Details: aka.ms/cirt

## Customer Expectation Management

Official procedure: [Procedure: Customer Expectation Management (DDX Capability)](https://internal.evergreen.microsoft.com/en-us/topic/8d6df44b-ec85-ec92-6a97-d1cc8839be11)

## Data Retention Periods

- We cannot retrieve logs beyond retention policy periods
- Customers can retain logs longer by exporting via Diagnostics Settings
- Engineers can still provide guidance based on best practices when logs unavailable

## Trusted Named Locations and Risk Score

- Including IP addresses as trusted in Named Locations improves risk calculation accuracy
- Customers should only include addresses they own or control
- Do NOT advise customers to include Microsoft-owned IP addresses unless statically assigned to resources they control (e.g., Azure Virtual Desktop)

## Customer Communication Templates

### Template: Customer has CSAM/CE assigned

Share scope boundaries, recommend engaging CSAM/CE for long-term security discussions, provide documentation links:
- Fundamentals of securing with Microsoft Entra ID
- Microsoft Entra recommendations
- Secure your Microsoft Entra identity infrastructure
- Security best practices and patterns
- Azure identity & access security best practices
- Best practices for Microsoft Entra roles

### Template: Customer does not have CSAM/CE

Similar guidance but recommend referring to public documentation and opening new cases for specific issues.
