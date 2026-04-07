---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Changes in Windows Server 2025 and Windows 11 24H2/dMSA - Delegated Managed Service Account/Scoping Questions & FAQ's"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Changes%20in%20Windows%20Server%202025%20and%20Windows%2011%2024H2%2FdMSA%20-%20Delegated%20Managed%20Service%20Account%2FScoping%20Questions%20%26%20FAQ%27s"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1544359&Instance=1544359&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1544359&Instance=1544359&Feedback=2)

___
<div id='cssfeedback-end'></div>

[[_TOC_]]

#Scoping & Troubleshooting dMSA issues

#Customer scenarios
Below are most common customer scenarios that CSS might get cases.

**Scenario1:** Customer is configuring new dMSA <br>
**Scenario2:** Customer is migrating a service account to a dMSA <br>
**Scenario3:** Unable to start a service after configuring a new dMSA account <br>
**Scenario4:** Unable to start a service after migrating a service account to a dMSA account <br>

#FAQ
(Read the FAQ's section to learn more about the feature, reading the scoping questions first would provide you more context to the troubleshooting scenarios)

**Question 1: Can I migrate a gMSA to a dMSA account?**

**Answer:** No, this scenario is not supported. For more information, please refer to the official documentation: [Microsoft Learn](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/delegated-managed-service-accounts/delegated-managed-service-accounts-overview).

---

**Question 2: Can I just extend the schema to Windows Server 2025 and then use a Windows Server 2025 member server to start using dMSA without having a Windows Server 2025 Domain Controller?**

**Answer:** No, you must have at least one Windows Server 2025 domain controller, which must be discoverable by the client or member server.

---

**Question 3: I have three service accounts in my environment running different application workloads. Can I migrate all three service accounts to a single dMSA?**

**Answer:** No, each service account must have its own dMSA. You cannot migrate multiple service accounts to a single dMSA.

---

**Question 4: My application server running a service account is behind a Read-Only Domain Controller (RODC) with no connectivity to a Read/Write Domain Controller. Is this a supported configuration for dMSA?**

**Answer:** Yes, this configuration is supported provided the following prerequisites are met:
1. The dMSA account must be cached on the RODC.
2. The dMSA account must be manually added to the "PrincipalsAllowedToRetrieveManagedPassword" attribute of the machine using the `Set-ADServiceAccount` PowerShell command.
   ```powershell
   Set-ADServiceAccount -Identity dMSAFinApp -PrincipalsAllowedToRetrieveManagedPassword Client$
   ```

---

**Question 5: Instead of migrating the service account, can I reconfigure all of my services to a new dMSA?**

**Scenario:** We have a SQL Server farm currently using a service account. I want to avoid the hassle of migration. Can I replace my service account with a dMSA?

**Answer:** Yes, you can replace the service account with a dMSA. This process would require:
1. Creating a new dMSA account.
2. Reconfiguring the service to use the new dMSA account.
3. Retiring the old service accounts.

---

**Question 6: Will my service start using the dMSA during the migration process or only after the migration is complete?**

**Answer:** The service will start using the newly created/configured dMSA only after the migration process is complete.

---

**Question 7: Can I delete the service account after migration? What should I do with the service account post-migration?**

**Answer:** The service account will be disabled, and its information, including permissions, SPNs, and delegation, will be moved to the dMSA account. However, you should keep the service account intact because:
1. The service is still configured with the service account and will not automatically change to the dMSA account. Deleting the service account will stop the service.
2. The service account has forward and backward links to the dMSA account.

---

**Question 8: I have three Windows Server 2022 operating systems and one Windows Server 2025 operating system running my SQL application. Can I migrate to dMSA in a Windows Server 2025 domain environment?**

**Answer:** No, all your clients/servers must be running on dMSA-supported operating systems to perform the migration.

---

**Question 9: Can I reset the password of my service account after I have started the migration process but before it is complete?**

**Answer:** No, it is not recommended to reset the password during the migration process.

---

**Question 10: What if I mistakenly migrated a service account that should not have been migrated? Can I undo or unlink the migration?**

**Answer:** Yes, you can undo a migration or unlink a service account and start from scratch. Use the `Undo-ADServiceAccountMigration` or `Reset-ADServiceAccountMigration` PowerShell commands.

---

**Question 11: I have migrated a service account, and it is now automatically disabled. Can I move the service account to a different Organizational Unit (OU)?**

**Answer:** Yes, you can move the disabled service account to another OU. The _msDS-ManagedAccountPrecededByLink_ attribute on the dMSA will automatically get updated with the new DN [of the disabled service account].

---

**Question 12: Can I remove the "Log on as a service" User Right for the legacy service account after the migration is complete?**

**Answer:** No, the service will fail to start.

---

**Question 13: Can I force a password reset for a dMSA account?**

**Answer:** No, you cannot force a password reset for a dMSA account.


#Generic Scoping questions to troubleshoot dMSA cases

**1. What scenario is the customer facing or calling Microsoft support?**

**Answer:** Below are some of the most common scenarios that the customers can call in requesting for support:

- Advisory on Configuring new dMSA
- Advisory on migrating a service account to a dMSA
- Issues faced during configuring a new dMSA
- Issues faced during migrating service account to a dMSA
- Unable to start service whilst using a new dMSA
- Unable to start service whilst migrating an existing service account to a dMSA

**2. What is the operating system? and why is this important**

**Answer:** There are 2 main Pre-reqs: <br>
**Pre-req 1:** Active Directory Schema updated to Windows Server 2025 <br>
**Pre-req 2:** At least 1 Windows Server 2025 domain controller in the domain which has to be discovered by the Server\Client running the service <br>
**Pre-req 3:** Windows Server 2025 Member server or Windows11 24H2 client supporting the dMSA feature

**3. General troubleshooting approaches**

![dMSA-Troubleshooting.png](/.attachments/dMSA-Troubleshooting-d47fcac4-baaf-417b-b61b-82d6e9513757.png)

**4. What are some of the known issues?**

**Answer:** Click on the link below to follow some of the know issues
[Click here for Known issues](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1544548/Known-issues-of-dMSA)