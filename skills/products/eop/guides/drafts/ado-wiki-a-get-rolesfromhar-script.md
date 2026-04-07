---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/MDO Permissions/SCRIPT: Get-RolesFromHar - Review MDO roles from a HAR trace"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FMDO%20Permissions%2FSCRIPT%3A%20Get-RolesFromHar%20-%20Review%20MDO%20roles%20from%20a%20HAR%20trace"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# SCRIPT: Get-RolesFromHar - Review MDO roles from a HAR trace

## Purpose
PowerShell cmdlet to parse HAR files for RBAC permission analysis. Faster than reviewing customer config in Entra, ExO and the Defender portal.

## Use Cases
- Quickly review AAD (Entra), UCC (MDO), ExO and XDR roles
- Compare AAD roles vs. ExO cmdlets: if ExO cmdlets missing, maybe Entra>ExO sync hasn't worked (esp. via PIM)
- Find why something works via PowerShell but not in portal (ExO cmdlet present but UCC roles missing)

## Usage
```powershell
# Load the script in PowerShell ISE (F5) or run .ps1 file
# Then use:
Get-RolesFromHar 'c:\Data\MyHar.har'
```

## Menu Options
1. **AAD (Entra) roles** - check Entra directory roles
2. **UCC (MDO) roles** - check MDO/Defender portal roles
3. **ExO roles** - check Exchange Online cmdlet permissions
4. **XDR roles** - check Microsoft XDR URBAC permissions
5. **Search (s)** - plain text search across all role types
6. **RegEx search (r)** - regex pattern matching
7. **User & tenant info (u)** - logged-on user and tenant details

## Key Notes
- 'Cached' entries come from `/api/v2/auth/GetCachedRoles` calls
- 'Fetched' entries come from `/api/auth/IsInRoles` calls
- If entries are missing, customer needs to collect new HAR from full page refresh (F5)
- XDR roles supersede UCC and ExO roles, but not AAD roles
- Detects dehydrated tenants (suggests `Enable-OrganizationCustomization`)

## Example Searches
```
# Plain text search
get-reports  ->  finds exo:Get-ReportSubmissionPolicy, etc.

# Regex search
mdo.*xdr  ->  finds URBAC MDO XDR permissions

# Complex regex
exo.?Get-(Safe|Hosted|Malware|Phish).*policy  ->  finds specific policy cmdlets
```
