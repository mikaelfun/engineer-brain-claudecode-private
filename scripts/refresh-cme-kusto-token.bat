@echo off
REM Refresh CME Kusto token silently (runs every 20 hours via Task Scheduler)
set AZURE_CONFIG_DIR=C:\Users\fangkun\.azure-profiles\cme-fangkun
az account get-access-token --resource https://kusto.kusto.chinacloudapi.cn --query "expiresOn" -o tsv > "%TEMP%\cme-kusto-token-refresh.log" 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo %date% %time% FAILED >> "%TEMP%\cme-kusto-token-refresh.log"
) else (
    echo %date% %time% OK >> "%TEMP%\cme-kusto-token-refresh.log"
)
