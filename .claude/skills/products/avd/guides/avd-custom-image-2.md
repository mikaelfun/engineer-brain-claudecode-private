# AVD AVD 自定义镜像 (Part 2) - Quick Reference

**Entries**: 4 | **21V**: all applicable
**Keywords**: agent-registration, cd-rom, custom image, custom script extension, custom-image, deployment stuck, dism, golden-image
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | After sysprep/capture of AVD VM and deploying from custom image, new VM visible ... | Custom image VM needs fresh AVD agent installation and registration. Agent from ... | 1) Verify RD Agent services running. 2) Check HKLM Software Microsoft RDInfraAge... | 🔵 6.0 | OneNote |
| 2 📋 | Sysprep fails with error on AVD session host image after installing language pac... | Windows Update patches for the installed language pack are not applied before ru... | After installing language pack, MUST run Windows Update and install ALL patches ... | 🔵 6.0 | OneNote |
| 3 📋 | AVD VM deployment stuck at OOBE screen when using custom image. Panther logs sho... | CD-ROM device was disabled in the custom image. During AVD VM deployment, an ISO... | Re-enable the CD-ROM device in Device Manager before capturing the custom image.... | 🔵 6.0 | OneNote |
| 4 📋 | AVD session host VM (v4 series without temp disk) shows error at first logon. Pa... | Mooncake AVD custom image unattend.xml hardcodes pagefile to D:/pagefile.sys. VM... | Run ConfigurePagefile.ps1 via Custom Script Extension: REG ADD PagingFiles to ?:... | 🔵 6.0 | OneNote |

## Quick Triage Path

1. Check: Custom image VM needs fresh AVD agent installation `[Source: OneNote]`
2. Check: Windows Update patches for the installed language `[Source: OneNote]`
3. Check: CD-ROM device was disabled in the custom image. Du `[Source: OneNote]`
4. Check: Mooncake AVD custom image unattend.xml hardcodes p `[Source: OneNote]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-custom-image-2.md#troubleshooting-flow)
