---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Tools and Data Collection/AVD/Client Traces"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FTools%20and%20Data%20Collection%2FAVD%2FClient%20Traces"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AVD Client Traces Collection

## Web Client Trace

> Note: The following steps are for AVD Web Client https://client.wvd.microsoft.com/arm/webclient/, NOT IWP https://windows365.microsoft.com/

1. Login to web client
2. In top right corner click 3 dots -> About
3. Click Start Recording
4. Reproduce issue
5. In top right corner click 3 dots again -> About -> Stop Recording
6. Trace file will automatically download

## Windows Client Trace

> This is included also in MSRD-Collect

1. Close all instances of MSRDC.exe and MSRDCW.exe through task manager
2. Open explorer -> navigate to `C:\Users\%username%\AppData\Local\Temp\DiagOutputDir` and delete RdClientAutoTrace folder
3. Ask user to open WVD client and reproduce issue
4. ETL trace won't finish writing until WVD client is gracefully closed
   - Click X to close
   - Then right click on WVD icon in systray -> select disconnect all sessions
5. Go to:
   - `C:\Users\%username%\AppData\Local\Temp\DiagOutputDir`
   - (if you cannot find in this path, check `%localappdata%\Temp\2\DiagOutputDir\RdClientAutoTrace`)
   - ETL trace will be in RdClientAutoTrace folder

## Mac OS Client Trace

1. Open Help -> Troubleshooting -> Logging
2. Choose required Core and UI log level and choose a folder location for output

## iOS Client Trace

1. Open Setting -> Troubleshooting
2. Similar with MacOS client, choose required Core and UI log level and choose a folder location for output
