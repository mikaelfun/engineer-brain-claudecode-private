# How to Confirm Intune Policy Applied to Windows Clients

## MDM vs GPO Conflict Resolution
- When both GPO and Intune (MDM) configure the same setting, **Intune (MDM) wins** by design
- Application developers decide conflict resolution in their code
- Microsoft development guideline: MDM settings should always win over GPO

## Method 1: Using Accounts Tab
1. Verify user has Intune license and device is managed
2. Open cmd as logged-on user, run: `dsregcmd /status`
3. Check Diagnostic data section for MDM enrollment status
4. Go to: Start > Settings > Accounts > Access work or school
5. Open MDM Diagnostics file at: `C:\Users\Public\Documents\MDMDiagnostics\MDMDiagReport.html`

## Method 2: Using SyncMLViewer Tool
1. Download from: https://github.com/okieselbach/SyncMLViewer
2. Extract and run SyncMLViewer.exe (click "Run anyway" if SmartScreen blocks)
3. Click "MDM Sync" to trigger sync
4. Reports generated at: `C:\Users\Public\Documents\MDMDiagnostics\MdmDiagnosticsTool`
5. Search for CSP name (e.g., "LAPS") in XML to verify policy application
6. Similar to GPRESULT for GPO perspective

## Key Scenarios
- **Windows LAPS**: Scenario 1 = Hybrid (password stored on-prem), Scenario 2 = AADJ/Hybrid (password stored in Azure)
- LAPS can be configured via GPO or Intune; when both exist, Intune wins
