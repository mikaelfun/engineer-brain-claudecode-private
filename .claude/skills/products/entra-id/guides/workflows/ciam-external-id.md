# Entra ID CIAM/External ID — 排查工作流

**来源草稿**: ado-wiki-a-ciam-overview-tsg.md, ado-wiki-e-ciam-device-code-flow.md, ado-wiki-h-ciam-guest-user-federated-login-redirect.md, ado-wiki-h-fix-invalid-request-login-hint-ciam.md, ado-wiki-h-update-css-ext-link-selector-ciam.md
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: Compliance note
> 来源: ado-wiki-a-ciam-overview-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Go to entra.microsoft.com and you should be on the tenant blade
- 2. Click Manage tenants
- 3. Select your tenant and click Delete
- 4. Work through the checklist and delete your configuration in the tenant
- 5. When everything is deleted, **refresh using the button at the top of the page to enable the Delete button**
- 6. Click Delete and wait for the success message
- 7. Close the browser (signing out will just get errors)
- 1. Go to portal.azure.com
- 2. Locate CIAM resource group under subscription
- 3. Select Delete

---

## Scenario 2: Compliance note
> 来源: ado-wiki-h-ciam-guest-user-federated-login-redirect.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps to implement the workaround**
   - **Enable signup in the user flow:**
   - Follow the instructions provided in [Create a User Flow - Microsoft Entra External ID | Microsoft Learn](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-user-flow-sign-up-sign-in-
   - **Configure a REST API call for** `**OnAttributeCollectionStart**`**:**

---

## Scenario 3: ado-wiki-h-fix-invalid-request-login-hint-ciam
> 来源: ado-wiki-h-fix-invalid-request-login-hint-ciam.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Resolution**
   - To resolve this issue, users need to include the `domain_hint` parameter in their request URL alongside the `login_hint` parameter. The `domain_hint` parameter specifies the domain associated with the

---

## Scenario 4: ado-wiki-h-update-css-ext-link-selector-ciam
> 来源: ado-wiki-h-update-css-ext-link-selector-ciam.md | 适用: Mooncake ✅ / Global ✅

---
