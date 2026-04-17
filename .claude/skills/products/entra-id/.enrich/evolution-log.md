# Product Skill Evolution Log

> 知识演进审计日志。每次从案例、OneNote、ADO Wiki、手动输入学到的新知识都记录在此。

| Date | Source | Change | Case/Link |
|------|--------|--------|-----------|
| 2026-04-04 | 21v-gap-scan | 20 unsupported, 11 partial features extracted from Feature Gap doc | POD Notebook/Entra ID/Feature gap |
| 2026-04-04 | onenote-scan | 6 known-issues extracted (B2C pwd expiry, MFA Authenticator OID, VDI domain login, AADDS lockout, HAADJ RP missing, HAADJ dual-fed DRS). 4 guide drafts created (NPS 21V, ADFS+MFA 21V, Okta IdP, M365 licensing). 10 pages scanned from MCVKB AAD section. | MCVKB 11.10/11/14/15/20/21/22/23/25, 23.1 |
| 2026-04-04 | onenote-scan-batch2 | 6 known-issues extracted (B2C SendGrid deploy, AADC group-filter workaround, MFA admin lockout 21V process, AADC UPN migration, MFA device info Mooncake, MSI Graph permissions). 3 guide drafts created (ADFS refresh token lifetime, ADFS debug logging, AADC V1→V2 upgrade). 1 page skipped (11.24 internal lab setup). 10 pages scanned. | MCVKB 11.13/16/17/24/26/27/28/29/30/32 |
| 2026-04-04 | ado-wiki-batch1 | 11 break/fix known-issues extracted (HAADJ GPO race, PRT VPN off-network, WAM security software, HAADJ pending 0x801c005a, PRT MFA RSA key, VM ext MSI unavailable, VM ext hostname dup, Linux SSPR error 1001, Linux keyring blank screen, Linux JDK 11 dep, Linux passkey cert fail). 3 guide drafts created (macOS WPJ TSG, AadLoginForWindows VM ext, Device Mgmt TSG). 4 short utility pages scanned (Linux broker/DBUS, Edge TSG, pkg versions, get device ID). 10 pages scanned from Device Registration section. | ADO Wiki AzureAD: Device Registration |
| 2026-04-04 | onenote-scan-batch3 | 6 known-issues extracted (Graph API token Mooncake, dual-federation unsupported, SAML SSO non-gallery app, OIDC custom claims AADSTS50146, hint attributes Mooncake, per-user consent grant). 4 pages skipped (empty section header, deprecated process/thin content). 10 pages scanned. | MCVKB 11.1/12/19/2/3/33/34/35/36, 23.0 |
| 2026-04-04 | onenote-scan-batch4 | 6 known-issues extracted (App Service AAD multi-tenant URI, AKS UMI missing RBAC, AADDS FSLogix auth, MSIX+AADDS unsupported, AVD RemoteApp re-auth expected, Seamless SSO URL blocked). 4 guide drafts created (AKS AAD RBAC config, ADFS SSO AVD setup, AVD AAD-joined VMs, AVD auth protocols deep dive). 10 pages scanned from Web/AKS/AVD sections. | MCVKB Web 5.1, POD AKS/AVD case studies |

## 2026-04-04 — Phase 3b Batch 2: ADO Wiki Device Registration Troubleshooting

**Source**: ADO Wiki (Supportability/AzureAD) — Device Registration area
**Pages scanned**: 10 (Linux SSO diagnostics, PRT troubleshooting, package install, broker accounts, enrollment status, Windows 10 AADJ, RDS AAD Auth, WAM SSO, Windows PRT, Hybrid Join)
**Track A (known-issues)**: 6 new entries (entra-id-039 to entra-id-044)
- Linux intune-portal package install failure
- AADJ user auto-added to local admin (by design)
- Windows Hello for Business auto-enabled on AADJ
- PRT not acquired (AzureAdPrt=NO) troubleshooting
- RDS AAD Auth unsupported on Server 2019
- Linux deviceless PRT not supported

**Track B (guide drafts)**: 5 new guides
- linux-sso-diagnostics.md — journalctl, Intune device ID, package versions, broker status
- rds-aad-auth-troubleshooting.md — platform requirements, enablerdsaadauth checklist
- wam-sso-troubleshooting.md — WAM architecture, token broker events, third-party interference
- windows-prt-troubleshooting.md — dsregcmd /status, Event 1006/1007, error patterns
- hybrid-join-windows10-troubleshooting.md — SCP config, common failures, log gathering

**Deduplication**: 0 duplicates (all new entries distinct from existing 038 entries)
**21v gaps**: No 21v-unsupported features in this batch; all entries 21vApplicable=true
**Progress**: ado-wiki scanned 20/4264 (0.5%), known-issues total 44, guide drafts total 20

## 2026-04-05 — Phase 2: OneNote Extract (entra-id-onenote, parallel v3)

**Source**: OneNote MCVKB AAD section (pages 0-9 from page-classification index)
**Pages scanned**: 10 (section header, M365 licensing, deprecated AAD features, B2C pwd, MFA Authenticator, deprecated ADFS config, ADFS token lifetime, NPS MFA 21V, ADFS+MFA 21V, ADFS debug log)
**Track A (known-issues)**: 4 new entries (entra-id-onenote-001 to 004)
- B2C local account password expiration (DisablePasswordExpiration)
- MFA Authenticator Object ID display (EUII protection, by design)
- NPS extension for Azure MFA in Mooncake (registry + endpoint config)
- ADFS + Azure MFA TLS 1.2 failure (SchUseStrongCrypto)

**Track B (guide drafts)**: 4 entries (entra-id-onenote-005 to 008)
- onenote-office-product-service-plan-licensing.md (already existed from prior run)
- onenote-adfs-refresh-token-lifetime.md
- onenote-adfs-debug-log-traces.md
- onenote-configure-21v-azure-mfa-adfs.md

**Skipped**: 2 deprecated pages (11.1, 11.12), 1 section header (23.0)
**Deduplication**: 0 duplicates (first batch in per-source JSONL)
**Progress**: onenote scanned 10/635, known-issues-onenote total 8
[2026-04-05] mslearn-scan: 8 pages scanned, 6 entries extracted (5 break/fix + 1 guide-draft), 2 skipped (informational/index)
[2026-04-05] ado-wiki-scan: entra-id — scanned 1 page (iOS/macOS broker+device registration guide, 40K chars), extracted 5 break/fix + 1 guide-draft, total 11/4264 scanned
[2026-04-05] onenote-extract: +8 entries (6 break/fix, 2 guide-drafts), 0 deduped, 10 pages scanned (20/total)
[2026-04-05] onenote-extract: +10 entries (5 break/fix, 5 guide-drafts), 0 deduped, 10 pages scanned (30/635). Topics: MsGraph PS SDK, SSL inspection, AAD Graph API reporting, dynamic groups, token lifetime, workload identity federation, B2C SAML IDP, AAD Gateway, PRT, WAM.

## 2026-04-05 ADO Wiki Scan (tick)
- **Pages processed**: 2 (补扫 "Entra ID device registration and broker scenarios on iOS and macOS" + 新扫 "MacOS Platform SSO Extension")
- **Track A extracted**: 10 entries (entra-id-ado-wiki-024 ~ 033)
  - 024: iOS unmanaged broker 3rd party MFA unknown error
  - 025: PSSO PkeyAuth header missing with SSL inspection
  - 026: Browser SSO PRT-Recovery fails with Authentication Strength CA policy
  - 027: TLS1.3 iOS WorkplaceJoin errors (-1003/-1001)
  - 028: iOS multi-tenant registration invalidation
  - 029: PSSO Per-User MFA password sync window shake
  - 030: Non-MSAL app SSO failure - AppAllowList
  - 031: macOS PRT MFA claim dropped on fresh login (Apple bug)
  - 032: macOS 15+ PSSO re-registration (Apple concurrency)
  - 033: AADSTS700007/500139/50013 MFA+SIF CA policies (Resolved)
- **Track B guide drafts**: 1 (ado-wiki-macos-platform-sso-extension.md) + pointer 034
- **Deduplicated**: 0 (all new issues not previously covered)
- **Total JSONL entries**: 34 (was 23)
- **Scanned**: 12/4264

### 2026-04-05 ado-wiki tick
- **Source**: Supportability/AzureAD - MacOS WorkplaceJoin troubleshooting
- **Discovered**: 5 break/fix + 1 guide-draft (MacOS WPJ TSG)
- **Deduplicated**: 0
- **Topics**: keychain -25244, device quota, ADRS 401/404, third-party blocking, UPN mismatch
- **Progress**: 13/4264 pages scanned

## 2026-04-05 ado-wiki tick
- Page: Azure AD Device Registration KNOWN ISSUES
- Extracted: 10 Break/Fix entries (041-050)
- Topics: GPO race condition, PRT/VPN, dsregcmd display, WAM SSO interference, pending registration 0x801c005a, MFA claim drop RSA key, HP OneAgent cert deletion + TPM exhaustion, Join Type display bug, dollar sign device name
- Deduplicated: 0
- Remaining: 4250 pages

## 2026-04-05 contentidea-kb tick
- Scanned 10 work items: 29518, 34308, 34325, 34328, 34506, 34512, 34745, 34840, 34896, 34898
- All 10 had empty structured fields (old Content Idea Requests) → skipped, marked scanned
- Discovered: 0, Deduplicated: 0
- Progress: 40/288 scanned, 248 remaining

| 2026-04-05 | ado-wiki | +7 issues (051-057): AADSSHLoginForLinux VM extension errors (exit code 21/22/23), az ssh KeyError, SSH connection closed, OID conflict, cloud app registration | Supportability/AzureAD: Azure AD SSH Sign-in for Linux VMs |

- **2026-04-05 Phase5-contentidea-kb tick**: scanned 10 work items (35047,35094,35118,35173,35442,35487,35490,35491,36050,38299), all had empty structured fields → 0 new entries. Total scanned: 50/288. Remaining: 238.

## 2026-04-05 Phase2 onenote-extract (batch 4)
- Pages processed: 10 (11.55–11.59, 11.6–11.9, 7.8)
- Track A (break/fix): 5 new entries (030–035)
  - 030: B2B guest auth fails after Tango→CC B2B migration
  - 031: MFA registration forces App Password (legacy Service Setting)
  - 032: MFA SMS/Voice blocked by region opt-in requirement
  - 033: AADSTS500082 during WS-fed→SAML conversion (NameID mismatch)
  - 034: Device registration 0x80072efd (blocked enterpriseregistration.windows.net)
  - 035: AAD Connect download location update
- Track B (guide-drafts): 2 new guides (036–037)
  - 036: iOS Fiddler trace capture guide
  - 037: ADFS WS-fed to SAML conversion guide
- Deduplicated: 1 (11.9 SupportMultipleDomain ≥80% overlap with existing 022)
- Skipped: 2 deprecated pages (11.7 RBAC Jarvis, 11.8 B2B SPO workaround)
- Total scanned: 50/635 | Remaining: 585 | Exhausted: false

- **2026-04-05 Phase5-contentidea-kb tick**: scanned 10 work items (38356,40154,40725,40832,40878,41152,41220,41260,42547,43094), all had empty structured fields (old Content Idea Requests) → 0 new entries. Total scanned: 60/288. Remaining: 228.

## 2026-04-05 onenote tick (MFA Deep Dive batch)
- **Pages processed**: 10 (Philip AAD MFA Deep Dive series + New Hire Readiness Plan)
- **Track A (break/fix)**: 3 entries (entra-id-onenote-038~040)
  - NPS Extension AccessReject error
  - AAD Gateway MFA throttling (429)
  - Telephony country block (RepMap)
- **Track B (guide-drafts)**: 5 entries (entra-id-onenote-041~045)
  - MFA architecture & auth flow guide
  - MFA throttling TSG (TSG3)
  - MFA auth flow troubleshooting (TSG1)
  - MFA registration troubleshooting (TSG2)
  - NPS Extension architecture & troubleshooting
- **Skipped**: 2 pages (training templates with no troubleshooting content)
- **Deduplicated**: 0
- **Progress**: 60/635 scanned (9.4%), exhausted=false

| 2026-04-05 | ado-wiki-scan | 16 known-issues extracted (058-073): 3 SSH/JIT issues, 9 AADLoginForWindows VM extension errors (DSREG codes, RBAC, hostname dup, false-positive status), 3 device mgmt issues (dual-state, quota, isCompliant change), 1 guide-draft. 1 page skipped (oversized 113K), 1 empty. 5 pages scanned. | AzureAD wiki: VM AAD Sign-in, AadLoginForWindows, Device Mgmt |

| 2026-04-05 | contentidea-kb-scan | 3 entries extracted (001-003): 1 AAD Join boot hang (Break/Fix, KB4023768), 1 AD FS LDAP auth config (Informational), 1 AADC local groups (Informational). 7 items skipped (no structured fields). 10 items scanned (91-100/288). | ContentIdea KB: Active Directory |

### 2026-04-05 ado-wiki tick (scanned 21/4264)
- Page: Device registration_Troubleshooting Windows 7 Automatic Device Registration
- Track B: 1 guide-draft (comprehensive troubleshooting decision tree)
- Track A: 4 break/fix entries (PTA/PHS+SeamlessSSO, NTE_BAD_KEYSET, NTE_BAD_KEY_STATE, device quota)
- IDs: entra-id-ado-wiki-074 ~ 078
| 2026-04-05 | onenote-extract | +6 break/fix (056-061) +4 guide-drafts (062-065): App Service AAD multi-tenant URI, AKS UMI RBAC, MSIX+AADDS, WVD RemoteApp re-auth, Seamless SSO blocked URL, ADFS SSO cert-auth; guides: AKS RBAC modes, AADJ VMs, AVD auth protocols, ADFS SSO setup | phase2 batch |

## 2026-04-05 — ADO Wiki Scan (tick 4)
- **Pages processed**: 11 (Soft Delete Devices, Intune Identity Support Boundaries, IoT Integration, 8× Linux Enterprise SSO pages)
- **Track A extracted**: 12 break/fix items (entra-id-ado-wiki-079 to 091)
  - Soft-delete device: 404 errors, compliance reset, re-registration blocked, AAD Connect sync conflict
  - Intune/Identity: PRT not available (SmartCard), IsCompliant/IsManaged routing
  - Linux SSO: SSPR first-time error 1001, blank screen (keyring), Ubuntu 23.xx Java 11, passkey cert validation, Edge stale cookies
- **Track B guides**: 3 drafts (soft-delete-devices, intune-identity-boundaries, linux-enterprise-sso-deployment)
- **Scanned**: 32/4264 pages (0.75%)

## 2026-04-05 ado-wiki tick (Linux Enterprise SSO sub-pages)
- **Pages scanned**: 5 (Support Boundaries, Broker/DBUS Troubleshooting, Edge Troubleshooting, Find Packages Versions, Get Device Id)
- **Track A**: 1 break/fix entry (entra-id-ado-wiki-093: Linux Access Denied with CA)
- **Track B**: 5 guide drafts (094-098: support boundaries, broker/dbus, edge, packages, device id)
- **Deduplicated**: 0 (checked against 086/092, low overlap)
- **Progress**: 37/4264 scanned (0.9%)

### 2026-04-05 — contentidea-kb batch (items 101075–106427)
- **Work items scanned**: 10 (101075, 101197, 101214, 101668, 104484, 104592, 104715, 105144, 105939, 106427)
- **Discovered**: 5 (entra-id-contentidea-kb-044~048)
- **Skipped (empty fields)**: 5 (no structured symptom/cause/resolution)
- **Deduplicated**: 0
- **Progress**: 170/288 scanned (59.0%), 128 remaining
| 2026-04-05 | contentidea-kb | +7 entries (083~089): AAD reply URL prompt, internal content creation, cert enrollment 0x80070032, app reg cert thumbprint, hybrid device health checker, device reg SCP tool, ServiceNow provisioning creds | ContentIdea#97656,97660,98056,99496,99570,99619,99772 |
| 2026-04-05 | onenote | +6 entries (075~080): AADJ AVD per-user MFA failure, Azure Files AD join script params, App Role assignment without SP, AVD dual-federation workaround guide, App Role mgmt guide, AADDS Jarvis diagnostics guide. Dedup: 4 skipped (MSIX+AADDS, ADFS SSO AVD, Restrict Login Location images-only, Microsoft.Graph minimal). | 100/635 scanned (15.7%) |

| 2026-04-05 | mslearn | +8 entries (196~203): PHS troubleshooting guide, New-MsolDomain subdomain error, Connect-MsolService auth error, password writeback license error, 0x80005000 sync wizard error, UPN matching guide, msExchRecipientTypeDetails filtering, Office 2013 yellow exclamation. 2 guide-drafts created. Dedup: 0. | **EXHAUSTED** 255/212 scanned (all indexed URLs complete) |
## 2026-04-05 contentidea-kb scan (final batch)

- **Source**: contentidea-kb (WIQL keyword: "Active Directory")
- **Batch**: 9 work items (IDs: 162033, 170532, 172500, 173455, 174272, 174619, 175548, 183685, 205440)
- **Skipped**: 1 (162033 — no structured fields)
- **Discovered**: 8 new entries (entra-id-contentidea-kb-121~128)
- **Deduplicated**: 0
- **Total**: 288/288 scanned — **source exhausted**
- Topics: ADFS service startup failure, MDM Terms of Use, AAD Joined managed accounts, ChatGPT usage guide, AAD Broker Plugin, CloudSync app troubleshooting, excessive AAD auth requests, AD attribute update issues

## 2026-04-05 onenote-extract (tick 11)
- Pages processed: 10 (AzureAD/AzureAdPreview, Case tracking, B2C retirement, B2C training Video, Cannot create new AAD B2C tenant, Case Study, 2112020060001269, 2307030040000167, 2311180030000169, Recovery of b2c-extensions-app)
- New entries: 6 (entra-id-onenote-081 ~ 086)
- Deduplicated: 0
- Skipped (empty/tracking/links): 4
- Guide drafts: 1 (onenote-b2c-extensions-app-recovery.md)
- Progress: 110/250 scanned, 140 remaining
- Key topics: B2C EOL/retirement, B2C tenant creation blocked, B2C user restore AltSecID conflict, B2C custom policy endpoint issues in 21V, B2C emails claim missing for API-created users, b2c-extensions-app recovery

### 2026-04-05 onenote-extract (tick)
- Pages processed: 10 (B2C Known issues, Pricing, Jarvis/Kusto troubleshooting, Cross Cloud B2B case studies & feature status)
- Track A extracted: 3 issues (087-089)
- Track B guide drafts: 2 (090-091) — B2C CPIM Jarvis/Kusto, Cross-tenant sync auto-redemption
- Skipped: 4 empty pages, 1 pricing-only page
- Deduplicated: 0
- Total scanned: 120/635, remaining: 515
- exhausted: false

### 2026-04-05 Phase 2 onenote-extract (tick)
- **Pages processed**: 10 (Cross Cloud B2B technical details section)
- **Track A (break/fix)**: 6 new entries (092-097) — AIP encryption cross-cloud limitation, SharePoint UPN auth, B2B invitation UPN/email mismatch, tenanted endpoint required, consumer account unsupported, ADX/D365 unsupported
- **Track B (guides)**: 2 guide-draft entries (098-099) + 2 draft files created (ccb2b-poc-steps.md, ccb2b-vs-dual-federation.md)
- **Skipped**: 4 pages (PM status updates, roadmap, empty section, contact info)
- **Deduplicated**: 0 (no overlaps with existing entries)
- **Progress**: 130/635 pages scanned (20.5%)
- **Exhausted**: false

### 2026-04-05 onenote-extract tick (Phase 2)
- **Batch**: 10 pages (CC B2B + Entra Domain Service sections)
- **Discovered**: 5 entries (entra-id-onenote-100 ~ 104)
  - 4 Track A (break/fix): CC B2B portal login block, AADDS ADE migration DC failure, AADDS resource lock IP change, AADDS replica creation networking failure
  - 1 Track B (guide-draft): CC B2B legacy policy setup via PowerShell
- **Deduplicated**: 0 (no overlaps with existing entries)
- **Skipped**: 5 pages (empty headers, link-only, image-only)
- **Scanned**: 130 → 140 | Remaining: 495

| 2026-04-05 | onenote | +7 entries (105-111): 4 break/fix + 3 guide-drafts. Topics: DevOps workload identity audience mismatch (AADSTS700212), MSI IMDS 500 disk space, PIM ExpirationRule failure, custom RBAC multi-DB role, ASC role investigation guide, RBAC enumeration scripts | onenote-extract batch |

**Tick details (2026-04-05 onenote batch 15)**:
- **Track A (break/fix)**: 4 entries — workload identity audience (105), MSI 500 PFXImportCertStore (106), PIM policy validation (108), custom RBAC multi-DB (110)
- **Track B (guide-draft)**: 3 entries — MSI diagnostics Mooncake (107), ASC role assignment TSG (109), RBAC enumeration scripts (111)
- **Deduplicated**: 0 (no overlaps; entry 105 linked as relatedTo entra-id-onenote-014)
- **Skipped**: 3 pages (empty headers, link-only)
- **Scanned**: 140 → 150 | Remaining: 485
- **Exhausted**: false

### 2026-04-05 onenote-extract tick (batch 160)
- **Track A** (3 break/fix):
  - `entra-id-onenote-112`: SP 403 on az role assignment → assign Directory readers
  - `entra-id-onenote-113`: Connect Health Agent port exhaustion bug (v3.0.244.0) → upgrade to 3.1.2.0
  - `entra-id-onenote-114`: ADFS windowsaccountname claim case mismatch → custom claim rules to query AD directly
- **Track B** (4 guide-drafts):
  - `entra-id-onenote-115`: AAD authorization Kusto diagnostics (MSODS IfxBECAuthorizationManager)
  - `entra-id-onenote-116`: Password writeback relay architecture & troubleshooting
  - `entra-id-onenote-117`: ADFS support scope boundaries in Mooncake
  - `entra-id-onenote-118`: EXO/ADFS lockout brute force mitigation guide
- **Skipped**: 2 pages (empty section headers: Readiness, Case Study index)
- **Scanned**: 150 → 160 | Remaining: 475
- **Exhausted**: false

## 2026-04-05 onenote-extract (tick)
- Pages processed: 10 (1 empty skipped)
- New entries: 9 (7 break/fix + 2 guide-drafts)
- IDs: entra-id-onenote-138 ~ 146
- Deduplicated: 0
- Topic: ADFS/WAP case studies — ExtendedProtectionTokenCheck, Extranet Lockout, Fed domain conversion, SupportMultipleDomain, SAML signature, health probe 503
- Guide drafts: onenote-adfs-wap-etl-trace-collection.md, onenote-o365-federated-auth-flow.md
- Progress: 190/635 scanned (29.9%)

### 2026-04-05 onenote-extract tick (chain)
- Source: onenote (POD Notebook — ADFS/WAP Case Study)
- Discovered: 12 (9 Track A break/fix + 3 Track B guide-drafts)
- IDs: entra-id-onenote-147 ~ 158
- Deduplicated: 0
- Topic: ADFS cert selection POST vs Redirect, adfshelp RegEx bug, WAP client cert auth (untrusted root + IP binding), CNG keys + KeySpec AT_SIGNATURE, alternate login ID UPN format, Base64 UPN in SAML token, custom attribute store DLL, ServiceNow integration, Banned IPs
- Guide drafts: onenote-adfs-servicenow-saml-sso.md, onenote-adfs-banned-ips.md, onenote-adfs-publish-extranet-wap.md
- Progress: 200/635 scanned (31.5%)
| 2026-04-05 | onenote | +10 entries (entra-id-onenote-178~187): SaaS App topics - Picturepark WS-Fed, wildcard reply URLs/MyApps, redirect URI wildcards, enterprise app RBAC, consent policy custom role, SSO blade visibility, corp tenant ownership, AADSTS75011, provisioning timezone mapping, Google App ExternalSecret limit | Phase 2 batch |

### 2026-04-05 Phase2-onenote tick (ADFS WAP features/tools batch)
- **Scanned**: 10 pages (ADFS and WAP / Deep dive + Feature config + Log tools)
- **Discovered**: 4 entries (onenote-194~197)
  - Track A: 1 (Extranet lockout cross-domain, relatedTo onenote-139)
  - Track B: 3 guide-drafts (RelayState, ADFS-Diag, LDAP trace)
- **Deduplicated**: 1 (Prompt=login ≥80% overlap with onenote-160)
- **Skipped**: 5 empty/thin pages
- **Remaining**: 385/635 pages
- **Exhausted**: false

### 2026-04-05 Phase 2 tick (onenote) — batch 11
- **Scanned**: 10 pages (Application mgmt + Conditional Access area)
- **Extracted**: 8 entries (entra-id-onenote-198 ~ 205)
  - Track A: 4 break/fix (cross-tenant NameID, refresh token MaxInactiveTime, Az CLI proxy AADSTS53003, PIM unmapped scopes AADSTS50076)
  - Track B: 4 guide-drafts (CA block PowerShell, CA SharePoint unmanaged devices, CA ActiveSync flow, CA exclude 1P apps via custom attributes)
- **Deduplicated**: 0
- **Skipped**: 2 empty section headers (Blogs, Case study)
- **Remaining**: 375/635 pages
- **Exhausted**: false

### 2026-04-05 onenote-extract (batch 27)
- Pages processed: 10 (ADFS troubleshooting, SAML header, optional claims, app provisioning x4, case study x2, export SP/APP expiry)
- Extracted: 5 entries (206-210) — 4 Track A break/fix + 1 Track B guide-draft
- Skipped: 5 pages (empty headers, link-only pages)
- Dedup: 0 (no overlap with existing entries)
- Guide draft created: onenote-adfs-general-troubleshooting.md
- Remaining: 365 pages

## 2026-04-05 onenote-extract (tick)

- **Pages processed**: 10 (Device Registration, Dual-Federation batch)
- **Track A (break/fix)**: 3 entries (entra-id-onenote-217~219)
  - 217: PRT failure after OS reimage due to UserCertificate sync delay
  - 218: Old MSOnline module overwrites global ADFS relying party during dual-fed setup
  - 219: Dual-fed + Intune SDK OID change causes iOS app data removal
- **Track B (guide-draft)**: 2 entries (entra-id-onenote-220~221)
  - 220: Dual-federation overview & CSS process guide
  - 221: Forced domain removal TSG & escalation path
- **Skipped**: 5 pages (empty index, link-only, deprecated FYI, images-only)
- **Deduplicated**: 0
- **Remaining**: 345 pages
- **Exhausted**: false

### 2026-04-05 Phase 2 onenote-extract (batch: Application mgmt and config)
- **Pages processed**: 10 (4 Track A + 3 Track B + 3 empty/skipped)
- **New entries**: 7 (entra-id-onenote-222 ~ 228)
  - Track A: SP deleted but token issued, first-party app SP creation failures, PBI SP auto-disabled, SP disabled by SubscriptionManaged policy
  - Track B: Grant app roles to MSI, Token lifetime policy config, Install first-party app
- **Guide drafts**: 3 (onenote-grant-app-roles-to-msi.md, onenote-token-lifetime-policy.md, onenote-install-first-party-app.md)
- **Deduplicated**: 0
- **Progress**: 299/635 scanned (47%)
- **Exhausted**: false

| 2026-04-05 | onenote | +7 Track A, +3 Track B guide-drafts (entra-id-onenote-229~238) | Dual-Federation + NPS MFA |
- **Track A** (7 new issues):
  - 229: Authenticator app cannot handle same UPN from different clouds (dual-fed)
  - 230: PowerApps mobile OneAuth bug with dual-fed accounts (relatedTo 219)
  - 231: Viral tenant from PBI trial causes unexpected domain in public Azure
  - 232: NPS MFA cert mismatch from repeated script runs (relatedTo 020)
  - 233: NPS MFA UPN mismatch - LDAP_ALTERNATE_LOGINID_ATTRIBUTE fix (relatedTo 021)
  - 234: NPS MFA sends SMS but VPN client cannot input code - use legacy push
  - 235: NPS primary auth failure - auth method mismatch (PEAP-MSCHAPv2)
- **Track B** (3 guide drafts):
  - 236: Dual-fed support scenarios reference (onenote-dual-fed-support-scenarios.md)
  - 237: How to identify dual-fed domain via OIDC endpoints (onenote-identify-dual-fed-domain.md)
  - 238: Dual-fed/CC B2B client support matrix (onenote-dual-fed-ccb2b-support-matrix.md)
- **Deduplicated**: 0 (3 entries added with relatedTo for partial overlap)
- **Progress**: 310/635 scanned (49%)
- **Exhausted**: false

## 2026-04-05 onenote tick (entra-id)

- **Pages processed**: 10 (7 with content, 3 empty section headers)
- **Track A (break/fix)**: 3 new entries (entra-id-onenote-239 to 241)
  - 239: CBA in 21Vianet requires beta API (no UI available)
  - 240: Bulk MFA enable via portal silently fails for >50 users
  - 241: Unable to configure per-user MFA Verification options (invalid allowedNumberOfDays)
- **Track B (guide-draft)**: 3 new guides + JSONL refs (entra-id-onenote-242 to 244)
  - NTRadPing NPS+MFA RADIUS testing guide
  - CBA setup end-to-end for 21Vianet (cert export + Graph API)
  - Authenticator Push Notification log analysis guide
- **Deduplicated**: 1 (dual-federation same-UPN authenticator issue → matches entra-id-onenote-229)
- **Empty pages skipped**: 3 (Authentication methods, Case study, Emerging issues)
- **Scanned**: 320/635 | **Remaining**: 316

### 2026-04-05 ado-wiki tick (continuation)
- **Pages scanned**: PRT Troubleshooting (Linux), Package Install Failures (Linux)
- **Track A entries**: 2 (entra-id-ado-wiki-101, 102) — apt/dpkg install failures for Linux identity broker packages
- **Track B guides**: 1 (ado-wiki-prt-troubleshooting-linux.md) — PRT lifecycle on Linux
- **Total JSONL entries**: 102 (IDs 100-102 added)
- **Remaining pages**: 4224 / 4264

### 2026-04-05 onenote-extract tick (continuation)
- **Product**: entra-id
- **Pages processed**: 10 (MFA section: Emerging issues, Jarvis, Kusto, Topology, Authenticator, FIPS, Log collection, International caller ID, PG Contacts, Service update)
- **Discovered**: 3 new entries (entra-id-onenote-245 to 247)
  - 245: Mooncake MFA international caller ID PIPL compliance (Track A)
  - 246: Jarvis SAS tables deprecated Dec 2025, use Kusto instead (Track A, relatedTo 041)
  - 247: MS Authenticator log collection via PowerLift (Track B guide-draft)
- **Deduplicated**: 1 (opt-in telephony verification → overlaps with 032/040)
- **Skipped**: 6 pages (link-only: Topology Chart, MS Authenticator; images-only: FIPS; empty: Service update; contact-only: PG Contacts; deprecated info covered by Kusto page: Jarvis)
- **Guide draft created**: onenote-ms-authenticator-log-collection.md
- **Progress**: 330/635 scanned (52%), 306 remaining

### 2026-04-05 onenote-extract (batch 34, continuation)
- **Pages processed**: 10 (MFA enforcement, 21v Teams MFA/实名认证, tenant lockout/admin processes, tenant restriction wiki, WHfB case studies)
- **Entries added**: 9 (IDs 248-256), 0 deduplicated
- **Track A**: 8 break/fix entries (MFA enforcement, 21v Teams MFA x2, WHfB PIN/SCCM, AADJ SSO x3, msDS-KeyCredentialLink removal)
- **Track B**: 1 guide-draft (WHfB vs WH differentiation)
- **Pages skipped** (too thin): 3 (cross-references only)
- **Progress**: 340/635 scanned (53.5%), 295 remaining
- **exhausted**: false

### 2026-04-05 onenote-extract (continuation tick)
- **Pages processed**: 10 (WHFB case studies, configuration, lab records, scope, feature gap)
- **Track A (break/fix)**: 3 entries (entra-id-onenote-257..259)
  - 257: WHFB PIN/fingerprint edit buttons greyed out (AllowSignInOptions registry)
  - 258: WHFB provisioning on AAD registered device (undocumented behavior)
  - 259: Security key sign-in China endpoint (AzureADKerberosTest endpoint=1)
- **Track B (guide-draft)**: 3 entries (entra-id-onenote-260..262)
  - 260: GPO Administrative Templates deployment
  - 261: WHFB Kerberos cloud trust with Intune
  - 262: WHFB support scope and routing
- **Skipped**: 4 pages (3 empty section headers, 1 meeting notes)
- **Deduplicated**: 0
- **Running total**: 262 entries, 350/635 pages scanned
- **Exhausted**: false (286 remaining)

## 2026-04-05 ado-wiki tick (pages 41-45)
- **Pages processed**: 5 (Linux SSO: Retrieve broker accounts, Verify Enrollment Status, Walk-Through RHEL, Walk-Through Ubuntu, MSAL.Net WSL)
- **Track A**: 3 entries (entra-id-ado-wiki-103~105) — broker restart+getAccounts, enrollment verification via registration.toml, WSL libsecret install
- **Track B**: 1 guide draft (ado-wiki-linux-sso-walkthrough-rhel-ubuntu.md) — combined RHEL+Ubuntu setup walkthrough with compliance config
- **Deduplicated**: 0 (all new, 2 entries marked relatedTo existing 095/098)
- **Remaining**: 4219 pages

### 2026-04-05 onenote-extract tick (WHFB batch)
- **Pages scanned**: 10 (350→360)
- **Discovered**: 5 (entra-id-onenote-257..261)
  - 2 break/fix: WHFB PIN greyed out (AllowSignInOptions), WHFB on AAD Registered device (undocumented)
  - 3 guide-drafts: GPO Central Store, WHFB Kerberos Cloud Trust 21V, WHFB Support Scope Routing
- **Deduplicated**: 0
- **Skipped**: 3 empty pages + 2 merged into guides
- **Remaining**: ~286

## 2026-04-05 ado-wiki tick (pages 46-48)

- **Scanned**: 3 pages (MSAL.Python WSL broker, Proxy config for Broker2.0, Amazon WorkSpaces integration)
- **Track A**: 1 break/fix (proxy config for identity broker on Linux → entra-id-ado-wiki-107)
- **Track B**: 2 guide drafts (MSAL Python WSL broker, Amazon WorkSpaces support boundaries)
- **JSONL**: entra-id-ado-wiki-107~109
- **Progress**: 48/4264 scanned

## 2026-04-05 onenote-extract (tick)

- **Pages scanned**: 10 (Feature gap x7, Overview/Test env x3)
- **Track A entries**: 8 (entra-id-onenote-263 ~ 270)
  - Email OTP non-MSA B2B not supported in MC
  - SSPR OTP not supported in MC
  - Authenticator passwordless/CBA/FIDO2 not available (~2027)
  - SCIM non-gallery app GA (Feb 2025)
  - Number matching in Authenticator push not available
  - TAP UI not available
  - PTA not available in MC
  - Trial license extension procedure for 21V
- **Track B guides**: 2 drafts
  - onenote-entra-id-feature-parity-mooncake.md
  - onenote-21v-test-environments.md
- **Deduplicated**: 0
- **Remaining**: 276 pages
- **Exhausted**: false

## 2026-04-05 ado-wiki tick (chain)
- Pages processed: 1 (Azure AD Devices Portal Diagnostics Tool)
- Track B guide-draft: 1 (diagnostics tool usage guide)
- Track A break/fix: 0
- New IDs: entra-id-ado-wiki-110
- Remaining: 4215/4264

### 2026-04-05 onenote-extract tick (entra-id)
- Scanned 10 pages (internal lab/process: 21v test env setup, ICM process headers, VMAS, SSL certs)
- Extracted 1 entry (entra-id-onenote-275): 21V promo code redemption blocked by Expired subscription
- Deduplicated 0
- Skipped 9 pages: empty section headers (3), deprecated (1), internal-only lab processes (5)
- Remaining: 266 pages

## 2026-04-05 Phase2 onenote-extract (continuation tick)
- **Scanned**: 30 pages (380→410 / 635 total)
- **Discovered**: 5 new issues (entra-id-onenote-275~279)
- **Deduplicated**: 0
- **Exhausted**: false (246 pages remaining)
- Content breakdown:
  - Batch 1 (10 pages): Internal process (21v promo, VMAS, ICM, test env) → 1 issue (promo code redemption failure)
  - Batch 2 (10 pages): Internal process (trial extension, sharing sessions, rebrand, PG contacts) → 0 issues
  - Batch 3 (10 pages): AAD Connect case studies + readiness → 4 issues (connector permissions ×2, custom attribute mapping, extension attribute identification)

### 2026-04-05 ado-wiki tick (Azure AD Devices lifecycle)
- **scanned**: 1 page (25416 chars)
- **extracted**: 3 break/fix (IDs 111-113) + 1 guide-draft (ID 114)
  - 111: AAD Registered device display name not updating after hostname change
  - 112: HAADJ display name not syncing via federation without AAD Connect
  - 113: Device registration fails due to per-user quota limit
  - 114: Guide: Azure AD Devices lifecycle management & stale device cleanup
- **deduplicated**: 0
- **progress**: 50/4264 scanned

## 2026-04-05 OneNote Batch (scanned 401-410)
- **Pages processed**: 10 (Support Topics, Support wiki Permission, AAD cert Status, Apply Cert DigiCert, Cloud Academy, 5x AAD Connect Case Studies)
- **Track A entries**: 6 (entra-id-onenote-276 to 281) — connector permissions, custom attributes, wiki access
- **Track B guide-drafts**: 2 (entra-id-onenote-282-283) — support topic routing, DigiCert cert application
- **Skipped**: 2 pages (AAD certificate Status = engineer training table, Cloud Academy = training links only)
- **Deduplicated**: 0 (no overlap with existing entries)
- **Total scanned**: 410/635

### 2026-04-05 OneNote Batch (IDs 280-289)
- **Tick**: 10 pages processed (AAD Connect Case Studies batch)
- **Track A** (5 break/fix): Directory Extension type limitation (#280), DB connection failure from profile duplication (#281), DB full truncate (#282), Device writeback FIPS/.NET (#283), Primary Group membership not synced (#284)
- **Track B** (5 guide-drafts): Do NOT clear connector spaces (#285), auto truncate scheduled task (#286), stop syncing one forest (#287), ManagedBy/Owner sync logic (#288), MSODS Audit Logging Kusto (#289)
- **Dedup**: 0 skipped
- **Remaining**: 236 pages unprocessed
- **Status**: not exhausted → chain continues

### 2026-04-05 ado-wiki tick (PRT page)
- **Page**: Azure AD Primary Refresh Token (AAD PRT)
- **Track A**: 3 issues (WebView2 PRT SSO, PRT sharing by-design, AADSTS5000611 KDFv1)
- **Track B**: 1 guide draft (KDFv1 deprecation guide with rollout timeline, allow-listing, ICM procedure, Kusto queries)
- **IDs**: entra-id-ado-wiki-115 ~ 118
- **Progress**: 51/4264 scanned

### 2026-04-05 ado-wiki tick (Azure AD PRT / KDFv1 Deprecation)
- **scanned**: 1 page (16769 chars)
- **extracted**: 3 break/fix (IDs 115-117) + 1 guide-draft (ID 118)
  - 115: AADSTS5000611 KDFv1 sign-in failure on unpatched Windows
  - 116: Edge WebView PRT SSO disabled by default
  - 117: PRT sharing across users on HAADJ (by design)
  - 118: Guide: KDFv1 deprecation timeline, allow-listing, Kusto queries
- **deduplicated**: 0
- **progress**: 51/4264 scanned

## 2026-04-05 09:07 — Phase 2 onenote-extract (entra-id)
- **Batch**: pages 421-430 (AAD Connect case studies: installation, OU filtering, password writeback, performance)
- **Track A**: 10 entries (entra-id-onenote-290 to 299)
- **Track B**: 1 guide draft (onenote-aadc-sync-performance-troubleshooting.md, entry 300)
- **Deduplicated**: 0 (no overlaps with existing entries)
- **RelatedTo**: entries 297/298/299 linked to entra-id-onenote-116 (password writeback)
- **Scanned**: 430 → 440 / 635 total | Remaining: ~226

### 2026-04-05 Phase2 Tick (续跑)
- **Source**: onenote (10 pages)
- **Pages**: AADC Installation (4), OU filtering (2), Password writeback (3), Performance (1)
- **Track A**: 9 entries (entra-id-onenote-290 to 297, 299)
  - 290: AADC upgrade EA account recognition bug
  - 291: AADC upgrade PersistedState.xml stale ADFS primary server
  - 292: TLS 1.2 SchUseStrongCrypto multi-scenario fix (relatedTo 004)
  - 293: AADC upgrade IndexOutOfRangeException from UPN service account
  - 294: AADC install user_realm_discovery_failed proxy issue
  - 295: AADC OU filtering product bug causing full-domain sync (ICM 21000000942261)
  - 296: AADC multi-forest DNS SRV record causing auth failure
  - 297: Password writeback by-design behavior across different portals
  - 299: Password writeback requires sync rule 'Out to AAD - User Join' Enable Password Sync
- **Track B**: 2 guide drafts (entries 298, 300)
  - onenote-aadc-password-writeback-troubleshooting.md
  - onenote-aadc-sync-performance-troubleshooting.md
- **Deduplicated**: 0
- **Scanned**: 440 → 450 / 635 total | Truly remaining: 226

### 2026-04-05 Phase2 Tick (repair)
- **Source**: onenote (10 pages - same batch as previous tick)
- **Action**: Data repair — previous run wrote entries but left scanned/JSONL in dirty state
- **JSONL dedup**: 331 → 293 entries (removed 38 duplicate ID entries from multiple crashed runs)
- **Scanned dedup**: 450 → 410 entries (removed 40 duplicate path entries)
- **New entries**: 0 (all 10 pages already had entries from previous tick)
- **Scanned**: 410 / 635 total | Remaining: 226
- **Exhausted**: false

### 2026-04-05 onenote-extract tick (chain)
- **Pages processed**: 10 (AAD Connect sync case studies)
- **New entries**: 10 (entra-id-onenote-301 to 310)
- **Deduplicated**: 0
- **Skipped**: 1 (Soft-Match/Hard-Match page had only external link, no extractable content → 0 triplets from it, but path still marked scanned)
- **Topics**: export perf (proxy/Named Pipes/disconnectors), scheduler, LargeObject/userCert, MFA on sync account, proxycalc (unverified domain/hidden chars/shadow mail), accountExpires workaround
- **Scanned**: 420 / 635 total | Remaining: 216
- **Exhausted**: false

## 2026-04-05 ado-wiki tick (Chrome Extension Issues)
- Page: /Authentication/Device Registration/Window Devices/Chrome Extension Issues
- Track A: 8 break/fix entries (IDs 119-126) — WIP policy, NativeMessaging blacklist, extension permissions, cmd.exe blocked, BrowserCore streaming bug, resource timeout, DidStartWorkerFail, Microsoft Editor interference
- Track B: 1 guide draft (ado-wiki-chrome-extension-issues.md) + 1 guide-draft pointer (ID 127)
- Scanned: 52/4264, Remaining: 4212

## 2026-04-05 onenote tick (AAD Connect Sync Case Studies)
- Pages: 10 AAD Connect case studies (Performance, Scheduler, Sync issues)
- Track A: 10 break/fix entries (IDs 301-310) — export slow/503/Named Pipes, disconnector perf, scheduler disabled, LargeObject userCertificate, MFA on sync account, proxycalc unverified domain, accountExpires workaround, hidden chars in SMTP, mail attribute BackSync
- Track B: 0 guide drafts (page 4 was link-only → 0 triplets, page 5 detailed enough for Track A)
- 1 page skipped (Soft-Match/Hard-Match — external link only, no extractable content)
- Scanned: 420/635, Remaining: 216

## 2026-04-05 Phase2 OneNote tick (continuation)

- **Batch**: 10 pages (AAD Connect case studies — performance, scheduler, sync issues)
- **Discovered**: 10 entries (entra-id-onenote-301 ~ 310)
- **Deduplicated**: 0 (concurrent run collision fixed: removed 10 duplicate entries)
- **Topics**: AAD Connect export 503/Named Pipes, disconnectors perf, SyncCycleEnabled, LargeObject/userCertificate, MFA on sync account, ProxyCalc/MSExchRemoteRecipientType, accountExpires workaround, hidden chars in SMTP, ShadowMail/BackSync
- **JSONL**: 303 entries total, max seq 310
- **Scanned**: 420/635 pages, remaining 215
- **Exhausted**: false

## 2026-04-05 ado-wiki tick (chain)
- Batch: 1 page (2683 chars) — "Collecting an Auth trace"
- Track B (guide-draft): 1 data collection guide saved
- New JSONL: entra-id-ado-wiki-128
- Progress: 53/4264 scanned (4211 remaining)

## 2026-04-05 ado-wiki tick
- Page: Device registration basic knowledge (34216 chars)
- Track A: 4 Break/Fix entries (entra-id-ado-wiki-129~132): API breaking change, SCP misconfiguration, proxy in SYSTEM context, downlevel WIA/Seamless SSO failures
- Track B: 1 guide draft (ado-wiki-device-registration-basic-knowledge.md) + 1 guide-draft pointer (133)
- Dedup: 0 skipped, 1 relatedTo (132 → 074)
- Scanned: 54/4264

### 2026-04-05 09:24 — ado-wiki tick (Device Registration basic knowledge)
- **Scanned**: 1 page (34216 chars)
- **Extracted**: 4 break/fix items (IDs 129-132)
  - Device Registration Policy API breaking change (Sept 2023)
  - SCP misconfiguration for managed vs federated domains
  - Proxy issues in SYSTEM context for Hybrid AADJ
  - Down-level WIA/SSO requirements (Windows 7/8.1)
- **Deduplicated**: 0
- **Progress**: 54/4264 pages scanned

## 2026-04-05 onenote-extract tick (311-320)
- Processed 10 pages: AAD Connect sync issues & sync rules
- Track A: 8 break/fix entries (mobile sync, PHS stop, container visibility, msExchRecipientType, duplicate attrs, stopped-server-down, UPN remap, SMTP domain removal)
- Track B: 2 guide-drafts (dynamic group extension attrs, AADC architecture concepts)
- Dedup: 0 skipped
- Scanned: 430→440 / 635 total (206 remaining)

## 2026-04-05 onenote-extract repair tick
- Re-processed same 10 pages (311-320 already existed from prior crashed run)
- Discovered: 0 new (all 9 entries were duplicates of prior run)
- Deduplicated: 18 removed (JSONL triplicates from prior incomplete run)
- Fixed scanned-onenote.json tracking (430→431 unique, was missing entries)
- Created guide draft: onenote-aadc-sync-architecture-concepts.md
- Scanned: 431 / 635 total (206 remaining)

## 2026-04-05 ADO Wiki Scan (tick continuation)
- **Source**: ado-wiki
- **Pages processed**: 1 (Device registration flowchart)
- **Track B (guide-draft)**: 1 — device registration flow phases (AADJ/HAADJ managed/federated)
- **New entries**: entra-id-ado-wiki-133
- **Remaining**: 4209 pages

### 2026-04-05 onenote tick (scanned 430→440→451, JSONL 319→326)
- **Scanned**: 10 pages (AAD Connect architecture/docs/ProxyCalc/download + M365 IDO case studies)
- **Discovered**: 7 entries (320-326): 5 Track A break/fix + 2 Track B guide-drafts
- **Skipped**: 3 pages (Documents=links only, Download link=URL only, Case study=empty header)
- **Track A highlights**: msExchRecipientTypeDetails sync failure, Office FixMe+CC B2B dual-cloud, firewall-caused FixMe, Android SSL_UNTRUSTED with Intune, substrate.office.com AADSTS500011 in Gallatin
- **Track B guides**: AAD Connect Architecture concepts, ProxyCalc overview
- **Deduplicated**: 0
- **Remaining**: 197

## 2026-04-05 Phase 2 onenote-extract (tick)

- **Scanned**: 10 pages (M365 Identity IDO case studies + AAD Connect concepts)
- **Track A**: 3 issues extracted (entra-id-onenote-321~323)
  - 321: Office FixMe button + MeControl CC B2B failure (firewall blocks SPO)
  - 322: Android Intune Outlook SSL_UNTRUSTED (ADFS NLB missing intermediate cert)
  - 323: Outlook mobile substrate.office.com AADSTS500011 in 21v (wrong resource endpoint)
- **Track B**: 2 guide-drafts (entra-id-onenote-324~325)
  - 324: AAD Connect Architecture (CS/MV/Import/Sync/Export)
  - 325: ProxyCalc attribute flows (shadow attributes)
- **Skipped**: 5 pages (Documents=link collection, Download link=single URL, 2 empty section headers, How password sync works=images only)
- **Deduplicated**: 0
- **Remaining**: 196 pages
- **Exhausted**: false

## 2026-04-05 Phase2-onenote tick (M365 IDO Common TSG + Log collection)
- Processed: 10 pages (M365 Identity IDO / Common operation_TSG 8p + Log collection 2p)
- Track A: 3 break/fix entries (326-328): iPhone SSO AADSTS900383, 21v Teams MFA loop, WAM 0xCAA10001
- Track B: 5 guide-drafts (329-333): WAM cache clear, OneAuth cache, SaRA fiddler, WAM Tool, MSOAID+ProcMon
- Skipped: 2 (empty page, links-only page)
- Deduplicated: 0
- Remaining: 186

- **2026-04-05** ado-wiki tick: scanned 1 page (Device registration_Troubleshooting Windows 10 Azure AD Join), extracted 10 break/fix entries (134-143). Topics: AADJ SAML/WS-Fed, Intune MDM, workgroup/NetBIOS hang, AADSTS50097, CloudAP 0xC00484B2, TPM NTE_*, DSREG errors, built-in admin limitation, Fairfax gov tenant. Remaining: 4208 pages.

## 2026-04-05 Phase2 onenote tick (chain ~196→176)

- **Pages processed**: 20 (2 batches of 10; batch 1 was recovery from interrupted run)
- **Batch 1 recovery**: entries 326-334 already in JSONL; confirmed scanned paths; added 1 missing guide-draft pointer (entry 334: Troubleshooting resource)
- **Batch 2 new**: 10 pages from IDO OneAuth/Readiness/PG escalation sections
  - Track A: 0 (no break/fix patterns in this batch)
  - Track B guide-drafts: 3 new (IDO Support Scope, PG Escalation, Readiness Plan → entries 335-337)
  - Skipped: 6 (empty section headers / link-only pages) + 1 file-not-found
- **Dedup**: 3 (batch 1 Track A entries already existed: 326 iPhone SSO, 327 MFA 21v, 328 WAM prompt)
- **Total JSONL lines**: 338 | **Scanned**: 491/635 | **Remaining**: 176

### 2026-04-05 onenote tick (chain continuation - cleanup)
- **Pages processed**: 10 (IDO section: OneAuth subsection x4, Readiness subsection x4, PG escalation, Power BI SP case study)
- **Results**:
  - Track A: 0 (Power BI SP case study was ≥80% duplicate of entra-id-onenote-224)
  - Track B: 0 new (all 4 guide-drafts already created in previous tick: 334-338)
  - Skipped: 5 (empty section headers / link-only pages)
  - Dedup cleanup: removed 8 duplicate JSONL lines from overlapping ticks
- **Scanned**: 501/635 | **Remaining**: 176

### 2026-04-05 ADO Wiki Scan (tick continuation)
- **Source**: `Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Window Devices/RDS AAD Auth Troubleshooting Guide`
- **Batch**: 1 page (26721 chars, exceeded 15k threshold)
- **Track A**: 6 break/fix entries (entra-id-ado-wiki-144 to 149): RDS AAD Auth common issues (AADSTS293004, HAADJ Kerberos, Domain Admin KDC_ERR_TGT_REVOKED, AVD Run-as-Different-User, SSO consent)
- **Track B**: 1 guide draft (entra-id-ado-wiki-150) -> `guides/drafts/ado-wiki-rds-aad-auth-troubleshooting-guide.md` (auth flow, components, tracing methodology)
- **Dedup**: 0 duplicates
- **Scanned**: 57/4264 | **Remaining**: 4207

### 2026-04-05 09:45 — Phase 2 onenote-extract (tick)

- **Pages processed**: 10
- **Track A (break/fix)**: 0 new (1 dedup'd — Power BI service SP auto-disable already in entry 224)
- **Track B (guide drafts)**: 1 new (entra-id-onenote-338: IDO readiness plan), 3 dedup'd (IDO support scope/PG escalation/readiness already in 335-337)
- **Pages skipped (thin content)**: 6 (section headers / link-only pages)
- **Total scanned**: 461 / 635 pages
- **Remaining**: 176
- **Exhausted**: false

| 2026-04-05 | onenote | +8 entries (339-346): PowerApps 21v CA SP, PTA AADSTS50126 sync-rule attrs, PRT Win10-1709 LogonCache bug, B2B OTP wrong flow (501811/50158), Seamless SSO AZUREADSSOACCT missing (81004), Seamless SSO OnPremiseSID SourceAnchor (81011), Alt Login ID PRT Win10-1703, Seamless SSO code-105 status-bar IE | Phase 2 batch |

**Batch details (2026-04-05)**:
- **Scanned**: 10 pages (Conditional Access + Device Registration/Case study)
- **Track A (break/fix)**: 8 new entries (339-346)
- **Deduplicated**: 1 (G Suite provisioning storage limit ~= entra-id-onenote-187)
- **Pages skipped (thin content)**: 2 (Tenant lockout reference-only, Case study section header)
- **Total scanned**: 521 / 635 pages
- **Remaining**: 166 (after deducting 10 from 176; 2 page-classification corrections noted)
- **Exhausted**: false

## 2026-04-05 09:47 | onenote tick
- Pages processed: 10 (8 with content, 2 skipped: empty/reference-only)
- New entries: 8 (IDs 339-346)
- Deduplicated: 1 (G Suite provisioning storage limit = entra-id-onenote-187)
- Topics: CA+PowerApps 21V, PTA smart lockout, PRT Win10 1709 LogonCache, B2B OTP flow bug, Seamless SSO (AZUREADSSOACCT/sourceAnchor/code 105), Alt Login ID PRT
- Remaining: ~166 pages
- Exhausted: false

## 2026-04-05 ado-wiki tick (WAM SSO TSG)
- Page: Troubleshooting WAM related SSO issues (81475 chars)
- Track A: 5 break/fix entries (DMA/AADSTS9002341, 0x80070520, AADSTS135011, DPAPI 0x8009002C, AV/AppLocker 0x42b)
- Track B: 1 guide draft (comprehensive WAM TSG with 20+ error scenarios)
- IDs: entra-id-ado-wiki-151 ~ 156
- Progress: 58/4264 scanned

## 2026-04-05 onenote-extract tick (SSO/DeviceReg case studies)
- Processed: 10 pages (SSO case sharing + device registration)
- Track A: 4 new issues (347-350): SAML token lifetime mismatch, AADSTS50107 issuerID, tenant-level cert, 80180026 MDM conflict
- Track B: 2 guide drafts (351-352): Fiddler SSO provisioning, Hybrid AADJ 801c03f2 process
- Deduplicated: 4 (Replicon→191, WHFB→252, prompt=login→160, Seamless SSO→346)
- Remaining: 156 pages

## 2026-04-05 onenote-extract tick (entra-id)
- Pages processed: 10
- Track A extracted: 2 (entra-id-onenote-353, 354 — PRT lifecycle behaviors)
- Track B guide-draft: 1 (onenote-rds-aad-auth-rdp-protocol-trace.md)
- Deduplicated: 1 (refresh token MaxInactiveTime → matches entra-id-onenote-199)
- Skipped: 6 (empty/images-only/links-only/contact-info)
- JSONL total: 348, Scanned: 491/635, Remaining: 146
- Exhausted: false

## 2026-04-05 Phase2-onenote tick (SSO/Device Registration case studies)

- **Pages processed**: 10 (SSO case studies + device registration)
- **Track A (break/fix)**: 6 entries (entra-id-onenote-353..358)
  - SAML AuthnInstant lifetime mismatch
  - SAML Entity ID URL misconfigured
  - AADSTS50107 HAADJ claim rules issuer mismatch
  - Tenant-level cert vs app-level cert (UseCustomTokenSigningKey)
  - AAD join 80180026 MDM auto-enroll conflict
  - Seamless SSO IE code 105 status bar setting
- **Track B (guide-draft)**: 2 entries (entra-id-onenote-359..360)
  - SSO provisioning Fiddler troubleshooting guide
  - HAADJ complete process walkthrough (801c03f2)
- **Deduplicated (skipped)**: 2
  - AADJ SSO to on-prem with WHFB (>=80% overlap w/ onenote-252/254)
  - prompt=login Forms Auth (>=80% overlap w/ onenote-160)
- **Remaining**: ~146 pages
- **Exhausted**: false

## 2026-04-05 ado-wiki tick (chain)
- **Page**: Authentication/Device Registration/Window Devices/Troubleshooting Windows 10 Azure AD Joined Authentication
- **Track**: A (Break/Fix) — 5 entries extracted (IDs 157-161)
- **Topics**: PRT troubleshooting error codes (STATUS_LOGON_FAILURE, STATUS_NO_SUCH_LOGON_SESSION, AADSTS50155, AADSTS50126, WS-Trust SAML tokens empty)
- **Preread**: Cached lengths for 20 additional pages
- **Progress**: 59/4264 scanned

## 2026-04-05 09:57 — onenote-extract batch (Device Registration tools/config)
- Pages processed: 10 (4 empty/link-only skipped)
- Track A (break/fix): 1 entry (AADJ OOBE cached credential behavior)
- Track B (guide-draft): 5 guides (proxy config, authlog, SSO trace sample, connectivity script, device join process)
- IDs: entra-id-onenote-356 to entra-id-onenote-361
- Remaining: ~146

## 2026-04-05 09:59 — onenote-extract (tick)

- Pages processed: 10 (4 with content, 6 empty/minimal)
- Track A entries: 3 (IDs 361, 362, 365)
- Track B guide-drafts: 3 (IDs 363, 364, 366)
- Deduplicated: 0
- Scanned: 501/635, Remaining: 136
- Guide drafts written: onenote-device-registration-proxy-config.md, onenote-auth-log-collection.md
- Topics: AADJ cached logon, device registration proxy (WinHTTP vs WinINET), Mooncake connectivity testing, auth log collection, device join process
| 2026-04-05 | onenote-extract | +4 entries (367-370): 3 Track A + 1 guide-draft. Scanned 10 pages (6 skipped: empty/link-only/file-not-found). Scanned: 511/635, Remaining: 126. Guide: onenote-hybrid-join-cheatsheet-mooncake.md. Topics: Fiddler WinHTTP for device join, ForceNetworkLogon PRT refresh registry, AzureAdPrt not acquired after AAD join, Hybrid Join Mooncake cheat sheet |

| 2026-04-05 | ado-wiki | +6 entries (160-165): 6 Track A. Scanned 1 page (22K chars). Scanned: 60/4264, Remaining: 4204. Topics: WebView2 integration in WAM - IdP compatibility, enablement troubleshooting, 3rd-party interference, ACL permissions, firewall blocking, System vs Evergreen runtime escalation |
### 2026-04-05 10:05 — entra-id onenote tick
- Pages processed: 10 (Readiness path section — training curriculum pages)
- New entries: 0 (all pages were readiness tracking/templates with no extractable knowledge)
- Deduplicated: 0
- Scanned total: 531/635
- Remaining: 116
- Pages: Readiness Refine 2024, Readiness by topics, 1Cross-Cloud B2B, == not GA in MC ==, Identity Protection, Seamless SSO, Tenant Restriction, ==self learning no checkpoint==, Directory Deletion, AAD B2B

### 2026-04-05 ado-wiki tick (Windows Devices batch)
- **Pages**: Windows 10 Subscription Activation, Windows 365 AADJ Cloud PC
- **Extracted**: 5 entries (entra-id-ado-wiki-166 ~ 170)
- **Track A**: 5 break/fix triples (Win10 license check, token acquisition, W365 PKU2U, W365 Per-User MFA, W365 case routing)
- **21v**: W365 entries marked 21vApplicable=false (W365 not available in Mooncake)
- **Deduplicated**: 0
- **Progress**: 62/4264 scanned

### 2026-04-05 Phase 2 onenote-extract (Readiness topics batch)
- **Pages processed**: 10 (Readiness by topics: B2C, AADDS, Password Protection, PowerShell, Reporting, ADFS, Access Review, App Gallery SSO, App Integration, App Proxy)
- **Extracted**: 6 entries (entra-id-onenote-380 ~ 385)
- **Track A**: 6 break/fix triples (ADFS 21v TLS/ISP, MSOL retired→MgGraph, adfshelp deprecated, Access Review Jarvis, AADDS cloud user hash sync, B2C tenant VM/AADDS limitation)
- **Deduplicated**: 4 (B2C Kusto/correlation, b2clogin.cn endpoint, b2c-extensions-app, ADFS version history)
- **Note**: Also cleaned JSONL file: removed 13 duplicate entries + 2 broken JSON lines from previous runs
- **Progress**: 567/635 scanned (68 remaining)

### 2026-04-05 — OneNote Batch (continuation)
- **Scanned**: 10 pages (AAD Connect Feature not ready yet + TSG section)
- **Extracted**: 8 entries (entra-id-onenote-380 ~ 387)
  - 380: User provisioning conditional attribute mapping (Mid/Switch/Replace)
  - 381: G Suite provisioning blank page (aad.portal vs portal.azure.com)
  - 382: Zendesk connector duplicate groups bug (Joining property)
  - 383: Connect Health alert email not received by additional recipients
  - 384: Health Agent ADDS install fails (PowerShell proxy not set) [relatedTo 294]
  - 385: Connect Health portal "Unable to access data" (group membership >200)
  - 386: Health.AadSync.Host.exe crash (version mismatch)
  - 387: PTA inactive + Event 12019 (TLS SHA512 disabled on WS2012R2, KB2975719)
- **Skipped**: 2 pages (TSG section header empty; Configuration wizard = link only)
- **Deduplicated**: 0 (entry 384 marked relatedTo 294 at ~40% overlap)
- **Progress**: 619/635 scanned (48 remaining)

### 2026-04-05 Phase2 batch (final batches → exhausted)
- **Source**: onenote (Mooncake POD Support Notebook - Troubleshooting Tools)
- **Pages processed**: 28 (3 batches of 10+10+8)
- **New entries**: 15 (entra-id-onenote-388 to entra-id-onenote-402)
  - Track A (break/fix): 3
    - 394: ADFS WIA fails when Fiddler captures HTTPS (skip decryption fix)
    - 395: Fiddler system account capture (PsExec + netsh winhttp proxy)
    - 401: LogsMiner CME auth setup for Mooncake
  - Track B (guide-drafts): 12
    - 388-390: AAD Connect TSG (no-start-ma, Kerberos proxy, proxyAddress) [from crash recovery]
    - 391: CME Permission and MSODS access setup
    - 392: Mooncake Entra ID tool readiness (Kusto endpoints, portals, PowerShell)
    - 393: Ember log collection tool
    - 396: DS Explorer (Mooncake)
    - 397: ESTS CDN infrastructure (EdgeNext, CDNetworks, IP ranges)
    - 398: First Party Portal + AAD-FirstPartyApps repo
    - 399: ITData decoder (token field mapping, AuthMethodModes)
    - 400: Jarvis & Kusto query examples (EvoSTS, MSODS, AAD DS, IAMUX)
    - 402: MultiCAEvaluationLog decoder (CA policy evaluation)
- **Deduplicated**: 3 (AuthLog/SSO trace dup with 367/368; Authenticator log dup with 247)
- **Skipped**: 10 (empty container pages: ClaimsXray, Commercial tool, Device Reg & Join, MFA; link-only: Deletion threshold, End to end TS, Password Writeback, Performance issues, RPC server, Tech Sharing)
- **Guide drafts created**: 8 new files in guides/drafts/
- **Progress**: 707/635 scanned (0 remaining) → **EXHAUSTED**

## 2026-04-05 10:35 — Phase 2 onenote-extract (final batch)

- **Pages processed**: 18 (10 + 8 remaining)
- **New JSONL entries**: 15 (entra-id-onenote-394 to entra-id-onenote-408)
  - Track A (break/fix): 6 entries
  - Track B (guide-draft): 9 entries
- **New guide drafts**: 9 files created in guides/drafts/
- **Topics**: Troubleshooting Tools section — CME/MSODS setup, Mooncake Kusto endpoints, AuthLog/TTT collection, WAM SSO trace, Ember tool, Jarvis queries, KQL templates, MultiCAEvaluationLog decoder, Authenticator log Powerlift, LogsMiner CME auth
- **Status**: **EXHAUSTED** — all 635 entra-id pages in page-classification.jsonl have been scanned
- **Total JSONL entries**: 408 (in known-issues-onenote.jsonl)

## 2026-04-05 10:46 — ado-wiki tick
- Scanned 1 page (LAPS backed up to Azure AD, 62548 chars)
- Extracted 5 Break/Fix issues (Event 10059/10025/10032, HTTP 400/403) + 1 guide draft
- New entries: entra-id-ado-wiki-171..176, deduped: 0
- Progress: 63/4264 scanned (1.5%)

## 2026-04-05 11:20 — ado-wiki tick
- Scanned 2 pages (Bulk leave HAADJ 3647 chars, Pending Devices HAADJ 6830 chars)
- Track B: 1 guide draft (bulk-leave-hybrid-aad-join-state) — GPO Immediate Task bulk dsregcmd /leave
- Track A: 2 Break/Fix entries — Pending device registration (network connectivity; device removed from Entra ID)
- New entries: entra-id-ado-wiki-177..179, deduped: 0
- Pre-read 20 page lengths cached (indices 110-129, App Management section)
- Progress: 65/4264 scanned (1.5%)

### 2026-04-05 ADO Wiki Batch (Hybrid Join mega-page)
- Source: Supportability/AzureAD — Device Registration / Hybrid Join / Win10 Automatic Device Registration
- Track B: 1 guide draft (ado-wiki-troubleshooting-win10-automatic-device-registration.md) — 109K char comprehensive guide
- Track A: 7 Break/Fix entries:
  - TPM 1.2 FIPS 0x80280036 (disable TPM)
  - TPM Keyset 0x80090016 (clear/reset TPM)
  - TPM lockout Event 1026 (unlock/clear TPM)
  - SSL cert failure 0xcaa82f8f (add root cert to trusted store)
  - Managed domain 0x801c03f2 cert not found (dsregcmd /leave + cleanup + sync)
  - Managed domain 0x801c03f2 device not found (verify sync + dsregcmd /leave)
  - Dual state Hybrid+Workplace join (upgrade RS5 / WPJCleanUp / registry block)
- New entries: entra-id-ado-wiki-180..187, deduped: 0
- Batch size: 1 page (109K chars, over 15K budget, minimum 1 rule applied)
- Progress: 66/4264 scanned (1.5%)
| 2026-04-05 | ado-wiki | +24 entries (entra-id-ado-wiki-188~211): 8 pages scanned — Entra Kerberos Hybrid Join (3 error codes + guide), Slow Logon on Hybrid Devices, VDI Persistent/Non-Persistent (golden image, dual device, roaming profiles + guide), BitLocker Recovery Keys Audit (API headers, self-service, roles + guide), BitLocker Troubleshooting (key loss, 200-limit, dual state, backup failure), RDP to AADJ (PKU2U error + guide), Device Registration Settings grayed out, SID-to-GUID mapping, Shared Device Mode troubleshooting | ADO Wiki scan batch |

## 2026-04-05 ADO Wiki Batch — App Management / Agent ID + Feature Announcements

- **Source**: ado-wiki (AzureAD wiki)
- **Pages scanned**: 7 (Agent ID/How to, Labs, Learning Path, Scoping, Troubleshooting; Application Experience Microlearning Catalog; Feature Announcement Reference)
- **Track A entries**: 2 (AAD Graph API retirement, ADAL→MSAL Recommendations API retirement)
- **Track B guides**: 2 (Agent ID Scoping, App Experience Feature Announcements)
- **Skipped**: 5 placeholder/training pages
- **IDs**: entra-id-ado-wiki-212 ~ 215
- **Progress**: 83/4264 pages scanned (1.9%)

### 2026-04-05 ado-wiki batch (Admin Consent Workflow)
- **Pages scanned**: 1
- **Track A (Break/Fix)**: 2 entries (AADSTS90097 no reviewer, AADSTS65004 user declined consent)
- **Track B (Guide)**: 1 guide draft (azure-ad-admin-consent-workflow.md) — covers workflow config, troubleshooting, Jarvis tracing, Graph API investigation, ICM routing
- **IDs**: entra-id-ado-wiki-216 ~ 218
- **Dedup**: 0 skipped
- **Exhausted**: false (4180 pages remaining)

### 2026-04-05 ado-wiki blast-batch b (App Management & Consent)
- **Batch ID**: b
- **Pages scanned**: 11 (AWS CLI, ADFS2AAD Features, PowerShell scripts, App Roles, JIRA/Confluence SSO, App Instance Lock, User Consent Settings, SAML apps enum, Oracle Cloud, App Mgmt Policy scripts, Consent Scoping)
- **Track A (Break/Fix)**: 12 entries — AWS provisioning/SSO/token/CA issues, SAML signature verification errors (76020-76025), SAML multi-instancing (76031/76032), App Owner portal restriction, consent policy AADSTS90094/90095, consent bug Aug 2025, Get-MgUser signInActivity 400, AADSTS700213 FIC case sensitivity, SAML app enumeration limitation
- **Track B (Guide)**: 2 guide drafts — JIRA/Confluence SSO (retirement notice + config), Application Instance Lock (feature overview + troubleshooting)
- **Skipped (thin)**: 3 pages (Oracle Cloud Integration, App Management Policy scripts, Consent Scoping — too thin/empty for extraction)
- **IDs**: entra-id-ado-wiki-b-001 ~ 014
- **Dedup**: 0 (new batch file, no prior entries)

### 2026-04-05 ado-wiki blast-batch d (Auth Flows SAML/OAuth + Support Boundaries)
- **Batch ID**: d
- **Pages attempted**: 10 (1 support boundaries, 1 SAML Token Encryption, 8 not found)
- **Pages fetched**: 2 (8 pages removed/renamed from wiki since index was built)
- **Track A (Break/Fix)**: 5 entries
  - d-001: AADSTS700016 PnP Management Shell multitenant disabled (AppId 31359c7f)
  - d-002: AADSTS700016 Intune PowerShell deprecated AppId (d1ddf0e4)
  - d-003: SAML Token Encryption cert upload failure (wrong format)
  - d-004: SAML Token Encryption TokenEncryptionKeyID not set
  - d-005: SAML Token Encryption key mismatch (public/private key pair)
- **Track B (Guide)**: 2 guide drafts
  - d-006: App Experiences Support Team Boundaries (routing/scoping reference)
  - d-007: Azure AD SAML Token Encryption (configuration + TSG + Kusto queries)
- **IDs**: entra-id-ado-wiki-d-001 ~ 007
- **Dedup**: 0 (new batch file)
- **Not found pages**: 8/10 — OAuth2.0 OBO, OIDC Discovery, SAML Reference, PKCE, OAuth2.0 Auth Code TSG, AADSTS50011, SAML assertions, SAML token inspection (likely removed/reorganized)

### 2026-04-05 ado-wiki blast-batch b (CBA + Phone Sign-in)
- **Batch ID**: b
- **Pages attempted**: 10 (9 CBA pages + 1 Phone Sign-in page)
- **Pages with content**: 5 (5 empty pages: Sign in flow, Support Ticket Analysis, TSG, iOS iPadOS Known Issues, MFA Phone Sign In Troubleshooter)
- **Track A (Break/Fix)**: 12 entries
  - b-001~008: CBA Limitations & Known Issues — AADSTS1001000 (wrong UPN+cert), AADSTS1001003 (wrong cert), federated CBA→native override, AADSTS50034 (binding mismatch), AADSTS130501 (credential policy), revoked cert generic error (7000214), CA upload portal bug, ERR_SSL_CLIENT_AUTH_SIGNATURE_FAILED (TLS 1.3 RSA-PSS)
  - b-009~012: New Trust Store — revocation bypass when old store empty, deleted CAs not scoped, 10-min cache propagation delay, hard-delete 400 preview limitation
- **Track B (Guide Drafts)**: 4 guide drafts with JSONL pointer entries (b-013~016)
  - cba-how-to-build-your-lab.md (Intune Cloud PKI lab setup)
  - cba-introduction.md (CBA overview, federated vs native, PIV keys)
  - cba-learning-path-training-materials.md (deep dives, ATC session links)
  - cba-new-trust-store.md (PKI container management, API/Portal/PS, CA coexistence)
- **IDs**: entra-id-ado-wiki-b-001 ~ 016
- **Dedup**: 1 (page 4 Issue 9 "Federated CBA No Longer Works" ≥80% overlap with b-003)
- **21v**: All 21vApplicable=true (CBA in preview for Mooncake per 21v-gaps.json)
| 2026-04-05 | ado-wiki-batch-b | 4 break/fix known-issues (biometric lost in-place upgrade, Cloud Kerberos Trust incompatible w/ Cert Trust, Cloud Kerberos Trust requires initial DC sign-in, Cloud Kerberos Trust lockout w/ Credential Guard). 4 guide drafts (WHfB case scoping, WHfB data analysis/log investigation, WHfB introduction/overview, WHfB limitations index). 5 empty pages skipped (O7/O8/Data collection/Sign-in flow/TSG). 10 pages scanned from WHfB section. | ADO Wiki AzureAD: Hello for Business |
| 2026-04-05 | ado-wiki-batch-c | 2 break/fix (proxyAddress/mail conflict causing B2B invitation failure, B2B service logs PII-redacted since 2023-08). 1 guide draft (B2B service logs search TSG with Kusto queries for aadb2bprod.westus2). 9 pages empty (parent/hub pages: B2B Kusto queries, 8× B2C Custom Policy sub-sections). 10 pages scanned from B2B + B2C Custom Policy sections. | ADO Wiki AzureAD: B2B collaboration, B2C Custom Policy |

### 2026-04-05 ado-wiki batch-a (blast)
- **pages**: 10 (Sync Provisioning: AAD Connect PHS/PWB/SSSO TSG, Cloud Sync FAQs/Labs/Setup/TSG/Training, Sync Engine FAQ/Labs)
- **result**: all 10 pages returned empty content (parent/hub pages with no leaf content)
- **discovered**: 0 | **deduplicated**: 0 | **drafts**: 0
- **note**: these wiki paths are navigation nodes only; actual TSG content lives in sub-pages
| 2026-04-06 | ado-wiki (blast-b) | +27 entries (25 break/fix + 2 guide-drafts) from 10 TAP/FIDO2/Passkey pages | batch-b |

### Blast Batch b Details
- **batchId**: b
- **pages**: 10 (TAP, TAP Internal Guest, FIDO2 Android Data Collection, FIDO2 Android Brokered, EPOW, FIDO2 Lab, FIDO2 Intro, FIDO2 Learning, MS Authenticator Passkeys, Passkey Profiles)
- **Track A (break/fix)**: 25 entries covering TAP known issues (8), TAP guest accounts (1), EPOW known issues (3), MS Authenticator Passkeys known issues (12), Passkey Profiles (1)
- **Track B (guide-draft)**: 2 entries (FIDO2 Android Data Collection guide, FIDO2 Introduction guide)
- **Skipped**: 2 pages (FIDO2 Auth Android Brokered=minimal content, FIDO2 Learning=training links only)
- **21V tagged**: Authenticator Passkeys not supported in China/Mooncake
- **ID range**: entra-id-ado-wiki-b-r4-001 to entra-id-ado-wiki-b-r4-027
- **discovered**: 27 | **deduplicated**: 0

## 2026-04-06 ado-wiki blast batch-a (r5)

- **batchId**: a
- **pages**: 10 (FIDO2 Passkey Profiles, 7x Synced Passkey registration flows, WHfB Cloud Kerberos credential guard, WHfB Key Trust enrollment)
- **Track A**: 5 break/fix entries
  - Passkey Profile save failure (missing profile link)
  - Passkey policy size limit exceeded (20KB)
  - Registration campaign behavior change after auto-enablement
  - WHfB Cloud Kerberos Trust + Credential Guard account lockout
  - WHfB Key Trust enrollment fails (wrong GPO for certificate trust)
- **Track B**: 7 guide-draft entries (synced passkey registration flows x7)
- **Total JSONL**: 12 entries → `.enrich/known-issues-ado-wiki-a.jsonl`
- **Scanned**: 10 pages → `.enrich/scanned-ado-wiki-a.json`
- **Dedup**: 0 (no overlap with existing entries)

| 2026-04-06 | ado-wiki blast-a-r7 | +18 entries (WHfB Common Scenarios: P11/P12/P2/P3/P4/P5/P7/P8/P9/S1). Track A: 17 break/fix, Track B: 1 guide draft (device-registration). Topics: UAC blocks PIN, TPM lockout PRT, ADFS token-binding, sync delay, RA not advertising, cert template issues, device writeback, multiple templates, claims providers, CXH failure, cancel-only dialog, GPO blocking, ADFS 2019 ugs scope, MFA cache by-design, RODC key-trust. IDs: entra-id-ado-wiki-a-r7-001~018 | ADO Wiki WHfB/Common scenarios |
- **ID range**: entra-id-ado-wiki-a-r5-001 ~ 012
| 2026-04-06 | ado-wiki (blast-b) | +11 entries (9 break/fix + 2 guide-drafts) from WHfB common scenarios, built-in features, lab setup, trust identification. IDs entra-id-ado-wiki-b-r7-001~011. 10 pages processed. | Supportability/AzureAD WHfB wiki pages |
| 2026-04-06 | ado-wiki blast-b-r8 | +18 entries (12 break/fix, 6 guide-drafts). 10 pages: WHfB FAQ, TPMs, Authenticator PSI, Web Sign-in, WebAuthN/RDP, Graph query. Track A: cert validity, GPO/Intune conflict, PIN removal/reset, dual-state device, lockout limits, KDC EKU, AAD DS unsupported, Graph null/orphan credentials. Track B: TPMs guide, PSI objects, PSI intro, WSI guide, WebAuthN/RDP guide, Authenticator security enhancements. 21v: 3 entries tagged 21v-unsupported (Authenticator PSI). IDs entra-id-ado-wiki-b-r8-001~018. 2 redirect pages skipped. | Supportability/AzureAD Passwordless WHfB/FIDO/Authenticator wiki |
| 2026-04-06 | ado-wiki (blast-b) | Scanned 10 pages: 2 redirects (WHfB Cloud Kerberos Trust, WHfB TPMs), 1 not-found (WHfB Known Issues), 7 wiki-meta (Content Development). 0 issues extracted — all pages are wiki authoring guides, not TSG content. | batchId=b |

| 2026-04-06 | ado-wiki | blast batch-a r12: 10 pages processed, 0 discovered (3 redirects/404, 7 Content Development meta-docs with no TSG value) | Supportability/AzureAD/AzureAD:/Authentication/WHfB + Content Development/* || 2026-04-06 | ado-wiki blast-b-r11 | +5 break/fix (Customer Lockbox: PIM timing, inherited owner, stuck pending, APIRunner501, runner no-logs) +5 guide drafts (Kusto queries, Debug RAE, JIT details, Runners, email tracking). 10 pages processed, 2 skipped (minimal content). | Supportability/AzureAD/AzureAD:/Customer LockBox/* |

| 2026-04-06 | ado-wiki blast-a-r15 | +6 break/fix (Customer Lockbox: PIM notification failure, inherited owner role, stuck pending 4d, APIRunner501, runner no-logs/JIT policy, auto-approve internal sub) +9 guide drafts (Kusto queries, workflow/permissions, Debug RAE, JIT details, Runners mgmt, Service Logging, MS Graph endpoint, email tracking, debugging no-logs). 10 pages processed. | Supportability/AzureAD/AzureAD:/Customer LockBox/* |
## 2026-04-06 | ado-wiki blast-batch-c

- batchId: c | pagesProcessed: 10 | discovered: 10 | deduplicated: 0
- Track A (Break/Fix): 5 entries (seq 001-005)
  - B2C self-asserted page version mismatch after update
  - B2C SUSI user flow Undefined error (page layout < 2.1.19)
  - B2C users redirected to wrong IDP after session expiry (shared Session Mgmt TP)
  - B2C phone MFA blocked: subscription requirement (May 2023 change)
  - B2C custom policy: ApplicationObjectId missing in TechnicalProfile Metadata
- Track B (guides): 5 drafts written to guides/drafts/ado-wiki-c-{name}.md
  - TSG AFD <> B2C 504 errors (3-scenario Kusto-based decision tree)
  - TSG AppInsights integration with B2C (2-scenario: policy troubleshooting + user activity)
  - B2C embedded pages in iframe (feature guide + limitations + config)
  - B2C phone signup signin builtin policy (configuration how-to)
  - B2C Custom OIDC Identity Providers for Built-in Policies (setup guide)
- Files: known-issues-ado-wiki-c.jsonl, scanned-ado-wiki-c.json

| 2026-04-07 | MERGE+SYNTHESIZE | 37 topics (36 fusion, 1 compact), 3640 entries, 8 Kusto queries fused, 713 drafts mapped |
