---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/TSGs/GA/BFEToolWin8_Description_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20%28AGEX%29%2FTSGs%2FGA%2FBFEToolWin8_Description_AGEX"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# BFEToolWin8 Description

- BFEToolWin8.exe is a component that is built within the Azure Guest Agent (it comes installed as default) for Windows.
- BFE stands for Base Filtering Engine and is a service that manages firewall and internet protocol security (IPsec) policies and implements user mode filtering. Stopping or disabling the BFE service will significantly reduce the security of the system. It will also result in unpredictable behaviour in IPsec management and firewall applications.
- The BFE service controls the operation of the Windows Filtering Platform. This service is essential for the operation of many firewall products, including the Firewall embedded in third-party anti-viruses.
- C:\WindowsAzure\GuestAgent_xxx_xxxx_xxx\BFEToolWin8.exe

# Log entries

You may see logs like this in the WaAppAgent.log file:

```
[00000013] 2022-11-08T11:09:33.460Z [INFO]  BfeToolWin8.exe
stdout = [00002884:00001768, INFO ] List all filters requested.
[00002884:00001768, INFO ] Filters found: Yes
[00002884:00001768, INFO ] Index: 1 Name: Permit outgoing to 168.63.129.16:32526 from user BUILTIN\Administrators Key: E543719A-5D20-4FC5-A943-9CACB6894B93
[00002884:00001768, INFO ] Index: 2 Name: Permit outgoing to 168.63.129.16:32526 from user NT AUTHORITY\System Key: B5F0F0E4-2EE2-4C6D-A934-F45A0B7B0E68
[00002884:00001768, INFO ] Index: 3 Name: Block all outgoing to 168.63.129.16:32526 Key: D289C5CC-9073-4297-9221-2CEC82C95878
[00002884:00001768, INFO ] Index: 4 Name: Permit outgoing to 168.63.129.16:80 from user BUILTIN\Administrators Key: C9E3880A-A755-44E1-B7B2-37F2A5541232
[00002884:00001768, INFO ] Index: 5 Name: Permit outgoing to 168.63.129.16:80 from user NT AUTHORITY\System Key: D7735854-26DA-4946-9980-8FA0168B3024
[00002884:00001768, INFO ] Index: 6 Name: Block all outgoing to 168.63.129.16:80 Key: 6C9F77C2-3ED4-4865-92E7-EBB5F0235B63
[00002884:00001768, INFO ] Index: 7 Name: Permit outgoing to 168.63.129.16:8080 from user BUILTIN\Administrators Key: BFB43E1D-B906-43C7-BC62-F18CB7B8F4B6
[00002884:00001768, INFO ] Index: 8 Name: Permit outgoing to 168.63.129.16:8080 from user NT AUTHORITY\System Key: 8E4385B2-2366-48D1-AF76-1E516665B76C
[00002884:00001768, INFO ] Index: 9 Name: Block all outgoing to 168.63.129.16:8080 Key: 65D93D71-6C18-4843-A7FB-2972F57E1840
```

The Guest Agent will automatically run the Bfe tool, so the above logs are completely by design and they are **NOT** a sign of a connectivity issue. All its doing is limiting communication to the wireserver to only be possible from the System account and Administrators. This action is intentional in order to limit the communication that is able to reach the wireserver from within Windows.

The Guest Agent runs under the System account context, so this will not limit its functionality.
