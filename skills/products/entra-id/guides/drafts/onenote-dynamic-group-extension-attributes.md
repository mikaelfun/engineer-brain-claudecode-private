# Dynamic Group Rules with Extension Attributes and Custom Extension Properties

## Overview
How to write dynamic membership rules for Azure AD groups using extension attributes (synced from on-prem AD) and custom extension properties.

## Two Approaches

### Solution 1: Use Extension Attributes (On-Prem AD Side)
- Extension attributes synced from on-prem AD use format `ExtensionAttributeX` (X = 1-15)
- If the desired attribute is stored in a custom extension property (e.g. `extension_<GUID>_msExchExtensionAttribute42`), create an AAD Connect sync rule to map it to a standard `extensionAttributeX`
- Example: Sync `extension_msExchExtensionAttribute42` to `extensionAttribute11`, then use in rule:
  ```
  (user.extensionAttribute8 -eq "STD") -and (user.accountEnabled -eq true) -and (user.extensionAttribute11 -eq "ADMITTED")
  ```

### Solution 2: Use Custom Extension Properties (Azure AD Side)
- Custom extension properties use format: `user.extension_[GUID]__[Attribute]`
- `[GUID]` = unique identifier of the app that created the property in Azure AD
- Find the GUID from ASC (Azure Support Center) or via MS Graph
- Example rule:
  ```
  (user.extensionAttribute8 -eq "STD") -and (user.accountEnabled -eq true) -and (user.extension_aea2d9ea7933415c934a64847a035617_msExchExtensionAttribute42 -eq "ADMITTED")
  ```

## Key Points
- Extension attributes (1-15) are the simplest to use in dynamic rules
- Custom extension properties require knowing the app GUID
- Both approaches work for dynamic group membership evaluation

## Source
- OneNote: AAD Connect Case Study
- Ref ID: entra-id-onenote-319
