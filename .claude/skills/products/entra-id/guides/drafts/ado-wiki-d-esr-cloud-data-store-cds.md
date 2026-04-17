---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ESR/Workflow: ESR: Cloud Data Store (CDS)"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FESR%2FWorkflow%3A%20ESR%3A%20Cloud%20Data%20Store%20(CDS)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

**Summary:** This workflow provides knowledge about SyncYourSettings, also known as Enterprise State Roaming (ESR). It outlines the history, key points, and the process of syncing settings between Windows machines using the Cloud Data Storage (CDS) and Activity Feed Service (AFS) frameworks.

[[_TOC_]]

# Introduction
This workflow provides knowledge about SyncYourSettings, also known as Enterprise State Roaming (ESR).

# History
Previously, ESR used the SettingSyncFramework (SSF) to sync Windows settings between Windows 10 machines. Then, Cloud Data Storage (CDS) was introduced as a replacement for SSF starting from Windows 10 version 1809 (RS5). This meant settings that were previously roaming using the SSF framework had to be gradually migrated to CDS. The migration started with Wi-Fi profiles using CDS as the sync engine.

### Key points

1. Individual setting owners gradually started migrating to CDS/AFS.
2. Edge Chromium browser owners used their own sync engine, which meant their sync framework wouldn't rely on CDS. Any sync issues related to its component will require the Edge support team.
3. Roaming of Taskbar and Themes were deprecated and are not synced via CDS anymore.

From Windows 10 version 21H1 and above, and Windows 11, every setting documented [here](https://learn.microsoft.com/en-us/azure/active-directory/devices/enterprise-state-roaming-windows-settings-reference) is roamed using the CDS framework.

For Customer Service Support (CSS), we should stop collecting/reviewing data that specifically belongs to the SettingSync framework while troubleshooting ESR scenarios. Data specific to this is included below:

1. SettingSync operational and debug event log
2. SettingSync ETW tracing
3. SettingSync registry configuration information
4. Backend Kailani database

# CDS/AFS overview
Read these [changes](https://internal.evergreen.microsoft.com/en-us/topic/adds-esr-win10-rs5-changes-in-esr-starting-with-win10-rs-5-1809-onwards-00b74d46-5dee-caaa-b630-3ac29fdc44d6) in ESR with Windows 10 version 1809 and above to know more about Kailani and the CDS backend database.

# Terminologies

**MachineA** - Source machine where the change to a Windows setting is being initiated.

**MachineB** - Destination machine that will get the change.

**Activity Feed Service (AFS)** [Cloud side component] A cloud storage solution that stores the Windows settings data in encrypted form in the cloud.

**Cloud Data Storage (CDS)** [Client side component] A storage framework for storing and retrieving user data in the cloud. They include a set of client-side APIs that have capabilities such as:
1. Storage and retrieval of data
2. Caching of cloud data locally
3. Conflict resolution algorithms
4. Coordination of sync with AFS

**Activity Feed Client (AFC)** - [Client side component] that communicates directly with the AFS cloud service. It also maintains a SQL database locally to store configuration and user data. Its job is to sync with AFS.

**Windows Notification Service (WNS)** [Cloud side component] A cloud service that sends raw updates or push notifications from any cloud service to client endpoints.

# Short overview of sync flow

1. MachineA syncs with AFS cloud service.
2. AFS cloud service notifies WNS that there was a change.
3. WNS routes the raw notification request to the appropriate destination, MachineB.
4. MachineB receives this push notification and understands this is from AFS and thus initiates a sync from AFS cloud.

# How it works
1. **MachineA syncs with AFS cloud service.**

   It always starts with an Azure Active Directory (AAD) user making a change to any of the supported Windows settings in MachineA. CDS only supports roaming of user data, that is, data stored under HKCU. CDS on the client should sync this data to AFS. Before this, the data is first processed locally using conflict resolution and versioning for a winner. The cloud and local versions of the data are always cached locally. The winner is encrypted and then synced to AFS.

2. **AFS cloud service notifies WNS that there was a change.**

   AFS needs to notify WNS about a raw notification so that WNS can notify appropriate clients with these updates, which in turn helps clients to determine there was a change pertaining to AFS and needs to initiate a sync request from AFS.

3. **WNS routes the raw notification request to the appropriate destination, MachineB.**

   The WNS cloud service needs to send a raw notification to the destination. The Windows Push Notification Service (WpnService), which is a client-side component, will be the receiving end of this push notification.

   From this push notification, the destination determines that this change is deemed to be from AFS.

4. **MachineB receives this push notification and understands this is from AFS and thus initiates a sync from AFS cloud.**

# Source
https://internal.evergreen.microsoft.com/en-us/topic/adds-cds-analyzing-the-esr-data-while-troub
