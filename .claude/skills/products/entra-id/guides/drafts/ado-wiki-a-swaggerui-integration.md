---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Developer Scenarios/DotNet/AspNet AspNetCore/SwaggerUI Integration"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Developer/Developer%20Scenarios/DotNet/AspNet%20AspNetCore/SwaggerUI%20Integration"
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
   
 

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Dev](/Tags/AAD%2DDev) [AAD-Workflow](/Tags/AAD%2DWorkflow) [AAD-Dev-Training](/Tags/AAD%2DDev%2DTraining)    

:::template /.templates/Shared/MBIInfo.md
:::

# How to integrate Swagger UI and Swagger API with Entra ID Auth

[[_TOC_]]

# Overview


Do not forget the basic principles of Open ID Connect and OAuth2. When you want to protect an API with OAuth2 and Azure AD, you must pass an access token that will be validated. So if you want to test with SwaggerUI, on accessing the API portion, SwaggerUI must be configured to authenticate, acquire an access token, and pass it to the API.

Before we get started, ensure you create two app registrations in Azure AD, one for the client i.e. SwaggerUI as a Single Page Application, and one for the API, i.e. your Swagger API.  
https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app

Ensure on the API app registration, you have configured to expose an API..  
https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-configure-app-expose-web-apis

So to configure SwaggerUI�
```
builder.Services.AddSwaggerGen(options =>
{

    var AzureAdMetadata = builder.Configuration["SwaggerClient:Metadata"]!;

    options.AddSecurityDefinition("Oauth2", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        //Description = "Please enter a valid token",
        Name = "Authorization",
        Type = SecuritySchemeType.OpenIdConnect,
        BearerFormat = "JWT",
        Scheme = "Bearer",
        OpenIdConnectUrl = new Uri(AzureAdMetadata),
        
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Oauth2" }
            },
            new string[]{}
        }
    });
});

// ...

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.OAuthClientId(builder.Configuration["SwaggerClient:ClientId"]);
    options.OAuth2RedirectUrl(builder.Configuration["SwaggerClient:RedirectUrl"]);
    options.OAuthScopes(new[] { builder.Configuration["SwaggerClient:Scopes"], "openid", "profile", "offline_access" });
    options.OAuthUsePkce();
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
    //options.RoutePrefix = string.Empty;
});
```

Don�t forget to add your redirect URI �https://YOUR_APP_PATH/oauth2-redirect.html� as a single page application reply address on the client application registration.

Your appsettings.json will look something like this�

```
{
  /*
The following identity settings need to be configured
before the project can be successfully executed.
For more info see https://aka.ms/dotnet-template-ms-identity-platform
*/
  "SwaggerAPI": {
    "Instance": "https://login.microsoftonline.com/",
    "Domain": "your_domain.onmicrosoft.com",
    "TenantId": "YOUR_TENANT_ID",
    "ClientId": "YOUR_API_APP_ID",
    "Audience": "AUD_CLAIM_FROM_ACCESS_TOKEN"
  },
  "SwaggerClient": {
    "Metadata": "https://login.microsoftonline.com/YOUR_TENANT_ID/v2.0/.well-known/openid-configuration",
    "ClientId": "YOUR_CLIENT_APP_ID",
    "RedirectUrl": "https://YOUR_APP_PATH/oauth2-redirect.html",
    "Scopes": "SCOPE_VALUE_FOR_YOUR_API"
  },
```

And your authentication code if using Microsoft Identity Web would look like this�

```
builder.Services.AddMicrosoftIdentityWebApiAuthentication(builder.Configuration, "SwaggerAPI");
```

When all said and done, after launching your Swagger app, you should now see an Authorize button at the top of your page. This will load the �Swagger Client� to acquire the access token. Then, when you test your API calls from the Swagger UI, it will automatically pass the access token.