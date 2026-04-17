# AVD AVD 自定义镜像 (Part 2) - Comprehensive Troubleshooting Guide

**Entries**: 4 | **Drafts fused**: 1 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-a-custom-image-upload-failure.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: OneNote

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| After sysprep/capture of AVD VM and deploying from custom im... | Custom image VM needs fresh AVD agent installation and regis... | 1) Verify RD Agent services running. 2) Check HKLM Software ... |
| Sysprep fails with error on AVD session host image after ins... | Windows Update patches for the installed language pack are n... | After installing language pack, MUST run Windows Update and ... |
| AVD VM deployment stuck at OOBE screen when using custom ima... | CD-ROM device was disabled in the custom image. During AVD V... | Re-enable the CD-ROM device in Device Manager before capturi... |
| AVD session host VM (v4 series without temp disk) shows erro... | Mooncake AVD custom image unattend.xml hardcodes pagefile to... | Run ConfigurePagefile.ps1 via Custom Script Extension: REG A... |

### Phase 2: Detailed Investigation

#### Kusto queries
> Source: [ado-wiki-a-custom-image-upload-failure.md](guides/drafts/ado-wiki-a-custom-image-upload-failure.md)

[Queries for custom image upload failure.](https://supportability.visualstudio.com/Windows365/_wiki/wikis/Windows365%20Support%20Wiki/1217077/Custom-Image-Upload-Failure.-Get-Details-and-ImageId)

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | After sysprep/capture of AVD VM and deploying from custom image, new VM visible ... | Custom image VM needs fresh AVD agent installation and registration. Agent from ... | 1) Verify RD Agent services running. 2) Check HKLM Software Microsoft RDInfraAge... | 🔵 6.0 | OneNote |
| 2 | Sysprep fails with error on AVD session host image after installing language pac... | Windows Update patches for the installed language pack are not applied before ru... | After installing language pack, MUST run Windows Update and install ALL patches ... | 🔵 6.0 | OneNote |
| 3 | AVD VM deployment stuck at OOBE screen when using custom image. Panther logs sho... | CD-ROM device was disabled in the custom image. During AVD VM deployment, an ISO... | Re-enable the CD-ROM device in Device Manager before capturing the custom image.... | 🔵 6.0 | OneNote |
| 4 | AVD session host VM (v4 series without temp disk) shows error at first logon. Pa... | Mooncake AVD custom image unattend.xml hardcodes pagefile to D:/pagefile.sys. VM... | Run ConfigurePagefile.ps1 via Custom Script Extension: REG ADD PagingFiles to ?:... | 🔵 6.0 | OneNote |
