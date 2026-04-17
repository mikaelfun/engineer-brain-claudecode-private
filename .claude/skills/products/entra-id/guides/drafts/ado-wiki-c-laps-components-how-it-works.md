---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows LAPS/Legacy LAPS or LAPSv1/Workflow: LAPS : Components & How it works"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FWindows%20LAPS%2FLegacy%20LAPS%20or%20LAPSv1%2FWorkflow%3A%20LAPS%20%3A%20Components%20%26%20How%20it%20works"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/567232&Instance=567232&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/567232&Instance=567232&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**
This article provides an overview of Local Administrator Password Solution (LAPS), detailing its components, functionalities, and setup process. It explains how LAPS works, its features, and the steps needed to configure it.

[[_TOC_]]

# Components
-  **Agent - Group Policy Client Side Extension (CSE)**: Installed via MSI or by registering the admpwd.dll. The agent is responsible for:
  - Generating a random password, which is written on the local Security Accounts Manager (SAM) of the client and on the corresponding Active Directory (AD) computer object.
  - Event viewer logging.

- **PowerShell module**: Used for schema updating, granting rights, groups and organizational units (OUs) configuration, etc.

- **Active Directory**: Centralized control that includes:
  - Audit trail in the security log of the domain controller.
  - Group Policy Object (GPO) templates.
  - Computer object, confidential attribute

![A diagram show the different LAPS components](/.attachments/LAPS/LAPS_Components.png)


# How does LAPS work?

The core of the Local Administrator Password Solution (LAPS) is a GPO client-side extension (CSE) that performs the following tasks and can enforce the following actions during a GPO update:

- Checks whether the password of the local Administrator account has expired.
- Generates a new password when the old password is either expired or is required to be changed prior to expiration.
- Validates the new password against the password policy.
- Reports the password to Active Directory, storing it with a confidential attribute with the computer account in Active Directory.
- Reports the next expiration time for the password to Active Directory, storing it with an attribute with the computer account in Active Directory.
- Changes the password of the Administrator account.
- The password can then be read from Active Directory by users who are allowed to do so. Eligible users can request a password change for a computer.

# What are the features of LAPS?

LAPS includes the following features:

- **Security**:
  - Randomly generates passwords that are automatically changed on managed machines.
  - Effectively mitigates Pass-the-Hash (PtH) attacks that rely on identical local account passwords.
  - Enforces password protection during transport via encryption using the Kerberos version 5 protocol.
  - Uses access control lists (ACLs) to protect passwords in Active Directory and easily implement a detailed security model.

- **Manageability**:
  - Configures password parameters, including age, complexity, and length.
  - Forces password reset on a per-machine basis.
  - Uses a security model that is integrated with ACLs in Active Directory.
  - Uses any Active Directory management tool of choice; custom tools, such as Windows PowerShell, are provided.
  - Protects against computer account deletion.
  - Easily implements the solution with a minimal footprint.

# Steps to configure LAPS

- **Installation of Group Policy Client Side Extension (CSE) via MSI installation**:
  - On management computers.
  - On clients to be managed.

- **Active Directory preparation**:
  - Schema extension.

**Text from [Microsoft's LAPS page](https://www.microsoft.com/en-us/download/details.aspx?id=46899)**