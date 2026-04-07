# ADFS SAML RelayState — IDP-Initiated SSO Configuration

**Source**: OneNote — ADFS and WAP / Feature_specific configuration / RelayState

## Overview

RelayState is a SAML protocol parameter used in IDP-initiated SSO to redirect users to a specific application after authenticating at the ADFS IDP-initiated sign-on page.

## When to Use

- Relying party has a **SAML endpoint** (not WS-Federation)
- Need to automate IDP-initiated sign-on to a specific application
- Customer wants a single URL that logs in and redirects to target app

## Supported Flows (ADFS 2.0 Rollup 2+)

1. IDP STS → RP STS (SAML-P endpoint) → SAML RP App
2. IDP STS → RP STS (SAML-P endpoint) → WIF (WS-Fed) RP App
3. IDP STS → SAML RP App

**Not supported**: IDP STS → WIF (WS-Fed) RP App directly

## URL Construction Steps

1. Get the Relying Party Identifier (from ADFS Management Console → RP → Identifiers tab)
2. Get the RelayState value (target application URL)
3. URL-encode both values
4. Merge into: `RPID=<encoded-RPID>&RelayState=<encoded-RelayState>`
5. URL-encode the merged string
6. Append to: `https://<adfs-server>/adfs/ls/idpinitiatedsignon.aspx?RelayState=<double-encoded-string>`

## Alternative: loginToRp

If the RP is the application itself (no chaining):
```
https://adfs.contoso.com/adfs/ls/idpinitiatedsignon.aspx?loginToRp=<rpidentifier>
```

## Tools

- RelayState URL Generator: https://jackstromberg.com/adfs-relay-state-generator/

## Key Notes

- When using RelayState, any parameters outside of it are dropped
- Requires ADFS 2.0 with Rollup 2 or later (Windows Server 2012 R2+)
