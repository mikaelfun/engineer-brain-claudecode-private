---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/How Tos/Azure Files Windows 7 & Windows Server 2008 R2_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20All%20Topics/How%20Tos/Azure%20Files%20Windows%207%20%26%20Windows%20Server%202008%20R2_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Files-All-Topics
- cw.How-To
- cw.Reviewed-02-2021
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::


 


[[_TOC_]]

## Summary

This article will explain the behavior of Azure Files, when the File Share is connected to a Windows 7 / Windows Server 2008 R2 client.
Due to the fact that this OS family supports only the SMB 2.1 protocol, there are some conditions to be taken into account when a connection with such clients are established.

## Background information

### Facts

Azure Files has two main requirements from a client that tries to connect to it, depending on the scenario:

  - If the Azure Files Share needs to be mounted on a client (Virtual Machine) within the same Region/Datacenter as the Azure Files Storage Account -\> the client should support at least the SMB 2.1 protocol
  - If the Azure Files needs to be mounted on a client via the Internet (on premises, other Datacenters etc.) -\> the connection needs to be encrypted -\> this is only possible if the client supports the SMB 3.0 protocol

The Windows 7 / Windows Server 2008 R2 OS family supports only the SMB 2.1 protocol. As SMB 2.1 is not ensuring encrypted connections, the Windows 7 / Windows Server 2008 R2 clients can be used only within the same Region/Datacenter where the Storage Account of the File Share is located. If such a client will try to connect from an external location, Azure will reject the connection, throwing an Access Denied error.

However, since 27th of June 2017, there is an exception from the behavior explained above, caused by the newly published Secure Transfer Required feature for the Azure Storage Accounts.
If the Azure Files Storage Account has the Secure Transfer Required feature enabled, the connection will fail with an Access Denied error even if the Windows 7/ Windows Server 2008 R2 clients are placed within the same Region/Datacenter.

It is important to understand what happens behind the curtains when mounting a file share on a client. The process has 4 main phases, from which three of them are of interest, as they can be used in troubleshooting. These steps are easily visible from a network trace:

1.  **The 3  way handshake**  
    The Server exchanges vital information with the client and establishes the connection via the clients TCP port 445. The client sends a call to the server, the server responds back, then the client sends its confirmation that the next phase can begin.
2.  **The SMB dialect negotiation**  
    In this phase, the client and the server are confirming the dialect (the SMB version) and the Authentication mechanism they will use for the connection.  
    The phase is composed of 4 steps:
    1.  Client sends to the server information regarding the dialects it can use
    2.  Server gets the request, and if it can use this dialect, it sends back a positive response
    3.  Client requests to the server information regarding the security mechanism it can use
    4.  Server gets the request and sends back the security mechanism information. If nothing is sent, the client will assume that the server works on NTLM
3.  **The Session Setup**  
    If NTLM is used, then the client authenticates to the server using a Session Setup command. The Windows clients are using by default the NTLM v2, which is also used by Azure Files.
4.  **The encrypted communication**  
    After these 3 steps, the client and the server begin to exchange data. This data is encrypted and cannot be seen in the network traces.

**Please find additional information in this article, where the network trace analysis is explained in detail.**  
The animated examples below are using the same analysis method as in this article.
In all the examples, the following tracing method was used:

  - `netsh trace start scenario=FileSharing capture=yes report=yes tracefile=C:\fileshareconnectivity.etl`
  - operation // repro
  - `netsh trace stop`

<div class="center">

<div class="thumb tnone">

<div class="thumbinner" style="width:909px;">

[![](/.attachments/SME-Topics/Azure-Files-All-Topics/Storage_AzureFilesWin7Win2008_NetworkTraceExample.gif)](/.attachments/SME-Topics/Azure-Files-All-Topics/Storage_AzureFilesWin7Win2008_NetworkTraceExample.gif)

<div class="thumbcaption">

How to gather a Network trace for Azure Files

</div>

</div>

</div>

</div>

### Terminology

  - **Client** -\> the virtual machine / physical machine that tries to connect to the File Share
  - **Internal client** -\> a client that is located in the same Region/Datacenter as the Azure File Share to be used
  - **External client** -\> a client that is located outside the Region/Datacenter where the Azure File Share is located. This includes other Internet locations, other Azure Regions/Datacenters, on premises clients etc.
  - **Server** -\> the entity that hosts the file share, in our case Azure (specifically the Azure Storage File Service)

### The detailed configuration used in this articles examples

**Client**

  - Virtual Machine: ARM, Standard D1-sized
  - Name: afsclient2008r2
  - OS: Windows Server 2008 R2 image from the Azure Marketplace
  - Region: South Central US

**Server 1 / File Share 1**

  - Storage Account Name: afsinternal001
  - File Share Name: afsinterna
  - Region: South Central US

**Server 2 / File Share 2**

  - Storage Account Name: afsexternal002
  - File Share Name: afsexternal
  - Region: East US

**IMPORTANT:**

 Please note that the behavior / traces / commands are identical for Windows 7 and Windows Server 2008 R2

 Please note that the behavior is identical regardless of the Region/Datacenter where the Client is placed

## Scenarios

### Azure Files default behavior on Windows 7 / Windows Server 2008 R2 clients

#### Azure File Share in the same Datacenter with the client

Successful connections between an Azure File Share and a Windows 7 / Windows Server 2008R2 client are possible only if the Client and the Server (the File Share) are located within the same Region/Datacenter.

The animation below displays the successful mounting of File Share 1 (afsinternal001.file.core.windows.net/afsinternal) to the Client (afsclient2008r2) using the net use command in an elevated Command Prompt. afsinternal and afsclient2008r2 are in the same Azure Region/Datacenter.

<div class="center">

<div class="thumb tnone">

<div class="thumbinner" style="width:909px;">

[![](/.attachments/SME-Topics/Azure-Files-All-Topics/Storage_AzureFilesWin7Win2008_MountShareSuccess.gif)](/.attachments/SME-Topics/Azure-Files-All-Topics/Storage_AzureFilesWin7Win2008_MountShareSuccess.gif)

<div class="thumbcaption">

Successful Azure File Share mounting

</div>

</div>

</div>

</div>

What happens from the network perspective?

Analyzing a network trace taken during the mounting operation, one can observe the 4 steps explained above. This is a good case example, when the connection is established successfully:

<div class="center">

<div class="thumb tnone">

<div class="thumbinner" style="width:802px;">

[![](/.attachments/SME-Topics/Azure-Files-All-Topics/Storage_AzureFilesWin7Win2008_TraceSuccess.gif)](/.attachments/SME-Topics/Azure-Files-All-Topics/Storage_AzureFilesWin7Win2008_TraceSuccess.gif)

<div class="thumbcaption">

Analyze the mounting operation of an Azure File Share via Network Monitor

</div>

</div>

</div>

</div>

#### Azure File Share in a different Datacenter or accessed from external client

This connection is impossible and it will fail. This happens because the SMB 2.1 protocol supported by the Windows 7 / Windows Server 2008R2 client cannot handle encryption. Since Azure File Share requires encrypted communication if accessed from external sources (this includes Internet, on premises machines, other Azure Regions/Datacenters etc), during the session setup phase, the Azure File Service (server) will send to the client a 34 STATUS\_ACCESS\_DENIED\_SESSION\_SETUP Error.

The animation below displays the unsuccessful mounting of File Share 2 (afsexternal002.file.core.windows.net/afsexternal) using the net use command in an elevated Command Prompt. afsexternal and afsclient2008r2 are in a different Azure Region/Datacenter.

<div class="center">

<div class="thumb tnone">

<div class="thumbinner" style="width:908px;">

[![](/.attachments/SME-Topics/Azure-Files-All-Topics/Storage_AzureFilesWin7Win2008_ExternalNetworkTrace.gif)](/.attachments/SME-Topics/Azure-Files-All-Topics/Storage_AzureFilesWin7Win2008_ExternalNetworkTrace.gif)

<div class="thumbcaption">

Unsuccessful Azure File Share mounting

</div>

</div>

</div>

</div>

What happens from the network perspective?

Analyzing a network trace taken during the mounting operation, one can observe that the first 3 steps are successful, but during the Session Setup, Azure Files sends to the server the 34 STATUS\_ACCESS\_DENIED\_SESSION\_SETUP Error as the client cannot meet its security requirements. This is a bad case example, when the connection is not established:

<div class="center">

<div class="thumb tnone">

<div class="thumbinner" style="width:1264px;">

[![](/.attachments/SME-Topics/Azure-Files-All-Topics/Storage_AzureFilesWin7Win2008_ExternalNetMon.gif)](/.attachments/SME-Topics/Azure-Files-All-Topics/Storage_AzureFilesWin7Win2008_ExternalNetMon.gif)

<div class="thumbcaption">

Analyzing unsuccessful Azure File Share mounting with Network Monitor

</div>

</div>

</div>

</div>

### Azure Files behavior on Windows 7 / Windows Server 2008 R2 clients -\> Secure Transfer feature enabled at Storage Account level

#### What is Secure Transfer?

The "Secure transfer required" option enhances the security of your storage account by only allowing requests to the storage account from secure connections. For example, when calling REST APIs to access your storage account, you must connect using HTTPS. Any requests using HTTP are rejected when "Secure transfer required" is enabled.

When you are using the Azure Files service, any connection without encryption fails when "Secure transfer required" is enabled. This includes scenarios using SMB 2.1, SMB 3.0 without encryption, and some flavors of the Linux SMB client.

By default, the "Secure transfer required" option is disabled.

The detailed description of this feature can be found here.

#### Behavior explained

When the Secure transfer required feature is enabled at Storage Account level, the Azure Storage File Service will expect an encrypted connection, regardless if the client is within or outside the Azure Region / Datacenter where the Storage Account is located. When the connection is attempted on the client, the same System error 5 will be displayed. On the network side, the server will deny the access of the client by throwing the 34 STATUS\_ACCESS\_DENIED\_SESSION\_SETUP.

In the example below, the File Share 1 Storage Account (afsinternal001) has now the Secure transfer required feature enabled:

<div class="center">

<div class="floatnone">

[![The Secure Transfer Required feature is activated at storage account level](/.attachments/SME-Topics/Azure-Files-All-Topics/Storage_AzureFilesWin7Win2008_SecureTransferRequiredOn.png)](/.attachments/SME-Topics/Azure-Files-All-Topics/Storage_AzureFilesWin7Win2008_SecureTransferRequiredOn.png)

</div>

</div>

The animation below displays the unsuccessful mounting of File Share 1 (afsinternal001.file.core.windows.net/afsinternal) to the Client (afsclient2008r2) using the net use command in an elevated Command Prompt. afsinternal and afsclient2008r2 are in the same Azure Region/Datacenter.

<div class="center">

<div class="thumb tnone">

<div class="thumbinner" style="width:909px;">

[![](/.attachments/SME-Topics/Azure-Files-All-Topics/Storage_AzureFilesWin7Win2008_SecureTransferOK.gif)](/.attachments/SME-Topics/Azure-Files-All-Topics/Storage_AzureFilesWin7Win2008_SecureTransferOK.gif)

<div class="thumbcaption">

Secure Transfer Only unsuccessful mounting

</div>

</div>

</div>

</div>

What happens from the network perspective?
Analyzing a network trace taken during the mounting operation, one can observe that the first 3 steps are successful, but during the Session Setup, Azure Files sends to the server the 34 STATUS\_ACCESS\_DENIED\_SESSION\_SETUP Error as the client cannot meet its security requirements. This is a bad case example, when the connection is not established due to the fact that the Secure transfer required feature is enabled:

<div class="center">

<div class="thumb tnone">

<div class="thumbinner" style="width:1260px;">

[![](/.attachments/SME-Topics/Azure-Files-All-Topics/Storage_AzureFilesWin7Win2008_SecureTransferNetmonOK.gif)](/.attachments/SME-Topics/Azure-Files-All-Topics/Storage_AzureFilesWin7Win2008_SecureTransferNetmonOK.gif)

<div class="thumbcaption">

Analyzing the failed mount when Secure Transfer Only is activated, using Network Monitor

</div>

</div>

</div>

</div>

::: template /.templates/Processes/Knowledge-Management/Azure-Files-All-Topics-Feedback-Template.md
:::
