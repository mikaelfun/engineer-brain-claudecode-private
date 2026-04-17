---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/TSGs/Non boot/Understanding Initial Machine Config_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FCant%20RDP%20SSH%2FTSGs%2FNon%20boot%2FUnderstanding%20Initial%20Machine%20Config_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.TSG
- cw.RDP-SSH
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::



[[_TOC_]]

## Background

We spent some time to understand how IMC is configured on Threshold host and guest. Here we have documented our learnings. At a high level, we use native boot to boot a machine to threshold server datacenter TP3 edition and deploy VMs using traditional unattend.xml and new IMC mechanism to set the computer name. We tried two ways to set IMC: using the BCD approach and using the WMI approach to set the IMC hive. We observe that when using IMC, VM does not go through an additional reboot during the initial setup phase.

Furthermore, we also experimented unattended domain join scenario with and without IMC. We observed that IMC eliminates the need for reboot in unattended domain join scenario as well. We also documented the steps we performed.

Build used:

  - Host: We have used Windows Server 2016 Technical Preview 3 build.
      - Build: \[file:///\\\\winbuilds\\release\\TH2\_Release\\10514.0.150808-1529 \\\\winbuilds\\release\\TH2\_Release\\10514.0.150808-1529\]
      - VHD: \[file:///\\\\winbuilds\\release\\TH2\_Release\\10514.0.150808-1529\\amd64fre\\vhd\\vhd\_server\_serverdatacenter\_en-us\\10514.0.amd64fre.th2\_release.150808-1529\_server\_serverdatacenter\_en-us.vhd \\\\winbuilds\\release\\TH2\_Release\\10514.0.150808-1529\\amd64fre\\vhd\\vhd\_server\_serverdatacenter\_en-us\\10514.0.amd64fre.th2\_release.150808-1529\_server\_serverdatacenter\_en-us.vhd\]
  - Guest: Same as above.

## References

1.  From Windows OS team:
    1.  [IMC specs](http://windowsblue/docs/home/Windows%20Blue%20Feature%20Docs/Windows%20Server/Cloud%20Infrastructure/Core%20System%20Server/Core%20System%20Server%20-%20Initial%20Configuration%20\(MP\)%20-%20Functional%20Spec.docx)
    2.  [IMC sharepoint](http://wsblue/css/SitePages/Using%20Initial%20Machine%20Configuration%20\(IMC\)%20to%20deploy%20Core%20System%20Server%20\(CSS\).aspx) and [IMC wiki](https://osgwiki.com/wiki/NanoServer#Initial_Machine_Configuration_.28IMC.29)
    3.  IMC test: WTT jobs of IMC are 99006, 97209 and 92365.
        1.  Install WTT studio or Atlas Studio. Use Job Explorer, set DataStore to "ServerPlaceHolder" and search for Job by ID.
2.  From Hyper-V team:
    1.  Hyper-V integration with IMC - [Functional Spec](https://microsoft.sharepoint.com/teams/osg_threshold_specs/_layouts/15/WopiFrame.aspx?sourcedoc=%7bBCD193F3-B2E4-44A3-B4B2-4E229FBF10BD%7d&file=Hyper-V%20integration%20with%20IMC.docx&action=default&DefaultItemOpen=1)
    2.  Fast VM Provisioning - [Quality Planning Document](https://microsoft.sharepoint.com/teams/osg_threshold_specs/_layouts/15/WopiFrame.aspx?sourcedoc=%7b811e8ae8-c62e-4b3f-9c2f-8a195bfacce3%7d&action=edit&source=https%3A%2F%2Fmicrosoft%2Esharepoint%2Ecom%2Fteams%2Fosg%5Fthreshold%5Fspecs%2FSpecStore%2FForms%2FCCBnBHYP%2Easpx)
    3.  Hyper-V e2e test: WTT Studio, DataStore: OSGThreshold job 204901. Particular attention to be paid to "Create IMC Hive" and "Apply IMC hive to PerfVM" tasks.
3.  [VM Fast Boot Cookbook](https://microsoft.sharepoint.com/teams/osg_threshold_specs/_layouts/15/WopiFrame.aspx?sourcedoc=%7bFE0D1B64-2DFC-4D64-9AE7-5C2289F0C29D%7d&file=VM%20fast%20boot%20cookbook.docx&action=default&DefaultItemOpen=1)
4.  [Offline domain join step-by-step guide](https://technet.microsoft.com/en-us/library/offline-domain-join-djoin-step-by-step\(v=ws.10\).aspx)
5.  [Native boot (with parent OS)](https://technet.microsoft.com/en-us/library/hh825709.aspx)
    Refer to sections:
      - *To update a BIOS-based computer to include a Windows 8 boot menu*
      - *To add a native-boot VHD to an existing Windows 8 boot menu*
6.  [Native boot (without parent OS)](https://technet.microsoft.com/en-us/library/hh825691.aspx?f=255&MSPPError=-2147217396)
7.  [Booting from USB](http://blogs.msdn.com/b/habibh/archive/2011/09/14/how-to-create-a-bootable-usb-flash-drive-to-install-windows-8-developer-preview.aspx)

## Step 1: Preparing Windows Threshold Host

1.  We have used above VHD to boot a PC. This is also known as native boot.

2.  On a machine that had WS2K12 R2 installed, we followed the sections *To update a BIOS-based computer to include a Windows 8 boot menu* and *To add a native-boot VHD to an existing Windows 8 boot menu* from [MSDN documentation](https://technet.microsoft.com/en-us/library/hh825709.aspx).

3.  ***Specific commands*** we used *To update a BIOS-based computer to include a Windows 8 boot menu*:
    
    ```
        diskpart 
        list volume  - <Note the count of volumes> 
        select vdisk file=C:\IMC\Threshold_OS_repo\10545.0.amd64fre.winmain.150911-1623_server_serverdatacenter_en-us.vhd 
        attach vdisk 
        list volume 
        REM Note that a new volume was added. if the volume does not have a drive letter, assign a drive letter by running commands below. 
        select volume <volume_number_of_attached_VHD> 
        assign letter=v 
        exit
    ```

4.  ***Specific commands*** we used *To add a native-boot VHD to an existing Windows 8 boot menu*:
    
    ```
        bcdedit /export C:\IMC\BCDBACKUP 
        bcdedit /copy {default} /d "vhd boot (locate)" 
        <!-- The entry was successfully copied to {8e634400-568d-11e5-80c0-e839355e4737}. --> 
        bcdedit /set {8e634400-568d-11e5-80c0-e839355e4737} device vhd=[C:]\IMC\Threshold_OS_repo\10545.0.amd64fre.winmain.150911-1623_server_serverdatacenter_en-us.vhd 
        bcdedit /set {8e634400-568d-11e5-80c0-e839355e4737} osdevice vhd=[C:]\IMC\Threshold_OS_repo\10545.0.amd64fre.winmain.150911-1623_server_serverdatacenter_en-us.vhd 
        bcdedit /default {8e634400-568d-11e5-80c0-e839355e4737} 
        bcdedit /set {8e634400-568d-11e5-80c0-e839355e4737} detecthal on
    ```

5.  After restarting the machine with above changes the machine booted into the Threshold VHD.

6.  When going through the setup, we needed to supply product key.

7.  After going through the setup, we configured Hyper-V in the BIOS and installed Hyper-V role from Server Manager. We also joined the machine to NTDEV domain.

8.  At this point, the machine is ready as a host for IMC testing.

## Step 2: Sysprep the guest VHD with VM mode

The VHD that we get from `\\winbuilds\release` is a generalized VHD. We need to generalize the VHD in VM mode. The reason for this is that when a generalized VHD is booted for the first time, various setup and configuration actions run on the VHD. One of these steps is related PnP/hardware devices. Various services get installed during this step.

Generalizing a VHD in VM mode causes this PnP/hardware settings to be preserved in the VHD; however, other machine-specific settings such as computer name, SID, etc. get generalized. This enables us to deploy the VMs across a large number of machines where the h/w configuration does not change. This is also how the Azure RDOS team produces the guest VHDs.

  
High-level steps to sysprep the VHD in VM mode are:

1.  Create a virtual machine using the VHD that we obtained from \\\\winbuilds\\release.
2.  From within the VM, run the following command:
    <br/>`%windir%\system32\sysprep\sysprep.exe /generalize /oobe /mode:vm`
3.  The VM runs the generalization and shuts down.
4.  The VHD is now sysprepped in VM mode. We are now ready to use this VHD for deploying IMC and non-IMC VMs and see the difference in initial VM boot performance when using IMC.
5.  For subsequent steps, when creating VMs, we are going to use a copy of this VHD.

## Step 3: Deploy a non-IMC VM with traditional unattend.xml mechanism

The goal of this exercise is to understand and see the additional reboot of the VM during initial configuration. In step 4 and 5 when using IMC, we will note that this reboot no longer happens.

***Unattend.xml***:
We used following unattend.xml file.

```
    <?xml version='1.0' encoding='utf-8'?> 
    <unattend xmlns="urn:schemas-microsoft-com:unattend" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"> 
      <settings pass="oobeSystem"> 
        <component name="Microsoft-Windows-Shell-Setup" processorArchitecture="amd64" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS"> 
          <UserAccounts> 
            <AdministratorPassword> 
               <Value>rdPa$$w0rd</Value> 
               <PlainText>true</PlainText> 
            </AdministratorPassword> 
          </UserAccounts> 
          <TimeZone>Pacific Standard Time</TimeZone> 
        </component> 
      </settings> 
      <settings pass="specialize"> 
        <component name="Microsoft-Windows-Shell-Setup" processorArchitecture="amd64" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS"> 
          <ComputerName>daudhow-nonIMC</ComputerName> 
          <RegisteredOwner>Azure Compute Manager</RegisteredOwner> 
          <RegisteredOrganization>Microsoft Corporation</RegisteredOrganization> 
        </component> 
      </settings> 
    </unattend>
```

**Note:** The ComputerName field under "specialize" settings.

### Steps

1.  Create the above unattend.xml file.
2.  Mount the VHD under a folder called mountdir.
    <br/>`Mount-WindowsImage -Path .\mountdir -ImagePath D:\IMC\VM_Deployments\Non-IMC-VM3\10514.0.amd64fre.th2_release.150808-1529_server_serverdatacenter_en-us.vhd -Index 1`
3.  Create the Panther directory if it doesn't exist already.
    <br/>`md .\mountdir\windows\panther`
4.  Copy the unattend.xml file to the panther directory.
    <br/>`copy .\unattend.xml .\mountdir\windows\panther`
5.  Save and dismount the image.
    <br/>`dismount-windowsimage -path .\mountdir -save`
6.  Create a VM.
    <br/>`New-VM -Name "Non-IMC-VM3" -MemoryStartupBytes 1GB -VHDPath D:\IMC\VM_Deployments\Non-IMC-VM3\10514.0.amd64fre.th2_release.150808-1529_server_serverdatacenter_en-us.vhd -Path D:\IMC\VM_Deployments\Non-IMC-VM3`
7.  Start the VM.
    <br/>`Start-VM -Name "Non-IMC-VM3"`
8.  Use hyper-V manager -\> VM connect tool to observe the VM boot progress. You will see that the VM is rebooting after *Getting devices ready* -\> *Getting Ready* and before asking for time zone, country etc. The reboot here is due to the setting the computer name. When we use IMC feature, we will see that this reboot does not happen.

## Step 4: Deploy a IMC VM by inserting a IMC hive file into the VHD and modifying BCD for IMC hive

For this step, we followed the instructions located [here](https://osgwiki.com/wiki/NanoServer) under section *Initial Machine Configuration File (IMC)*. At a high level, this involves creating a registry hive file using DIMC tool and making BCD changes to modify BCD for IMC hive. When the system boots, during initial configuration (and services/devices are started), registry settings from the hive file is read and applied to HKLM\\System. We can only modify and add the settings. We cannot delete any registry keys for example.

1.  Copy DIMC tool, it should be present in TH server editions by default
    
    ```
        copy {release share}\amd64fre\bin\SetupUtils\DIMC.exe 
        mkdir en-US 
        copy {release share}\amd64fre\en-us\bin_segmented\base\setuputils\dimc.exe.mui .\en-US
    ```

2.  Make an unattend.xml file. Below is an example that you can cut and paste to a file named unattend.xml. Note the ComputerName field.
    
    ```
        <?xml version='1.0' encoding='utf-8'?> 
        <unattend xmlns="urn:schemas-microsoft-com:unattend" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State">   
          <settings pass="offlineServicing">   
              <component name="Microsoft-Windows-Shell-Setup" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS" processorArchitecture="amd64">   
                 <ComputerName>daudhow-IMC-VM1</ComputerName> 
              </component>      
          </settings>   
        </unattend>
    ```

3.  Generate a IMC hive for computer name.
    
    <br/>`dimc -UnattendPath .\unattend.xml -HivePath .\imc.hiv`

4.  Mount the VHD that you intend to use to create the VM.
    
    ```
        md mountdir 
        mount-windowsimage -imagepath D:\IMC\VM_Deployments\IMC-VM1\10514.0.amd64fre.th2_release.150808-1529_server_serverdatacenter_en-us.vhd -index 1 -path .\mountdir
    ```

5.  Modify BCD (bcdedit must be from blue 8.1) for IMC hive.
    
    ```
        cd mountdir\boot 
        bcdedit /store bcd /set {default} IMCDevice boot 
        bcdedit /store bcd /set {default} IMCHiveName \imc.hiv 
        cd ..\..
    ```

6.  Copy IMC hive file to root.
    
    <br/>`copy .\imc.hiv .\mountdir`

7.  Unmount the image.
    
    <br/>`dismount-windowsimage -path .\mountdir -save`

8.  Create a VM with the VHD.
    
    <br/>`New-VM -Name "IMC-VM1" -MemoryStartupBytes 1GB -VHDPath D:\IMC\VM_Deployments\IMC-VM1\10514.0.amd64fre.th2_release.150808-1529_server_serverdatacenter_en-us.vhd -Path D:\IMC\VM_Deployments\IMC-VM1`

9.  Start the VM.
    
    <br/>`Start-VM -Name "IMC-VM1"`

10. You will see that the VM **does not reboot** during initial configuration, and it goes directly from *Getting Device Ready* -\> *Getting Ready* screen to the screen for taking input for country, time zone, etc.

11. Once the VM is rebooted, type *hostname* on a CMD prompt followed by \<enter\>, and you will see that the name matches with what you supplied in the unattend.xml.

## Step 5: Deploy a IMC VM by using Hyper-V WMI interface

This is most likely the mechanism we will use in Azure for inserting the contents of IMC hive file into the VM after creating the VM and before starting the VM. The other mechanism (described in step 4 above) requires mounting the VHD and making BCD changes which we will most likely not be doing. Besides using hyper-V WMI interfaces makes sense as it is also the current mechanism used in WVCLIB.

1.  Copy DIMC tool, it should be present in TH server editions by default
    
    ```
        copy {release share}\amd64fre\bin\SetupUtils\DIMC.exe 
        mkdir en-US 
        copy {release share}\amd64fre\en-us\bin_segmented\base\setuputils\dimc.exe.mui .\en-US
    ```

2.  Make an unattend.xml file. Below is an example that you can cut and paste to a file named unattend.xml. Note the ComputerName field
    
    ```
        <?xml version='1.0' encoding='utf-8'?> 
        <unattend xmlns="urn:schemas-microsoft-com:unattend" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State">   
          <settings pass="offlineServicing">   
              <component name="Microsoft-Windows-Shell-Setup" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS" processorArchitecture="amd64">   
                 <ComputerName>daudhow-IMC-VM2</ComputerName> 
              </component>      
          </settings>   
        </unattend
    ```

3.  Generate a IMC hive for computer name.
    
    ```
        dimc -UnattendPath .\unattend.xml -HivePath .\imc_vm2.hiv
    ```

4.  Create a VM
    
    ```
        ew-VM -Name "IMC-VM2-WMI" -MemoryStartupBytes 1GB -VHDPath D:\IMC\VM_Deployments\IMC-VM2-WMI\10514.0.amd64fre.th2_release.150808-1529_server_serverdatacenter_en-us.vhd -Path D:\IMC\VM_Deployments\IMC-VM2-WMI
    ```

5.  Inject the contents of the IMC hive file into the VM using the following PowerShell script.
    
    ```
        InjectIMC.ps1 -IMCHive .\imc_vm2.hiv -VMName "IMC-VM2-WMI"
    ```

6.  Insert the script <u>**InjectIMC.ps1:**</u>
    
    ```
        [CmdletBinding()]
                Param 
                (
                    [Parameter()]
                    [String]
                    $IMCHive,
                
                    [Parameter(Mandatory=$True)]
                    [String]
                    $VMName
                )        
                function ToOctetString($dataArray)
                {
                    $length = [System.BitConverter]::GetBytes([int32]$dataArray.Length + 4)  
                    if ([System.BitConverter]::IsLittleEndian)
                    {
                        [System.Array]::Reverse($length);
                    }    
                    return $length + $dataArray     
                }        
                if ($IMCHive -and -not (Test-Path -PathType Leaf $IMCHive))
                {
                    throw "IMC Hive " + $IMCHive + " not found"
                    return 1
                }        
                $vmms = gwmi -Namespace 'root\virtualization\v2' msvm_virtualsystemmanagementservice
                $vm = gwmi -Namespace 'root\virtualization\v2' msvm_computersystem | ? {$_.ElementName -eq $VmName}
                
                if (-not $vm)
                {
                    throw "VM " + $VMName +" not found"
                    return 1
                }        
                if ($IMCHive)
                {
                    $array = get-content -ErrorAction Stop -Encoding Byte $IMCHive
                } 
                else {
                    $array = @()    
                }        
                $result = $vmms.SetInitialMachineConfigurationData($vm.Path.Path, $(ToOctetString($array)))      
                #Return success if the return value is "0"
                if ($Result.ReturnValue -eq 0)
                   {write-host "Operation completed sucessfully1"}
                 
                #If the return value is not "0" or "4096" then the operation failed
                ElseIf ($Result.ReturnValue -ne 4096)
                   {
                       write-host "Operation failed"
                       return 1
                   }
                Else
                   {#Get the job object
                    $job=[WMI]$Result.job
                    
                    #Provide updates if the jobstate is "3" (starting) or "4" (running)
                    while ($job.JobState -eq 3 -or $job.JobState -eq 4)
                      {write-host $job.PercentComplete
                       start-sleep 1
                    
                       #Refresh the job object
                       $job=[WMI]$Result.job}
                 
                    #A jobstate of "7" means success
                    if ($job.JobState -eq 7)
                    {
                        write-host "Operation completed sucessfully2"
                    }
                    Else
                    {
                        write-host "Operation failed"
                        write-host "ErrorCode:" $job.ErrorCode
                        write-host "ErrorDescription" $job.ErrorDescription
                        return 1
                    }
                   }
    ```

7.  Start the VM.
    
    <br/>`Start-VM -Name "IMC-VM2-WMI"`

8.  You will see that the VM does not reboot during initial configuration, and it goes directly from *Getting Device Ready* -\> *Getting Ready* screen to the screen for taking input for country, time zone, etc.

9.  Once the VM is rebooted, type *hostname* on a CMD prompt followed by \<enter\>, and you will see that the name matches with what you supplied in the unattend.xml.

### Creating IMC hive file from .reg

It is possible to create the IMC hive file if the registry keys and values are known beforehand. Here are the steps to do that.

1.  Create a .reg file with contents below.
    
    ```
        Windows Registry Editor Version 5.00
        
        [HKEY_LOCAL_MACHINE\IMC]
        "Sequence"=dword:2
            
        [HKEY_LOCAL_MACHINE\IMC\System\CurrentControlSet\Control\ComputerName\ComputerName]
        "ComputerName"="VmFastBootIMC"
             
        [HKEY_LOCAL_MACHINE\IMC\System\CurrentControlSet\Services\tcpip\parameters]
        "NV HostName"="VmFastBootIMC"
        "HostName"="VmFastBootIMC"
            
        [HKEY_LOCAL_MACHINE\IMC\System\Setup\DJOIN]
        "DismComputerNameSet"=dword:1
    ```

2.  Run the following commands
    
    ```
        reg load HKLM\empty nullfile
        reg save HKLM\empty IMC.hiv
        reg unload HKLM\empty
             
        reg load HKLM\IMC IMC.hiv
        reg import ComputerName.reg
        reg unload HKLM\IMC
    ```

3.  Load the hive file (IMC.hiv) in regedit and verify that the above keys are present and set properly

#### Important note on IMC sequence number

One thing to note is that you must set an IMC sequence number in your hive in order for it to be applied. The Sequence value can be anything, it just needs to be different than the previously applied Sequence value. This is how IMC keeps itself from reapplying the same hive repeatedly on subsequent boots.

```
    [HKEY_LOCAL_MACHINE\IMC]
         "Sequence"=dword:1
```

On the VM, this value is stored under following registry paths:

```
    HKLM\SYSTEM\CurrentControlSet\Control\InitialMachineConfig
    HKLM\SYSTEM\ControlSet001\Control\InitialMachineConfig
    HKLM\SYSTEM\ControlSet002\Control\InitialMachineConfig
```

### Unattended domain join without IMC

Apart from the computer name, the other setting that causes a machine to reboot is the unattended domain join. Here is an example unattend.xml file in the pre-IMC world. Note that AccountData is a base64 encoded blob that the user will pass in. Usually this data is generated by running djoin.exe tool on a domain join provisioning server under a user account that has permission to create computer name objects in the target domain. RDFE also exposes API to pass this blob to Azure during VM creation.

#### Reference

  - [MSDN Reference](https://msdn.microsoft.com/en-us/library/windows/hardware/dn923081\(v=vs.85\).aspx)
  - [Technet Djoin](https://technet.microsoft.com/en-us/library/ff793312\(v=ws.11\).aspx)

#### Unattened.xml (without IMC)
<details>

``` 
   <?xml version='1.0' encoding='utf-8'?>
    <unattend xmlns="urn:schemas-microsoft-com:unattend" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <settings pass="oobeSystem">
        <component name="Microsoft-Windows-Shell-Setup" processorArchitecture="amd64" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS">
          <UserAccounts>
            <AdministratorPassword>
               <Value>rdPa$$w0rd</Value>
               <PlainText>true</PlainText>
            </AdministratorPassword>
          </UserAccounts>
          <TimeZone>Pacific Standard Time</TimeZone>
        </component>
      </settings>
      <settings pass="specialize">
        <component name="Microsoft-Windows-UnattendedJoin" processorArchitecture="amd64" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
            <Identification>
               <Provisioning>
                 <AccountData>BASE64-ENDCODED_BLOB</AccountData>
               </Provisioning>
               <JoinDomain>ntdev.corp.microsoft.com</JoinDomain>
             </Identification>
          </component>
        <component name="Microsoft-Windows-Shell-Setup" processorArchitecture="amd64" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS">
          <ComputerName>Non-IMC-DJOIN</ComputerName>
          <RegisteredOwner>Azure Compute Manager</RegisteredOwner>
          <RegisteredOrganization>Microsoft Corporation</RegisteredOrganization>
        </component>
      </settings>
    </unattend>
```

Here are the steps:

1.  Create the above unattend.xml file.
2.  Mount the VHD under a folder called mountdir.
    <br/>`Mount-WindowsImage -Path .\mountdir -ImagePath D:\IMC\VM_Deployments\Non-IMC-VM3\10514.0.amd64fre.th2_release.150808-1529_server_serverdatacenter_en-us.vhd -Index 1`
3.  Create the Panther directory if it doesn't exist already.
    <br/>`md .\mountdir\windows\panther`
4.  Copy the unattend.xml file to the panther directory.
    <br/>`copy .\unattend.xml .\mountdir\windows\panther`
5.  Save and dismount the image.
    <br/>`dismount-windowsimage -path .\mountdir -save`
6.  Create a VM.
    <br/>`New-VM -Name "Non-IMC-VM3" -MemoryStartupBytes 1GB -VHDPath D:\IMC\VM_Deployments\Non-IMC-VM3\10514.0.amd64fre.th2_release.150808-1529_server_serverdatacenter_en-us.vhd -Path D:\IMC\VM_Deployments\Non-IMC-VM3`
7.  Start the VM.
    <br/>`Start-VM -Name "Non-IMC-VM3"`
8.  Use hyper-V manager -\> VM connect tool to observe the VM boot progress. You will see that the VM is rebooting after *Getting devices ready* -\> *Getting Ready* and before asking for time zone, country etc. The reboot here is due to the setting the computer name. When we use IMC feature, we will see that this reboot does not happen.

</details>

### Unattended domain join with IMC

To configure domain join info with IMC, you have to create a unattend.xml where UnattendJoin component is in the offlineSerivicing pass. This is due to the fact that DIMC tool only processes the components that are under offlineServicing. Also note the schema differences with the unattend.xml we used for the non-IMC case (e.g. Identification vs OfflineIdentification).

#### Unattend.xml for IMC hive generation

``` 
   <?xml version='1.0' encoding='utf-8'?>
    <unattend xmlns="urn:schemas-microsoft-com:unattend" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State">
      <settings pass="offlineServicing">
          <component name="Microsoft-Windows-Shell-Setup" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS" processorArchitecture="amd64">  
             <ComputerName>IMC-DJOIN-THRCE</ComputerName>
          </component>     
          <component name="Microsoft-Windows-UnattendedJoin" processorArchitecture="amd64" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
            <OfflineIdentification>
               <Provisioning>
                 <AccountData>BASE64-ENCODED-BLOB</AccountData>
               </Provisioning>
             </OfflineIdentification>
          </component>
      </settings>
    </unattend>
```

Here are the steps for configuring domain join with IMC:

1.  Run DJOIN.exe tool on a provisioning server for the domain. Typically this is a machine that is joined to the target domain, and the user that is running DJOIN has permissions to create computer objects in that domain. Note down the blob this command prints on the console window. It is also saved in the file mentioned in the command line.
    <br/>`djoin /provision /domain ntdev.corp.microsoft.com /machine IMC-DJOIN-THRCE /savefile Unattend.Djoin.txt /printblob`
2.  Create the above unattend.xml file. Replace the contents of \<AccountData\> with the blob.
3.  Run DIMC tool to create a IMC hive.
    <br/>`dimc -UnattendPath .\unattend.xml -HivePath .\imc.hiv`
4.  Create a VM.
    <br/>`New-VM -Name "IMC-VM" -MemoryStartupBytes 1GB -VHDPath D:\IMC\VM_Deployments\IMC-VM\10514.0.amd64fre.th2_release.150808-1529_server_serverdatacenter_en-us.vhd -Path D:\IMC\VM_Deployments\IMC-VM`
5.  Inject the contents of the IMC hive file into the VM using the InjectIMC.ps1 script we mentioned earlier in this document.
    <br/>`InjectIMC.ps1 -IMCHive .\imc.hiv -VMName "IMC-VM"`
6.  Start the VM
    <br/>`Start-VM -Name "IMC-VM"`
7.  Using hyper-V manager/VMConnect, connect to the VM. Verify that the VM has not taken any reboot during the initial configuration.
8.  Once the VM is rebooted, log into the VM and verify that the machine is joined to a domain.

More info on the OfflineIdentification can be found [here](https://msdn.microsoft.com/en-us/library/windows/hardware/dn986508\(v=vs.85\).aspx).

## IMC hive registry entries for different unattended scenarios using computer name and unattended join

Unattend.xml contains Unattended.xml
<details>

Unattended.xml contains only Computer name

```
<?xml version='1.0' encoding='utf-8'?>
<unattend xmlns="urn:schemas-microsoft-com:unattend" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State">  
  <settings pass="offlineServicing">  
      <component name="Microsoft-Windows-Shell-Setup" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS" processorArchitecture="amd64">  
         <ComputerName>daudhow-IMC-WMI</ComputerName>
      </component>     
  </settings>  
</unattend>
```

Unattended.xml contains only the domain join info

```
<?xml version='1.0' encoding='utf-8'?>
<unattend xmlns="urn:schemas-microsoft-com:unattend" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State">
  <settings pass="offlineServicing">
      <component name="Microsoft-Windows-UnattendedJoin" processorArchitecture="amd64" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <OfflineIdentification>
           <Provisioning>
             <AccountData>AccountData</AccountData>
           </Provisioning>
         </OfflineIdentification>
      </component>
  </settings>
</unattend>
```
```
Windows Registry Editor Version 5.00
[HKEY_LOCAL_MACHINE\djoin]
@="mnmsrvc"
"Sequence"=dword:0000000f
 
[HKEY_LOCAL_MACHINE\djoin\system]


[HKEY_LOCAL_MACHINE\djoin\system\controlset001]
 
[HKEY_LOCAL_MACHINE\djoin\system\controlset001\Control]
 
[HKEY_LOCAL_MACHINE\djoin\system\controlset001\Control\ComputerName]
 
[HKEY_LOCAL_MACHINE\djoin\system\controlset001\Control\ComputerName\ActiveComputerName]
"ComputerName"="IMC-UNATTEND"
 
[HKEY_LOCAL_MACHINE\djoin\system\controlset001\Control\ComputerName\ComputerName]
"ComputerName"="IMC-UNATTEND"
 
[HKEY_LOCAL_MACHINE\djoin\system\controlset001\Control\LSA]
 
[HKEY_LOCAL_MACHINE\djoin\system\controlset001\Control\LSA\OfflineJoin]
"JoinAction"=dword:00000001
"MachineName"="IMC-Unattend"
"CurrentValue"="^a\&quot;_=xu5TboC+Jn6Li%EiyK^&:ATc%^ua/PHyRNiQ,\m]YHI=R+q-Y!/kGB%!a>N1x'<jr9lQK/3IxA dQKwUFt&8KI^D$,;=TTU8b\Y\/qf/qJwP'E7'7S"
"DNSDIName"="NTDEV"
"DNSDIDomName"="ntdev.corp.microsoft.com"
"DNSDIForestName"="ntdev.corp.microsoft.com"
"DNSDIGuid"=hex:3b,b0,21,ca,d3,6d,d1,11,8a,7d,b8,df,b1,56,87,1f
"DNSDISid"="S-1-5-21-397955417-626881126-188441444"
"JoinOptions"=dword:00000000
"ProvisionOptions"=dword:00000000
 
[HKEY_LOCAL_MACHINE\djoin\system\controlset001\Control\LSA\OfflineProvisioning]
"NumParts"=dword:00000001
 
[HKEY_LOCAL_MACHINE\djoin\system\controlset001\Control\LSA\OfflineProvisioning\1]
"Flags"=dword:00000001
"Type"="631c7621-5289-4321-bc9e-80f843f868c3"
 
[HKEY_LOCAL_MACHINE\djoin\system\controlset001\Control\LSA\OfflineProvisioning\1\Data]
 
[HKEY_LOCAL_MACHINE\djoin\system\controlset001\Services]
 
[HKEY_LOCAL_MACHINE\djoin\system\controlset001\Services\Netlogon]
"Start"=dword:00000002
 
[HKEY_LOCAL_MACHINE\djoin\system\controlset001\Services\Netlogon\JoinDomain]
"DomainControllerName"="\\B88-NTDEV-DC-34.ntdev.corp.microsoft.com"
"DomainControllerAddress"="\\2001:4898:4000:10f:215:5dff:fed8:7b03"
"DomainControllerAddressType"=dword:00000001
"DomainGuid"=hex:3b,b0,21,ca,d3,6d,d1,11,8a,7d,b8,df,b1,56,87,1f
"DomainName"="ntdev.corp.microsoft.com"
"DnsForestName"="ntdev.corp.microsoft.com"
"Flags"=dword:e001f1fc
"DcSiteName"="NA-WA-RED"
"ClientSiteName"="NA-WA-RED"
 
[HKEY_LOCAL_MACHINE\djoin\system\controlset001\Services\Tcpip]
 
[HKEY_LOCAL_MACHINE\djoin\system\controlset001\Services\Tcpip\Parameters]
"NV Hostname"="IMC-Unattend"
"Hostname"="IMC-Unattend"
"NV Domain"="ntdev.corp.microsoft.com"
"Domain"="ntdev.corp.microsoft.com"
 
[HKEY_LOCAL_MACHINE\djoin\system\Setup]
 
[HKEY_LOCAL_MACHINE\djoin\system\Setup\DJOIN]
"ODJComputerNameSet"=dword:00000001
```
Domain join and computer name both present (ordering between the two does not matter) (Unattended.xml)

```
<?xml version='1.0' encoding='utf-8'?>
<unattend xmlns="urn:schemas-microsoft-com:unattend" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State">
  <settings pass="offlineServicing">
      <component name="Microsoft-Windows-Shell-Setup" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS" processorArchitecture="amd64">  
         <ComputerName>daudhow-IMC-WMI</ComputerName>
      </component>     
      <component name="Microsoft-Windows-UnattendedJoin" processorArchitecture="amd64" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <OfflineIdentification>
           <Provisioning>
             <AccountData>AccountData</AccountData>
           </Provisioning>
         </OfflineIdentification>
      </component>
  </settings>
</unattend>
```

```
Windows Registry Editor Version 5.00
 
[HKEY_LOCAL_MACHINE\djoin_pcname]
@="mnmsrvc"
"Sequence"=dword:0000000f
 
[HKEY_LOCAL_MACHINE\djoin_pcname\system]
 
[HKEY_LOCAL_MACHINE\djoin_pcname\system\controlset001]
 
[HKEY_LOCAL_MACHINE\djoin_pcname\system\controlset001\Control]
 
[HKEY_LOCAL_MACHINE\djoin_pcname\system\controlset001\Control\ComputerName]
 
[HKEY_LOCAL_MACHINE\djoin_pcname\system\controlset001\Control\ComputerName\ActiveComputerName]
"ComputerName"="IMC-UNATTEND"
 
[HKEY_LOCAL_MACHINE\djoin_pcname\system\controlset001\Control\ComputerName\ComputerName]
"ComputerName"="IMC-UNATTEND"
 
[HKEY_LOCAL_MACHINE\djoin_pcname\system\controlset001\Control\LSA]
 
[HKEY_LOCAL_MACHINE\djoin_pcname\system\controlset001\Control\LSA\OfflineJoin]
"JoinAction"=dword:00000001
"MachineName"="IMC-Unattend"
"CurrentValue"="^a\\\"_=xu5TboC+Jn6Li%EiyK^&:ATc%^ua/PHyRNiQ,\\m]YHI=R+q-Y!/kGB%!a>N1x'<jr9lQK/3IxA dQKwUFt&8KI^D$,;=TTU8b\\Y\\/qf/qJwP'E7'7S"
"DNSDIName"="NTDEV"
"DNSDIDomName"="ntdev.corp.microsoft.com"
"DNSDIForestName"="ntdev.corp.microsoft.com"
"DNSDIGuid"=hex:3b,b0,21,ca,d3,6d,d1,11,8a,7d,b8,df,b1,56,87,1f
"DNSDISid"="S-1-5-21-397955417-626881126-188441444"
"JoinOptions"=dword:00000000
"ProvisionOptions"=dword:00000000
 
[HKEY_LOCAL_MACHINE\djoin_pcname\system\controlset001\Control\LSA\OfflineProvisioning]
"NumParts"=dword:00000001
 
[HKEY_LOCAL_MACHINE\djoin_pcname\system\controlset001\Control\LSA\OfflineProvisioning\1]
"Flags"=dword:00000001
"Type"="631c7621-5289-4321-bc9e-80f843f868c3"
 
[HKEY_LOCAL_MACHINE\djoin_pcname\system\controlset001\Control\LSA\OfflineProvisioning\1\Data]
 
[HKEY_LOCAL_MACHINE\djoin_pcname\system\controlset001\Services]
 
[HKEY_LOCAL_MACHINE\djoin_pcname\system\controlset001\Services\Netlogon]
"Start"=dword:00000002
 
[HKEY_LOCAL_MACHINE\djoin_pcname\system\controlset001\Services\Netlogon\JoinDomain]
"DomainControllerName"="\\\\B88-NTDEV-DC-34.ntdev.corp.microsoft.com"
"DomainControllerAddress"="\\\\2001:4898:4000:10f:215:5dff:fed8:7b03"
"DomainControllerAddressType"=dword:00000001
"DomainGuid"=hex:3b,b0,21,ca,d3,6d,d1,11,8a,7d,b8,df,b1,56,87,1f
"DomainName"="ntdev.corp.microsoft.com"
"DnsForestName"="ntdev.corp.microsoft.com"
"Flags"=dword:e001f1fc
"DcSiteName"="NA-WA-RED"
"ClientSiteName"="NA-WA-RED"
 
[HKEY_LOCAL_MACHINE\djoin_pcname\system\controlset001\Services\tcpip]
 
[HKEY_LOCAL_MACHINE\djoin_pcname\system\controlset001\Services\tcpip\parameters]
"NV HostName"="IMC-Unattend"
"HostName"="IMC-Unattend"
"NV Domain"="ntdev.corp.microsoft.com"
"Domain"="ntdev.corp.microsoft.com"
 
[HKEY_LOCAL_MACHINE\djoin_pcname\system\Setup]
 
[HKEY_LOCAL_MACHINE\djoin_pcname\system\Setup\DJOIN]
"DismComputerNameSet"=dword:00000001
"ODJComputerNameSet"=dword:00000001
```
</details>

## Additional OOBE parameters to skip prompts

In the existing script for Unattend.xml, if you want to skip the OOBE prompts, you will need to enter the following values:

```
<OOBE>
   <HideEULAPage>true</HideEULAPage>
   <HideOEMRegistrationScreen>true</HideOEMRegistrationScreen>
   <HideOnlineAccountScreens>true</HideOnlineAccountScreens>
   <HideWirelessSetupInOOBE>true</HideWirelessSetupInOOBE>
   <HideLocalAccountScreen>true</HideLocalAccountScreen>
</OOBE>
```
[Public documentation article:](https://learn.microsoft.com/en-us/windows-hardware/customize/desktop/automate-oobe) 


::: template /.templates/Processes/Knowledge-Management/RdpSsh-Feedback-Template.md
:::
