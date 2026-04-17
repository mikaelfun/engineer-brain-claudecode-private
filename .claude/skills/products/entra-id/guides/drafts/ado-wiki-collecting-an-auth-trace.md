---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Window Devices/Collecting an Auth trace"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FWindow%20Devices%2FCollecting%20an%20Auth%20trace"
importDate: "2026-04-05"
type: data-collection-guide
---

# Collecting an Auth trace

Auth traces are useful to troubleshoot a variety of issues from windows hello
for business to device registration and active directory authentication. In most
cases, it's necessary to capture simultaneous Auth traces depending on what
you're troubleshooting. The following can be copied and pasted in emails sent to
the customer. You may need to change wording depending on the repro action
required.

## If the affected user has admin rights to the machine.

1.  Download Auth PowerShell script files.
    -  <https://aka.ms/authscripts>
2.  Extract the zip file contents into a preferred folder path.

3.  Open PowerShell as admin on the win 10/11 client and change to the directory
    where the files were extracted to

4.  Run **start-auth.ps1 -acceptEULA -vauth** to start the trace.

5.  Reproduce the issue. (e.g., lock and unlock device for PRT issuance issue
    scenarios)

6.  Run **stop-auth.ps1** to stop the trace.

7.  Zip the AuthLogs folder with all the data and upload it to the case using the provided secure case files link.

## If the affected user does not have admin rights.

1.  Make sure the affected user is signed out.

2.  Sign-into the PC with an admin account.

3.  Download Auth PowerShell script files.

    -   <https://aka.ms/authscripts>

4.  Extract the zip file contents into a preferred folder path.

5.  Open PowerShell as admin on the win 10/11 client and change to the directory
    where the files were extracted to.

6.  Run **start-auth.ps1 -acceptEULA -vauth** to start the trace.

7.  Use the "Switch User" button from the start menu and switch to and sign-in
    as the affected user account.

8.  Try to sign-in. If it fails or when it gets to the desktop, switch back to
    the admin account.

    **Note.** It can take up to 2 minutes to capture PRT request.

9.  From the admin PowerShell Prompt, run **stop-auth.ps1** to stop the trace.
    Wait for the trace to stop.

10. Switch back to the affected user and open a normal command prompt

11. Change directory (CD) to where the AuthLogs folder is located.

12. Run these commands to finish capturing the data we need.

    -   dsregcmd /status > dsregcmd-USER.txt

    -   whoami > whoami-USER.txt

    -   whoami /upn > whoami-USERUPN.txt

    -   whoami /all > whoami-All.txt

13. Zip the AuthLogs folder with all the data and upload it to the case using the provided secure case files link.

### For Additional information check [KB4487175](https://internal.evergreen.microsoft.com/en-us/topic/944d1348-83b9-87c0-7ef4-1d76b5c2e5f9)
