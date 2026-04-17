# Cross-Cloud B2B PoC Setup Steps

> Source: OneNote - Cross Cloud B2B / Technical details / PoC steps
> Status: GA (was Private Preview → Public Preview → GA)

## Prerequisites

- Tenant in both Azure Commercial and Azure China
- Global Administrator access on both tenants

## Steps

### 1. Enable Cross-Cloud B2B Settings

**Azure Commercial Portal:**
1. Navigate to: `portal.azure.com` → Azure AD → External Identities → Cross-tenant access settings
2. Go to **Microsoft cloud settings**
3. Enable **Microsoft Azure China**

**Azure China Portal:**
1. Navigate to: `portal.azure.cn` → Azure AD → External Identities → Cross-tenant access settings
2. Go to **Microsoft cloud settings**
3. Enable **Microsoft Azure Commercial**

### 2. Add Partner Organization (Resource Tenant Side)

Assuming Azure China = Resource Tenant, Azure Commercial = Account Tenant:

1. In Azure China Portal → Organizational Settings → **Add Organization**
2. Enter the Azure Commercial tenant ID
3. Configure **Inbound Access** → Allow access

If AAD Premium is enabled, configure Trust Settings (trust MFA, device compliance, etc.)

### 3. Configure Outbound Access (Account Tenant Side)

1. In Azure Commercial Portal → Organizational Settings → **Add Organization**
2. Enter Azure China tenant ID
3. Set **Outbound Access Policy** → Allow accounts to access external applications
4. With AAD Premium: can restrict to specific users/groups and specific apps

### 4. Invite Guest Users

1. In Resource Tenant (Azure China) → Azure AD → Users → New guest user
2. Enter the Global Azure account UPN
3. **Important:** Consumer accounts (LiveID) NOT supported - use onmicrosoft.com

### 5. First Login as Guest

1. Navigate to `portal.azure.cn/<tenant_ID>` (MUST use tenanted endpoint!)
2. Sign in with the Guest Account
3. Accept resource access permissions on first login

### 6. Enable SharePoint Access (Optional)

1. In SharePoint admin center → Sharing → Allow existing guests
2. Guest user can access SharePoint sites

## Key Gotchas

- **Tenanted endpoint required**: `portal.azure.com` or `portal.azure.cn` alone will NOT work
- **No consumer accounts**: Only organizational accounts (onmicrosoft.com / custom domain)
- **License required**: For O365 app access, assign license to guest account
- **SharePoint auth**: Use UPN, not email address
