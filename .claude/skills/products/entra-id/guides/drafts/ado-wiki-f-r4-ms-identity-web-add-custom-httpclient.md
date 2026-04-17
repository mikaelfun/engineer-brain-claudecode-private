---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Supported Technologies/Microsoft Identity Web/Microsoft Identity Web Add Custom HttpClient"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FSupported%20Technologies%2FMicrosoft%20Identity%20Web%2FMicrosoft%20Identity%20Web%20Add%20Custom%20HttpClient"
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

# Add Custom HttpClient to Microsoft Identity Web

[[_TOC_]]

# Overview

### First create your custom HttpClient

For example you wanted to add Proxy support...

~~~
// authenticated proxy info
string proxyURL = "http://192.168.2.240:8080";
string u = "********";
string p = "********";

WebProxy webProxy = new WebProxy
{
    Address = new Uri(proxyURL),
    // specify the proxy credentials
    Credentials = new NetworkCredential(u,p)
};

HttpClientHandler httpClientHandler = new HttpClientHandler
{
    Proxy = webProxy
    UseProxy = true,
    //ClientCertificateOptions = ClientCertificateOptions.Manual
    SslProtocols = System.Security.Authentication.SslProtocols.Tls12
};
~~~

### Adding the HttpClient to the Middleware

##### JwtBearerOptions
~~~
services.Configure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
{
    options.BackchannelHttpHandler = httpClientHandler
});
~~~

##### OpenIdConnectOptions
~~~
services.Configure<OpenIdConnectOptions>(OpenIdConnectDefaults.AuthenticationScheme, options =>
{
    options.BackchannelHttpHandler = httpClientHandler
});
~~~

### Adding the HttpClient to MSAL behind Microsoft Identity Web

First create your custom IMsalHttpClientFactory...
* https://learn.microsoft.com/en-us/entra/msal/dotnet/advanced/httpclient

Inject an implementation of the IMsalHttpClientFactory in the service collection:
~~~
services.AddSingleton<IMsalHttpClientFactory, YourCustomMsalHttpClientFactory();
~~~
