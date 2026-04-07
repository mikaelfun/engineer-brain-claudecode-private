---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/ADFS and WAP/ADFS workflow - Creating Check if proxy trust certificate settings between AD FS and Proxy are correct"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FADFS%20and%20WAP%2FADFS%20workflow%20-%20Creating%20Check%20if%20proxy%20trust%20certificate%20settings%20between%20AD%20FS%20and%20Proxy%20are%20correct"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-adfs
- cw.adfs troubleshooting
- cw.adfs wap
- SCIM Identity
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[[_TOC_]]

## Introduction

  
The symptoms that we have been seeing are that the Proxy Trust relationship between a Web Application Proxy server and an ADFS 2012 R2 server either cannot be correctly established or starts to fail at some point in time.  
  
The proxy trust relationship between a Web Application Proxy server and the AD FS 2012 R2 server is client certificate based. When the Web Application Proxy post-install wizard is run a self-signed Client Certificate is generated and inserted into the AD FS configuration store using the credentials specified in the wizard. AD FS also propagates this to the AdfsTrustedDevices certificate store on the AD FS server.  
  
During any SSL communication, HTTP.sys uses the following priority order for its SSL bindings

|          |               |               |                                                   |
| -------- | ------------- | ------------- | ------------------------------------------------- |
| Priority | Name          | Parameters    | Description                                       |
| 1        | IP            | IP,Port       | Exact IP and Port match                           |
| 2        | SNI           | Hostname,Port | Exact hostname match(connection must specify SNI) |
| 3        | CSS           | Port          | Invoke Central Certificate Store                  |
| 4        | IPv6 Wildcard | Port          | IPv6 wildcard match(connection must be IPv6)      |
| 5        | IPv6 Wildcard | Port          | IP wildcard match(connection can be IPv4 or IPv6) |

<div class="center">

<div class="thumb tnone">

<div class="thumbinner" style="width:302px;">

[![ADFS WF Trust certificate.png](/.attachments/bf77c85b-2cec-1074-5dd0-fef7cea88f20300px-ADFS_WF_Trust_certificate.png)](/.attachments/bf77c85b-2cec-1074-5dd0-fef7cea88f20300px-ADFS_WF_Trust_certificate.png)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

</div>

  

### <span id="Is_there_a_specific_IPAddress:Port_mapping?"></span><span id="Is_there_a_specific_IPAddress:Port_mapping.3F" class="mw-headline">**Is there a specific IPAddress:Port mapping?**  
</span>

  
As mentioned above the IP:Port mapping is of the highest precedence. Therefore, if there exists an IP:Port binding, then that is the certificate that will be used by HTTP.sys all the time for SSL communication.  
*<u>Remove the specific</u> IP:port <u>binding</u>*  
  
Be sure to check that the binding does not come back as if there is an application configured with such a binding it may recreate this automatically or on next service start-up.  
  
*<u>Use an additional IP address for AD FS traffic</u>*  
  
If the IP:Port binding is expected and required, then using a 2nd IP such as 1.2.3.5 for ADFS and resolving the ADFS service FQDN to this IP address would mean that the Hostname:port bindings would then be used.  
  
*<u>Configure the</u> AdfsTrustedDevices <u>store as the</u> Ctl <u>Store for the specific</u> IP:port <u>binding</u>*  
  
This will again have some dependence on why the specific IP:port binding is there and if this relies on the default CTL Store for client certificate authentication but an option would be to set the Ctl Store on the IP:port binding to be the AdfsTrustedDevices store.  
  

### **How to check current SSL certificate bindings**

1.  Log-in to AD FS server
2.  Open PowerShell
3.  Run **netsh http show sslcert**

  
**C:\\Users\\administrator.CONTOSO\>netsh http show sslcert  
**
SSL Certificate bindings:  
-  
 Hostname:port: adfs.contoso.com:443  
 Certificate Hash: 3638de9b03a488341dfe32fc3ae5c480ee687793  
 Application ID: {5d89a20c-beab-4389-9447-324788eb944a}  
 Certificate Store Name: MY  
 Verify Client Certificate Revocation: Enabled  
 Verify Revocation Using Cached Client Certificate Only: Disabled  
 Usage Check: Enabled  
 Revocation Freshness Time: 0  
 URL Retrieval Timeout: 0  
 Ctl Identifier: (null)  
 Ctl Store Name: AdfsTrustedDevices  
 DS Mapper Usage: Disabled  
 Negotiate Client Certificate: Disabled**  
**  

### **Is CTL store name AdfsTrustedDevices?**

If the user has Azure AD Connect installed, use AAD Connect to update the SSL certificate bindings on all servers. If there is no AAD Connect server in the environment, use the following PowerShell cmdlet to regenerate the ADFS Certificate bindings on the AD FS server:-  
Set-AdfsSslCertificate -Thumbprint \<thumbprint\>  
  

### **Is CA issued certificate in ADFSTrustedDevices store?**

The AdfsTrustedDevices store should only contain the MS-Organization-Access certificate which is the self-signed cert used for issuing Workplace Join certificates, and the Proxy Trust certificates for each of the Web Application Proxy servers.  
Having a CA Issued certificate in a store where only Self-Signed certs would normally exist affects the CTL generated from this store and the CTL will then only contain the CA Issued certificate.  
  
Delete the non-self signed SSL Server Certificate from the AdfsTrustedDevices store  
  

### **Is there a time skew between AD FS and WAP servers?**

  
Ensure that there is no time skew between the AD FS and WAP Servers  
  

### **SSL Termination between AD FS and WAP?**

  
If SSL termination is happening on a network device between AD FS servers and WAP, then the communication between AD FS and WAP will break because the WAP and AD FS communication is based on client certificates.  
Disable SSL termination on the network device in between the AD FS and WAP servers  

### **Manually sync proxy trust certificates from config to ADFSTrustedDevices**

  
Use the script at the end of the section to manually sync the WAP certificates from AD FS configuration to ADFSTrustedDevices store. Execute the following.  
  

-----

### Proxy Trust Issue Detection and Fix Script

-----

  

    param
    ( 
     [switch]$syncproxytrustcerts
    )
    function checkhttpsyscertbindings()
    {
    Write-Host; Write-Host("1  Checking http.sys certificate bindings for potential issues")
    $httpsslcertoutput = netsh http show sslcert
    $adfsservicefqdn = (Get-AdfsProperties).HostName
    $i = 1
    $certbindingissuedetected = $false
    While($i -lt $httpsslcertoutput.count)
    {
     $ipport = $false
     $hostnameport = $false
     if ( ( $httpsslcertoutput[$i] -match "IP:port" ) ) { $ipport = $true }
     elseif ( ( $httpsslcertoutput[$i] -match "Hostname:port" ) ) { $hostnameport = $true }
     # Check for IP specific certificate bindings
     if ( ( $ipport -eq $true ) )
     {
     $httpsslcertoutput[$i]
     $ipbindingparsed = $httpsslcertoutput[$i].split(":")
     if ( ( $ipbindingparsed[2].trim() -ne "0.0.0.0" ) -and ( $ipbindingparsed[3].trim() -eq "443") )
     {
     $warning = "There is an IP specific binding on IP " + $ipbindingparsed[2].trim() + " which may conflict with the AD FS port 443 cert binding." | Write-Warning
     $certbindingissuedetected = $true
     }
     
     $i = $i + 14
     continue
     }
     # check that CTL Store is set for ADFS service binding
     elseif ( $hostnameport -eq $true ) 
     {
     $httpsslcertoutput[$i]
     $ipbindingparsed = $httpsslcertoutput[$i].split(":")
     If ( ( $ipbindingparsed[2].trim() -eq $adfsservicefqdn ) -and ( $ipbindingparsed[3].trim() -eq "443") -and ( $httpsslcertoutput[$i+10].split(":")[1].trim() -ne "AdfsTrustedDevices" ) )
     {
     Write-Warning "ADFS Service binding does not have CTL Store Name set to AdfsTrustedDevices"
     $certbindingissuedetected = $true
     }
     $i = $i + 14
     continue
     }
     $i++
    }
    If ( $certbindingissuedetected -eq $false ) { Write-Host "Check Passed: No certificate binding issues detected" }
    }
    function checkadfstrusteddevicesstore()
    {
    # check for CA issued (non-self signed) certs in the AdfsTrustedDevices cert store
    Write-Host; Write-Host "2  Checking AdfsTrustedDevices cert store for non-self signed certificates"
    $certlist = Get-Childitem cert:\LocalMachine\AdfsTrustedDevices -recurse | Where-Object {$_.Issuer -ne $_.Subject}
    If ( $certlist.count -gt 0 )
    {
     Write-Warning "The following non-self signed certificates are present in the AdfsTrustedDevices store and should be removed"
     $certlist | Format-List Subject
    }
    Else { Write-Host "Check Passed: No non-self signed certs present in AdfsTrustedDevices cert store" }
    }
    function checkproxytrustcerts
    {
     Param ([bool]$repair=$false)
     Write-Host; Write-Host("3  Checking AdfsTrustedDevices cert store is in sync with ADFS Proxy Trust config")
     $doc = new-object Xml
     $doc.Load("$env:windir\ADFS\Microsoft.IdentityServer.Servicehost.exe.config")
     $connString = $doc.configuration.'microsoft.identityServer.service'.policystore.connectionString
     $command = "Select ServiceSettingsData from [IdentityServerPolicy].[ServiceSettings]"
     $cli = new-object System.Data.SqlClient.SqlConnection
     $cli.ConnectionString = $connString
     $cmd = new-object System.Data.SqlClient.SqlCommand
     $cmd.CommandText = $command
     $cmd.Connection = $cli
     $cli.Open()
     $configString = $cmd.ExecuteScalar()
     $configXml = new-object XML
     $configXml.LoadXml($configString)
     $rawCerts = $configXml.ServiceSettingsData.SecurityTokenService.ProxyTrustConfiguration._subjectNameIndex.KeyValueOfstringArrayOfX509Certificate29zVOn6VQ.Value.X509Certificate2
     #$ctl = dir cert:\LocalMachine\ADFSTrustedDevices
     $store = new-object System.Security.Cryptography.X509Certificates.X509Store("ADFSTrustedDevices","LocalMachine")
     $store.open("MaxAllowed")
     $atLeastOneMismatch = $false
     $badCerts = @()
     foreach($rawCert in $rawCerts)
     {
     $rawCertBytes = [System.Convert]::FromBase64String($rawCert.RawData.'#text')
     $cert=New-Object System.Security.Cryptography.X509Certificates.X509Certificate2(,$rawCertBytes)
     $now = Get-Date
     if ( ($cert.NotBefore -lt $now) -and ($cert.NotAfter -gt $now))
     {
     $certThumbprint = $cert.Thumbprint
     $certSubject = $cert.Subject
     $ctlMatch = dir cert:\localmachine\ADFSTrustedDevices\$certThumbprint -ErrorAction SilentlyContinue
     if ($ctlMatch -eq $null)
     {
     $atLeastOneMismatch = $true
     Write-Warning "This cert is NOT in the CTL: $certThumbprint  $certSubject"
    
     if ($repair -eq $true)
     {
     write-Warning "Attempting to repair"
     $store.Add($cert)
     Write-Warning "Repair successful"
     }
     else
     {
     Write-Warning ("Please install KB.2964735 or re-run script with -syncproxytrustcerts switch to add missing Proxy Trust certs to AdfsTrustedDevices cert store")
     }
    
     }
     }
     }
     $store.Close()
    
     if ($atLeastOneMismatch -eq $false)
     {
     Write-Host("Check Passed: No mismatched certs found. CTL is in sync with DB content")
     }
    }
    checkhttpsyscertbindings
    checkadfstrusteddevicesstore
    checkproxytrustcerts($syncproxytrustcerts)
    Write-Host; Write-Host("All checks completed.")

-----
