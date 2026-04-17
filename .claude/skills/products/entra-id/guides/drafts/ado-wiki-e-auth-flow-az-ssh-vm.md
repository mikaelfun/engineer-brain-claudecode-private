---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/Other/Auth Flow Test"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FOther%2FAuth%20Flow%20Test"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Authentication Flow: az ssh vm

The authentication flow diagram below does not account for the `az login` command that precedes the `az ssh vm --ip <IPaddress>` command.

**IMPORTANT** Many of these calls can be observed by adding `--debug` to the `az login` and `az ssh vm --ip <IPaddress>` commands.

## az login

1. The user issues an `az login` command which opens the browser to URL `https://login.microsoftonline.com/common/oauth2/authorize...` where the user is prompted for credentials to sign into the **Microsoft Azure CLI** application in order to gain access to `https://management.core.windows.net`.
2. The token server `https://login.microsoftonline.com/common/oauth2/token` responds with an access token in a POST call.
3. A GET call is made for `https://management.azure.com/tenants` to find all the subscriptions to which the user has access.

## az ssh vm <IPaddress>

**NOTE**: In this flow, no data is saved to the disk at the host side, and user information is written to the VM only when their account is provisioned at login.

1. The user issues the `az ssh vm --ip <address>`
   - This triggers an `ssh-keygen` call to itself where a temporary key is generated.
   - The user token is retrieved from memory and a connection is established with `https://login.microsoftonline.com`.
   - `ssh-keygen` calls `http://169.254.169.254/metadata/login/ca_keys?api-version=2019-03-11` requesting a list of certificate authority (CA) keys used by eSTS to sign tokens.
   - At this point an OpenSSH Certificate GET request is sent along with a public key to ESTS at `/<tenantID>/v2.0/.well-known/openid-configuration`.

2. ESTS signs and returns an OpenSSH cert containing the End User's Information (EUII) of UPN, tenantID and email.

3. A login request using the SSH certificate containing the UPN, tenantID and email is sent to the SSHD daemon running on the VM. This triggers the SSHD daemon to call the aad_certhandler daemon (aka: the handler).

Steps 4-7 only contain public, non-personal data that is cached in IMDS memory running on the Azure host for 1 hour.

4. The handler validates the user and tenant and issues a GET Certificate Authority (CA) Certificate request to the IMDS login provider running on the Azure host. This call is intended for the **Azure Linux VM Sign-In** service in Azure AD.

   `http://169.254.169.254/metadata/identity/oauth2/token?resource=ce6ff14a-7fdc-4685-bbe0-f6afdfcfa8e0&api-version=latest_internal`

5. The IMDS login provider proxies the GET CA Certificate request call that was intended for the **Azure Linux VM Sign-In** service in Azure AD over to ESTS.

6. ESTS returns a certificate containing signing keys to the IMDS login provider.

7. The IMDS login provider returns the certificate containing signing keys to the handler (the SSHD daemon).

## Key Components

- **ESTS**: Enterprise Security Token Service (login.microsoftonline.com)
- **IMDS**: Instance Metadata Service (169.254.169.254)
- **aad_certhandler**: AAD certificate handler daemon on the VM
- **Azure Linux VM Sign-In service**: Resource ID `ce6ff14a-7fdc-4685-bbe0-f6afdfcfa8e0`

## Debugging Tips

- Add `--debug` flag to `az login` and `az ssh vm` commands to observe the auth flow calls
- Certificate and token data in steps 4-7 is cached in IMDS for 1 hour
- No persistent data is written to the host disk during this flow
