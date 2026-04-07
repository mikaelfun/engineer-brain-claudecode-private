# MFA Authentication Flow Troubleshooting Guide (TSG1)

> Source: OneNote - Philip AAD MFA Deep Dive (TSG1)
> Status: draft

## MFA Method Mapping Table

| MFA Method | Backend Manifestation | Troubleshooting Entry Point |
|------------|----------------------|---------------------------|
| **TOTP** (PhoneAppOtp) | ESTS: RequireMfaInCloud→MfaDoneInCloud; SAS: ValidateOtpForSapad [OtpIsMatch:T/F]; MSODS: GetDecryptedOathSecretKeyAsync; **No CAPP** | ① ESTS ErrorCode/MfaStatus ② SAS OtpIsMatch ③ OATH key decrypt status |
| **SMS** (OneWaySms) | ESTS: RequireMfaInCloud→MfaDoneInCloud; SAS: SendSmsRequestToCappAsync→CappResponse; CAPP: provider selection | ① ESTS ErrorCode ② SAS SMS delivery status ③ CAPP provider result ④ Final result only in ESTS |
| **Voice** (TwoWayVoiceMobile) | ESTS polls SAS ~5s; SAS: SendVoiceRequestToCappAsync→AuthApprovalState; CAPP: VoiceCallback→Approved/Failed | ① ESTS polling pattern ② SAS AuthApprovalState ③ CAPP call lifecycle ④ NoInputTimeout=user didn't press # |
| **Push** (PhoneAppNotification) | ESTS polls SAS; SAS: GeneratePushRequest→CAPP via ADGW; CAPP: APNs/FCM→SuccessfullySent; MAC reports result | ① ESTS polling ② SAS CappResponse+MobileAppCompletion ③ CAPP push delivery ④ CAPP only confirms delivery, not approve/deny |

## Quick Diagnostic Checklist

1. Get CorrelationId from user's sign-in error page (Error 500121 = MFA failure)
2. Check ESTS PerRequestTableIfx for ErrorCode and MfaStatus
3. Check SAS AllSASCommonEvents for method-specific signals
4. If SMS/Voice/Push → check CAPP AllCappLogEvents
5. For throttling issues → see TSG3

## Key Kusto Tables (21V)

| Service | Cluster | Database | Table |
|---------|---------|----------|-------|
| ESTS | estscnn2.chinanorth2.kusto.chinacloudapi.cn | ESTS | PerRequestTableIfx |
| MSODS | msodsmooncake.chinanorth2.kusto.chinacloudapi.cn | MSODS | IfxUlsEvents, IfxAuditLoggingCommon |
| SAS | idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn | idmfacne | AllSASCommonEvents, SASRequestEvent |
| AAD GW | idsharedmcbjb.chinanorth2.kusto.chinacloudapi.cn | AADGatewayProd | AllRequestSummaryEvents |
