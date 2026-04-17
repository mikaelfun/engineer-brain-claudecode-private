---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Changes in Windows Server 2025 and Windows 11 24H2/Windows LAPS - 24H2 new features/LAPS: 24H2: Image Rollback Detection Feature"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Changes%20in%20Windows%20Server%202025%20and%20Windows%2011%2024H2%2FWindows%20LAPS%20-%2024H2%20new%20features%2FLAPS%3A%2024H2%3A%20Image%20Rollback%20Detection%20Feature"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1716502&Instance=1716502&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1716502&Instance=1716502&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary**:
This article describes the new image rollback detection feature in Windows Local Administrator Password Solution (LAPS) that helps maintain the integrity of local administrator passwords by detecting and mitigating the effects of image rollbacks.

[[_TOC_]]

#### What is image rollback detection?

Image rollback detection is a mechanism that allows Windows LAPS to detect when an image rollback has occurred. An image rollback can happen due to various reasons, such as Hyper-V snapshot reversion or image re-deployment products. When a rollback occurs, the password stored in Active Directory (AD) may no longer match the password stored locally on the device. If the password history feature is enabled and there are enough old passwords stored in the msLAPS-EncryptedPasswordHistory, IT administrators might be able to log in with one of those passwords. If not, the rollback leads to a "torn state." In this state, IT administrators may be unable to sign into the device using the persisted Windows LAPS password.

#### How does it work?

1. **GUID Attribute and Registry Value:** The feature introduces a new AD attribute called msLAPS-CurrentPasswordVersion and a new registry value called LastPasswordVersion. This attribute and registry string contain a random GUID written by Windows LAPS every time a new password is persisted in AD and saved locally.
2. **Comparison:** During each processing cycle, the GUID stored in msLAPS-CurrentPasswordVersion is queried and compared to the locally persisted copy.
3. **Password Rotation:** If the GUIDs are different, indicating a rollback, the password is immediately rotated to ensure consistency between AD and the local device.

#### Enabling the feature

To enable this feature, you need to run the latest version of the `Update-LapsADSchema` cmdlet. Once this is done, Windows LAPS will recognize the new attribute and begin using it. No additional policy settings are required to enable or configure this feature. It is always enabled once the new schema attribute is added.

#### Logging and troubleshooting

If the `Update-LapsADSchema` cmdlet is not run, Windows LAPS will log a 10108 warning event in the event log but will continue to function normally in all other respects.

#### Benefits

- **integrity:** By detecting and mitigating the effects of image rollbacks, this feature helps maintain the integrity of local administrator passwords.
- **Automatic Management:** The feature operates automatically once enabled, requiring minimal intervention from IT administrators.

#### Lab test and events sequence

Consider the following scenario:

1. You extended the Forest schema by running the latest version of the `Update-LapsADSchema` cmdlet.
2. You enabled the policy of Windows LAPS to back up passwords on Active Directory.
3. You created a snapshot of a Windows 11 client on 8/1/2024.
4. LAPS rotated the password on 8/10/2024.

 **Note:** All associated data was collected from an internal lab where the issue was successfully reproduced.

**Current password and password update time:**

```powershell
Get-LapsADPassword -Identity client1 -AsPlainText

ComputerName        : CLIENT1
DistinguishedName   : CN=CLIENT1,OU=LAPS,DC=contoso,DC=com
Account             : WLapsAdmin
Password            : PorcupineNapkinMoonshine
PasswordUpdateTime  : 8/10/2024 8:02:56 AM
ExpirationTimestamp : 9/9/2024 8:02:56 AM
Source              : EncryptedPassword
DecryptionStatus    : Success
AuthorizedDecryptor : CONTOSO\LAPSAuthorized
```

**Current password version GUID on the AD computer object:**

```powershell
$computer = Get-ADComputer -Identity client1 -Property msLAPS-CurrentPasswordVersion
[System.Guid]::New([Byte[]]$computer.'msLAPS-CurrentPasswordVersion')

Guid
----
88401e9c-a11f-45e3-acbf-194dd52c327a
```

**Current password version GUID saved locally on the computer's registry:**

```
reg query HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\LAPS\State /v LastPasswordVersion

HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\LAPS\State
    LastPasswordVersion    REG_SZ    88401e9c-a11f-45e3-acbf-194dd52c327a
```

5. You restored the client from the snapshot on 8/20/2024.
6. Upon startup, LAPS queried and compared LastPasswordVersion and msLAPS-CurrentPasswordVersion values, rotated the new password, updated the GUID, and logged the following events:

```
Log Name:      Microsoft-Windows-LAPS/Operational
Source:        Microsoft-Windows-LAPS
Date:          8/20/2024 5:31:45 AM
Event ID:      10015
Task Category: None
Level:         Information
User:          SYSTEM
Computer:      Client1.contoso.com
Description:
The managed account password needs to be updated due to one or more reasons (0x4000):
 
 The password version identifier stored in Active Directory does not match the locally stored version
```

```
Log Name:      Microsoft-Windows-LAPS/Operational
Source:        Microsoft-Windows-LAPS
Date:          8/20/2024 5:31:45 AM
Event ID:      10018
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      Client1.contoso.com
Description:
LAPS successfully updated Active Directory with the new password.
```

```
Log Name:      Microsoft-Windows-LAPS/Operational
Source:        Microsoft-Windows-LAPS
Date:          8/20/2024 5:31:45 AM
Event ID:      10020
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      Client1.contoso.com
Description:
LAPS successfully updated the local admin account with the new password.
 
 Account name: WLapsAdmin
 Account RID: 0x3EE
```

**The new password and expiration date:**

```powershell
Get-LapsADPassword -Identity client1 -AsPlainText

ComputerName        : CLIENT1
DistinguishedName   : CN=CLIENT1,OU=LAPS,DC=contoso,DC=com
Account             : WLapsAdmin
Password            : KleenexSkulkAbhorrence
PasswordUpdateTime  : 8/20/2024 5:31:45 AM
ExpirationTimestamp : 9/20/2024 5:31:45 AM
Source              : EncryptedPassword
DecryptionStatus    : Success
AuthorizedDecryptor : CONTOSO\LAPSAuthorized
```

**The new GUID as shown on the attribute and the registry of the client:**

```powershell
$computer = Get-ADComputer -Identity client1 -Property msLAPS-CurrentPasswordVersion
[System.Guid]::New([Byte[]]$computer.'msLAPS-CurrentPasswordVersion')

Guid
----
4af7b514-cb6d-4592-a9ea-a462a632ed86
```

```
reg query HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\LAPS\State /v LastPasswordVersion

HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\LAPS\State
    LastPasswordVersion    REG_SZ    4af7b514-cb6d-4592-a9ea-a462a632ed86
```