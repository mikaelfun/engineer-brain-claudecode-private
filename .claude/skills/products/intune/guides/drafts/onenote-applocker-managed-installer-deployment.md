# AppLocker Managed Installer — Deployment via Win32 App

> Source: OneNote — Mooncake POD Support Notebook / How To / Windows
> Quality: draft (pending SYNTHESIZE review)

## Overview

Configure the AppLocker "Managed Installer" rule collection type via Intune. Since Intune cannot natively deploy AppLocker XML policies, we package the PowerShell script + XML as a Win32 app.

## Background

**Managed Installer** automatically allows applications installed by a designated software distribution solution (e.g., Intune/SCCM). Ref: [Configure authorized apps deployed with a WDAC-managed installer](https://docs.microsoft.com/en-us/windows/security/threat-protection/windows-defender-application-control/configure-authorized-apps-deployed-with-a-managed-installer)

## Step 1: Create the PowerShell Script

Save as `Deploy-AppLocker.ps1`:

```powershell
$policyFile = ".\Applocker_Intune2.xml"
Set-AppLockerPolicy -XmlPolicy $policyFile -Merge -ErrorAction SilentlyContinue
appidtel.exe start -mionly
## restart applocker service to take in the settings
```

## Step 2: Create the AppLocker XML

Save as `Applocker_Intune2.xml` in the same folder:

```xml
<AppLockerPolicy Version="1">
    <RuleCollection Type="ManagedInstaller" EnforcementMode="AuditOnly">
        <FilePublisherRule Id="4ca4410a-80c2-4abb-9d91-a0504c1876d7"
            Name="MICROSOFT.MANAGEMENT.SERVICES.INTUNEWINDOWSAGENT.EXE, version 1.45.0.0 and above"
            Description="" UserOrGroupSid="S-1-1-0" Action="Allow">
            <Conditions>
                <FilePublisherCondition
                    PublisherName="O=MICROSOFT CORPORATION, L=REDMOND, S=WASHINGTON, C=US"
                    ProductName="MICROSOFT® INTUNE™"
                    BinaryName="MICROSOFT.MANAGEMENT.SERVICES.INTUNEWINDOWSAGENT.EXE">
                    <BinaryVersionRange LowSection="1.45.0.0" HighSection="*" />
                </FilePublisherCondition>
            </Conditions>
        </FilePublisherRule>
        <FilePathRule Id="e13de265-395c-48fd-8a55-67d7a19d3f5b"
            Name="%PROGRAMFILES%\Microsoft Intune Management Extension\*"
            Description="" UserOrGroupSid="S-1-1-0" Action="Allow">
            <Conditions>
                <FilePathCondition Path="%PROGRAMFILES%\Microsoft Intune Management Extension\*" />
            </Conditions>
        </FilePathRule>
    </RuleCollection>
</AppLockerPolicy>
```

## Step 3: Package and Deploy as Win32 App

1. Use IntuneWinAppUtil to package the folder containing both files
2. Deploy as Win32 app in Endpoint Manager
3. Add a **restart action** for the Win32 app to ensure enforcement takes effect with reboot

## Step 4: Verify

Check Event Log at: `C:\Windows\System32\winevt` → AppLocker logs

## Important Notes

- `EnforcementMode="AuditOnly"` is recommended initially to test before switching to `Enabled`
- The `appidtel.exe start -mionly` command restarts the AppLocker service
- Ensure Intune Management Extension binary version matches or exceeds `1.45.0.0`
