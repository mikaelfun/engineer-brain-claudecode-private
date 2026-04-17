---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Replication/Workflow: AD Replication appears slow or is delayed/Repadmin: Creating a temporary replication connection"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Replication%2FWorkflow%3A%20AD%20Replication%20appears%20slow%20or%20is%20delayed%2FRepadmin%3A%20Creating%20a%20temporary%20replication%20connection"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423210&Instance=423210&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423210&Instance=423210&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This guide provides detailed instructions on manually adding a replication connection using the `repadmin.exe` tool. It covers disabling the Knowledge Consistency Checker (KCC) connection translation, adding replication connections, initiating synchronization, and re-enabling KCC connection translation.

# Manually adding a replication connection using repadmin.exe

The add command will create a RepsFrom attribute on the destination domain controller for the specified naming context and initiate a replication request. During a normal replication cycle, the destination domain controller will request updates from the source domain controller. When creating temporary replication links between replication partners, the process could fail if the Knowledge Consistency Checker (KCC) starts while you are performing the procedure. The KCC will delete any replication links for which no corresponding connection object exists. Since these commands can take a very long time to complete as they trigger the replication of the corresponding naming context, it is important to ensure that KCC does not disturb the process. This is where you would use `+DISABLE_NTDSCONN_XLATE`, which effectively disables KCC's capability to translate connection objects to replication links.

## Disable KCC connection translation so that KCC doesnt remove our temporary replication connection:
```powershell
Repadmin /options ContosoDC1 +disable_ntdsconn_xlate
```

## Add a replication connection for the configuration partition of the server we want to source the partition from:
```powershell
Repadmin /add <Naming Context> <Dest DSA> <Source DSA> [/readonly] [/selsecrets]
<Source DSA> The source DSA must be specified by fully qualified computer name.

repadmin /add cn=configuration,dc=contoso,dc=com ContosoDC1.contoso.com LONEMEADC.Emea.contoso.com
One-way replication from source: LONEMEADC.Emea.contoso.com to dest: ContosoDC1.contoso.com established.
```

## Add a replication connection to the server for the domain partition that we need to source from:
```powershell
repadmin /add dc=emea,dc=contoso,dc=com ContosoDC1.contoso.com LONEMEADC.Emea.contoso.com /readonly

One-way replication from source: LONEMEADC.Emea.contoso.com to dest: ContosoDC1.contoso.com established.
```
*(Note: /readonly is specified if the partition is a Global Catalog (GC) non-writable partition; /selsecrets needs to be specified if the destination domain controller (DC) is a Read-Only Domain Controller (RODC).)*

If you need to replicate the other way, then just reverse the order of the server names in the commands.

## To begin a normal sync of the partition using the new replication connection:
```powershell
Repadmin /replicate <Dest_DSA_LIST> <Source DSA_NAME> <Naming Context> [/force] [/async] [/full] [/addref] [/readonly]

repadmin /replicate ContosoDC1.contoso.com LONEMEADC.Emea.contoso.com dc=emea,dc=contoso,dc=com /readonly
```

## To begin a full sync of that partition using the new replication connection:
```powershell
repadmin /replicate ContosoDC1.contoso.com LONEMEADC.Emea.contoso.com dc=emea,dc=contoso,dc=com /readonly /full
Sync from LONEMEADC.Emea.contoso.com to ContosoDC1.contoso.com completed successfully.
```

## Turn KCC connection translation back on when you no longer need the connection:
```powershell
Repadmin /options ContosoDC1 -disable_ntdsconn_xlate
```