---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/TSGs/TSG 196 AFS Delete an ESE database on the Server_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20Sync/TSGs/TSG%20196%20AFS%20Delete%20an%20ESE%20database%20on%20the%20Server_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---

Tags:

- cw.Azure-Files-Sync

- cw.TSG

---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::
 





[[_TOC_]]



:warning: <span style="color:red">**This TSG contains steps to delete AFS databases. Backup existing directories before and apply caution when performing these steps.**</span>  

:warning: <span style="color:red">**This TSG contains steps to modify registry. Backup existing registry before and apply caution when performing these steps.**</span>



# File sync databases



We currently have 3 ESE DBs running on production servers.



<ol>

<li> Sync Metadata - There is one sync metadata DB per configured server endpoint.  The path matches this pattern: <span style="color:grey"> <DriveLetter>:\SystemVolumeInformation\HFS\SyncShareState\<SyncGroupName>_GuidValues\Metadata </span>

<li> Change Tracking DB - There is one Change Tracking DB per volume that is hosting a server endpoint's data set.  It is located at: <span style="color:grey"> <DriveLetter>:\SystemVolumeInformation\KailaniChangeTracking </span>

<li> Heat Tracking DB - There is one heat tracking DB per volume that is hosting a server endpoint's data set.  It is located at: <span style="color:grey"> <DriveLetter>:\System Volume Information\HFS\HeatStore\DB </span>

</ol>



# Modifying DB Files/Directories under System Volume Information



When deleting an ESE database managed by the AFS agent/server these generic steps need to be carried out:

<ol>

<li> Disable and Stop FileSyncSvc service

    <ol type = "a">

    <li> sc config "filesyncsvc" start=disabled </li>

    <li> net stop filesyncsvc </li>

    <li> taskkill /f /im filesyncsvc.exe /t </li>

    </ol>

</li>

<li> Launch a 'CMD.exe' as Local System using the SysInternals tool 'psexec.exe' to access the files/directories under "System Volume Information".  Here are instructions for running psexec.exe:

    <ol type = "a">

    <li> Download psexec.exe from https://docs.microsoft.com/en-us/sysinternals/downloads/psexec.  Note that psexec.exe is part of larger set of tools you can download in a zip file "PSTools.zip" from this web page.  </li>

    <li> Copy psexec.exe to some directory on your server.  For the sake of discussion, assume you copy it to "C:\AFS\psexec.exe".  </li>

    <li> Open an elevated command prompt.  </li>

    <li> Run: <span style="color:blue"> C:\AFS\psexec.exe -i -s -d cmd </li>

    <li> This will open another command prompt running as "Local System" (you see "nt authority\system" if you run "whoami").  </li>

    </ol>

</li>

<li> The database directory is <DriveLetter>:\SystemVolumeInformation\HFS\SyncShareState\<afs service name>_<SyncGroupName>_<endpoint name>{Guid}\Metadata  </li>

<li> Rename the database directory to <b><DbDir>_old.</b></li>

<li> Enable and start FileSyncSvc  

    <ol type = "a">

    <li> sc config "filesyncsvc" start=auto</li>

    <li> net start filesyncsvc</li>

    </ol>

</li>

<li> Make sure the DB directory is recreated.  </li>

<li> Delete the "<DriveLetter>:\System Volume Information\...\<DbDir>_old" folder, when satisfied that it is not needed anymore  </li>

<li> In some cases, we may want customers to send it to us for further investigation.  </li>

</ol>



## Deleting Sync Metadata



In some situations, the Sync DB on the server must be deleted. One example scenario is if there is an issue impacting one server, which would require a reset of the DB. A 'fast repair' can sometimes mitigate this, but it would impact all endpoints. A similar mitigation technique is to delete the DB on just the impacted endpoint, to limit the impact of the mitigation step.



### Authoritative Upload Repair (for HFS/AFS)

Authoritative upload feature was released on v13, which makes the server's view of the namespace the 'master'. In repair cases, the feature can be turned on to avoid lengthy reconciliation session, resurrection of content deleted on the server which still exist in the cloud share and generation of conflcits



This option should be recommended to customers which are not making direct changes to the cloud share, and want the server's namespace to be preserved. There **must be only one** server endpoint in the syncgroup



#### Enabling Authoritative upload: 

 ``` 

 1. Import-Module 'C:\Program Files\Azure\StorageSyncAgent\StorageSync.Management.ServerCmdlets.dll'  

 2. Set-StorageSyncServerSupportOption -SyncShareRoot <share data path on server> -AuthoritativeUpload $true

 ```

If Authoritative upload repair is not an option then; if the database is deleted as part of a 'repair', and the customer wants to avoid conflicts, please set the registry key **SaveConflictFilesForReconcile**. See details on <a href = "onenote:https://microsoft.sharepoint.com/teams/KailaniOps/SiteAssets/Kailani%20Operations/TSGs.one#TSG%20216 - Reconcile without saving conflict files&section-id={AD1BCE18-9AEB-4F4D-B8A0-BE8ECE51286E}&page-id={0A00F594-F37D-49EE-97CF-ED904BCD29C5}&end">Reconcile without saving conflict files</a>  



To delete the sync DB, it must be found first. It will be in a location such as: <span style="color:grey"><DriveLetter>:\SystemVolumeInformation\HFS\SyncShareState\<afs service name>_<SyncGroupName>_<endpoint name>{Guid}\Metadata  



**Note:** The Sync DB path format changed in v13. Use this PowerShell script to get the staging folder value out of the configuration in the registry. Then the DB will be under 'Metadata' folder under the staging folder 



    function Get-SyncFolderStaginPath

    {

    <#

    .Synopsis

        This function enumerate all the sync folder configuration on the server and list the Staging folder configuration value 



    .Description

        This function enumerate all the sync folder configuration on the server and list the Staging folder configuration value 

    #>

    Push-Location



    Set-Location -Path 'HKLM:\SOFTWARE\Microsoft\Azure\StorageSync\SyncFolder'



    Get-Item . |



    Select-Object -ExpandProperty property |



    ForEach-Object {

        $SyncFolderName = $_

        $xmlConfigurationString = (Get-ItemProperty -Path . -Name $_).$_

        $xmlConfiguration = [xml]$xmlConfigurationString

        $StagingFolderAttributeObject = $xmlConfiguration.ConfigObject.Attributes.Attribute | Where-Object { $_.Name -eq 'StagingFolder' }

        New-Object psobject -Property @{"Folder"=$SyncFolderName;"Path" = $StagingFolderAttributeObject.Values.String.Value}

    }



    Pop-Location



    } #end function Get- SyncFolderStaginPath

	

Plug this path into the generic instructions under [Modifying DB Files/Directories under System Volume Information](#modifying-db-files/directories-under-system-volume-information)



## Deleting Change Tracking DB



Deletion of the Change Tracking DB does not cause a lot of extra work to occur on the server nor does it increase traffic to the Kailani service. So this is a safe mitigation step to take if Change Consumption or Change Tracking are stuck in some way.  



There are two ways to re-create the change tracking DB:  

:warning: <span style="color:red"> This will delete the Change Tracking DB on ALL volumes in the server

<ol>

    <li> Registry key

        <ol type = "a">

        <li> Set this registry key and restart the service. It will automatically delete the change tracking DB and re-created it. The key will be turned off automatically after the DB is deleted.<br></br>

            <span style="color:grey">[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Azure\StorageSync\ChangeTracking]<br></br>

            <span style="color:grey">DWORD "FirstInitialization"=1  

        <li> Full command line:  <br></br>

            <span style="color:grey">reg add HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Azure\StorageSync\ChangeTracking /v FirstInitialization /t REG_DWORD /d 1  <br></br>

            <span style="color:grey">net stop filesyncsvc  <br></br>

            <span style="color:grey">net start filesyncsvc  <br></br>

            <span style="color:grey">reg query HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Azure\StorageSync\ChangeTracking /v FirstInitialization  <br></br>

        </ol>

    <li> Deleting Change Tracking DB files:  

        <ol type = "a">

        <li> The Change Tracking DB is located at: <span style="color:grey"> <DriveLetter>:\SystemVolumeInformation\KailaniChangeTracking. </li>

        </ol>

</ol>



Plug the path from 2a into the generic instructions under [Modifying DB Files/Directories under System Volume Information](#modifying-db-files/directories-under-system-volume-information)



One situation where this has been necessary for customers is when FileSyncSvc.exe crashes on startup due to compression being set on the "System Volume Information" directory. The following TSG has more details about this particular situation: <a href = "onenote:#TSG%20191 Dealing with cases when compressed sync staging folder causes FileSyncSvc crashes with esent!COSFileSystemErrFileOpen callstacks&section-id={AD1BCE18-9AEB-4F4D-B8A0-BE8ECE51286E}&page-id={CF88300F-1152-4BAE-B38B-1D72998D47BD}&end&base-path=https://microsoft.sharepoint.com/teams/KailaniOps/SiteAssets/Kailani%20Operations/TSGs.one">Dealing with cases when compressed sync staging folder causes FileSyncSvc crashes with esent!COSFileSystem::ErrFileOpen callstacks</a>



## Deleting Heat Tracking DB



Deletion of heatstore will cause the server to lose the access tracking (heat) information collected on the server so far. As a result tiering may not be able to tier files in the correct order for all shares on the volume. The heat store will get recreated on future file access and the information will begin to persist after that point into the heat store. Also next day heat store enumeration will populate the entire heat store again based on the ondisk timestamps of the files. 



The database can be found at: <span style="color:grey"> <DriveLetter>:\System Volume Information\HFS\HeatStore\DB



Plug this path into the generic instructions under [Modifying DB Files/Directories under System Volume Information](#modifying-db-files/directories-under-system-volume-information)



## Deleting Locksmith Lock DB



In some situations, the Sync DB on the server must be deleted. One example scenario is if there is an issue impacting 1 server, which would require a reset of the DB. A 'fast repair' can sometimes mitigate this, but it would impact all endpoints. A similar mitigation technique is to delete the DB on just the impacted endpoint, to limit the impact of the mitigation step.



To delete the sync DB, it must be found first. It will be in a location such as:

<span style="color:grey"> <DriveLetter>:\System Volume Information\HFS\SyncShareState\<SyncGroupName>_GuidValues\LockSmith\LockDB

	

Plug this path into the generic instructions under [Modifying DB Files/Directories under System Volume Information](#modifying-db-files/directories-under-system-volume-information)





::: template /.templates/Processes/Knowledge-Management/Azure-Files-Sync-Feedback-Template.md

:::


