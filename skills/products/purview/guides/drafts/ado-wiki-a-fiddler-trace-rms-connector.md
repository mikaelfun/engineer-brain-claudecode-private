---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/RMS Connector/How To: RMS Connector/How To: Fiddler Trace on RMS Connector server"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FRMS%20Connector%2FHow%20To%3A%20RMS%20Connector%2FHow%20To%3A%20Fiddler%20Trace%20on%20RMS%20Connector%20server"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How To: Fiddler Trace on RMS Connector server

## Introduction

The RMS Connector runs in **system context.** To collect a Fiddler trace for RMS Connector traffic Fiddler must run in system context.

## Steps to run the Fiddler in System context

1. Download the [**PSExec**](https://learn.microsoft.com/en-us/sysinternals/downloads/psexec) tool on the RMS Connector server and extract it.
2. Open an elevated command prompt.
3. Navigate to the folder where PSExec is extracted.
4. Run `psexec -i -s <Path to the Fiddler exe>`.
   - Example: `psexec -i -s C:\Users\sysadm.CONTOSO\AppData\Local\Programs\Fiddler\Fiddler.exe`
5. Enable the SSL decryption from Fiddler Tools -> Options menu.
6. Reproduce the issue and make sure you are able to see the RMS connector traffic in the Fiddler.

## Proxy Configuration

If the Connector is configured to use a proxy server, change the setting to use Fiddler as the Proxy and configure the Fiddler to use the network proxy.

1. Go to `HKLM\Software\Microsoft\AADRN\Connector` to check if the `ProxyAddress` settings is enabled for the Connector. If it is not, you can ignore the next step.
2. Update this **ProxyAddress** with the Fiddler proxy address: `http://127.0.0.1:8888`.
3. Enable the custom proxy setting in Fiddler.
   - Go to Tools-> Options -> Gateway -> Manual Proxy Configurations. Add customer's proxy address.
4. If they have Proxy bypass list, please add them as well.
