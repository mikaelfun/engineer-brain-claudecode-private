---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Infrastructure/Networking/ALDO Networking and Platform Readiness (Testing purpose - under development)/Manual Validation Steps Testing purpose - under development"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FReadiness%2FInfrastructure%2FNetworking%2FALDO%20Networking%20and%20Platform%20Readiness%20%28Testing%20purpose%20-%20under%20development%29%2FManual%20Validation%20Steps%20Testing%20purpose%20-%20under%20development"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Manual Validation Steps

Standalone PowerShell snippets for each check performed by `HciDisconnectedOpsValidation.ps1`.
Run each snippet **on every node** individually, then compare the output across nodes.
Each snippet is fully self-contained  no dependencies between snippets.

> **Tip**: For consistency checks (NIC names, drivers, VLAN, VM switches, isolation), run the collection snippet on each node, save the output, and compare side-by-side. Differences indicate configuration drift that must be resolved before deployment.

---

## Platform Checks

### PLATFORM_PUBLIC_REACHABILITY  Public Endpoint Connectivity

Tests whether Azure public endpoints are reachable from this node.
Used to infer whether the environment is connected or air-gapped.

```powershell
$targets = @(
    @{ Host = 'management.azure.com'; Port = 443 },
    @{ Host = 'login.microsoftonline.com'; Port = 443 }
)
foreach ($t in $targets) {
    try {
        $c = New-Object System.Net.Sockets.TcpClient
        $ar = $c.BeginConnect($t.Host, $t.Port, $null, $null)
        if ($ar.AsyncWaitHandle.WaitOne(1500, $false)) {
            $c.EndConnect($ar)
            Write-Host "REACHABLE: $($t.Host):$($t.Port)" -ForegroundColor Green
        } else {
            Write-Host "UNREACHABLE: $($t.Host):$($t.Port) (timeout)" -ForegroundColor Yellow
        }
        $c.Close()
    } catch {
        Write-Host "UNREACHABLE: $($t.Host):$($t.Port)  $($_.Exception.InnerException.Message)" -ForegroundColor Yellow
    }
}
```

### ENVIRONMENT_MODE  Connected vs Air-Gapped Inference

```powershell
# Based on the result of PLATFORM_PUBLIC_REACHABILITY above:
# - Both reachable  Connected (public cloud access available)
# - Neither reachable  AirGapped (disconnected operations mode expected)
# - Mixed  Partial connectivity; investigate firewall rules
#
# If you declared AirGapped but endpoints are reachable, verify isolation.
# If you declared Connected but endpoints are unreachable, check network path.
```

### PLATFORM_ENV  Disconnected Ops Environment Variable

```powershell
# Expect: True for air-gapped deployments
$val = [Environment]::GetEnvironmentVariable('DISCONNECTED_OPS_SUPPORT', 'Machine')
if ($val -eq 'True') {
    Write-Host "PASS: DISCONNECTED_OPS_SUPPORT = True" -ForegroundColor Green
} else {
    Write-Host "WARN: DISCONNECTED_OPS_SUPPORT = '$val' (expected 'True' for air-gapped)" -ForegroundColor Yellow
    Write-Host "  Fix: [Environment]::SetEnvironmentVariable('DISCONNECTED_OPS_SUPPORT', `$true, [System.EnvironmentVariableTarget]::Machine)"
}
```

### PLATFORM_AZCLI  Azure CLI Installation

```powershell
$azCmd = Get-Command az -ErrorAction SilentlyContinue
if ($azCmd) {
    Write-Host "PASS: Azure CLI found at $($azCmd.Source)" -ForegroundColor Green
    & az --version 2>&1 | Select-Object -First 1
} else {
    Write-Host "FAIL: Azure CLI not found in PATH" -ForegroundColor Red
    Write-Host "  Fix: Install Azure CLI per disconnected-operations-cli docs"
}
```

### PLATFORM_HIMDS  HIMDS Service (Arc Connected Machine Agent)

The script only checks HIMDS when the Appliance component is Real.
Arc agent presence and cluster state affect the severity.

```powershell
$arcAgentPath = "$env:ProgramFiles\AzureConnectedMachineAgent\azcmagent.exe"
$arcInstalled = Test-Path $arcAgentPath
$svc = Get-Service -Name 'HIMDS' -ErrorAction SilentlyContinue

if ($svc) {
    if ($svc.Status -eq 'Running') {
        Write-Host "PASS: HIMDS is Running" -ForegroundColor Green
    } else {
        Write-Host "FAIL: HIMDS status = $($svc.Status)  service exists but is not running" -ForegroundColor Red
        Write-Host "  Fix: Start-Service HIMDS"
    }
} elseif ($arcInstalled) {
    Write-Host "FAIL: Arc agent (azcmagent.exe) is present but HIMDS service is missing. Installation may be corrupt." -ForegroundColor Red
    Write-Host "  Fix: Reinstall the Arc agent"
} else {
    Write-Host "INFO: HIMDS not installed (expected before Arc bootstrap)" -ForegroundColor Cyan
}
```

### PLATFORM_LCM  LCMController Service

LCMController is created during Azure Local cloud deployment.
The script only checks it when Appliance is Real. Cluster existence affects severity.

```powershell
$clusterExists = $false
try { $clusterExists = [bool](Get-Cluster -ErrorAction Stop) } catch {}
$svc = Get-Service -Name 'LCMController' -ErrorAction SilentlyContinue

if ($svc) {
    if ($svc.Status -eq 'Running') {
        Write-Host "PASS: LCMController is Running" -ForegroundColor Green
    } else {
        Write-Host "WARN: LCMController status = $($svc.Status)  not running" -ForegroundColor Yellow
        Write-Host "  Fix: Restart-Service LCMController"
    }
} elseif ($clusterExists) {
    Write-Host "WARN: Cluster exists but LCMController is missing. Deployment may not have completed." -ForegroundColor Yellow
} else {
    Write-Host "INFO: LCMController not installed (expected  created after Azure Local deployment; cluster does not exist yet)" -ForegroundColor Cyan
}
```

### PLATFORM_OS  OS Build and Composed Build Info

```powershell
$nt = Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion'
$build = "$($nt.CurrentBuildNumber).$($nt.UBR)"
Write-Host "OS: $($nt.ProductName) $($nt.DisplayVersion) Build $build"

$cbPath = 'HKLM:\SYSTEM\CurrentControlSet\Services\ComposedBuildInfo\Parameters'
if (Test-Path $cbPath) {
    $cb = Get-ItemProperty $cbPath
    Write-Host "ComposedBuildId:   $($cb.COMPOSED_BUILD_ID)"
    Write-Host "ComposedBuildType: $($cb.COMPOSED_BUILD_TYPE)"
    Write-Host "ComposedBuildName: $($cb.COMPOSED_BUILD_NAME)"
} else {
    Write-Host "WARN: ComposedBuildInfo not found in registry" -ForegroundColor Yellow
}
```

### PLATFORM_ALDO_VERSION  ALDO Version Compatibility

Validates the OS image (ComposedBuildName) matches the expected ALDO release.

```powershell
# Set your expected ALDO version
$aldoVersion = '2602'

# Known version map (add new versions as released)
$versionMap = @{
    '2602' = 'AzureLocal24H2.26100.1742.LCM.12.2602.0.3018'
    '2504' = 'AzureLocal24H2.26100.1742.LCM.12.2504.0.3018'
    '2411' = 'AzureLocal24H2.26100.1742.LCM.12.2411.0.3018'
    '2408' = 'AzureLocal24H2.26100.1742.LCM.12.2408.0.3018'
}

$expectedPrefix = $versionMap[$aldoVersion]
$cbPath = 'HKLM:\SYSTEM\CurrentControlSet\Services\ComposedBuildInfo\Parameters'
if (Test-Path $cbPath) {
    $cb = Get-ItemProperty $cbPath
    $actual = $cb.COMPOSED_BUILD_NAME
    if ($actual -and ($actual -eq $expectedPrefix -or $actual.StartsWith("$expectedPrefix."))) {
        Write-Host "PASS: ALDO $aldoVersion  ComposedBuildName=$actual" -ForegroundColor Green
    } else {
        Write-Host "FAIL: ALDO $aldoVersion expected prefix '$expectedPrefix' but got '$actual'" -ForegroundColor Red
    }
} else {
    Write-Host "WARN: ComposedBuildInfo not found in registry" -ForegroundColor Yellow
}
```

### PLATFORM_MEMORY  Physical Memory

```powershell
$memGB = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 1)
if ($memGB -ge 128) {
    Write-Host "PASS: Memory = $memGB GB" -ForegroundColor Green
} else {
    Write-Host "WARN: Memory = $memGB GB (128 GB+ recommended; appliance uses ~78 GB)" -ForegroundColor Yellow
}
```

### PLATFORM_DISK  System Drive Free Space

```powershell
$sysDrive = $env:SystemDrive
if (-not $sysDrive) { $sysDrive = 'C:' }
$vol = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='$sysDrive'"
$freeGB = [math]::Round($vol.FreeSpace / 1GB, 1)
if ($freeGB -ge 600) {
    Write-Host "PASS: $sysDrive free space = $freeGB GB" -ForegroundColor Green
} else {
    Write-Host "WARN: $sysDrive free space = $freeGB GB (600 GB+ required for management cluster)" -ForegroundColor Yellow
    Write-Host "  Fix: Consider adding a data disk. See disconnected-operations-prepare docs step 7."
}
```

### PLATFORM_CERTPATH  Enterprise CA Root Certificate

Validates the cert file in AppData and its import into LocalMachine\Root (docs steps 910).
After domain-join the file may be under a different user profile, so all profiles are searched.
After Azure Local deployment, the cert file may have been consumed  if the cluster exists, the check is skipped.

```powershell
# Check current user profile first
$certFile = Join-Path $env:APPDATA 'AzureLocal\AzureLocalRootCert.cer'
$found = Test-Path $certFile

# Fallback: search all user profiles (handles domain-join profile mismatch)
if (-not $found) {
    $fallback = Get-ChildItem 'C:\Users\*\AppData\Roaming\AzureLocal\AzureLocalRootCert.cer' -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($fallback) { $certFile = $fallback.FullName; $found = $true }
}

Write-Host "Resolved path: $certFile"

if ($found) {
    $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($certFile)
    $tp = $cert.Thumbprint
    Write-Host "File:       FOUND at $certFile"
    Write-Host "Subject:    $($cert.Subject)"
    Write-Host "Thumbprint: $tp"
    Write-Host "NotAfter:   $($cert.NotAfter)"

    $imported = Get-ChildItem Cert:\LocalMachine\Root | Where-Object { $_.Thumbprint -eq $tp }
    if ($imported) {
        Write-Host "PASS: Certificate imported into LocalMachine\Root" -ForegroundColor Green
    } else {
        Write-Host "WARN: Certificate file exists but NOT imported into LocalMachine\Root" -ForegroundColor Yellow
        Write-Host "  Fix: Import-Certificate -FilePath '$certFile' -CertStoreLocation Cert:\LocalMachine\Root -Confirm:`$false"
    }
} else {
    # Check if cluster is deployed  cert was consumed during deployment
    $clusterExists = $false
    try { $clusterExists = [bool](Get-Cluster -ErrorAction Stop) } catch {}
    if ($clusterExists) {
        Write-Host "INFO: Cert file not found but cluster is deployed; cert was consumed during deployment. Check skipped." -ForegroundColor Cyan
    } else {
        Write-Host "WARN: AzureLocalRootCert.cer not found in any user profile under AppData\AzureLocal" -ForegroundColor Yellow
        Write-Host "  Fix: Copy the enterprise CA root certificate to %APPDATA%\AzureLocal\ and import into Cert:\LocalMachine\Root."
    }
}
```

### PLATFORM_CRL  Bootstrap CRL Configuration

```powershell
$contentDirs = @(Get-ChildItem -Path 'C:\Windows\System32\Bootstrap' -Filter 'content_*' -Directory -ErrorAction SilentlyContinue | Sort-Object Name -Descending)
if ($contentDirs.Count -eq 0) {
    Write-Host "INFO: No bootstrap content staged yet" -ForegroundColor Cyan
} else {
    $maeConfig = Join-Path $contentDirs[0].FullName 'Microsoft.Azure.Edge.Bootstrap.ManagementService\windows.mae.config.json'
    if (Test-Path $maeConfig) {
        $cfg = Get-Content $maeConfig -Raw | ConvertFrom-Json
        $crlEnabled = $cfg.ManagementSettings.CheckCertificateRevocationList
        if ($crlEnabled -eq $false) {
            Write-Host "PASS: CRL checking is disabled (correct for air-gapped)" -ForegroundColor Green
        } else {
            Write-Host "INFO: CRL checking is enabled ($crlEnabled)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "INFO: MAE config not found at expected path" -ForegroundColor Cyan
    }
}
```

### PLATFORM_CRL_URLS  CRL Distribution Point Reachability

Tests reachability of CRL endpoints found in LocalMachine\My certificates.
Relevant for connected environments where CRL checking is enabled.

```powershell
$certs = Get-ChildItem Cert:\LocalMachine\My -ErrorAction SilentlyContinue |
    Where-Object { $_.NotAfter -gt (Get-Date) }
$urlsTested = 0
foreach ($cert in $certs) {
    $crlExt = $cert.Extensions | Where-Object { $_.Oid.Value -eq '2.5.29.31' }
    if (-not $crlExt) { continue }
    $crlText = $crlExt.Format($false)
    $urls = @([regex]::Matches($crlText, 'https?://[^\s\]"]+') | ForEach-Object { $_.Value })
    foreach ($url in $urls) {
        $urlsTested++
        $reachable = $false
        # Try HEAD first, then GET as fallback
        foreach ($method in @('HEAD','GET')) {
            try {
                $req = [System.Net.HttpWebRequest]::Create($url)
                $req.Timeout = 5000; $req.Method = $method
                $resp = $req.GetResponse(); $resp.Close()
                $reachable = $true; break
            } catch {}
        }
        if ($reachable) {
            Write-Host "PASS: $url" -ForegroundColor Green
        } else {
            Write-Host "WARN: $url  unreachable" -ForegroundColor Yellow
        }
    }
}
if ($urlsTested -eq 0) { Write-Host "INFO: No CRL distribution point URLs found in LocalMachine\My certificates" -ForegroundColor Cyan }
```

### PLATFORM_HGS  Host Guardian Certificates

Uses the same resolved directory as PLATFORM_CERTPATH (profile fallback).

```powershell
# Resolve the AzureLocal directory (same fallback logic as CERTPATH)
$azLocalDir = Join-Path $env:APPDATA 'AzureLocal'
if (-not (Test-Path (Join-Path $azLocalDir 'AzureLocalRootCert.cer'))) {
    $fallback = Get-ChildItem 'C:\Users\*\AppData\Roaming\AzureLocal\AzureLocalRootCert.cer' -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($fallback) { $azLocalDir = Split-Path $fallback.FullName }
}

$encPath  = Join-Path $azLocalDir 'AzsVmHostGuardian-IRVM01-encryption.pfx'
$signPath = Join-Path $azLocalDir 'AzsVmHostGuardian-IRVM01-signing.pfx'
$encExists  = Test-Path $encPath
$signExists = Test-Path $signPath

Write-Host "Resolved directory: $azLocalDir"

if ($encExists -and $signExists) {
    Write-Host "PASS: Both HGS encryption and signing certificates found" -ForegroundColor Green
} elseif (-not $encExists -and -not $signExists) {
    Write-Host "INFO: No HGS certificates (only needed for additional workload cluster deployments)" -ForegroundColor Cyan
} else {
    Write-Host "WARN: Partial HGS certs  Encryption=$encExists Signing=$signExists (both required)" -ForegroundColor Yellow
}
```

### PLATFORM_TIME  Time Synchronization Source

```powershell
try {
    $src = (& w32tm /query /source 2>&1)
    if ($LASTEXITCODE -eq 0 -and $src) {
        $src = ([string]$src).Trim()
        $bad = @('NotConfigured','Free-running System Clock','Local CMOS Clock','Error')
        if ($src -notin $bad) {
            Write-Host "PASS: Time source = $src" -ForegroundColor Green
        } else {
            Write-Host "WARN: Time source = $src (air-gapped environments need an external NTP server)" -ForegroundColor Yellow
            Write-Host "  Fix: w32tm /config /manualpeerlist:`"dc.contoso.com`" /syncfromflags:manual /reliable:yes /update"
        }
    } else {
        Write-Host "WARN: w32tm /query /source returned error" -ForegroundColor Yellow
    }
} catch {
    Write-Host "WARN: w32tm query failed  $($_.Exception.Message)" -ForegroundColor Yellow
}
```

### PLATFORM_NAMING  Node Naming Consistency

> Run on any node that can reach the others. Supply your node IPs.

```powershell
$nodeIPs = @('172.16.0.81', '172.16.0.82', '172.16.0.83')  # Replace with your node IPs
$names = foreach ($ip in $nodeIPs) {
    Invoke-Command -ComputerName $ip -ScriptBlock { $env:COMPUTERNAME }
}
Write-Host "Node names: $($names -join ', ')"
$prefixes = $names | ForEach-Object { $_ -replace '\d+$', '' }
$unique = @($prefixes | Select-Object -Unique)
if ($unique.Count -eq 1) {
    Write-Host "PASS: Consistent naming prefix '$($unique[0])'" -ForegroundColor Green
} else {
    Write-Host "WARN: Inconsistent naming prefixes: $($unique -join ', ')" -ForegroundColor Yellow
}
```

---

## Shared Checks

### DRIVER_HEALTH  NIC Driver Validation

On virtual environments driver issues are informational only (INFO).
On physical hardware driver issues are FAIL  OEM drivers are required.

```powershell
$sys = Get-CimInstance Win32_ComputerSystem
$isVirtual = $sys.Manufacturer -match 'Microsoft|VMware|QEMU|Xen|innotek|Virtual' -or $sys.Model -match 'Virtual'
Write-Host "Environment: $(if ($isVirtual) { 'Virtual' } else { 'Physical' })  Manufacturer=$($sys.Manufacturer) Model=$($sys.Model)"

$nics = Get-NetAdapter -Physical -ErrorAction SilentlyContinue
foreach ($nic in $nics) {
    $name = $nic.Name
    $prov = $nic.DriverProvider
    $desc = $nic.DriverDescription
    $info = $nic.DriverInformation
    $issues = @()

    if (-not $prov) { $issues += 'Missing DriverProvider' }
    elseif ($prov -eq 'Microsoft') { $issues += "Generic inbox driver (Provider=Microsoft)" }
    if (-not $desc) { $issues += 'Missing DriverDescription' }
    if (-not $info) { $issues += 'Missing DriverInformation' }

    if ($issues.Count -eq 0) {
        Write-Host "PASS: $name  Provider=$prov Version=$($nic.DriverVersion)" -ForegroundColor Green
    } elseif ($isVirtual) {
        Write-Host "INFO: $name  Virtual environment detected; driver check is informational only. $($issues -join '; ')" -ForegroundColor Cyan
    } else {
        Write-Host "FAIL: $name  $($issues -join '; ')" -ForegroundColor Red
    }
}
```

### ADAPTER_NAMES  Physical NIC Name Verification

> Compare output across all nodes  names must match.

```powershell
$names = (Get-NetAdapter -Physical -ErrorAction SilentlyContinue).Name | Sort-Object
Write-Host "Physical NIC names on $($env:COMPUTERNAME):"
$names | ForEach-Object { Write-Host "  $_" }
```

---

## Consistency Checks (Network Scope)

> Run each snippet on **every node**, save the output, and compare across nodes.
> Any differences indicate configuration drift that must be resolved before deployment.

### NIC_NAMES  Physical NIC Name Consistency

```powershell
Write-Host "=== NIC_NAMES on $($env:COMPUTERNAME) ==="
Get-NetAdapter -Physical -ErrorAction SilentlyContinue |
    Sort-Object Name |
    Select-Object Name |
    ConvertTo-Json -Compress
```

### NIC_DETAILS  Driver Version, Date, Provider, Firmware

```powershell
Write-Host "=== NIC_DETAILS on $($env:COMPUTERNAME) ==="
Get-NetAdapter -Physical -ErrorAction SilentlyContinue |
    Sort-Object Name |
    ForEach-Object {
        $fw = ''
        try { $fw = (Get-NetAdapterHardwareInfo -Name $_.Name -ErrorAction SilentlyContinue).FirmwareVersion } catch {}
        [pscustomobject]@{
            Name              = $_.Name
            DriverVersion     = $_.DriverVersion
            DriverDate        = $_.DriverDate
            DriverProvider    = $_.DriverProvider
            DriverDescription = $_.DriverDescription
            DriverInformation = $_.DriverInformation
            FirmwareVersion   = $fw
            LinkSpeed         = $_.LinkSpeed
        }
    } | Format-Table -AutoSize
```

### NIC_VLAN  Physical NIC VLAN Evidence

```powershell
Write-Host "=== NIC_VLAN on $($env:COMPUTERNAME) ==="
Get-NetAdapter -Physical -ErrorAction SilentlyContinue | ForEach-Object {
    $adv = Get-NetAdapterAdvancedProperty -Name $_.Name -ErrorAction SilentlyContinue |
        Where-Object {
            $_.DisplayName -match 'VLAN|802\.1Q|Port VLAN|VLAN ID|QTag|Priority' -or
            $_.RegistryKeyword -match 'VLAN|8021Q|VlanID|VlanId|QTag|Priority'
        }
    [pscustomobject]@{
        NicName      = $_.Name
        VlanEvidence = ($adv | ForEach-Object {
            [pscustomobject]@{ DisplayName = $_.DisplayName; DisplayValue = $_.DisplayValue; RegistryKeyword = $_.RegistryKeyword }
        } | ConvertTo-Json -Compress)
    }
} | Format-Table -AutoSize -Wrap
```

### VMSWITCH  VM Switch Adapter Configuration

```powershell
Write-Host "=== VMSWITCH on $($env:COMPUTERNAME) ==="
Get-VMNetworkAdapter -ManagementOS -ErrorAction SilentlyContinue |
    Sort-Object Name |
    Select-Object Name, SwitchName |
    Format-Table -AutoSize
```

### ISOLATION  VM Network Adapter Isolation Settings

```powershell
Write-Host "=== ISOLATION on $($env:COMPUTERNAME) ==="
Get-VMNetworkAdapterIsolation -ManagementOS -ErrorAction SilentlyContinue |
    Sort-Object VMNetworkAdapterName |
    Select-Object @{N='AdapterName';E={$_.VMNetworkAdapterName}}, IsolationMode, DefaultIsolationID, AllowUntaggedTraffic |
    Format-Table -AutoSize
```

### OS_BUILD & COMPOSED_BUILD  OS and Solution Version

```powershell
Write-Host "=== OS_BUILD on $($env:COMPUTERNAME) ==="
$nt = Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion'
Write-Host "Build: $($nt.CurrentBuildNumber).$($nt.UBR)"

$cbPath = 'HKLM:\SYSTEM\CurrentControlSet\Services\ComposedBuildInfo\Parameters'
if (Test-Path $cbPath) {
    $cb = Get-ItemProperty $cbPath
    Write-Host "ComposedBuildId:   $($cb.COMPOSED_BUILD_ID)"
    Write-Host "ComposedBuildName: $($cb.COMPOSED_BUILD_NAME)"
} else {
    Write-Host "ComposedBuildInfo: Not found"
}
```

### MEMORY  Physical Memory

```powershell
Write-Host "=== MEMORY on $($env:COMPUTERNAME) ==="
$memGB = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 1)
Write-Host "Memory: $memGB GB"
```

---

## Network Checks

### ARB Auto-Discovery  Get-ArcHciConfig

When ARB is deployed (Real mode), the script discovers the actual control plane IP via `Get-ArcHciConfig`
instead of scanning the entire pool range. Run this on Node01 to see the actual ARB endpoints.

```powershell
# Run on Node01 (or Invoke-Command to Node01)
if (Get-Command Get-ArcHciConfig -ErrorAction SilentlyContinue) {
    $cfg = Get-ArcHciConfig 2>$null
    if ($cfg) {
        Write-Host "ARB Control Plane IP:  $($cfg.controlPlaneIP)"
        Write-Host "K8s Node Pool Start:   $($cfg.k8snodeippoolstart)"
        Write-Host "K8s Node Pool End:     $($cfg.k8snodeippoolend)"
    } else {
        Write-Host "INFO: Get-ArcHciConfig returned no data" -ForegroundColor Cyan
    }
} else {
    Write-Host "INFO: Get-ArcHciConfig not available (ArcHci module not imported)" -ForegroundColor Cyan
}
```

### Connectivity  TCP Port Test

> Replace IPs, port, and source binding as needed for each scenario.

```powershell
$targetIp = '172.16.0.11'   # e.g., Appliance Ingress
$port = 443
$sourceIp = '172.16.0.81'   # e.g., Node01 management IP
$timeoutMs = 3000

try {
    $c = New-Object System.Net.Sockets.TcpClient
    $src = [System.Net.IPAddress]::Parse($sourceIp)
    $c.Client.Bind((New-Object System.Net.IPEndPoint($src, 0)))
    $ar = $c.BeginConnect($targetIp, $port, $null, $null)
    if (-not $ar.AsyncWaitHandle.WaitOne($timeoutMs, $false)) { throw 'Timeout' }
    $c.EndConnect($ar)
    Write-Host "PASS: $sourceIp -> ${targetIp}:${port} TCP connected" -ForegroundColor Green
    $c.Close()
} catch {
    Write-Host "FAIL: $sourceIp -> ${targetIp}:${port} TCP  $($_.Exception.Message)" -ForegroundColor Red
}
```

### Connectivity  ICMP Ping Test

```powershell
$targetIp = '172.16.0.11'   # Replace with target
if (Test-Connection -ComputerName $targetIp -Count 1 -Quiet -ErrorAction SilentlyContinue) {
    Write-Host "PASS: ICMP to $targetIp succeeded" -ForegroundColor Green
} else {
    Write-Host "FAIL: ICMP to $targetIp failed" -ForegroundColor Red
}
```

### VLAN Validation  Physical NIC VLAN ID

```powershell
$expectedVlanId = 10  # Replace with your expected VLAN ID

Get-NetAdapter -Physical -ErrorAction SilentlyContinue | ForEach-Object {
    $adv = Get-NetAdapterAdvancedProperty -Name $_.Name -ErrorAction SilentlyContinue |
        Where-Object { $_.RegistryKeyword -match 'VLAN|VlanID' }
    $parsed = $null
    $candidate = $adv | Where-Object { $_.DisplayValue -match '^\d+$' } | Select-Object -First 1
    if ($candidate) { $parsed = [int]$candidate.DisplayValue }

    if ($null -ne $parsed -and $parsed -eq $expectedVlanId) {
        Write-Host "PASS: $($_.Name) VLAN=$parsed (expected $expectedVlanId)" -ForegroundColor Green
    } elseif ($null -ne $parsed) {
        Write-Host "FAIL: $($_.Name) VLAN=$parsed (expected $expectedVlanId)" -ForegroundColor Red
    } else {
        Write-Host "INFO: $($_.Name)  no VLAN ID parsed from advanced properties" -ForegroundColor Cyan
    }
}
```

### ISOLATION Validation  VM Adapter Isolation Settings

```powershell
$expectedMode = 'Vlan'          # Replace: None, NativeVirtualSubnet, ExternalVirtualSubnet, Vlan
$expectedDefaultId = 0          # Replace with your default isolation ID
$expectedAllowUntagged = $true  # Replace as needed

Get-VMNetworkAdapterIsolation -ManagementOS -ErrorAction SilentlyContinue | ForEach-Object {
    $name = $_.VMNetworkAdapterName
    $issues = @()
    if ([string]$_.IsolationMode -ne $expectedMode) { $issues += "Mode=$($_.IsolationMode) expected=$expectedMode" }
    if ([int]$_.DefaultIsolationID -ne $expectedDefaultId) { $issues += "DefaultID=$($_.DefaultIsolationID) expected=$expectedDefaultId" }
    if ([bool]$_.AllowUntaggedTraffic -ne $expectedAllowUntagged) { $issues += "AllowUntagged=$($_.AllowUntaggedTraffic) expected=$expectedAllowUntagged" }

    if ($issues.Count -eq 0) {
        Write-Host "PASS: $name  Mode=$expectedMode DefaultID=$expectedDefaultId AllowUntagged=$expectedAllowUntagged" -ForegroundColor Green
    } else {
        Write-Host "FAIL: $name  $($issues -join '; ')" -ForegroundColor Red
    }
}
```

---

## Quick Reference  Common Ports

| Scenario | Typical Ports |
|----------|---------------|
| Appliance Ingress | 443 |
| Appliance Management | 9443 |
| Domain Controller | 53, 88, 389, 445 |
| ARB | 22, 6443 |
| K8s Logical/ControlPlane | 22 |
| Node WinRM | 5985 |
