---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Developer Scenarios/DotNet/AspNet AspNetCore/Asp Auth Middleware Scenarios"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Developer/Developer%20Scenarios/DotNet/AspNet%20AspNetCore/Asp%20Auth%20Middleware%20Scenarios"
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
:::template /.templates/Shared/MBIInfo.md
:::

# Scenarios for customizing AspNet and AspNetCore Web Apps Authentication Middleware 

[[_TOC_]]

## Overview

We may cross customer cases asking for help with customizing behaviors of the Asp.Net and Asp.Net Core authentication middleware.

<hr/>

## Add Authentication

### Asp.Net

**Use UseOpenIdConnectAuthentication**  
```
public void Configuration(IAppBuilder app)
        {
            app.SetDefaultSignInAsAuthenticationType(CookieAuthenticationDefaults.AuthenticationType);

            app.UseCookieAuthentication(new CookieAuthenticationOptions());
            app.UseOpenIdConnectAuthentication(
                new OpenIdConnectAuthenticationOptions
                {
                    // Sets the ClientId, authority, RedirectUri as obtained from web.config
                    ClientId = clientId,
                    Authority = authority,
                    RedirectUri = redirectUrl,

                    // PostLogoutRedirectUri is the page that users will be redirected to after sign-out. In this case, it is using the home page
                    PostLogoutRedirectUri = redirectUrl,

                    //Scope is the requested scope: OpenIdConnectScopes.OpenIdProfileis equivalent to the string 'openid profile': in the consent screen, this will result in 'Sign you in and read your profile'
                    Scope = OpenIdConnectScope.OpenIdProfile,

                    // ResponseType is set to request the id_token - which contains basic information about the signed-in user
                    ResponseType = OpenIdConnectResponseType.IdToken,

                    // ValidateIssuer set to false to allow work accounts from any organization to sign in to your application
                    // To only allow users from a single organizations, set ValidateIssuer to true and 'tenant' setting in web.config to the tenant name or Id (example: contoso.onmicrosoft.com)
                    // To allow users from only a list of specific organizations, set ValidateIssuer to true and use ValidIssuers parameter
                    TokenValidationParameters = new TokenValidationParameters()
                    {
                        ValidateIssuer = true
                    },

                    // OpenIdConnectAuthenticationNotifications configures OWIN to send notification of failed authentications to OnAuthenticationFailed method
                    Notifications = new OpenIdConnectAuthenticationNotifications
                    {
                        AuthenticationFailed = OnAuthenticationFailed
                    }

                });

        }
```

**Use UseJwtBearerAuthentication**

**Using Microsoft.Identity.Web to add OpenIdConnect authentication**
```
app.AddMicrosoftIdentityWebApp(factory, null, options =>
{
    options.SignInAsAuthenticationType = CookieAuthenticationDefaults.AuthenticationType;

    // Customize params sent to Entra...
    var identityProviderHandler = options.Notifications.RedirectToIdentityProvider;
    options.Notifications.RedirectToIdentityProvider = async (context) =>
        {
            context.ProtocolMessage.Prompt = "login";
            
            await identityProviderHandler(context);
        };
});
```

### Asp.Net Core

#### Add Multiple Authorities
```csharp
public void ConfigureServices(IServiceCollection services)
        {
            services.AddAuthentication("AzureAdB2C")
                .AddJwtBearer("AzureAdB2CBearer",
                    options =>
                    {
                        options.Authority = Configuration.GetValue<string>("AzureAdB2C:Authority");
                        options.TokenValidationParameters = new TokenValidationParameters
                        {
                            ValidateIssuer = false,
                            ValidateAudience = true,
                            ValidAudience = Configuration.GetValue<string>("AzureAdB2C:Authority");
                        };
                    })
                .AddJwtBearer("AzureAdBearer",
                    options =>
                    {
                        options.Authority = Configuration.GetValue<string>("AzureAd:Audience");
                        options.TokenValidationParameters = new TokenValidationParameters
                        {
                            ValidateIssuer = false,
                            ValidateAudience = true,
                            ValidAudience = Configuration.GetValue<string>("AzureAdB2C:Audience");
                        };
                    });
```

Make sure you also add them to the authorization policy...
```
                services.AddAuthorization(options =>
                {
                    options.DefaultPolicy = new AuthorizationPolicyBuilder()
                        .RequireAuthenticatedUser()
                        .AddAuthenticationSchemes("AzureAdB2CBearer", "AzureAdBearer")
                        .Build();
                });
```

For more information about adding multiple authorities and using multiple authentication schemes...  
https://github.com/AzureAD/microsoft-identity-web/wiki/multiple-authentication-schemes

<hr/>

## Claim management�

### Using Asp.Net Core

```csharp
public static void AddUpdateClaim(this IPrincipal currentPrincipal, string key, string value)
{
    var identity = currentPrincipal.Identity as ClaimsIdentity;
    if (identity == null)
        return;

    // check for existing claim and remove it
    var existingClaim = identity.FindFirst(key);
    if (existingClaim != null)
        identity.RemoveClaim(existingClaim);
    
    // add new claim
    identity.AddClaim(new Claim(key, value));
    var authenticationManager = HttpContext.Current.GetOwinContext().Authentication;
    authenticationManager.AuthenticationResponseGrant = new AuthenticationResponseGrant(new ClaimsPrincipal(identity), new AuthenticationProperties() { IsPersistent = true });
}

public static string GetClaimValue(this IPrincipal currentPrincipal, string key)
{
    var identity = currentPrincipal.Identity as ClaimsIdentity;
    if (identity == null)
        return null;
    var claim = identity.Claims.FirstOrDefault(c => c.Type == key);
    // ?. prevents a exception if claim is null.
    return claim?.Value;
}
```

<hr/>

## How to get Access Token using implicit flow�
### Using Microsoft.Owin (Asp.Net)
```csharp
Notifications = new OpenIdConnectAuthenticationNotifications
{
    SecurityTokenValidated = (notification) =>
    {
        notification.AuthenticationTicket.Identity.AddClaim(new Claim("id_token", notification.ProtocolMessage.IdToken));
        notification.AuthenticationTicket.Identity.AddClaim(new Claim("access_token", notification.ProtocolMessage.AccessToken));
        
        notification.OwinContext.Authentication.User.ReplaceIdentity(notification.AuthenticationTicket.Identity);
return Task.CompletedTask;
    }
```

<hr/>

## Adding Login or Logout buttons for Microsoft Identity Web�

```html
<a class="nav-link text-dark" asp-area="MicrosoftIdentity" asp-controller="Account" asp-action="SignIn">Login</a>

<a class="nav-link text-dark" asp-area="MicrosoftIdentity" asp-controller="Account" asp-action="SignOut">Logout</a>
```

## Force authentication challenge from a controller...

### Using Asp.Net
```csharp

var props = new AuthenticationProperties
{
    // Redirect back to your app after the OIDC flow completes:
    RedirectUri = Url.IsLocalUrl(returnUrl) ? returnUrl : "/"
};

HttpContext.GetOwinContext()
            .Authentication
            .Challenge(
                props,
                OpenIdConnectAuthenticationDefaults.AuthenticationType
            );

// Important: return immediately so OWIN can short-circuit the response
Response.End();

```
### Using Asp.Net Core
```chsarp
[AllowAnonymous]
public class AccountController : Controller
{
    [HttpGet("login")]
    public IActionResult Login(string returnUrl = "/")
    {
        var props = new AuthenticationProperties { RedirectUri = Url.IsLocalUrl(returnUrl) ? returnUrl : "/" };
        return Challenge(props, "oidc"); // "oidc" must match AddOpenIdConnect("oidc", ...)
    }
}

```

## Adding additional claims after sign-in

For Azure AD sign-ins, the best place to do this is within the OpenIdConnectOptions or JwtBearerOptions configuration and inside of the OnTokenValidated event�

Adding these anywhere else may not work and add the claims.

```csharp
options.Events.OnTokenValidated = context =>
                {
	        // Get Graph Service Client (Assuming you have one)
                   //var graphClient = context.HttpContext.RequestServices.GetRequiredService<IMsGraphService>();
                   //var user = graph.

                    var claims = new List<Claim>
                    {
                        new System.Security.Claims.Claim("SecurityStamp", SecurityStamp)
                    };

                    var appIdentity = new ClaimsIdentity(claims);
                    context.Principal.AddIdentity(appIdentity);
                    

                    return Task.CompletedTask;
                    
                };
```

You can throw other logic in here like making MS Graph calls and add additional claims to the ClaimsPrincipal based on your logic here.

## Adding scope and role claim validation
```csharp
options.Events.OnTokenValidated = async context =>	
	{
	// This check is required to ensure that the Web API only accepts tokens from tenants where it has been consented and provisioned.
	if (!context.Principal.Claims.Any(x => x.Type == ClaimConstants.Scope)
	&& !context.Principal.Claims.Any(y => y.Type == ClaimConstants.Scp)
	&& !context.Principal.Claims.Any(y => y.Type == ClaimConstants.Roles)
	&& !context.Principal.Claims.Any(y => y.Type == ClaimConstants.Role))
	{
	throw new UnauthorizedAccessException("Neither scope or roles claim was found in the bearer token.");
	}
	await tokenValidatedHandler(context).ConfigureAwait(false);
	};
```

## Add custom authorization policy
First Create a Policy Requirement model�

```csharp
    public class OnPremisesExtensionPropertyRequirement : IAuthorizationRequirement
    {
        public string value { get; }
 
        public OnPremisesExtensionPropertyRequirement (string _value)
        {
            value = _value;
        }
    }
```

Create the Policy Handler�
```csharp
    public class OnPremisesExtensionPropertyAuthHandler : AuthorizationHandler< OnPremisesExtensionPropertyRequirement>
    {
 
        IMSGraphService GraphServiceClient;
 
        public OnPremisesExtensionPropertyAuthHandler (IMSGraphService _msGraphServiceClient)
        {
            GraphServiceClient = _msGraphServiceClient;
        }
 
        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, OnPremisesExtensionPropertyRequirement requirement)
        {
            if (context.User.Claims.Count() == 0)
            {
                //TODO: Use the following if targeting a version of
                //.NET Framework older than 4.6:
                //      return Task.FromResult(0);
                //context.Fail();
                return;
            }
 
 
            var user = await GraphServiceClient.GetUserAsync();
            var ext1 = user.OnPremisesExtensionAttributes.ExtensionAttribute1;
 
            if (ext1==requirement.value)
            {
                context.Succeed(requirement);
            }
 
            //TODO: Use the following if targeting a version of
            //.NET Framework older than 4.6:
            //      return Task.FromResult(0);
            //return Task.CompletedTask;
        }
    }
```

Within startup.cs�
 
Add a Singleton reference to the Handler�
```csharp
services.AddSingleton<IAuthorizationHandler, OnPremisesExtensionPropertyAuthHandler >();
```

And configure the Authorization policies like so�
```csharp
services.AddAuthorization(options =>
            {
                options.AddPolicy("Admins", policy =>
                    policy.Requirements.Add(new OnPremisesExtensionPropertyRequirement ("Admin.Value")));
                options.AddPolicy("Users", policy =>
                    policy.Requirements.Add(new OnPremisesExtensionPropertyRequirement ("User.Value")));
            });
```
 
Then the Authorize attribute on the controller�
```
[Authorize(Policy=�Admins,Users�)]
public class HomeController : Controller
```

This can be used to set up claim requirements for accessing a WebApp/View�
```csharp
services.AddControllersWithViews(options =>
            {
                var policy = new AuthorizationPolicyBuilder()
                    .RequireAuthenticatedUser()
                    .RequireClaim("ClaimType", new[] { "ValueOfClaim"})
                    .Build();
                options.Filters.Add(new AuthorizeFilter(policy));
            });
```

For example...
`.RequireClaim("ext_appid_userState", new[] { "enabled"})`

## Adding custom audience validation

**Multiple Audience Validation**  
If your tokens are coming with different �aud� claim, you can add additional Audience validations�
```chsarp
builder.Services.AddMicrosoftIdentityWebApiAuthentication(builder.Configuration, "AzureAd");

builder.Services.Configure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
{ 
  //...
  // Other token validation parameters
  //...

  var tvp = new TokenValidationParameters
  {
    //...
    // Other token validation parameters
    //...

    ValidAudiences =  builder.Configuration.GetSection("AzureAd:ValidAudiences").Get<List<string>>(),
  };

  options.TokenValidationParameters = tvp;
```

Your appsettings.json should look something like this�
```
{
  "AzureAd": {
    //... 
    // Other Settings
    //...

    "ValidAudiences": [
      "api://c60eeff9-1329-4ddb-ba4a-7e6555391c4d",
      "c60eeff9-1329-4ddb-ba4a-7e6555391c4d",
      "api://e92f9573-6f44-46b2-a4a9-1936d5f16ab5",
      "e92f9573-6f44-46b2-a4a9-1936d5f16ab5",
    ]
}
```

## Adding custom issuer validation

**Add AAD JWT Bearer Authentication**  
If you have a simple scenario where the Identity Provider is Azure Active Directory and the same signing keys can be used, you can simply add a list of Issuers you can validate� (Keep in mind each tenant in Azure AD will have a different issuer value)

```csharp
builder.Services.AddMicrosoftIdentityWebApiAuthentication(builder.Configuration);

builder.Services.Configure<JwtBearerOptions>(options =>
{ 
  var tvp = new TokenValidationParameters
  {
    ValidIssuers =  builder.Configuration.GetSection("AzureAd:ValidIssuers").Get<List<string>>(),
  };

  options.TokenValidationParameters = tvp;
});
```

Your appsettings.json should look something like this�
```chsarp
{
  "AzureAd": {
    //... 
    // Other Settings
    //...

    "ValidIssuers": [
      // Validate AAD v2 tokens
      "https://login.microsoftonline.com/{TENANT_1}/v2.0/", 
      "https://login.microsoftonline.com/{TENANT_2}/v2.0/" 
      // Validate AAD v1 tokens
      "https://sts.windows.net/{TENANT_1}/", 
      "https://sts.windows.net/{TENANT_2}/"
    ]
}
```

**Using IssuerValidator**  
This allows you to create a customer Issuer validator to lets say allow any issuer that contains "https://login.microsoftonline.com/"
```
// Allow tokens from ANY tenant
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(options =>
    {
        builder.Configuration.Bind("AzureAd", options);

        // Override issuer validation
        options.TokenValidationParameters.IssuerValidator = (issuer, securityToken, validationParameters) =>
        {
            // Accept tokens from ANY Entra tenant
            if (issuer.StartsWith("https://login.microsoftonline.com/", StringComparison.OrdinalIgnoreCase))
            {
                return issuer; // valid
            }

            throw new SecurityTokenInvalidIssuerException($"Issuer {issuer} is not allowed");
        };

        // Optional: disable default issuer validation
        options.TokenValidationParameters.ValidateIssuer = true;
    },
    options => builder.Configuration.Bind("AzureAd", options));
```

**Complex Multiple Issuer Validation (and signature validation)**  
When you want to validate multiple tokens from different issuers and the signing keys are different, this gets tricky. Now you have to consider how are you going to discover the signing keys.

The following code snippet is just an example of custom logic you could build�

```csharp
builder.Services.Configure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
{ 
    // IdentityModelEventSource.ShowPII is used for debugging
    IdentityModelEventSource.ShowPII = true;

    var tvp = new TokenValidationParameters
    {
        # Event handler for deciding which signing keys to use
        IssuerSigningKeyResolver = (s, token, kid, tvp) => {
            IConfigurationManager<OpenIdConnectConfiguration> configManager = null!;

            // Support AAD/B2C
            if (token.Issuer.Contains("login.microsoftonline.com") || token.Issuer.Contains("sts.windows.net") || token.Issuer.Contains("b2clogin.com"))
            {
                configManager = new ConfigurationManager<OpenIdConnectConfiguration>($"{token.Issuer}.well-known/openid-configuration", new OpenIdConnectConfigurationRetriever());
            }

            // Support other IdP
            else
            {
                configManager = new ConfigurationManager<OpenIdConnectConfiguration>(builder.Configuration["OtherIdp:Metadata"], new OpenIdConnectConfigurationRetriever());
            }

            OpenIdConnectConfiguration config = configManager.GetConfigurationAsync(System.Threading.CancellationToken.None).GetAwaiter().GetResult();
            return config.SigningKeys;
        },
        ValidAudiences =  builder.Configuration.GetSection("OtherIdp:ValidAudiences").Get<List<string>>(),
        ValidIssuers = builder.Configuration.GetSection("OtherIdp:ValidIssuers").Get<List<string>>(),
    };
```