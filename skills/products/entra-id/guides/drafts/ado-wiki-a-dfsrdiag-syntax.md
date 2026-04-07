---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/DFSR/Workflow: DFSR: Useful Tools and Commands/DFSRDIAG - Syntax"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FDFSR%2FWorkflow%3A%20DFSR%3A%20Useful%20Tools%20and%20Commands%2FDFSRDIAG%20-%20Syntax"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# DFSRDIAG — DFS Replication Diagnostics Command Reference

Prerequisite: DFS Management Tools must be installed:
`Feature - Remote Server Administration Tools\Role Administration Tools\File Services Tools\DFS Management Tools`

## SyncNow

Forces replication over a given connection, ignoring the schedule for specified minutes.

```
DFSRDIAG SyncNow /Partner:<name> /RGName:<name> /Time:<minutes> [/Member:<name>]
```

## StopNow

Stops replication over a given connection for specified minutes.

```
DFSRDIAG StopNow /Partner:<name> /RGName:<name> /Time:<minutes> [/Member:<name>]
```

## PollAD

Triggers a sync with AD Domain Services global information store.

```
DFSRDIAG PollAD [/Member:<name>]
```

## DumpAdCfg

Dumps AD configuration settings for a member.

```
DFSRDIAG DumpAdCfg [/Member:<name>] [/DC:<name>] [/RGSecDesc]
```

## StaticRPC

Sets a static RPC port for DFS Replication.

```
DFSRDIAG StaticRPC /Port:<number> [/Member:<name>]
```

## Backlog

Displays replication backlog between two members.

```
DFSRDIAG Backlog [/ReceivingMember:<name>] /SendingMember:<name> /RGName:<name> /RFName:<name>
```

## GUID2NAME

Translates GUIDs to user-friendly names.

```
DFSRDIAG GUID2NAME /GUID:<guid> /RGName:<name> [/Domain:<name>]
```

## PropagationTest

Tests replication by dropping a test file.

```
DFSRDIAG PropTest /RGName:<name> /RFName:<name> [/Member:<name>] [/TestFileName:<name>] [/Cleanup:[name]]
```

## PropagationReport

Generates tracking report for propagation test file.

```
DFSRDIAG PropReport /RGName:<name> /RFName:<name> /TestFileName:<name> /ReportFileName:<path> [/Domain:<name>]
```

## FileHash

Displays hash value for a file as computed by DFSR.

```
DFSRDIAG FileHash /FilePath:<path>
```

## IDRecord

Displays contents of a replicated file's ID record.

```
DFSRDIAG IDRecord /FilePath:<path> | /UID:<uid> [/Member:<name>] [/All]
```

## ReplicationState

Displays updates currently being transferred on inbound/outbound connections.

```
DFSRDIAG ReplState [/Member:<name>] [/All]
```

## Common Parameters

All commands support:
- `[/Member]` or `[/Mem]` — target member (defaults to local)
- `[/Help]` or `[/?]` — display help
- `[/Verbose]` or `[/V]` — enable verbose logging
