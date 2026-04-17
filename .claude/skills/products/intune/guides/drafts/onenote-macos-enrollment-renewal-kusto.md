# macOS Device Enrollment Certificate Renewal Investigation (Kusto)

> Source: Case 2308100060001116 | Device Enroll -renew
> Status: draft (pending SYNTHESIZE review)

## Step 1: Verify SCEP Certificate & SSL Client Auth

```kusto
IntuneEvent
| where env_time between (datetime(<start>) .. datetime(<end>))
| where SourceNamespace == "IntuneCNP"  // adjust for environment
| where ComponentName == "FabricAuthenticationModule"
| where ServiceName == "DeviceGatewayProxy"
| where Col3 has '<intune-device-id>'
| extend deviceId = extract("DeviceId=([[:alnum:]-_.]+),", 1, Col3, typeof(string))
| extend accountId = extract("AccountId=([[:alnum:]-_.]+)", 1, Col3, typeof(string))
| extend userId = extract("UserId=([[:alnum:]-_.]+),", 1, Col3, typeof(string))
| where deviceId == '<intune-device-id>'
| project env_time, Col3
```

Key indicators in Col3:
- `ReceivedCallWithSslClientCertificate,<thumbprint>,CN=<device-id>` — device presenting its SCEP cert
- `UdaCertificateValidatedSuccessfully` — cert validation passed
- `SetHttpContextItems` — routing info established

## Step 2: Track Certificate Issuance

```kusto
IntuneEvent
| where env_time between (datetime(<start>) .. datetime(<end>))
| where ServiceName == "CertificateAuthority"
| where ActivityId == "<intune-device-id>"
| where EventUniqueName startswith "CosmosPutCert"
| project env_time, ServiceName, EventUniqueName, ColMetadata,
          Col1, Col2, Col3, Col4, env_cloud_environment,
          ActivityId, env_cloud_roleInstance
```

Look for `IssueCertSuccess` with:
- Col1 = IssueDate
- Col2 = certExpirationDate
- Col3 = CertThumbprint
- Col4 = IntermediateCert

## Step 3: Verify Enrollment Renewal

```kusto
DeviceLifecycle
| where TaskName == "EnrollmentRenewDeviceEvent"
| where deviceId == '<intune-device-id>'
| project env_time, TaskName, oldThumbprint, oldManagementState,
          newManagementState, newThumbprint
```

## Step 4: Track Enrollment Session State

```kusto
IntuneEvent
| where env_time > ago(90d)
| where DeviceId == "<intune-device-id>"
| where * contains "<certificate-thumbprint>"
| project env_time, env_cloud_name, ComponentName, ApplicationName,
          EventUniqueName, ActivityId, Message, ColMetadata,
          Col1, Col4, Col2, Col3, Col5, Col6
```

Key EventUniqueNames:
- `TryAddEnrollmentSessionStateDetails_WriteComplete` — session state recorded
- `DeviceRenewalSuccess` — renewal completed successfully

## Enrollment Attributes to Check

- `ISRENEWAL: True` — confirms this is a renewal flow
- `CHALLENGETYPE: RenewalScep - 3` — SCEP renewal challenge
- `CURRENTCERTIFICATETHUMBPRINT` — old cert being renewed
- `ENROLLMENTTYPE` — e.g., AppleBulkEnrollmentModernAuth
