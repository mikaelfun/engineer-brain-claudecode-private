# Entra ID MSAL Auth Libraries — 排查工作流

**来源草稿**: ado-wiki-d-add-custom-httpclient-msal4j.md, ado-wiki-d-msal-net-confidential-client-auth-code-powershell.md, ado-wiki-d-msal-net-native-client-powershell-setup.md, ado-wiki-d-msal-ps-native-client-auth-context.md, ado-wiki-f-configure-msal-android-dev-environment.md, ado-wiki-msal-python-wsl-broker.md, mslearn-enable-logging-msal-graph-sdk.md, mslearn-enable-msal4j-logging-spring-boot.md, mslearn-package-inspector-msal-android.md
**场景数**: 8
**生成日期**: 2026-04-07

---

## Scenario 1: ado-wiki-d-msal-net-confidential-client-auth-code-powershell
> 来源: ado-wiki-d-msal-net-confidential-client-auth-code-powershell.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1) Install Required Tools & Packages
- 2) App Registration (Confidential/Web)
- 1.  Go to **Microsoft Entra admin center**  **App registrations**  **New registration**.
- 2.  **Name:** `MsalConfidentialClient`
- 3.  **Supported account types:** _Accounts in this organizational directory only (Single tenant)_
- 4.  Click **Register**.
- 1.  **Authentication  Add a platform  Web**.
- 2.  **Redirect URI:** `http://localhost:5000/`
- 3.  **Front-channel logout URL (optional):** `http://localhost:5000/logout`
- 4.  **Save**.

### 相关错误码: AADSTS700016

---

## Scenario 2: Implementing a Native/Public Client Application in Microsoft Entra ID using MSAL.NET and PowerShell 
> 来源: ado-wiki-d-msal-net-native-client-powershell-setup.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Go to **Microsoft Entra admin center**  **App registrations**  **New registration**.
- 2. **Name:** `MsalNativeClient`
- 3. **Supported account types:** *Accounts in this organizational directory only (Single tenant)*
- 4. Click **Register**.
- 1. **Authentication  Add a platform  Mobile and desktop applications.**
- 2. Add a **Redirect URI:** `http://localhost:{port}` (for example `http://localhost:50337`).
- 3. Enable **Allow public client flows** (if available).
- 4. Click **Save.**
- 1. **API permissions  Add a permission  Microsoft Graph  Delegated permissions.**
- 3. Click **Grant admin consent** if needed.

---

## Scenario 3: Implementing a Native/Public Client Application in Microsoft Entra ID using MSAL.NET and PowerShell 
> 来源: ado-wiki-d-msal-ps-native-client-auth-context.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1) Install Required Tools & Packages
- 2) App Registration (Native/Desktop)
- 1.  Go to **Microsoft Entra admin center**  **App registrations**  **New registration**.
- 2.  **Name:** MsalNativeAuthContext
- 3.  **Supported account types:** _Accounts in this organizational directory only (Single tenant)_
- 4.  Click **Register**.
- 1.  **Authentication  Add a platform  Mobile and desktop applications.**
- 2.  Add a **Redirect URI:** [http://localhost:{port}](http://localhost:%7Bport%7D) (for example [http://localhost:50337](http://localhost:50337)).
- 3.  Enable **Allow public client flows** (if available).
- 4.  Click **Save.**

---

## Scenario 4: Configure MSAL Android Development Environment
> 来源: ado-wiki-f-configure-msal-android-dev-environment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting**

---

## Scenario 5: MSAL.Python Integration with WSL
> 来源: ado-wiki-msal-python-wsl-broker.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. The `enable_broker_on_linux` flag enables the broker on both WSL and standalone Linux. If the goal is to enable broker support solely on WSL for Azure CLI, consider modifying the Azure CLI app code
- 2. **WSL**: No additional dependencies required. The Windows Authentication Manager (WAM), available by default on Windows, will serve as the broker.
- 3. **Standalone Linux**: The Intune Portal must be installed for the Linux standalone broker to be set up and running.
- 4. If the broker is not installed on standalone Linux, it will **fall back** to the non-broker authentication flow.
- 5. If enabling the broker on standalone Linux, test the environment to ensure there is no regression.

---

## Scenario 6: How to Enable Logging for MSAL.NET and Microsoft Graph SDK
> 来源: mslearn-enable-logging-msal-graph-sdk.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Register app in Entra ID with redirect URI `http://localhost` (Mobile and desktop platform)
- 2. Add delegated permissions: `User.Read.All`, `Application.ReadWrite.All`
- 3. Grant admin consent
- 4. Create Azure Storage account for storing logs

---

## Scenario 7: Enable MSAL4J Logging in Spring Boot Web Application
> 来源: mslearn-enable-msal4j-logging-spring-boot.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps**

---

## Scenario 8: MSAL Android Package Inspector
> 来源: mslearn-package-inspector-msal-android.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Clone MSAL Android repo: `https://github.com/AzureAD/microsoft-authentication-library-for-android.git`
- 2. Open **root package** (not package-inspector dir) in Android Studio
- 3. Select `package-inspector` from run config dropdown
- 4. Run on device/emulator

---
