---
title: "Intune Certificate Connector Event IDs and Diagnostic Codes Reference"
source: mslearn
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/mem/intune/certificates/troubleshoot-certificate-connector-events"
product: intune
tags: [certificates, connector, event IDs, diagnostic codes, reference]
---

# Intune Certificate Connector Event IDs and Diagnostic Codes

Reference table for events logged by Intune Connector Service in Event Viewer under **Applications and Services Logs > Microsoft Intune Connector** (version 6.1806.x.x+).

## Event IDs

| Event ID | Name | Description |
|----------|------|-------------|
| 10010 | StartedConnectorService | Connector service started |
| 10020 | StoppedConnectorService | Connector service stopped |
| 10100 | CertificateRenewal_Success | Enrollment cert renewed successfully |
| 10102 | CertificateRenewal_Failure | Enrollment cert failed to renew - reinstall connector |
| 10302 | RetrieveCertificate_Error | Failed to retrieve enrollment cert from registry |
| 20100 | PkcsCertIssue_Success | PKCS certificate issued successfully |
| 20102 | PkcsCertIssue_Failure | Failed to issue PKCS certificate |
| 20200 | RevokeCert_Success | Certificate revoked successfully |
| 20202 | RevokeCert_Failure | Failed to revoke certificate |
| 20300 | Upload_Success | Certificate data uploaded successfully |
| 20302 | Upload_Failure | Failed to upload certificate data |
| 20400 | Download_Success | Request downloaded successfully |
| 20402 | Download_Failure | Failed to download request |
| 20500 | CRPVerifyMetric_Success | CRP verified client challenge |
| 20501 | CRPVerifyMetric_Warning | CRP completed but rejected request |
| 20502 | CRPVerifyMetric_Failure | CRP failed to verify client challenge |
| 20600 | CRPNotifyMetric_Success | CRP notify process completed |
| 20602 | CRPNotifyMetric_Failure | CRP notify process failed |

## Diagnostic Codes

| Code | Name | Meaning |
|------|------|---------|
| 0x00000000 | Success | Operation completed |
| 0x00000400 | PKCS_Issue_CA_Unavailable | CA is unreachable |
| 0x00000401 | Symantec_ClientAuthCertNotFound | Symantec/DigiCert RA cert missing |
| 0x00000402 | RevokeCert_AccessDenied | Account lacks revoke permissions |
| 0x00000403 | CertThumbprint_NotFound | No matching certificate found |
| 0x00000404 | Certificate_NotFound | Certificate not found |
| 0x00000405 | Certificate_Expired | Certificate expired - re-enroll connector |
| 0x00000408 | CRPSCEPCert_NotFound | CRP Encryption cert missing |
| 0x00000409 | CRPSCEPSigningCert_NotFound | Signing cert not found |
| 0x00000410 | CRPSCEPDeserialize_Failed | Failed to deserialize SCEP challenge |
| 0x00000411 | CRPSCEPChallenge_Expired | Challenge expired - device can retry |
| 0x0FFFFFFF | Unknown_Error | Server-side error |

## Quick Diagnostic Steps

1. Open Event Viewer > Applications and Services Logs > Microsoft Intune Connector
2. Filter by Event IDs 20102, 20202, 20302, 20502 for failures
3. Check diagnostic code in event details
4. Cross-reference with table above for resolution guidance
