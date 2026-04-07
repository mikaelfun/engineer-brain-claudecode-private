# ASC TSG: Investigate Role Assignments

> Source: ASC TSG for a role assignment SR:2109300040000875
> Status: draft (pending SYNTHESIZE review)

## Steps

### 1. Collect Role Assignment Info from Customer
- Subscription ID
- Resource name (e.g. ACR name)
- Assigned object name (e.g. principal name)
- Assignment ID (optional - can be found in ASC)

### 2. Find Role Assignment Details in ASC
1. Go to **ASC > Resource** (e.g. the ACR resource)
2. Navigate to **Resource Explorer > Access Control > Role assignment**
3. Find the target role (e.g. "Acr Pull")
4. Locate the assigned object by principal name

### 3. Find Who Created the Assignment
1. From step 2, copy the **"Assignment Created by"** Object ID
2. Go to **ASC > Tenant Explorer > Directory object**
3. Paste the Object ID and click **Run**
4. This reveals the identity that created the role assignment

## Notes
- This workflow is useful when customers ask "who assigned this role" or need audit trail for role assignments
- Works for both Azure RBAC and Entra ID directory roles
- For Mooncake: use `azuresupportcenter.chinacloudapi.cn`
