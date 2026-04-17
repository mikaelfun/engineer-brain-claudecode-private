# ADFS Banned IPs Feature (2016+)

> Source: OneNote POD Notebook — ADFS Sharing
> Status: draft

## Overview

AD FS on Windows Server 2016 introduced **Banned IPs** with the June 2018 update. This feature blocks requests from specified IP addresses **before authentication**, preventing account lockout attacks.

## Key Points

- Previous approach: authorization claim rules to deny requests → evaluated AFTER authentication → does NOT prevent lockout
- New feature: blocks IPs BEFORE authentication → prevents lockout
- Checks IP in request source, `x-forwarded-for`, and `x-ms-forwarded-client-ip` headers

## Event Log

When ADFS receives a request from a banned IP, Event ID logged in ADFS auditing log:
- `ExtranetLockout` audit with `FailureType: ExtranetLockoutError`
- `ErrorCode: AccountRestrictedAudit`
- UserId shows N/A (blocked before auth)

## References

- [Configure AD FS Banned IP](https://docs.microsoft.com/en-us/windows-server/identity/ad-fs/operations/configure-ad-fs-banned-ip)
