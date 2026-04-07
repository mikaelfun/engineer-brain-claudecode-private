---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Authentication General/Content Security Policy (CSP) for Microsoft Entra"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Authentication%20General%2FContent%20Security%20Policy%20(CSP)%20for%20Microsoft%20Entra"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Content Security Policy (CSP) for Microsoft Entra

## Overview

As part of the Secure Future Initiative, Microsoft is introducing Content Security Policy (CSP) Headers to Entra sign-in pages. CSP protects against Cross-Site Scripting (XSS) and Clickjacking by defining trusted sources for scripts, images, frame ancestors, etc.

## CSP Headers Being Added

### object-src: 'none' (Low Risk)
Blocks `<object>` and `<embed>` tags, preventing browser plugins like Java, Flash, ActiveX. Already unsupported in most modern browsers.

### base-uri: 'self' (Low Risk)
Restricts `<base>` HTML tag to allow only URLs referencing same origin. Violations: tens or hundreds per tenant per day.

### script-src: 'self' 'nonce-{nonce}' 'unsafe-inline' 'unsafe-eval' {cdn's} (High Impact)
Most important policy. Restricts:
- `<script src={value}>` tags where value is not in allowed CDN list
- Inline scripts without nonce attribute
- Inline JS event handlers (e.g., `<a onClick="handler()">`)
- javascript: protocol links (e.g., `<a href="javascript:runScript();">`)

## Impacted Entra Domains

- login.microsoftonline.com
- login.microsoft.com
- {tenant}.ciamlogin.com

**Exempt:** Custom domains (proxy to {tenant}.ciamlogin.com), b2clogin.com endpoints.

**Sovereign clouds:** Enforcement starts after public cloud.

## Who Is Impacted

1. Entra work or school customers/users
2. Entra External ID customers/users (except custom domain users)

**What breaks:**
- Browser extensions/plugins that inject code into Entra sign-in pages
- Custom automations using script injection
- Any tools injecting code into Entra sign-in experience (unsupported)

## Requesting an Exception

- Customers can request exception with valid business justification
- All exception requests validated and performed by engineering
- After flag turned off, work with customer to understand impacted scenarios and timeline
- Customer may need Azure DevOps ticket for extension compliance updates

## Escalation Path

- **ICM Owning Service:** ESTS
- **ICM Owning Team:** Incident Triage

## Deep Dive Training

- Title: Deep Dive: 248921 - Content Security Policy (CSP) for Microsoft Entra
- Format: Self-paced eLearning (30 min)
- Link: https://aka.ms/aava3fy
