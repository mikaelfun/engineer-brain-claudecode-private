---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Integration Scenarios/MSAL.NET Confidential Client (Auth Code Flow) using PowerShell"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FIntegration%20Scenarios%2FMSAL.NET%20Confidential%20Client%20(Auth%20Code%20Flow)%20using%20PowerShell"
importDate: "2026-04-06"
type: troubleshooting-guide
---

Tags:
*   cw.AAD
    
*   cw.AAD-Dev
    
*   cw.AAD-Workflow
    
*   cw.comm-devex
    

* * *

:::template /.templates/Shared/findAuthorContributor.md  
:::  
:::template /.templates/Shared/MBIInfo.md  
:::
[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Dev](/Tags/AAD%2DDev) [AAD-Workflow](/Tags/AAD%2DWorkflow)

<strong>MSAL.NET</strong>
 Confidential Client Authentication Guide
=================================================

_Comprehensive guide to configure, register, and validate a **confidential client** using **client secret** and <strong>MSAL.NET</strong>
 with **Authorization Code + PKCE** and a **loopback redirect**._
[[_TOC_]]

* * *

Overview
--------

A **Confidential Client** authenticates using a **client secret** (or certificate) and typically uses the **Authorization Code** flow.  
This guide shows how to register the app, enable a **loopback redirect** (`http://localhost:5000/`), use **PKCE**, and redeem the authorization code via [MSAL.NET (Microsoft Docs)](https://learn.microsoft.com/en-us/azure/active-directory/develop/msal-overview)
.
<div style="background-color:#f3e8ff; border-left:4px solid #a855f7; border-radius:8px; padding:12px 16px; margin:16px 0;"> <strong>Security Note:</strong> Store the <code>client secret</code> securely (Key Vault or environment variables). Avoid committing secrets to source control. <strong>You can follow the steps on this document to store the client secret in a secure way.</strong>
<a href="https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/2068986/Using-Windows-Credential-Manager-to-Securely-Store-Client-Secrets" target="_blank">
Using Windows Credential Manager to Securely Store Client Secrets  Overview
</a>


 </div>

* * *

1) Install Required Tools & Packages
------------------------------------

### 1.1 Verify .NET SDK installation

Open a terminal (CMD or PowerShell) and run:
<div class="copy-btn-container"> <button aria-label="Copy to clipboard" class="copy-btn bolt-button bolt-icon-button enabled subtle icon-only bolt-focus-treatment"> <span role="status" class="copy-btn-tooltip">Copy to clipboard</span> <span class="fluent-icons-enabled"> <span aria-hidden="true" class="left-icon flex-noshrink fabric-icon medium ms-Icon--Copy"></span> </span> </button> <pre class="hljs"><code class="powershell"> <span class="hljs-built_in">dotnet</span> <span class="hljs-operator">--version</span> </code></pre> </div>
*   If you see a version number (e.g., `8.0.x`)   Youre good.
    
*   If not, download and install the latest **.NET SDK (LTS)** from the official site.
    

### 1.2 (Optional) Install MSAL.PS (for quick token checks from PowerShell)

This module is optional for the C# app but useful for sanity checks.
<div class="copy-btn-container"> <button aria-label="Copy to clipboard" class="copy-btn bolt-button bolt-icon-button enabled subtle icon-only bolt-focus-treatment"> <span role="status" class="copy-btn-tooltip">Copy to clipboard</span> <span class="fluent-icons-enabled"> <span aria-hidden="true" class="left-icon flex-noshrink fabric-icon medium ms-Icon--Copy"></span> </span> </button> <pre class="hljs"><code class="powershell"> <span class="hljs-keyword">if</span> (-not (Get-Module -ListAvailable -Name MSAL.PS)) { <span class="hljs-built_in">Write-Host</span> <span class="hljs-string">"MSAL.PS module not found. Installing..."</span> -ForegroundColor Yellow <span class="hljs-built_in">Install-Module</span> MSAL.PS -Scope CurrentUser -Force -Verbose <span class="hljs-built_in">Write-Host</span> <span class="hljs-string">" MSAL.PS installed successfully."</span> -ForegroundColor Green } <span class="hljs-keyword">else</span> { <span class="hljs-built_in">Write-Host</span> <span class="hljs-string">" MSAL.PS module is already installed."</span> -ForegroundColor Green } </code></pre> </div>

* * *

2) App Registration (Confidential/Web)
--------------------------------------

1.  Go to **Microsoft Entra admin center**  **App registrations**  **New registration**.
    
2.  **Name:** `MsalConfidentialClient`
    
3.  **Supported account types:** _Accounts in this organizational directory only (Single tenant)_
    
4.  Click **Register**.
    

### Configure Authentication (Web)

1.  **Authentication  Add a platform  Web**.
    
2.  **Redirect URI:** `http://localhost:5000/`
    
3.  **Front-channel logout URL (optional):** `http://localhost:5000/logout`
    
4.  **Save**.
    

### Client Secret

1.  **Certificates & secrets  New client secret**.
    
2.  Choose an appropriate expiration. **Copy and store the value securely**.
    

### API Permissions

1.  **API permissions  Add a permission ** your API or Microsoft Graph (as applicable).
    
2.  For this guide we will use **`.default`** for your resource (no delegated user scopes).
    
3.  **Grant admin consent** if necessary.
    

> **Keep these values handy for the code:**
> *   Tenant (Directory) ID  `{tenant-id}`
>     
> *   Client (Application) ID  `{client-id}`
>     
> *   Client Secret  `{client-secret}`
>     
> *   Redirect URI  `http://localhost:5000/`
>     

* * *

3) Create the Project
---------------------

### 3.1 Create a new console app

Choose a folder and run:
<div class="copy-btn-container"> <button aria-label="Copy to clipboard" class="copy-btn bolt-button bolt-icon-button enabled subtle icon-only bolt-focus-treatment"> <span role="status" class="copy-btn-tooltip">Copy to clipboard</span> <span class="fluent-icons-enabled"> <span aria-hidden="true" class="left-icon flex-noshrink fabric-icon medium ms-Icon--Copy"></span> </span> </button> <pre class="hljs"><code class="powershell"> <span class="hljs-built_in">dotnet</span> <span class="hljs-operator">new</span> console -n <span class="hljs-string">MsalConfidentialClient</span> <span class="hljs-built_in">cd</span> <span class="hljs-string">MsalConfidentialClient</span> </code></pre> </div>
This creates:
*   `Program.cs` (main file)
    
*   `MsalConfidentialClient.csproj` (project file)
    
*   `bin/` and `obj/` (after build/run)
    

### 3.2 Add MSAL.NET package

Install **Microsoft.Identity.Client**:
<div class="copy-btn-container"> <button aria-label="Copy to clipboard" class="copy-btn bolt-button bolt-icon-button enabled subtle icon-only bolt-focus-treatment"> <span role="status" class="copy-btn-tooltip">Copy to clipboard</span> <span class="fluent-icons-enabled"> <span aria-hidden="true" class="left-icon flex-noshrink fabric-icon medium ms-Icon--Copy"></span> </span> </button> <pre class="hljs"><code class="powershell"> <span class="hljs-built_in">dotnet</span> add package <span class="hljs-string">Microsoft.Identity.Client</span> </code></pre> </div>

* * *

4) Edit Program.cs (Authorization Code + PKCE + Loopback)
---------------------------------------------------------

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

This sample:
*   Starts a **local HTTP listener** on `http://localhost:5000/`
    
*   Opens the system browser to the **/authorize** URL (with **PKCE**)
    
*   Captures the **authorization code**, validates **state**, and redeems the code using **MSAL.NET**
    
*   Uses **`.default`** for scopes
    
```csharp
using Microsoft.Identity.Client;
using System;
using System.Diagnostics;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        // ===== YOUR APP SETTINGS =====
        string clientId = "{client-id}";
        string tenantId = "{tenant-id}";
        string clientSecret = "{client-secret}"; // store securely (Key Vault/env var)

        // Use your API's .default (no delegated scopes in this example)
        string[] scopes = new[] { "{client-id}/.default", "openid" };

        // Loopback redirect (must be configured in App Registration > Authentication)
        string redirectUri = "http://localhost:5000/";

        // ===== BUILD CONFIDENTIAL CLIENT =====
        var cca = ConfidentialClientApplicationBuilder.Create(clientId)
            .WithClientSecret(clientSecret)
            .WithAuthority($"https://login.microsoftonline.com/{tenantId}")
            .WithRedirectUri(redirectUri)
            .Build();

        try
        {
            // ===== START LOOPBACK LISTENER =====
            using var listener = new HttpListener();
            listener.Prefixes.Add(redirectUri);
            listener.Start();

            // ===== STATE + PKCE (recommended) =====
            string state = Base64UrlEncodeNoPadding(RandomBytes(32));
            string codeVerifier = GenerateCodeVerifier();
            string codeChallenge = GenerateCodeChallenge(codeVerifier);

            // ===== /AUTHORIZE URL =====
            string scopeParam = Uri.EscapeDataString(string.Join(" ", scopes));
            string authorizeUrl =
                $"https://login.microsoftonline.com/{Uri.EscapeDataString(tenantId)}/oauth2/v2.0/authorize" +
                $"?client_id={Uri.EscapeDataString(clientId)}" +
                "&response_type=code" +
                $"&redirect_uri={Uri.EscapeDataString(redirectUri)}" +
                "&response_mode=query" +
                $"&scope={scopeParam}" +
                "&prompt=login" + // force re-authentication
                $"&state={Uri.EscapeDataString(state)}" +
                $"&code_challenge={Uri.EscapeDataString(codeChallenge)}" +
                "&code_challenge_method=S256";

            // Open system browser
            Process.Start(new ProcessStartInfo(authorizeUrl) { UseShellExecute = true });

            // ===== CAPTURE AUTHORIZATION CODE =====
            var context = await listener.GetContextAsync();
            var request = context.Request;
            var response = context.Response;

            var query = request.Url?.Query ?? "";
            var code = GetQueryString(query, "code");
            var returnedState = GetQueryString(query, "state");
            var error = GetQueryString(query, "error");
            var errorDesc = GetQueryString(query, "error_description");

            // Simple HTML response
            var html = "<html><body><h2>Authentication complete. You can close this window.</h2></body></html>";
            var buf = Encoding.UTF8.GetBytes(html);
            response.ContentLength64 = buf.Length;
            using (var output = response.OutputStream) { output.Write(buf, 0, buf.Length); }
            listener.Stop();

            if (!string.IsNullOrEmpty(error))
                throw new Exception($"Authorization error: {error} - {errorDesc}");
            if (string.IsNullOrEmpty(code))
                throw new Exception("No authorization code was returned.");
            if (!string.Equals(state, returnedState, StringComparison.Ordinal))
                throw new Exception("State mismatch. Potential CSRF detected.");

            // ===== REDEEM CODE FOR TOKENS (CONFIDENTIAL CLIENT) =====
            var result = await cca.AcquireTokenByAuthorizationCode(scopes, code)
                                  .WithPkceCodeVerifier(codeVerifier)
                                  .ExecuteAsync();

            Console.WriteLine("Access Token:\n" + result.AccessToken);
            Console.WriteLine("\nID Token:\n" + result.IdToken);
            Console.WriteLine("\nExpires On: " + result.ExpiresOn);
            Console.WriteLine("\nAccount: " + result.Account?.Username);
        }
        catch (MsalException msalEx)
        {
            Console.WriteLine($"MSAL Error: {msalEx.ErrorCode} - {msalEx.Message}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"General Error: {ex.Message}");
        }
    }

    // ===== Helpers =====
    static byte[] RandomBytes(int length)
    {
        var bytes = new byte[length];
        RandomNumberGenerator.Fill(bytes);
        return bytes;
    }

    static string GenerateCodeVerifier()
    {
        // 43-128 chars, URL-safe
        return Base64UrlEncodeNoPadding(RandomBytes(64));
    }

    static string GenerateCodeChallenge(string codeVerifier)
    {
        var bytes = Encoding.ASCII.GetBytes(codeVerifier);
        using var sha = SHA256.Create();
        var hash = sha.ComputeHash(bytes);
        return Base64UrlEncodeNoPadding(hash);
        }

    static string Base64UrlEncodeNoPadding(byte[] buffer)
    {
        return Convert.ToBase64String(buffer)
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");
    }

    static string? GetQueryString(string query, string key)
    {
        if (string.IsNullOrEmpty(query)) return null;
        var q = query.StartsWith("?") ? query.Substring(1) : query;
        foreach (var kv in q.Split('&', StringSplitOptions.RemoveEmptyEntries))
        {
            var parts = kv.Split('=', 2);
            if (parts.Length == 2 && parts[0].Equals(key, StringComparison.OrdinalIgnoreCase))
                return Uri.UnescapeDataString(parts[1]);
        }
        return null;
    }
}
```

* * *

5) Run & Validate
-----------------

### 5.1 Run the application

From the project folder, launch the app:
<div class="copy-btn-container"> <button aria-label="Copy to clipboard" class="copy-btn bolt-button bolt-icon-button enabled subtle icon-only bolt-focus-treatment"> <span role="status" class="copy-btn-tooltip">Copy to clipboard</span> <span class="fluent-icons-enabled"> <span aria-hidden="true" class="left-icon flex-noshrink fabric-icon medium ms-Icon--Copy"></span> </span> </button> <pre class="hljs"><code class="powershell"> <span class="hljs-built_in">dotnet</span> run </code></pre> </div>
*   A browser window opens to the Microsoft identity platform **/authorize** endpoint.
    
*   After authentication and consent, the app redeems the **authorization code** with **PKCE** and prints tokens to the console.
    

### 5.2 Inspect token (optional)

Copy the access token and paste it into a JWT viewer (e.g., <em>jwt.ms</em>) to inspect claims (tenant, audience, etc.).

* * *

6) Troubleshooting
------------------

*   **invalid_client / secret expired**  
    Create a new **client secret** and update the code/config.
    
*   **redirect_uri_mismatch**  
    Ensure the exact URI `http://localhost:5000/` is added under **Web** platform in App Registration.
    
*   **AADSTS700016 (App not found)**  
    Verify `{client-id}` and that youre using the correct **tenant**.
    
*   **invalid_scope**  
    For this example, make sure youre using **`.default`** for your resource.
    

* * *

7) Summary
----------

*   **Platform:** Web (Confidential Client)
    
*   **Auth:** Authorization Code + **PKCE**, **client secret**
    
*   **Loopback redirect:** `http://localhost:5000/`
    
*   **Scopes:** **`.default`** (app-to-app scenarios)
    
*   **Library:** **MSAL.NET** `ConfidentialClientApplication` for code redemption
    

* * *

**Author:** Entra ID dev Team  (ridia@microsoft.com)
**Source:** Verified Confidential Client Implementation with MSAL.NET (Auth Code + PKCE, `.default` scope only)