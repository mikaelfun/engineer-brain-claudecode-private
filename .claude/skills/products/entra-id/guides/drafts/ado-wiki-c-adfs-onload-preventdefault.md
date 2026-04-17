---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/ADFS and WAP/ADFS Webpage Customizations/ADFS OnLoad.js  Advanced Webpage Restrictions using PreventDefault"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Authentication/ADFS%20and%20WAP/ADFS%20Webpage%20Customizations/ADFS%20OnLoad.js%20%20Advanced%20Webpage%20Restrictions%20using%20PreventDefault"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ADFS OnLoad.js - Advanced Webpage Restrictions using PreventDefault

Using **preventDefault** in JavaScript allows restricting actions on ADFS web pages. Always save onload.js in UTF-8 encoding.

Reference: [Event.preventDefault()](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault)

## Code Samples

### Prevent Copy/Paste of Password Field

```javascript
var Forms = document.getElementById('formsAuthenticationArea');
if (Forms) {
    var PwdField = document.getElementById('passwordInput');
    if (PwdField) {
        PwdField.onpaste = e => { e.preventDefault(); return false; };
    }
}
```

### Prevent Context Menu (Right-Click) on All ADFS Pages

```javascript
document.addEventListener("contextmenu",
    function (e) { e.preventDefault(); }, false);
```

### Prevent Context Menu on IDPInitiatedSignon Page Only

```javascript
if (window.location.pathname == '/adfs/ls/idpinitiatedsignon') {
    document.addEventListener("contextmenu",
        function (e) { e.preventDefault(); }, false);
}
```

### Change OTP Text Field to Password Field (Hide Input)

```javascript
var otpc = document.getElementById('verificationCodeInput');
if (otpc) {
    otpc.type = "password";
}
```
