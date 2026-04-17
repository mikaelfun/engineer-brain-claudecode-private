# Troubleshooting SAML-based SSO Sign-in Issues

**Source**: [Problems signing in to SAML-based single sign-on configured apps](https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/app-integration/troubleshoot-sign-in-saml-based-apps)

## Overview

General troubleshooting guide for SAML-based SSO sign-in failures in Microsoft Entra ID.

## Diagnostic Steps

1. **Install My Apps Secure Browser Extension** — enables better diagnosis and automated resolution in Azure portal testing experience
2. **Reproduce error using Azure portal testing experience**:
   - Azure portal → Enterprise Applications → select app → Single Sign-On → SAML-based SSO → Test
   - The extension captures SAML request/response automatically

## Common Issues

### Customizing SAML Claims
- Refer to Claims mapping in Microsoft Entra ID documentation

### Misconfigured App Parameters
- Compare portal configuration with app-side configuration:
  - Client/Application ID
  - Reply URLs
  - Client Secrets/Keys
  - App ID URI
- Ensure requested resources match Required Resources tab permissions

## Key Reference
- Debug SAML-based single sign-on applications (Microsoft Learn)
