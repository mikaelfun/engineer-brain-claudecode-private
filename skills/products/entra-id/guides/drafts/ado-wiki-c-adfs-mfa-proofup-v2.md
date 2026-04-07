---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/ADFS and WAP/ADFS Webpage Customizations/ADFS onload customization MFA Proofup_v2"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Authentication/ADFS%20and%20WAP/ADFS%20Webpage%20Customizations/ADFS%20onload%20customization%20MFA%20Proofup_v2"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ADFS onload customization MFA Proofup v2

Enhanced version of the [public MFA proofup script](https://docs.microsoft.com/en-us/windows-server/identity/ad-fs/operations/configure-ad-fs-and-azure-mfa#customize-the-ad-fs-web-page-to-guide-users-to-register-mfa-verification-methods).

## Improvements over v1

- **Multi-language support**: Error messages and proofup messages in 20+ languages (English, German, French, Spanish, Portuguese, Russian, Chinese, Japanese, Korean, etc.)
- **Multi-tenant support**: Auto-extracts domain_hint from username on error page, enabling proofup redirection to correct tenant
- **Fallback**: Static domain_hint configuration when auto-detection fails

## Key Components

### LocErr table
Maps browser language codes to the localized "authentication method not available" error string that ADFS displays when MFA proofup is needed.

### locProofupMessage table
Contains localized redirect messages shown to users before auto-redirect to proofup page. Supports: en, de, ro, fr, es_es, es_mx, pt, ru, zh_tw, zh_cn.

### Language detection logic

```javascript
// Find document language, shorten identifier, populate fallback
var pl = document.documentElement.lang.substring(0,2);
var fbpl = (document.documentElement.lang.replace('-','_')).toLowerCase();

// Populate error message based on document language
var mfaSecondFactorErr = LocErr[pl] || LocErr[fbpl];

// Populate proofup message with English fallback
var mfaProofupMessage = locProofupMessage[pl] || locProofupMessage[fbpl];
if (!mfaProofupMessage) { mfaProofupMessage = locProofupMessage['en']; }
```

### Domain hint auto-detection

```javascript
// Auto-populate domain_hint from username in error message
var domain_hint = errorMessage.innerHTML.toString()
    .match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi)
    .toString().split('@')[1];

// Fallback to static tenant if auto-detection fails
if (!domain_hint) { var domain_hint = "contoso.com"; }
```

## Notes

- Save onload.js with **UTF-8 encoding**
- ADFS supports zh-CN (Mainland China) and zh-TW (Taiwan); bare "zh" uses browser secondary preference
- Same applies to Spanish: es_mx (Latin America) vs es_es (Spain)
- Script provided AS-IS; localization tables will be expanded over time
