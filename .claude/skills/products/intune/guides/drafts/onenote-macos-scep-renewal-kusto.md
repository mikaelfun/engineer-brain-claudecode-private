# macOS SCEP Certificate Renewal Flow - Kusto Queries

## Scenario
Troubleshoot macOS device SCEP certificate renewal, verify SSL client certificate authentication, and track certificate issuance.

## Kusto Queries

### 1. Verify SSL Client Certificate Authentication
```kusto
IntuneEvent
| where env_time between (datetime(<start>) .. datetime(<end>))
| where SourceNamespace == "IntuneCNP"
| where ComponentName == "FabricAuthenticationModule"
| where ServiceName == "DeviceGatewayProxy"
| where Col3 has '<intune-device-id>'
| extend deviceId = extract("DeviceId=([[:alnum:]-_.]+),", 1, Col3, typeof(string))
| extend accountId = extract("AccountId=([[:alnum:]-_.]+)", 1, Col3, typeof(string))
| extend userId = extract("UserId=([[:alnum:]-_.]+),", 1, Col3, typeof(string))
| where deviceId == '<intune-device-id>'
| project env_time, Col3
```

**Key output**: Look for `ReceivedCallWithSslClientCertificate,<thumbprint>,CN=<device-id>` followed by `UdaCertificateValidatedSuccessfully`.

### 2. Track Certificate Renewal Events
```kusto
DeviceLifecycle
| where TaskName == "EnrollmentRenewDeviceEvent"
| where deviceId == '<intune-device-id>'
| project env_time, TaskName, oldThumbprint, oldManagementState, newManagementState, newThumbprint
```

### 3. Track Certificate Issuance
```kusto
IntuneEvent
| where env_time > datetime(<start>) and env_time < datetime(<end>)
| where ServiceName == "CertificateAuthority"
| where ActivityId == "<intune-device-id>"
| where EventUniqueName startswith "CosmosPutCert"
| project env_time, ServiceName, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, env_cloud_environment, ActivityId, env_cloud_roleInstance
```

### 4. Verify Renewal Success
```kusto
IntuneEvent
| where env_time > ago(90d)
| where DeviceId == "<intune-device-id>"
| where * contains "<certificate-thumbprint>"
| project env_time, env_cloud_name, ComponentName, ApplicationName, EventUniqueName, ActivityId, Message, ColMetadata, Col1, Col4, Col2, Col3, Col5, Col6
```

## Expected Renewal Flow
1. Device connects with existing SSL client certificate (UDA cert)
2. `FabricAuthenticationModule` validates the certificate -> `UdaCertificateValidatedSuccessfully`
3. `CertificateAuthority` issues new certificate -> `IssueCertSuccess`
4. `EnrollmentSessionManager` processes SCEP renewal challenge -> `TryAddEnrollmentSessionStateDetails_WriteComplete`
5. `EnrollmentLibrary` confirms -> `DeviceRenewalSuccess`

## Key Fields
- **CHALLENGETYPE**: `RenewalScep - 3` indicates renewal (not fresh enrollment)
- **ISRENEWAL**: `True` confirms this is a renewal flow
- **CURRENTCERTIFICATETHUMBPRINT**: The old cert being renewed
- **IssueCertSuccess Col4**: New certificate thumbprint

## Source
Case 2308100060001116
