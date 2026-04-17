---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/How Tos/Azure Files Identity/How to Execute Fiddler Kerberos extension to debug Entra Kerberos issues_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20All%20Topics/How%20Tos/Azure%20Files%20Identity/How%20to%20Execute%20Fiddler%20Kerberos%20extension%20to%20debug%20Entra%20Kerberos%20issues_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Files-All-Topics
- cw.TSG 
- cw.Reviewed-07-2024
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::

 
[[_TOC_]]

	
# Summary

In Entra Kerberos scenarios, Windows Clients reach out to Entra Kerberos service over HTTPs for requests relating to Kerberos authentication, which either Wireshark and Netsh don't capture it because it's encrypted, so it just shows up as encrypted TCP traffic, and we can't look at it. 

This scheme of using HTTPS for Kerberos is called KDC Proxy. It's the reason we have to use Fiddler to get the Kerberos request for Entra Kerberos. With Kerberos.NET Fiddler extension, you can inspect traffic over HTTPS to root-cause issues.

# Scenarios
- Microsoft Entra Kerberos for hybrid user identities.

# Instructions

## Installation

1. Download and Install [Fiddler](https://www.telerik.com/download/fiddler/fiddler4) for Windows. 
2. Install [Kerberos.NET Fiddler extension](https://github.com/dotnet/Kerberos.NET/releases)

    `Note: Download and run setup.exe file. It will install silently.`

3. Open `Fiddler` in an admin/elevated context.
4. Go to Tools -> Options and click following checkboxes:
	- Decrypt HTTPS traffic
	- Ignore server certificate errors.

    `Note: Click through prompts asking if it is okay to add/trust the Fiddler certificate.`

   ![Options](/.attachments/SME-Topics/Azure-Files-All-Topics/Use-Fiddler-Kerberos-NET-extension-to-debug-AAD-Kerberos-traffic-Options.png)
	

5. Restart your computer to ensure new settings have applied.

## Debugging

1. After restart, run `Fiddler` as admin/elevated context
2. Open a command prompt
	- Run `klist get cifs/<storageaccount>.file.core.windows.net`
	- In the fiddler trace, you will see requests to Entra ID and can view them with the Kerberos tab request / response sections:
		
        Example of request:
                
        ![Options](/.attachments/SME-Topics/Azure-Files-All-Topics/Use-Fiddler-Kerberos-NET-extension-to-debug-AAD-Kerberos-traffic-Request-Example.png)
            
            
        Example of response:
                
        ![Options](/.attachments/SME-Topics/Azure-Files-All-Topics/Use-Fiddler-Kerberos-NET-extension-to-debug-AAD-Kerberos-traffic-Response-Example.png)
		
        
3. Look at the errors
	- The `ErrorCode` will likely indicate the issue.
    
        `In above example, the issue is due to empty password on the service principal.  Mitigation would be to update the password of the service principal to be non-null.`

	- You can also use the Entra ID `Client Request ID` and `Timestamp` which is also part of the response [Get Entra Request ID](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1548135/How-to-Get-Entra-Request-ID-from-Entra-Kerberos-ticket-request) and can be used to look up the trace in EntraID Logging by directly opening a collaboration with `Entra ID Support Team`





## Troubleshooting

### Scenario 1
For some reason, despite having followed the above instructions, Fiddler is still unable to decrypt HTTPS traffic. When this happens, instead of being able to click on the HTTPS request to login.microsoftonline.com, the request will be greyed out.

If this happens, you can try to reset the Fiddler certificate and restart Fiddler.

1. Go to Tools > Options > HTTPS
2. Click the Actions > Reset All Certificates
3. Accept all popups (Fiddler says it takes a minute, in reality it's more like 20 seconds)
4. Once the bottom left of the window is back to `Note: Changes may not take effect until Fiddler Classic is restarted`. 
5. Restart Fiddler
6. Try to mount again. The requests to login.microsoftonline.com should no longer be greyed out.

    ![Options](/.attachments/SME-Topics/Azure-Files-All-Topics/Use-Fiddler-Kerberos-NET-extension-to-debug-AAD-Kerberos-traffic-Actions.png)
	


### Scenario 2

Fiddler works by creating proxy settings on the client and does not often clean these settings up correctly after process exit or traffic capture stop. 
        
    
    C:\Windows\system32>klist get cifs/<storageaccount>.file.preprod.core.windows.net
        
    Current LogonId is 0:0xc1323
    Error calling API LsaCallAuthenticationPackage (GetTicket substatus): 0x51f
        
    klist failed with 0xc000005e/-1073741730

To mitigate the above issue, follow these steps:

1. Run netsh winhttp reset autoproxy

2. Run netsh winhttp reset proxy

3. In the Windows registry, find 
``Computer\HKEY_LOCAL_MACHINE\SYSTEM\ControlSet001\Services\iphlpsvc\Parameters\ProxyMgr`` path and delete any subentry that has a configuration with a port :8888 

4. Restart the machine and try again using Windows Authentication

	

# References
 

[Using Fiddler Classic](https://docs.telerik.com/fiddler/configure-fiddler/tasks/installfiddler?_gl=1*1kpcrm2*_gcl_au*NDk5MzU1ODE4LjE3MjA3OTgwMDI.*_ga*Nzc2OTgwNDE1LjE3MjA3OTgwMDI.*_ga_9JSNBCSF54*MTcyMDc5ODAwMS4xLjEuMTcyMDc5ODAzMi4yOS4wLjA.)




::: template /.templates/Processes/Knowledge-Management/Azure-Files-All-Topics-Feedback-Template.md
:::
