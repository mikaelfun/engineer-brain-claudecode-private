---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/TSGs/Network File Systems (NFS)/Permission Issues NFS 4.1_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20All%20Topics%2FTSGs%2FNetwork%20File%20Systems%20%28NFS%29%2FPermission%20Issues%20NFS%204.1_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Files-All-Topics
- cw.TSG
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::


[[_TOC_]]


# Overview

This TSG covers permission issues customer could run into while using NFS 4.1 shared in their environment. 

## Customer doesn't have read access

    $ cat testfilenoaccess
    cat: testfilenoaccess: Permission denied

Check current user's UID nd GID. Example below:

    $ id -u
    1000

    $ id -g
    1000

Check permissions on the file/directory. 

$ ls -ln testfilenoaccess

-rwx<font color="red">------</font> 1 <font color="aqua">0 0</font> 0 Sep 10 11:41 testfilenoaccess

The file is owned by user with <font color="aqua">UID=0 and GID=0</font> and there is no <font color="red">READ</font> permission to OTHERS. 

**Solution:** Give user READ permissions by running the following commands. 

    $ sudo chmod 0744 testfilenoaccess

or change owner to the user with UID=1000

    $ sudo chown 1000 testfilenoaccess

Lookup dgrep log to find the error corresponding to this failure. https://jarvis-west.dc.ad.msft.net/5AECE766. Filter for "Nfs4Open" operation. 

![image.png](/.attachments/SME-Topics/Azure-Files-All-Topics/image-e731ee14-01c9-4666-b4dd-ed6cc4804ef8.png)

If you want to further troubleshoot this issue, use ASC "XDS(Verbose) Log Download" functionality to pull up server logs. Copy the activity ID from the dgrep result and plug it in ASC as shown below. 

![image.png](/.attachments/SME-Topics/Azure-Files-All-Topics/image-12f788a8-1c3e-4e48-9f96-601d0f5503b6.png)

![image.png](/.attachments/SME-Topics/Azure-Files-All-Topics/image-2a12af2a-1990-40c7-8f42-98c37f8382b4.png)

Click on the following button to view the logs. The logs can take up to 10 mins to generate. 

![image.png](/.attachments/SME-Topics/Azure-Files-All-Topics/image-af8b10f7-90da-4bdf-afdc-9f628a75fe36.png)


Sample logs for this scenario:

XNfsServer logs:

perf: XNfsServer.exe: [NfsCompound] PerfCounters: Account= NfsProcedure=Compound NfsCommand=Nfs4Sequence Operation=OP_SEQUENCE on Container= with Status=Success StatusCode=0x0 ResponseCode=0x0 NfsCompoundIndex=0 NfsCompoundSize=5 Client=127.0.0.1:65276 SessionID=0x0100000000000000030000000000cd80 (1:0:3:2160918528) SeqId=0x1 XID=0x2e3c19ca RequestVersion=4.1 RequestSize=36 ResponseSize=44 ProcessingTimeInMs=0.000 TotalTableServerTimeInMs=0.000 TotalTableServerRoundTripCount=0 LastTableServerInstanceName= LastTableServerErrorCode=0x00000000 TotalXStreamOpenTimeInMs=0.000 TotalXStreamOpenRoundTripCount=0 TotalXStreamIOTimeInMs=0.000 TotalXStreamIORoundTripCount=0 TotalXFETimeInMs=0.000 TotalRetryBackoffTimeInMs=0.000 TotalRetryBackoffCount=0 TotalShareThrottleBackoffTimeInMs=0.000 TotalShareThrottleBackoffCount=0 HasBillingInfo=0 FileName= FileId=0 OperationParameters= 
09/10/2020 18:49:21.842939 - pid: 38060 tid: 28624 @ NfsPerfLogPerOperation (nfsmeasurements.cpp:1303) 
on XNfsServer_IN_0  / cosmosPerfLog_XNfsServer.exe_000000.log  /  B8962463-8023-0000-00A3-873467000000  /  B8962463-8023-0000-00A3-873467000000 

perf: XNfsServer.exe: [NfsCompound] PerfCounters: Account=testaccount1 NfsProcedure=Compound NfsCommand=Nfs4PutFh Operation=OP_PUTFH on Container= with Status=Success StatusCode=0x0 ResponseCode=0x0 NfsCompoundIndex=1 NfsCompoundSize=5 Client=127.0.0.1:65276 SessionID=0x0100000000000000030000000000cd80 (1:0:3:2160918528) SeqId=0x1 XID=0x2e3c19ca RequestVersion=4.1 RequestSize=72 ResponseSize=8 ProcessingTimeInMs=0.000 TotalTableServerTimeInMs=0.000 TotalTableServerRoundTripCount=0 LastTableServerInstanceName= LastTableServerErrorCode=0x00000000 TotalXStreamOpenTimeInMs=0.000 TotalXStreamOpenRoundTripCount=0 TotalXStreamIOTimeInMs=0.000 TotalXStreamIORoundTripCount=0 TotalXFETimeInMs=0.000 TotalRetryBackoffTimeInMs=0.000 TotalRetryBackoffCount=0 TotalShareThrottleBackoffTimeInMs=0.000 TotalShareThrottleBackoffCount=0 HasBillingInfo=1 FileName= FileId=11529285414812647424 OperationParameters= 
09/10/2020 18:49:21.843017 - pid: 38060 tid: 28624 @ NfsPerfLogPerOperation (nfsmeasurements.cpp:1303) 
on XNfsServer_IN_0  / cosmosPerfLog_XNfsServer.exe_000000.log  /  B8962463-8023-0000-00A3-873467000000  /  B8962463-8023-0000-00A3-873467000000 

perf: XNfsServer.exe: [NfsCompound] PerfCounters: Account=testaccount1 NfsProcedure=Compound NfsCommand=**Nfs4Open** Operation=OP_OPEN on Container=nfsshare301D687A123086C28 with Status=Failure StatusCode=0x830a330d ResponseCode=0xd NfsCompoundIndex=2 NfsCompoundSize=5 Client=127.0.0.1:65276 SessionID=0x0100000000000000030000000000cd80 (1:0:3:2160918528) SeqId=0x1 XID=0x2e3c19ca RequestVersion=4.1 RequestSize=60 ResponseSize=8 ProcessingTimeInMs=6.013 TotalTableServerTimeInMs=2.373 TotalTableServerRoundTripCount=1 LastTableServerInstanceName=rddevfabric$xtableserver_in_0 LastTableServerErrorCode=0x80004005 TotalXStreamOpenTimeInMs=0.000 TotalXStreamOpenRoundTripCount=0 TotalXStreamIOTimeInMs=0.000 TotalXStreamIORoundTripCount=0 TotalXFETimeInMs=3.628 TotalRetryBackoffTimeInMs=0.000 TotalRetryBackoffCount=0 TotalShareThrottleBackoffTimeInMs=0.000 TotalShareThrottleBackoffCount=0 HasBillingInfo=1 FileName= FileId=11529285414812647424 OperationParameters= 
09/10/2020 18:49:21.848732 - pid: 38060 tid: 28624 @ NfsPerfLogPerOperation (nfsmeasurements.cpp:1303) 
on XNfsServer_IN_0  / cosmosPerfLog_XNfsServer.exe_000000.log  /  B8962463-8023-0000-00A3-873467000000  /  B8962463-8023-0000-00A3-873467000000 

perf: XNfsServer.exe: [NfsCompound] PerfCounters: Account=testaccount1 NfsProcedure=Compound NfsMasterCommand=**Nfs4Open** on Container=nfsshare301D687A123086C28 with Status=PartialSuccess StatusCode=0x0 ResponseCode=0x0 NfsCompoundSize=5 Client=127.0.0.1:65276 SessionID=0x0100000000000000030000000000cd80 (1:0:3:2160918528) XID=0x2e3c19ca RequestVersion=4.1 RequestSize=312 ResponseSize=100 TimeInMs=9.003 ProcessingTimeInMs=9.003 TotalTableServerTimeInMs=2.373 TotalTableServerRoundTripCount=1 LastTableServerInstanceName=rddevfabric$xtableserver_in_0 LastTableServerErrorCode=0x80004005 TotalXStreamOpenTimeInMs=0.000 TotalXStreamOpenRoundTripCount=0 TotalXStreamIOTimeInMs=0.000 TotalXStreamIORoundTripCount=0 TotalXFETimeInMs=6.627 TotalRetryBackoffTimeInMs=0.000 TotalRetryBackoffCount=0 TotalShareThrottleBackoffTimeInMs=0.000 TotalShareThrottleBackoffCount=0 
09/10/2020 18:49:21.849193 - pid: 38060 tid: 58228 @ NfsPerfPerProcedure (nfsmeasurements.cpp:963) 
on XNfsServer_IN_0  / cosmosPerfLog_XNfsServer.exe_000000.log  /  B8962463-8023-0000-00A3-873467000000  /  B8962463-8023-0000-00A3-873467000000 

error: XNfsServer.exe: **Returning Failure hr = 0x830a330d** 
09/10/2020 18:49:21.848298 - pid: 38060 tid: 44076 @ XStore::XTable::RowCommand::ExecuteAsync_EndExecute (rowcommandsclient.cpp:8245) 
on XNfsServer_IN_0  / cosmosErrorLog_XNfsServer.exe_000000.log  /  B8962463-8023-0000-00A3-873467000000  /  B8962463-8023-0000-00A3-873467000000 


XTableServer logs:

info: XTableServer.exe: NFS_OPEN [BLOB] account=testaccount101D68794479DF1E6 container=nfsshare301D687A123086C28 keyFileId=11529285414812647424 blobName= ParentId=0 HandleId=11241055038660935680 **owner=1000 group=1000 BlobActivityId={2ABC897B-E6B4-4293-9967-DEACE4B0258B} Create=0 FileSizeValid=0 InitialFileSize=0 DesiredAccess=1** ShareAccess=3 
09/10/2020 18:49:21.847528 - pid: 55568 tid: 58952 @ XStore::XTable::Server::NfsOpenCommandServer::ExecuteCommandBlob (nfsopencommandserver.cpp:1156) 
on XTableServer_IN_0  / cosmosLog_XTableServer.exe_000149.bin  /  B8962463-8023-0000-00A3-87346706C6DE  /  B8962463-8023-0000-00A3-873467000000 

…

info: XTableServer.exe: **NfsCommand::AccessCheck() objectOwnerId=0 objectGroupId=0 objectModebits=700 objectIsDir=No desiredAccess=4** 
09/10/2020 18:49:21.847732 - pid: 55568 tid: 58952 @ XStore::XTable::Server::NfsCommand::AccessCheck (nfscommand.cpp:1428) 
on XTableServer_IN_0  / cosmosLog_XTableServer.exe_000149.bin  /  B8962463-8023-0000-00A3-87346706C6DE  /  B8962463-8023-0000-00A3-873467000000 

info: **XTableServer.exe: NfsCommand::AccessCheck() grantedAccess=0** 
09/10/2020 18:49:21.847733 - pid: 55568 tid: 58952 @ XStore::XTable::Server::NfsCommand::AccessCheck (nfscommand.cpp:1437) 
on XTableServer_IN_0  / cosmosLog_XTableServer.exe_000149.bin  /  B8962463-8023-0000-00A3-87346706C6DE  /  B8962463-8023-0000-00A3-873467000000

error: XTableServer.exe: **Returning Failure hr = 0x830a330d** 
09/10/2020 18:49:21.847738 - pid: 55568 tid: 58952 @ XStore::XTable::Server::NfsOpenCommandServer::ExecuteCommandBlob (nfsopencommandserver.cpp:1248) 
on XTableServer_IN_0  / cosmosErrorLog_XTableServer.exe_000007.log  /  B8962463-8023-0000-00A3-87346706C6DE  /  B8962463-8023-0000-00A3-873467000000 

## Customer doesn't have write access

    $ echo "hello world!" | cat > testfilenoaccess
    -bash: testfilenoaccess: Permission denied

Check current user's UID nd GID. Example below:

    $ id -u
    1000

    $ id -g
    1000



Check permissions on the file/directory. 

$ ls -ln testfilenoaccess

-rwxr--<font color="red">r--</font> 1 <font color="aqua">0 0</font> 0 Sep 10 11:41 testfilenoaccess

The file is owned by user with <font color="aqua">UID=0 and GID=0</font> and there is no <font color="red">WRITE</font> permission to OTHERS. 

**Solution:** Give user WRITE permission to the file by running the following command:

    $ sudo chmod 0777 testfilenoaccess

or change owner to the user with UID=1000

    $ sudo chown 1000 testfilenoaccess


Lookup dgrep log to find the error corresponding to this failure. https://jarvis-west.dc.ad.msft.net/5AECE766. Filter for "Nfs4Open" operation. 

![image.png](/.attachments/SME-Topics/Azure-Files-All-Topics/image-e731ee14-01c9-4666-b4dd-ed6cc4804ef8.png)

If you want to further troubleshoot this issue, use ASC "XDS(Verbose) Log Download" functionality to pull up server logs. Copy the activity ID from the dgrep result and plug it in ASC as shown below. 

![image.png](/.attachments/SME-Topics/Azure-Files-All-Topics/image-12f788a8-1c3e-4e48-9f96-601d0f5503b6.png)

![image.png](/.attachments/SME-Topics/Azure-Files-All-Topics/image-2a12af2a-1990-40c7-8f42-98c37f8382b4.png)

Click on the following button to view the logs. The logs can take up to 10 mins to generate. 

![image.png](/.attachments/SME-Topics/Azure-Files-All-Topics/image-af8b10f7-90da-4bdf-afdc-9f628a75fe36.png)


Sample logs for this scenario:

XNfsServer logs:

perf: XNfsServer.exe: [NfsCompound] PerfCounters: Account= NfsProcedure=Compound NfsCommand=Nfs4Sequence Operation=OP_SEQUENCE on Container= with Status=Success StatusCode=0x0 ResponseCode=0x0 NfsCompoundIndex=0 NfsCompoundSize=5 Client=127.0.0.1:65276 SessionID=0x0100000000000000030000000000cd80 (1:0:3:2160918528) SeqId=0x1 XID=0x523c19ca RequestVersion=4.1 RequestSize=36 ResponseSize=44 ProcessingTimeInMs=0.000 TotalTableServerTimeInMs=0.000 TotalTableServerRoundTripCount=0 LastTableServerInstanceName= LastTableServerErrorCode=0x00000000 TotalXStreamOpenTimeInMs=0.000 TotalXStreamOpenRoundTripCount=0 TotalXStreamIOTimeInMs=0.000 TotalXStreamIORoundTripCount=0 TotalXFETimeInMs=0.000 TotalRetryBackoffTimeInMs=0.000 TotalRetryBackoffCount=0 TotalShareThrottleBackoffTimeInMs=0.000 TotalShareThrottleBackoffCount=0 HasBillingInfo=0 FileName= FileId=0 OperationParameters= 
09/10/2020 18:59:37.132097 - pid: 38060 tid: 57088 @ NfsPerfLogPerOperation (nfsmeasurements.cpp:1303) 
on XNfsServer_IN_0  / cosmosPerfLog_XNfsServer.exe_000000.log  /  B89624B3-8023-0000-00A4-873467000000  /  B89624B3-8023-0000-00A4-873467000000 

perf: XNfsServer.exe: [NfsCompound] PerfCounters: Account=testaccount1 NfsProcedure=Compound NfsCommand=Nfs4PutFh Operation=OP_PUTFH on Container= with Status=Success StatusCode=0x0 ResponseCode=0x0 NfsCompoundIndex=1 NfsCompoundSize=5 Client=127.0.0.1:65276 SessionID=0x0100000000000000030000000000cd80 (1:0:3:2160918528) SeqId=0x1 XID=0x523c19ca RequestVersion=4.1 RequestSize=72 ResponseSize=8 ProcessingTimeInMs=0.000 TotalTableServerTimeInMs=0.000 TotalTableServerRoundTripCount=0 LastTableServerInstanceName= LastTableServerErrorCode=0x00000000 TotalXStreamOpenTimeInMs=0.000 TotalXStreamOpenRoundTripCount=0 TotalXStreamIOTimeInMs=0.000 TotalXStreamIORoundTripCount=0 TotalXFETimeInMs=0.000 TotalRetryBackoffTimeInMs=0.000 TotalRetryBackoffCount=0 TotalShareThrottleBackoffTimeInMs=0.000 TotalShareThrottleBackoffCount=0 HasBillingInfo=1 FileName= FileId=11529285414812647424 OperationParameters= 
09/10/2020 18:59:37.132187 - pid: 38060 tid: 57088 @ NfsPerfLogPerOperation (nfsmeasurements.cpp:1303) 
on XNfsServer_IN_0  / cosmosPerfLog_XNfsServer.exe_000000.log  /  B89624B3-8023-0000-00A4-873467000000  /  B89624B3-8023-0000-00A4-873467000000 

perf: XNfsServer.exe: [NfsCompound] PerfCounters: Account=testaccount1 NfsProcedure=Compound NfsCommand=**Nfs4Open** Operation=OP_OPEN on Container=nfsshare301D687A123086C28 with Status=Failure StatusCode=0x830a330d ResponseCode=0xd NfsCompoundIndex=2 NfsCompoundSize=5 Client=127.0.0.1:65276 SessionID=0x0100000000000000030000000000cd80 (1:0:3:2160918528) SeqId=0x1 XID=0x523c19ca RequestVersion=4.1 RequestSize=60 ResponseSize=8 ProcessingTimeInMs=2.9963 TotalTableServerTimeInMs=1.223 TotalTableServerRoundTripCount=1 LastTableServerInstanceName=rddevfabric$xtableserver_in_0 LastTableServerErrorCode=0x80004005 TotalXStreamOpenTimeInMs=0.000 TotalXStreamOpenRoundTripCount=0 TotalXStreamIOTimeInMs=0.000 TotalXStreamIORoundTripCount=0 TotalXFETimeInMs=1.773 TotalRetryBackoffTimeInMs=0.000 TotalRetryBackoffCount=0 TotalShareThrottleBackoffTimeInMs=0.000 TotalShareThrottleBackoffCount=0 HasBillingInfo=1 FileName= FileId=11529285414812647424 OperationParameters= 
09/10/2020 18:59:37.135124 - pid: 38060 tid: 57088 @ NfsPerfLogPerOperation (nfsmeasurements.cpp:1303) 
on XNfsServer_IN_0  / cosmosPerfLog_XNfsServer.exe_000000.log  /  B89624B3-8023-0000-00A4-873467000000  /  B89624B3-8023-0000-00A4-873467000000 

perf: XNfsServer.exe: [NfsCompound] PerfCounters: Account=testaccount1 NfsProcedure=Compound NfsMasterCommand=Nfs4Open on Container=nfsshare301D687A123086C28 with Status=PartialSuccess StatusCode=0x0 ResponseCode=0x0 NfsCompoundSize=5 Client=127.0.0.1:65276 SessionID=0x0100000000000000030000000000cd80 (1:0:3:2160918528) XID=0x523c19ca RequestVersion=4.1 RequestSize=312 ResponseSize=100 TimeInMs=2.9963 ProcessingTimeInMs=2.9963 TotalTableServerTimeInMs=1.223 TotalTableServerRoundTripCount=1 LastTableServerInstanceName=rddevfabric$xtableserver_in_0 LastTableServerErrorCode=0x80004005 TotalXStreamOpenTimeInMs=0.000 TotalXStreamOpenRoundTripCount=0 TotalXStreamIOTimeInMs=0.000 TotalXStreamIORoundTripCount=0 TotalXFETimeInMs=1.773 TotalRetryBackoffTimeInMs=0.000 TotalRetryBackoffCount=0 TotalShareThrottleBackoffTimeInMs=0.000 TotalShareThrottleBackoffCount=0 
09/10/2020 18:59:37.135367 - pid: 38060 tid: 28624 @ NfsPerfPerProcedure (nfsmeasurements.cpp:963) 
on XNfsServer_IN_0  / cosmosPerfLog_XNfsServer.exe_000000.log  /  B89624B3-8023-0000-00A4-873467000000  /  B89624B3-8023-0000-00A4-873467000000 

error: XNfsServer.exe: **Returning Failure hr = 0x830a330d** 
09/10/2020 18:59:37.134961 - pid: 38060 tid: 44076 @ XStore::XTable::RowCommand::ExecuteAsync_EndExecute (rowcommandsclient.cpp:8245) 
on XNfsServer_IN_0  / cosmosErrorLog_XNfsServer.exe_000000.log  /  B89624B3-8023-0000-00A4-873467000000  /  B89624B3-8023-0000-00A4-873467000000 


XTableServer logs:

info: XTableServer.exe: NFS_OPEN [BLOB] account=testaccount101D68794479DF1E6 container=nfsshare301D687A123086C28 keyFileId=11529285414812647424 blobName= ParentId=0 HandleId=18158584066302017536 owner=1000 group=1000 BlobActivityId={DD6B04FF-96A2-478F-8055-007D55EA56FE} Create=0 FileSizeValid=0 InitialFileSize=0 DesiredAccess=2 ShareAccess=3 
09/10/2020 18:59:37.134142 - pid: 55568 tid: 7268 @ XStore::XTable::Server::NfsOpenCommandServer::ExecuteCommandBlob (nfsopencommandserver.cpp:1156) 
on XTableServer_IN_0  / cosmosLog_XTableServer.exe_000163.bin  /  B89624B3-8023-0000-00A4-8734670634BF  /  B89624B3-8023-0000-00A4-873467000000 

…

info: XTableServer.exe: **NfsCommand::AccessCheck() objectOwnerId=0 objectGroupId=0 objectModebits=744 objectIsDir=No desiredAccess=2** 
09/10/2020 18:59:37.134405 - pid: 55568 tid: 7268 @ XStore::XTable::Server::NfsCommand::AccessCheck (nfscommand.cpp:1428) 
on XTableServer_IN_0  / cosmosLog_XTableServer.exe_000163.bin  /  B89624B3-8023-0000-00A4-8734670634BF  /  B89624B3-8023-0000-00A4-873467000000 

info: XTableServer.exe: **NfsCommand::AccessCheck() grantedAccess=4** 
09/10/2020 18:59:37.134406 - pid: 55568 tid: 7268 @ XStore::XTable::Server::NfsCommand::AccessCheck (nfscommand.cpp:1437) 
on XTableServer_IN_0  / cosmosLog_XTableServer.exe_000163.bin  /  B89624B3-8023-0000-00A4-8734670634BF  /  B89624B3-8023-0000-00A4-873467000000 

error: XTableServer.exe: **Returning Failure hr = 0x830a330d** 
09/10/2020 18:59:37.134411 - pid: 55568 tid: 7268 @ XStore::XTable::Server::NfsOpenCommandServer::ExecuteCommandBlob (nfsopencommandserver.cpp:1248) 
on XTableServer_IN_0  / cosmosErrorLog_XTableServer.exe_000007.log  /  B89624B3-8023-0000-00A4-8734670634BF  /  B89624B3-8023-0000-00A4-873467000000 


## Customer can not list a directory

    $ ls -ln testdirnoaccess/
    ls: cannot open directory 'testdirnoaccess/': Permission denied

Check current user's UID nd GID. Example below:

    $ id -u
    1000

    $ id -g
    1000

The directory is owned by user with <font color = "aqua">UID=0 and GID=0</font> and there is no <font color = "red">EXECUTE permission to OTHERS</font>

$ stat testdirnoaccess/

  File: testdirnoaccess/

  Size: 64              Blocks: 1          IO Block: 32768  directory

Device: 39h/57d Inode: 16140971433240035328  Links: 2

Access: (0700/drwx---<font color = "red">---</font>)  Uid: (<font color = "aqua">    0/    root</font>)   Gid: (    0/    root)

Access: 2020-09-10 11:43:22.752404900 -0700

Modify: 2020-09-10 11:43:22.752404900 -0700

Change: 2020-09-10 11:43:22.752404900 -0700

 Birth: -

**Solution:** Give user EXECUTE permission to the file by running the following command:

    $ sudo chmod 0755 testdirnoaccess

or change owner to the user with UID=1000

    $ sudo chown 1000 testdirnoaccess

## Users cant get super user permissions with sudo or root user

    $ touch testfile
    $ ls -ln
    total 0
    -rw-rw-r-- 1 1000 1000 0 Sep 10 14:56 testfile

    $ sudo chown root testfile
    chown: changing ownership of 'testfile': Operation not permitted

**Solution:** Check file share properties using ASC. If XFileContainerRootSquash is equal to RootSquash or AllSquash then the behavior is expected. Advise the customer to change container properties to NoRootSquash.


Lookup dgrep log to find the error corresponding to this failure. https://jarvis-west.dc.ad.msft.net/5AECE766. Filter for "Nfs4Open" operation. 

![image.png](/.attachments/SME-Topics/Azure-Files-All-Topics/image-e731ee14-01c9-4666-b4dd-ed6cc4804ef8.png)

If you want to further troubleshoot this issue, use ASC "XDS(Verbose) Log Download" functionality to pull up server logs. Copy the activity ID from the dgrep result and plug it in ASC as shown below. 

![image.png](/.attachments/SME-Topics/Azure-Files-All-Topics/image-12f788a8-1c3e-4e48-9f96-601d0f5503b6.png)

![image.png](/.attachments/SME-Topics/Azure-Files-All-Topics/image-2a12af2a-1990-40c7-8f42-98c37f8382b4.png)

Click on the following button to view the logs. The logs can take up to 10 mins to generate. 

![image.png](/.attachments/SME-Topics/Azure-Files-All-Topics/image-af8b10f7-90da-4bdf-afdc-9f628a75fe36.png)


Sample logs for this scenario:

XNfsServer logs:

perf: XNfsServer.exe: [NfsCompound] PerfCounters: Account= NfsProcedure=Compound NfsCommand=Nfs4Sequence Operation=OP_SEQUENCE on Container= with Status=Success StatusCode=0x0 ResponseCode=0x0 NfsCompoundIndex=0 NfsCompoundSize=4 Client=127.0.0.1:49977 SessionID=0x0200000000000000050000000000cd80 (2:0:5:2160918528) SeqId=0x2 XID=0x31bc2101 RequestVersion=4.1 RequestSize=36 ResponseSize=44 ProcessingTimeInMs=1.004 TotalTableServerTimeInMs=0.000 TotalTableServerRoundTripCount=0 LastTableServerInstanceName= LastTableServerErrorCode=0x00000000 TotalXStreamOpenTimeInMs=0.000 TotalXStreamOpenRoundTripCount=0 TotalXStreamIOTimeInMs=0.000 TotalXStreamIORoundTripCount=0 TotalXFETimeInMs=1.000 TotalRetryBackoffTimeInMs=0.000 TotalRetryBackoffCount=0 TotalShareThrottleBackoffTimeInMs=0.000 TotalShareThrottleBackoffCount=0 HasBillingInfo=0 FileName= FileId=0 OperationParameters= 
09/10/2020 21:56:43.176145 - pid: 38060 tid: 57384 @ NfsPerfLogPerOperation (nfsmeasurements.cpp:1303) 
on XNfsServer_IN_0  / cosmosPerfLog_XNfsServer.exe_000000.log  /  B8962853-8023-0000-00BD-873467000000  /  B8962853-8023-0000-00BD-873467000000 

perf: XNfsServer.exe: [NfsCompound] PerfCounters: Account=testaccount1 NfsProcedure=Compound NfsCommand=Nfs4PutFh Operation=OP_PUTFH on Container= with Status=Success StatusCode=0x0 ResponseCode=0x0 NfsCompoundIndex=1 NfsCompoundSize=4 Client=127.0.0.1:49977 SessionID=0x0200000000000000050000000000cd80 (2:0:5:2160918528) SeqId=0x2 XID=0x31bc2101 RequestVersion=4.1 RequestSize=72 ResponseSize=8 ProcessingTimeInMs=0.000 TotalTableServerTimeInMs=0.000 TotalTableServerRoundTripCount=0 LastTableServerInstanceName= LastTableServerErrorCode=0x00000000 TotalXStreamOpenTimeInMs=0.000 TotalXStreamOpenRoundTripCount=0 TotalXStreamIOTimeInMs=0.000 TotalXStreamIORoundTripCount=0 TotalXFETimeInMs=0.000 TotalRetryBackoffTimeInMs=0.000 TotalRetryBackoffCount=0 TotalShareThrottleBackoffTimeInMs=0.000 TotalShareThrottleBackoffCount=0 HasBillingInfo=1 FileName= FileId=9223442405598953472 OperationParameters= 
09/10/2020 21:56:43.176208 - pid: 38060 tid: 57384 @ NfsPerfLogPerOperation (nfsmeasurements.cpp:1303) 
on XNfsServer_IN_0  / cosmosPerfLog_XNfsServer.exe_000000.log  /  B8962853-8023-0000-00BD-873467000000  /  B8962853-8023-0000-00BD-873467000000 

perf: XNfsServer.exe: [NfsCompound] PerfCounters: Account=testaccount1 NfsProcedure=Compound NfsCommand=Nfs4SetAttr Operation=OP_SETATTR on Container=nfsrootsquashshare301D687BD11289F76 with **Status=Failure StatusCode=0x830a3301** ResponseCode=0x1 NfsCompoundIndex=2 NfsCompoundSize=4 Client=127.0.0.1:49977 SessionID=0x0200000000000000050000000000cd80 (2:0:5:2160918528) SeqId=0x2 XID=0x31bc2101 RequestVersion=4.1 RequestSize=44 ResponseSize=24 ProcessingTimeInMs=4.000 TotalTableServerTimeInMs=2.841 TotalTableServerRoundTripCount=2 LastTableServerInstanceName=rddevfabric$xtableserver_in_0 LastTableServerErrorCode=0x80004005 TotalXStreamOpenTimeInMs=0.000 TotalXStreamOpenRoundTripCount=0 TotalXStreamIOTimeInMs=0.000 TotalXStreamIORoundTripCount=0 TotalXFETimeInMs=1.159 TotalRetryBackoffTimeInMs=0.000 TotalRetryBackoffCount=0 TotalShareThrottleBackoffTimeInMs=0.000 TotalShareThrottleBackoffCount=0 HasBillingInfo=1 FileName= FileId=9223442405598953472 OperationParameters= 
09/10/2020 21:56:43.180766 - pid: 38060 tid: 57384 @ NfsPerfLogPerOperation (nfsmeasurements.cpp:1303) 
on XNfsServer_IN_0  / cosmosPerfLog_XNfsServer.exe_000000.log  /  B8962853-8023-0000-00BD-873467000000  /  B8962853-8023-0000-00BD-873467000000 

perf: XNfsServer.exe: [NfsCompound] PerfCounters: Account=testaccount1 NfsProcedure=Compound NfsMasterCommand=Nfs4SetAttr on Container=nfsrootsquashshare301D687BD11289F76 with Status=PartialSuccess StatusCode=0x0 ResponseCode=0x0 NfsCompoundSize=4 Client=127.0.0.1:49977 SessionID=0x0200000000000000050000000000cd80 (2:0:5:2160918528) XID=0x31bc2101 RequestVersion=4.1 RequestSize=256 ResponseSize=116 TimeInMs=5.004 ProcessingTimeInMs=5.004 TotalTableServerTimeInMs=2.841 TotalTableServerRoundTripCount=2 LastTableServerInstanceName=rddevfabric$xtableserver_in_0 LastTableServerErrorCode=0x80004005 TotalXStreamOpenTimeInMs=0.000 TotalXStreamOpenRoundTripCount=0 TotalXStreamIOTimeInMs=0.000 TotalXStreamIORoundTripCount=0 TotalXFETimeInMs=2.159 TotalRetryBackoffTimeInMs=0.000 TotalRetryBackoffCount=0 TotalShareThrottleBackoffTimeInMs=0.000 TotalShareThrottleBackoffCount=0 
09/10/2020 21:56:43.180926 - pid: 38060 tid: 57088 @ NfsPerfPerProcedure (nfsmeasurements.cpp:963) 
on XNfsServer_IN_0  / cosmosPerfLog_XNfsServer.exe_000000.log  /  B8962853-8023-0000-00BD-873467000000  /  B8962853-8023-0000-00BD-873467000000 


XTableServer logs:

info: XTableServer.exe: NFS_SETATTR [NAMESPACE] account=testaccount101D68794479DF1E6 container=nfsrootsquashshare301D687BD11289F76 fileName= keyFileId=0 keyParentID=1 HandleId=18446744073709551615 **owner=4294967294 group=4294967294** actual fileId=9223442405598953472 CookieId=9223442405598953472 fileAttrMask=100000000080 hasEncryptionInfo=false isEncryptionEnabled=false 
09/10/2020 21:56:43.179764 - pid: 55568 tid: 61236 @ XStore::XTable::Server::NfsSetAttrCommandServer::ExecuteCommandNamespace (nfssetattrcommandserver.cpp:219) 
on XTableServer_IN_0  / cosmosLog_XTableServer.exe_000391.bin  /  B8962853-8023-0000-00BD-87346706FE89  /  B8962853-8023-0000-00BD-873467000000 

..

info: XTableServer.exe: NfsCommand::AccessCheck() objectOwnerId=1000 objectGroupId=1000 **objectModebits=664 objectIsDir=No desiredAccess=20** 
09/10/2020 21:56:43.180258 - pid: 55568 tid: 61236 @ XStore::XTable::Server::NfsCommand::AccessCheck (nfscommand.cpp:1428) 
on XTableServer_IN_0  / cosmosLog_XTableServer.exe_000391.bin  /  B8962853-8023-0000-00BD-87346706FE89  /  B8962853-8023-0000-00BD-873467000000 

info: XTableServer.exe: **NfsCommand::AccessCheck() grantedAccess=4** 
09/10/2020 21:56:43.180259 - pid: 55568 tid: 61236 @ XStore::XTable::Server::NfsCommand::AccessCheck (nfscommand.cpp:1437) 
on XTableServer_IN_0  / cosmosLog_XTableServer.exe_000391.bin  /  B8962853-8023-0000-00BD-87346706FE89  /  B8962853-8023-0000-00BD-873467000000 

error: XTableServer.exe: **Returning Failure hr = 0x830a3301** 
09/10/2020 21:56:43.180265 - pid: 55568 tid: 61236 @ XStore::XTable::Server::NfsSetAttrCommandServer::ExecuteCommandNamespace (nfssetattrcommandserver.cpp:338) 
on XTableServer_IN_0  / cosmosErrorLog_XTableServer.exe_000015.log  /  B8962853-8023-0000-00BD-87346706FE89  /  B8962853-8023-0000-00BD-873467000000 


## Do file shares mounted via NFSv4 support NFSv4 ACLs (permissions) ?

- **NFSv4 ACLs are not supported at this time.** 
- We support all mandatory features of the spec.
  - NFSv4 ACLs are an optional feature 
- [RFC 5661 - Network File System (NFS) Version 4 Minor Version 1 Protocol (ietf.org)](https://datatracker.ietf.org/doc/html/rfc5661#section-5.7)
  -  Section 5.1 gives list of required attributes and 5.2 gives recommended (optional) attributes 


::: template /.templates/Processes/Knowledge-Management/Azure-Files-All-Topics-Feedback-Template.md
:::
