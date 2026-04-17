---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/AD RMS/How To: AD RMS/How To: Mapping AIP keys to imported TPDs"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAD%20RMS%2FHow%20To%3A%20AD%20RMS%2FHow%20To%3A%20Mapping%20AIP%20keys%20to%20imported%20TPDs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Introduction
Customers may have multiple AD RMS Trusted Publishing Domain (TPD) files exported from AD RMS servers. This is one way to check the AIP keys to see if the AD RMS TPD has been imported.


# Scenario 1
A customer has imported AD RMS trusted publishing domain (TPD) key(s) in AIP and want to verify it is indeed imported.

In the AIP Service key [output](https://learn.microsoft.com/en-us/powershell/module/aipservice/get-aipservicekeys?view=azureipps), how do we map the AIPService Key Guid to an AD RMS key?  There are two ways.

## Mapping Key GUIDs to TPDs

We need either access to the AD RMS service DBs or a functioning AD RMS server to do this. If all we have is a TPD xml file we cannot do the mapping.

### Method 1 - Using SQL
1. Use SQL Server Management Studio to open the AD RMS configuration database.
2. In the AD RMS service configuration DB:
 - View the entries in the _dbo.DRMS_LicensorPrivateKey_ table. 
 - The _CertGUID_ value will map to the _KeyIdentifier_ value in AIPServiceKeys output.

### Method 2 - Using TUDs
1. If the AD RMS server is available export the corresponding Trusted User Domain (TUD) for the TPD in question. This results in a .bin file. 
2. Open the bin file in notepad and the GUID may be located. (It's not the first GUID in the file, but it will be in there).

# Scenario 2
A customer may have multiple keys in the AipService, be they imported TPDs from other RMS services, the default AADRM key, or BYOK keys added. Different keys may have been set to active/archived over time. One may wonder against which key a client has bootstrapped.

*Note:* By default most clients bootstrap about every 30 days. If the current key has been set to active in AIP for 30 days or more, then most clients should be bootstrapped using that new active key. 

## Mapping a client GIC to an AIP key
What is needed:
 - KeyIdentifier from active key (`Get-AipServiceKeys` output)
 - GIC*.drm file from the `%localappdata%\Microsoft\MSIPC` directory on desired client.

On the client, every time one either creates a piece of content, or consumes protected content, it must bootstrap against the AIP service. When bootstrapping the client obtains a GIC/CLC file pair from that service.

### Steps
1. Obtain the key identifier of the active AIP service key.
2. Open the user's GIC*.drm file in a text editor. Format it as XML if the editor allows.
3. The `MS-DRM-Server` `MS-GUID value` should reflect the key ID of the key used when obtaining the GIC.

*Note:* The service URL in the GIC also assists ensuring this GIC is from the desired service (not some other tenant).

# Scenario 3
Which key encrypted my content? This is not an easy one to determine. There is not a PowerShell cmdlet to facilitate this ask. The only method for which I could discover is brute force. This method works for Office documents. I do not know of a way to do an encrypted email. 

## Mapping an encrypted content key to AIP Service Key
What is needed:
 - KeyIdentifier from active key (`Get-AipServiceKeys` output)
 - DRM Server GUID from the encrypted file's Xrml data.

Encrypted content is in an Xrml blob. We may open the encrypted file (not decrypted) in a text editor. We search the XML for the RMS key GUID. 

### Steps

1. Obtain the key identifiers of the AIP service keys.
2. Open the encrypted file in Notepad (or your preferred text editor).  
3. Search for the AIP Service key identifier GUIDs until you find a match. The example below is a protected Word document. 
4. Match the GUID from the keys to the GUID in the XRML. There is the key used to encrypt that piece of content.
