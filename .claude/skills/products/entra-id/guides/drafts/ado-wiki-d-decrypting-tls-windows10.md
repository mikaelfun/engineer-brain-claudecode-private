---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/ADFS and WAP/Decrypting TLS in Windows 10"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FADFS%20and%20WAP%2FDecrypting%20TLS%20in%20Windows%2010"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-adfs
- cw.adfs troubleshooting
- SCIM Identity
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
# Decrypting TLS in Windows 10

**Note**: This variable is only available on Chrome and Firefox

Create an environment variable on your machine where you are taking the trace
with Wireshark.

Powershell

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Code Language
$env:SSLKEYLOGFILE = 'C:\temp\ssl-keys.log'
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Configure Wireshark to use the ssl-keys.log file

Set the following in Wireshark:

![](/.attachments/AAD-Authentication/585074/b19b6585c313a4b488ba7b4de93c9bc0.png)

To generate keys for the ssl-keys.log file.

1.  Start capture then start Chrome.

2.  Reproduce issue.

3.  Close browser when done.

4.  Stop trace.

If you look at the ssl-keys.log file it should have data in it, and the streams
will have decrypted data.

Leave the environment variable in place to keep capture keys every time you use
chrome. Over time you will amass a large collection. This can expedite future
decryption on the same machine.
