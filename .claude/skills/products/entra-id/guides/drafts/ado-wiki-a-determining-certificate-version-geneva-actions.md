---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Customer LockBox/Specific Issues/Determining which certificate version Geneva Actions is using"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FCustomer%20LockBox%2FSpecific%20Issues%2FDetermining%20which%20certificate%20version%20Geneva%20Actions%20is%20using"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Determining which certificate version Geneva Actions is using

There may be cases where you want to find out which certificate version Geneva Actions is using or any other case where Geneva Actions logs might be helpful in troubleshooting an operation result.

## Steps

1. Get the ActivityId GUID from the Geneva Actions UI
2. Update the ActivityId in the logs query (also update the time range)
3. Query URL: https://jarvis-west.dc.ad.msft.net/DB30D44F

## Sample Output

A sample log showing Geneva Actions using a new version of certificate thumbprint that has been created during cert rotation drill can be found in the wiki page attachments.
