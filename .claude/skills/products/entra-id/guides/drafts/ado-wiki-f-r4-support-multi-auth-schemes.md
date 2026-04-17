---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Supported Technologies/Microsoft Identity Web/support multi auth schemes"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FSupported%20Technologies%2FMicrosoft%20Identity%20Web%2Fsupport%20multi%20auth%20schemes"
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

# How to enable both OpenId Connect and JWT Bearer auth in Microsoft Identity Web

[[_TOC_]]

If have an web app that provides both a User Interface and has API components

We recommended that you implement both OpenIdConnect and JwtBearer authentication schemes. OpenIdConnect authentication scheme uses Cookie Authentication while JwtBearer authentication scheme uses bearer access tokens.

At some point, your cookie will expire while a user is sitting on a page, your app will make an API call to itself causing unexpected behaviors such as user getting kicked out to start over again.

Configure your web app to expose an API...
<https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-configure-app-expose-web-apis>

Make sure your web app can acquire a access token (by passing the scope for your API you just exposed above)...
<https://learn.microsoft.com/en-us/entra/identity-platform/scenario-web-app-call-api-acquire-token?tabs=aspnetcore>


# Asp .Net Core
On your Microsoft Entra ID implementation, you most likely already have something that looks like this
~~~
builder.Services.AddAuthentication(OpenIdConnectDefaults.AuthenticationScheme)
       .AddMicrosoftIdentityWebApp(builder.Configuration.GetSection("AzureAd"))
~~~
You can add JwtBearer authentication and define names for your authentication schemes so that we can call them later from your controllers
~~~
// Configure Web App for OIDC Authentication
builder.Services.AddAuthentication(OpenIdConnectDefaults.AuthenticationScheme)
       .AddMicrosoftIdentityWebApp(builder.Configuration.GetSection("AzureAd"), "OpenIdConnect");

// Configure Web APP for OAuth2 JWT Bearer Authentication
builder.Services.AddAuthentication(OpenIdConnectDefaults.AuthenticationScheme)
       .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"), "JwtBearer");
~~~
On your Controllers that show pages, you can set it to use the OpenIdConnect authentication scheme
~~~
 [Authorize(AuthenticationSchemes ="OpenIdConnect")]
 public class HomeController : Controller
    {
    // 
~~~
On your Controllers for the API, you can set it to use the JwtBearer authentication scheme
~~~
 [Authorize(AuthenticationSchemes ="JwtBearer")]
 public class ApiController : Controller
    {
    // 
~~~
# Asp .Net
In Asp.Net, AuthenticationSchemes is not available. Instead you have to use AuthenticationTypes and confgiure your Filter and Route config
~~~
Public static class WebApiConfig{
    public static void Register(HttpConfiguration config)
    {
        config.MapHttpAttributeRoutes();
        //Tells APIs to ignore the Default Cookie Type Authenticationconfig.SuppressDefaultHostAuthentication();
        config.Filters.Add(newHostAuthenticationFilter(OAuthDefaults.AuthenticationType));
        config.Routes.MapHttpRoute(
            name: "DefaultApi",
            routeTemplate: "api/{controller}/{id}",
            defaults: new{ id = RouteParameter.Optional }
        );
    }
}   
~~~
In your Authentication implementation (normally found in Startup.Auth.cs), it would look something like this
~~~
app.UseOpenIdConnectAuthentication(new CookieAuthenticationOptions
        {
           //configuration goes here});
          AuthenticationType = "OpenIdConnect",
        }

app.UseJwtBearerAuthentication(new JwtBearerAuthenticationOptions
        {
           //configuration goes here    
          AuthenticationType = "JwtBearer",
        }
~~~
