---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Microsoft Identity Manager/MIM 2016 Overview/Sync Service/Troubleshooting Guides/General Diagnostic Data"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FMicrosoft%20Identity%20Manager%2FMIM%202016%20Overview%2FSync%20Service%2FTroubleshooting%20Guides%2FGeneral%20Diagnostic%20Data"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Synchronization
- cw.IdentityManager2016
- cw.comm-sync
- cw.IDMgmt
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

## Powershell Script to Collect General Diagnostic Data
Example: TLS settings, MIM/OS/SP versions, App and System event logs, the MIM-Microsoft.ResourceManagement.Service.exe.config

Be sure to run the following prior to running the script below:
```Powershell
Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope Process
```
```Powershell
########## Start of PS commands ############# copy & paste ######################################################################
 
 
$ErrorActionPreference= 'silentlycontinue'
# We skip all errors as we don't want tshooting Powershell nor permissions, we try collecting required info most easy. If it fails - we need collecting manually
# check for execution powershell
# if PS Executionpolicy is Default, we might fail in running that script
# displaying that and showing command ready for copy & paste from customer
    Write-host ('')
    Write-host ('When getting error on Powershell Executionpolicy, this command would lower Executionpolicy only for this Powershell session:')
    Write-host ('Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope Process')
    Write-host ('')
 
#region initialize 
    # Data Collection script version
    $scriptver = '-v06-19-2023'
 
    # create folder for collecting data
    $fld = ("MIMData-" + $env:computername + (Get-Date  -Format '-yyyyMMdd_HHmmss'))
    New-Item -Path $fld -ItemType Directory > $null 
 
    # collect Windows version and save to file
    $OSVersionInfo = (Get-WmiObject Win32_OperatingSystem).Caption
    $scriptver  | Out-File .\$fld\$env:computername-WindowsOSVersion.txt -append 
    $OSVersionInfo  | Out-File .\$fld\$env:computername-WindowsOSVersion.txt -append 
 
    # check if Credential Guard is enabled 
    $credguard = (Get-CimInstance -ClassName Win32_DeviceGuard -Namespace root\Microsoft\Windows\DeviceGuard).SecurityServicesRunning
    if ($credguard.Item(0) -eq 0)
        { "Credential Guard is NOT enabled: " + $credguard | Out-File .\$fld\$env:computername-WindowsOSVersion.txt -append }
    else
        { "Credential Guard is enabled: " + $credguard  | Out-File .\$fld\$env:computername-WindowsOSVersion.txt -append } 
#endregion 
 
#region Registry Helperfunctions 
    # helper function to collect TLS versions and save to file
    Function Get-RegistryKeyPropertiesAndValues
    {  Param( [Parameter(Mandatory=$true)] [string]$path, [string]$logfile)
 
        Push-Location
        Set-Location -Path $path
        if (Test-Path $path)
            { $regvalue = Get-Item . 
                Pop-Location
              $regvalue | Out-File $logfile -append}
        else
            { Pop-Location
              $path + '  <= Key does not exist'  | Out-File $logfile -append }  # -TLS-Settings.txt -append }
    
    } 
    #end function Get-RegistryKeyPropertiesAndValues
 
    # This function will recurse through MIM CM related registry keys and return all values, rather than just values from the top level key
    Function Get-RegistryKeyPropertiesAndValues2
    {  Param( [Parameter(Mandatory=$true)] [string]$path, [string]$logfile)
 
        Push-Location
        Set-Location -Path $path
        if (Test-Path $path)
            { 
 
              $regvalue = Get-ChildItem -Path $path -Recurse
              Pop-Location
              $regvalue | Out-File $logfile -append
              }
        else
            { Pop-Location
              $path + '  <= Key does not exist'  | Out-File $logfile -append } # -MIM_CM_Reg-Settings.txt -append }
    
    } 
    #end function Get-RegistryKeyPropertiesAndValues2
#endregion
 
#region Collecting TLS info
    # collecting TLS versions and save to file 
    Get-RegistryKeyPropertiesAndValues -path �HKLM:\Software\Microsoft\.NETFramework\v2.0.50727' -logfile ($fld + '\' + $env:computername + '-TLS-Settings.txt')
 
    try
    {
        Get-ItemProperty -Path 'HKLM:\Software\Microsoft\.NETFramework\v2.0.50727' | Select-Object -ExpandProperty 'SystemDefaultTlsVersions' -ErrorAction Stop | Out-Null
        if ((Get-ItemPropertyValue �HKLM:\Software\Microsoft\.NETFramework\v2.0.50727' -Name 'SystemDefaultTlsVersions') -ne '1')
        {
             Add-Content -Path (".\$fld\$env:computername-TLS-Settings.txt") -Value '########################### Note ####################################################' 
             Add-Content -Path (".\$fld\$env:computername-TLS-Settings.txt") -Value '##                                                                                 ##'
             Add-Content -Path (".\$fld\$env:computername-TLS-Settings.txt") -Value '##      TLS 1.2 is NOT configured correctly                                        ##'
             Add-Content -Path (".\$fld\$env:computername-TLS-Settings.txt") -Value '##      SystemDefaultTlsVersions is not set correctly                              ##'
             Add-Content -Path (".\$fld\$env:computername-TLS-Settings.txt") -Value '##                                                                                 ##'
             Add-Content -Path (".\$fld\$env:computername-TLS-Settings.txt") -Value '##  See https://docs.microsoft.com/en-us/microsoft-identity-manager/preparing-tls  ##'  
             Add-Content -Path (".\$fld\$env:computername-TLS-Settings.txt") -Value '##                                                                                 ##'
             Add-Content -Path (".\$fld\$env:computername-TLS-Settings.txt") -Value '########################### Note ####################################################' 
        }
        else
        {
             Add-Content -Path (".\$fld\$env:computername-TLS-Settings.txt") -Value '########################### Note ########################' 
             Add-Content -Path (".\$fld\$env:computername-TLS-Settings.txt") -Value '##                                                     ##'
             Add-Content -Path (".\$fld\$env:computername-TLS-Settings.txt") -Value '##      seems TLS 1.2 is configured correctly          ##'
             Add-Content -Path (".\$fld\$env:computername-TLS-Settings.txt") -Value '##      SystemDefaultTlsVersions is == 1               ##'
             Add-Content -Path (".\$fld\$env:computername-TLS-Settings.txt") -Value '##                                                     ##'
             Add-Content -Path (".\$fld\$env:computername-TLS-Settings.txt") -Value '########################### Note ########################' 
        }
    }
    catch 
    {
         Add-Content -Path (".\$fld\$env:computername-TLS-Settings.txt") -Value '########################### Note ####################################################' 
         Add-Content -Path (".\$fld\$env:computername-TLS-Settings.txt") -Value '##                                                                                 ##'
         Add-Content -Path (".\$fld\$env:computername-TLS-Settings.txt") -Value '##      TLS 1.2 is NOT configured correctly                                        ##'
         Add-Content -Path (".\$fld\$env:computername-TLS-Settings.txt") -Value '##      SystemDefaultTlsVersions is missing                                        ##'
         Add-Content -Path (".\$fld\$env:computername-TLS-Settings.txt") -Value '##                                                                                 ##'
         Add-Content -Path (".\$fld\$env:computername-TLS-Settings.txt") -Value '##  See https://docs.microsoft.com/en-us/microsoft-identity-manager/preparing-tls  ##'  
         Add-Content -Path (".\$fld\$env:computername-TLS-Settings.txt") -Value '##                                                                                 ##'
         Add-Content -Path (".\$fld\$env:computername-TLS-Settings.txt") -Value '########################### Note ####################################################' 
    }
 
 
    Get-RegistryKeyPropertiesAndValues -path �HKLM:\Software\Wow6432Node\Microsoft\.NETFramework\v2.0.50727' -logfile ($fld + '\' + $env:computername + '-TLS-Settings.txt')
    Get-RegistryKeyPropertiesAndValues -path �HKLM:\Software\Microsoft\.NETFramework\v4.0.30319' -logfile ($fld + '\' + $env:computername + '-TLS-Settings.txt')
    Get-RegistryKeyPropertiesAndValues -path �HKLM:\Software\Wow6432Node\Microsoft\.NETFramework\v4.0.30319' -logfile ($fld + '\' + $env:computername + '-TLS-Settings.txt')
    Get-RegistryKeyPropertiesAndValues -path �HKLM:\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Protocols\TLS 1.0\Client' -logfile ($fld + '\' + $env:computername + '-TLS-Settings.txt')
    Get-RegistryKeyPropertiesAndValues -path �HKLM:\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Protocols\TLS 1.0\Server' -logfile ($fld + '\' + $env:computername + '-TLS-Settings.txt')
    Get-RegistryKeyPropertiesAndValues -path �HKLM:\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Protocols\TLS 1.1\Client' -logfile ($fld + '\' + $env:computername + '-TLS-Settings.txt')
    Get-RegistryKeyPropertiesAndValues -path �HKLM:\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Protocols\TLS 1.1\Server' -logfile ($fld + '\' + $env:computername + '-TLS-Settings.txt')
    Get-RegistryKeyPropertiesAndValues -path �HKLM:\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Protocols\TLS 1.2\Client' -logfile ($fld + '\' + $env:computername + '-TLS-Settings.txt')
    Get-RegistryKeyPropertiesAndValues -path �HKLM:\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Protocols\TLS 1.2\Server' -logfile ($fld + '\' + $env:computername + '-TLS-Settings.txt')
#endregion 
 
#region .NET
    # collect .NET versions and save to file
    $NETVersionInfo = Get-ChildItem 'HKLM:\SOFTWARE\Microsoft\NET Framework Setup\NDP' -recurse | Get-ItemProperty -name Version -EA 0 | Where { $_.PSChildName -match '^(?!S)\p{L}'} | Select PSChildName, Version 
    $NETVersionInfo  | Out-File .\$fld\$env:computername-NETVersion.txt -append 
#endregion 
 
#region Sync
    if( TEST-PATH ('HKLM:\SOFTWARE\Microsoft\Forefront Identity Manager\2010\Synchronization Service')){
        # on MIM Synchronization Server
        New-Item -Path ($fld + '\ServerExport') -ItemType Directory > $null
            # collect registry values
            reg query "HKLM\SOFTWARE\Microsoft\Forefront Identity Manager" /s >> .\$fld\$env:computername-MIMRegistry-FimInst.txt
            reg query HKLM\SYSTEM\CurrentControlSet\services\FIMSynchronizationService /s >> .\$fld\$env:computername-MIMSyncRegistry.txt
 
            # collect version info
            $syncbinary = (Get-ItemProperty -Path HKLM:\SYSTEM\CurrentControlSet\services\FIMSynchronizationService).Imagepath -replace '"'
            $FileVersionInfo = (Get-Item $syncbinary).VersionInfo   
            if ((Get-Item $syncbinary).VersionInfo.ProductVersion -ge '4.6.34.0') 
                {   $FileVersionInfo | Out-File .\$fld\$env:computername-MIMVersion.txt -append
                    ($FileVersionInfo.ProductVersion + ' ==> This MIM Deployment is supported, using MIM SP2 or newer') | Out-File .\$fld\$env:computername-MIMVersion.txt -append } 
            else
                {   ($FileVersionInfo.ProductVersion + ' ==> This MIM Deployment is supported, using MIM SP2 or newer') | Out-File .\$fld\$env:computername-MIMVersion.txt -append
                    Write-Host 'MIM Deployment is NOT supported, older than MIM SP2, see https://learn.microsoft.com/en-us/lifecycle/products/' -ForegroundColor Green
                    Read-Host "`nConfirm MIM Deployment is out of support (press any key to continue)"                } 
 
 
            # collect installed Connector builds
            Wmic product get name,version | Select-String  -Pattern 'Identity' | Set-Content .\$fld\$env:computername-MIMConnectorVersions.txt 
 
            # collect config files
            $syncconfig = (Get-ItemProperty -Path HKLM:\SYSTEM\CurrentControlSet\services\FIMSynchronizationService).Imagepath -replace '"'
            Copy-Item ($syncconfig + '.config') -Destination ($fld + '\' + $env:computername +'-Miiserver.exe.config')
 
            # collect GALSync details
            $ExtFolder = (Get-ItemPropertyValue -Path HKLM:\SYSTEM\CurrentControlSet\services\FIMSynchronizationService\Parameters -Name Path) + '\Extensions'
            $GALExtensions = $fld + '\Extensions'
            New-Item -Path ($GALExtensions) -ItemType Directory > $null
            Get-ChildItem $ExtFolder -filter '*.xml' | Copy-Item -destination $GALExtensions
            Get-ChildItem $ExtFolder -filter '*GAL*' | Copy-Item -destination $GALExtensions
 
            # collect Server Configuration Export
            $svrexp = '& ' + ((Get-ItemProperty -Path HKLM:\SYSTEM\CurrentControlSet\Services\FIMSynchronizationService).ImagePath  -replace 'miiserver.exe"','svrexport.exe" ') + $fld + '\ServerExport'
            Invoke-Expression -Command $svrexp 
 
    }
#endregion
 
#region CM
    if( TEST-PATH ('HKLM:\SOFTWARE\Microsoft\CLM')){
        # on MIM CM Web Server
  
            # collect version info
            $svcbinary = (Get-ItemProperty -Path HKLM:\SYSTEM\CurrentControlSet\services\FIMCMUpdateService).Imagepath -replace '"'
            $FileVersionInfo = (Get-Item $svcbinary).VersionInfo | Out-File .\$fld\$env:computername-MIM_CM_UpdateService_Version.txt -append      
 
            # collect config files
            $clmUpdateSvcconfig = (Get-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Clm\v1.0\Setup).'Microsoft.Clm.Service.exe.config'
            Copy-Item ($clmUpdateSvcconfig) -Destination ($fld + '\' + $env:computername +'-Microsoft.Clm.Service.exe.config')
 
            $clmUtilconfig = (Get-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Clm\v1.0\Setup).'ClmUtil.exe.config'
            Copy-Item ($clmUtilconfig) -Destination ($fld + '\' + $env:computername +'-ClmUtil.exe.config')
 
            $clmWebconfig = (Get-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Clm\v1.0\Setup).WebFolder
            Copy-Item ($clmWebconfig + 'web.config') -Destination ($fld + '\' + $env:computername +'-Clm_web.config')
 
 
            # Registry keys for MIM CM
            Get-RegistryKeyPropertiesAndValues2 -path 'HKLM:\SOFTWARE\Microsoft\CLM' -logfile ($fld + '\' + $env:computername + '-MIM_CM_Reg-Settings.txt')
            Get-RegistryKeyPropertiesAndValues2 -path 'HKLM:\SYSTEM\CurrentControlSet\Services\FIMCMUpdateService' -logfile ($fld + '\' + $env:computername + '-MIM_CM_Reg-Settings.txt')
            Get-RegistryKeyPropertiesAndValues2 -path 'HKLM:\SOFTWARE\Wow6432Node\Microsoft\CLM' -logfile ($fld + '\' + $env:computername + '-MIM_CM_Reg-Settings.txt')
            Get-RegistryKeyPropertiesAndValues2 -path 'HKLM:\SYSTEM\ControlSet001\Services\CertSvc\Configuration\*\PolicyModules\Clm.Policy' -logfile ($fld + '\' + $env:computername + '-MIM_CM_Reg-Settings.txt')
            Get-RegistryKeyPropertiesAndValues2 -path 'HKLM:\SYSTEM\ControlSet001\Services\CertSvc\Configuration\*\ExitModules\Clm.Exit' -logfile ($fld + '\' + $env:computername + '-MIM_CM_Reg-Settings.txt')
            reg query HKLM\SOFTWARE\Microsoft\CLM\v1.0\Server /s >> .\$fld\$env:computername-MIM_CM_Reg-Settings.txt  
 
    }
#endregion
 
#region PCNS
    if( TEST-PATH ('HKLM:\SYSTEM\CurrentControlSet\Services\PCNSSVC')){
        # on DC - PCNS Details
            reg query HKLM\SYSTEM\CurrentControlSet\Services\PCNSSVC /s >> .\$fld\$env:computername-MIMRegistry-PCNS.txt
 
            # collect version info
            $pcnsbinary = (Get-ItemProperty -Path HKLM:\SYSTEM\CurrentControlSet\Services\PCNSSVC).Imagepath -replace '"' 
            $FileVersionInfo = (Get-Item $pcnsbinary).VersionInfo | Out-File .\$fld\$env:computername-PCNSVersion.txt -append 
    
            # collect PCNSCFG LIST
            $pcnsexe = '& ' + ((Get-ItemProperty -Path HKLM:\SYSTEM\CurrentControlSet\Services\PCNSSVC).ImagePath  -replace 'pcnssvc.exe"','pcnscfg.exe"') + ' --% LIST'
            Invoke-Expression -Command $pcnsexe  | Out-File  .\$fld\$env:userdomain-pcnscfg-LIST.txt
    }
#endregion
 
#region Service and Portal
    if( (TEST-PATH ('HKLM:\SYSTEM\CurrentControlSet\Services\FIMService')) -or (TEST-PATH ('HKLM:\SYSTEM\CurrentControlSet\Services\SPTimerV4')) ){
        # on all MIM Service and Portal Servers 
 
            # collect registry values
            reg query "HKLM\SOFTWARE\Microsoft\Forefront Identity Manager" /s >> .\$fld\$env:computername-MIMRegistry-FimInst.txt
            reg query HKLM\SYSTEM\CurrentControlSet\services\FIMService /s >> .\$fld\$env:computername-MIMServiceRegistry.txt
            reg query HKLM\SYSTEM\CurrentControlSet\Services\SPTimerV4 /s >> .\$fld\$env:computername-MIMServiceRegistry.txt
            
            # collect version info
            $svcbinary = (Get-ItemProperty -Path HKLM:\SYSTEM\CurrentControlSet\services\FIMService).Imagepath -replace '"' 
            $FileVersionInfo = (Get-Item $svcbinary).VersionInfo   
            if ((Get-Item $svcbinary).VersionInfo.ProductVersion -ge '4.6.34.0') 
                {   $FileVersionInfo | Out-File .\$fld\$env:computername-MIMVersion.txt -append
                    ($FileVersionInfo.ProductVersion + ' ==> This MIM Deployment is supported, using MIM SP2 or newer') | Out-File .\$fld\$env:computername-MIMVersion.txt -append } 
            else
                {   ($FileVersionInfo.ProductVersion + ' ==> This MIM Deployment is supported, using MIM SP2 or newer') | Out-File .\$fld\$env:computername-MIMVersion.txt -append
                    Write-Host 'MIM Deployment is NOT supported, older than MIM SP2, see https://learn.microsoft.com/en-us/lifecycle/products/' -ForegroundColor Green
                    Read-Host "`nConfirm MIM Deployment is out of support (press any key to continue)"
                } 
 
    
            # collect config files
            $svcconfig = (Get-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\services\FIMService').Imagepath -replace '"'
            Copy-Item  ($svcconfig + '.config') -Destination ($fld + '\' + $env:computername +'-Microsoft.ResourceManagement.Service.exe.config')
            $portalconfig = (Get-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\InetStp').PathWWWRoot -replace '"'
            Copy-Item  ($portalconfig +'\wss\VirtualDirectories\80\web.config') -Destination ($fld + '\' + $env:computername +'-MIM_portal_HTTP_web.config')
            Copy-Item  ($portalconfig +'\wss\VirtualDirectories\443\web.config') -Destination ($fld + '\' + $env:computername +'-MIM_portal_HTTPS_web.config')
  
            # collect IIS MIM Website authentication setting, as I don't know the Portal Name, I guess for HTTP
            $IISPortal =  (Get-WebSite | Where-Object {$_.physicalpath -like "*\inetpub\wwwroot\wss\VirtualDirectories\80"}).name
            if ($IISPortal)
            {  
                ("`nMIM Website: http://" + $IISPortal +':80') | Out-File .\$fld\$env:computername-MIMWebSite.txt -append
                ('                                    Should be  |  is value') | Out-File .\$fld\$env:computername-MIMWebSite.txt -append
                ('-----------------------------------------------------------') | Out-File .\$fld\$env:computername-MIMWebSite.txt -append
                $IISconf = Get-WebConfiguration -filter /system.webServer/security/authentication/windowsAuthentication ('IIS:\Sites\' + $IISPortal +'\')
                ('MIM Website: authPersistNonNTLM        (False) => ' + $IISconf.authPersistNonNTLM) | Out-File .\$fld\$env:computername-MIMWebSite.txt -append
                ('MIM Website: authPersistSingleRequest  (False) => ' + $IISconf.authPersistSingleRequest) | Out-File .\$fld\$env:computername-MIMWebSite.txt -append
                ('MIM Website: useAppPoolCredentials      (True) => ' + $IISconf.useAppPoolCredentials) | Out-File .\$fld\$env:computername-MIMWebSite.txt -append
                ('MIM Website: useKernelMode             (False) => ' + $IISconf.useKernelMode) | Out-File .\$fld\$env:computername-MIMWebSite.txt -append
            }
            # collect IIS MIM Website authentication setting, as I don't know the Portal Name, I guess for HTTPS
            $IISPortal =  (Get-WebSite | Where-Object {$_.physicalpath -like "*\inetpub\wwwroot\wss\VirtualDirectories\443"}).name
            if ($IISPortal)
            {  
                ("`nMIM Website: https://" + $IISPortal + ':443') | Out-File .\$fld\$env:computername-MIMWebSite.txt -append
                ("                                    Should be  |  is value") | Out-File .\$fld\$env:computername-MIMWebSite.txt -append
                ('-----------------------------------------------------------') | Out-File .\$fld\$env:computername-MIMWebSite.txt -append
                $IISconf = Get-WebConfiguration -filter /system.webServer/security/authentication/windowsAuthentication ('IIS:\Sites\' + $IISPortal +'\')
                ('MIM Website: authPersistNonNTLM        (False) => ' + $IISconf.authPersistNonNTLM) | Out-File .\$fld\$env:computername-MIMWebSite.txt -append
                ('MIM Website: authPersistSingleRequest  (False) => ' + $IISconf.authPersistSingleRequest) | Out-File .\$fld\$env:computername-MIMWebSite.txt -append
                ('MIM Website: useAppPoolCredentials      (True) => ' + $IISconf.useAppPoolCredentials) | Out-File .\$fld\$env:computername-MIMWebSite.txt -append
                ('MIM Website: useKernelMode             (False) => ' + $IISconf.useKernelMode) | Out-File .\$fld\$env:computername-MIMWebSite.txt -append
            }
 
            # collect Trusted Intranet Sites
            # ("`nTrusted Intranet Sites, verify is MIM Portal URL is in that list") | Out-File .\$fld\$env:computername-MIMWebSite.txt -append
            # Get-RegistryKeyPropertiesAndValues2 -path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains' -logfile ($fld + '\' + $env:computername + '-MIMwebSite.txt')
 
 
            # collect db upgrade log, if we hit install error, need running msi file and see this errors in dbupgrade
        #     $dbupgrade = (Get-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Forefront Identity Manager\2010\Service').Location -replace '"'
        #     Copy-Item  ($dbupgrade + 'Microsoft.IdentityManagement.DatabaseUpgrade_tracelog.txt')  -Destination ($fld + '\' + $env:computername +'-Microsoft.IdentityManagement.DatabaseUpgrade_tracelog.txt')
 
    }
#endregion
 
#region SSPR
    if(( Test-Path ('HKLM:\SOFTWARE\Microsoft\Forefront Identity Manager\2010\Password Registration Portal')) -or ( Test-Path ('HKLM:\SOFTWARE\Microsoft\Forefront Identity Manager\2010\Password Reset Portal'))){
            # on all SSPR Servers
 
            # collect registry values
            reg query "HKLM\SOFTWARE\Microsoft\Forefront Identity Manager" /s >> .\$fld\$env:computername-MIMSSPR-Registry-FimInst.txt
    
            # collect version info
            $regbinary = ((Get-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Forefront Identity Manager\2010\Password Registration Portal').Location -replace '"' ) + 'bin\Microsoft.ResourceManagement.dll'
            $FileVersionInfo = (Get-Item $regbinary).VersionInfo   
            if ((Get-Item $regbinary).VersionInfo.ProductVersion -ge '4.6.34.0') 
                {   $FileVersionInfo | Out-File .\$fld\$env:computername-MIMVersion.txt -append
                    ($FileVersionInfo.ProductVersion + ' ==> This MIM Deployment is supported, using MIM SP2 or newer') | Out-File .\$fld\$env:computername-MIMVersion.txt -append } 
            else
                {   ($FileVersionInfo.ProductVersion + ' ==> This MIM Deployment is supported, using MIM SP2 or newer') | Out-File .\$fld\$env:computername-MIMVersion.txt -append
                    Write-Host 'MIM Deployment is NOT supported, older than MIM SP2, see https://learn.microsoft.com/en-us/lifecycle/products/' -ForegroundColor Green
                    Read-Host "`nConfirm MIM Deployment is out of support (press any key to continue)"
                } 
 
            $rstbinary = ((Get-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Forefront Identity Manager\2010\Password Reset Portal').Location -replace '"' ) + 'bin\Microsoft.ResourceManagement.dll'
            $FileVersionInfo = (Get-Item $rstbinary).VersionInfo   
            if ((Get-Item $rstbinary).VersionInfo.ProductVersion -ge '4.6.34.0') 
                {   $FileVersionInfo | Out-File .\$fld\$env:computername-MIMVersion.txt -append
                    ($FileVersionInfo.ProductVersion + ' ==> This MIM Deployment is supported, using MIM SP2 or newer') | Out-File .\$fld\$env:computername-MIMVersion.txt -append } 
            else
                {   ($FileVersionInfo.ProductVersion + ' ==> This MIM Deployment is supported, using MIM SP2 or newer') | Out-File .\$fld\$env:computername-MIMVersion.txt -append
                    Write-Host 'MIM Deployment is NOT supported, older than MIM SP2, see https://learn.microsoft.com/en-us/lifecycle/products/' -ForegroundColor Green
                    Read-Host "`nConfirm MIM Deployment is out of support (press any key to continue)"
                } 
 
        
            # collect config files
            $regconfig = (Get-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Forefront Identity Manager\2010\Password Registration Portal').Location -replace '"'
            Copy-Item  ($regconfig + 'web.config') -Destination ($fld + '\' + $env:computername +'-registration_portal_web.config')
            $rstconfig = (Get-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Forefront Identity Manager\2010\Password Reset Portal').Location -replace '"'
            Copy-Item  ($rstconfig + 'web.config') -Destination ($fld + '\' + $env:computername +'-reset_portal_web.config')
 
    } 
#endregion
 
#region PAM
    if( TEST-PATH ('HKLM:\SYSTEM\CurrentControlSet\Services\PamMonitoringService')){
            # on PAM Server - PAM Details
            reg query HKLM\SYSTEM\CurrentControlSet\Services\PamMonitoringService /s >> .\$fld\$env:computername-PAM-MIMRegistry.txt
            reg query HKLM\SYSTEM\CurrentControlSet\Services\PrivilegeManagementComponentService /s >> .\$fld\$env:computername-PAM-MIMRegistry.txt
 
            # collect version info
            $pammonbin = (Get-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Services\PamMonitoringService').Imagepath -replace '"'
            $FileVersionInfo = (Get-Item $pammonbin).VersionInfo   
            if ((Get-Item $pammonbin).VersionInfo.ProductVersion -ge '4.6.34.0') 
                {   $FileVersionInfo | Out-File .\$fld\$env:computername-MIMVersion.txt -append
                    ($FileVersionInfo.ProductVersion + ' ==> This MIM Deployment is supported, using MIM SP2 or newer') | Out-File .\$fld\$env:computername-MIMVersion.txt -append } 
            else
                {   ($FileVersionInfo.ProductVersion + ' ==> This MIM Deployment is supported, using MIM SP2 or newer') | Out-File .\$fld\$env:computername-MIMVersion.txt -append
                    Write-Host 'MIM Deployment is NOT supported, older than MIM SP2, see https://learn.microsoft.com/en-us/lifecycle/products/' -ForegroundColor Green
                    Read-Host "`nConfirm MIM Deployment is out of support (press any key to continue)"
                } 
                
            # collect config files
            $pamMconfig = (Get-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Services\PamMonitoringService').Imagepath -replace '"'
            Copy-Item  ($pamMconfig + '.config') -Destination ($fld + '\' + $env:computername +'-PAM-Microsoft.IdentityManagement.PamMonitoring.exe.config')
            $pamsvcconfig = ((Get-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Forefront Identity Manager\2010\Service').Location -replace '"') + 'PAM\Services\'
            Copy-Item  ($pamsvcconfig + 'Microsoft.IdentityManagement.PrivilegeManagement.exe.config') -Destination ($fld + '\' + $env:computername +'-PAM-Microsoft.IdentityManagement.PrivilegeManagement.exe.config')
            $samplePortalconfig = ((Get-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Forefront Identity Manager\2010').ServiceandPortalLocation -replace '"') + 'Privileged Access Management REST API\'
            Copy-Item  ($samplePortalconfig + 'web.config') -Destination ($fld + '\' + $env:computername +'-PAM-sample_portal_web.config') 
            $samplePortalconfig = ((Get-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Forefront Identity Manager\2010').ServiceandPortalLocation -replace '"') + 'Privileged Access Management Portal\js\'
            Copy-Item  ($samplePortalconfig + 'utils.js') -Destination ($fld + '\' + $env:computername +'-PAM-sample_portal_utils.js') 
 
            # check if script install, then copy Install Logs
            if( TEST-PATH (($env:APPDATA) + '\MIMPAMInstall')){ Copy-Item -Path ($env:APPDATA + '\MIMPAMInstall') -Destination $fld -Recurse } 
 
            # PAM Configuration
            Get-PAMConfiguration | Out-File .\$fld\$env:userdomain-PAM-Configuration-Info.txt
 
            # check if MIMsync is running
            Add-Type -AssemblyName System.ServiceProcess
            $ServiceObject = [System.ServiceProcess.ServiceController]::new('FIMSynchronizationService')
            if ( $ServiceObject.Status = 'Running' ){
                ('MIM Sync is running =>  Not supported for PAM per published documentation. This is not MIM PAM, maybe MCS PAM') | Out-File .\$fld\$env:computername-PAM-Configuration-Info.txt -append
            }
 
 
    }
#endregion 
 
#region Kerberos 
    # Kerberos - collecting current Settings and specify expected SPNs
    "Trying to verify Kerberos Config, this is BETA feature!" | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
 
    # checking accounts and servernames
    "`nChecking accounts and servernames" | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
    "=================================" | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
 
    # find Sharepoint Pool account
    Add-PSSnapin Microsoft.SharePoint.Powershell
    $sppoolaccount = (Get-SPWebApplication $iisportal).ApplicationPool.username
    ("Sharepoint Pool Account: " + $sppoolaccount)  | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
 
    # find mim portal servername
    $mimportalserverFQDN = (Get-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Forefront Identity Manager\2010\Portal').ServiceAddress
    $mimportalserverNB = $mimportalserverFQDN.Substring(0,$mimportalserverFQDN.IndexOf("."))
    ("MIM Portal Servername: " + $mimportalserverNB + ', ' + $mimportalserverFQDN )  | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
 
    # find mim service account
    $mimserviceaccount = (Get-ItemProperty -Path HKLM:\SYSTEM\CurrentControlSet\services\FIMService).objectname
    ("MIMservice Account: " + $mimserviceaccount)  | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
 
    # find MIMService servername (local server)
    $mimserviceserverNB = $env:COMPUTERNAME
    $mimserviceserverFQDN = $mimserviceserverNB + '.' + $env:userdnsdomain
    ("MIM Service Servername: " + $mimserviceserverNB + ', ' + $mimserviceserverFQDN )  | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
 
    # find SSPR Registration Portal poolaccount
    $ssprRegpoolaccount = (Get-IISAppPool FIMPasswordRegistrationAppPool  | Select-Object  @{e={$_.processModel.username};l="username"}).username
    ("SSPR Registration Portal Account: " + $ssprRegpoolaccount)  | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
 
    # find MIM Password Registration servername 
    $Binding = Get-WebSite "MIM Password Registration Site" | Get-WebBinding |Select -ExpandProperty bindingInformation
    $ssprRegservername = ($Binding -split ":")[-1]
    ("MIM Password Registration Servername: " + $ssprRegservername )  | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
 
    # find SSPR Reset Portal poolaccount
    $ssprRSTpoolaccount = (Get-IISAppPool FIMPasswordResetAppPool  | Select-Object  @{e={$_.processModel.username};l="username"}).username
    ("SSPR Reset Portal Account: " + $ssprRSTpoolaccount)  | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
 
    # find MIM Password Reset servername 
    $Binding = Get-WebSite "MIM Password Reset Site" | Get-WebBinding |Select -ExpandProperty bindingInformation
    $ssprRSTservername = ($Binding -split ":")[-1]
    ("MIM Password Reset Servername: " + $ssprRSTservername )  | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
 
    # checking existing SPNs
    "`nchecking existing SPNs" | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
    "======================" | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
 
    # get SPNs for MIM Service Account
    "Existing SPNs for: " + $mimserviceaccount  | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
    setspn -l $mimserviceaccount | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
 
    # get SPNs for SP Pool Account
    "Existing SPNs for: " + $sppoolaccount  | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
    setspn -l $sppoolaccount | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
 
    # get SPNs for SSPR Registration Portal poolaccount
    "Existing SPNs for: " + $ssprRegpoolaccount  | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
    setspn -l $ssprRegpoolaccount | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
 
    # get SPNs forSSPR Reset Portal poolaccount
    "Existing SPNs for: " + $ssprRSTpoolaccount  | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
    setspn -l $ssprRSTpoolaccount | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
 
    # SPNs we need to create based on the accounts identified:
    # checking existing SPNs
    "`nSPNs we need to create, based on the accounts we identified :" | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
    "(Please compare if required SPN match or if some are missing)" | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
    "=============================================================" | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
    ("`nsetspn -S FIMService/" + $mimserviceserverFQDN + ' ' + $mimserviceaccount) | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
    ("setspn -S FIMService/" + $mimserviceserverNB + ' ' + $mimserviceaccount) | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
    ("setspn -S FIMService/<any-other-A-Record, CNAME, ALIAS, LoadBalancedName> " + $mimserviceaccount) | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
    ("`nsetspn -S http/" + $mimportalserverFQDN + ' ' + $sppoolaccount) | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
    ("setspn -S http/" + $mimportalserverNB + ' ' + $sppoolaccount) | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
    ("setspn -S http/<any-other-A-Record, CNAME, ALIAS, LoadBalancedName> " + $sppoolaccount) | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
    ("`nsetspn -S http/" + $ssprRegservername + ' ' + $ssprRegpoolaccount) | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
    ("setspn -S http/" + $ssprRSTservername + ' ' + $ssprRSTpoolaccount) | Out-File .\$fld\$env:computername-MIMKerberos.txt -append
 
#endregion
 
#region SPNs
# collect all important http and FIMService SPNs
    $search = New-Object DirectoryServices.DirectorySearcher([ADSI]"")
    $search.filter = "(|((servicePrincipalName=FIM*)(servicePrincipalName=http*)(servicePrincipalName=PCNS*)))"
    $results = $search.Findall()
 
    foreach( $result in $results ) {
        $userEntry = $result.GetDirectoryEntry()
 
        Add-Content -Path ('.\' + $fld + '\' + $env:COMPUTERNAME + '-MIMspns.txt') -Value ("Object Name    = " +    $userEntry.name )
        Add-Content -Path ('.\' + $fld + '\' + $env:COMPUTERNAME + '-MIMspns.txt') -Value ("DN        = " + $userEntry.distinguishedName)
        Add-Content -Path ('.\' + $fld + '\' + $env:COMPUTERNAME + '-MIMspns.txt') -Value ("Object Cat.    = " + $userEntry.objectCategory)
        Add-Content -Path ('.\' + $fld + '\' + $env:COMPUTERNAME + '-MIMspns.txt') -Value "servicePrincipalNames:"
 
        $i=1
        foreach( $SPN in $userEntry.servicePrincipalName ) {
            if ( ($SPN -like 'http/*') -or ($SPN -like 'FIMSERVICE/*') -or ($SPN -like 'pcns*') ) {
                Add-Content -Path ('.\' + $fld + '\' + $env:COMPUTERNAME + '-MIMspns.txt') -Value  "    SPN ${i}     = $SPN"
                $i+=1
            }
        }
        Add-Content -Path ('.\' + $fld + '\' + $env:COMPUTERNAME + '-MIMspns.txt') -Value  "----------------------------------------------"
    
    }
 
    # collect all important FIM GMSA SPNs
    $search = New-Object DirectoryServices.DirectorySearcher([ADSI]"")
    $search.filter =  "(&(objectClass=msDS-GroupManagedServiceAccount)(|((servicePrincipalName=FIM*)(servicePrincipalName=http*)(servicePrincipalName=PCNS*))))"
    $results = $search.Findall()
 
        foreach( $result in $results ) {
            $userEntry = $result.GetDirectoryEntry()
 
            Add-Content -Path ('.\' + $fld + '\' + $env:COMPUTERNAME + '-MIM-GMSA-spns.txt') -Value ("Object Name    = " +    $userEntry.name )
            Add-Content -Path ('.\' + $fld + '\' + $env:COMPUTERNAME + '-MIM-GMSA-spns.txt') -Value ("DN        = " + $userEntry.distinguishedName)
            Add-Content -Path ('.\' + $fld + '\' + $env:COMPUTERNAME + '-MIM-GMSA-spns.txt') -Value ("Object Cat.    = " + $userEntry.objectCategory)
            Add-Content -Path ('.\' + $fld + '\' + $env:COMPUTERNAME + '-MIM-GMSA-spns.txt') -Value "servicePrincipalNames:"
 
            $i=1
            foreach( $SPN in $userEntry.servicePrincipalName ) {
                Add-Content -Path ('.\' + $fld + '\' + $env:COMPUTERNAME + '-MIM-GMSA-spns.txt') -Value  "    SPN ${i}     = $SPN"
                $i+=1
            }
        Add-Content -Path ('.\' + $fld + '\' + $env:COMPUTERNAME + '-MIM-GMSA-spns.txt') -Value  "----------------------------------------------"
    }
#endregion
 
#region delegation 
# collect delegation info:
    Get-ADUser -Filter {(((servicePrincipalName -like 'FIM*') -or (servicePrincipalName -like 'http*')) -and (msDS-AllowedToDelegateTo -like '*') )} -Properties * |
    ForEach-Object {'AccountName: "' + $_.DistinguishedName + '" is trusted for delegation to'; $_ | 
    select -ExpandProperty msDS-AllowedToDelegateTo; "" } | Out-File .\$fld\$env:userdomain-Delegation-Info.txt
#endregion
 
#region EVTX  
# Event Logs to collect
    $EvtxArray = @("System","Application", "Forefront Identity Manager", "Forefront Identity Manager Management Agent",  "Microsoft-IdentityManagement-CertificateManagement/Admin")
    Foreach($log in $EvtxArray) { wevtutil epl $log ($fld + '\' + $env:computername + '-' + ($log -replace "/","-")  + ".evtx") }
#endregion 
 
# collect MSINFO32 data
#    Invoke-Expression -Command ('& ' + $env:systemroot + '\system32\msinfo32.exe /nfo .\' + $fld + '\' + $env:computername +'-msinfo32.nfo')
 
#region ZIP 
    # compress files into one archive, ready for upload
        # wait for MSinfo32 completed
    #    write-host ' '
    #    Write-Host 'Waiting for MSInfo32 to complete...'
    #    write-host ' '
    #    while (!(Test-Path -Path ($fld + '\' + $env:computername +'-msinfo32.nfo'))) { Start-Sleep 10 }
    #    Write-Host 'MSInfo32 completed...'
    write-host ' '
    write-host 'Compressing files...' -ForegroundColor Green
    write-host ' '
    # get current time in UTC and timezone diff
    $DestZip = ( $env:computername + (Get-Date  -Format '-yyyyMMdd_HHmmK')  + $scriptver + '-MIMCollectedData.zip') -replace ':','.'
    # Copmpress-Archive does not work on old OS, then this file is not created
    Compress-Archive -Path ('.\' + $fld ) -DestinationPath $DestZip
    
    # tell howto continue
    Write-host ('Pls upload ' +$DestZip +' to DTM Workspace,') -ForegroundColor Yellow -NoNewline; Write-Host ' Link to be shared from Support Professional'  -ForegroundColor Green
    write-host ' '
    write-host 'Data Collection completed- Thank You for your collaboration' -ForegroundColor Green
 #endregion 
 
$ErrorActionPreference= 'continue'
 
########## End of PS commands ############# copy & paste ######################################################################

```
