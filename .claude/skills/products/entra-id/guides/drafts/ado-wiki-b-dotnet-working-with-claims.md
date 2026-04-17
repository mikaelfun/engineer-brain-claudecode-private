---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Developer Scenarios/DotNet/DotNet Working with claims"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FDeveloper%20Scenarios%2FDotNet%2FDotNet%20Working%20with%20claims"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Working with claims

## Overview

You will either be working with ClaimsIdentity or ClaimsPrincipal object. Both have Claims.

```csharp
using System.Security.Claims;

// ClaimsIdentity
var identity = User.Identity as ClaimsIdentity;
var userClaims = identity.Claims;

// ClaimsPrincipal
ClaimsPrincipal cp = ClaimsPrincipal.Current;
var userClaims = cp.Claims;
```

Get ClaimsPrincipal from HttpContext:
- **ASP.NET Core**: https://learn.microsoft.com/en-us/aspnet/core/fundamentals/use-http-context?view=aspnetcore-8.0#user
- **ASP.NET**: https://learn.microsoft.com/en-us/dotnet/api/system.web.httpcontext.user?view=netframework-4.8.1
  - For middleware outside controllers:
    ```csharp
    using System.Web;
    var _httpContext = HttpContext.Current.GetOwinContext();
    // Make sure Microsoft.Owin.Host.SystemWeb package is installed
    ```

## Common claim extraction patterns

### idp claim
```csharp
string utid = string.Empty;
string idp = userClaims.Where(claim => claim.Type == "idp").FirstOrDefault()?.Value;
if (!idp.IsNullOrEmpty())
{
    // idp looks like 'https://sts.windows.net/GUID'
    utid = idp.Split('/')[3]; // Tenant Id
}
```

### employeeId claim
```csharp
string EmployeeId = userClaims.FirstOrDefault(c => c.Type.Equals("employeeid")).Value;
```

## Get Claim From Token
```csharp
using System.IdentityModel.Tokens.Jwt;

var handler = new JwtSecurityTokenHandler();
JwtSecurityToken token = handler.ReadToken(token) as JwtSecurityToken;
String upn = token.Claims.Where(claim => claim.Type == "upn").FirstOrDefault().Value;
```

## Create ClaimsPrincipal from Token
```csharp
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

var tokenObj = new JwtSecurityTokenHandler().ReadJwtToken(jwt_token);
var cp = new ClaimsPrincipal(new ClaimsIdentity(tokenObj.Claims));
```

## Microsoft Identity Web extensions

Microsoft Identity Web extends ClaimsPrincipal with helper methods:
- Source: https://github.com/AzureAD/microsoft-identity-web/blob/212c1fb8acbdea2a5d91324c89e4c87c0ec2010b/src/Microsoft.Identity.Web.TokenCache/ClaimsPrincipalExtensions.cs#L12

```csharp
IEnumerable<Claim> userClaims = _httpContext.HttpContext.User.Claims;
String displayName = _httpContext.HttpContext.User.GetDisplayName();
```

## Adding custom claims to existing ClaimsPrincipal
```csharp
public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
{
    ClaimsIdentity claimsIdentity = new ClaimsIdentity();
    var claimType = "myNewClaim";
    if (!principal.HasClaim(claim => claim.Type == claimType))
    {
        claimsIdentity.AddClaim(new Claim(claimType, "myClaimValue"));
    }
    principal.AddIdentity(claimsIdentity);
    return Task.FromResult(principal);
}
```

## More information
- Claims-based auth explainer: https://eddieabbondanz.io/post/aspnet/claims-based-authentication-claims-identities-principals/
- ASP.NET Core claims: https://learn.microsoft.com/en-us/aspnet/core/security/authentication/claims?view=aspnetcore-8.0
