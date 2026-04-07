# AVD - Knowledge Conflict Detection Report

**Generated**: 2026-04-07 | **Total conflicts**: 9


| # | Topic | Type | Source A | Source B | Sim | Judgment | Recommendation |
|---|-------|------|---------|---------|-----|----------|----------------|
| conflict-001 | avd-domain-join-1 | 21v_conflict | avd-ado-wiki-199(ado-wiki) | avd-mslearn-024(mslearn) | 0.36 | context_dependent | Annotate with 21V applicability conditions |
| conflict-002 | avd-host-pool-scaling-1 | rootcause_conflict | avd-contentidea-kb-010(contentidea-kb) | avd-mslearn-039(mslearn) | 0.62 | context_dependent | Prefer contentidea-kb (weight 3), mark other as alt |
| conflict-003 | avd-host-pool-scaling-1 | rootcause_conflict | avd-contentidea-kb-011(contentidea-kb) | avd-mslearn-039(mslearn) | 0.53 | context_dependent | Prefer contentidea-kb (weight 3), mark other as alt |
| conflict-004 | general-other | 21v_conflict | avd-ado-wiki-0861(ado-wiki) | avd-mslearn-040(mslearn) | 0.36 | context_dependent | Annotate with 21V applicability conditions |
| conflict-005 | general-other | 21v_conflict | avd-ado-wiki-0862(ado-wiki) | avd-mslearn-040(mslearn) | 0.37 | context_dependent | Annotate with 21V applicability conditions |
| conflict-006 | general-other | 21v_conflict | avd-ado-wiki-0862(ado-wiki) | avd-mslearn-052(mslearn) | 0.37 | context_dependent | Annotate with 21V applicability conditions |
| conflict-007 | avd-deployment-arm-2 | 21v_conflict | avd-contentidea-kb-007(contentidea-kb) | avd-mslearn-043(mslearn) | 0.42 | context_dependent | Annotate with 21V applicability conditions |
| conflict-008 | avd-conditional-access-conditional-access | 21v_conflict | avd-ado-wiki-0857(ado-wiki) | avd-mslearn-002(mslearn) | 0.4 | context_dependent | Annotate with 21V applicability conditions |
| conflict-009 | avd-conditional-access-conditional-access | 21v_conflict | avd-mslearn-002(mslearn) | avd-onenote-026(onenote) | 0.44 | context_dependent | Annotate with 21V applicability conditions |

---

## Details

### conflict-001 - avd-domain-join-1
- **Type**: 21v_conflict | **Severity**: high
- **A**: `avd-ado-wiki-199` (ado-wiki)
  Symptom: Connection to Azure AD joined VM fails with error 'We couldn't connect to the remote PC because of a security error'
- **B**: `avd-mslearn-024` (mslearn)
  Symptom: Entra joined VM: 'Your account is configured to prevent you from using this device'
- **Judgment**: context_dependent
- **Reasoning**: 21vApplicable differs: avd-ado-wiki-199=True, avd-mslearn-024=False
- **Recommendation**: Annotate with 21V applicability conditions

### conflict-002 - avd-host-pool-scaling-1
- **Type**: rootcause_conflict | **Severity**: medium
- **A**: `avd-contentidea-kb-010` (contentidea-kb)
  Symptom: WVD host pool deployment fails with ResourceDeploymentFailure WinRM related.
- **B**: `avd-mslearn-039` (mslearn)
  Symptom: Host pool deployment fails with Exceeding quota limit
- **Judgment**: context_dependent
- **Reasoning**: Same symptom (sim=0.62) but different root causes
- **Recommendation**: Prefer contentidea-kb (weight 3), mark other as alt

### conflict-003 - avd-host-pool-scaling-1
- **Type**: rootcause_conflict | **Severity**: medium
- **A**: `avd-contentidea-kb-011` (contentidea-kb)
  Symptom: WVD host pool deployment fails: User not authorized and Host pool does not exist in Tenant.
- **B**: `avd-mslearn-039` (mslearn)
  Symptom: Host pool deployment fails with Exceeding quota limit
- **Judgment**: context_dependent
- **Reasoning**: Same symptom (sim=0.53) but different root causes
- **Recommendation**: Prefer contentidea-kb (weight 3), mark other as alt

### conflict-004 - general-other
- **Type**: 21v_conflict | **Severity**: high
- **A**: `avd-ado-wiki-0861` (ado-wiki)
  Symptom: Error message when navigating to AVD Per-User Access Pricing page in Azure portal, or after trying to enroll a subscript
- **B**: `avd-mslearn-040` (mslearn)
  Symptom: User assignments not visible after moving subscription between Entra tenants
- **Judgment**: context_dependent
- **Reasoning**: 21vApplicable differs: avd-ado-wiki-0861=False, avd-mslearn-040=True
- **Recommendation**: Annotate with 21V applicability conditions

### conflict-005 - general-other
- **Type**: 21v_conflict | **Severity**: high
- **A**: `avd-ado-wiki-0862` (ado-wiki)
  Symptom: Customer enrolled an Azure subscription in AVD per-user access pricing but the Azure portal still shows 'Enrolling' stat
- **B**: `avd-mslearn-040` (mslearn)
  Symptom: User assignments not visible after moving subscription between Entra tenants
- **Judgment**: context_dependent
- **Reasoning**: 21vApplicable differs: avd-ado-wiki-0862=False, avd-mslearn-040=True
- **Recommendation**: Annotate with 21V applicability conditions

### conflict-006 - general-other
- **Type**: 21v_conflict | **Severity**: high
- **A**: `avd-ado-wiki-0862` (ado-wiki)
  Symptom: Customer enrolled an Azure subscription in AVD per-user access pricing but the Azure portal still shows 'Enrolling' stat
- **B**: `avd-mslearn-052` (mslearn)
  Symptom: User loses feed after subscription moved between Entra tenants
- **Judgment**: context_dependent
- **Reasoning**: 21vApplicable differs: avd-ado-wiki-0862=False, avd-mslearn-052=True
- **Recommendation**: Annotate with 21V applicability conditions

### conflict-007 - avd-deployment-arm-2
- **Type**: 21v_conflict | **Severity**: high
- **A**: `avd-contentidea-kb-007` (contentidea-kb)
  Symptom: WVD Deployment failed with DSC extension error. User is not authorized to query the management service.
- **B**: `avd-mslearn-043` (mslearn)
  Symptom: Deployment fails Unauthorized - scale operation not allowed for subscription in region
- **Judgment**: context_dependent
- **Reasoning**: 21vApplicable differs: avd-contentidea-kb-007=True, avd-mslearn-043=False
- **Recommendation**: Annotate with 21V applicability conditions

### conflict-008 - avd-conditional-access-conditional-access
- **Type**: 21v_conflict | **Severity**: high
- **A**: `avd-ado-wiki-0857` (ado-wiki)
  Symptom: Unable to sign in to Azure AD-joined VMs from non-Windows clients when multifactor authentication (MFA) is enabled
- **B**: `avd-mslearn-002` (mslearn)
  Symptom: Cannot add user assignments to application group - Azure portal shows 'Session Ending' or 'Experiencing Authentication I
- **Judgment**: context_dependent
- **Reasoning**: 21vApplicable differs: avd-ado-wiki-0857=True, avd-mslearn-002=False
- **Recommendation**: Annotate with 21V applicability conditions

### conflict-009 - avd-conditional-access-conditional-access
- **Type**: 21v_conflict | **Severity**: high
- **A**: `avd-mslearn-002` (mslearn)
  Symptom: Cannot add user assignments to application group - Azure portal shows 'Session Ending' or 'Experiencing Authentication I
- **B**: `avd-onenote-026` (onenote)
  Symptom: Legacy per-user MFA enabled on Azure AD cloud user causes login failure on AADJ AVD session host desktop. AAD Operationa
- **Judgment**: context_dependent
- **Reasoning**: 21vApplicable differs: avd-mslearn-002=False, avd-onenote-026=True
- **Recommendation**: Annotate with 21V applicability conditions
