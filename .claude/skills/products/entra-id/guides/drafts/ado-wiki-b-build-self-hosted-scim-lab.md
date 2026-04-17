---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/SyncFabric/Outbound provisioning/Deployment/Build your own self-hosted SCIM lab"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FSyncFabric%2FOutbound%20provisioning%2FDeployment%2FBuild%20your%20own%20self-hosted%20SCIM%20lab"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Build your own self-hosted SCIM endpoint with a persistent non-SQL database

This lab is based in the following development: https://github.com/jelhub/scimgateway

This tutorial is aimed to configure this tool to use **Loki** (non-SQL lightweight database engine: https://github.com/techfort/LokiJS ) as persistent data storage for our SCIM endpoint. It is the simplest and much lighter of the supported implementations included.

However, this tool can also be used as SCIM gateway for other applications, such as MS-SQL, MongoDB, LDAP (Pre-configured for MS Active Directory) or even AzureAD for inbound provisioning.

## Step 1: Create your server first

**Note**: This procedure assumes an Azure VM server installation. If you prefer to use your MyWorkspace, see **Appendix A**.

1. **Create a new Azure VM** with Windows Server Datacenter 2016/2019/2022
   - Standard_B2s is sufficient
   - VM needs a public IP address and an Azure DNS name

## Step 2: Install Bun

1. Log-in into the machine and install **bun** (via PowerShell):
   ```
   powershell -c "irm bun.sh/install.ps1 | iex"
   ```

2. **Install SCIM Gateway** (run elevated as Administrator):
   ```
   mkdir c:\my-scimgateway
   cd c:\my-scimgateway
   bun init -y
   bun install scimgateway
   bun pm trust scimgateway
   ```

3. Modify settings in `c:\my-scimgateway\config\plugin-loki.json`:
   - `"port": 9000` (default is 8880)
   - `"console": "debug"` for debug logging
   - Set `username` and `password` under `auth.basic`
   - Set `token` under `auth.bearerToken` (used as "Secret Token" in provisioning admin credentials)
   - Set `tenantIdGUID` under `auth.bearerJwtAzure` to your Azure tenant ID
   - Set `"persistence": true` under `endpoint` for persistent database

4. Start app: `bun c:\my-scimgateway`

5. Configure Windows Firewall:
   ```
   netsh advfirewall firewall add rule name="SCIMportTCP9000" dir=in action=allow protocol=TCP localport=9000
   netsh advfirewall firewall add rule name="SCIMportUDP9000" dir=in action=allow protocol=UDP localport=9000
   ```

6. Verify port is listening: `netstat -ano | find "9000"`

## Azure Networking Configurations

1. Allow VM to listen on port from AzureAD sources:
   - Go to VM network configuration > Add inbound port rule
   - Set **Source: Service Tag** and **Source service tag: AzureActiveDirectory**

### Entra ID - Provisioning

1. Create a new non-gallery Application from Enterprise Applications
2. Navigate to **Provisioning blade** > choose Automatic provisioning mode
3. Enter SCIM endpoint: `http://DNSname.region.cloudapp.azure.com:port`
   - Use HTTP (not HTTPS) unless certificate configured
   - Enter the "shared-secret" token
4. Click **Test Connection** to verify
5. Assign users/groups under "Users and groups"
   - Groups require AAD Premium subscription
6. Start provisioning from Provisioning blade

## Appendix A: Using Microsoft Myworkspace

- Requires External IP Address
- Create Inbound Port NAT entry mapping external port to internal port (9000)
- Assign public IP Address
- Create A record DNS (e.g., scimlab10.myworkspace.microsoft.com)
- Activate External Connectivity JIT

## Appendix B: Using Postman for testing

- Add personal IP to Azure VM network configuration for port 9000
- Set User/Password in Authorization field

## Appendix C: Check SCIM provisioning activity

- Review Provisioning Logs in enterprise app
- Check my-scimgateway console on server for correlated SCIM activity
