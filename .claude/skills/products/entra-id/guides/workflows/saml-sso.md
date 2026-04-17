# Entra ID SAML SSO — 排查工作流

**来源草稿**: ado-wiki-a-get-all-saml-apps-powershell.md, ado-wiki-a-saml-request-troubleshooting-flow.md, ado-wiki-a-saml-request-validation.md, ado-wiki-a-saml-screwdriver-sp-initiated-lab.md, ado-wiki-c-debug-saml-protocol.md, ado-wiki-c-lab-saml-tool-idp-sp-initiated-flows.md, ado-wiki-c-saml-tool-idp-sp-flow-testing.md, ado-wiki-c-using-claims-x-ray-saas-saml-testing.md, ado-wiki-d-generate-saml-request.md, ado-wiki-e-develop-saml2-app.md... (+4 more)
**场景数**: 10
**生成日期**: 2026-04-07

---

## Scenario 1: Get All SAML Apps from Tenant with PowerShell
> 来源: ado-wiki-a-get-all-saml-apps-powershell.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. SPs with `PreferredSingleSignOnMode` set to a value → SAML SSO enabled → **appear in results**
- 2. SPs with `PreferredSingleSignOnMode` = **null** → may or may not be SAML → **do NOT appear**:

---

## Scenario 2: How to validate a SAML request
> 来源: ado-wiki-a-saml-request-troubleshooting-flow.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. In the trace, look for host as `login.microsoftonline.com` and URL as `/TenantId/SAML2`.
- 2. Once you identified the correct frame, get the "SAMLRequest" value from webforms tab.
- 3. Use the built in the Fiddler TextWizard to decode the request. Right-click the SAML Request value and select "Send to TextWizard".
- 4. In the TextWizard use the middle drop down list to **Transform From DeflatedSaml**.

---

## Scenario 3: SAML Request Validation Guide
> 来源: ado-wiki-a-saml-request-validation.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step 1: Capture the SAML Request**
   - Two options:
   - *Option A — From browser URL (live remote session):**
   - 1. Open a **private/InPrivate** browser session
2. **Step 2: Decode the SAML Request**
   - *If you have a Fiddler trace:**
   - 1. Right-click the `SAMLRequest` value → **Send to TextWizard**
   - 2. In TextWizard: use the middle drop-down → **Transform From DeflatedSaml**
3. **Step 3: Validate IssueInstant Date Format**
   - The `IssueInstant` attribute in the decoded SAML request must be in ISO 8601 UTC format:
   - yyyy-MM-ddTHH:MM:ss.fffZ
4. **Step 4: Validate SAML Request Attributes**
   - Required attributes for a valid SAML AuthnRequest:
   - Refer to [Azure AD SAML Protocol documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/single-sign-on-saml-protocol) for the full list of required and optional attributes.
   - Key attributes to check:

---

## Scenario 4: [DEPRECATED] SP-Initiated SAML Lab — Using SAML Screwdriver
> 来源: ado-wiki-a-saml-screwdriver-sp-initiated-lab.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting Scenarios**

---

## Scenario 5: LAB - Set Up Test SAML Application for IdP and SP Initiated Flows
> 来源: ado-wiki-c-lab-saml-tool-idp-sp-initiated-flows.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. In Azure AD portal → Enterprise Apps → New → **Non-Gallery Application** (name it e.g. "SAMLTool")
- 2. Go to **Single sign-on** → select **SAML**
- 3. Edit **Basic SAML Configuration**:
- 4. Save the configuration
- 5. (Optional) Customize claims in Step 2 of the SAML configuration blade
- 6. Assign a test user/group to the application (Properties → "Assignment required?" → Yes → Users and groups)
- 1. Navigate to the **Single sign-on** blade of the application
- 2. Click **Test this application** (or **Test** button in the wizard)
- 3. Click **Test sign in**
- 4. Observe the **SAML Request Result** in SAML Tool

---

## Scenario 6: LAB - Test SAML Application for IdP and SP Initiated Flows
> 来源: ado-wiki-c-saml-tool-idp-sp-flow-testing.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. In Azure AD portal → **Enterprise Apps** → **New application** → Create Non-Gallery Application
- 2. Navigate to **Single sign-on** → select **SAML**
- 3. Edit **Basic SAML Configuration**:
- 4. Save configuration
- 5. (Optional) Edit claims in Step 2 if testing custom claim transformations. See [SAML claims customization docs](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-saml-
- 6. Assign test user/group: **Users and Groups** → Add user/group
- 1. In the app's **Single sign-on** blade → click **Test** button
- 2. Select **Test sign in** (for currently logged-in user) or browser extension option for different user
- 3. Observe the "SAML Request Result" in SAML Tool
- 1. Copy the **Identifier (Entity ID)** from Basic SAML Configuration: `SamlTool`

---

## Scenario 7: Using Claims X-Ray for SaaS SAML Testing (DEPRECATED)
> 来源: ado-wiki-c-using-claims-x-ray-saas-saml-testing.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Azure AD portal → Enterprise Apps → New → **Non-Gallery Application**
- 2. Navigate to **Single sign-on** → select **SAML**
- 3. Edit **Basic SAML Configuration**:
- 4. Save the configuration
- 5. (Optional) Customize claims in Step 2 of the SAML configuration
- 6. Assign a test user to the application
- 7. Test SSO using the **Test** button on the Single sign-on blade
- 1. Use the **SAML Tool** ([guide](ado-wiki-c-lab-saml-tool-idp-sp-initiated-flows.md)) to reproduce the SAML flow
- 2. Use the **Test SAML SSO wizard** in Azure Portal for validating claims
- 3. Use **Azure Support Center (ASC) → Advanced Troubleshooting** to analyze sign-in logs and SAML request/response details

---

## Scenario 8: Overview
> 来源: ado-wiki-e-develop-saml2-app.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Create a Non-Gallary application (Not a application registration)\
- 2. Enable SAML SSO\
- 3. Download the Azure AD Certificate.
- 1. Create new VS asp.net template
- 2. Add the following nuget packages...
- 3. Get your project Url. You will need to use this throughout as your setting up your settings in your web.config and Azure AD.
- 4. Configure Web.Config, it should look something like this...
- 5. Configure the SAML SSO settings in Azure AD.
- 1. To test it out. Navigate to your web apps Saml2 signin address. i.e. <https://localhost:64226/saml2/signin>
- 2. You should be redirected to Azure AD to sign in. Resolve any Azure Ad errors.

### 相关错误码: AADSTS700016

---

## Scenario 9: Troubleshooting SAML-based SSO Sign-in Issues
> 来源: mslearn-saml-sso-sign-in-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Diagnostic Steps**
   - 1. **Install My Apps Secure Browser Extension** — enables better diagnosis and automated resolution in Azure portal testing experience
   - 2. **Reproduce error using Azure portal testing experience**:
   - Azure portal → Enterprise Applications → select app → Single Sign-On → SAML-based SSO → Test

---

## Scenario 10: Set Up SAML SSO with Non-Gallery App in Mooncake via Graph API
> 来源: onenote-saml-sso-graph-api.md | 适用: Mooncake ✅

### 排查步骤
1. **Steps**

---
