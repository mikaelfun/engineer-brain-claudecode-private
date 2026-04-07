# Alibaba Cloud User SSO Integration with 21v Entra ID

## Overview
Configure SAML-based User SSO between Alibaba Cloud (China) and 21v Entra ID (Mooncake). Mooncake does not have a built-in app gallery template for Alicloud, so manual configuration is required.

## Prerequisites
- Alibaba Cloud account with RAM admin privileges
- 21v Entra ID tenant with enterprise application admin
- Test user account in Entra ID

## Steps

### 1. Configure Alibaba Cloud SSO
1. Log in to Alibaba Cloud RAM console
2. Enable **User SSO** under SSO Management
3. Upload the AAD enterprise application metadata XML file
4. Set the auxiliary domain name to match your Entra ID UPN suffix (e.g., `mcpod.partner.onmschina.cn`)

### 2. Configure Entra ID Enterprise Application
1. Create a new Enterprise Application for Alicloud SSO
2. In the SSO configuration page:
   - Set Identifier (Entity ID) to match Alicloud SAML metadata
   - Set Reply URL to Alicloud ACS URL
   - Set Relay State to the Alibaba Cloud console URL
   - Upload or configure the SAML signing certificate

### 3. Configure RAM Account Mapping
1. Create RAM users corresponding to Entra ID users
2. Ensure UPN or email mapping is correct between the two systems

### 4. Test
1. Access your Alibaba Cloud RAM user login URL:
   `https://signin.aliyun.com/{RAM_ID}.onaliyun.com/login.htm`
2. Should redirect to Entra ID for authentication
3. After successful Entra ID login, should land on Alicloud console

## Notes
- Since Mooncake lacks the Alicloud app gallery template, claim configurations must be done manually via Claim Mapping Policy
- See also: `onenote-claim-mapping-policy-saml-sso.md` for claim configuration details

## Source
- OneNote: `Azure AD _ Ms Entra ID/Authentication/Application mgmt and config/SAML App SSO/Ali user SSO integration.md`
- Alicloud docs: https://www.alibabacloud.com/help/en/ram/user-guide/implement-user-based-sso-by-using-azure-ad
