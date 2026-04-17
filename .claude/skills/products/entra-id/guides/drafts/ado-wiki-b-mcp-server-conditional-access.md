---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Supported Technologies/Microsoft Graph API/Microsoft Graph MCP Server for Enterprise/Step 3. Control MCP Server Access with Conditional Access"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FSupported%20Technologies%2FMicrosoft%20Graph%20API%2FMicrosoft%20Graph%20MCP%20Server%20for%20Enterprise%2FStep%203.%20Control%20MCP%20Server%20Access%20with%20Conditional%20Access"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Summary

The Microsoft MCP Server for Enterprise exposes APIs that client apps (like Visual Studio and VS Code) call to enable MCP functionality. By default, these apps can request tokens for MCP scopes, which means they can access MCP endpoints without additional restrictions. To enforce security controls such as MFA, compliant devices, or network restrictions you need to make these apps visible to Conditional Access (CA) policies in Microsoft Entra ID.

**Why This Matters**

- **Unrestricted access**: Without CA, any user with delegated permissions can call MCP endpoints.

- **Conditional Access enforcement**: By exposing MCP apps in Entra, you can apply CA policies to control who can obtain tokens and under what conditions.

- **Least privilege**: MCP clients should only get the minimal scopes they need (for example <McpPrefix>.User.Read) and CA ensures those tokens are issued only when security conditions are met.

## Apply Conditional Access Policy

Allow the MCP Client application to call the Microsoft MCP Server for Enterprise application **only** under your chosen security conditions (e.g., require MFA, compliant device, or restrict to named network locations).

To restrict token issuance:

1. In [Microsoft Entra ID](https://entra.microsoft.com/#home) create a **Conditional Access policy** 

2. **Assignments:**

- **Users:** Select those who can run the MCP clients.

- **Target resources:** Select **Microsoft MCP Server for Enterprise** (and optionally the client app). 

3. **Conditions:** Configure MFA, device compliance, or location restrictions.

4. **Access controls:** Choose **Grant** and enforce your controls.

5. Enable the policy. 

**Behavior**

CA is evaluated at token issuance. If conditions fail, token requests are blocked. MCP only receives tokens that meet CA requirements.

## Block All Access (Optional)

Options:

Any of these should block access:

1. **No consent:** Do not grant any MCP scopes.

2. **Revoke consent:** Remove delegated permissions.

  - Navigate to **Enterprise applications** > select **All applications** > select the **Microsoft MCP Server for Enterprise** app.

  - Under **Security**, select **Permissions**.

  - Click **Revoke admin consent**.

3. **Require assignment:** On the **Microsoft MCP Server for Enterprise** enterprise app, select **Properties** > set **User assignment required** = **Yes** to allow only specific callers, but do not assign any users/groups. 

4. **Block via CA:** Create a CA policy that targets **Microsoft MCP Server for Enterprise** with the **Block** Grant control. 

**Result** 

MCP Clients will fail to acquire valid tokens for MCP or will be blocked at enforcement time. MCP returns 401 for missing/invalid tokens and 403 for insufficient permissions.
