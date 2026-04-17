# Entra ID Mobile Platform Auth (iOS/macOS/Android) — 排查工作流

**来源草稿**: ado-wiki-a-asp-auth-middleware-scenarios.md, ado-wiki-a-macos-oneauth-log-collection.md, ado-wiki-a-macos-workplacejoin-troubleshooting.md, ado-wiki-a-security-copilot-supported-scenarios.md, ado-wiki-b-common-lockout-scenarios.md, ado-wiki-c-Shared-Device-Mode-Android-iOS.md, ado-wiki-c-gdap-scenarios-troubleshooting.md, ado-wiki-c-gdap-troubleshooting-common-scenarios.md, ado-wiki-d-browser-traces-android.md, ado-wiki-d-ca-bootstrap-scenarios.md... (+11 more)
**场景数**: 15
**生成日期**: 2026-04-07

---

## Scenario 1: MacOS OneAuth Log Collection Guide
> 来源: ado-wiki-a-macos-oneauth-log-collection.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 2: TSG Guide for MacOS WorkPlaceJoin
> 来源: ado-wiki-a-macos-workplacejoin-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **Device registration intent**:
- 2. **Customer environment**:
- 1. Verify WPJ certificate is present in login keychain
- 2. Verify certificate is not expired
- 3. Check if Intune enrollment is complete (MDM profile installed)
- 4. Confirm PkeyAuth is working — test with browser to AAD-protected resource

---

## Scenario 3: Determining a Tenant Lockout
> 来源: ado-wiki-b-common-lockout-scenarios.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. What is excluded in the policy?  Users/Groups/Device types/etc?
- 2. Are there location conditions that are excluded?
- 3. Of the excluded users/groups, are any of them within an Administrator role?
- 4. Could the policy be passed with an MFA re-registration?

---

## Scenario 4: Shared Device Mode for Android and iOS Devices
> 来源: ado-wiki-c-Shared-Device-Mode-Android-iOS.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting**
   - 1. Collect Authenticator app logs: user submits via **Submit Feedback / Incident ID** in Authenticator. Engineer accesses logs in **ASC > Sign-Ins > Authenticator App Logs** using the Incident ID (or 
   - 2. Reproduce with video/screenshot to identify which step fails.
   - 3. Key log checks from CloudExtension/Intune logs:

---

## Scenario 5: <p style="color:blue">Troubleshooting scenarios
> 来源: ado-wiki-c-gdap-scenarios-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. There must be a DAP or GDAP relationship between the customer and the CSP
- 1. There must be role assignments in the customer tenant for which the “member” is a security group in the partner tenant
- 1. The CSP technician must be assigned to one or more groups that have such role assignment
- 1. The CSP technician must not be blocked by a conditional access policy in the customer tenant.   **Update 3 November 2022**: An update to Azure AD Conditional Access Policies should correct this pro
- 1. The application must know how to accept a DAP/GDAP token [Where to find data for GDAP access issues ]()
- 2. Requirements for a CSP technician to complete a task in an application:
- 1. One or more roles to which the CSP technician is assigned must have permission to complete the task
- 1. The application must correctly authorize the request using wids claim in the CSP technician’s token.
- 1. A user who only has DAP role assignments (but no GDAP role assignments) must not be a B2B guest in the customer tenant
- 1. Confirm that a DAP or GDAP relationship exists between the tenants ?

---

## Scenario 6: Compliance note
> 来源: ado-wiki-c-gdap-troubleshooting-common-scenarios.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Error Type most likely user will see.
- 2. Scoping Questions
- 3. Identify Tenant-Type (Partner or Customer) associated with the case.
- 3. Troubleshooting - This is split into 2 sections based on the Tenant type associated with the case.
- 1. _Sample Snapshot of Error User will see:_
- 2. _Sample Error Text you will recieve in ticket_: <p style="color:red"> _The request failed with the following exception: AADSTS50020: User account '{EmailHidden}' from identity provider 'https://sts
- 1. Go to [ASC](https://azuresupportcenter.msftcloudes.com/)
- 2. Load the case, once the associated tenant is loaded
- 3. Click on Domains tab and navigate to "_Domain Details_".
- 4. If the user upn domain matches the one of the listed Domains result set. Then the case is from the Partner tenant else its from Customer tenant.

### 相关错误码: AADSTS50020

---

## Scenario 7: ado-wiki-d-ca-bootstrap-scenarios
> 来源: ado-wiki-d-ca-bootstrap-scenarios.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 8: Entra ID Device Registration and Broker Scenarios on iOS and macOS
> 来源: ado-wiki-d-entra-id-broker-scenarios-ios-macos.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. 打开 Microsoft Authenticator
- 2. 菜单 → **Send feedback** → **Having trouble** → **View diagnostic** → **Send**
- 3. 提供 Incident ID 给工程师
- 4. 工程师在 ASC → Sign-Ins → Authenticator App Logs 中输入 Incident ID 检索
- 1. 启动 Company Portal（无需登录）
- 2. Company Portal → Settings → Advanced logging → **Turn on advanced logging**
- 3. Help → **Save diagnostic report**
- 4. 完成后关闭 Advanced logging
- 5. 解压 `Company Portal.zip` → 打开 `SSOExtension.log`
- 1. 确认 SSO Extension 已启用，且 Microsoft Single Sign On 扩展已安装

### 相关错误码: AADSTS50210

---

## Scenario 9: ado-wiki-e-ca-macos
> 来源: ado-wiki-e-ca-macos.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1.  The user attempts to authenticate to a service where the "**macOS**" conditional access Platform condition is selected.
- 2.  ESTS checks to see if a conditional access policy is linked to the service.
- 3.  If a conditional access policy is enabled, the device is denied and challenged for device authentication. If the device is not already authenticated an Access Remediation page is generated directi
- 4.  The user clicks the link to download the Company Portal application from the Mac Company Portal
- 5.  The Mac is first registered with Azure AD Device Registration Service (DRS) where it gets a DeviceID and its DeviceTrustType is set to "Workplace Join".
- 6.  Azure AD DRS issues a device certificate which gets returned to the Mac device
- 7.  The device certificate then gets stored in the user's Apple "Login" KeyChain.
- 8.  Once the device certificate has been stored in the user's Apple Login KeyChain a parallel enrollment with Intune is triggered
- 9.  An internal Intune ID is generated which gets linked to the device object in Azure AD and starts stamping the device as Managed and Compliant.
- 1.  Open the?**Keychain Access app**, which is in the the **Utilities** folder of your **Applications** folder.

---

## Scenario 10: VDI Scenarios for Microsoft Entra Hybrid Join
> 来源: ado-wiki-f-vdi-haadj-scenarios.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **Golden image already HAADJ**: Compare dsregcmd /status Device ID between golden and VDI
- 2. **Dual device state on NP-VDI**: Deploy BlockAADWorkplaceJoin, ensure join completes before user login
- 3. **PRT/SSO issues**: Follow Azure AD PRT troubleshooting guide

---

## Scenario 11: ado-wiki-f-wpa-parser-adperf-scenarios
> 来源: ado-wiki-f-wpa-parser-adperf-scenarios.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 12: How to Manually Configure Shared Device Mode for iOS
> 来源: ado-wiki-ios-shared-device-mode-manual-setup.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps**

---

## Scenario 13: TSG Guide for MacOS WorkPlaceJoin
> 来源: ado-wiki-macos-wpj-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting WPJ Problems on MacOS**
   - **Ignore -25300 (errSecItemNotFound)**: Keychain items missing because device never registered; APIs check for WPJ cert presence
   - **Device Quota Reached**: Contact ADRS team; remove devices or increase tenant limit
   - **Keychain error -25244 (errSecInvalidOwnerEdit)**: Fixed in WPJ library >= 3.3.3 by adding com.microsoft general access to ACL
2. **Troubleshooting Steps**
   - 1. Collect client app logs (Outlook, OneDrive, Intune)
   - 2. Filter by MSAL, ADAL, or WorkPlaceJoin keywords
   - 3. Identify keychain errors (-25300, -25244, etc.)

---

## Scenario 14: Dual-Federation Support Scenarios
> 来源: onenote-dual-fed-support-scenarios.md | 适用: Mooncake ✅

---

## Scenario 15: Capture Fiddler Trace on iOS
> 来源: onenote-ios-fiddler-trace-capture.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps**

---
