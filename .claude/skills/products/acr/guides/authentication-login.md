# ACR ACR 认证与登录 — 排查速查

**来源数**: 2 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ACR authentication fails with 401/403 after disabling ARM-scoped authentication  | When ARM audience token authentication is disabled on ACR, the registry rejects  | 1) Update auth flow to request ACR-scoped token: az login --scope https://contai | 🟢 9.0 — ADO Wiki交叉验证 | [acr-ado-wiki-026] |
| 2 | Docker push from Docker Desktop fails with UNAUTHORIZED error - all token server | Docker Desktop on Windows uses Windows Credential Manager (wincred). Stale or co | 1) Open Windows Credential Manager. 2) Navigate to Windows Credentials. 3) Find  | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-029] |
| 3 | HTTP GET requests to ACR endpoints (/v2/_catalog, /v2/<repo>/tags/list) return U | Known limitation — ACR Anonymous Pull only supports the Docker registry protocol | This is a confirmed limitation by ACR PG. No workaround available currently. Cus | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-068] |
| 4 | ACR login fails with HTTP 400+ response on /v2/ endpoint when using admin creden | Admin credentials may be incorrect (wrong password from portal), or service prin | 1) Check admin enabled via ACIS GetBasicRegistryDetails endpoint. 2) Query Regis | 🟢 9.0 — ADO Wiki交叉验证 | [acr-ado-wiki-070] |
| 5 | Subset of users cannot list ACR images in Azure Portal with 'Error retrieving Im | Users with large numbers of Azure AD security group memberships generate OAuth2  | This is a known limitation with ACR's header size limit. Workarounds: 1) Reduce  | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-084] |
| 6 | az acr login fails with DOCKER_COMMAND_ERROR: Please verify if Docker client is  | az acr login calls docker login under the hood, requiring both Docker client and | Install Docker Engine, or use az acr login -n <acr-name> --expose-token which do | 🔵 6.0 — MS Learn单源文档 | [acr-mslearn-001] |
| 7 | az acr login fails in Azure Cloud Shell: This command requires running the docke | Azure Cloud Shell only provides Docker CLI, not the Docker daemon required by az | Use az acr login -n <acr-name> --expose-token which works without Docker daemon, | 🔵 6.0 — MS Learn单源文档 | [acr-mslearn-002] |
| 8 | Docker pull/login fails with unauthorized: authentication required when accessin | Authentication failed due to incorrect/expired credentials (admin user password  | 1) Admin user: verify credentials in Access keys blade. 2) Token/scope map: rege | 🟢 8.0 — MS Learn交叉验证 | [acr-mslearn-003] |
| 9 | ACR login fails with Unable to get admin user credentials and CONNECTIVITY_REFRE | The identity (user or managed identity) used to authenticate does not have suffi | Assign the appropriate Azure built-in role (AcrPull, AcrPush, Contributor, Owner | 🟢 8.0 — MS Learn交叉验证 | [acr-mslearn-004] |

## 快速排查路径
1. 检查 → When ARM audience token authentication is disabled on ACR, t `[来源: ADO Wiki]`
   - 方案: 1) Update auth flow to request ACR-scoped token: az login --scope https://containerregistry.azure.ne
2. 检查 → Docker Desktop on Windows uses Windows Credential Manager (w `[来源: ADO Wiki]`
   - 方案: 1) Open Windows Credential Manager. 2) Navigate to Windows Credentials. 3) Find and delete stale ACR
3. 检查 → Known limitation — ACR Anonymous Pull only supports the Dock `[来源: ADO Wiki]`
   - 方案: This is a confirmed limitation by ACR PG. No workaround available currently. Customers needing unaut
4. 检查 → Admin credentials may be incorrect (wrong password from port `[来源: ADO Wiki]`
   - 方案: 1) Check admin enabled via ACIS GetBasicRegistryDetails endpoint. 2) Query RegistryActivity for logi
5. 检查 → Users with large numbers of Azure AD security group membersh `[来源: ADO Wiki]`
   - 方案: This is a known limitation with ACR's header size limit. Workarounds: 1) Reduce the number of Azure 

> 本 topic 有融合排查指南 → [完整排查流程](details/authentication-login.md#排查流程)
