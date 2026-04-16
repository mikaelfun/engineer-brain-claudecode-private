# Entra ID Service Principal Management — 排查工作流

**来源草稿**: ado-wiki-c-kudu-console-test-managed-identity.md, ado-wiki-c-soft-deleted-service-principals.md, ado-wiki-f-managed-identity-vms.md, ado-wiki-h-kdc-err-s-principal-unknown-0x7-service-principal-unknown.md, onenote-managed-identity-msgraph.md
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: Testing Managed Identity on Azure Web App via Kudu Console
> 来源: ado-wiki-c-kudu-console-test-managed-identity.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps**
   - 1. Browse to the Azure Web App in Azure Portal
   - 2. Check **Identity** tab to verify System Assigned or User Assigned identity is assigned. Note the principal object ID.
   - 3. Go to **Development Tools > Advanced Tools** and click **Go** to open Kudu Console

---

## Scenario 2: Feature Overview
> 来源: ado-wiki-f-managed-identity-vms.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting**
   - The parameter to force creation of a new access\_token from IMDS is "**bypass\_cache=true**". Usage would look like:
   - curl "http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https%3A%2F%2Fmanagement.azure.com%2F&bypass_cache=true" -H Metadata:true

---

## Scenario 3: KDC_ERR_S_PRINCIPAL_UNKNOWN (0x7) [Service Principal Unknown]
> 来源: ado-wiki-h-kdc-err-s-principal-unknown-0x7-service-principal-unknown.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Resolution**
   - If the application is Microsoft, involve the proper team. Otherwise, suggest the customer to involve the vendor.
2. **Resolution**
   - Avoid using Flat NetBIOS names for cross-domain/forest resources.
   - Reconsider/correct name resolution or register the alternate SPN to the corresponding computer account object.
   - To register the alternate SPN to a computer account, use setspn.exe. Reference article about publishing an SPN: [Manually Registering SPNs](https://social.technet.microsoft.com/wiki/contents/articles/
3. **Resolution**
   - Search Active Directory to see if the SPN is registered or registered to multiple accounts in the whole forest (using parameter /t 3268 to contact a Global Catalog (GC)):
   - Use LDIFDE to search the directory ("http/" after "serviceprincipalname=" should be modified by the SPN that is missing. * is a wildcard):
4. **Resolution**
   - This mapping can be verified and defined by the Active Directory (AD) attribute **_sPNMappings_** on dn: CN=Directory Service,CN=Windows NT,CN=Services,CN=Configuration,DC=contoso,DC=com.
   - LDIFDE command to dump the object and check the attribute:
5. **Resolution**
   - None required, the false positive will trigger a client retry.
6. **Resolution**
   - After checking potential registration conflict, add the alternative UPN suffix to the trusting forest following the steps described in this article [Enable or Disable an Existing Name Suffix from Rout
   - **Please notice that you may experience also the error if an alternative UPN suffix is being re-used**:
   - If an alternative UPN suffix was previously configured on a different forest in the infrastructure and was then removed and re-used in a different forest, domain controllers for all the domains in the
7. **Resolution**
   - Establish a Bi-directional Forest Trust

---
