---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/ADFS and WAP/ADFS Workflow - Check sign-in using IdpInitiatedSignOn"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FADFS%20and%20WAP%2FADFS%20Workflow%20-%20Check%20sign-in%20using%20IdpInitiatedSignOn"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ADFS Workflow - Check Sign-in Using IdpInitiatedSignOn

IdpInitiatedSignOn can quickly verify if AD FS service is up and running and authentication is working correctly.

## Steps

1. Log-in to the AD FS server

2. Open PowerShell

3. Check if the ADFS sign on page is enabled:
   ```powershell
   Get-AdfsProperties | Select-Object EnableIdpInitiatedSignonpage
   ```
   If not enabled:
   ```powershell
   Set-AdfsProperties -EnableIdPInitiatedSignonPage $true
   ```

4. Log-in to the machine you want to test

5. Open a private browser session

6. Navigate to: `https://<federation service fqdn>/adfs/ls/idpinitiatedsignon.aspx`
   - Example: `https://fs.contoso.com/adfs/ls/idpinitiatedsignon.aspx`

7. Enter correct credentials of a valid user on the log-in page

8. In case of no-error, sign-in succeeds.

## Notes

- If the IdpInitiatedSignOn page is not loading, check DNS resolution and ADFS service status first.
- Reference: https://support.microsoft.com/en-us/help/3044971/adfs-2.0-error-this-page-cannot-be-displayed
