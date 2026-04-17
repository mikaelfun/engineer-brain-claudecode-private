---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Account Lockouts/Workflow: Account Lockout: Scoping"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Account%20Lockouts/Workflow%3A%20Account%20Lockout%3A%20Scoping"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414176&Instance=414176&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414176&Instance=414176&Feedback=2)

___
<div id='cssfeedback-end'></div>

This document provides a comprehensive guide for troubleshooting account lockout issues. It includes detailed sections on identifying the scope, location, and timing of the problem, as well as advanced troubleshooting steps.

[[_TOC_]]

# Issue verbatim

Elaborate one-line description of the issue.

Working on account lockout issues requires us to ensure that we are examining multiple accounts to find a pattern or root cause. If the same source is causing the account lockout for user accounts, the customer can try the same exercise to see if the lockout is related to the same application. The What, Where, and When sections below should help capture the basic information needed to scope the issue and start troubleshooting it. Detailed information can be taken during the scoping phase or requested later, depending on how troubleshooting goes.

## Example scope

Around 300+ user accounts are frequently locking out every 1-2 minutes automatically after unlocking.

---

# What

- What is the number of users affected? (Single, multiple, specific group, etc.)
- What is the role of impacted users? (Domain admin, domain user, local user)
- Are the affected user accounts being used by any specific applications as service accounts, or are they just normal end-user accounts?
- What are the password and account lockout policy settings? (You can run the command `net accounts /domain` and obtain the following information)

  >| Policy | Setting |
  >|:--:|:--:|
  >| Force user logoff how long after time expires? | |
  >| Minimum password age (days) | |
  >| Maximum password age (days) | |
  >| Minimum password length | |
  >| Length of password history maintained | |
  >| Lockout threshold | |
  >| Lockout duration (minutes) | |
  >| Lockout observation window (minutes) | |

- After unlocking the account, does it occur again for the same user? If yes, after how much time does it reoccur?
- What troubleshooting steps were taken before raising the issue? (Analyzing event logs to identify the source, temporarily applied scripts to auto-unlock user accounts, etc.)
- What recent changes were made to the environment before the issue? (Updates installed, new applications brought into the environment, new settings pushed via group policy, etc.)
- What type of devices do users have to log on to the domain? (Laptop, workstation, server, mobile devices)

---

# Where

- Is there a single or multiple forests or domains?
- Where is/are the user account(s) located? What is the impacted domain name?
- Where are the domain controllers (DCs) located? Number of DCs, name, and IP information. (You may run the following command to get the output)  
`Get-ADDomainController -Filter * | select Name, OperatingSystem, IPv4Address, Site`
- Is there any read-only domain controller (RODC) in place? If yes, how many and what Active Directory (AD) sites are they spread across?

---

# When

- When did the issue start happening?
- How did you initially identify the issue? (Helpdesk getting too many calls to unlock accounts, monitored event logs, third-party tools providing alerts)
- How frequently do the bad password attempts happen? (Every two minutes, every few hours, immediately)
- Are there any identifiable patterns? (Always, random, few times a day, intermittent, specific time of the day, etc.)

---

# Extent (Detailed / Advanced Info)

- If you unlock the user account, do you see the bad password count updated immediately?
- For every bad credential triggered, do you see the bad password count incremented? How many times? (Once, twice, a few times)
- Do you see the bad passwords originating from only one DC or from a few/many DCs?
- Was the affected user(s) password recently changed? (YES / NO / Dont Know)
    - If yes, what is the timestamp, and do we have the same information on all DCs? (To be noted down for further troubleshooting)
    - If dont know, identify the same using the `pwdLastSet` attribute in Active Directory (perform during troubleshooting)
- Are impacted users using dedicated machines, shared machines in a room, or do they log on to multiple devices (like laptops, phones, tablets, etc.)?
- If the affected user(s) has other devices, do they have a mail application configured on those devices too?
- Was a new device recently provided to the user while taking away the old ones, which are still present and not formatted?
- Are they by any chance help desk admins? (Because these people might be logging onto different machines and might not have logged out with old passwords)
- What activity does the user perform when this issue occurs? (Logging on to the machine, already logged on, accessing a specific resource or application, etc.)
- If the issue happens only while working on a specific application, what is the authentication protocol used by that application? (NTLM, Kerberos)
- Is AD replication working fine between the domain controllers in the impacted domain? (YES / NO)
    - If NO, since when is that broken and what is the error during replication?
- Does the lockout happen:
    - Only over the weekdays/weekends?
    - When the user is out of office and not logged in to the domain?
    - Only while connected through CORPNET/VPN?
    - During any other such special cases?
- How many password policies are configured in the domain?
- Do you have fine-grained password policies (FGPP) in place? (YES / NO)
    - If FGPP is enabled, what is the FGPP configuration?

  >| Policy | Setting |
  >|:--:|:--:|
  >| msDS-LockoutDuration | |
  >| msDS-PasswordSettingsPrecedence | |
  >| msDS-MinimumPasswordAge | |
  >| msDS-LockoutThreshold | |
  >| msDS-PasswordComplexityEnabled | |
  >| msDS-PasswordReversibleEncryptionEnabled | |
  >| msDS-PSOAppliesTo | |
  >| msDS-LockoutObservationWindow | |

You can use the [Get-ADFineGrainedPasswordPolicy](https://learn.microsoft.com/en-us/powershell/module/activedirectory/get-adfinegrainedpasswordpolicy) command for more details.