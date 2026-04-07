---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Window Devices/Microsoft Entra Hybrid Join/Device registration_Troubleshooting Windows 10 Automatic Device Registration"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FWindow%20Devices%2FMicrosoft%20Entra%20Hybrid%20Join%2FDevice%20registration_Troubleshooting%20Windows%2010%20Automatic%20Device%20Registration"
importDate: "2026-04-05"
type: troubleshooting-guide
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
The following guide is intended to guide you through troubleshooting Windows 10 automatic device registration with Azure Active Directory.

If you are looking for help with Azure AD Join, Add Work Account, or Windows 7/8 automatic device registration, please refer to the [Device Registration Overview](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/184217/Device-registration) page.

[[_TOC_]]

## Begin Here - Common Issues

You can begin by asking questions about these common customer issues. This can help optimize your troubleshooting by jumping directly to a known solution.

| Question                                                                                                                                                                                                                                                                                                                                                                                              | Solution                                                                                                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Has the customer followed the instructions for setting up Windows 10 Automatic Device Registration? If not, direct the customer to the instructions and provide them with an overview. Setting up automatic device registration takes some time and planning. It may be wise to close the ticket and ask the customer to reach out if they encounter issues during their planning and implementation. | [Setting up Windows 10 Automatic Device Registration](https://docs.microsoft.com/en-us/azure/active-directory/active-directory-conditional-access-automatic-device-registration-setup)                                          |
| Is the failure impacting all Windows 10 devices or only a sub-set? If it is impacting only a sub-set of Windows 10 devices then you can proceed directly to Gathering and reviewing logs.                                                                                                                                                                                                             | [\#Gathering and reviewing logs](#Gathering-and-reviewing-logs                                                                                                                                                                 |
| Does your school or workplace use an out-bound internet proxy? If yes, there are some known limitations to Windows 10 device registration and out-bound internet proxies.                                                                                                                                                                                                                             | [\#Verify outbound internet proxy configuration](#Verify-outbound-internet-proxy-configuration                                                                                                                                 |
| Does your school or workplace use AD FS with multiple verified domain names in Azure Active Directory? If so, the issue is likely with the device registration Issuance Transform rules.                                                                                                                                                                                                              | [\#Verify AD FS Device Registration Transform Rules](#Verify-AD-FS-Device-Registration-Transform-Rules                                                                                                                         |
| Does your school or workplace use AD FS with the alternate login Id configuration? I so, the issue is likely an issue with the ImmutableId Issuance Transform rule in AD FS.                                                                                                                                                                                                                          | [\#Verify AD FS ImmutableId Transform Rules](#Verify-AD-FS-ImmutableId-Transform-Rules                                                                                                                                         |
| Does your school or workplace use a 3rd party Identity Provider instead of AD FS? (Ex:Ping, Okta etc)                                                                                                                                                                                                                                                                                                 | Ensure that WS-Trust endpoints for username password authentication and Windows Integrated authentication are enabled. Refer to WS-Trust endpoint information for ADFS below to locate the equivalents for the third party STS. |



## Windows 10 Processes and Applications involved on PRT acquisition and usage
AAD WAM:   
PackageFamilyName : Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy  
C:\Windows\SystemApps\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\Microsoft.AAD.BrokerPlugin.exe

MSA WAM:  
PackageFamilyName : Microsoft.Windows.CloudExperienceHost_cw5n1h2txyewy  
C:\Windows\System32\WWAHost.exe (Generic Host Process)

Other Generic Host Processes Involved:  
C:\Windows\System32\backgroundTaskHost.exe (Used by All UWP applications)  
C:\Windows\System32\lsass.exe


 
## Verify the environment and configuration

If the customers issue is not found in the Common Issues section then proceed to verifying their environment and solution configuration.

If the customer is using AD FS with Azure AD then begin with the AD FS configuration.

  - [\#Verify AD FS Device Registration Transform Rules](#Verify-AD-FS-Device-Registration-Transform-Rules
  - [\#Verify AD FS ImmutableId Transform Rules](#Verify-AD-FS-ImmutableId-Transform-Rules
  - [\#Verify AD FS WS-Trust Endpoints](#Verify-AD-FS-WS-Trust-Endpoints
  - [\#Verify Outbound Network Connectivity](/index.php?title=curated:Curated:Device_registration/Troubleshooting_Windows_10_Automatic_Device_Registration&action=edit&redlink=1 "curated:Curated:Device registration/Troubleshooting Windows 10 Automatic Device Registration (page does not exist)")

Next, review the configuration that is common to all environments.

  - [\#Verify Device Registration Service Connection Point (SCP)](#Verify_Device_Registration_Service_Connection_Point_.28SCP.29)
  - [\#Gathering and reviewing logs](#Gathering-and-reviewing-logs

## Verify AD FS Device Registration Transform Rules

This section will help you verify that the AD FS issuance transform rules are properly configured. This will require some knowledge of AD FS rules language.

This section is only applicable if the customer is using AD FS with Azure Active Directory.

**NOTE** this is by far the most common cause of customer issues. Pay close attention and take your time as you review this configuration.

### Verify Issuance Transform rules

1.  Go to the AD FS server and open Windows PowerShell.
2.  Run: Get-ADFSRelyingPartyTrust -Name "Microsoft Office 365 Identity Platform" **NOTE** The customer may have renamed the Azure AD RP. Substitute the -Name parameter with the name assigned by the customer.
3.  Ask the customer to copy the output and send it to you so that you can review. Review the section titled IssuanceTransformRules.
4.  Make sure there an no duplicate rules. Each rule begins with @RuleName followed by the rule name. Often times customers run the set up scripts two or more times which results in duplicate rules.
5.  Use the sections below to verify the customer has the correct rules. NOTE, the customer may have assigned a different @RuleName, this ok as long as the issued claim is correct.

#### Issuance Rules for customers with multiple verified domain names

Customers with multiple verified domain names in Azure AD must have the following claim rules. **NOTE** The order is important. Make sure the rules are in the order below. The customer may have additional rules before or after these rules, and this is usually ok.

<table>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>Rule Name</th>
<th>Rule</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td style="vertical-align:top">Issue accounttype for domain-joined computers</td>
<td style="vertical-align:top"><div class="mw-highlight mw-content-ltr" dir="ltr">
<pre><code>c:[Type == &quot;http://schemas.microsoft.com/ws/2008/06/identity/claims/groupsid&quot;, Value =~ &quot;-515$&quot;, Issuer =~ &quot;^(AD AUTHORITY|SELF AUTHORITY|LOCAL AUTHORITY)$&quot;] =&gt; issue(Type = &quot;http://schemas.microsoft.com/ws/2012/01/accounttype&quot;, Value = &quot;DJ&quot;);</code></pre>
</div></td>
</tr>
<tr class="even">
<td style="vertical-align:top">Issue AccountType with the value USER when it is not a computer account</td>
<td style="vertical-align:top"><div class="mw-highlight mw-content-ltr" dir="ltr">
<pre><code>NOT EXISTS([Type == &quot;http://schemas.microsoft.com/ws/2012/01/accounttype&quot;, Value == &quot;DJ&quot;]) =&gt; add(Type = &quot;http://schemas.microsoft.com/ws/2012/01/accounttype&quot;, Value = &quot;User&quot;);</code></pre>
</div></td>
</tr>
<tr class="odd">
<td style="vertical-align:top">Issue issuerid when it is not a computer account</td>
<td style="vertical-align:top"><div class="mw-highlight mw-content-ltr" dir="ltr">
<pre><code>c1:[Type == &quot;http://schemas.xmlsoap.org/claims/UPN&quot;] &amp;&amp; c2:[Type == &quot;http://schemas.microsoft.com/ws/2012/01/accounttype&quot;, Value == &quot;User&quot;] =&gt; issue(Type = &quot;http://schemas.microsoft.com/ws/2008/06/identity/claims/issuerid&quot;, Value = regexreplace(c1.Value, &quot;.+@(?&lt;domain&gt;.+)&quot;, &quot;http://${domain}/adfs/services/trust/&quot;));</code></pre>
</div></td>
</tr>
<tr class="even">
<td style="vertical-align:top">Issue issuerid for DJ computer auth</td>
<td style="vertical-align:top"><div class="mw-highlight mw-content-ltr" dir="ltr">
<pre><code>c1:[Type == &quot;http://schemas.microsoft.com/ws/2012/01/accounttype&quot;, Value == &quot;DJ&quot;] =&gt; issue(Type = &quot;http://schemas.microsoft.com/ws/2008/06/identity/claims/issuerid&quot;, Value = &quot;http://verifiedDomainName/adfs/services/trust/&quot;);</code></pre>
</div>
Where <em><strong>verifiedDomainName</strong></em> is the customers verified domain name in Azure AD. For example: <em><strong>http://contoso.com/adfs/services/trust/</strong></em></td>
</tr>
<tr class="odd">
<td style="vertical-align:top">Issue onpremobjectguid for domain-joined computers</td>
<td style="vertical-align:top"><div class="mw-highlight mw-content-ltr" dir="ltr">
<pre><code>c1:[Type == &quot;http://schemas.microsoft.com/ws/2008/06/identity/claims/groupsid&quot;, Value =~ &quot;-515$&quot;, Issuer =~ &quot;^(AD AUTHORITY|SELF AUTHORITY|LOCAL AUTHORITY)$&quot;] &amp;&amp; c2:[Type == &quot;http://schemas.microsoft.com/ws/2008/06/identity/claims/windowsaccountname&quot;, Issuer =~ &quot;^(AD AUTHORITY|SELF AUTHORITY|LOCAL AUTHORITY)$&quot;] =&gt; issue(store = &quot;Active Directory&quot;, types = (&quot;http://schemas.microsoft.com/identity/claims/onpremobjectguid&quot;), query = &quot;;objectguid;{0}&quot;, param = c2.Value);</code></pre>
</div></td>
</tr>
<tr class="even">
<td style="vertical-align:top">Pass through primary SID</td>
<td style="vertical-align:top"><div class="mw-highlight mw-content-ltr" dir="ltr">
<pre><code>c1:[Type == &quot;http://schemas.microsoft.com/ws/2008/06/identity/claims/groupsid&quot;, Value =~ &quot;-515$&quot;, Issuer =~ &quot;^(AD AUTHORITY|SELF AUTHORITY|LOCAL AUTHORITY)$&quot;] &amp;&amp; c2:[Type == &quot;http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid&quot;, Issuer =~ &quot;^(AD AUTHORITY|SELF AUTHORITY|LOCAL AUTHORITY)$&quot;] =&gt; issue(claim = c2);</code></pre>
</div></td>
</tr>
</tbody>
</table>

#### Issuance Rules for customers with a single verified domain name

Customers with a single verified domain name must have the following claim rules. **NOTE** The order is important. Make sure the rules are in the order below. The customer may have additional claims before or after these rules, and this is usually ok.

<table>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>Rule Name</th>
<th>Rule</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td style="vertical-align:top">Issue accounttype for domain-joined computers</td>
<td style="vertical-align:top"><div class="mw-highlight mw-content-ltr" dir="ltr">
<pre><code>c:[Type == &quot;http://schemas.microsoft.com/ws/2008/06/identity/claims/groupsid&quot;, Value =~ &quot;-515$&quot;, Issuer =~ &quot;^(AD AUTHORITY|SELF AUTHORITY|LOCAL AUTHORITY)$&quot;] =&gt; issue(Type = &quot;http://schemas.microsoft.com/ws/2012/01/accounttype&quot;, Value = &quot;DJ&quot;);</code></pre>
</div></td>
</tr>
<tr class="even">
<td style="vertical-align:top">Issue onpremobjectguid for domain-joined computers</td>
<td style="vertical-align:top"><div class="mw-highlight mw-content-ltr" dir="ltr">
<pre><code>c1:[Type == &quot;http://schemas.microsoft.com/ws/2008/06/identity/claims/groupsid&quot;, Value =~ &quot;-515$&quot;, Issuer =~ &quot;^(AD AUTHORITY|SELF AUTHORITY|LOCAL AUTHORITY)$&quot;] &amp;&amp; c2:[Type == &quot;http://schemas.microsoft.com/ws/2008/06/identity/claims/windowsaccountname&quot;, Issuer =~ &quot;^(AD AUTHORITY|SELF AUTHORITY|LOCAL AUTHORITY)$&quot;] =&gt; issue(store = &quot;Active Directory&quot;, types = (&quot;http://schemas.microsoft.com/identity/claims/onpremobjectguid&quot;), query = &quot;;objectguid;{0}&quot;, param = c2.Value);</code></pre>
</div></td>
</tr>
<tr class="odd">
<td style="vertical-align:top">Pass through primary SID</td>
<td style="vertical-align:top"><div class="mw-highlight mw-content-ltr" dir="ltr">
<pre><code>c1:[Type == &quot;http://schemas.microsoft.com/ws/2008/06/identity/claims/groupsid&quot;, Value =~ &quot;-515$&quot;, Issuer =~ &quot;^(AD AUTHORITY|SELF AUTHORITY|LOCAL AUTHORITY)$&quot;] &amp;&amp; c2:[Type == &quot;http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid&quot;, Issuer =~ &quot;^(AD AUTHORITY|SELF AUTHORITY|LOCAL AUTHORITY)$&quot;] =&gt; issue(claim = c2);</code></pre>
</div></td>
</tr>
</tbody>
</table>

## Verify AD FS ImmutableId Transform Rules

If the customer is using AD FS with the alternate Id configuration, then it is likely that the ImmutableId issuance transform rule is not configured properly for device registration. It is good to check this in any case as some customers may have altered this rule for other reasons.

This section will help you verify that the AD FS ImmutableId transform rule is properly configured. This will require some knowledge of AD FS rules language.

This section is only applicable if the customer is using AD FS with Azure Active Directory.

### Review the transform rules

1.  Go to the AD FS server and open Windows PowerShell.
2.  Run: Get-ADFSRelyingPartyTrust -Name "Microsoft Office 365 Identity Platform" **NOTE** The customer may have renamed the Azure AD RP. Substitute the -Name parameter with the name assigned by the customer.
3.  Ask the customer to copy the output and send it to you so that you can review.
4.  Verify the ImmutableId rule in the IssuanceTransformRules section. This rule is usually named "Issue UPN and ImmutableId" and looks similar to the following rule:

<!-- end list -->

```
    c:[Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/windowsaccountname"] => issue(store = "Active Directory", types = ("http://schemas.xmlsoap.org/claims/UPN", "http://schemas.microsoft.com/LiveID/Federation/2008/05/ImmutableID"), query = "samAccountName={0};userPrincipalName,objectGUID;{1}", param = regexreplace(c.Value, "(?<domain>[^\\]+)\\(?<user>.+)", "${user}"), param = c.Value);
```

Pay close attention to the attribute that is used as the ImmutableId. By default, this is set to objectGUID. If the customer has changed this to an attribute other than objectGUID then device registration may be failing because the attribute used as the ImmutalbeId is not populated for computer account objects.

### How to fix

To resolve this, the customer must create two separate ImmutableId rules. One that applies to user account objects and one that applies to computer account objects:

1\. If it does not already exist, add the following rule to add the accountType claim for User objects. Be sure to add this below the accountType rule for DJ.

```
    NOT EXISTS([Type == "http://schemas.microsoft.com/ws/2012/01/accounttype", Value == "DJ"]) => add(Type = "http://schemas.microsoft.com/ws/2012/01/accounttype", Value = "User");
```

2\. Modify the existing ImmutableId rule. It should apply only to user accounts. Make sure you move this rule below the accountType rule you created in the previous step. The example below is using emailAddress as the ImmutableId. The customer must replace this with whichever attribute they are using as the ImmutableId.

```
    c:[Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/windowsaccountname"] && c2:[Type == "http://schemas.microsoft.com/ws/2012/01/accounttype", Value == "User"] => issue(store = "Active Directory", types =  ("http://schemas.xmlsoap.org/claims/UPN", "http://schemas.microsoft.com/LiveID/Federation/2008/05/ImmutableID"), query = "samAccountName={0};emailAddress,objectGUID;{1}", param = regexreplace(c.Value, "(?<domain>[^\\]+)\\(?<user>.+)", "${user}"), param = c.Value);
```

3\. Add a new ImmutableId rule that applies only to computer accounts. Again, make sure this is below the accountType rules.

```
    c:[Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/windowsaccountname"] && c2:[Type == "http://schemas.microsoft.com/ws/2012/01/accounttype", Value == "DJ"] => issue(store = "Active Directory", types = ("http://schemas.xmlsoap.org/claims/UPN", "http://schemas.microsoft.com/LiveID/Federation/2008/05/ImmutableID"), query = "samAccountName={0};userPrincipalName,objectGUID;{1}", param = regexreplace(c.Value, "(?<domain>[^\\]+)\\(?<user>.+)", "${user}"), param = c.Value);
```

## Verify AD FS WS-Trust Endpoints

This section will help you verify that the AD FS WS-Trust endpoints are properly configured. This will require some knowledge of AD FS rules language.

This section is only applicable if the customer is using AD FS with Azure Active Directory.

**Verify the following WS-Trust endpoints are enabled in the AD FS**

```
    /adfs/services/trust/2005/windowstransport 
    /adfs/services/trust/13/windowstransport 
    /adfs/services/trust/2005/usernamemixed
    /adfs/services/trust/13/usernamemixed
    /adfs/services/trust/2005/certificatemixed
    /adfs/services/trust/13/certificatemixed
```

To verify:

1.  Go to the AD FS server and open Windows PowerShell.
2.  Run: Get-AdfsEndpoint
3.  Ask the customer to copy the output and send it to you so that you can review.
4.  Verify that each of the endpoints above is enabled.

**Verify that all accounts, including computer accounts, are authorized to access the WS-Trust endpoints**

To verify:

1.  Go to the AD FS server and open Windows PowerShell.
2.  Run: Get-ADFSRelyingPartyTrust -Name "Microsoft Office 365 Identity Platform" **NOTE** The customer may have renamed the Azure AD RP. Substitute the -Name parameter with the name assigned by the customer.
3.  Ask the customer to copy the output and send it to you so that you can review.
4.  Verify the IssuanceAuthorizationRules section. The rules must permit both user and computer accounts.

## Verify Outbound Network Connectivity:

Make sure that the following URLs are accessible from computers inside your organization network for registration of computers to Azure AD:

  - **https://enterpriseregistration.windows.net**
  - **https://login.microsoftonline.com**
  - **https://device.login.microsoftonline.com**

If your organizations requires access to the Internet via an outbound proxy,

  - Web Proxy Auto-Discovery (**WPAD**) is required to enable Windows 10 computers to register to Azure AD only if you are using ***version 1703 or lower***.
  - Web Proxy Auto-Discovery (**WPAD**) is ***not*** required to enable Windows 10 computers to register to Azure AD only if you are using ***version 1709 or higher***.

Support for outbound proxies was added only in **1607** (Anniversary update). So, customer must use at least that version if they use outbound internet proxy.

## Verify Device Registration Service Connection Point (SCP)

This section will help you verify the Service Connection Point (SCP) is configured properly. The SCP is an object is published in the Active Directory Forest and is used by computers to discover and register with Azure AD.

**NOTE:** The SCP requirements are also available in the customer documentation located [here](https://docs.microsoft.com/en-us/azure/active-directory/devices/hybrid-azuread-join-manual#configure-a-service-connection-point).

**Verify the SCP object**

To Verify:

1.  Go to a domain joined PC and open Windows PowerShell.

2.  Run the following commands. NOTE it may helpful to email the customer these commands.
    
    ```
        $Root = [ADSI]"LDAP://RootDSE"
        
        $ConfigurationName = $Root.rootDomainNamingContext
        
        $scp = New-Object System.DirectoryServices.DirectoryEntry;
        
        $scp.Path = "LDAP://CN=62a0ff2e-97b9-4513-943f-0d221bd30080,CN=Device Registration Configuration,CN=Services,CN=Configuration," + $ConfigurationName;
        
        $scp.Keywords;
    ```

3.  Have the customer copy the output from $scp.Keywords and share with you.

4.  Verify the Keywords values. They should look similar to:
    
    ```
        azureADName:contoso.com

        azureADId:62f988bf-####-####-####-############


5.  The field names are case-sensitive. Make sure that they are exactly azureADName: and azureADId:

6.  The value for azureADName: should be the customers Azure AD domain name. If the customer is using AD FS with Azure AD then azureADName: must be set to the verified domain name in Azure AD. It must NOT be an "onmicrosoft.com" domain name. If the customer is not using AD FS then azureADName: can be any of the domain names configured in Azure AD, including the "onmicrosoft.com" domain name.

7.  Customer can't have onmicrosoft.com domain in the SCP with federated domain when they have Windows 10 version RS3 (1607) or older and Windows down-level. If the SCP contains the federated domain, the Windows OS 10 version RS4+ (1803) will try the WindowsTransport endpoint first and if the connection to it fails, it will fall back to not using WindowsTransport endpoint and will fall back to Azure AD SSO flow. Windows version RS3 and older must have access to WindowsTransport endpoint. **Note:** Windows 2016 is equivalent of Windows 10 1607. 

  
**Verify SCP object in multi-forest environments**

If the customer has Windows 10 computers in multiple Active Directory forests then they must create the SCP object in each forest root.

Repeat the steps to verify the SCP object in each Active Directory forest. If needed create the SCP object using the steps in the "How to fix" section.

**NOTE** this requires an Enterprise Administrator account.

If the customer is using Azure AD Connect, you can use the instructions located [here](https://docs.microsoft.com/en-us/azure/active-directory/active-directory-conditional-access-automatic-device-registration-setup). Follow the section titled: Step 1: Configure service connection point

If the customer is not using Azure AD Connect then you can manually create the SCP object using ADSI edit.

1. Go to a Domain Controller and open ADSI Edit.

1. Go to **Action \> Connect To:**

1. Choose **Select a well known naming context.** Choose **Configuration** from the drop down menu. Click Ok.

1. Navigate to **Services \> Device Registration Configuration**

1. Right click **Device Registration Configuration** and choose **New \> Object**

1. Scroll down and select **serviceConnectionPoint**. Then click **Next**.

1. In the Value: field, enter 62a0ff2e-97b9-4513-943f-0d221bd30080 then click **Next**.

1. Press the **More Attributes** button.

1. Select **keywords** from **Select a property to view.**

1. Enter azureADName:***yourDomain*** in **Edit Attribute** field. Where ***yourDomain*** is your Azure AD domain. 
_For example:_ azureADName:contoso.com. If you are using AD FS with Azure AD then this must be set to your verified domain name in Azure AD.

1. Click **Add** to add this to the Value(s) box below.

1. Enter azureADId:***yourTenantId*** in the Edit Attribute field. Where ***yourTenantId*** is your Azure AD tenant Id. _For example:_ azureADId:72f988bf-####-####-####-############

1. Click **Add** to add this to the **Value(s)** box below.

1. Click **Ok** and then **Finish**. The SCP object should now be visible under **Device Registration Configuration**.

## Verify outbound internet proxy configuration

There are some known limitations to Windows 10 device registration and out-bound internet proxies:

  - Support for out-bound internet proxy servers was added in the Windows 10 Anniversary Update (build 1607). You must use at least this version of Windows 10 if you wish to use an out-bound internet proxy.
  - Windows Automatic Proxy Detection (WPAD) is required for proxy detection if you are using Window 10 1703 or lower. You must have WPAD configured in your network for machines in 1703 or lower versions. WPAD is not required for 1709 or higher versions

**Note:** Cusomer may configure Proxy on user level not system level, therefore, device registration fails. The following steps provided by dev team on how to migrate the existing user proxy definitions to machine proxy configuration:

- Configure the proxy for the User and make sure it works for user as expected. 
- Import all registry keys from the path "**HKEY_CURRENT_USER**\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Connections"
to   "**HKEY_LOCAL_MACHINE**\SOFTWARE\Microsoft\Windows\CurrentVersion\Internet Settings\Connections"
- Import below registry keys if they exist
"**HKEY_CURRENT_USER**\Software\Microsoft\Windows\CurrentVersion\Internet Settings\"  
              "MigrateProxy"  
             "ProxyEnable"  
             "ProxyOverride"  
               "ProxyServer"  
             "AutoConfigURL"  

  to   "**HKEY_LOCAL_MACHINE**\SOFTWARE\Microsoft\Windows\CurrentVersion\Internet Settings\"  


**Note:** for deploying a PAC script (see [here](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FProxy_auto-config&data=04%7C01%7Cmozmaili%40microsoft.com%7Cbd87158109914de293f708d998ba39f3%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637708747928898436%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C1000&sdata=ogk1yMl3GKGU4y0mia1z%2B3Yads8JVIt74NfFzJ9FMfk%3D&reserved=0) for a basic intro to PAC files, which are not Microsoft-specific)
- The HTTP response for PAC must include Content-Type header
  - Content-Type: application/x-ns-proxy-autoconfig

- The script must export FindProxyForURLEx or FindProxyForURL function
  - Below example is exporting FindProxyForURLEx that unconditionally returns two proxies.  
function FindProxyForURLEx(url, host)  
{  
    return "PROXY <proxy server 1>:<port>;  PROXY <proxy server 2>:<port>; "  
}  

    More info can be found here:  
[WinHTTP AutoProxy Support - Win32 apps | Microsoft Docs](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fdocs.microsoft.com%2Fen-us%2Fwindows%2Fwin32%2Fwinhttp%2Fwinhttp-autoproxy-support&data=04%7C01%7Cmozmaili%40microsoft.com%7Cbd87158109914de293f708d998ba39f3%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637708747928908435%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C1000&sdata=eMJSolpHAZdFpYcIKUiFZVh%2F%2B%2F0hdZl5T5VPkjlVrpA%3D&reserved=0)


## Review scenarios with different on-prem and AAD UPNs

Please read the public doc below for this. 

  - <https://docs.microsoft.com/en-us/azure/active-directory/devices/hybrid-azuread-join-plan#on-premises-ad-upn-support-in-hybrid-azure-ad-join>

For the private preview scenario of routable on-prem UPN in managed environments, check with product group (Ravenn) for providing the script to customers. Considerations before this script can be given -

1.  Verify that on-prem UPN is syncing into AAD in the onpremisesUserPrincipalName attribute.
2.  Verify that hybrid Azure AD join is already configured correctly as Hybrid AADJ config has no dependency on user UPNs
3.  Does the customer also have non-routable UPNs? If so, clarify that non-routable UPNs are not supported in managed environments
4.  Is the customer planning to deploy SSPR on Win10 devices? If so, clarify that SSPR will not work if the UPNs are different

## Device Registration Status

It can be helpful to get the device registration status of the device. This device registration status is captured when you run the script to gather client side logs (see section: Gathering and reviewing logs). You can also see the device registration status by running the command: **dsregcmd /status** from an elevated command prompt. The output of the command is described in the table below.

### Device State

| Property         | Description                                                                                                                                                                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AzureAdJoined    | **YES** if the device is joined to Azure AD.                                                                                                                                                                                                   |
| EnterpriseJoined | **YES** if the device is joined to AD FS. This is part of an on-premises-only customer scenario where Windows Hello for Business is deployed and managed on-premises.                                                                          |
| DeviceId         | The unique device Id.Devices that are also joined to a traditional Active Directory domain (hybrid joined) will have a device id that matches the corresponding Active Directory computer object GUID.                                        |
| Thumbprint       | The X509 certificate thumbprint of the device identity certificate. The certificate is located in the LocalMachine\\My store.                                                                                                                  |
| KeyContainerId   | The unique Id assigned to the device key container.                                                                                                                                                                                            |
| KeyProvider      | The crypto provider used to store the device key.                                                                                                                                                                                              |
| TpmProtected     | **YES** if the device key is protected by TPM hardware.                                                                                                                                                                                        |
| KeySignTest      | **PASSED** if the device key is working as expected. The command MUST be run elevated to test this.                                                                                                                                            |
| Idp              | The Azure AD identity provider identifier. This is an identifier only, it is NOT the URI used for token requests.                                                                                                                              |
| TenantId         | The Azure AD tenant unique id.                                                                                                                                                                                                                 |
| TenantName       | The Azure AD tenant display name.                                                                                                                                                                                                              |
| AuthCodeUrl      | The Azure Active Directory authorization code Url that will be used by this device.                                                                                                                                                            |
| AccessTokenUrl   | The Azure Active Directory access token Url that will be used by this device.                                                                                                                                                                  |
| MdmUrl           | If the MDM auto-enrollment policy is configured, the device will use this Url to enroll with an MDM. The Url can be present even if the auto-enrollment policy is not configured.                                                              |
| MdmTouUrl        | The MDM terms of use Url.                                                                                                                                                                                                                      |
| MdmComplianceUrl | The MDM compliance Url.                                                                                                                                                                                                                        |
| SettingsUrl      | The URL used by the device to synchronize enterprise application settings and data.                                                                                                                                                            |
| DomainJoined     | **YES** if the device is joined to a traditional Active Directory Domain. If AzureAdJoined is also **YES** then the device is hybrid joined, meaning it is joined to both a Azure Active Directory and a traditional Active Directory Domain. |
| DomainName       | The NETBIOS domain name of the computers traditional Active Directory Domain.                                                                                                                                                                  |

### User State

<table>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>Property</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td style="vertical-align:top">NgcSet</td>
<td style="vertical-align:top"><strong>YES</strong> if the current user has created a Windows Hello for Business credential.</td>
</tr>
<tr class="even">
<td style="vertical-align:top">WorkplaceJoined</td>
<td style="vertical-align:top"><strong>YES</strong> if the current user has added a work or school account to their current profile. This setting is ignored by the system if the device is <strong>AzureAdJoined</strong>.</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">WorkplaceDeviceId</td>
<td style="vertical-align:top">The unique device Id assigned to the work or school account on this device. This setting is ignored by the system if the device is <strong>AzureAdJoined</strong>.</td>
</tr>
<tr class="even">
<td style="vertical-align:top">WorkplaceThumbprint</td>
<td style="vertical-align:top">The X509 certificate thumbprint of the device identity certificate. The certificate is located in the CurrentUser\My store. This setting is ignored by the system if the device is <strong>AzureAdJoined</strong>.</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">WamDefaultSet</td>
<td style="vertical-align:top"><strong>YES</strong> if the WebAccountManager has a default single-sign-in account available for the current user.
<p>If the current user is signed-in to the device with an Azure AD user account, the default single-sign-in account will be their Azure AD user account.</p>
<p>If the current user is signed in to the device with a Microsoft account, the default single-sign-in account will be their Microsoft account.</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top">WamDefaultAuthority</td>
<td style="vertical-align:top">The friendly name of the current user's WebAccountManager single-sign-in provider.</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">WamDefaultId</td>
<td style="vertical-align:top">The unique URI for the current user's WebAccountManager single-sign-in provider.</td>
</tr>
<tr class="even">
<td style="vertical-align:top">WamDefaultGUID</td>
<td style="vertical-align:top">The unique id for the current user's WebAccountManager single-sign-in provider.</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">AzureAdPrt</td>
<td style="vertical-align:top"><strong>YES</strong> if the current user has a Primary Refresh Token (PRT) for Azure AD. The PRT is used to provide SSO and access to Azure AD resources that are protected by conditional access policies.</td>
</tr>
<tr class="even">
<td style="vertical-align:top">AzureAdPrtAuthority</td>
<td style="vertical-align:top">The authority Uri for the Azure AD PRT.</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">EnterprisePrt</td>
<td style="vertical-align:top"><strong>YES</strong> if the current user has a Primary Refresh Token (PRT) for AD FS. The PRT is used to provide SSO and access to AD FS resources that are protected by conditional access policies. This is also required for Windows Hello for Business logon certificates.</td>
</tr>
<tr class="even">
<td style="vertical-align:top">EnterprisePrtAuthority</td>
<td style="vertical-align:top">The authority Uri for the AD FS PRT.</td>
</tr>
</tbody>
</table>

### Ngc Prerequisite Check

| Property           | Description                                                                                                                                                                                                                      |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IsUserAzureAD      | **YES** if the current user has a PRT for Azure AD.                                                                                                                                                                              |
| PolicyEnabled      | **YES** if the Windows Hello for Business policy is enabled.                                                                                                                                                                     |
| DeviceEligible     | **YES** if the device security hardware meets the minimum standards required for Windows Hello for Business.                                                                                                                     |
| SessionIsNotRemote | **YES** if the current session is not Remote Desktop. Windows Hello for Business can NOT be provisioned while running in remote sessions. This includes Hyper-V enhanced sessions.                                               |
| CertEnrollment     | Indicates the type of Windows Hello for Business logon certificate that is required. Normally this is used in hybrid on-premises/cloud deployments where the user will need to access on-premises resources.                     |
| AadRecoveryNeeded  | **YES** if the device is running in recovery mode. Recovery mode is a state where the device keys have been removed by some external operation and must be regenerated. This will prevent Windows Hello for Business enrollment. |
| PreReqResult       | **WillProvision** indicates that the current user will be allowed to enroll for Windows Hello for Business. This is the result when the above pre-requisites evaluate to **YES**.                                                |

### DSREGCMD diagnostics (Windows 10 1809)

Following document describes the new DSREGCMD diagnostics test section that should help identify registration issues faster - <https://microsoft.sharepoint.com/:w:/t/AADThreshold/EZvJH1-XssdEmc5rKuAYGakBwPzYRjWovoqcflxfFuXHOA?rtime=63gIkIez1kg>

## Gathering and reviewing logs

Use this section to gather logs from the client and server. This can take time so it is usually best to do this after you have gone through the environment and verified that everything is configured properly.

Download the diagnostics script and then send to the customer along with the instructions below: [ngc\_tracing\_public.rename](https://github.com/CSS-Windows/WindowsDiag/tree/master/ADS/AUTH)

### Client Side Logs

Please attempt to gather information about the steps taken that led to the problem.

1. Gather the required [auth scripts](https://cesdiagtools.blob.core.windows.net/windows/Auth.zip). See usage instructions if necessary at [KB4487175](https://internal.evergreen.microsoft.com/en-us/help/4487175).
2. Launch an elevated (admin) PowerShell prompt and change into folder where scripts are located. Start tracing via ".\Start-auth.ps1 -v -acceptEULA"
3. Reproduce the issue. (Run the "Automatic-Device-Join" scheduled task or log off and log-in)
4. Once issue is reproduced, launch ".\stop-auth.ps1" to stop tracing from an elevated PowerShell session. Wait for all tracing to stop completely.
5. Zip and upload the authlogs folder content to the DTM workspace associated with the support case.



### Server Side Logs

If you are using AD FS to register devices with Azure AD then it would be helpful to get these logs as well. Please collect AD FS logs when as the repro occurs.

1.  If you have multiple AD FS servers then you will need to put a hosts file in the client to direct it to a specific AD FS server.
2.  On the AD FS server, open Event Viewer and do **View \> Show Analytic and Debug Logs**
3.  Make sure the **AD FS Tracing \> Debug** log is enabled.
4.  Reproduce the issue. I.e. go to the client and retry the operation.
5.  Save and share the following logs. Choose English display language at the time of saving.
    1.  AD FS Tracing \> Debug
    2.  AD FS \> Admin

After you have gathered the logs, please collect the AD FS configuration information and share. Run the following Windows PowerShell Cmdlets and share the output:

  - Get-ADFSProperties
  - Get-ADFSEndpoint
  - Get-ADFSRelyingPartyTrust name \<The RP name used to represent the trust with Azure AD\>

### Reviewing the Logs

Begin reviewing the client logs provided by the customer. This section will help you identify log entries that indicate specific issues.

#### User Device Registration Logs

<table>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>Error code or Error message</th>
<th>Solution</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td style="vertical-align:top">NTE_INTERNAL_ERROR (0x8009002d)</td>
<td style="vertical-align:top">This might indicate that there is an issue with the TPM hardware on the device. Try the following in order to resolve:
<ol>
<li>Reset the TPM. Open tpm.msc on the client device and choose to clear or reset the TPM depending on the options available. This will require a reboot. Try to join again after the device boots up. <strong>NOTE</strong> this will clear any Windows Hello PINs the customer may have set. The customer may need to set up a new PIN once this is complete.</li>
<li>Ensure the TPM is in 2.0 mode. You will find this setting in the BIOS. The location varies based on device. Once you have enabled TPM 2.0 mode, try to join again.</li>
<li>As a last resort, you can try to join using software based keys. To do this, disable the TPM in your BIOS. Again, the location of this settings varies based on device. After the TPM is disabled, try to join again.</li>
</ol></td>
</tr>
<tr class="even">
<td style="vertical-align:top">The get join response operation callback failed with exit code: Unknown HResult Error code: 0x801c03f2 (DSREG_E_DIRECTORY_FAILURE)... The device object by the given id (<em>GUID</em>) is not found.</td>
<td style="vertical-align:top">Once domain joined, PCs will keep trying to automatically join Azure AD. It is expected that they will fail with this message until the computer account has synced from AD up to Azure AD. Depending on the customer configuration, it can be minutes or even hours before the computer is synced to Azure AD. Once the Computer account is synced to Azure AD, the join operation will succeed and this message will no longer be written to the event log.</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">TenantInfo::Discover: DsrBeginDiscover failed. 0x80072ee2 (WININET_E_TIMEOUT)</td>
<td style="vertical-align:top">This indicates a network failure. This could be caused by an out-bound internet http proxy. If the customer is using an out-bound http proxy then they must also set up WPAD based proxy discovery. They must also allow computer accounts to go through the proxy to the internet.
<p>You can test if the computer account has access to by doing the following:</p>
<ul>
<li>open a command prompt as System using: <strong>psexec -i -s cmd.exe</strong></li>
</ul>
<ul>
<li>Then launch internet explorer: "c:\Program Files\Internet Explorer\iexplore.exe"</li>
</ul>
<ul>
<li>Then try to navigate to the discovery url: https://enterpriseregistration.windows.net/<em><strong>verifiedDomain</strong></em>/enrollmentserver/contract?api-version=1.2</li>
</ul>
<p>Where <em><strong>verifiedDomain</strong></em> is the customers domain name. E.g. <a href="https://enterpriseregistration.windows.net/microsoft.com/enrollmentserver/contract?api-version=1.2" class="external free">https://enterpriseregistration.windows.net/microsoft.com/enrollmentserver/contract?api-version=1.2</a></p>
<p>If it is working you will see response similar to:</p>
<p>https://enterpriseregistration.windows.net/EnrollmentServer/DeviceEnrollmentWebService...</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top">ERROR_ADAL_FAILED_TO_PARSE_XML (0xcaa9002c)</td>
<td style="vertical-align:top">This usually indicates an issue with connecting to the AD FS farm. Verify the following:
<ol>
<li>The client has direct line of site to the AD FS farm. I.e. it is not coming from the internet.</li>
<li>The WSTrust windows endpoints are enabled in AD FS.</li>
<li>Windows integrated authentication is enabled as a primary authentication provider in AD FS</li>
<li>The value of the SCP discovery object is pointing to the proper AAD tenant. #Verify the Device Registration Service Connection Point (SCP)</li>
</ol></td>
</tr>
</tbody>
</table>

## Device Registration Troubleshooter Tool

Troubleshooting device registration issues is not hard anymore :)

DeviceRegTroubleshooter PowerShell performs more than 30 different tests that help to identify and fix the most common device registration issues for all join types (Hybrid Azure AD joined, Azure AD Joined and Azure AD Register).



**You can download the PowerShell script from the link:** <https://aka.ms/DSRegTool>

![DeviceRegTroubleshooter1.png](/.attachments/DeviceRegTroubleshooter1-dd368bad-e21f-4b06-9423-6b34cd5b830a.png)

For any feedback about the script, reach out to **mozmaili@microsoft.com**

## Checking Hybrid Azure AD Joined Devices Health Status

You can provide the customer with the following PowerShell script that checks the health status of hybrid Azure AD joined devices. This PowerShell script performs various tests on selected devices and shows the result on the Shell screen, grid view and generates HTML report.

**Why is this script useful?**

  - To check the hybrid status of specific device.
  - To check the hybrid status of a set of devices from TXT/CSV/XLS file.
  - To check the hybrid status of devices that are located in specific OU/Container.
  - To check the hybrid status of all devices in entire domain.
  - To automate a schedule task that checks the hybrid status of a set of devices.
  - To trace the changes (connection and disconnection) on hybrid devices.
  - To generate a friendly HTML report with the hybrid status.
  - To show the result on Grid View, so you can easily search in the result.

**What does this script do?**

1.  Checks the join status to the local AD.
2.  Checks the connection status to Azure AD.
3.  Checks the device certificate configuration.
4.  Checks the device existence in Azure AD.
5.  Checks the device status in Azure AD.
6.  Shows the health status of each device in various ways.
7.  Provides recommendations to fix unhealthy devices.

Also, the PowerShell script:

1.  Checks if **MSOnline** module is installed. If not, it installs and imports it.
2.  Checks if **ActiveDirectory** module is installed (when selecting **OU** parameter). If not, it installs and imports it.

**You can download the PowerShell script from the link:** <https://github.com/mzmaili/HybridDevicesHealthChecker>

**User experience:**

  - Checking specific device:
    <div class="thumb tnone">
    <div class="thumbinner" style="width:565px;">
    <br/><a href="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/cfcaa055-60bb-0e31-6101-7c77257dec75Checking-Device.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1" class="image"><img alt="Checking-Device.png" src="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/cfcaa055-60bb-0e31-6101-7c77257dec75Checking-Device.png" width="563" height="396" class="thumbimage"></a><br/>
    <div class="thumbcaption">
    <div class="magnify">
    
    </div>
    </div>
    </div>
    </div>

<!-- end list -->

  - Checking set of devices:
    <div class="thumb tnone">
    <div class="thumbinner" style="width:840px;">
    <br/><a href="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/caff0bfb-bf60-9c04-5b7f-ba340db0c71e838px-Checking-Devices.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1" class="image"><img alt="Checking-Devices.png" src="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/caff0bfb-bf60-9c04-5b7f-ba340db0c71e838px-Checking-Devices.png" width="838" height="478" class="thumbimage" srcset="/images/2/21/Checking-Devices.png 1.5x"></a><br/>
    <div class="thumbcaption">
    <div class="magnify">
    
    </div>
    </div>
    </div>
    </div>
  - The output report:

<div class="thumb tnone">

<div class="thumbinner" style="width:1447px;">

[![HTMLReport.png](/.attachments/16a4cbbf-d717-d89b-eec9-51863fc23bfbHTMLReport.png)](/.attachments/16a4cbbf-d717-d89b-eec9-51863fc23bfbHTMLReport.png)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

For any feedback about the script, reach out to **mozmaili@microsoft.com**

# Test Device Registration Connectivity

Test-DeviceRegConnectivity PowerShell script helps to test the Internet connectivity to the following Microsoft resources under the system context to validate the connection status between the device that needs to be connected to Azure AD as hybrid Azure AD joined device and Microsoft resources that are used during device registration process:

  - https://login.microsoftonline.com
  - https://device.login.microsoftonline.com
  - https://enterpriseregistration.windows.net

**Why is this script helpful?**

  - You dont need to rely on PS Exec tool to test the Internet connectivity under the system context, <u>you need just to run it as administrator</u>.
  - You dont need to collect network trace during device registration and analyze it to verify the Internet connectivity.
  - You dont need to check the Internet gateway (web proxy or firewall) to verify the Internet connectivity.

*<u>Using this script, Internet connectivity troubleshooting time will be reduced, and you need just to run it as administrator.</u>*

**You can download the PowerShell script from the link:** <https://docs.microsoft.com/en-us/samples/azure-samples/testdeviceregconnectivity/testdeviceregconnectivity/>

**User experience:**

  - When the test passes successfully:

<div class="thumb tnone">

<div class="thumbinner" style="width:421px;">

[![Pass.png](/.attachments/3a274710-4c32-6032-e66a-c449306a4de8Pass.png)](/.attachments/3a274710-4c32-6032-e66a-c449306a4de8Pass.png)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

  - When the test fails:

<div class="thumb tnone">

<div class="thumbinner" style="width:415px;">

[![F1.png](/.attachments/0795ce16-ccc1-1ebd-3c7f-724176497a51F1.png)](/.attachments/0795ce16-ccc1-1ebd-3c7f-724176497a51F1.png)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

<div class="thumb tnone">

<div class="thumbinner" style="width:479px;">

[![F2.png](/.attachments/0851ca67-c981-9369-6d31-d52e19a355c9F2.png)](/.attachments/0851ca67-c981-9369-6d31-d52e19a355c9F2.png)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

For any feedback about the script, reach out to **mozmaili@microsoft.com**

## Authentication flows table supported by Office Application

Below table shows the authentication flows supported by different Office Applications.

    Note: This table is subjected to change as and when the application change.

| Office App         | Win32 or UWP | HRD                               | RS2 Auth                        | RS3 Auth                        | RS4+ Auth                                                            | Me Control | Sovereign Cloud Supported       | Multi Account Support                       |
| ------------------ | ------------ | --------------------------------- | ------------------------------- | ------------------------------- | ------------------------------------------------------------------- | ---------- | ------------------------------- | ------------------------------------------- |
| W/X/P/O            | Win32        | Own Stack                         | ADAL on WAM                     | ADAL on WAM                     | WAM                                                                 | Own Stack  | All                             | Yes                                         |
| W/X/P/O            | UWP          | Own on Desktop but ADAL on Hub OS | ADAL on WAM                     | ADAL on WAM                     | WAM                                                                 | Windows    | BF in Hub, Gallatin/ITAR in RS4 | Yes                                         |
| OneDrive           | Win32        | ICE stack API                     | Own OAuth + (migrating to) ADAL | Own OAuth + (migrating to) ADAL | Own OAuth + (migrating to) ADAL \* dependent on reliability measure | NA         | All                             | N/A. Different sync client for each account |
| OneDrive           | UWP          | WAM                               | WAM                             | WAM                             | WAM                                                                 | NA         | BF                              | N/A. Different sync client for each account |
| Outlook            | Win32        | Own stack                         | ADAL on WAM                     | ADAL on WAM                     | WAM                                                                 | Own stack  | All                             | NA                                          |
| Outlook (Mail app) | UWP          | WAM                               | WAM                             | WAM                             | WAM                                                                 |            |                                 | NA                                          |
| Skype 4 Biz        | Win32        |                                   | ADAL                            | ADAL                            | ADAL                                                                |            |                                 | Yes                                         |
| Teams              | Win32        |                                   | ADAL                            | ADAL                            | WAM| Own stack  | ?                               | NA                                          |
| Teams              | UWP          |                                   | WAM                             | WAM                             | WAM                                                                 | Own stack  | ?                               | NA                                          |

  
If customer wants to integrate their applications with WAM then refer them to the below articles.
<https://docs.microsoft.com/en-us/windows/uwp/security/web-account-manager>
<https://github.com/Azure-Samples/active-directory-dotnet-native-uwp-wam>
<https://github.com/Microsoft/Windows-universal-samples>

  

## Troubleshooting workflows by scenario

### Windows 10 device registration is failing

You find Device registration fails on Windows 10 machine. To find the cause of the failure,
On the client, open event viewer and click on **View \> Show Analytic and Debug Logs**.
Browse to Application and Services logs \> Microsoft \> Windows \> User Device Registration \> Debug ****
Right click **Debug** and select **Enable**

In an Hybrid scenario Restart the client machine to reproduce the issue.
If it's Azure AD join then try to join the machine again.

On the client machine look at **Admin** event logs under "**Application and Service Logs \> Microsoft \> Windows \> User Device Registration**"
If you see the event

```
    Log Name:      Microsoft-Windows-User Device Registration/Admin
    Source:        Microsoft-Windows-User Device Registration
    Date:          <Date and Time>
    Event ID:      202
    Task Category: None
    Level:         Error
    Keywords:      
    User:          <User SID>
    Computer:      <Computer name>
    Description:
    The initialization of the join request failed with exit code: The TPM is attempting to execute a command only available when in FIPS mode.. Inputs:
     JoinRequest: 1 (DEVICE)
     Domain: <Domain name>
```

On the client machine look at Debug event logs under "Application and Service Logs \> Microsoft \> Windows \> User Device Registration"
If you see the event

```
    Log Name:      Microsoft-Windows-User Device Registration/Debug
    Source:        Microsoft-Windows-User Device Registration
    Date:          <Date and Time>
    Event ID:      502
    Task Category: None
    Level:         Error
    Keywords:      
    User:          <User SID>
    Computer:      <Computer name>
    Description:
    DsrBeginDeviceJoin: DeviceRegistrationApi::BeginJoin failed with error code: 0x80280036.
```

```
    The cause of the device registration failure is that the version 1.2 TPM is FIPS compliant.
    This error is returned when the TPM 1.2 device is a FIPS compliant TPM and the TPM command is used with parameters that are not FIPS compliant. 
    
    Examples for non-FIPS compliant use of the TPM are: a key is created that can be used to sign and encrypt/decrypt; trying to create a key with key length of less than 1024 bits; or creating a key without authorization value.
```

Currently FIPS Compliant version 1.2 TPM is not supported on Azure device registration. The TPM can be disabled as a work around.  

For more info on FIPS and TPM see the following Hello for Business page:

<https://www.csssupportwiki.com/index.php/curated:Windows_Hello_for_Business_and_TPMs#FIPS_mode>

``` 
 Note: This does not apply to TPM 2.0
```

**Product group is aware of this and is actively working at this problem for fixes, this needs more investigation.**

  

-----

  

### Windows 10 Hybrid Join failed - TPM issue

Get the device status to see if the device is Hybrid Joined or failed to Hybrid Join.
Execute the command **DSREGCMD /STATUS**

    If the device is Hybrid Joined the following will be set 
    AzureAdJoined: YES 
    DomainName: <on-prem Domain name> 
    
    If AzureAdJoined is set to NO then the device is not Hybrid Azure AD Joined.

**Troubleshooting**
Start looking at Event logs
Enable Debug and Analytic logs

  - Launch Event viewer
  - Click on **View** in the tool bar and select **Show Analytic and Debug logs**
  - Browse to **Application and Service logs \> Microsoft \> Windows \> User device registration \> Debug**"
  - Right **Debug** and select **Enable**

Reproduce the issue with one of the following
"Restart" the machine or log off" and "login back" or execute the command "DSREGCMD /DEBUG" under system context

``` 
 Note: You need to use PSEXEC.EXE to open a command prompt under system context to execute the command.
```

Look for event under "**Application and Service logs \> Microsoft \> Windows \> User device registration \> Admin**"

``` 
 Log Name:      Microsoft-Windows-User Device Registration/Admin
 Source:        Microsoft-Windows-User Device Registration
 Date:          <Date and Time>
 Event ID:      304
 Task Category: None
 Level:         Error
 Keywords:      
 User:          SYSTEM
 Computer:      <computer Name>
 Description:
 Automatic registration failed at join phase. 
 Exit code: Keyset does not exist 
 Server error: empty 
 Tenant type: joinMode: Join
 drsInstance: azure
 registrationType: sync
 tenantType: managed
 tenantId: <Tenant ID>
 configLocation: undefined
 errorPhase: join
 adalCorrelationId: undefined
 adalLog:
 undefined
 adalResponseCode: 0x0
 Registration type: %4 
 Debug Output: 
 %5

 Log Name:      Microsoft-Windows-User Device Registration/Admin
 Source:        Microsoft-Windows-User Device Registration
 Date:          <Date and Time>
 Event ID:      304
 Task Category: None
 Level:         Error
 Keywords:      
 User:          SYSTEM
 Computer:      <computer Name>
 Description: Automatic registration failed at join phase. 
 Exit code: The operation completed successfully. 
 Server error:  
 Tenant type: <Tenant Type> 
 Registration type: %4 
 Debug Output: 
 %5
```

Look for event under **Application and Service logs \> Microsoft \> Windows \> User device registration \> Debug**"

``` 
 Log Name:      Microsoft-Windows-User Device Registration/Debug
 Source:        Microsoft-Windows-User Device Registration
 Date:          <Date and Time>
 Event ID:      500
 Task Category: None
 Level:         Information
 Keywords:      
 User:          SYSTEM
 Computer:      <computer Name>
 Description:
 wmain: failed with error code 0x80090016.

 Log Name:      Microsoft-Windows-User Device Registration/Debug
 Source:        Microsoft-Windows-User Device Registration
 Date:          <Date and Time>
 Event ID:      500
 Task Category: None
 Level:         Information
 Keywords:      
 User:          SYSTEM
 Computer:      <computer Name>
 Description:
 DsrDeviceAutoJoin failed 0x80090016.

 Log Name:      Microsoft-Windows-User Device Registration/Debug
 Source:        Microsoft-Windows-User Device Registration
 Date:          <Date and Time>
 Event ID:      502
 Task Category: None
 Level:         Error
 Keywords:      
 User:          SYSTEM
 Computer:      <computer Name>
 Description: DsrCmdDeviceEnroller::AutoEnrollSync: DsrBeginDeviceAutoJoin failed with error code: 0x80090016.
```

  
The Error code **0x80090016** translates to "**Keyset does not exist**"
This means the device registration was not able to save the device key. The TPM keys were not accessible to encrypt the device keys.

There could be various reasons for this error. One of them is, if the Windows operating system is not the owner of the TPM. Starting with Windows 10, the operating system automatically initializes and takes ownership of the TPM. If this has failed for some reason the Windows will not be the owner.

**To fix this issue you need to clear / reset the TPM and reboot the machine.**
To clear / reset the TPM

    * Open the Windows Defender Security Center app.
    * Click Device security.
    * Click Security processor details.
    * Click Security processor troubleshooting.
    * Click Clear TPM.
    * You will be prompted to restart the computer. During the restart, you might be prompted by the UEFI to press a button to confirm that you wish to clear the TPM. After the PC restarts, your TPM will be automatically prepared for use by Windows 10.

  

    NOTE: Precautions to take before clearing the TPM
    Clearing the TPM can result in data loss. You will lose all created keys associated with the TPM, and data protected by those keys, such as a virtual smart card or a login PIN or Bitlocker keys.
    If Bitlocker is enabled on the device then ensure you disable bitlocker first.
    Make sure that you have a backup and recovery method for any data that is protected or encrypted by the TPM.

After the machine reboots Hybrid Join should be successful. To verify Get the device status, Execute the command **DSREGCMD /STATUS**
If Hybrid Join was successful the following will be set
AzureAdJoined: YES
DomainName: \<on-prem Domain name\>

If it's a managed domain then ensure you run a delta sync on the AAD Connect server after the Windows 10 client is up after the reboot. Once the delta sync completes log off and login back wait for couple of minutes and check the device status.
If it's still not hybrid joined then following the troubleshooting steps mentioned above to identify the cause of the failure.

  

-----

  

### Not able to get a PRT on a Hybrid Joined machine. The issue can occur on Azure AD Joined machine as well. - TPM issue

Not able to acquire a PRT can lead to various issues

    * Windows Hello for business not working
    * Conditional access failing
    * SSO not working.

One of the reasons for not able to acquire a PRT, issues with TPM and not able to access the TPM keys used to protect the device keys.

  

-----

  

### Windows 10 Hybrid join Fails in federated environment - Error 0xcaa82f8f

Windows 10 machines fail to Hybrid Join. The machine is domain joined but fails to join Azure AD.
To find the cause of the failure,
On the client, open event viewer and click on **View \> Show Analytic and Debug Logs**.
Browse to **Application and Services logs \> Microsoft \> Windows \> User Device Registration \> Debug**
Right click **Debug** and select **Enable**

Restart the Windows 10 machine to reproduce the issue.
To manually trigger hybrid join execute the command "**DSREGCMD /DEBUG**" under system context

    Note: You need to use PSEXEC.EXE to open a command prompt under system context to execute the command. You can download psexec from https://docs.microsoft.com/en-us/sysinternals/downloads/psexec

On the client machine look at **Debug** event logs under "**Application and Service Logs \> Microsoft \> Windows \> User Device Registration**"
If you see the event

```
    Log Name:      Microsoft-Windows-User Device Registration/Debug
    Source:        Microsoft-Windows-User Device Registration
    Date:          <Date and time>
    Event ID:      500
    Task Category: None
    Level:         Information
    Keywords:      
    User:          SYSTEM
    Computer:      <Machine name>
    Description:
    AdalMessage: ADALUseWindowsAuthenticationTenant failed,  unable to preform integrated auth
    AdalError: authentication_failed
    AdalErrorCode: 0xcaa82f8f
    AdalCorrelationId: {<ID>}
    AdalLog:  HRESULT: 0xcaa82f8f
    AdalLog:  HRESULT: 0xcaa9002b
    AdalLog:  HRESULT: 0x4aa90010
    AdalLog: AggregatedTokenRequest::UseWindowsIntegratedAuth w Tenant ; HRESULT: 0x0
    AdalLog: AggregatedTokenRequest::AcquireToken- returns false ; HRESULT: 0x0
    AdalLog: AggregatedTokenRequest::AcquireToken- refresh token is not available ; HRESULT: 0x0
    AdalLog: AggregatedTokenRequest::AcquireToken get refresh token info ; HRESULT: 0x0
    AdalLog: Authority validation is completed ; HRESULT: 0x0
    AdalLog: Authority validation is enabled ; HRESULT: 0x0
    AdalLog: Token is not available in the cache ; HRESULT: 0x0
```

  
The error **0xcaa82f8f** translates to **ERROR\_ADAL\_INTERNET\_SECURE\_FAILURE** - **One or more errors were found in the Secure Sockets Layer (SSL) certificate sent by the server.**

One of the reason for this error, the Windows 10 machine does not trust the Certificate presented by the ADFS server.
The Root certificate is missing from the trusted root store.

To fix this error,

    Make sure the root certificate of the ADFS service communication certificate is present in the trusted root store on the client.
    If ADFS service communication certificate is a self signed certificate then the certificate need to distribute to all the clients in the trusted root store.

-----

### Windows Hybrid Azure AD Join is happening when the customer does not want it to happen

Please send the customer the following link:<https://docs.microsoft.com/en-us/azure/active-directory/devices/hybrid-azuread-join-control> and close the support case immediately.

-----

  

### Windows 10 Hybrid join fails in a Managed domain

In a managed domain for Windows 10 device registration to work the computer object needs to be synced first. The registration process is as follows

  - Windows 10 machine boots for the first time after it's on-prem domain joined
  - The device registration is triggered and a certificate request is created.
  - When the request is created the public key of the certificate is published in on-prem AD for the computer object. This updates the attribute "usercertificate" on the computer objects.
  - At the same time the signed device registration request is sent to Azure AD.
  - The registration will fail as Azure AD cannot authenticate the computer object nor verify the signed request.

<!-- end list -->

  - Next time when the sync cycle runs it find the computer object with the attribute "usercertificate" populated and will sync the computer object to Azure AD as Device object along with the attribute "usercertificate".
  - Next time when the registration service is triggered (this runs every one hour) the computer will send a new request signed by the private key it created earlier.
  - Now Azure can verify the signature on the request using the public certificate is received from on-prem during the sync cycle.
  - If Azure AD is able to verify the signature on the request the device registration will succeed.

**We have seen 2 scenarios where the device registration can fail.**
**Scenario 1**

Windows 10 client Hybrid join failed.
On the client look for events under Application and Service Logs \> Microsoft \> Windows \> User Device Registration.

If you see the below event

```
    Log Name:      Microsoft-Windows-User Device Registration/Admin
    Source:        Microsoft-Windows-User Device Registration
    Date:          <Date and time>
    Event ID:      304
    Task Category: None
    Level:         Error
    Keywords:      
    User:          SYSTEM
    Computer:      <Computer name>
    Description:
    Automatic registration failed at join phase. 
    Exit code: Unknown HResult Error code: 0x801c03f2 
    Server error: empty 
    Tenant type: joinMode: Join
    drsInstance: azure
    registrationType: sync
    tenantType: managed
    tenantId: <tenanat ID>
    configLocation: undefined
    errorPhase: join
    adalCorrelationId: undefined
    adalLog:
    undefined
    adalResponseCode: 0x0
     
    Registration type: %4 
    Debug Output: 
    %5
    
    Log Name:      Microsoft-Windows-User Device Registration/Admin
    Source:        Microsoft-Windows-User Device Registration
    Date:          <Date and time>
    Event ID:      304
    Task Category: None
    Level:         Error
    Keywords:      
    User:          SYSTEM
    Computer:      <Computer name>
    Description:
    Automatic registration failed at join phase. 
    Exit code: Unknown HResult Error code: 0x801c03f2 
    Server error:  
    Tenant type: Managed 
    Registration type: %4 
    Debug Output: 
    %5
    
    Log Name:      Microsoft-Windows-User Device Registration/Admin
    Source:        Microsoft-Windows-User Device Registration
    Date:          <Date and time>
    Event ID:      204
    Task Category: None
    Level:         Error
    Keywords:      
    User:          SYSTEM
    Computer:      <Computer name>
    Description:
    The get join response operation callback failed with exit code: Unknown HResult Error code: 0x801c03f2. 
    Activity Id: <Activity Id> 
    The server returned HTTP status: 400 
    Server response was: {"ErrorType":"DirectoryError","Message":"The public key user certificate is not found on the device object with id: (<DeviceID).","TraceId":"TraceId","Time":"<Date and time>"}
```

If you see the event with the description "**The public key user certificate is not found on the device object with id \<DeviceID\>**" follow the below steps

  - In the On-prem AD ensure the attribute "Usercertificate" is populated and has the correct certificate.
  - Look at backend device object using GME or ASC and ensure the attribute "Usercertificate" exists and is populated.

If the certificate is missing or someone delete the certificate from the on-prem AD whcih in-turn delete the certificate from Azure AD the device registration will fail with the event "The public key user certificate is not found on the device object with id \<DeviceID\>"

To fix this.

  - Open command prompt as administrator.
  - Execute the command "dsregcmd /leave".
  - Open the computer certificate store using "certlm.msc"
  - Ensure the computer certificate with the issuer "MS-Organization-Access" is deleted.
  - If the certificate exists and then delete the certificate.
  - Restart the client.

The restart should trigger a fresh device registration.
Ensure the new certificate public key is updated on the computer object in On-prem AD. If there are multiple domain controllers then ensure the attribute is replicated to all the DC's.
Trigger a delta sync on the AAD Connect server.
Once the sync is complete you can trigger device registration by either **restarting the machine** or executing the command **dsregcmd /debug** or running the schedule task "**Automatic-Device-Join**" under 'Workplace Join".

  
**Scenario 2**

Windows 10 client Hybrid join failed.
On the client look for events under Application and Service Logs \> Microsoft \> Windows \> User Device Registration.
If you see the below event

```
    Log Name:      Microsoft-Windows-User Device Registration/Admin
    Source:        Microsoft-Windows-User Device Registration
    Date:          <Date and time>
    Event ID:      304
    Task Category: None
    Level:         Error
    Keywords:      
    User:          SYSTEM
    Computer:      <Computer name>
    Description:
    Automatic registration failed at join phase. 
    Exit code: Unknown HResult Error code: 0x801c03f2 
    Server error: empty 
    Tenant type: joinMode: Join
    drsInstance: azure
    registrationType: sync
    tenantType: managed
    tenantId: <tenanat ID>
    configLocation: undefined
    errorPhase: join
    adalCorrelationId: undefined
    adalLog:
    undefined
    adalResponseCode: 0x0
     
    Registration type: %4 
    Debug Output: 
    %5
    
    Log Name:      Microsoft-Windows-User Device Registration/Admin
    Source:        Microsoft-Windows-User Device Registration
    Date:          <Date and time>
    Event ID:      304
    Task Category: None
    Level:         Error
    Keywords:      
    User:          SYSTEM
    Computer:      <Computer name>
    Description:
    Automatic registration failed at join phase. 
    Exit code: Unknown HResult Error code: 0x801c03f2 
    Server error:  
    Tenant type: Managed 
    Registration type: %4 
    Debug Output: 
    %5
    
    Log Name:      Microsoft-Windows-User Device Registration/Admin
    Source:        Microsoft-Windows-User Device Registration
    Date:          <Date and time>
    Event ID:      204
    Task Category: None
    Level:         Error
    Keywords:      
    User:          SYSTEM
    Computer:      <Computer name>
    Description:
    The get join response operation callback failed with exit code: Unknown HResult Error code: 0x801c03f2. 
    Activity Id: <Activity Id> 
    The server returned HTTP status: 400 
    Server response was: {"ErrorType":"DirectoryError","Message":"The device object by the given id (<Device ID>) is not found.","TraceId":<TraceID>,"Time":"<Date and time>"}
```

In this scenario Azure AD was not able to find the Device Object in the tenant.

  - Ensure the computer object has the attribute "Usercertificate" populated in on-prem AD. If this attribute is not populated then the computer object will never sync to Azure AD.
  - Search the AAD Connect metaverse to see the device actually synced to Azure AD.
  - Verify the Device Object is present in Azure AD using ASC or GME or the customer portal.
  - Someone might have deleted the Device Object.

If the Device object is missing in Azure AD then

  - Open command prompt as administrator.
  - Execute the command "dsregcmd /leave".
  - Open the computer certificate store using "certlm.msc"
  - Ensure the computer certificate with the issuer "MS-Organization-Access" is deleted.
  - If the certificate exists and then delete the certificate.
  - Restart the client.

The restart should trigger a fresh device registration.
Ensure the new certificate public key is updated on the computer object in On-prem AD. If there are multiple domain controllers then ensure the attribute is replicated to all the DC's.
Trigger a delta sync on the AAD Connect server.
Once the sync is complete you can trigger device registration by either **restarting the machine** or executing the command **dsregcmd /debug** or running the schedule task "**Automatic-Device-Join**" under 'Workplace Join".

If the Device Object is present in Azure AD then
**Ensure the object ID seen in the event 204 is the same present in Azure AD.**
If this looks good then file an ICM to engage the PG. Follow <https://microsoft.sharepoint.com/teams/CloudIdentityPOD/SitePages/CID%20CRI%20Template%20List.aspx>

-----

### Device is Hybrid Joined after being Workplace joined first

As a result the same device appears joined two times in AAD portal. It can also have other side effects of causing conditional access issues if for example policies require AAD joined devices.

This state can happen if the device was workplace joined first (either by performing "Add work or school account" from Settings, or the more common, by going through UI flow in an application and choosing to add the account to Windows during the UI flow). And the same device was Hybrid Joined at a later time. This can happen in these 2 cases:

\- Enterprise has enabled Hybrid Join at a later time and devices were already joined through an application or Settings.

\- Enterprise devices are configured to be Hybrid Joined, but right after device was Domain Joined, user authenticated through an application and performed workplace join before the Hybrid Join had a chance to complete.

In both cases the device is in a state where there are 2 device registrations and both are showing in AAD portal.

**Solutions to clean up this state**:

\- Customer devices are upgraded to RS5. This is automatically fix the state as we have implemented automatic workplace join cleanup when device is Hybrid Joined as well.

\- Customer unjoins the device from Hybrid (could be done through "dsregcmd /leave" command in an Admin command prompt) and then disconnects the workplace joined state from Settings. This option requires manual steps on each device.

\- Run a [Cleanup tool](https://microsoft.sharepoint.com/teams/AADThreshold/Shared%20Documents/Forms/AllItems.aspx?viewid=42afb663%2D6e1f%2D486e%2Db740%2Db49b5dfccea4&id=%2Fteams%2FAADThreshold%2FShared%20Documents%2FWPJCleanUp). IT Admin can push the tool through group policy and execute it on the client device. The tool (cleanup.cmd) will unjoin the device and remove the workplace account. The device will then rejoin Hybrid automatically on next sign-in.

On RS5 and later we have implemented a policy through a registry key to block Workplace Join. It will prevent applications from showing the option to add the account to windows and will also block adding the account from Settings. The registry key is under HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WorkplaceJoin, create a REG\_DWORD value BlockAADWorkplaceJoin = 1.

-----

  

### Hybrid Join fails on Windows 10 Machines that are build 1709 and below in a Federated environment

Windows 10 machines fail to Hybrid Join. The machine is domain joined but fails to join Azure AD. To find the cause of the failure, On the client, open event viewer and click on **View \> Show Analytic and Debug Logs**. Browse to **Application and Services logs \> Microsoft \> Windows \> User Device Registration\> Debug** Right click **Debug and select Enable**
Restart the Windows 10 machine to reproduce the issue. To manually trigger hybrid join execute the command "DSREGCMD /DEBUG" under system context

    Note: You need to use PSEXEC.EXE to open a command prompt under system context to execute the command. You can download psexec from https://docs.microsoft.com/en-us/sysinternals/downloads/psexec

On the client machine look at Debug event logs under "**Application and Service Logs \> Microsoft \> Windows \> User Device Registration**" If you see the below events

```
    Log Name:      Microsoft-Windows-User Device Registration/Admin
    Source:        Microsoft-Windows-User Device Registration
    Date:          <Date and Time>
    Event ID:      304
    Task Category: None
    Level:         Error
    Keywords:      
    User:          SYSTEM
    Computer:      <Computer Name>
    Description:
    Automatic registration failed at join phase. 
    Exit code: Unknown HResult Error code: 0xcaa1000e 
    Server error:  
    Tenant type: Federated 
    Registration type: fed 
    Debug Output: 
    joinMode: Join
    drsInstance: azure
    registrationType: fed
    tenantType: Federated
    tenantId: <Tenant ID>
    configLocation: undefined
    errorPhase: auth
    adalCorrelationId: {CorrelationId}
    adalLog:
    AdalLog:  HRESULT: 0xcaa1000e
    AdalLog:  HRESULT: 0xcaa9002c
    AdalLog:  HRESULT: 0xcaa9002c
    AdalLog:  HRESULT: 0xcaa9002c
    AdalLog:  HRESULT: 0x4aa90010
    AdalLog: AggregatedTokenRequest::GetAppliesTo: using resource ID "urn:federation:MicrosoftOnline" for authority "https://login.microsoftonline.com/common". ; HRESULT: 0x0
    AdalLog: AggregatedTokenRequest::UseWindowsIntegratedAuth- received realm info ; HRESULT: 0x0
    AdalLog:  HRESULT: 0x4aa90010
    AdalLog: AggregatedTokenRequest::UseWindowsIntegratedAuth w Tenant ; HRESULT: 0x0
    AdalLog: AggregatedTokenRequest::AcquireToken- returns false ; HRESULT: 0x0
    AdalLog: AggregatedTokenRequest::AcquireToken- refresh token is not available ; HRESULT: 0x0
    AdalLog: AggregatedTokenRequest::AcquireToken get refresh token info ; HRESULT: 0x0
    AdalLog: Authority validation is completed ; HRESULT: 0x0
    AdalLog: Authority validation is enabled ; HRESULT: 0x0
    AdalLog: Token is not available in the cache ; HRESULT: 0x0
    
    adalResponseCode: 0xcaa1000e
    
    
    
    Log Name:      Microsoft-Windows-User Device Registration/Admin
    Source:        Microsoft-Windows-User Device Registration
    Date:          <Date and Time>
    Event ID:      305
    Task Category: None
    Level:         Error
    Keywords:      
    User:          SYSTEM
    Computer:      <Computer Name>
    Description:
    Automatic registration failed at authentication phase. Unable to acquire access token. 
    Exit code: Unknown HResult Error code: 0xcaa9002c 
    Tenant Name: icicilombard.com 
    Tenant Type: Federated 
    Server error: 
    AdalMessage: ADALUseWindowsAuthenticationTenant failed,  unable to preform integrated auth
    AdalErrorCode: 0xcaa9002c
    AdalCorrelationId: {CorrelationId}
    AdalLog:  HRESULT: 0xcaa9002c
    AdalLog:  HRESULT: 0xcaa9002c
    AdalLog:  HRESULT: 0xcaa9002c
    AdalLog:  HRESULT: 0x4aa90010
    AdalLog: AggregatedTokenRequest::GetAppliesTo: using resource ID "urn:federation:MicrosoftOnline" for authority "https://login.microsoftonline.com/common". ; HRESULT: 0x0
    AdalLog: AggregatedTokenRequest::UseWindowsIntegratedAuth- received realm info ; HRESULT: 0x0
    AdalLog:  HRESULT: 0x4aa90010
    AdalLog: AggregatedTokenRequest::UseWindowsIntegratedAuth w Tenant ; HRESULT: 0x0
    AdalLog: AggregatedTokenRequest::AcquireToken- returns false ; HRESULT: 0x0
    AdalLog: AggregatedTokenRequest::AcquireToken- refresh token is not available ; HRESULT: 0x0
    AdalLog: AggregatedTokenRequest::AcquireToken get refresh token info ; HRESULT: 0x0
    AdalLog: Authority validation is completed ; HRESULT: 0x0
    AdalLog: Authority validation is enabled ; HRESULT: 0x0
    AdalLog: Token is not available in the cache ; HRESULT: 0x0
```

  

    AND if you see the below output when you run dsregcmd /Debug under system context

```
    dsregcmd::wmain logging initialized.
    DsrCmdAccountMgr::IsDomainControllerAvailable: DsGetDcName success { domain:domain.com forest:domain.com domainController:\\<DC Name>.domain.com isDcAvailable:true }
    PreJoinChecks Complete.
    preCheckResult: Join
    isPrivateKeyFound: undefined
    isJoined: undefined
    isDcAvailable: YES
    isSystem: YES
    keyProvider: undefined
    keyContainer: undefined
    dsrInstance: undefined
    elapsedSeconds: 0
    resultCode: 0x0
    Automatic device join pre-check tasks completed.
    TenantInfo::Discover: Join Info { TenantType = Federated; AutoJoinEnabled = 1; TenandID = <TenandID>; TenantName = <TenantName> }
    GetComputerTokenForADRS: Get token for ADRS
    GetComputerTokenForADRS: Auth code URL: "https://login.microsoftonline.com/TenandID/oauth2/authorize"
    GetComputerTokenForADRS: Token request authority: "https://login.microsoftonline.com/common"
    AdalLog: Token is not available in the cache ; HRESULT: 0x0
    AdalLog: Authority validation is enabled ; HRESULT: 0x0
    AdalLog: Authority validation is completed ; HRESULT: 0x0
    AdalLog: AggregatedTokenRequest::AcquireToken get refresh token info ; HRESULT: 0x0
    AdalLog: AggregatedTokenRequest::AcquireToken- refresh token is not available ; HRESULT: 0x0
    AdalLog: AggregatedTokenRequest::AcquireToken- returns false ; HRESULT: 0x0
    AdalLog: AggregatedTokenRequest::UseWindowsIntegratedAuth w Tenant ; HRESULT: 0x0
    AdalLog:  HRESULT: 0x4aa90010
    AdalLog: AggregatedTokenRequest::UseWindowsIntegratedAuth- received realm info ; HRESULT: 0x0
    AdalLog: AggregatedTokenRequest::GetAppliesTo: using resource ID "urn:federation:MicrosoftOnline" for authority "https://login.microsoftonline.com/common". ; HRESULT: 0x0
    AdalLog:  HRESULT: 0x4aa90010
    AdalLog:  HRESULT: 0xcaa9002c
    AdalLog:  HRESULT: 0xcaa9002c
    AdalLog:  HRESULT: 0xcaa9002c
    LogFatalAuthError: AdalMessage: ADALUseWindowsAuthenticationTenant failed,  unable to preform integrated auth
    AdalErrorCode: 0xcaa9002c
    AdalCorrelationId: {CorrelationId}
    AdalLog:  HRESULT: 0xcaa9002c
    AdalLog:  HRESULT: 0xcaa9002c
    AdalLog:  HRESULT: 0xcaa9002c
    AdalLog:  HRESULT: 0x4aa90010
    AdalLog: AggregatedTokenRequest::GetAppliesTo: using resource ID "urn:federation:MicrosoftOnline" for authority "https://login.microsoftonline.com/common". ; HRESULT: 0x0
    AdalLog: AggregatedTokenRequest::UseWindowsIntegratedAuth- received realm info ; HRESULT: 0x0
    AdalLog:  HRESULT: 0x4aa90010
    AdalLog: AggregatedTokenRequest::UseWindowsIntegratedAuth w Tenant ; HRESULT: 0x0
    AdalLog: AggregatedTokenRequest::AcquireToken- returns false ; HRESULT: 0x0
    AdalLog: AggregatedTokenRequest::AcquireToken- refresh token is not available ; HRESULT: 0x0
    AdalLog: AggregatedTokenRequest::AcquireToken get refresh token info ; HRESULT: 0x0
    AdalLog: Authority validation is completed ; HRESULT: 0x0
    AdalLog: Authority validation is enabled ; HRESULT: 0x0
    AdalLog: Token is not available in the cache ; HRESULT: 0x0
    AdalLog:  HRESULT: 0xcaa1000e
    AutoEnrollAsComputer: Unable to retrieve access token. GetComputerTokenForADRS failed with error 0xcaa9002c.
    DsrCmdJoinHelper::Join: Federated ADRS join failed with error 0xcaa1000e. Try synchronized join.
    Join request ID: <request ID>
    Join response time: <Date and Time>
    Join HTTP status: 400
    Join error code: DirectoryError
    Join message: The device object by the given id (Device ID) is not found.
    DsrDeviceAutoJoin failed 0x801c03f2.
    DsrCmdJoinHelper::Join: DsrCmdDeviceEnroller::AutoEnrollSync failed with error code 0x801c03f2.
    DSREGCMD_END_STATUS
                 AzureAdJoined : NO
              EnterpriseJoined : NO
```

The device registration fails because the Claims issued by ADFS are not proper. In most cases the federation trust is created using support multiple domains switch. This creates the below claim rule on the relying party "**Microsoft Office 365 Identity Platform**"

```
    c:[Type == "http://schemas.xmlsoap.org/claims/UPN"]
    => issue(Type = "http://schemas.microsoft.com/ws/2008/06/identity/claims/issuerid", Value = regexreplace(c.Value, ".+@(
    ?<domain>.+)", "http://${domain}/adfs/services/trust/"));
```

If customer has created all the claim rules needed for Hybrid Join manually then they forget to delete the above claim rule. And Hybrid join fails.

  
**Fix**

Ensure the claim rules are configured using the below articles
<https://docs.microsoft.com/en-us/azure/active-directory/devices/hybrid-azuread-join-manual>

If customer has AAD Connect and they are comfortable managing ADFS using AAD Connect then follow
<https://docs.microsoft.com/en-us/azure/active-directory/devices/hybrid-azuread-join-federated-domains>

    Note: Windows 10 clients with Build 1803 and above can fall back to AAD Connect to complete the sync of the computer object and on the next registration interval the device registration will succeed.

-----

### Device is in a dual state with Hybrid AAD join and AAD registered

Review the output of dsregcmd /status to verify if the device is in a dual state.From Windows 10 1809 release, the following changes have been made to avoid this dual state:

  - Any existing Azure AD registered state would be automatically removed after the device is Hybrid Azure AD joined. This happens even if the device is upgraded from a previous version
  - You can prevent your domain joined device from being Azure AD registered by adding this registry key - HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WorkplaceJoin, "BlockAADWorkplaceJoin"=dword:00000001.
  - This change is also available for **Windows 10 1803 with KB4489894 applied (April 2019 patch)**.
      - If customer has Windows Hello for Business configured, the user will be asked to re-setup Windows Hello for Business after the dual state clean up.

***Customers on 1803 (with the above patch) and 1809 releases do not need to take any action to clean up the dual state. It happens automatically. The clean up happens automatically even on upgrades from previous versions.***

For 1709, here's how the AAD registered state clean up can be done

  - If the device is not Hybrid AAD joined yet, provide the clean up tool to the customer specified [here](https://microsoft.sharepoint.com/teams/AADThreshold/Shared%20Documents/Forms/AllItems.aspx?viewid=42afb663%2D6e1f%2D486e%2Db740%2Db49b5dfccea4&id=%2Fteams%2FAADThreshold%2FShared%20Documents%2FWPJCleanUp) under RS3 folder. There's a separate cleanup tool based on the processor architecture 64-bit or 32-bit, provide the appropriate one to the customer
  - If the device is already Hybrid AAD joined, the customer needs to unjoin from AAD using dsregcmd /leave and then run the cleanup tool mentioned above. Only running the tool in this case will not resolve the issue.

**Note:** We identified some scenarios where the user is seeing "Your organization has deleted the device..." prompt after the dual state clean up. This seems to happen as a result of a registry setting that is left behind.

The recommended approach is to delete the contents from the registry HKEY\_CURRENT\_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\AAD\\Storage\\ to fix the issue

-----

  

### Windows 10 shows on-premise domain joined and Azure AD Joined / Registered under "Access work or school" on Hybrid Joined clients

Windows 10 shows on-premise domain joined and Azure AD Joined / Registered under "Access work or school" on Hybrid Joined clients when the client switches to a public network.

**Cause** - This is a UI bug. Product group is aware of this and working on it. (No ETA as of now)

  
**Steps to reproduce the behavior.**

  - Windows 10 client is connected to the organization network and is Hybrid joined.

<!-- end list -->

``` 
 Confirm with output of dsregcmd /status
 AzureAdJoined: YES
 DomainJoined: YES
 DomainName: <Domain Name>
```

  - When you browse to **Settings \> Accounts \> Access work or school** you should see only the domain name as below

[![Settings.png](/.attachments/1eb2586f-3ac2-d5d7-12b4-f17701308776400px-Settings.png)](/.attachments/1eb2586f-3ac2-d5d7-12b4-f17701308776400px-Settings.png)

  

  - Enable hotspot on a mobile device to access the internet.
  - Switch the client network connection to the mobile hotspot.
  - Restart the machine
  - Ensure the machine is still connected to the mobile hotspot.
  - Open settings \> Accounts \> Access work or school
  - You will see the work account as seen below

[![Settings.png](/.attachments/1eb2586f-3ac2-d5d7-12b4-f17701308776400px-Settings.png)](/.attachments/1eb2586f-3ac2-d5d7-12b4-f17701308776400px-Settings.png)

  

When you select the work account and click on Disconnect you will walk through the process of disjoining a that is Azure AD Joined, as seen below.

[![Settings.png](/.attachments/1eb2586f-3ac2-d5d7-12b4-f17701308776400px-Settings.png)](/.attachments/1eb2586f-3ac2-d5d7-12b4-f17701308776400px-Settings.png)

  
[![Settings.png](/.attachments/1eb2586f-3ac2-d5d7-12b4-f17701308776400px-Settings.png)](/.attachments/1eb2586f-3ac2-d5d7-12b4-f17701308776400px-Settings.png)

  
[![Settings.png](/.attachments/1eb2586f-3ac2-d5d7-12b4-f17701308776400px-Settings.png)](/.attachments/1eb2586f-3ac2-d5d7-12b4-f17701308776400px-Settings.png)

  
[![Settings.png](/.attachments/1eb2586f-3ac2-d5d7-12b4-f17701308776400px-Settings.png)](/.attachments/1eb2586f-3ac2-d5d7-12b4-f17701308776400px-Settings.png)

  

**Product group is aware of this and working on it. (No ETA as of now)**

  

-----

  

### Windows 10 client loses the Hybrid join state

**Issue - "Windows 10 loses the Hybrid join state after migrating users profile using USMT"**

**Scenario  Below are the scenarios the issue has been reported on**

``` 
   "Migrating Users profile from one Hybrid join Machine to another Hybrid join machine."
   "Migrating Users profile from non-Hybrid join Machine to a Hybrid join machine."
```

  
**Cause ** Theres a problem with this migration path in USMT due to which the hybrid state on the device is lost.

**Product group is aware of this and have recommended the following work around.**

``` 
 Migrate the users Profile before the Windows 10 device is hybrid joined. Later enable Hybrid join. 
 If in case the destination Windows 10 device is hybrid join then after the User profile Migration is complete the device will try to recover by initiating registration and once again get hybrid joined, based on the schedule task. To expedite the process either reboot the machine or sign out and sign back to the device.
```


-----

### Windows 10 Hybrid join fails in federated environment  
**This applies to Windows 10 Builds 1709 and below.**

The machine is domain joined but fails to join Azure AD. To find the cause of the failure, 
On the client, open event viewer and click on **View > Show Analytic and Debug Logs**. 
Browse to **Application and Services logs > Microsoft > Windows > User Device Registration > Debug** Right click **Debug** and select **Enable**

Restart the Windows 10 machine to reproduce the issue. 
To manually trigger hybrid join execute the command **"DSREGCMD /DEBUG"** under system context OR run the Schedule task **Automatic-Device-Join** as an Administrator.

``` 
   Note: You need to use PSEXEC.EXE to open a command prompt under system context to execute the command. You can download psexec from <https://docs.microsoft.com/en-us/sysinternals/downloads/psexec>
```

On the client machine look at Admin event logs under **"Application and Service Logs > Microsoft > Windows > User Device Registration"** If you see the event

```
    Log Name:      Microsoft-Windows-User Device Registration/Admin
    Source:        Microsoft-Windows-User Device Registration
    Date:          <Date and Time>
    Event ID:      304
    Task Category: None
    Level:         Error
    Keywords:      
    User:          SYSTEM
    Computer:      <Computer name>
    Description:
    Automatic registration failed at join phase.  Exit code: Access is denied.. Server error:     empty. Debug Output:\r\n joinMode: Join
    drsInstance: azure
    registrationType: sync
    tenantType: fed
    tenantId: <tenantId>
    configLocation: undefined
    errorPhase: join
    adalCorrelationId: undefined
    adalLog:
    undefined
    adalResponseCode: 0x0
```

On the client machine look at Debug event logs under **"Application and Service Logs > Microsoft > Windows > User Device Registration"** If you see the event

```
    Log Name:      Microsoft-Windows-User Device Registration/Debug
    Source:        Microsoft-Windows-User Device Registration
    Date:          <Date and Time>
    Event ID:      502
    Task Category: None
    Level:         Error
    Keywords:      
    User:          SYSTEM
    Computer:      <Computer name>
    Description:
    DsrCmdDeviceEnroller::AutoEnrollSync: DsrBeginDeviceAutoJoin failed with error code:     0x80070005.

    Log Name:      Microsoft-Windows-User Device Registration/Debug
    Source:        Microsoft-Windows-User Device Registration
    Date:          <Date and Time>
    Event ID:      502
    Task Category: None
    Level:         Error
    Keywords:      
    User:          SYSTEM
    Computer:      <Computer name>
    Description:
    RegistrationController::GetRegistrationData: DirectoryServerUtil::SavePublicKey failed with     error code: 0x80070005.
```

```
  The error 0x80070005 translates to E_ACCESSDENIED - General access denied error
```

The reason for this error, the computer account does not have the correct permissions on its own computer object in on-prem Active Directory. 
To be more specific, the computer does not have Write permissions to update the attribute Usercertificate on the computer object.


**To fix this error**

Look at the permissions on the computer object in on-prem Active Directory. 
Correct the permissions and ensure the computer account has the Write permissions to update the attribute Usercertificate on the computer object.




-----

## **Troubleshooting**

On the client machine collect the output of **DSREGCMD /STATUS**, under **User state or SSO State** look for **AzureAdPrt**, if the Value is "**NO**" then the user did not get a PRT.
One of the reason the PRT was not issued is the Device authentication failed. The device was not able to present it's certificate for some reason.

Note: **DSREGCMD /STATUS** must be run in the Domain User's NTUSER context. If DSREGCMD /STATUS is run in the context of a local NTUSER profile the field will be always set to **NO** as a local NTUSER will not have a PRT.

Collect event logs
Reproduce the issue by logging off and logging in on the client.

On the client machine look at **Admin** event logs under "**Application and Service Logs \> Microsoft \> Windows \> User Device Registration**" look for events event

``` 
 Log Name:      Microsoft-Windows-User Device Registration/Admin
 Source:        Microsoft-Windows-User Device Registration
 Date:          <Date and Time>
 Event ID:      331
 Task Category: None
 Level:         Information
 Keywords:      
 User:          SYSTEM
 Computer:      <Computer name>
 Description: Automatic device join pre-check tasks completed. Debug output:\r\n preCheckResult: DoNotJoin
 isPrivateKeyFound: NOACCESS
 isJoined: YES
 isDcAvailable: YES
 isSystem: YES
 keyProvider: undefined
 keyContainer: undefined
 dsrInstance: AzureDrs
 elapsedSeconds: 0
 resultCode: 0x1
 
 Log Name:      Microsoft-Windows-User Device Registration/Admin
 Source:        Microsoft-Windows-User Device Registration
 Date:          <Date and Time>
 Event ID:      335
 Task Category: None
 Level:         Information
 Keywords:      
 User:          SYSTEM
 Computer:      <Computer name>
 Description: Automatic device join pre-check tasks completed. The device is already joined.

 Log Name:      Microsoft-Windows-User Device Registration/Admin
 Source:        Microsoft-Windows-User Device Registration
 Date:          <Date and Time>
 Event ID:      344
 Task Category: None
 Level:         Error
 Keywords:      
 User:          SYSTEM
 Computer:      <Computer name>
 Description: Failed to access the device key. If you have a TPM, it might be locked out or in an unknown state. 
 Error: The device that is required by this cryptographic provider is not ready for use.
```

  

Look at **Operational** event logs under "**Application and Service Logs \> Microsoft \> Windows \> AAD**" If you see the event

``` 
 Log Name:      Microsoft-Windows-AAD/Operational
 Source:        Microsoft-Windows-AAD
 Date:          <Date and Time>
 Event ID:      1098
 Task Category: AadTokenBrokerPlugin Operation
 Level:         Error
 Keywords:      Error,Error
 User:          <User SID>
 Computer:      <Computer name>
 Description:   Error: 0x80090030 The device that is required by this cryptographic provider is not ready for use.
 Exception of type 'class NGCException' at ngchelper.cpp, line: 42, method: NgcHelper::SignWithSymmetricPopKey.
 Log: 0xcaa10083 Exception in WinRT wrapper.
 Logged at authorizationclient.cpp, line: 223, method: ADALRT::AuthorizationClient::AcquireToken.
 Request: authority: https://login.microsoftonline.com/common, client: {<ClientID>}, redirect URI: ms-appx-web://Microsoft.AAD.BrokerPlugin/{<ClientID>}
```

Look the system event logs, if you see the below event

``` 
 Log Name:      System
 Source:        Microsoft-Windows-TPM-WMI
 Date:          <Date and Time>
 Event ID:      1026
 Task Category: None
 Level:         Information
 Keywords:      
 User:          SYSTEM
 Computer:      <Computer name>
 Description:
 The Trusted Platform Module (TPM) hardware on this computer cannot be provisioned for use automatically.  To set up the TPM interactively use the TPM management console (Start->tpm.msc) and use the action to make the TPM  
 ready.
 Error: The TPM is defending against dictionary attacks and is in a time-out period.
 Additional Information: 0x840000
```

  
**The above events are indicating the TPM is not ready or has some setting that is preventing from accessing the TPM keys.**

    Launch TPM.MSC and see if you get the option to unlock the TPM or reset the lockout.
    If not then the only option is to initialize the TPM. Before you do this,
    * Check the BIOS settings for TPM for any setting to reset the lockout or disable it.
    * Have the customer engage the hardware vendor on getting this fixed.

**Initializing the TPM or clearing the TPM might break other applications like bitlocker. if customer is not using bitlocker or no other service depends on TPM the below steps can be followed to clear the TPM**

To clear / reset the TPM

    * Open the Windows Defender Security Center app.
    * Click Device security.
    * Click Security processor details.
    * Click Security processor troubleshooting.
    * Click Clear TPM.
    * You will be prompted to restart the computer. During the restart, you might be prompted by the UEFI to press a button to confirm that you wish to clear the TPM. After the PC restarts, your TPM will be automatically prepared for use by Windows 10.



----------


### Find Windows 10 machines in Dual State

We have a lot of customer how have their clients running on Windows 10 build 1709 and lower.  Many customers have these machines in dual state, i.e. the client is Hybrid Joined and Azure AD registered at the same time.
In Azure AD viewing 2 Device IDs for the same client does not mean the client is in dual state.  To identify if a client is in dual state need to execute the command dsregcmd /status and see if the following is seen


```
   AzureAdJoined : YES
   DomainJoined : YES
   WorkplaceJoined : YES
```

If the client is Hybrid Joined we will see

```
   AzureAdJoined : YES
   DomainJoined : YES
```

If a domain joined client is Azure AD Registered we will see 

```
   DomainJoined : YES
   WorkplaceJoined : YES
```

Dual state is not support as this can break SSO experience and affect Conditional Access policy.

In an large environment the challenge is how to identity how many machines are in Dual state.

This can be done in a 2 step process.

**Step 1 : Get the output of the command dsregcmd /status from all the clien**

Below steps will get the output from all the clients and store them to a share on a file server. The output is saved to a file with the hostname. Need to replace <ServerName\Sharename>\ with the actual share path

```	
  Save the below as a powershell script 
     $Machine = hostname
     dsregcmd /status | Out-File \\<ServerName\Sharename>\$Machine.txt
  Use group policy or SCCM and push the script to run as the logged in user.
```

**Step 2 :  Scrub all the files to find which machines are in Dual state.** 
Below are the steps to create a script to scrub all the files on the share and get a list of computer names that are in Dual state.

```
  Save the below as a powershell script 
       #Get all files from the folder
        $fileList = Get-ChildItem "\\<ServerName\Sharename>" #
        $FileNamesPath = ""\\<ServerName\Sharename>\Names.txt" #
        Remove-Item $FileNamesPath -Force -ErrorAction SilentlyContinue
        foreach ($file in $fileList)
           {
              $content = Get-Content "C:\Ravi\TestFolder\$file" #
                if($content -match "AzureAdJoined : YES")
                   {
                if($content -match "DomainJoined : YES")
                   {
                if($content -match "WorkplaceJoined : YES")
                   {
                $file.Name | Out-file $FileNamesPath -Append
               }
            }
         }
       }
```

**This will create a file Names.txt on the share which will have all the hostnames that are in dual state (names will be with .txt as its representing the file name that has the data which represents dual state)**


----------
