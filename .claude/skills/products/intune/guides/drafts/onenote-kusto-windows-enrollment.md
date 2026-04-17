# Kusto Queries for Windows Enrollment Troubleshooting

> Source: OneNote MCVKB/Intune/Kusto/Windows Enrollment.md
> Quality: guide-draft (pending SYNTHESIZE review)

## Key Tables

### DeviceLifecycle
Track enrollment lifecycle events by device or user:
```kql
DeviceLifecycle
| where userId == "<user-id>"
| project env_time, I_Srv, scenarioType, scenarioInstanceId, ActivityId, TaskName,
  sessionId, accountId, userId, aadDeviceId, type, platform, version,
  newThumbprint, accountContextId, oldManagementState, newManagementState,
  oldRegistrationState, newRegistrationState
```

**Platform codes:**
- `3` = Windows
- `10` = Mac

### EnrollmentSoapProvider
Get Windows enrollment SOAP details using ActivityId from DeviceLifecycle (ScenarioType = Enrollment/MobileWindows):
```kql
EnrollmentSoapProvider
| where ActivityId == "<activity-id-from-DeviceLifecycle>"
| project env_time, I_Srv, scenarioType, TaskName, requestDetails, platform, version
```

### IntuneEvent
Deep-dive into enrollment events:
```kql
IntuneEvent
| where env_time >= ago(29d)
| where ActivityId == "<activity-id>"
| project env_time, UserId, ActivityId, DeviceId, AccountId, ContextId,
  PayLoadId, ComponentName, EventUniqueName, ColMetadata,
  Col1, Col2, Col3, Col4, Col5, Col6, Message
```

## Key Fields to Check
- **TokenIssuer**: Verify correct token issuer (e.g., UserTokenFromAzureADTokenIssuer)
- **Audience**: Check enrollment endpoint (e.g., `https://enrollment.manage.microsoftonline.cn/` for 21v)
- **MDMAuthority**: Should be "Intune"
- **EnrollmentType**: AutoEnrollment=8/10, indicates auto-enrollment
- **IsOpenForEnrollment**: Must be true
- **IntuneLicenced**: Must be true for enrollment to succeed

## 21v (Mooncake) Specific
- Login endpoint: `login.partner.microsoftonline.cn`
- Enrollment endpoint: `enrollment.manage.microsoftonline.cn`
