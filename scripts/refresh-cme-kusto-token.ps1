$env:AZURE_CONFIG_DIR = "C:\Users\fangkun\.azure-profiles\cme-fangkun"
$logFile = "$env:TEMP\cme-kusto-token-refresh.log"

try {
    $result = az account get-access-token --resource https://kusto.kusto.chinacloudapi.cn --query "expiresOn" -o tsv 2>&1
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    if ($LASTEXITCODE -eq 0) {
        Add-Content -Path $logFile -Value "$ts OK expires=$result" -Encoding utf8
    } else {
        Add-Content -Path $logFile -Value "$ts FAILED: $result" -Encoding utf8
    }
} catch {
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $logFile -Value "$ts ERROR: $_" -Encoding utf8
}
