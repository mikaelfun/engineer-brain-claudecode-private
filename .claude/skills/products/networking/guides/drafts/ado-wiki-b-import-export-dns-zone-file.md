---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/Azure (Public) DNS zones/Import and Export a DNS Zone File Using the Azure Portal"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FImport%20and%20Export%20a%20DNS%20Zone%20File%20Using%20the%20Azure%20Portal"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Import and Export a DNS Zone File Using the Azure Portal

## Overview

A DNS zone file is a standard text file containing all DNS records in a zone. Azure DNS supports importing and exporting zone files via the Azure CLI and Azure Portal.

## Obtaining Your Existing DNS Zone File

- **Partner service / registrar**: Use their export/download feature.
- **Windows DNS**: Default path `%systemroot%\system32\dns` (also shown on the General tab in DNS console).
- **BIND**: Location specified in `named.conf`.

> **Important**: If the zone file contains CNAME entries pointing to names in another private zone, Azure DNS resolution of the CNAME will fail unless the other zone is also imported or the CNAME entries are modified.

## Import Behavior (Merge Semantics)

- Import **merges** records with existing record sets; does not replace the zone.
- Identical records are not duplicated.
- Pre-existing record sets use their existing TTL.
- SOA parameters (except `host`) are taken from the imported zone file.
- An imported CNAME does not replace an existing CNAME with the same name.
- Supported record types: A, AAAA, CAA, CNAME, MX, NS, SOA, SRV, TXT.
- `$INCLUDE` and `$GENERATE` directives are **not** supported.
- Syntax validation happens on import start; unsupported/invalid records flagged immediately; import can still proceed.
- Export **not allowed** if record sets in zone > 500k.

## Import Steps (Azure Portal)

1. Open the target DNS zone in Azure Portal.
2. Click **Import** at the top of the Overview page.
3. Browse for the zone file (`.txt` or `.zone`) or paste content into the editor.
4. Review records → click **Review + Create**.
5. Review the DNS Zone diff viewer showing differences between old and new records.
6. Click **Create** — the current zone is downloaded as a backup automatically.
7. Deployment proceeds; success/failure notification shown.

## Export Steps (Azure Portal)

1. Open the existing DNS zone in Azure Portal.
2. Click **Export** — immediately downloads the zone file as `{zonename}.txt`.
3. Large zone files may take longer to download.

## Additional Notes

- `$TTL` directive is optional; records without explicit TTL default to 3600s.
- `$ORIGIN` is optional; defaults to zone name (with trailing `.`).
- During Public Preview: only single-string TXT records supported; multistring TXT records concatenated and truncated to 255 characters.

## References

- [Manage record sets and records](https://learn.microsoft.com/en-us/azure/dns/dns-getstarted-cli)
- [Delegate your domain to Azure DNS](https://learn.microsoft.com/en-us/azure/dns/dns-getstarted-cli)
