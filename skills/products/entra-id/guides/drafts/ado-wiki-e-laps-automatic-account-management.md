---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Changes in Windows Server 2025 and Windows 11 24H2/Windows LAPS - 24H2 new features/LAPS: 24H2: Automatic Account Management Feature"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Changes%20in%20Windows%20Server%202025%20and%20Windows%2011%2024H2%2FWindows%20LAPS%20-%2024H2%20new%20features%2FLAPS%3A%2024H2%3A%20Automatic%20Account%20Management%20Feature"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1716499&Instance=1716499&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1716499&Instance=1716499&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**
This article provides an overview of the new Windows Local Administrator Password Solution (LAPS) Automatic Account Management feature, explaining its benefits and detailing various policy settings and their outcomes.

[[_TOC_]]

### Background
Prior to the introduction of the new LAPS Automatic Account Management feature, Windows LAPS supported managing a local administrator account in the following two categories:

A) The built-in (RID=500) local Administrator account.

B) A custom account created by the customer and then identified by name in the LAPS CSP (Configuration Service Provider) or GPO (Group Policy Object).

Based on security best practices, which recommend disabling and never using the built-in admin account, most customers are choosing option 2. While functional, this option does require that the customer's IT admin become deeply engaged in the details of creating and managing the custom account.

### Introduction to Windows LAPS Automatic Account Management
Windows Local Administrator Password Solution (Windows LAPS) Automatic Account Management is an optional feature designed to enhance the security of local administrator accounts. It offers the following capabilities:

1) Automatic management (creation, deletion, rotating password) of a custom managed account: This option allows customers to adopt Microsoft's recommendation to disable and never use the built-in admin account (RID=500) without the burden of creating the custom local admin account themselves.
2) Support for disabling the custom managed account: Leaving the managed account disabled all the time is extremely appealing since it reduces the attack surface area of that account to zero. Password spray attacks against a disabled account are impossible.
3) Support for a mode where the name of the automatically custom managed account is regularly randomized every time the accounts password is updated: Constant rotation of the local admin account name is an excellent defense-in-depth technique, as a low-privilege attacker cannot easily discover the name.
### Conclusion
Supporting of these approaches gives us the best of all worlds: for those (small) time periods during which the managed account has to be enabled and used, it will have a random name which is likely to remain unknown by any attacker within the possible attack window. The idea is to always leave the managed account in a disabled state. When it becomes necessary to use the account to gain device access, move the Active Directory (AD) computer object into a special Organizational Unit (OU) configured with a policy that enables the account. Once the device applies the new policy, the account is available for use. After the helpdesk or other scenario is completed, move the AD computer object back to the original OU, resulting in the account being re-disabled.


### The policy options and outcomes:

| # | Description | Policy setting | Outcome |
|--|--|--|--|
| 1 | When the policy disabled or not configured LAPS manages the built-in Administrator |![image.png](/.attachments/image-45fe70d2-c5a5-4816-b27e-2e5161a886a8.png)  | ![image.png](/.attachments/image-ad242590-8a11-4609-a50b-d9fb53d44d4b.png)![image.png](/.attachments/image-cce9828d-8d3c-4502-b5b6-06f5df03ba8e.png) |
| 2 | When the policy enabled and the target account to manage is the built-in admin, LAPS renames the Administrator name to WLapsAdmin  |![image.png](/.attachments/image-b48db796-fc89-481c-badc-26a091d02ebb.png) | ![image.png](/.attachments/image-190f6d05-1017-471e-bf2b-0643c8a193e7.png)![image.png](/.attachments/image-42c74883-0244-4a6c-8ba2-652116a9d4e1.png) |
| 3 | When the policy enabled and the target account to manage is the built-in admin and you specify an Automatic account name, LAPS renames the built-in admin name to the specified name |![image.png](/.attachments/image-e49b8c3e-bc94-43fe-ba1d-99b9153b6af2.png) | ![image.png](/.attachments/image-51310c50-5527-4ee0-9fe4-8facbb2b4cf0.png)![image.png](/.attachments/image-2e79b431-7696-45db-be64-c0716decf517.png) |
| 4 | When the target account to manage is the built-in admin and you uncheck the option to "Enable the manage account", LAPS disables the built-in admin (rid 500) |![image.png](/.attachments/image-56d2ef15-e654-483a-9613-d400cfd3fa0c.png) | ![image.png](/.attachments/image-01a5d41e-56a7-482a-b0eb-ae3b26d6025f.png) |
| 5 | When the target account to manage is a **custom** admin account and you uncheck the option to "Enable the manage account", LAPS creates a new local admin and disables it |![image.png](/.attachments/image-66906aa7-4f3c-4194-b2ef-af2c428d31bd.png)  | ![image.png](/.attachments/image-af7ba7b3-979f-4989-bf35-437f9f57b2e7.png)![image.png](/.attachments/image-e0fa11b2-0bc3-4942-bbe4-629fb4bf1df9.png) |
| 6 |When the target account to manage is a **custom** admin account and you uncheck the option to "Enable the manage account" and you enable the "Randomize" option, LAPS creates a new local admin, disables it and rename it which password rotation cycle.  |![image.png](/.attachments/image-103b7d1b-aa57-4ad9-83d3-5aa04a3cda9b.png)  | ![image.png](/.attachments/image-6030b5ef-e664-405a-be32-809369ff0cba.png) |




 **Important note:** if you choose to disable the custom / built-in Administrator (Option 6 in the table above), you may also want to set the registry value WinREAuthenticationRequirement under HKLM\Software\Policies\Microsoft\WinRE to 0 using the below command or via Group Policy preferences (GPP):

`reg add HKLM\Software\Policies\Microsoft\WinRE /v WinREAuthenticationRequirement /t REG_DWORD /d 0`

The registry value above will ensure that in a case where the machine lost connectivity with the domain (Network connectivity issues, Broken secure channel etc...) and your only alternative to logon to the client is via the local administrator (which is currently disabled), the local Administrator will automatically be enabled when starting the machine in Recovery mode boot.

![image.png](/.attachments/image-9bd1f546-c5f0-43b9-8475-2e6b1766e854.png)
![image.png](/.attachments/image-4148c251-fbff-4f94-9b1d-7adb1a532f7c.png)
![image.png](/.attachments/image-6d75eba5-236a-4366-93eb-fd8bb5c6e96d.png)
![image.png](/.attachments/image-9fb2cc74-ef19-4071-b34e-cd6f7d9c9d35.png)
![image.png](/.attachments/image-b27ca141-d342-49e4-805f-464e483f8ac2.png)

### More information

[Automatic account management mode](https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-concepts-account-management-modes)\
[New automatic account management feature](https://learn.microsoft.com/en-us/windows-server/get-started/whats-new-windows-server-2025#windows-local-administrator-password-solution-laps)

[Windows LAPS: Automatically enable accounts during safe-mode boot](https://aka.ms/windowslaps_tt2023_winre_demo)