---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/How Tos/Azure Files Identity/How to collect network trace for Azure files domain authentication issues_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20All%20Topics/How%20Tos/Azure%20Files%20Identity/How%20to%20collect%20network%20trace%20for%20Azure%20files%20domain%20authentication%20issues_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Files-All-Topics
- cw.How-To
- cw.Reviewed-07-2024
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::


[[_TOC_]]
# Summary
This article provides instructions on how to collect network traces while troubleshooting Azure Files with identity base authentication

# Scenarios
- On-premises Active Directory Domain Services (AD DS)
- Microsoft Entra Domain Services
- Microsoft Entra Kerberos for hybrid user identities ***

# Instructions

## Using WireShark

[Download Wireshark App](http://www.wireshark.org/) 

1. In Wireshark, Capture -> Start

Execute this commands from a `Command Prompt` with administrative privilegs :

2. ```klist purge```
3. ```ipconfig /flushdns```
4. ```klist get cifs/<storageaccount>.file.core.windows.net```
5. ```klist purge```
6. ```net use \\<storageaccount>.file.core.windows.net\<shareName>```
7. In Wireshark, Capture -> Stop
8. In Wireshark, File->Save As



## Using Netsh cmdlet 

1. Open two `CMD` windows, one `using administrative privilegs` and another `WITHOUT administrative` privilegs`:

Execute this commands from a `Command Prompt` with administrative privilegs :

2. ```klist purge```
3. ```ipconfig /flushdns```
4. ```netsh trace start persistent=yes capture=yes tracefile=c:\NetworkCapture.etl```

Execute those commands from a `Command Prompt` without administrative privilegs :

5. ```klist get cifs/<storageaccount>.file.core.windows.net```
6. ```klist purge```
7. ```net use \\<storageaccount>.file.core.windows.net\<shareName>```

Execute this commands from a `Command Prompt` with administrative privilegs :

8. ```netsh trace stop```

   It will create a file `c:\NetworkCapture.etl`. 
   
   `Tip:` Check if the file has more than 1 MB, if that has only 1 MB, collection failed, proccess to do it again.

<br>

> Microsoft Entra Kerberos for hybrid user identities ***
>  
> Note: For Entra Kerberos scenarios, the Kerberos traffic happens over HTTPS, which either Wireshark and Netsh don't capture it because it's encrypted, so it just shows up as encrypted TCP traffic, and we can't look at it). 
>
> This scheme of using HTTPS for Kerberos is called KDC Proxy. It's the reason we have to use Fiddler to get the Kerberos request for Entra Kerberos -- Fiddler is able to capture and decrypt HTTPS
 
 # References

[Wireshark](http://www.wireshark.org/)

[Netsh](https://learn.microsoft.com/en-us/windows-server/networking/technologies/netsh/netsh-contexts)


::: template /.templates/Processes/Knowledge-Management/Azure-Files-All-Topics-Feedback-Template.md 
:::
