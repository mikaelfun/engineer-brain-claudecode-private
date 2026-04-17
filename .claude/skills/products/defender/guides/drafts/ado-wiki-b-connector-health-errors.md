---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Connector Health/Connector Health Errors"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FMicrosoft%20Sentinel%20Wiki%2FConnector%20Health%2FConnector%20Health%20Errors"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Connector Health Errors

Comprehensive error code reference for Sentinel connector health issues with explanations and mitigation steps.

## Office365 / OfficeATP / Dynamics365

| Error Code | Description | Root Cause | Mitigation |
|---|---|---|---|
| O365ManagementAPIDisabled | The O365 Management API is disabled | Tenant lacks active O365 account | Follow [Connect Office 365](https://docs.microsoft.com/en-us/azure/sentinel/connect-office-365) |
| SC20011 | Tenant does not exist in O365 Management API | Unified auditing not enabled | [Enable unified auditing](https://docs.microsoft.com/en-us/microsoft-365/compliance/turn-audit-log-search-on-or-off) |
| AADTenantNotExist | No O365 Management API subscription | No O365 account for tenant | Follow [Connect Office 365](https://docs.microsoft.com/en-us/azure/sentinel/connect-office-365) |

## AWS CloudTrail

| Error Code | Description | Root Cause | Mitigation |
|---|---|---|---|
| AWSSTSNotAuthorized / S3B40023 | Not authorized to get STS token | ARN account not authorized | Get ARN Role from `ExtendedProperties.AwsRoleArn` in SentinelHealth, review permissions. [Connect AWS](https://docs.microsoft.com/en-us/azure/sentinel/connect-aws) |
| SCT40301 | Not authorized to query CloudTrail API | Insufficient permissions | Same as above |

## AWS S3

| Error Code | Description | Root Cause | Mitigation |
|---|---|---|---|
| S3B40012 | Failed to get SQS credential | SQS was deleted | Delete connector and recreate, or create new SQS with required policy |
| S3B40014 | SQS access denied | Missing SQS permissions | Add SQS:ChangeMessageVisibility, DeleteMessage, ReceiveMessage, GetQueueUrl to policy |
| S3B40015 | SQS queue does not exist | Wrong region | Verify SQS exists in user's region |
| S3B40021 | S3 object not found | Object missing or wrong event notification config | Verify object exists; check S3 event notification prefix/suffix settings |
| S3B40023 | S3 object access denied | Missing S3/KMS permissions | Add s3:GetObject to bucket policy; for encrypted data, add kms:Decrypt, kms:DescribeKey |
| S3B40025 | SQS message missing Records token | Non-standard schema | Configure S3 event notification to only send required records (set correct prefix/suffix) |
| S3B40026 | Exception converting message to JSON | Mixed data formats in SQS | Ensure single data format in S3 folder (all compressed or not, all same format) |
| S3B40009 | Malformed config | Internal error | Determine what change caused malformed config |
| S3B40020 | S3 download exceeded time limit | File too large | Consider smaller S3 blobs |
| S3B40028 | S3 object exceeds max supported size | File too large | Same as above |

## Threat Intelligence (TAXII)

| Error Code | Description | Root Cause | Mitigation |
|---|---|---|---|
| Forbidden/Unauthorized | Auth failure | Invalid credentials | Verify and update TAXII server credentials |
| PaymentRequired | Access denied | Polling frequency exceeds quota | Reduce polling frequency to within throttling limits |
| InternalServerError | Server error | TAXII server down | Check server availability |
| NotFound | Server/collection not found | Wrong URL or collection ID | Verify TAXII server endpoint URL and collection ID |
| PermanentRedirect | Server moved | New location | Update connector definition with new address |
| TemporaryRedirect | Temporary move | Temporary relocation | May self-resolve; update URL if persistent |
| NotAcceptable | Unexpected Accept header | Header mismatch | Check server compatibility with TAXII 2.0/2.1 Accept headers |
| ServiceUnavailable/Moved/BadGateway | Server unavailable | Server or config issue | Check server availability and connector definition |

## Google Cloud Platform (GCP)

| Error Code | Description | Root Cause | Mitigation |
|---|---|---|---|
| GCPB40013 | Workload Identity Pool not found/disabled | Pool deleted or disabled | Re-enable or recreate in GCP WI Federation. [Setup guide](https://learn.microsoft.com/en-us/azure/sentinel/connect-google-cloud-platform) |
| GCPB40014 | Service Account not found/disabled | SA deleted or disabled | Recreate per [documentation](https://learn.microsoft.com/en-us/azure/sentinel/connect-google-cloud-platform) |
| GCPB40015 | Project Number not found | Wrong project number | Verify project number (numbers only) in GCP main page |
| GCPB40016 | Workload Identity Provider not found/disabled | Provider deleted or disabled | Recreate and ensure "Enable provider" is on |
| GCPB40030 | Wrong Issuer URL | Provider misconfigured | Set Issuer URL to `https://sts.windows.net/33e01921-4d64-4f8c-a055-5bdaffd5e33d` |
| GCPB40031 | Wrong Audience | Provider misconfigured | Set Audience 1 to `https://2041288c-b303-4ca0-9076-9612db3beeb2` |
| GCPB40032 | SA not connected to WI Pool | Missing connection | Grant access via [documentation](https://learn.microsoft.com/en-us/azure/sentinel/connect-google-cloud-platform) |
