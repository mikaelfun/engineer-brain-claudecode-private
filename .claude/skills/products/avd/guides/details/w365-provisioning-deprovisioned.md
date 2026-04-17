# AVD W365 Provisioning 配置 - deprovisioned - Issue Details

**Entries**: 5 | **Type**: Quick Reference only
**Generated**: 2026-04-07

---

## Issues

### 1. Windows 365 Cloud PCs suddenly deprovisioned or deallocated; existing Cloud PCs cannot be started by...
- **ID**: `avd-ado-wiki-238`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Tenant flagged as abuse (IsAbuse=true) or HighlySuspicious by fraud/abuse detection system; Cloud PCs deallocated when TrustLevel is HighlySuspicious or Fraud
- **Solution**: Check CPCD for IsAbuse flag and TrustLevel. For abuse: raise DFM Collab with FROG/ICE (Ops PE OneVet MPN T3). For fraud: engage CRCE (RiskOps). If decision reverted, ensure TrustLevel resets to Normal. If Cloud PCs were deprovisioned, coordinate recovery with SaaF/Engineering via ICM
- **Tags**: w365, deprovisioned, deallocated, abuse, fraud, FROG, ICE

### 2. All Cloud PCs under a W365 tenant are deprovisioned unexpectedly
- **ID**: `avd-ado-wiki-372`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Tenant confirmed as fraud by HIT (Human Investigation Team); all Cloud PCs are automatically deprovisioned
- **Solution**: Check tenant fraud status via CPCD or Reporting Kusto. If fraud decision was incorrect, follow fraud-lifted process to re-enable subscription. Use 'Fraud Lifted' email template to notify customer.
- **Tags**: provisioning, fraud, deprovisioned

### 3. All Cloud PCs under tenant are deprovisioned due to fraud confirmation
- **ID**: `avd-ado-wiki-378`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Tenant confirmed as fraud by HIT (Human Investigation Team), triggering automatic deprovisioning of all Cloud PCs
- **Solution**: Check fraud status in CPCD. If fraud upheld: inform customer subscription remains disabled. If fraud decision is incorrect (false positive): escalate to get fraud status lifted and re-enable subscription.
- **Tags**: w365, anti-fraud, deprovisioned, fraud, HIT

### 4. All Cloud PCs under tenant are deallocated (stopped) and customer cannot start them, or Cloud PCs ar...
- **ID**: `avd-ado-wiki-381`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Tenant marked as highly suspicious or confirmed fraud by Human Investigation Team (HIT)
- **Solution**: Check HIT status via CPCD or Kusto DailyTenantEvaluation_Snapshot. For suspicious: await HIT decision. For confirmed fraud upheld: inform customer subscription remains disabled. For fraud lifted: re-enable and apologize.
- **Tags**: fraud, deprovisioned, deallocated, HIT, windows-365

### 5. All Windows 365 Cloud PCs deallocated or deprovisioned; tenant marked as highly suspicious or confir...
- **ID**: `avd-ado-wiki-387`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Tenant flagged as highly suspicious (Cloud PCs deallocated) or confirmed fraud by HIT Human Investigation Team (Cloud PCs deprovisioned)
- **Solution**: Check tenant trust level via CPCD or Reporting Kusto (DailyTenantEvaluation_Snapshot). For fraud upheld: inform customer subscription remains disabled. For fraud lifted: confirm re-enablement and apologize. Use provided email templates
- **Tags**: fraud, deprovisioned, deallocated, HIT, tenant-score, windows-365
