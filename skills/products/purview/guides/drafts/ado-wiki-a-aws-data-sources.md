---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Scanning/Creating Data sources/AWS data sources"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FScanning%2FCreating%20Data%20sources%2FAWS%20data%20sources"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AWS Data Sources for Purview Scanning

Currently Purview scanning supports 2 AWS data types:

## 1. Amazon S3 Bucket
- Storage service similar to Azure Blob Storage
- Contains unstructured data
- Register via Data sources > Amazon S3

## 2. AWS Account (Multi-resource scan)
- Scans all S3 buckets in a certain AWS account
- Register via Data sources > AWS account
- Selecting specific buckets to scan from the account is a feature about to release
