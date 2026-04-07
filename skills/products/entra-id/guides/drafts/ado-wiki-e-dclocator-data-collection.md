---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Domain Controller Locator (DCLocator)/WorkFlow: DcLocator: Data Collection"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FDomain%20Controller%20Locator%20(DCLocator)%2FWorkFlow%3A%20DcLocator%3A%20Data%20Collection"
importDate: "2026-04-07"
type: troubleshooting-guide
---

**Summary:**
This article provides detailed instructions on gathering data to troubleshoot DcLocator scenarios, including various data collection methods and specific commands.

# Data collection

Selecting appropriate data sources depends on the scenario. Typically, only a few sets of data and information are needed to understand DcLocator's behaviors. If you are unsure about what data to gather, then gather the following:
- Network capture
- Netlogon logging
- DcLocator ETL (Event Tracing for Windows) tracing
- Site configuration information from Active Directory
- Details about an application's domain controller requirements (if known)
- Leveraging TSS (Troubleshooting Support Scripts), SDP (Support Diagnostics Platform) packages
- Using NLTest, NSLookup

**NOTE:** It is always advised to gather data, particularly network captures, from both endpoints (the client performing the DC Locator discovery and the domain controller(s) responsible for responding).

## Option 1 - TSS

Leveraging TSS to automate the collection reduces the complexity of data collection.

The syntax and requirements from TSS depend on the scenario: The failure may be reproduced while TSS remains running, the user must log off to reproduce the issue, or the failure scenario requires a system reboot.

**NOTE:** All TSS commands must be run from an elevated PowerShell console.

### TSS with prompt to end data collection:

1. Start data collection:

   ```
   .\TSSv2.ps1 -ADS_Netlogon -Netsh -SDP Dom
   ```

2. Run optional commands and/or reproduce the error in the application or service.

   **NOTE:** Reproduce the failure in the application or service when prompted. If the issue can be reproduced more easily by manually triggering DcLocator via NLTest, consider running the command after flushing the DNS cache (modify NLTest parameters for domain name, location flags, and always include the /force option to avoid cached results):

   ```
   Ipconfig /flushdns
   Nltest /dsgetdc:contoso.com /gc /force
   ```

3. Stop data collection:
> Press 'Y' at the prompt to end data collection after the failure has been reproduced.

Collect the ZIP file at the location listed in the TSS command output.

### TSS 2-step procedure for scenarios requiring the user to log off:

1. Start data collection:

   ```
   .\TSSv2.ps1 -ADS_Netlogon -Netsh -SDP Dom -StartNoWait
   ```

2. Reproduce the failure.

3. Stop data collection:

   ```
   .\TSSv2.ps1 -Stop
   ```

Collect the ZIP file at the location listed in the TSS command output.

### TSS boot capture procedure:

1. Start data collection.

   ```
   .\TSSv2.ps1 -StartAutoLogger -ADS_Netlogon -Netsh -SDP Dom
   ```

2. Restart the computer, such as via:

   ```
   .\Restart-Computer
   ```

3. After computer restart, verify that the failure has been reproduced, then stop the data collection:

   ```
   .\TSSv2.ps1 -Stop
   ```

Collect the ZIP file at the location listed in the TSS command output.

## Option 2 - Manual collection

Below is a concise list of commands to enable the logging if TSS or other methods are not available.

**NOTE:** The commands below leverage PowerShell instead of Netsh for network capture. Netlogon text debug logging is set to the minimum level to capture locator operations (if you need authentication and trust-related activities, consider adding flags such as 0x2080ffff).

```
md c:\msdata
New-NetEventSession -Name netTrace -LocalFilePath "c:\msdata\netTrace.etl" -MaxFileSize 1024; Add-NetEventPacketCaptureProvider -SessionName netTrace -Level 4 -TruncationLength 8000; Start-NetEventSession netTrace
NLTest /dbflag:0x12
logman create trace "Netlogon" -ow -o c:\msdata\Netlogon.etl -p {CA030134-54CD-4130-9177-DAE76A3C5791} 0xffffffffffffffff 0xff -nb 16 16 -bs 1024 -mode Circular -f bincirc -max 4096 -ets
ipconfig /flushdns
```

Reproduce the error/failure within the application or service (and/or leverage a suitable "Nltest /dsgetdc:domain /flags /force" command to generate the failure).

```
Stop-NetEventSession netTrace; ren C:\msdata\netTrace.etl C:\msdata\netTrace_$(Get-Date -f MM-dd_HH-mm-ss).etl; Remove-NetEventSession netTrace
nltest /dbflag:0x0
logman stop "Netlogon" -ets
```

Collect the C:\windows\debug\Netlogon.log and Netlogon.bak files. Upload them along with the network capture and Netlogon.ETL found in c:\msdata.

**NOTE:** Be sure to document any application-specific or service-specific errors to help isolate the specific operations in the data to the failure in that app/service. Most helpful would be errors reported on the system or within the application that indicates the precise time of the failure to help correlate it with the diagnostic data.

**NOTE:** Ensure you disable any tracing at the completion of data collection/troubleshooting.

# Details about each data collection option:

## Network capture

The most reliable in-box method of collecting a network capture is via PowerShell:

Start capture:
```
New-NetEventSession -Name netTrace -LocalFilePath "c:\msdata\netTrace.etl" -MaxFileSize 1024; Add-NetEventPacketCaptureProvider -SessionName netTrace -Level 4 -TruncationLength 8000; Start-NetEventSession netTrace
```
Purge name cache via the `ipconfig /flushdns` command.

<<reproduce the failure/behavior>>

Stop capture:
```
Stop-NetEventSession netTrace; ren C:\msdata\netTrace.etl C:\msdata\netTrace_$(Get-Date -f MM-dd_HH-mm-ss).etl; Remove-NetEventSession netTrace
```
(If you are partial to analyzing captures with WireShark, see [etl2pcapng](https://techcommunity.microsoft.com/t5/core-infrastructure-and-security/converting-etl-files-to-pcap-files/ba-p/1133297)).
Otherwise, you are free to leverage any other desired capture method...

## Netlogon logging

Netlogon logging to c:\windows\debug\netlogon.log (and netlogon.bak) is useful for many scenarios and benefits from writing to a clear text file. Both you and the customer can review it for information about DC discovery, flags passed to the DcLocator API, results of DcLocator, and also authentication activities if you desire it. Take note of the different flags that can be passed to enable Netlogon logging for these activities.

You may decide the more in-depth ETL tracing (see further below) is more beneficial for your scenario.

Enable Netlogon Debug logging via editing the registry, using NLTest.exe, or via Group Policy.
- Via Registry:
   HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\Netlogon\Parameters
   DBFlag (Reg_SZ)
   value: `0x2080ffff` *(will gather much more than just DcLocator but useful to observe other activities for better context)*
   or
   value: `0x00000012` *(will only gather DcLocator operations)*
- Via NLTest:
   `NLTest /dbflag:2080ffff`
   or
   `NLTest /dbflag:0x12`
- Via Group Policy
   GPO Setting Location:

   `Computer Configuration\Administrative Templates\System\Net Logon`

Caution: The Group Policy editor will, by default, specify flags 2000FFFF in decimal as 536936447. To achieve the minimum (0x12) or common (2080FFFF) flags, use the following table:
```
18 decimal = 0x12 hex
545325055 decimal = 0x2080FFFF hex
```
**NOTE:** Ensure you disable any tracing at the completion of data collection/troubleshooting.

## DcLocator tracing

Within Netlogon is a trace provider specific to locator operations. This is very detailed information that includes DNS operations. This is more useful than Netlogon logging, but does require upload to Microsoft for analysis (as it requires decoding/conversion via the Insight Client).

DcLocator ETL tracing is the highest capacity option with very low processing overhead. Use this option over Netlogon.log logging for DcLocator investigations.

**NOTE:** DcLocator ETL tracing DOES NOT trace authentication operations, only locator activities.

GUID
- CA030134-54CD-4130-9177-DAE76A3C5791 - Netlogon

Enable DcLocator tracing via:

Start tracing:
```
logman create trace "os" -ow -o c:\os.etl -p {CA030134-54CD-4130-9177-DAE76A3C5791} 0xffffffffffffffff 0xff -nb 16 16 -bs 1024 -mode Circular -f bincirc -max 4096 -ets
```
Stop tracing:
```
logman stop "Netlogon" -ets
```

## Site configuration

Inquiring about the site configuration is helpful to understand if the domain controller(s) discovered by DcLocator are correct per that configuration. Gather the output of NLTest to evaluate the site of the located DC, the site of the client, and flags (capabilities) of the discovered domain controller.
```
nltest /dsgetdc:domain /force
```
*Replacing *domain* with the name of the domain for which a DC should be located*

Sample output:
>     DC: \\DC1.litware.com
>     Address: \\192.168.9.50
>     Dom Guid: 4e990533-a8d9-441b-a328-ba2e6dac5ec8
>     Dom Name: litware.com
>     Forest Name: litware.com
>     Dc Site Name: Default-First-Site-Name
>     Our Site Name: Default-First-Site-Name
>     Flags: PDC GC DS LDAP KDC TIMESERV WRITABLE DNS_DC DNS_DOMAIN DNS_FOREST CLOSE_SITE FULL_SECRET WS DS_8 DS_9 DS_10 KEYLIST
>     The command completed successfully

## Domain controller requirements

It is up to the application or service to specify any requirements of the domain controller being discovered. These are easily evident in the Netlogon.log file (or in the Netlogon ETL as long as you reference the table of flag values below).
>     DS_FORCE_REDISCOVERY            0x00000001
>     DS_DIRECTORY_SERVICE_REQUIRED   0x00000010
>     DS_DIRECTORY_SERVICE_PREFERRED  0x00000020
>     DS_GC_SERVER_REQUIRED           0x00000040
>     DS_PDC_REQUIRED                 0x00000080
>     DS_BACKGROUND_ONLY              0x00000100
>     DS_IP_REQUIRED                  0x00000200
>     DS_KDC_REQUIRED                 0x00000400
>     DS_TIMESERV_REQUIRED            0x00000800
>     DS_WRITABLE_REQUIRED            0x00001000
>     DS_GOOD_TIMESERV_PREFERRED      0x00002000
>     DS_AVOID_SELF                   0x00004000
>     DS_ONLY_LDAP_NEEDED             0x00008000
>     DS_IS_FLAT_NAME                 0x00010000
>     DS_IS_DNS_NAME                  0x00020000
>     DS_TRY_NEXTCLOSEST_SITE         0x00040000
>     DS_DIRECTORY_SERVICE_6_REQUIRED 0x00080000
>     DS_RETURN_DNS_NAME              0x40000000
>     DS_RETURN_FLAT_NAME             0x80000000

If no domain controllers are available to satisfy the specified flags, then the call to DCLocator will fail (such as with 1355 0x54b ERROR_NO_SUCH_DOMAIN).
