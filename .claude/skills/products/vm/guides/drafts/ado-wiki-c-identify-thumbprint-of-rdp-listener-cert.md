---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Identify Thumbprint of RDP Listener Cert_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Cant%20RDP%20SSH/How%20Tos/Identify%20Thumbprint%20of%20RDP%20Listener%20Cert_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.How-To
- cw.RDP-SSH
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::



[[_TOC_]]

### Objective

Provide steps to identify the RDP listener certificate thumbprint that is being used for RDP connections.

### Process

#### **Powershell**

1.  **Open Powershell and enter following command**
    *`Get-WmiObject -class "Win32_TSGeneralSetting" -Namespace root\cimv2\terminalservices`*<br>
![Powershell command to show general Terminal Services settings, including the thumbprint of the RDP listener certificate](/.attachments/SME-Topics/Cant-RDP-SSH/297917a8-b7d8-b2f2-9465-7d18a7944f44800px-Determine-thumbprint-of-rdp-listener-certificate-01.png)

#### **Registry**

1.  **Open Regedit**
    Navigate to listener key located:
    *`Registry path: HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp`*
    *`Value name:  SSLCertificateSHA1Hash`*
    *`Value type:  REG_BINARY`*
    *`Value data:  certificate thumbprint`*
    **NOTE:If this value does NOT exist or is set to all '0' then the listener is using the default self-signed certificate.**
<br>
![Resgirty Editor view of the RDP listener settings, including the thumbprint of the RDP listener certificate](/.attachments/SME-Topics/Cant-RDP-SSH/7955e2fb-f2fe-f1f2-5d30-b56a53e304a4800px-Determine-thumbprint-of-rdp-listener-certificate-03.png)

### Applies To

  - Windows 7
  - Windows 8 / 8.1
  - Windows 10
  - Windows Server 2008 R2
  - Windows Server 2012 / 2012 R2
  - Windows Server 2016


::: template /.templates/Processes/Knowledge-Management/RdpSsh-Feedback-Template.md
:::
