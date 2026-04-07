---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box/Export Jobs/Assistance with creation of XML file"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%2FExport%20Jobs%2FAssistance%20with%20creation%20of%20XML%20file"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Assistance with creation of XML file

## Description / Overview

A file with the .xml file extension is an Extensible Markup Language (XML) file. These are really just plain text files that use custom tags. If the customer uses an XML file, they can specify specific containers and blobs (page and block) they want to export.

## How it works

Customer will need to follow the Sample XML file table specifications for formatting their XML. The following xml shows an example of blob names, blob prefixes, and Azure Files contained in the xml format that the export order uses when you select the use XML file option.

> Some important points in respect to xml files:
> - Xml tags are case sensitive and need to match exactly as specified in the above sample.
> - Opening and closing tags must match.
> - Incorrect xml tags or formatting may lead to data export failure.
> - No data will be exported if blob and/or file prefix are invalid.

## Reference Documentation

[Tutorial to export data from Azure Data Box | Microsoft Learn](https://learn.microsoft.com/en-us/azure/databox/data-box-deploy-export-ordered?tabs=sample-xml-file#create-xml-file)
