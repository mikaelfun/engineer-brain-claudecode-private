---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Hello for Business/Common scenarios/P3 Device registration failing"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FStrongAuth%20Passwordless%28WHfB%20FIDO%20phone%20based%29%2FHello%20for%20Business%2FCommon%20scenarios%2FP3%20Device%20registration%20failing"
importDate: "2026-04-06"
type: troubleshooting-guide
---

### Device registration failing

All devices included in the Windows Hello for Business deployment must go through device registration. Device registration enables devices to authenticate to identity providers. For cloud only and hybrid deployment, the identity provider is Azure Active Directory. For on-premises deployments, the identity provider is the on-premises server running the Windows Server 2016 Active Directory Federation Services (AD FS) role.

Actions: Verify device registration is valid using **dsregcmd /status** and the event logs "Application and Service Logs > Microsoft > Windows > User Device Registration"

See [Device registration/Troubleshooting Windows 10 Automatic Device Registration](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184298) for more steps.

-----

##### Sample output of a Hybrid deployment using certificate trust

```
+----------------------------------------------------------------------+
| Device State                                                         |
+----------------------------------------------------------------------+

          AzureAdJoined : YES
       EnterpriseJoined : NO
               DeviceId : aef932ab-####-####-####-############
             Thumbprint : 3743401690ADFC7360F7B04A6AE8E9C2838AF7A8
         KeyContainerId : a628eabb-e43b-469e-ac14-b42de05263b8
            KeyProvider : Microsoft Software Key Storage Provider
           TpmProtected : NO
           KeySignTest: : MUST Run elevated to test.
                    Idp : login.windows.net
               TenantId : 362e4e16-####-####-####-############
             TenantName : contoso.com (Hybrid WHFB)
            AuthCodeUrl : https://login.microsoftonline.com/362e4e16-####-####-####-############/oauth2/authorize
         AccessTokenUrl : https://login.microsoftonline.com/362e4e16-####-####-####-############/oauth2/token
                 MdmUrl : 
              MdmTouUrl : 
       MdmComplianceUrl : 
            SettingsUrl : ...
         JoinSrvVersion : 1.0
             JoinSrvUrl : https://enterpriseregistration.windows.net/EnrollmentServer/device/
              JoinSrvId : urn:ms-drs:enterpriseregistration.windows.net
          KeySrvVersion : 1.0
              KeySrvUrl : https://enterpriseregistration.windows.net/EnrollmentServer/key/
               KeySrvId : urn:ms-drs:enterpriseregistration.windows.net
     WebAuthNSrvVersion : 1.0
         WebAuthNSrvUrl : https://enterpriseregistration.windows.net/webauthn/362e4e16-####/
          WebAuthNSrvId : urn:ms-drs:enterpriseregistration.windows.net
           DomainJoined : YES
             DomainName : CORP

+----------------------------------------------------------------------+
| User State                                                           |
+----------------------------------------------------------------------+

                 NgcSet : YES
               NgcKeyId : {9D612EB1-FB35-4058-B659-03881E754972}
               CanReset : NO
        WorkplaceJoined : NO
          WamDefaultSet : YES
    WamDefaultAuthority : organizations
           WamDefaultId : https://login.microsoft.com
         WamDefaultGUID : {B16898C6-A148-4967-9171-64D755DA8520} (AzureAd)
             AzureAdPrt : YES
    AzureAdPrtAuthority : https://login.microsoftonline.com/362e4e16-####
          EnterprisePrt : YES
 EnterprisePrtAuthority : https://adfs.contoso.com:443/adfs
```

**Key differences: cert trust vs key trust**
- Certificate trust: Both `AzureAdPrt` and `EnterprisePrt` should be YES
- Key trust: `AzureAdPrt` = YES, `EnterprisePrt` = NO (no enterprise PRT needed)
