---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Account Lockouts/Workflow: Account Lockout: Extranet and Extranet Smart Lockout"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAccount%20Lockouts%2FWorkflow%3A%20Account%20Lockout%3A%20Extranet%20and%20Extranet%20Smart%20Lockout"
importDate: "2026-04-07"
type: troubleshooting-guide
---

This document outlines best practices and troubleshooting steps for dealing with account lockout scenarios in Active Directory Federation Services (AD FS). It includes an overview of Extranet Soft Lockout and Extranet Smart Lockout (ESL), key points to remember, advantages of Extranet Lockout, and basic troubleshooting guidelines.

# Best practices

## Introduction
While troubleshooting an account lockout scenario, if you find out the bad password requests come from external users through Active Directory Federation Services (AD FS), we can recommend Extranet Soft or Smart Lockout depending on the operating system installed on the AD FS server.

## Overview
In AD FS on Windows Server 2012 R2, we introduced a security feature called Extranet Soft Lockout. With this feature, AD FS stops authenticating users from the extranet for a period of time. This prevents your user accounts from being locked out in Active Directory (AD). In addition to protecting your users from an AD account lockout, AD FS extranet lockout also protects against brute force password guessing attacks.

In June 2018, AD FS on Windows Server 2016 introduced Extranet Smart Lockout (ESL). ESL enables AD FS to differentiate between sign-in attempts that look like they're from the valid user and sign-ins from what may be an attacker. As a result, AD FS can lock out attackers while letting valid users continue to use their accounts. This prevents denial-of-service on the user and protects against targeted attacks such as "password-spray" attacks.

ESL is available for AD FS in Windows Server 2016 and is built into AD FS in Windows Server 2019. More information:
https://docs.microsoft.com/en-us/windows-server/identity/ad-fs/operations/configure-ad-fs-extranet-smart-lockout-protection

## Key points to remember
- The Extranet Lockout feature only works for the **extranet scenario** where the authentication requests come through the Web Application Proxy (WAP).
- The Extranet Lockout feature only applies to **username and password** authentication.
- AD FS does not keep any track of **badPwdCount** or users that are soft-locked out. AD FS uses AD for all state tracking.
- AD FS performs a lookup for the **badPwdCount** attribute through LDAP call for the user on the Primary Domain Controller (PDC) for every authentication attempt.
- **AD FS older than 2016 will fail if it cannot access the PDC. AD FS 2016 introduced improvements that will allow AD FS to fall back to other domain controllers in case the PDC is not available.**
- AD FS will allow authentication requests from extranet if badPwdCount < ExtranetLockoutThreshold.
- If **badPwdCount** >= **ExtranetLockoutThreshold** AND **badPasswordTime** + **ExtranetObservationWindow** < **Current time**, AD FS will reject authentication requests from extranet.
- To avoid malicious account lockout, you should make sure **ExtranetLockoutThreshold** < **Account Lockout Threshold** AND **ExtranetObservationWindow** > **Reset Account Lockout Counter**.

## Advantages of Extranet Lockout
- It protects your user accounts from **brute force attacks** where an attacker tries to guess a user's password by continuously sending authentication requests. In this case, AD FS will lock out the malicious user account for extranet access.
- It protects your user accounts from **malicious account lockout** where an attacker wants to lock out a user account by sending authentication requests with wrong passwords. In this case, although the user account will be locked out by AD FS for extranet access, the actual user account in AD is not locked out and the user can still access corporate resources within the organization. This is known as a **soft lockout**.

## Basic troubleshooting

For Windows Server 2012 R2 / 2016 AD FS, you can search all AD FS servers security event logs for Event ID 411 Source AD FS Auditing events.

1. You can download the PowerShell script to search your AD FS servers for events 411 at this link. The script will provide a CSV file which contains the UserPrincipalName, IP address of submitter, and time of all bad credential submissions to your AD FS farm.
2. Open the CSV in Excel and quickly filter by username, IP, or times.
3. More information on the 411 events themselves:
   - These events will contain the user principal name (UPN) of the targeted user.
   - These events will also contain a message token validation failed and will say if it was a bad password attempt or the account is locked out.
4. If the server has 411 events showing up but the IP address field isn't in the event, make sure you have the latest AD FS updates installed. (More information can be found in KB3134222.)
