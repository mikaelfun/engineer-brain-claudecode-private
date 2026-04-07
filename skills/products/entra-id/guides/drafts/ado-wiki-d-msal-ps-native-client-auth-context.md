---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Integration Scenarios/MSAL.PS Native Client with Auth Context"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FIntegration%20Scenarios%2FMSAL.PS%20Native%20Client%20with%20Auth%20Context"
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

# Implementing a Native/Public Client Application in Microsoft Entra ID using MSAL.NET and PowerShell (Interactive Flow with Authentication Context)

*Field-verified, step-by-step guide to register, build, and run a native/public client (no client secret) with MSAL.NET and optional Authentication Context claim enforcement. Simple flow: install  create project  edit Program.cs  run.*

[[_TOC_]]
MSALNET

---

Overview
--------

A **Native/Public Client** performs **interactive authentication** **without** a client secret. Platform type in Entra ID: **Mobile and desktop applications** (native). This guide documents the exact steps: **install required packages/tools**, **create the project**, **edit Program.cs**, **run**, and **validate tokens**, with an optional example to request an **Authentication Context (Auth Context)** during sign-in.
<div style="background-color:#f3e8ff; border-left:4px solid #a855f7; border-radius:8px; padding:12px 16px; margin:16px 0;"> <strong>Important:</strong> Native/Public clients do <em>not</em> use a client secret. Ensure the platform is <strong>Mobile and desktop applications</strong> and the loopback redirect URI (e.g., <code>http://localhost:{port}</code>) is configured in App Registration. </div>

* * *

1) Install Required Tools & Packages
------------------------------------

### 1.1 Verify .NET SDK installation

Open a terminal (CMD or PowerShell) and run:

`dotnet --version`

*   If you see a version number (e.g., 8.0.x)   Youre good.
    
*   If not, download and install the latest **.NET SDK (LTS)** from [https://dotnet.microsoft.com/download](https://dotnet.microsoft.com/download).
    

### 1.2 Install MSAL.PS module

This PowerShell module can be used for quick token validation. Its not required for the C# app, but helpful for testing.

`if (-not (Get-Module -ListAvailable -Name MSAL.PS)) {     Write-Host "MSAL.PS module not found. Installing..." -ForegroundColor Yellow     Install-Module MSAL.PS -Scope CurrentUser -Force -Verbose     Write-Host "MSAL.PS installed successfully." -ForegroundColor Green } else {     Write-Host "MSAL.PS module is already installed." -ForegroundColor Green }`

* * *

2) App Registration (Native/Desktop)
------------------------------------

1.  Go to **Microsoft Entra admin center**  **App registrations**  **New registration**.
    
2.  **Name:** MsalNativeAuthContext
    
3.  **Supported account types:** _Accounts in this organizational directory only (Single tenant)_
    
4.  Click **Register**.
    

### Configure Authentication (platform)

1.  **Authentication  Add a platform  Mobile and desktop applications.**
    
2.  Add a **Redirect URI:** [http://localhost:{port}](http://localhost:%7Bport%7D) (for example [http://localhost:50337](http://localhost:50337)).
    
3.  Enable **Allow public client flows** (if available).
    
4.  Click **Save.**
    

### API Permissions

1.  **API permissions  Add a permission  Microsoft Graph  Delegated permissions.**
    
2.  Add:
    *   openid
        
    *   offline_access _(optional)_
        
    *   User.Read _(for profile data)_
        
3.  Click **Grant admin consent** if needed.
    

> **Save these values for later:**
> *   Tenant (Directory) ID  {tenant-id}
>     
> *   Client (Application) ID  {client-id}
>     
> *   Redirect URI  [http://localhost:{port}](http://localhost:%7Bport%7D)
>     

* * *

3) Create the Project
---------------------

### 3.1 Create a new console app

In your terminal (PowerShell or CMD), choose a folder and run:

`dotnet new console -n MsalNativeAuthContext cd MsalNativeAuthContext`

This creates:
*   Program.cs (your main file)
    
*   MsalNativeAuthContext.csproj (project configuration)
    
*   bin/ and obj/ (auto-generated after build/run)
    

### 3.2 Add MSAL.NET package

Install the **Microsoft.Identity.Client** library:

`dotnet add package Microsoft.Identity.Client`

* * *

### 3.3 Open and edit the Program.cs file

Use the following command to open your project in **Visual Studio Code** directly:

`code .\Program.cs`

Once open, delete the default contents and paste the following code. This version includes an **Authentication Context claim** (c1) for Conditional Access step-up:

`using Microsoft.Identity.Client; using System; using System.Threading.Tasks;  class Program {     static async Task Main(string[] args)     {         string clientId = "<your-client-ID>";         string tenantId = "<your-tenant-ID>";         string[] scopes = { "https://graph.microsoft.com/.default openid" };          var pca = PublicClientApplicationBuilder.Create(clientId)             .WithTenantId(tenantId)             .WithRedirectUri("http://localhost:50337")             .Build();          // Build Authentication Context claim (Conditional Access step-up)         string claims = "{\"access_token\":{\"acrs\":{\"essential\":true,\"values\":[\"c1\"]}}}";          try         {             var result = await pca.AcquireTokenInteractive(scopes)                 .WithClaims(claims)                 .ExecuteAsync();              Console.WriteLine("Access Token:\n" + result.AccessToken);             Console.WriteLine("\nID Token:\n" + result.IdToken);         }         catch (MsalException ex)         {             Console.WriteLine($"Error: {ex.Message}");         }     } }`

* * *

4) Run and Validate
-------------------

### 4.1 Run the application

From the same folder:

`dotnet run`

A browser window will open for sign-in. If your Conditional Access policy enforces **Authentication Context c1**, the user will be required to perform **step-up authentication** (e.g., MFA or compliant device). After successful authentication, the console prints the **Access Token** and **ID Token**.

* * *

5) Validate the Token
---------------------

Copy the **Access Token** and paste it into [https://jwt.ms](https://jwt.ms) to confirm:
*   The claim acrs includes "c1" (your Auth Context ID)
    
*   tid, aud, and scp are correctly set
    

* * *

6) Troubleshooting
------------------

*   **redirect_uri_mismatch:** Make sure the redirect URI matches the one in App Registration.
    
*   **invalid_scope:** Use the correct scope format: "[https://graph.microsoft.com/.default](https://graph.microsoft.com/.default) openid".
    
*   **No browser launched:** Add .WithUseEmbeddedWebView(true) to your MSAL builder.
    
*   **Authentication canceled:** Rerun and complete the browser login.
    
*   **CA not triggered:** Ensure your Conditional Access policy is properly assigned to Auth Context ID c1.
    

* * *

7) Summary
----------

*   **Platform:** Mobile & Desktop (native/public)
    
*   **Flow:** Interactive  no client secret required
    
*   **Scope:** .default openid
    
*   **Optional:** Auth Context enforcement using .WithClaims()
    
*   **Validation:** [jwt.ms](https://jwt.ms)