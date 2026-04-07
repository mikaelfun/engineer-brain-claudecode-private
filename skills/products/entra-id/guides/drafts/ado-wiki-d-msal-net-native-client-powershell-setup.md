---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Integration Scenarios/MSAL.NET Native Client PowerShell Setup Guide"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FIntegration%20Scenarios%2FMSAL.NET%20Native%20Client%20PowerShell%20Setup%20Guide"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Dev
- cw.AAD-Workflow
- cw.comm-devex
---
:::template /.templates/Shared/findAuthorContributor.md
:::
:::template /.templates/Shared/MBIInfo.md
:::

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Dev](/Tags/AAD%2DDev) [AAD-Workflow](/Tags/AAD%2DWorkflow)

# Implementing a Native/Public Client Application in Microsoft Entra ID using MSAL.NET and PowerShell (Interactive Flow)

*Field-verified, step-by-step guide to register, build, and run a native/public client (no client secret) with MSAL.NET. Simple flow: install  create project  edit Program.cs  run.*

[[_TOC_]]
MSALNET

---

## Overview
A **Native/Public Client** performs **interactive authentication** **without** a client secret.  
Platform type in Entra ID: **Mobile and desktop applications** (native).  
This guide documents the exact steps: **install required packages/tools**, **create the project**, **edit `Program.cs`**, **run**, and **validate tokens**.

<div style="background-color:#f3e8ff; border-left:4px solid #a855f7; border-radius:8px; padding:12px 16px; margin:16px 0;">
  <strong>Important:</strong> Native/Public clients do <em>not</em> use a client secret. Ensure the platform is <strong>Mobile and desktop applications</strong> and the loopback redirect URI (e.g., <code>http://localhost:{port}</code>) is configured in App Registration.
</div>

---

## 1) Install Required Tools & Packages

### 1.1 Verify .NET SDK installation
Open a terminal (CMD or PowerShell) and run:

<div class="copy-btn-container">
  <button aria-label="Copy to clipboard" class="copy-btn bolt-button bolt-icon-button enabled subtle icon-only bolt-focus-treatment">
    <span role="status" class="copy-btn-tooltip">Copy to clipboard</span>
    <span class="fluent-icons-enabled">
      <span aria-hidden="true" class="left-icon flex-noshrink fabric-icon medium ms-Icon--Copy"></span>
    </span>
  </button>
  <pre class="hljs" style="background-color:#f9fafb;border:1px solid #d1d5db;border-radius:10px;padding:16px;font-family:Consolas,'Courier New',monospace;">
    <code class="powershell">
<span style="color:#0078D4;">dotnet</span> <span style="color:#D13438;">--version</span>
    </code>
  </pre>
</div>

- If you see a version number (e.g., `8.0.x`)   Youre good.  
- If not, download and install the latest **.NET SDK (LTS)** from [https://dotnet.microsoft.com/download](https://dotnet.microsoft.com/download).

### 1.2 Install MSAL.PS module
This PowerShell module can be used for quick token validation. Its not required for the C# app, but helpful for testing.

<div class="copy-btn-container">
  <button aria-label="Copy to clipboard" class="copy-btn bolt-button bolt-icon-button enabled subtle icon-only bolt-focus-treatment">
    <span role="status" class="copy-btn-tooltip">Copy to clipboard</span>
    <span class="fluent-icons-enabled">
      <span aria-hidden="true" class="left-icon flex-noshrink fabric-icon medium ms-Icon--Copy"></span>
    </span>
  </button>

  <pre class="hljs"><code class="powershell">
<span class="hljs-keyword">if</span> (-not (Get-Module -ListAvailable -Name MSAL.PS)) {
    <span class="hljs-built_in">Write-Host</span> <span class="hljs-string">"MSAL.PS module not found. Installing..."</span> -ForegroundColor Yellow
    <span class="hljs-built_in">Install-Module</span> MSAL.PS -Scope CurrentUser -Force -Verbose
    <span class="hljs-built_in">Write-Host</span> <span class="hljs-string">"MSAL.PS installed successfully."</span> -ForegroundColor Green
} <span class="hljs-keyword">else</span> {
    <span class="hljs-built_in">Write-Host</span> <span class="hljs-string">"MSAL.PS module is already installed."</span> -ForegroundColor Green
}
</code></pre>
</div>

---

## 2) App Registration (Native/Desktop)

1. Go to **Microsoft Entra admin center**  **App registrations**  **New registration**.  
2. **Name:** `MsalNativeClient`  
3. **Supported account types:** *Accounts in this organizational directory only (Single tenant)*  
4. Click **Register**.

### Configure Authentication (platform)
1. **Authentication  Add a platform  Mobile and desktop applications.**  
2. Add a **Redirect URI:** `http://localhost:{port}` (for example `http://localhost:50337`).  
3. Enable **Allow public client flows** (if available).  
4. Click **Save.**

### API Permissions
1. **API permissions  Add a permission  Microsoft Graph  Delegated permissions.**  
2. Add:  
   - `openid`  
   - `offline_access` *(optional)*  
   - `User.Read` *(for profile data)*  
3. Click **Grant admin consent** if needed.

> **Save these values for later:**  
> - Tenant (Directory) ID  `{tenant-id}`  
> - Client (Application) ID  `{client-id}`  
> - Redirect URI  `http://localhost:{port}`  

---

## 3) Create the Project

### 3.1 Create a new console app
In your terminal (PowerShell or CMD), choose a folder and run:

<div class="copy-btn-container">
  <button aria-label="Copy to clipboard" class="copy-btn bolt-button bolt-icon-button enabled subtle icon-only bolt-focus-treatment">
    <span role="status" class="copy-btn-tooltip">Copy to clipboard</span>
    <span class="fluent-icons-enabled">
      <span aria-hidden="true" class="left-icon flex-noshrink fabric-icon medium ms-Icon--Copy"></span>
    </span>
  </button>

  <pre class="hljs"><code class="powershell">
<span class="hljs-built_in">dotnet</span> new console -n <span class="hljs-string">MsalNativeClient</span>
<span class="hljs-built_in">cd</span> <span class="hljs-string">MsalNativeClient</span>
</code></pre>
</div>

This creates:
- `Program.cs` (your main file)  
- `MsalNativeClient.csproj` (project configuration)  
- `bin/` and `obj/` (auto-generated after build/run)

### 3.2 Add MSAL.NET package
Install the **Microsoft.Identity.Client** library:

<div class="copy-btn-container">
  <button aria-label="Copy to clipboard" class="copy-btn bolt-button bolt-icon-button enabled subtle icon-only bolt-focus-treatment">
    <span role="status" class="copy-btn-tooltip">Copy to clipboard</span>
    <span class="fluent-icons-enabled">
      <span aria-hidden="true" class="left-icon flex-noshrink fabric-icon medium ms-Icon--Copy"></span>
    </span>
  </button>

  <pre class="hljs"><code class="powershell">
<span class="hljs-built_in">dotnet</span> add package <span class="hljs-string">Microsoft.Identity.Client</span>
</code></pre>
</div>

---

### 3.3 Open and edit the Program.cs file
Use the following command to open your project in **Visual Studio Code** directly:

<div class="copy-btn-container">
  <button aria-label="Copy to clipboard" class="copy-btn bolt-button bolt-icon-button enabled subtle icon-only bolt-focus-treatment">
    <span role="status" class="copy-btn-tooltip">Copy to clipboard</span>
    <span class="fluent-icons-enabled">
      <span aria-hidden="true" class="left-icon flex-noshrink fabric-icon medium ms-Icon--Copy"></span>
    </span>
  </button>

  <pre class="hljs"><code class="powershell">
<span class="hljs-built_in">code</span> .\Program.cs
</code></pre>
</div>

Once open, delete the default contents and paste the following code:

<div class="copy-btn-container">
  <button aria-label="Copy to clipboard" class="copy-btn bolt-button bolt-icon-button enabled subtle icon-only bolt-focus-treatment">
    <span role="status" class="copy-btn-tooltip">Copy to clipboard</span>
    <span class="fluent-icons-enabled">
      <span aria-hidden="true" class="left-icon flex-noshrink fabric-icon medium ms-Icon--Copy"></span>
    </span>
  </button>

  <pre class="hljs"><code class="csharp">
<span class="hljs-keyword">using</span> Microsoft.Identity.Client;
<span class="hljs-keyword">using</span> System;
<span class="hljs-keyword">using</span> System.Threading.Tasks;

<span class="hljs-keyword">class</span> Program
{
    <span class="hljs-keyword">static async Task</span> Main(<span class="hljs-built_in">string</span>[] args)
    {
        <span class="hljs-built_in">string</span> clientId = <span class="hljs-string"><strong>"<your-client-ID>"</strong></span>;
        <span class="hljs-built_in">string</span> tenantId = <span class="hljs-string"><strong>"<your-Tenant-ID>"</strong></span>;
        <span class="hljs-built_in">string</span>[] scopes = { <span class="hljs-string">"https://graph.microsoft.com/.default openid"</span> };

        <span class="hljs-built_in">var</span> pca = PublicClientApplicationBuilder.Create(clientId)
            .WithTenantId(tenantId)
            .WithRedirectUri(<span class="hljs-string">"<strong>"<your-replyURL(for example http://localhost)>"</strong>"</span>)
            .Build();

        <span class="hljs-keyword">try</span>
        {
            <span class="hljs-built_in">var</span> result = <span class="hljs-keyword">await</span> pca.AcquireTokenInteractive(scopes)
                .ExecuteAsync();

            Console.WriteLine(<span class="hljs-string">"Access Token:\n"</span> + result.AccessToken);
            Console.WriteLine(<span class="hljs-string">"\nID Token:\n"</span> + result.IdToken);
        }
        <span class="hljs-keyword">catch</span> (MsalException ex)
        {
            Console.WriteLine(<span class="hljs-string">$"Error: {ex.Message}"</span>);
        }
    }
}
</code></pre>
</div>

---

## 4) Run and Validate

### 4.1 Run the application
From the same folder:

<div class="copy-btn-container">
  <button aria-label="Copy to clipboard" class="copy-btn bolt-button bolt-icon-button enabled subtle icon-only bolt-focus-treatment">
    <span role="status" class="copy-btn-tooltip">Copy to clipboard</span>
    <span class="fluent-icons-enabled">
      <span aria-hidden="true" class="left-icon flex-noshrink fabric-icon medium ms-Icon--Copy"></span>
    </span>
  </button>

  <pre class="hljs"><code class="powershell">
<span class="hljs-built_in">dotnet</span> run
</code></pre>
</div>

A browser window will open for sign-in.  
After successful authentication, the console will print the **Access Token** and **ID Token**.

### 4.2 Validate the token
Copy the Access Token and paste it into [https://jwt.ms](https://jwt.ms) to inspect claims such as:
- `tid` (tenant)
- `aud` (audience/resource)
- `scp` (scopes like `.default`)

---

## 5) Troubleshooting
- **redirect_uri_mismatch:** Make sure the redirect URI matches the one in App Registration.  
- **invalid_scope:** Use the correct scope format: `"https://graph.microsoft.com/.default openid"`.  
- **No browser launched:** Add `.WithUseEmbeddedWebView(true)` to your MSAL builder.  
- **Authentication canceled:** Rerun and complete the browser login.

---

## 6) Summary
- **Platform:** Mobile & Desktop (native/public)  
- **Flow:** Interactive  no client secret required  
- **Scopes:** `.default openid`  
- **Validation:** [jwt.ms](https://jwt.ms)

---

**Author:** ridia@microsoft.com / Entra ID Dev Support Team  
**Source:** Verified Native/Public Client Implementation with MSAL.NET
