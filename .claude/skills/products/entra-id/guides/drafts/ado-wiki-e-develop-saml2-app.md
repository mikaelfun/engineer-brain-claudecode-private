---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Developer Scenarios/How to Develop a SAML2 app"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FDeveloper%20Scenarios%2FHow%20to%20Develop%20a%20SAML2%20app"
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

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Dev](/Tags/AAD%2DDev) [AAD-Workflow](/Tags/AAD%2DWorkflow)  



[[_TOC_]]

# Overview

Microsoft does not provide any SAML2 SDKs. Therefore, you would have to use a third-party SAML2 SDK.

For example, a popular SAML2 SDK is the open source stack Sustainsys.Saml2 available at...

<https://saml2.sustainsys.com/en/v2/>

> **Note**: Helping a customer develop a SAML app is outside of support scope.

# Getting Started

You can use the following article as a guide for configuring your SAML2 application to integrate with Azure AD...

<https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/add-application-portal-setup-sso>

As for this tutorial...

1. Create a Non-Gallary application (Not a application registration)\
  <https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/add-non-gallery-app>

2. Enable SAML SSO\
  <https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/add-application-portal-setup-sso>

3. Download the Azure AD Certificate.

Note: Also write down the Thumbprint.

Once downloaded, install the certificate you're your preference location. This example will use the CurrentUser Personal (My) store.

1. Create new VS asp.net template
2. Add the following nuget packages...

* Sustainsys.Saml2.Mvc
* Sustain.Saml2.HttpModule

3. Get your project Url. You will need to use this throughout as your setting up your settings in your web.config and Azure AD.

![<description text>](.attachments\AAD-Developer\1510837\develop-saml2-app-2.png)

4. Configure Web.Config, it should look something like this...
~~~
<configuration>
� <configSections>
��� <section name="system.identityModel" type="System.IdentityModel.Configuration.SystemIdentityModelSection, System.IdentityModel, Version=4.0.0.0, Culture=neutral, PublicKeyToken=B77A5C561934E089" />
��� <section name="system.identityModel.services" type="System.IdentityModel.Services.Configuration.SystemIdentityModelServicesSection, System.IdentityModel.Services, Version=4.0.0.0, Culture=neutral, PublicKeyToken=B77A5C561934E089" />
��� <section name="sustainsys.saml2" type="Sustainsys.Saml2.Configuration.SustainsysSaml2Section, Sustainsys.Saml2" />
��� <sectionGroup name="nwebsec">
����� <!-- For information on how to configure NWebsec please visit: <https://docs.nwebsec.com/> -->
����� <section name="httpHeaderSecurityModule" type="NWebsec.Modules.Configuration.HttpHeaderSecurityConfigurationSection, NWebsec" requirePermission="false" />
��� </sectionGroup>
� </configSections>
� <system.webServer>
��� <modules>
����� <!-- Add these modules below any existing. The SessionAuthenticatioModule
����������� must be loaded before the Saml2AuthenticationModule -->
����� <add name="SessionAuthenticationModule" type="System.IdentityModel.Services.SessionAuthenticationModule, System.IdentityModel.Services, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089" />
����� <!-- Only add the Saml2AuthenticationModule if you're using the Sustainsys.Saml2.HttpModule
����������� library. If you are using Sustainsys.Saml2.Mvc you SHOULD NOT load this module.-->
����� <add name="Saml2AuthenticationModule" type="Sustainsys.Saml2.HttpModule.Saml2AuthenticationModule, Sustainsys.Saml2.HttpModule" />
��� </modules>
� </system.webServer>
� <sustainsys.saml2 entityId="https://contoso-saml2-webapp.contoso.onmicrosoft.com" returnUrl="http://localhost:64226/"� authenticateRequestSigningBehavior="Never">
��� <nameIdPolicy allowCreate="true" format="Persistent" />
��� <metadata validDuration="7.12:00:00" wantAssertionsSigned="true">
����� <organization name="Sustainsys AB" displayName="Sustainsys" url="https://www.Sustainsys.com" language="sv" />
����� <contactPerson type="Other" email="info@Sustainsys.se" />
����� <requestedAttributes>
������� <add friendlyName="Some Name" name="urn:someName" nameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri" isRequired="true" />
������� <add name="Minimal" />
����� </requestedAttributes>
��� </metadata>
��� <identityProviders>
����� <add entityId="https://sts.windows.net/aa00d1fa-5269-4e1c-b06d-30868371d2c5/" signOnUrl="https://login.microsoftonline.com/aa00d1fa-5269-4e1c-b06d-30868371d2c5/saml2" allowUnsolicitedAuthnResponse="true" binding="HttpRedirect" wantAuthnRequestsSigned="true">
������� <signingCertificate storeName="My" storeLocation="CurrentUser" findValue="441467d042cc9ecc37d88c60c700a43ab5c6c06c" x509FindType="FindByThumbprint" />
����� </add>
���� </identityProviders>
��� <!-- Optional configuration for signed requests. Required for Single Logout.
��� <serviceCertificates>
����� <add fileName="c:\aad\certs\Contoso Saml2 Web App\cert.pfx" />
��� </serviceCertificates>
��� -->
��� <!-- Optional configuration for fetching IDP list from a federation -->
��� <federations>
����� <add metadataLocation="https://login.microsoftonline.com/aa00d1fa-5269-4e1c-b06d-30868371d2c5/federationmetadata/2007-06/federationmetadata.xml" allowUnsolicitedAuthnResponse="false" />
��� </federations>
� </sustainsys.saml2>
� <system.identityModel />
� <system.identityModel.services>
��� <federationConfiguration>
����� <cookieHandler requireSsl="false" />
��� </federationConfiguration>
� </system.identityModel.services>\
....
~~~
5. Configure the SAML SSO settings in Azure AD.

> **Note**: For a non-http localhost set up, I had to add the Reply URL in the application registration. So in this example I do have a <http://localhost:port/saml2/acs> in my app registration.

1. To test it out. Navigate to your web apps Saml2 signin address. i.e. <https://localhost:64226/saml2/signin>
2. You should be redirected to Azure AD to sign in. Resolve any Azure Ad errors.
3. If you get redirected back to your app without any errors, then you did it and successfully set everything up. (As far as I know :) ).

Other Notes:

* Removed discoveryServiceUrl="http://localhost:52071/DiscoveryService" since Azure AD does not use this.

  from...

    ```
    <sustainsys.saml2 entityId="http://localhost:17009" returnUrl="http://localhost:17009/SamplePath/"� authenticateRequestSigningBehavior="Always">
    ```

References...

<https://saml2.sustainsys.com/en/v2/getting-started.html>

<https://saml2.sustainsys.com/en/v2/configuration.html>

# Additional troubleshooting...

## Configuration Error

Description:�An error occurred during the processing of a configuration file required to service this request. Please review the specific error details below and modify your configuration file appropriately.�

~~~
Parser Error Message:�The value of the property 'cacheDuration' cannot be parsed. The error is: the duration string does not start with 'P'

Source Error:�
|
Line 29:�� <sustainsys.saml2 entityId="http://localhost:17009" returnUrl="http://localhost:17009/SamplePath/" discoveryServiceUrl="http://localhost:52071/DiscoveryService" authenticateRequestSigningBehavior="Always">\
Line 30:���� <nameIdPolicy allowCreate="true" format="Persistent" />\
Line 31:���� <metadata cacheDuration="0:0:42" validDuration="7.12:00:00" wantAssertionsSigned="true">\
Line 32:������ <organization name="Sustainsys AB" displayName="Sustainsys" url="https://www.Sustainsys.com" language="sv" />\
Line 33:������ <contactPerson type="Other" email="info@Sustainsys.se" />
 |
~~~
**SOLUTION**<br>

cacheDuration is optional and defaults to one hour. Therefore I removed this property.

Now it looks like this...
~~~
�<metadata validDuration="7.12:00:00" wantAssertionsSigned="true">
~~~
## The system cannot find the file specified.
~~~
Description:�An unhandled exception occurred during the execution of the current web request. Please review the stack trace for more information about the error and where it originated in the code.�

Exception Details:�System.Security.Cryptography.CryptographicException: The system cannot find the file specified.

Source Error:�
|
An unhandled exception was generated during the execution of the current web request. Information regarding the origin and location of the exception can be identified using the exception stack trace below.
 |
~~~
**SOLUTION**<br>

There are two solutions.

If you don't care about signing the requests. In that case...

I commented out this section since its optional...
~~~

��� <serviceCertificates>
����� <add fileName="~/App_Data/Sustainsys.Saml2.Tests.pfx" />
��� </serviceCertificates>

~~~
Otherwise, ensure the following certificate path is valid...

I have not been able to get this to work completely so I'ev gone the route of uncommenting this section.

## Finding cert through FindBySubjectName in CurrentUser:AddressBook with value Sustainsys.Saml2.Idp matched 0 certificates. A unique match is required.
~~~
Description:�An unhandled exception occurred during the execution of the current web request. Please review the stack trace for more information about the error and where it originated in the code.�

Exception Details:�System.InvalidOperationException: Finding cert through FindBySubjectName in CurrentUser:AddressBook with value Sustainsys.Saml2.Idp matched 0 certificates. A unique match is required.

Source Error:�
|
An unhandled exception was generated during the execution of the current web request. Information regarding the origin and location of the exception can be identified using the exception stack trace below.
 |
~~~
**SOLUTION**<br>

This is due to the following section in Web.Config being mis-configured...
~~~
<identityProviders>

����� <add entityId="https://login.microsoftonline.com/your-tenant-id/federationmetadata/2007-06/federationmetadata.xml" signOnUrl="https://login.microsoftonline.com/your-tenant-id/saml2" allowUnsolicitedAuthnResponse="true" binding="HttpRedirect" wantAuthnRequestsSigned="true">

������ �<signingCertificate storeName="My" storeLocation="CurrentUser" findValue="Microsoft Azure Federated SSO Certificate" x509FindType="FindBySubjectName" />

����� </add>

����� <add entityId="example-idp" metadataLocation="https://login.microsoftonline.com/your-tenant-id/federationmetadata/2007-06/federationmetadata.xmla" allowUnsolicitedAuthnResponse="true" loadMetadata="true" />

��� </identityProviders>
~~~
Ensure that the values for storeName, storeLocation, findValue, and x509FindType are all correct.

So for example, make sure the values reflect where you have installed the Azure AD certificate earlier.

Finding cert through FindBySubjectName in CurrentUser:My with value Microsoft Azure Federated SSO Certificate matched 3 certificates. A unique match is required.
~~~
Description:�An unhandled exception occurred during the execution of the current web request. Please review the stack trace for more information about the error and where it originated in the code.�

Exception Details:�System.InvalidOperationException: Finding cert through FindBySubjectName in CurrentUser:My with value Microsoft Azure Federated SSO Certificate matched 3 certificates. A unique match is required.

Source Error:�
|
An unhandled exception was generated during the execution of the current web request. Information regarding the origin and location of the exception can be identified using the exception stack trace below.
 |
~~~
**SOLUTION**<br>

You have more than one certificate with the same Subject name. Either delete the other certificates or change your web.config to find by Thumbnail...
~~~
<identityProviders>

����� <add entityId="https://login.microsoftonline.com/your-tenant-id/federationmetadata/2007-06/federationmetadata.xml" signOnUrl="https://login.microsoftonline.com/your-tenant-id/saml2" allowUnsolicitedAuthnResponse="true" binding="HttpRedirect" wantAuthnRequestsSigned="true">

������� <signingCertificate storeName="My" storeLocation="CurrentUser" findValue="441467d042cc9ecc37d88c60c700a43ab5c6c06c" x509FindType="FindByThumbprint" />

����� </add>

����� <add entityId="example-idp" metadataLocation="https://login.microsoftonline.com/your-tenant-id/federationmetadata/2007-06/federationmetadata.xml" allowUnsolicitedAuthnResponse="true" loadMetadata="true" />

��� </identityProviders>
~~~
## Unexpected entity id "<https://sts.windows.net/your-tenant-id/>" found when loading metadata for "example-idp".
~~~
Description:�An unhandled exception occurred during the execution of the current web request. Please review the stack trace for more information about the error and where it originated in the code.�

Exception Details:�System.Configuration.ConfigurationErrorsException: Unexpected entity id "<https://sts.windows.net/your-tenant-id/>" found when loading metadata for "example-idp".

Source Error:�
|
An unhandled exception was generated during the execution of the current web request. Information regarding the origin and location of the exception can be identified using the exception stack trace below.
 |
~~~
**SOLUTION**<br>

Idp "my-app" is configured for signed AuthenticateRequests, but ServiceCertificates configuration contains no certificate with usage "Signing" or "Both". To resolve this issue you can a) add a service certificate with usage "Signing" or "Both" (default if not specified is "Both") or b) Set the AuthenticateRequestSigningBehavior configuration property to "Never".
~~~
Description:�An unhandled exception occurred during the execution of the current web request. Please review the stack trace for more information about the error and where it originated in the code.�

Exception Details:�System.Configuration.ConfigurationErrorsException: Idp "my-app" is configured for signed AuthenticateRequests, but ServiceCertificates configuration contains no certificate with usage "Signing" or "Both". To resolve this issue you can a) add a service certificate with usage "Signing" or "Both" (default if not specified is "Both") or b) Set the AuthenticateRequestSigningBehavior configuration property to "Never".

Source Error:�
|
An unhandled exception was generated during the execution of the current web request. Information regarding the origin and location of the exception can be identified using the exception stack trace below.
 |
~~~
**SOLUTION**<br>

I have not been able to get the certificate/request signing portions to work so I have disabled them in my sample...

<sustainsys.saml2 entityId="http://localhost:17009" returnUrl="http://localhost:17009/SamplePath/" �authenticateRequestSigningBehavior="Never">

Comment out or remove the following section

<!-- Optional configuration for signed requests. Required for Single Logout.

��� <serviceCertificates>

����� <add fileName="c:\aad\certs\Contoso Saml2 Web App\cert.pfx" />

��� </serviceCertificates>

-->

## AADSTS700016: Application with identifier '<http://localhost:17009>' was not found in the directory 'your-tenant-id'. This can happen if the application has not been installed by the administrator of the tenant or consented to by any user in the tenant. You may have sent your authentication request to the wrong tenant.

**SOLUTION**<br>

Review the entityId on the following line in the web.config...
~~~
�<sustainsys.saml2 entityId="https://contoso-saml2-webapp.contoso.onmicrosoft.com" returnUrl="http://localhost:17009/SamplePath/"� authenticateRequestSigningBehavior="Never">
~~~
Ensure the EntityId matches the App URI ID in Azure AD for the application registration.

## The given key was not present in the dictionary.
~~~
Description:�An unhandled exception occurred during the execution of the current web request. Please review the stack trace for more information about the error and where it originated in the code.�

Exception Details:�System.Collections.Generic.KeyNotFoundException: The given key was not present in the dictionary.

Source Error:�

|
An unhandled exception was generated during the execution of the current web request. Information regarding the origin and location of the exception can be identified using the exception stack trace below.
 |
Stack Trace:�
|\
[KeyNotFoundException: The given key was not present in the dictionary.]\
�� System.Collections.Generic.Dictionary`2.get_Item(TKey key) +12829231\
�� Sustainsys.Saml2.Configuration.IdentityProviderDictionary.get_Item(EntityId entityId) +84

[KeyNotFoundException: No Idp with entity id "<https://sts.windows.net/your-tenant-id/>" found.]\
�� Sustainsys.Saml2.Configuration.IdentityProviderDictionary.get_Item(EntityId entityId) +196\
�� Sustainsys.Saml2.Configuration.<>c.<.ctor>b__56_12(EntityId ei, IDictionary`2 rd, IOptions opt) +26\
�� Sustainsys.Saml2.WebSso.AcsCommand.GetIdpContext(XmlElement xml, HttpRequestData request, IOptions options) +120\
�� Sustainsys.Saml2.WebSso.AcsCommand.Run(HttpRequestData request, IOptions options) +471\
�� Sustainsys.Saml2.HttpModule.Saml2AuthenticationModule.OnAuthenticateRequest(Object sender, EventArgs e) +261\
�� System.Web.SyncEventExecutionStep.System.Web.HttpApplication.IExecutionStep.Execute() +144\
�� System.Web.HttpApplication.ExecuteStepImpl(IExecutionStep step) +50\
�� System.Web.HttpApplication.ExecuteStep(IExecutionStep step, Boolean& completedSynchronously) +73
 |
~~~
**SOLUTION**<br>

Review the following section in the web.config...
~~~
<identityProviders>

����� <add entityId="https://sts.windows.net/your-tenant-id/" signOnUrl="https://login.microsoftonline.com/your-tenant-id/saml2" allowUnsolicitedAuthnResponse="true" binding="HttpRedirect" wantAuthnRequestsSigned="true">

������� <signingCertificate storeName="My" storeLocation="CurrentUser" findValue="441467d042cc9ecc37d88c60c700a43ab5c6c06c" x509FindType="FindByThumbprint" />

����� </add>

���� </identityProviders>
~~~
Ensure the entityId matches value specified in the stacktrace...
~~~
[KeyNotFoundException: No Idp with entity id "<https://sts.windows.net/your-tenant-id/>" found.]
~~~
# Other scenarios

## Username Password flow for Federated user SAML Auth

**CSharp**
~~~
using System.ServiceModel.Security
using System.ServiceModel
using System.IdentityModel.Protocols.WSTrust
using Microsoft.IdentityModel.Protocols.WSTrust.Bindings
//...
var stsEndpoint = "https://[server]/adfs/services/trust/13/UsernameMixed";
var relayPartyUri = "https://localhost:8080/WebApp";
var factory = new WSTrustChannelFactory(
    new UserNameWSTrustBinding(SecurityMode.TransportWithMessageCredential),
    new EndpointAddress(stsEndpoint));
factory.TrustVersion = TrustVersion.WSTrust13;
// Username and Password here...
factory.Credentials.UserName.UserName = user;
factory.Credentials.UserName.Password = password;
var rst = new RequestSecurityToken 
{
    RequestType = RequestTypes.Issue,
    AppliesTo = new EndpointAddress(relayPartyUri),
    KeyType = KeyTypes.Bearer,
};
var channel = factory.CreateChannel();
SecurityToken token = channel.Issue(rst);
~~~
# More Information
