# How to Deploy AppLocker Whitelist for Managed Installer via Intune

## Background

**Managed Installer** helps balance security and manageability when enforcing application control policies. It lets you automatically allow applications installed by a designated software distribution solution such as Microsoft Endpoint Configuration Manager or Intune.

Reference: [Configure authorized apps deployed with a WDAC-managed installer](https://docs.microsoft.com/en-us/windows/security/threat-protection/windows-defender-application-control/configure-authorized-apps-deployed-with-a-managed-installer)

## Problem

Intune does not natively support importing AppLocker XML policy for Managed Installer rule collection type.

## Workaround: Package as Win32 App

Since we can manually import the AppLocker policy via PowerShell, we can package the script and deploy as a Win32 app.

### Step 1: Create PowerShell Script

Save as `.ps1`:

```powershell
$policyFile = ".\Applocker_Intune2.xml"
Set-AppLockerPolicy -XmlPolicy $policyFile -Merge -ErrorAction SilentlyContinue
appidtel.exe start -mionly
# appidtel.exe restarts the AppLocker service to apply settings
```

### Step 2: Create AppLocker XML

Place `Applocker_Intune2.xml` in the same folder:

```xml
<AppLockerPolicy Version="1">
    <RuleCollection Type="ManagedInstaller" EnforcementMode="AuditOnly">
        <FilePublisherRule Id="4ca4410a-80c2-4abb-9d91-a0504c1876d7"
            Name="MICROSOFT.MANAGEMENT.SERVICES.INTUNEWINDOWSAGENT.EXE version 1.45.0.0+"
            UserOrGroupSid="S-1-1-0" Action="Allow">
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
            UserOrGroupSid="S-1-1-0" Action="Allow">
            <Conditions>
                <FilePathCondition Path="%PROGRAMFILES%\Microsoft Intune Management Extension\*" />
            </Conditions>
        </FilePathRule>
    </RuleCollection>
</AppLockerPolicy>
```

### Step 3: Package as .intunewin and Deploy

1. Use IntuneWinAppUtil to package the folder
2. Deploy as Win32 app in Intune
3. **Important**: Add restart action to ensure enforcement takes effect after reboot

### Verification

Check AppLocker event logs: `C:\Windows\System32\winevt` → AppLocker logs
