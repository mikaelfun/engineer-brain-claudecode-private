# Deploy SCCM/ConfigMgr Client via Intune with CMG

> Source: OneNote - Classic Cases
> Quality: guide-draft (pending SYNTHESIZE review)

## Overview

Two methods to use Intune to deploy Configuration Manager (SCCM) client to devices via Cloud Management Gateway (CMG).

## Method 1: Windows LOB App

- Device will **connect to CMG** to download content files for installation
- Steps:
  1. Upload `ccmsetup.msi` to Intune portal as LOB app
  2. Copy command line from CM console co-management properties
  3. Paste as command-line arguments (must begin with `CCMSETUPCMD`)
  4. Example:
     ```
     CCMSETUPCMD="CCMHOSTNAME=<ServiceName.CLOUDAPP.NET/CCM_Proxy_MutualAuth/<GUID>" SMSSiteCode="<YourSiteCode>"
     ```

## Method 2: Win32 App

- If **all files in the folder** are wrapped and uploaded → ccmsetup will NOT connect to CMG (uses local cache)
- If **only ccmsetup.exe** is wrapped → ccmsetup will still connect to CMG to download content
- Steps:
  1. Upload wrapped file to Intune
  2. Modify command line to begin with `ccmsetup.exe` (remove `CCMSETUPCMD` and quotation marks)
  3. Example:
     ```
     ccmsetup.exe /nocrlcheck /mp:https://RTSCCM.CLOUDAPP.NET/CCM_Proxy_MutualAuth/72057594037928694 CCMHTTPSSTATE=31 CCMHOSTNAME=RTSCCM.CLOUDAPP.NET/CCM_Proxy_MutualAuth/72057594037928694 SMSSiteCode=RT1 AADTENANTID=<tenant-id> AADCLIENTAPPID=<app-id> AADRESOURCEURI=https://ConfigMgrService01
     ```

## Important Notes

- For **local AD domain joined** devices: change the MP parameter to local MP instead of CMG to download content from local MP
- Win32 method with all files wrapped is preferred for offline/bandwidth-limited scenarios
- LOB method is simpler but requires CMG connectivity during installation

## References

- [Tutorial: Co-manage new devices](https://docs.microsoft.com/en-us/sccm/comanage/tutorial-co-manage-new-devices)
