---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/PKI - AD Certificate Services/Workflow: PKI Client/Workflow: PKI Client: Certificate Autoenrollment"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/PKI%20-%20AD%20Certificate%20Services/Workflow%3A%20PKI%20Client/Workflow%3A%20PKI%20Client%3A%20Certificate%20Autoenrollment"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/751170&Instance=751170&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/751170&Instance=751170&Feedback=2)

___
<div id='cssfeedback-end'></div>

[[_TOC_]]

**Owners:** Alexander Mora Delgado (alemora)

**Support topic:** Routing Windows V3\Certificates and Public Key Infrastructure\Certificate enrollment

#Summary  
This workflow provides details about Certificate Autoenrollment, including scoping questions, dependencies, data collection, data analysis, and problem investigation resources.

#Background
Autoenrollment is a feature that allows the administrators to massively deploy certificates on machines running the Windows Operating System, while simplifying first time deployment of certificates and also renewal of previously provided certificates. Autoenrollment can be configured for user and computer-based certificate issuance. Autoenrollment is not enabled by default.

#Dependencies
1. A healthy enterprise certification authority
2. Manual enrollment should work (underlying dependencies are RPC and Kerberos)
3. Autoenrollment group policy configured and applied to the desired OU
4. Version 2 or plus certificate template correctly configured
5. Certificate services client schedule tasks
6. Network List Service setto manual andNetwork location Awareness setto automatic 

##Healthy enterprise certification authority
Stand-alone PKI environments are incompatible with certificate autoenrollment since the usage of certificate templates is required. 

The enterprise PKI needs to be in a healthy status, meaning it should be trusted and accessible by the client.

##Manual enrollment should work
**Manual enrollment is the very first test you should perform**. 

Failure to get a certificate manually will be an indication that you should work in the general enrollment issues. RPC and Kerberos are the underlying protocols used during enrollment.

##Autoenrollment group policy
There are two group policies on autoenrollment that matter the most, one will dictate the behavior of computer-based certificate templates, while the other will rule over the user-based templates, both should be configured in the same way:
```
Computer Configuration\Policies\Windows Settings\Security Settings\Public Key Infrastructure\Certificate Services Client  Auto-enrollment

User Configuration\Policies\Windows Settings\Security Settings\Public Key Infrastructure\Certificate Services Client  Auto-enrollment
```

![Autoenroll GPO Capture](/.attachments/PKI/Autoenroll_Policy.png)


Autoenrollment group policy registry setting are written to the following locations in the registry:

```
User:  HKCU\Software\Policies\Microsoft\Cryptography\Autoenrollment
Value Type:  REG_DWORD
Value Name:  AEPolicy

Computer:  HKLM\Software\Policies\Microsoft\Cryptography\Autoenrollment
Value Type: REG_DWORD
Value Name:  AEPolicy
```

##Version 2 or plus certificate template
The "Autoenroll" permission is only included on templates that are version 2 or plus, if the administrator requires to autoenroll a certificate using a certificate template version 1, then the version 1 template needs to be duplicated and adjusted for this objective, transforming the copy into a V2 or plus template.

![Autoenroll Schema Version 2 Capture from Template manager](/.attachments/PKI/Autoenroll_SchemaVersion2.png)


There are five different settings on the template that are relevant for autoenrollment.

**1. Publish certificate in Active Directory:** You can choose whether to publish the certificate to AD, based on the Certificate Template. The certificates are published as an attribute of the security principal (userCertificate attribute) contained in the subject of the issued certificate.  DO NOT use this with computer accounts.  There is no field in AD Users and Computers on computer objects to expose the userCertificate attribute.  
If there are a lot of certificates stored in the object it could cause AD replication problems for the object.

**Do not automatically re-enroll if a duplicate certificate exists in Active Directory:** If the certificate template is published to AD, you can prevent re-enrollment if a valid certificate of the same Certificate Template exists for the security principal indicated in the subject.  
DO NOT use this feature to fix a constant re-enrollment via autoenrollment issues (This is most commonly seen when a template is configured for issuance via the RDP group policy AND Autoenrollment as well).  
Fix the real issue that is causing autoenrollment to constantly run and enroll for the same certificate repeatedly.

![Autoenroll Publish To AD Template option](/.attachments/PKI/Autoenroll_PublishToAD.png)

**2. Do the following when the subject is enrolled and when the private key associated with this certificate is used:** There are three options, for completely automatic experience the option "Enroll subject without requiring any user input" must be selected. Otherwise, the user will be prompted with a balloon/toast notification that requires user input.

![Autoenroll Toast Balloon Template option](/.attachments/PKI/Autoenroll_ToastBalloon.png)


**3.Subject Name:** It is usually preferred to select the option "Build from this Active Directory information", be cautious on the option selected, the attribute must exist in active directory otherwise the autoenroll will fail since no such attribute was found for the user/computer object.

Use subject information from existing certificates for autoenrollment renewal requests option is available to simplify the task of adding the subject name to the certificate renewal request and to allow computer certificates to be renewed automatically. Subject information from existing certificates is not used for automatic renewal of user certificates.  

![Autoenroll Subject Name Template option](/.attachments/PKI/Autoenroll_SubjectName.png)

**4. CA certificate manager approval:** Marking this option will break the automation for certificate enrollment, requiring the administrator to approve the requests from the Certificate Authority "Pending Requests" container.

![Autoenroll Manager Approval Template option](/.attachments/PKI/Autoenroll_ManagerApproval.png)

**5. Security:** Finally, the security tab should be properly configured, Authenticated Users should have read access since the templates are accessed on SYSTEM context, failing to add this permission will result on the computer unable to read the templates. At the same time, the user/computer (or group that the principal belongs to) must have Read, Enroll, AND Autoenroll permission for autoenrollment to work.

![Autoenroll Security Tab Template option](/.attachments/PKI/Autoenroll_Security.png)

##Certificate services client schedule tasks
Autoenrollment is a process that is triggered by two tasks, one for user and another for computer. The tasks can be found on the task scheduler. These tasks are triggered regularly by the following reasons
- User logon
- Machine powered on
- Every 8 hours 

The tasks can be found: 
```
Task Scheduler Library\Microsoft\Windows\Certificate Services Client
1. System Task
2. User task
```

![Autoenroll Task](/.attachments/PKI/Autoenroll_Task.png)

#Usage
Autoenrollment is useful on the following (but not limited) scenarios:

1. First time certificate deployment
2. Automatic renewal of previously deployed certificates that are close to its expiration time
3. Root/Intermediate certificate distribution
4. Re-enroll of certificates previously issued with the end goal of changing any of its attributes specified on the certificate template

When computer autoenrollment runs there is more than just a check / enrollment of specific templates configured for autoenrollment.  
One feature of computer autoenrollment is that it synchronizes the content of the Active Directory store (also known as the Enterprise Store) to all computers in the forest.  
This only works when computer autoenrollment has been enabled.  If computer autoenrollment is disabled, then automatically keeping the AD store in sync on all client computers will not happen.
Keep in mind that the AD store includes, all Root CAs, Sub CAs, and the NTAuth store.  

Also, the ENTERPRISE / AD Store is the one located at the following locations in Active directory:
```
CN=Certification Authorities,CN=Public Key Services,CN=Services,CN=Configuration,DC=[Forest Root DN]            <-- Root Certification Authorities
CN=AIA,CN=Public Key Services,CN=Services,CN=Configuration,DC=[Forest Root DN]                                  <--  Intermediate Certification Authorities store.
CN=NTAuth,CN=Public Key Services,CN=Services,CN=Configuration,DC=[Forest Root DN]                               <--  CAs Trusted for Windows Authentication.
```

When computer autoenrollment runs it checks to see if it needs to update certificates maintained in the Enterprise store.  
Updating could be adding or even removing certification authorities from any of these stores based on what is in Active Directory.  
It determines if Active Directory has been updated or not by tracking USNs on a per domain controller basis.  

This information is stored in the registry at the following location:
```
HKLM\Software\Microsoft\Cryptography\AutoEnrollment\AEDirectoryCache
```
Within this registry key location is another set of Keys that have a GUID as the name.  This GUID is associated to a domain controllers GUID.

#References

[Configure certificate auto-enrollment](https://learn.microsoft.com/en-us/windows-server/networking/core-network-guide/cncg/server-certs/configure-server-certificate-autoenrollment)

[Active Directory Certificate Services (AD CS) Troubleshooting: Certificate Autoenrollment](https://social.technet.microsoft.com/wiki/contents/articles/3048.active-directory-certificate-services-ad-cs-troubleshooting-certificate-autoenrollment.aspx)

[Troubleshooting autoenrollment](https://learn.microsoft.com/en-us/archive/blogs/instan/troubleshooting-autoenrollment)  

[Supported and recommended values of Validity Period and Renewal Period](https://internal.evergreen.microsoft.com/en-us/topic/285cec31-cfcc-b6d4-5292-274088ef928e)

#Scoping 

- Schedule a remote session with the customer

- Give the customer the opportunity to describe the issue on their own

##What 

- What OS version(s) is impacted? 

- What type of environment are the impacted clients a part of? (VDI, RDS, End user environment (laptop/desktop))

- What is impacted, user or computer-based certificates? 

- What is the name of the template having the issue?

- What users are impacted (All Users, admins, non-admins, etc)?

- What is the problem with autoenrollment, first time deploy, renewal, re-enrollment?

- What is the error received, if any? 

- What is the GPO configuration for autoenrollment (user and computer)? 

- What is the group policy name and Unique ID for autoenrollment? 

##Where

- Where are the impacted clients located? 

- Do we have any firewall between the affected machine and the DCs/CAs? 

##When

- When was the issue first noticed? 

- Any other changes happen around this time frame? (network changes, new applications, upgrades, etc) 

##Impact

- How many machines/users are impacted? 

- Was this working before? 

- Does the issue affect other templates?

- Is it failing if the certificate is manually requested?

- Is this issue intermittent or permanent? 

- Is it reproducible? How? 

#Troubleshooting approach

1. Try to enroll manually, if manual enrollment is failing, autoenroll will never work, if manual enrollment is failing please refer to [Workflow: PKI Client: Certificate Enrollment](/PKI-%2D-AD-Certificate-Services/Workflow:-PKI-Client/Workflow:-PKI-Client:-Certificate-Enrollment)
2. Check the certificate template properties  (Version, permissions, settings) as described in this document on [Version 2 or plus certificate template](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/751170/?wikiVersion=GBmaster&_a=edit&pagePath=/PKI%20%252D%20AD%20Certificate%20Services/Workflow%3A%20PKI%20Client/Workflow%3A%20PKI%20Client%3A%20Certificate%20Autoenrollment&anchor=version-2-or-plus-certificate-template)

3. Verify the schedule task existence, last run, and return code, the last run should have been recently with a return code of 0x0

4. Check the certificate store of the machine and user check the container Certificate Enrollment Request (make sure is empty) 

![Autoenroll Enrollment Requests Certificate store capture](/.attachments/PKI/Autoenroll_EnrollmentRequests.png)

5. Check the computer is getting the Autoenrollment GPO properly, for this check the value on the following key to be set to (7) 
```
HKLM/SOFTWARE/Policies/Microsoft/Cryptography/AutoEnrollment/AEPolicy 
HKCU/SOFTWARE/Policies/Microsoft/Cryptography/AutoEnrollment/AEPolicy 
```
6. Ensure that the**Network List Service** is setto manual and**Network location Awareness**is set to automatic (Default in 2019).
7. If all the above is properly set, proceed to delete the cache subkeys under: 
```
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Cryptography\AutoEnrollment 
```

8. Once the cache keys were deleted, proceed to log out and login again 

9. Check if the certificate is present, If not, force autoenrollment:
```
certutil -pulse
certutil -user pulse
gpupdate /force 
```
10. Set new registry key to turn on more detailed autoenrollment auditing, create a new DWORD value named AEEventLogLevel and set its value to 0 in: 

```
HKCU\Software\Microsoft\Cryptography\Autoenrollment 
HKLM\Software\Microsoft\Cryptography\Autoenrollment
```

11. Open up Application Log in Event Viewer (eventvwr.exe).

12. Force Autoenrollment:
```
gpupdate /force
```


13. In the Application event log, refresh the log to see what happens during autoenrollment.

14. Two computer autoenrollment messages (start, stop) should occur first, followed by two user autoenrollment messages (start, stop) in 30 sec.  2 minutes. Any issued certs should appear in the log as Event ID 18s or 19s. Stop and Start messages are event IDs 2 and 3.

#DCOM troubleshooting
[KB5004442Manage changes for Windows DCOM Server Security Feature Bypass (CVE-2021-26414)](https://support.microsoft.com/en-us/topic/kb5004442-manage-changes-for-windows-dcom-server-security-feature-bypass-cve-2021-26414-f1400b52-c141-43d2-941e-37ed901c769c)

["RPC server unavailable" while trying to load the CA database](https://internal.evergreen.microsoft.com/en-us/topic/cfe42932-b3ea-1dd7-de25-1977449b63de)

[Workflow: UEX: DCOM: Resolving DCOM Event 10016](https://internal.evergreen.microsoft.com/en-us/topic/e0387881-7227-428e-dbf6-63985b748dda)

[ADDS: PKI: Certificate Web Enrollment Failed with COM Error Info: CCerRequest::Submit: The RPC Server is unavailable. 0x800706ba (WIN32: 1722 RPC_S_SERVER_UNAVAILABLE)](https://internal.evergreen.microsoft.com/en-us/topic/ba39c6ba-52ac-190d-3f76-f230d875103b)

[PKI: During NDES role installation, getting error message "Failed to enroll RA certificates. The RPC server is unavailable. 0x800706ba (Win32: 1722 RPC_S_SERVER_UNAVAILABLE)"](https://internal.evergreen.microsoft.com/en-us/topic/4bd16ac8-19ad-1eab-81ae-b747829e1f3a)

[ADDS: PKI: Machine based certificate request via MMC/Autoenrollment fails with an error 'The RPC server is unavailable.'](https://internal.evergreen.microsoft.com/en-us/topic/c11d18a8-ae2c-2f7f-cd23-e24943944f29)

[Windows 2008 R2 Certificate enrolment failing with Event ID: 13 "The RPC server is unavailable (0x800706ba)"](https://internal.evergreen.microsoft.com/en-us/topic/5970e629-fef7-526b-59d7-70ab16b2adff)

[The RPC server is unavailable, 0x800706ba (WIN32: 1722 RPC_S_SERVER_UNAVAILABLE) - MMC certificate enrollment](https://internal.evergreen.microsoft.com/en-us/topic/bea1f1a4-16fe-cfa5-d50b-73f38fdb0105)

[Bind Nack: Call=0x3 Reject Reason: invalid_checksum](https://internal.evergreen.microsoft.com/en-us/topic/5a21473d-9dd4-7db0-1f4e-cf327b7286c1)

#Data Collection
Generally, in autoenrollment issues, the aim is to find the specific dependency (or dependencies) that has the misconfiguration or failure. With that said, the engineer troubleshooting this issues should be well aware of the dependencies explained in this document on [Dependencies](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/751170/?wikiVersion=GBmaster&_a=edit&pagePath=/PKI%20%252D%20AD%20Certificate%20Services/Workflow%3A%20PKI%20Client/Workflow%3A%20PKI%20Client%3A%20Certificate%20Autoenrollment&anchor=dependencies)

:memo: **NOTE**: Before collecting any data, **make sure that manual enrollment is working properly**. If manual enrollment is NOT working, please refer to the document: [Workflow: PKI Client: Certificate Enrollment](/PKI-%2D-AD-Certificate-Services/Workflow:-PKI-Client/Workflow:-PKI-Client:-Certificate-Enrollment)


##Group policy
From the machine that is not properly receiving the certificate automatically, get the values of the following registry keys
```
Get-ItemPropertyValue -Path 'HKLM:\SOFTWARE\Policies\Microsoft\Cryptography\AutoEnrollment' -Name AEPolicy
Get-ItemPropertyValue -Path 'HKCU:\SOFTWARE\Policies\Microsoft\Cryptography\AutoEnrollment' -Name AEPolicy
```
**The value should return 7**, if it is different, then proceed with more data collection on group policy, please refer to: [Group Policy](/Group-Policy)

##Template details and configuration
Get the template details

1. Template schema version
2. Active directory permissions on the template with the issue, example:

```
Import-Module ActiveDirectory
(Get-Acl -Path "AD:CN=Computer,CN=Certificate Templates,CN=Public Key Services,CN=Services,CN=Configuration,DC=contoso,DC=com").Access | Out-File c:\temp\templatePermissions.txt
```
Refer to the following link to understand the output: [Understanding Get-ACL and AD Drive Output](https://devblogs.microsoft.com/powershell-community/understanding-get-acl-and-ad-drive-output/)

3. General tab certificate template configuration
4. Subject name tab certificate template configuration

##Application event logs

1. Set new registry key to turn on more detailed autoenrollment auditing, create a new DWORD value named AEEventLogLevel and set its value to 0 in: 
```
HKCU\Software\Microsoft\Cryptography\Autoenrollment 
HKLM\Software\Microsoft\Cryptography\Autoenrollment
```
2. Open up Application Log in Event Viewer (eventvwr.exe).

3. Trigger the schedule task to run, make sure the result code is 0x0:
```
certutil -pulse
certutil -user -pulse
```

![Autoenroll Schedule Task Result](/.attachments/PKI/Autoenroll_scheduleTaskResult.png)


4. In the Application event log, refresh the log to see what happens during autoenrollment.

5. Two computer autoenrollment messages (start, stop) should occur first, followed by two user autoenrollment messages (start, stop) in 30 sec.  2 minutes. Any issued certs should appear in the log as Event ID 18s or 19s. Stop and Start messages are event IDs 2 and 3.

6. If there are any valid autoenrollment certificates to be issued, they should issue here.

##Authentication script logs

If the issue can be reproduced, the best initial data set will include authentication logs from client machine, certificate authority and (if Kerberos issues are suspected) domain controller.

Authentication scripts include Network traces, CAPI2 events, application event logs, KDC etl, Kerberos etl, group policy results, etc. 

Refer to the following KB for authentication logs:
[ADDS: PKI: Tools: Scripts for collecting data when investigating Smart card, Winlogon or Credential provider issues](https://internal.evergreen.microsoft.com/en-us/topic/fe24e35d-aa4c-e37a-96c1-63f0e5663b7b)

Data collection for an auto enrollment issue could look like this:

**From the affected client device**

Start auth scripts

**From issuing CA**

Enable CA Debug log

````certutil -f -setreg debug 0xffffffe3````

__Certsvc service needs to be restarted__ for example by running ````Net stop certsvc && net start certsvc ````

Start the auth scripts

**From domain controller**

Start the auth scripts

**Reproduce the issue when all the logs are running**

For example, go in Task Manager and manually start the relevant enrollment task, under
````
Task Scheduler Library\Microsoft\Windows\Certificate Services Client
1. System Task
2. User task
````

![Autoenroll Scheduled Task](/.attachments/PKI/Autoenroll_Task.png)

Wait for the scheduled task to finish.

Be sure to check if the task has finished with an error code.

**On domain controller**

Stop the auth scripts

**On the issuing CA**

Stop the auth scripts

Stop CA debug logging

````certutil -f -setreg debug 0x0````

__Certsvc service needs to be restarted__ for example by running ````Net stop certsvc && net start certsvc ````

The log file is in the following location: *%windir%\certsrv.log*

**On the affected client device**

Stop the auth scripts

#Training

**Windows Commercial Public Key Infrastructure** provides a structured plan for support engineers to learn Public Key Infrastructure topics and then test their knowledge

The learning solution comprises **PKI Foundation** and **PKI Advanced**.

**PKI Foundation** contains the following relevant modules for the autoenrollment topic:

- M06 - Certificate Templates and Enrollment - Slide Deck

- M06 - Certificate Templates and Enrollment - Recording

The links to the content of **Windows Commercial Public Key Infrastructure** are available on the PKI Workflow main page, under the [Trainings](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/413891/PKI-AD-Certificate-Services?anchor=trainings) section.

#Common scenarios

The following workflow details a scenario where autoenrollment was very relevant:  

[A "classical" autoenrollment problem](/PKI-%2D-AD-Certificate-Services/Step-by-Step-Guides/A-"classical"-autoenrollment-problem)  

---
[Certificate Auto-enrollment is not working while manual does work](https://internal.evergreen.microsoft.com/en-us/topic/324928cd-00bd-f82d-a06b-eb228bc8d1e2)  

---
[Auto-enroll of certificates from the Issuing CA to clients fails with RPC Error, manual enroll works](https://internal.evergreen.microsoft.com/en-us/topic/ab85d35f-900f-cd15-1ac4-694ce070dd85)