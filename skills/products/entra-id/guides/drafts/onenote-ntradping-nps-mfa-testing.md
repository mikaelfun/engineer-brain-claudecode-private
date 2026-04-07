# NTRadPing: NPS + Azure MFA Extension RADIUS Testing Guide

> Source: OneNote - Mooncake POD Support Notebook / Azure AD / MFA On-prem / NTRadPing tool

## Prerequisites

- Existing ADFS environment
- New VM joined to AD domain
- NPS server installed and configured

## Step 1: NPS Configuration

1. Register NPS in AD domain (add to "RAS and IAS Servers" security group)
2. Configure **Network Policy**:
   - Target: domain users (for testing)
   - Authentication: select **PAP** (required for NTRadPing tool)
   - Authentication method support by protocol:
     - **PAP** — supports all MFA methods (phone call, SMS, app notification, app code)
     - **CHAPv2/EAP** — supports phone call and mobile app notification only
3. Configure **Connection Request Policy**: decide whether to do primary user authentication

## Step 2: Configure RADIUS Client (NTRadPing Simulated Client)

- Set server IP, port, and shared secret (must match NPS RADIUS Client config)
- Enter test user's UPN and password

## Step 3: Install NPS Extension for Azure MFA

1. Run the NPS extension setup script (modify parameters for your environment)
2. Modify registry settings
3. Verify certificate is uploaded to AAD

## Step 4: Testing Flow

### First Request (Challenge)
1. Enter username and password in NTRadPing
2. Click **Send**
3. Response should return **Access-Challenge** with a State attribute

### Second Request (MFA Verification)
1. Copy the **State** value from the challenge response
2. Add State to **Additional Attributes** in NTRadPing
3. In the **Password** field, enter the OTP code (depends on user's default MFA method: SMS code, app code, or approve/deny)
4. Click **Send**
5. Response should return **Access-Accept**

> **IMPORTANT**: Make sure to input OTP in the Password field at the second step!

## Supported MFA Methods via RADIUS

| Method | PAP | CHAPv2/EAP |
|--------|-----|------------|
| Phone Call | ✅ | ✅ |
| SMS Code | ✅ | ❌ |
| App Notification | ✅ | ✅ |
| App Code (OATH) | ✅ | ❌ |

## References

- [Register NPS in AD Domain](https://learn.microsoft.com/zh-cn/windows-server/networking/technologies/nps/nps-manage-register)
- [NTRadPing Usage](https://support.secureauth.com/hc/en-us/articles/360019651812-How-To-Test-RADIUS-Using-NTRadPing)
