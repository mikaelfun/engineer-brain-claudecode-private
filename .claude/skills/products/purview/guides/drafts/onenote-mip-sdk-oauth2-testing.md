# MIP SDK OAuth2 Token Testing for Mooncake

## Purpose
Python script to test MIP SDK OAuth2 token generation and SyncFile API in 21Vianet (Mooncake) environment.

## Prerequisites
- Python + `msal` + `requests` packages
- App registration in 21Vianet AAD with Azure Rights Management Services API permission
- Permission: `user_impersonation` on Azure Rights Management Services

## Key Endpoints (Mooncake)
| Component | Endpoint |
|-----------|----------|
| Authority | `https://login.partner.microsoftonline.cn/{tenantId}` |
| Resource | `https://syncservice.o365syncservice.com/` |
| SyncFile API | `https://cn01b.dataservice.protection.partner.outlook.cn/PsorWebService/v1/SyncFile` |

## Usage
```bash
python test.py -a https://login.partner.microsoftonline.cn/{tenantId} -r https://syncservice.o365syncservice.com/ -c <client_appid>
```

## Flow
1. Uses MSAL `PublicClientApplication` with device code flow
2. Acquires token with scope `{resource}/.default`
3. Calls SyncFile API with bearer token
4. Parses XML response to list available labels/SIT types

## Headers Required
```
Authorization: Bearer {token}
Content-Type: application/xml;charset=utf-8
ClientInfo: mip_ver=1.8.102;os_name=win;os_ver=6-2-9200;runtime=msvc-1916;arch=x64
```

## SyncFile Types
- `TenantDlpSensitiveInformationType` - List tenant DLP sensitive info types
- Other types available per MIP SDK documentation

## Source
- OneNote: Mooncake POD Support Notebook > AIP > MIP SDK support > Sample code to test MIP SDK with oauth2 token
