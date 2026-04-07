# AVD ADFS SSO Configuration Guide (Mooncake)

> Source: OneNote - Mooncake POD Support Notebook
> Status: draft

## Overview

Windows OS does not support modern authentication apart from username/password and certificates (virtual smart card). By configuring ADFS SSO for AVD, certificates are issued by ADFS on behalf of the user to sign into the session host, eliminating the second credential prompt.

## Setup Steps

1. **Add CA role on Domain Controller**
   - Must be configured as Enterprise CA

2. **Create certificate templates**
   - ADFS Enrollment Agent template
   - ADFS SSO template
   - Doc: https://docs.azure.cn/en-us/virtual-desktop/configure-adfs-sso#create-the-enrollment-agent-certificate-template

3. **Create Key Vault and configure ADFS server**
   - Configure ADFS to use the new certificate templates
   - Set relying-party trust to support SSO (can use "shared key" option)
   - Doc: https://docs.azure.cn/en-us/virtual-desktop/configure-adfs-sso#configure-the-ad-fs-servers
   - **Note**: Remove brackets from sample commands in the doc (they are not accurate)

4. **Configure host pool RDP properties**
   - Doc: https://docs.azure.cn/en-us/virtual-desktop/configure-adfs-sso#configure-your-azure-virtual-desktop-host-pool
   - Verify: `Get-AzWvdHostPool -Name "<pool>" -ResourceGroupName "<rg>" | fl *`

## User Experience

- Login to RD Web Client or RD client
- Launch AVD session - no second credential prompt
- CA server shows smart card certificate (virtual smartcard/login token) issued to the user

## Common Issues

1. **ADFS login error during user sign-in**: Ensure "Certificate Authentication" is enabled as an authentication method in ADFS
2. **Transient connection failure after SSO config**: May be a transient platform issue; retry next day
