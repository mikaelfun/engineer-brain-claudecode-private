---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Window Devices/Microsoft Entra Hybrid Join/Bulk leave Hybrid AAD Join State"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FWindow%20Devices%2FMicrosoft%20Entra%20Hybrid%20Join%2FBulk%20leave%20Hybrid%20AAD%20Join%20State"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Bulk leave Hybrid AAD Join State

## Background
Sometimes we are asked by customer on how to leave Hybrid AAD join status for a large number of Windows 10 devices. For example if the device OU was accidentally removed from the sync scope after Hybrid AAD joined. To fix the issue, devices need to be re-joined after leaving Hybrid join state.

It's not ideal to run "dsregcmd /leave" one by one if there are thousands of devices affected.

## Discussions of several mechanisms
As you already know, we can run **"dsregcmd /leave"** to remove the HAADJ status.
- Run "dsregcmd /leave" requires administrative privileges.
- Run "dsregcmd /join" requires the sign in user to be AAD account.

In Active Directory, we have GPO (Startup/Shutdown script, Logon/Logoff script), and group policy preference to deploy scripts or tasks to member machines.

1. **Startup script**: Executed during startup. Has Administrative privilege, but did not provide AAD user info. Can be used in bulk leave scenario. As startup script will be executed during **every** startup, we'll need to remove the group policy immediately after it's executed.
2. **Logon/logoff script**: Executed during user sign in. Might not have administrative privilege, depending on the sign-in user account's privilege.
3. **Group policy preference - task scheduler - Immediate Task**: Can be configured as one-time job with administrative privilege. No need to restart client machine.

## Use Group policy Preference Immediate task
Group policy Preference Immediate task is one-time job and it will be deleted from Task Scheduler Library after execution, which meets our requirement.

### Steps:
1. Log onto a Domain Controller. In Group Policy Management Console, create a Group policy object, link it to an OU that contains the affected machines or users. Modify the **Security Filtering** to apply to only a group of users if required.
2. Edit the GPO. In Computer Configuration or User Configuration -> Preferences -> Control Panel Settings -> Scheduled tasks, create a **Immediate Task (At least Windows 7.)**
3. In **General** tab, configure to run as **System privilege**.
4. Create a new .bat file. Put it in a shared location with authenticated users has permission to read. Type the command: `%SystemRoot%\System32\dsregcmd.exe /leave`
5. In **Actions** tab, Start a program to run the bat file from shared location.
6. In **Common** tab, check **Apply once and do not reapply**. So that the immediate task will be pushed to client machine only once.
7. On client machine, wait for group policy refresh (Typically 90-120 minutes). To get the policy immediately, run **gpupdate /force**.

## Support Boundary
Group policy Preference is **not** supported by Azure Identity team. Action plan shared in this wiki is an additional effort. Please set expectation properly.
If there are any GPO related issue, please guide them to raise ticket with Windows team.
