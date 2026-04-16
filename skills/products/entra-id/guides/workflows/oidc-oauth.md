# Entra ID OAuth2/OIDC Protocol — 排查工作流

**来源草稿**: ado-wiki-a-lab-oauth-flows-insomnia-fiddler.md, ado-wiki-b-single-logout-scenario-oidc.md, ado-wiki-c-insomnia-oauth-testing-setup.md, ado-wiki-c-jwt-ms-oauth-testing-guide.md, ado-wiki-c-lab-jwt-ms-saas-oauth2-testing.md, ado-wiki-c-lab-oauth2-client-resource-applications.md, ado-wiki-e-Custom-OIDC-External-Identity-Federation.md, ado-wiki-e-encrypt-decrypt-oauth2-tokens.md, onenote-workload-identity-federation-oidc.md
**场景数**: 5
**生成日期**: 2026-04-07

---

## Scenario 1: LAB — Learning OAuth Flows through Entra ID, Insomnia, and Fiddler
> 来源: ado-wiki-a-lab-oauth-flows-insomnia-fiddler.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step 1: Install OAuth Flow Collection into Insomnia**
   - 1. Download collection: `Azure AD v2.0 Protocols for Training.postman_collection.json` (from wiki attachments)
   - 2. Open Insomnia > Personal Workspace > **Import**
   - 3. The **Azure AD v2.0 Protocols** collection will now appear in Insomnia
2. **Step 2: Create an Insomnia Demo Application in Azure AD (App Registration)**
   - Reference: [Quickstart: Register an app in the Microsoft identity platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
   - 1. Go to `portal.azure.com` > **Azure Active Directory** > **App Registrations** > **New registration**
   - 2. Name the application (e.g., "Insomnia Demo")
3. **Step 3: Configure the Application Object**
   - 1. Open the registered app in App Registrations
   - 2. **Record**: Client ID and Tenant ID (needed for Insomnia variables)
   - 3. Click **Endpoints** > record the **OAuth 2.0 authorization endpoint (v2)** URL
4. **Step 4: Set Up Variables in Insomnia Client**
   - Reference: [Environment Variables | Insomnia Docs](https://docs.insomnia.rest/insomnia/environment-variables)
   - 1. Open Insomnia > click top section of your collection > click **Environment**
   - 2. Configure variables:

---

## Scenario 2: LAB - Using Insomnia to Test OAuth2.0 Authentication Flows
> 来源: ado-wiki-c-insomnia-oauth-testing-setup.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Download the Postman collection: **Azure AD v2.0 Protocols for Training.postman_collection.json** (from wiki attachment)
- 2. Open Insomnia → Personal Workspace → **Import**
- 3. Choose the downloaded file (drag & drop or file browser)
- 4. Click **Scan** → then **Import**
- 5. The "Azure AD v2.0 Protocols for Training" collection will appear as a tile
- 6. (Optional) Rename to "Entra ID V2.0 Protocols for training"
- 7. Auth flows are now available in the left sidebar
- 1. Open Insomnia → Click on the top section of your collection
- 2. Click **Environment** tab
- 3. Enter values or create new variables

---

## Scenario 3: LAB - Using JWT.ms for SaaS OAuth2.0 Testing
> 来源: ado-wiki-c-jwt-ms-oauth-testing-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Azure AD portal → **App registrations** → **New registration**
- 2. Name: (e.g., `JWT-Test-App`)
- 3. Supported account types: Single tenant
- 4. **Redirect URI**: Web → `https://jwt.ms`
- 5. Click **Register**

---

## Scenario 4: LAB - Using JWT.ms for SaaS OAuth2.0 Testing
> 来源: ado-wiki-c-lab-jwt-ms-saas-oauth2-testing.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step 1: Expose an API**
   - App registration → **Expose an API** → Add a scope (e.g. `AT.Read`)
2. **Step 2: Add the API to API Permissions**
   - API Permissions → Add permission → My APIs → find your JWT app → add the exposed scope → Grant Admin consent
3. **Step 3: Update the Authorization URL**
   - In API Permissions, click the permission → copy the scope URL
   - Replace the `scope` parameter in the URL with the copied scope URL
   - Set `response_type=token`

---

## Scenario 5: How to Encrypt and Decrypt Entra ID OAuth2 access tokens
> 来源: ado-wiki-e-encrypt-decrypt-oauth2-tokens.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step 1: Create the certificate that will be used to Encrypt the token**
   - Certificate must be created with the **KeySpec** option of **Signature** and certificate must be **exportable**.
   - $cert = New-SelfSignedCertificate -Subject "CN=TestJWE" -CertStoreLocation "Cert:\CurrentUser\My" -KeyExportPolicy Exportable -KeySpec Signature
2. **Step 2: Upload certificate to Entra ID**
   - *Using Microsoft Graph PowerShell**
   - $keyValue = [System.Convert]::ToBase64String($cert.GetRawCertData())
3. **Step 3: Find the certificate keyId in Entra...**
   - $CertificateThumbprint = $cert.Thumbprint
   - $CertificateThumbprint
4. **Step 4: Configure the Entra ID application to use the certificate to encrypt tokens.**
   - You can use Microsoft Graph API or Microsoft Graph PowerShell to configure the token encryption.
   - *Using Microsoft Graph API**

---
