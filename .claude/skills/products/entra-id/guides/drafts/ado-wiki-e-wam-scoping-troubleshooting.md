---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Azure Active Directory Topics/Web Accounts Manager (WAM) - TokenBroker Service/Scoping & Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAzure%20Active%20Directory%20Topics%2FWeb%20Accounts%20Manager%20(WAM)%20-%20TokenBroker%20Service%2FScoping%20%26%20Troubleshooting"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# WAM (Token Broker) Scoping & Troubleshooting

WAM (Token Broker) troubleshooting typically starts with the application team, who identifies the issue and then collaborates with the Directory Services team.

## Status Messages

- **Success** - Operation completed successfully
- **UserCancel** - The user has cancelled the operation by closing the authentication dialog.
- **AccountSwitch** - This is a success scenario. It means the user selected a different account in the accounts control dialog than the one specified by the calling app.
- **UserInteractionRequired** - Returned when GetTokenSilently* APIs are called. Indicates the account requires re-entering credentials by calling RequestTokenAsync API.
- **AccountProviderNotAvailable** - The provider is not registered or WAM is unable to find it. Contact the MSA or AAD team for resolution steps.
- **ProviderError** - Error when the provider (MSA/AAD) tried to process the token request from the caller.

## Scoping Questions

1. Describe the issue.
2. List the name(s) of the application reporting the error message.
3. What is the error message displayed on the screen, logs, or events?
4. Where in the workflow is the application failing?
   - Is the issue related to getting a token?
   - Is the issue related to using an issued token?
   - Is the issue related to renewing a token?
   - Is the issue related to not using Single Sign-On?
5. How can the issue be reproduced? (Steps to reproduce)
6. Can we reproduce the same issue using a lab or build machine?
7. From when is the customer facing this issue?
   - After a Windows update?
   - After an application update?
   - Provide a timeline (last 3 days).
8. Can we do something to resolve the issue?
   - Reboot the machine
   - Restart some service or restart the application
   - Clear the WAM cache
   - Sign in to a different version of Windows build or application build
   - Uninstall a Windows update
9. More scoping questions:
   - List the operating systems involved
   - Are all users impacted or only some users or machines?
   - Review DSREGCMD /status - does the user have a valid PRT?
   - Check Event Viewer: Application & Services > Microsoft > Windows > AAD > Operational Logs for PRT errors
   - Refer to PRT validation: [Validating PRT / Interpreting DSREGCMD](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/712091/Validating-PRT-Interpreting-DSREGCMD-Command)
10. How has the collaborating team identified/isolated that this is a WAM core issue?
    - What troubleshooting steps have been performed?
    - What logs have been collected?
    - Have they engaged engineering via ICM? What are the comments?
    - Have they provided error messages or ICM details?
    - Correlation IDs related to the plugin
11. What happens to other applications (e.g., if Outlook prompts for auth, what about other Office/Edge apps)?
12. Can you verify if the Web Accounts Manager (Token Broker) service is up and running?
13. If you clear the token cache and request a new token, do new tokens get created?
14. If you use a different application that uses WAM, is it able to get a token?

## Troubleshooting / Isolating Steps

1. **Identify scope**: Is the issue only with a specific application or all applications failing to retrieve a token?
   - Like Kerberos: are all apps failing to get tickets, or just one specific app?

2. **Test with Feedback Hub App**: Use Feedback Hub to test WAM token acquisition as an isolated test.

## Log Collection

### Method 1: TSS Scripts
Download TSS scripts from https://aka.ms/getTSS

```powershell
.\tss.ps1 -startnowait -PRF_Appx -ADS_Auth -netsh -etloptions circular:2048 -nosdp -video -psr -nopoolmon -noxray -noupdate -accepteula -procmon
```

### Method 2: Authentication Scripts
Download Authentication Scripts from https://aka.ms/authscripts

1. Start Auth Scripts
2. Reproduce the issue
3. Stop Auth Scripts
