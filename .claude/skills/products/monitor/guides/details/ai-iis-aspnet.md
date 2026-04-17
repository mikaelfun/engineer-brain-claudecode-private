# Monitor Application Insights IIS/ASP.NET 监控 - Comprehensive Troubleshooting Guide

**Entries**: 14 | **Drafts fused**: 6 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-install-iis-web-server-role.md, ado-wiki-b-locate-validate-ai-ikey-aspnet-classic-sdk.md, ado-wiki-c-AMA Windows- HT- Validate IIS Log Files Locally.md, ado-wiki-d-add-dummy-websites-iis.md, ado-wiki-e-deploy-dotnet-core-web-app-to-iis.md, ado-wiki-e-deploy-dotnet-framework-web-app-to-iis.md
**Generated**: 2026-04-07

---

## Quick Troubleshooting Path

### Step 1: HTTP 500 errors on Windows App Services - need to determine if application or IIS infrastructure caused the error for Application Insights investigation

**Solution**: Query AntaresWebWorkerFREBLogs filtering StatusCode==500 and inspect Details field for which module triggered MODULE_SET_RESPONSE_STATUS_ERROR. If ManagedPipelineHandler set the status → app caused it (AI should have captured it). If AspNetCoreModuleV2 or other IIS module → infrastructure issue (...

`[Source: ADO Wiki, Score: 8.5]`

### Step 2: FREB (Failed Request Event Buffering) logs are truncated — XML output file is incomplete due to large file size

**Solution**: Create applicationHost.xdt file at d:\home\site\applicationHost.xdt with XDT transform to increase traceFailedRequestsLogging settings: set maxLogFileSizeKB to 4096/8000/16000 and maxLogFiles to 100 (default is 50). Restart the app after applying. Verify transform took effect at D:\local\Config\a...

`[Source: ADO Wiki, Score: 8.5]`

### Step 3: FREB (Failed Request Event Buffering) logs are truncated; incomplete request trace data on App Service

**Solution**: Create applicationHost.xdt in d:\home\site\ with: maxLogFileSizeKB='4096' (or 8000/16000), maxLogFiles='100'. Content: <traceFailedRequestsLogging enabled='true' customActionsEnabled='true' directory='D:\home\LogFiles' maxLogFileSizeKB='4096' maxLogFiles='100' />. Restart app after changes. Verif...

`[Source: ADO Wiki, Score: 8.5]`

### Step 4: FREB (Failed Request Event Buffering) logs are truncated - XML output file is incomplete due to large file size

**Solution**: Create applicationHost.xdt file at d:\home\site\applicationHost.xdt with XDT transform to increase traceFailedRequestsLogging settings: set maxLogFileSizeKB to 4096/8000/16000 and maxLogFiles to 100 (default is 50). Restart the app after applying. Verify transform took effect at D:\local\Config\a...

`[Source: ADO Wiki, Score: 8.5]`

### Step 5: FREB (Failed Request Event Buffering) logs are truncated on App Service

**Solution**: Create applicationHost.xdt in d:\home\site\ with maxLogFileSizeKB=4096+ and maxLogFiles=100. Restart app. Verify at D:\local\Config\applicationhost.config.

`[Source: ADO Wiki, Score: 8.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | HTTP 500 errors on Windows App Services - need to determine if application or... | An IIS native module (e.g., AspNetCoreModuleV2) returned the 500 status befor... | Query AntaresWebWorkerFREBLogs filtering StatusCode==500 and inspect Details ... | 8.5 | ADO Wiki |
| 2 | FREB (Failed Request Event Buffering) logs are truncated — XML output file is... | Default maxLogFileSizeKB for FREB logs is too small, causing truncation when ... | Create applicationHost.xdt file at d:\home\site\applicationHost.xdt with XDT ... | 8.5 | ADO Wiki |
| 3 | FREB (Failed Request Event Buffering) logs are truncated; incomplete request ... | Default FREB log file size and maxLogFiles (50) are too small for complex req... | Create applicationHost.xdt in d:\home\site\ with: maxLogFileSizeKB='4096' (or... | 8.5 | ADO Wiki |
| 4 | FREB (Failed Request Event Buffering) logs are truncated - XML output file is... | Default maxLogFileSizeKB for FREB logs is too small, causing truncation when ... | Create applicationHost.xdt file at d:\home\site\applicationHost.xdt with XDT ... | 8.5 | ADO Wiki |
| 5 | FREB (Failed Request Event Buffering) logs are truncated on App Service | Default FREB log file size and maxLogFiles (50) too small. When maxLogFiles r... | Create applicationHost.xdt in d:\home\site\ with maxLogFileSizeKB=4096+ and m... | 8.5 | ADO Wiki |
| 6 | FREB logs truncated on App Service | Default maxLogFiles=50 and file size too small. Half deleted when limit reached. | applicationHost.xdt in d:\home\site\ with maxLogFileSizeKB=4096+ and maxLogFi... | 8.5 | ADO Wiki |
| 7 | Get-ApplicationInsightsMonitoringStatus cmdlet throws error "GetOutOfProcInfo... | Two possible causes: (1) FTP site configured in IIS causes the cmdlet to fail... | For FTP site: remove the FTP site from IIS before running the cmdlet, or swap... | 8.5 | ADO Wiki |
| 8 | Application Insights Agent (Status Monitor v2) fails to instrument applicatio... | The Application Insights Agent does not support IIS nested application config... | Restructure IIS sites to avoid nested application layout. Each monitored appl... | 8.5 | ADO Wiki |
| 9 | Application Insights Agent fails or conflicts when IIS Shared Configuration i... | The AI Agent modifies applicationHost.config during enablement, which conflic... | Disable IIS Shared Configuration before enabling the AI Agent, or follow the ... | 8.5 | ADO Wiki |
| 10 | Application Insights Agent on IIS fails or behaves unexpectedly during instal... | IIS shared configuration is enabled, which conflicts with the Application Ins... | Disable IIS shared configuration before installing the AI Agent, or apply the... | 8.5 | ADO Wiki |
| 11 | No telemetry data appears in Application Insights after successfully installi... | Common causes: 1) Conflicting Application Insights SDK binaries already prese... | 1) Check for conflicting SDK binaries in app bin folder; 2) Test connectivity... | 8.5 | ADO Wiki |
| 12 | Application Insights VM extension shows unhealthy/failed status but applicati... | Extension ProvisioningState only reflects whether IIS Redfield module was con... | 1) Extension Succeeded = IIS Redfield configured, check VmExtensionHandler lo... | 8.5 | ADO Wiki |
| 13 | Application Insights VM extension shows unhealthy or failed status in Azure P... | An extension is not an agent. The extension is the delivery/installation mech... | Verify actual monitoring functionality independently: check Application Insig... | 8.5 | ADO Wiki |
| 14 | Customer claims Application Insights is logging incorrect or unexpected HTTP ... | Application Insights reflects the actual HTTP status code returned by the App... | 1) Query AntaresIISLogFrontEndTable to confirm the requests and their status ... | 6.5 | ADO Wiki |
