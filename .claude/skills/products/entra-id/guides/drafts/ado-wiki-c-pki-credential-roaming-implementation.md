---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/PKI - AD Certificate Services/Workflow: PKI Client/Workflow: PKI Client: Credential Roaming/Workflow: PKI Client: Credential Roaming Implementation"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/PKI%20-%20AD%20Certificate%20Services/Workflow%3A%20PKI%20Client/Workflow%3A%20PKI%20Client%3A%20Credential%20Roaming/Workflow%3A%20PKI%20Client%3A%20Credential%20Roaming%20Implementation"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1753240&Instance=1753240&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1753240&Instance=1753240&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article provides a detailed guide on how to configure credential roaming in an Active Directory environment, ensuring seamless synchronization of user credentials across multiple devices. It includes step-by-step instructions, registry key configurations, and verification methods.

[[_TOC_]]

# How to configure credential roaming?

Having a functioning, healthy Active Directory environment is crucial as credential roaming relies on group policy, auto enrollment, and healthy Active Directory and SYSVOL replication.

Create a new Credentials Roaming Group Policy Object (GPO) and link it to the Organizational Unit (OU).

![Screenshot of creating a new Credentials Roaming GPO](/.attachments/image-73ebe78c-8207-4d36-8df8-056cc34e303c.png)

![Screenshot of linking the GPO to the OU](/.attachments/image-84c57209-61a6-4684-aa9e-b71870acca94.png)

![Screenshot of the GPO settings](/.attachments/image-0b733037-428c-4934-9020-328ae1247941.png)

## Client registry keys

When Group Policy is applied to a domain computer, several registry values are set locally under the `HKCU\Software\Policies\Microsoft\Cryptography\Autoenrollment` registry key. The values mirror the settings configured in an enabled Certificate Management Services Group Policy template. If the Group Policy template is set to Disabled or Not Configured, the values do not exist.

GPresult report on client machine: `gpresult /h report.html`

![Screenshot of GPresult report](/.attachments/image-f3a939c3-33d0-4776-b353-ecedd5483576.png)

The screenshot below is what you should expect to see on a client machine if the credential roaming group policy settings have applied successfully.

![Screenshot of successful credential roaming group policy settings](/.attachments/image-2e43e3ee-b718-495b-ab2e-a973d186ef4a.png)

## Check the certificate information on the client when the user is logged on:

- `%AppData%\Microsoft\SystemCertificates` - Certificates for the current user
- `%AppData%\Microsoft\Crypto` - Private key of the certificates
- `%AppData%\Microsoft\Protect` - Master key files for the current user

Since the user didn't request a certificate before, there is no related information currently:

![Screenshot of user personal store](/.attachments/image-211aaf5e-4213-40ec-8b1e-f5d06ee2be29.png)

![Screenshot of user certificates directory](/.attachments/image-03724825-0c30-4e8b-a8bc-8090a6de553b.png)

![Screenshot of RSA keys directory](/.attachments/image-92f51fe5-dccc-4afe-8aa2-1f502a29959d.png)

The master key files are hidden files. Preferred means the current using master key.

![Screenshot of master key files](/.attachments/image-9148f27e-adbc-4b25-9629-5ae1c89f06d2.png)

Request a certificate for the current user, then check related information again:

![Screenshot of user personal store](/.attachments/image-f9be4792-fb80-4a00-97a9-cd83ed981f54.png)

![Screenshot of certificate thumbprint](/.attachments/image-3bb91a58-301a-4ae0-a77e-a2b096e55899.png)

![Screenshot of user certificate directory](/.attachments/image-fbac4263-2035-4361-9d8a-d310dbfd998a.png)

![Screenshot of RSA keys files](/.attachments/image-f75dc870-804c-4b81-97d0-330c1eb41fb3.png)

![Screenshot of mater keys files](/.attachments/image-563becc6-3353-46da-9cab-3d7ed625ebe9.png)

In Active Directory (AD), there is no related information uploaded.

![Screenshot of credentials roaming Attributes before update](/.attachments/image-f3a47750-1694-4862-814e-2dd7e524e33c.png)

Log off and log on again. This time, you can see the AD attributes are updated.

![Screenshot of updated AD attributes](/.attachments/image-28dbe12d-4c9d-4231-92cc-d8a19ab46b5b.png)

- `msPKIAccountCredentials` records the certificates and private keys.
- `msPKIDPAPIMasterKeys` records the master key files.
- `msPKIRoamingTimeStamp` records the time of the latest change of credential roaming.

Use the command line to check the update time when updating those attributes:

`Repadmin /showobjmeta cont-dc CN=test_user,CN=Users,DC=contoso,DC=com`

![Screenshot of Repadmin command output](/.attachments/image-8e1de3b5-715b-4f0d-b32c-9b57df1ca0d2.png)

Check the state file on client1. They are hidden files by default.

To keep credentials in the user object's `ms-PKI-AccountCredentials` attribute synchronous with the local certificate store, the credential roaming code maintains a state file. The state file is used to keep all information that is used to make roaming decisionswhether a credential should be uploaded to Active Directory or downloaded from Active Directory.

The `state.dat` is the current state file. The `state.da~` is the previous state file.
Path: `%LOCALAPPDATA%\Microsoft\DIMS`

![Screenshot of state files](/.attachments/image-56d3c366-0ebe-4c3a-9604-318f9e07f89b.png)

Log on to a second client machine with the same user. The related certificate information has been roamed:

![Screenshot of user personal store](/.attachments/image-5e24f1e4-25de-4d90-895c-03ffdc1278e9.png)

![Screenshot of user certificate directory](/.attachments/image-73d65afb-8e93-444d-88e3-d9ae4651f53c.png)

![Screenshot of RSA keys files](/.attachments/image-c8555d94-9343-4270-88b6-fc6a7560855a.png)

![Screenshot of master keys files](/.attachments/image-01811a14-bc39-4215-b070-fe89f7648a3a.png)

# Testing credential roaming

The proper way to test if credential roaming is working optimally is to:
1. Use a test user account instead of a production user account.
2. Back up your certificates by exporting them.
3. Log on as an administrator of the computer and delete the test user's profile.
4. Log off as an administrator.
