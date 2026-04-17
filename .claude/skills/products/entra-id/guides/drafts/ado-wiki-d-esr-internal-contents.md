---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ESR/Workflow: ESR: Additional Resources/Workflow: ESR: Internal Contents"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FESR%2FWorkflow%3A%20ESR%3A%20Additional%20Resources%2FWorkflow%3A%20ESR%3A%20Internal%20Contents"
importDate: "2026-04-07"
type: troubleshooting-guide
---

**Summary**

This article provides a step-by-step guide on how to analyze an ESR ETL, focusing on reviewing "Sync Your Settings" data, such as Cloud data store logs, network trace, and Procmon, when a change is made to the "Region" Windows setting. The guide also covers common issues and troubleshooting steps.

[[_TOC_]]

# Introduction

In this article, we will talk about how to review "Sync Your Settings" data, such as Cloud data store logs, network trace, and Procmon, when a change is made to the "Region" Windows setting. Note that the logic in how the sync takes place from Source to AFS and AFS down to Destination remains the same for every other supported Windows setting.

The scenario included here is for a working scenario, so any deviations from here should help in narrowing down the issue further.

[**ADDS: CDS: Analyzing the ESR data while troubleshooting roaming of Windows settings**](https://internal.evergreen.microsoft.com/en-us/topic/c6227bb2-7de7-0f57-36c6-05923aca5684)

-----

# Sqlite Overview

**Sqlite** is an open-source **SQL database engine** that has also been licensed for use in the Windows OS.
**Reference**: https://www.osgwiki.com/wiki/SQLite

There are a number of technologies that utilize a Sqlite database to store information associated with settings on a Windows device. For example, the **Activities Feed database** cache is stored in Sqlite and is used by components that utilize the Cloud Data store APIs to sync settings to Azure (ESR, Clipboard, etc.).

There are third-party and open-source tools available for opening, reading, and analyzing **Sqlite databases**. However, these tools are not currently compliant for use on our managed desktops (Corp Joined or AAD joined) or for CSS engineers to request customers to install in their environments. The Windows Product Group has developed a tool called **staterepository.sqlite3.exe**, which is available for use by **FTEs** and is hosted on our internal build servers.

[CSS Tool for opening and analyzing Sqlite databases](https://internal.evergreen.microsoft.com/en-us/topic/d117964c-aa90-d08b-a8e4-7a043bfa74b0)

-----

# ESR Sync Configuration Issues

## Symptom 1

ESR sync is configured as enabled in the Azure Active Directory (AAD) tenant. After deploying a new Windows 10 device and joining it to AAD, the AAD user signs in to the device. The user checks the settings synchronization status and notices that sync is disabled, and the settings do not sync to and from other devices of the user. If the user enables the sync manually, they notice that the settings do not sync to and from other devices of the user.

For example, the user has changed on their Windows 10 device under "time & language" > "region" the "country or region" from the United Kingdom to Puerto Rico, and this change hasn't appeared on all the other Windows devices of the user after several days.

[**ADS: ESR: Settings on Windows 10 device are not synchronized to and from other Windows devices of the user**](https://internal.evergreen.microsoft.com/en-us/topic/82fdec86-9277-385f-82ee-fa5fde231ca0)

## Symptom 2

**Important**: This article was written in 2018, and there is a newer article with almost the same symptoms. Please check it too:

[**ADDS: ESR: Enterprise State Roaming (ESR) does not apply group policy settings which configure ESR synchronization options, for example, disabling password sync**](https://internal.evergreen.microsoft.com/en-us/topic/1044fe80-66fc-498b-2389-a05b27587a6a)

**Issue**: Enterprises that have enabled ESR on the tenant may use the following group policy on the Windows 10 devices to ensure that ESR "Sync settings" are disabled by default.
**Policy = Computer Configuration / Administrative templates / Windows Components / Sync your settings - "Do not Sync"**

When enabled, the option is given on the policy to allow the user to override this setting and allow them to make the choice using the "Sync settings" radio button in the "Sync your Settings" window. The policy is described as follows and implies that the default for the users when the override is selected should be for the "Sync settings" to be set to disabled.
If you enable this policy setting, "sync your settings" will be turned off, and none of the "sync your setting" groups will be synced on this PC.

[**ADDS: ESR: "Do not Sync" policy incorrectly defaults to "sync settings" being "ON" when using option to "Allow users to turn syncing on"**](https://internal.evergreen.microsoft.com/en-us/topic/e09d21f3-535d-409f-d564-87ebf5a9ee60)

-----

## Symptom 3

ESR sync is configured as enabled in the Azure Active Directory (AAD) tenant. After deploying a new Windows device and joining it to AAD, the AAD user signs in to the device. The user checks the settings synchronization status and notices that sync is enabled, but settings do not sync to and from other devices of the user.

For example, the user has changed on their new Windows device under "time & language" > "region" the "country or region" from the United Kingdom to Puerto Rico, and this change hasn't appeared on all the other Windows devices of the user after several days. After collecting TSS ESR logs, we will notice in the CDP ETL lines similar to these:

```
[7]3C18.3698::01/19/23-07:20:55.0384535 [Microsoft.Windows.CDP.Core.Error] [CDPError] message={"hr":"0x80070533","file":".\clouddataencryptionkeyfactory.cpp","line":363,"thread":"13976"}
[7]3C18.3698::01/19/23-07:20:55.0409577 [Microsoft.Windows.CDP.Core.Error] [CDPError] message={"hr":"0x80070533","exception_text":"","file":"..\clouddataencryptionkeymanager.cpp","line":151,"thread":"13976","text":"Creating a cloud key failed"}
```

The error code 0x80070533 translates to:
**for hex 0x533 / decimal 1331**
**ERROR_ACCOUNT_DISABLED winerror.h**

This user can't sign in because this account is currently disabled.

[**ADS: ESR: Settings on Windows device are not synchronized to and from other Windows devices of the user due to missing RMSBASIC subscription**](https://internal.evergreen.microsoft.com/en-us/topic/63c75170-6d6a-da02-379a-7b77a007e1b3)

-----

## Symptom 4

ESR sync is configured as enabled in the Azure Active Directory (AAD) tenant. After deploying a new Windows 10 device and joining it to AAD, the AAD user signs in to the device. The user checks the settings synchronization status and notices that sync is disabled, and the settings do not sync to and from other devices of the user. If the user enables the sync manually, they notice that the settings do not sync to and from other devices of the user.

For example, the user has changed on their Windows 10 device under "time & language" > "region" the "country or region" from the United Kingdom to Puerto Rico, and this change hasn't appeared on all the other Windows devices of the user after several days. After collecting TSS ESR logs, we will notice in the CDP ETL lines similar to these:

```
[1]23C8.1730::06/12/23-13:59:37.2260942 [Microsoft.Windows.CDP.Core] [CDPInfo] message={"text":"Activity 'B3FBD73F-E972-82F6-6E34-8D80BBB6FCFA',type 'CloudDataItem',permission scope 'Microsoft.Language.CultureSettings',status 'PublishAndUpdate ' blocked by source 'AppUserSettings',blockedOperationFlags 'PublishAndUpdate Download Delete ',permission scope ''"}
```

The important clues from the log are the entries indicating that we are **blocked by source 'AppUserSettings'** for the empty **permission scope**.

[**ADS: ESR: Settings on Windows 10 device are not synchronized to and from other Windows devices of the user**](https://internal.evergreen.microsoft.com/en-us/topic/82fdec86-9277-385f-82ee-fa5fde231ca0)

-----

## Symptom 5

ESR sync is configured as enabled in the Azure Active Directory (AAD) tenant. After deploying a new Windows device and joining it to AAD, the AAD user signs in to the device. The user checks the settings synchronization status and notices that sync is enabled, but settings do not sync to and from other devices of the user.

For example, the user has changed on their new Windows device under "time & language" > "region" the "country or region" from the United Kingdom to Puerto Rico, and this change hasn't appeared on all the other Windows devices of the user after several days. After collecting TSS ESR logs, we will notice in the CDP ETL lines similar to these:

```
[7]5690.6170::05/08/23-10:38:23.5793372 [Microsoft.Windows.CDP.Core] [CDPInfo] message={"text":"Activity 'AA71DF58-0030-555E-A633-BDFCAA3B6E0C',type 'CloudDataItem',permission scope 'Microsoft.Language.CultureSettings',status 'PublishAndUpdate ' blocked by source 'EnterpriseStateRoaming',blockedOperationFlags 'PublishAndUpdate Download Delete ',permission scope ''"}
```

The important clues from the log are the entries indicating that we are **blocked by source 'EnterpriseStateRoaming'** for the empty **permission scope**.

[**ADS: ESR: Settings on Windows device are not synchronized to and from other Windows devices of the user due to missing RMSBASIC subscription**](https://internal.evergreen.microsoft.com/en-us/topic/e576b2b1-0409-5510-731f-80f25558e80a)

-----

## Symptom 6

Users who are configured to roam Windows settings using ESR observe that they do not sync across devices.

[**ADS: ESR: Settings on Windows device are not synchronized to and from other Windows devices of the user due to missing RMSBASIC subscription**](https://internal.evergreen.microsoft.com/en-us/topic/63c75170-6d6a-da02-379a-7b77a007e1b3)
