# Intune macOS 应用部署 — 排查速查

**来源数**: 3 | **21V**: 全部适用
**条目数**: 7 | **最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | macOS LOB app update deployed via Intune does not apply on device. Device still shows old version... | The updated .pkg and .intunemac file do not have incremented BuildNumber and ... | 1. Increment <version> parameter in pkgbuild when creating the updated component package. 2. Rebu... | 🟢 9.0 | OneNote |
| 2 | macOS LOB app (.pkg) re-packaged by third-party tool (e.g., sudre) installs successfully but Intu... | Re-packaged .pkg apps have empty install-location key in bundle info (pkgutil... | 1. Run pkgutil --pkg-info-plist <bundleID> to verify install-location is populated (should be App... | 🟢 9.0 | OneNote |
| 3 | macOS LOB 应用无法设置为 Uninstall 部署类型 | macOS LOB 应用只有在部署时设置了 'Install as Managed' = Yes 的情况下才支持 Uninstall 部署类型 | 重新部署应用时确保 'Install as Managed' 选项设置为 Yes，然后才能使用 Uninstall assignment type | 🟢 8.5 | ADO Wiki |
| 4 | macOS LOB 应用（dynamic library/ktext 类型 pkg）通过 Intune 部署后安装失败 | pkg 的 PackageInfo 文件中 install-location 不是 /Applications 或其子目录，或缺少有效的 app bund... | 1. 用 xar -x -f <pkg> -C <output> 解压 pkg；2. 检查 PackageInfo：install-location 必须是 /Applications 或子目录... | 🟢 8.5 | ADO Wiki |
| 5 | macOS 设备 Rotate Recovery Lock Password 操作不可用或密码轮换失败 | Recovery Lock 需满足前提条件：(1) macOS 11.5+ Apple Silicon；(2) 已通过 Settings Catalog ... | 1. 确认设备为 Apple Silicon 且 macOS ≥ 11.5；2. 通过 Settings Catalog 启用 EnableRecoveryLockPassword 并配置 Ro... | 🟢 8.5 | ADO Wiki |
| 6 | macOS configuration profile Prevent automatic app updates cannot be set to TRUE. Setting fails to... | Platform-side bug in Intune preventing the Prevent automatic app updates sett... | PG confirmed as platform bug and applied hotfix. If issue persists, file ICM for PG investigation. | 🟢 8.0 | OneNote |
| 7 | Error 0x87D13BA2 'One or more apps contain invalid bundleIDs' when deploying macOS LOB app, even ... | Multiple applications included in the macOS app package; not all individual a... | 1) Run 'sudo /usr/libexec/mdmclient QueryInstalledApps > InstalledApps.txt' on device. 2) Compare... | 🔵 7.5 | MS Learn |

## 快速排查路径
1. 1. Increment <version> parameter in pkgbuild when creating the updated component package. 2. Rebuild distribution archive with productbuild. 3. Re-wra `[来源: OneNote]`
2. 1. Run pkgutil --pkg-info-plist <bundleID> to verify install-location is populated (should be Applications). 2. Re-package the .pkg with correct insta `[来源: OneNote]`
3. 重新部署应用时确保 'Install as Managed' 选项设置为 Yes，然后才能使用 Uninstall assignment type `[来源: ADO Wiki]`
4. 1. 用 xar -x -f <pkg> -C <output> 解压 pkg；2. 检查 PackageInfo：install-location 必须是 /Applications 或子目录；3. 确保至少有一个 app bundle 包含有效的 CFBundleIdentifier 和 CFB `[来源: ADO Wiki]`
5. 1. 确认设备为 Apple Silicon 且 macOS ≥ 11.5；2. 通过 Settings Catalog 启用 EnableRecoveryLockPassword 并配置 RotationSchedule；3. 用 Kusto 验证策略是否已下发（查 IntuneEvent Sce `[来源: ADO Wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/app-macos.md#排查流程)
