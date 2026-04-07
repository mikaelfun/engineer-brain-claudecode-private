---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/M365 Identity/Authentication and Access/WAM Log Collection and Analysis"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/M365%20Identity/Authentication%20and%20Access/WAM%20Log%20Collection%20and%20Analysis"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# WAM log collection for M365 Office Authentication issues

## Collect MSOAID logs

1. **Download** the [Microsoft Office Authentication/Identity Diagnostic](https://aka.ms/msoaid) zip package. [Learn more](https://learn.microsoft.com/microsoft-365/troubleshoot/diagnostic-logs/use-msoaid-for-authentication-issues)
2. **Extract** the contents of the .zip package
3. Open folder MSOAID, **run MSOAID-WIN.exe as Administrator.** Best to capture in user context, so may need to temporarily elevate the user account.
4. Keep the default options selected and **click next twice**
5. **Click yes** to accept the Fiddler certificate request pop up (wait for command prompt windows to finish)
6. **Reproduce the issue**
7. **Click finish** to stop log collection. When prompted, you may delete the Fiddler certificate.
8. Navigate to the file path displayed. Upload the zip to your support case. **File location**: %LOCALAPPDATA%\temp\MSOAIDResults_<machinename>_<date>.zip

**NOTE**: Due to an issue with the MSOAID tool, DSREGCMD output may not be collected as expected. If missing, manually collect:
1. Open a normal command prompt as the affected user
2. Change directory to the unzipped MSOAIDResults folder
3. Run:
   - `dsregcmd /status > dsregcmd-USER.txt`
   - `whoami > whoami-USER.txt`
   - `whoami /upn > whoami-USERUPN.txt`
   - `whoami /all > whoami-All.txt`
4. Zip and upload.

## Auth Script Logs

### If the affected user has admin rights:

1. Download Auth PowerShell scripts: https://aka.ms/authscripts
2. Extract zip contents
3. Open PowerShell as admin, change to extracted directory
4. Run `start-auth.ps1 -acceptEULA -vauth` to start trace
5. Reproduce the issue (e.g., lock/unlock for PRT issuance)
6. Run `stop-auth.ps1` to stop trace
7. Zip AuthLogs folder and upload

### If the affected user does not have admin rights:

1. Sign out affected user, sign in with admin account
2. Download and extract auth scripts (https://aka.ms/authscripts)
3. Open PowerShell as admin, run `start-auth.ps1 -acceptEULA -vauth`
4. Sign out admin, sign in as affected user
5. Reproduce the issue
6. Sign out affected user, sign in as admin
7. Run `stop-auth.ps1`
8. Zip AuthLogs folder and upload
