# ADFS + ServiceNow SAML SSO Integration

> Source: OneNote POD Notebook — ADFS Case Study
> Status: draft

## Overview

Step-by-step guide to integrate ADFS with ServiceNow for SAML-based SSO. Similar to AAD SSO with ServiceNow but with ADFS-specific steps.

## ADFS Side Configuration

1. **Export token signing certificate** from ADFS (Base-64 encoded X.509 .CER format)
2. **Create Relying Party Trust** using ServiceNow metadata XML
3. **Add claim rules**:
   - Rule 1: Query Email from AD (pass-through)
   - Rule 2: Issue Name ID with Email format
4. **Change encryption to SHA-1** in RP Trust properties

## ServiceNow Side Configuration

1. Register ServiceNow developer instance at https://signon.service-now.com/ssoregister.do
2. Activate plugin: **Integration – Multiple Provider Single Sign-On Installer**
3. Upload ADFS token-signing certificate under **X509 certificate** (name it "SAML 2.0")
4. Configure Identity Provider profile:
   - **Identity Provider URL** (Issuer): `http://<FederationServiceName>/adfs/services/trust`
   - **AuthnRequest URL** (SSO URL): `https://<FederationServiceName>/adfs/ls/`
   - **Entity ID / Audience URI**: ServiceNow instance name
   - **NameID policy**: Email type (default)
5. Create user account in ServiceNow (or enable auto-provisioning)
6. Verify certificate in profile matches ADFS token-signing cert
7. Click **Generate metadata** → save XML to ADFS server for RP creation

## Key Parameters Explained

| Parameter | Also Known As | ADFS Format |
|-----------|--------------|-------------|
| Identity Provider URL | Issuer / IDP Partner URL | `http://<ADFS>/adfs/services/trust` |
| AuthnRequest URL | Single Sign-On URL | `https://<ADFS>/adfs/ls/` |
| Entity ID | Audience URI | ServiceNow instance URL |

## References

- [Configuring ADFS 3.0 with SAML 2.0](https://old.wiki/index.php/Configuring_ADFS_3.0_to_Communicate_with_SAML_2.0)
