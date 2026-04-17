# INTUNE macOS 应用部署 — 已知问题详情

**条目数**: 40 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: macOS LOB app (.pkg) fails to install via Intune. App shows NotInstalled in Kusto. Running .pkg locally works fine. MDM Console log shows 'failed E...
**Solution**: 1. Build component package: pkgbuild --root <payload> --scripts <scripts> --version <version> --identifier <id> ./<name>_component.pkg. 2. Create distribution archive: productbuild --package <name>_component.pkg <name>.pkg. 3. Sign with Developer ID Installer certificate. Verify signature: pkgutil --check-signature <name>.pkg (leaf cert must show 'Developer ID Installer'). 4. Wrap with IntuneAppUtil to create .intunemac. 5. If download hangs, restart downloadd process via Activity Monitor or reb
`[Source: onenote, Score: 9.5]`

### Step 2: macOS LOB app update deployed via Intune does not apply on device. Device still shows old version. App was repackaged but Intune does not detect th...
**Solution**: 1. Increment <version> parameter in pkgbuild when creating the updated component package. 2. Rebuild distribution archive with productbuild. 3. Re-wrap with IntuneAppUtil. 4. Verify detection parameters: ./IntuneAppUtil -r <filename.intunemac> -v — check that BuildNumber and VersionNumber are higher than the currently deployed version. 5. Both base app BundleId and version fields must match for in-place update.
`[Source: onenote, Score: 9.5]`

### Step 3: macOS LOB app (.pkg) with multiple sub-components installs successfully but Company Portal shows 'Install' instead of 'Re-Install'. Kusto reports N...
**Solution**: 1. Extract the pkg to inspect: xar -x -f <pkg> -C <output>. 2. Check install-location for each component in PackageInfo. 3. If sub-components install outside /Applications, repackage so detection works — either consolidate all into /Applications path or deploy each distribution archive separately. 4. Reference: If a .pkg contains multiple apps/installers, Intune only reports installed when ALL are detected.
`[Source: onenote, Score: 9.5]`

### Step 4: macOS LOB app (.pkg) re-packaged by third-party tool (e.g., sudre) installs successfully but Intune portal shows failed/not installed. MDM logs: Di...
**Solution**: 1. Run pkgutil --pkg-info-plist <bundleID> to verify install-location is populated (should be Applications). 2. Re-package the .pkg with correct install-location in PackageInfo. 3. Compare with working apps to confirm format.
`[Source: onenote, Score: 9.5]`

### Step 5: macOS LOB 应用无法设置为 Uninstall 部署类型
**Solution**: 重新部署应用时确保 'Install as Managed' 选项设置为 Yes，然后才能使用 Uninstall assignment type
`[Source: ado-wiki, Score: 9.0]`

### Step 6: macOS LOB 应用（dynamic library/ktext 类型 pkg）通过 Intune 部署后安装失败
**Solution**: 1. 用 xar -x -f <pkg> -C <output> 解压 pkg；2. 检查 PackageInfo：install-location 必须是 /Applications 或子目录；3. 确保至少有一个 app bundle 包含有效的 CFBundleIdentifier 和 CFBundleVersion；4. 检查 Detection.xml 中无效的 MacOSLobChildApp 元素并移除无 CFBuildVersion 标签的项
`[Source: ado-wiki, Score: 9.0]`

### Step 7: macOS 自动更新应用在 Intune 中显示未安装，版本检测不匹配
**Solution**: 在 Intune 应用配置中启用忽略应用版本（Ignore app version）选项
`[Source: ado-wiki, Score: 9.0]`

### Step 8: Customer expects MAM app protection policies to be applied to macOS LOB app after using IntuneAppUtil wrapping tool (.pkg to .intunemac conversion)
**Solution**: Clarify to the customer that macOS LOB apps are managed via MDM device policies, not app protection policies. The macOS wrapping tool only packages the app into a format Intune can deploy and detect. If the customer needs app-level data protection on macOS, they should explore MDM-based device configuration policies or consider alternative approaches.
`[Source: ado-wiki, Score: 9.0]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | macOS LOB app (.pkg) fails to install via Intune. App shows NotInstalled in K... | The .pkg file was not built as a distribution archive using productbuild. App... | 1. Build component package: pkgbuild --root <payload> --scripts <scripts> --v... | 9.5 | onenote |
| 2 | macOS LOB app update deployed via Intune does not apply on device. Device sti... | The updated .pkg and .intunemac file do not have incremented BuildNumber and ... | 1. Increment <version> parameter in pkgbuild when creating the updated compon... | 9.5 | onenote |
| 3 | macOS LOB app (.pkg) with multiple sub-components installs successfully but C... | The .pkg file contains multiple component installers (e.g., Wireshark has 3 s... | 1. Extract the pkg to inspect: xar -x -f <pkg> -C <output>. 2. Check install-... | 9.5 | onenote |
| 4 | macOS LOB app (.pkg) re-packaged by third-party tool (e.g., sudre) installs s... | Re-packaged .pkg apps have empty install-location key in bundle info (pkgutil... | 1. Run pkgutil --pkg-info-plist <bundleID> to verify install-location is popu... | 9.5 | onenote |
| 5 | macOS LOB 应用无法设置为 Uninstall 部署类型 | macOS LOB 应用只有在部署时设置了 'Install as Managed' = Yes 的情况下才支持 Uninstall 部署类型 | 重新部署应用时确保 'Install as Managed' 选项设置为 Yes，然后才能使用 Uninstall assignment type | 9.0 | ado-wiki |
| 6 | macOS LOB 应用（dynamic library/ktext 类型 pkg）通过 Intune 部署后安装失败 | pkg 的 PackageInfo 文件中 install-location 不是 /Applications 或其子目录，或缺少有效的 app bund... | 1. 用 xar -x -f <pkg> -C <output> 解压 pkg；2. 检查 PackageInfo：install-location 必须... | 9.0 | ado-wiki |
| 7 | macOS 自动更新应用在 Intune 中显示未安装，版本检测不匹配 | 应用支持自动更新后版本号与上传到 Intune 的版本不一致，DeviceManagementProvider 日志可确认版本差异 | 在 Intune 应用配置中启用忽略应用版本（Ignore app version）选项 | 9.0 | ado-wiki |
| 8 | Customer expects MAM app protection policies to be applied to macOS LOB app a... | The macOS App Wrapping Tool (IntuneAppUtil) does NOT inject MAM app protectio... | Clarify to the customer that macOS LOB apps are managed via MDM device polici... | 9.0 | ado-wiki |
| 9 | macOS LOB app (.pkg) not installed on targeted devices with no error messages... | The .pkg package is missing required information: package version/CFBundleVer... | Contact app developer to rebuild .pkg package with correct pkg-info containin... | 8.0 | mslearn |
| 10 | The Intune Admin portal may encounter an exception when modifying a customize... | See https://icm.ad.msft.net/imp/v3/incidents/details/33122122/home for details. | Have the administrator edit the application in MISPA. You don�t need to chang... | 7.5 | contentidea-kb |
| 11 | OverviewAndroid Enterprise System Apps: https://docs.microsoft.com/en-us/intu... |  |  | 7.5 | contentidea-kb |
| 12 | Guide for testing LOB MSI deployments in Intune using 7Zip to verify MSI depl... |  |  | 7.5 | contentidea-kb |
| 13 | Custom packages for MacOS or PKG files must be wrapped or pre-processed with ... | The package or .PKG file does not contain Increment package version and CFBun... | Review the output of Detection.xml to extract the detection parameters and ve... | 7.5 | contentidea-kb |
| 14 | You had set up JAMF-Intune integration appropriately and registered MacOS dev... | During the investigation, JAMF released a new version of 10.6.2 which contain... | After   Jamf released 10.6.2, you had to do the following steps to get the cl... | 7.5 | contentidea-kb |
| 15 | When attempting to wrap a .pkg file using the Intune App Wrapping Tool for Ma... | The packageinfo file was missing from the .pkg package. | The IntuneAppUtil currently only supports flat packages and the .pkg package ... | 7.5 | contentidea-kb |
| 16 | There are times when you need to gather a Packet Capture on macOS from a cust... |  |  | 7.5 | contentidea-kb |
| 17 | After configuring Intune/Jamf integration, Mac clients fail to to enroll and ... | This can occur if the user fails to authenticate via the Company Portal app 3... | To resolve this issue, have the user launch the Company Portal app and sign i... | 7.5 | contentidea-kb |
| 18 | macOS line of business application doesn't install on the device. Problem occ... | Name of .pkg file has spaces.e.g. &quot;Test LOB.pkg&quot; | If the name of a .pkg file has spaces, wrapping of the app using Intune Wrapp... | 7.5 | contentidea-kb |
| 19 | After configuring conditional access for the Outlook mobile app, the app cras... | As of 3/22/2019, this is a known, emerging issue for Outlook. See More Inform... | If you get a similar case, do not assume this is your issue without verifying... | 7.5 | contentidea-kb |
| 20 | Customer enrolls a Mac device into Jamf and attempts to register with Intune,... | These are some typical reasons why the device fails to register:&nbsp;1. The ... | Do the following:1. Check to make sure that the correct permissions are set, ... | 7.5 | contentidea-kb |
| 21 | For steps on how to collect information for troubleshooting, see&nbsp;https:/... |  |  | 7.5 | contentidea-kb |
| 22 | Intune MacOS line-of-business (LOB) apps only support apps packed in the .pkg... |  |  | 7.5 | contentidea-kb |
| 23 | Some MacOS line-of-business (LOB)&nbsp;app developers publish applications as... |  | Create a temporary folder on your Mac and copy the .app file to this location... | 7.5 | contentidea-kb |
| 24 | When publishing a line-of-business (LOB) application to a MacOS device, the I... | MacOS maintains a list of all installed apps through the MDS (metadata servic... |  | 7.5 | contentidea-kb |
| 25 | Before you can deploy, configure, monitor, or protect apps, you must add them... |  |  | 7.5 | contentidea-kb |
| 26 | Customer is trying to register the macOS device using Company Portal from the... | Keychain identity issue | Make sure the customer uses the report button on the company portal error.&nb... | 7.5 | contentidea-kb |
| 27 | Intune uses the IntuneMacSidecar database on the kusto.aria.microsoft.com Kus... |  |  | 7.5 | contentidea-kb |
| 28 | Microsoft Intune App Wrapping Tool for MacOS (IntuneAppUtil) is the package w... |  |  | 7.5 | contentidea-kb |
| 29 | If you've seen any of our Intune workflows then you know how useful a KB with... |  |  | 7.5 | contentidea-kb |
| 30 | This article describes how to use MacOS Intune scripting to install applicati... |  | Example 1:&nbsp; Install a .pkg file from a web site# download the package to... | 7.5 | contentidea-kb |
| 31 | Summary/SymptomYou deploy LOB apps to Mac devices as “Available” type. On the... | If the LOB app supports auto-update function, the Intune detection cannot wor... | The issue can be fixed by turning off version comparison. This can be done in... | 7.5 | contentidea-kb |
| 32 | When deploying an application (in this case Crowdstrike) via Intune as an LOB... | For this customer's situation, it turned out to be a known issue with the PKG... | As a workaround, the customer will need to make sure to have the correct bund... | 7.5 | contentidea-kb |
| 33 | Customers could complain that LOB App for MacOS are not being deployed throug... | Customers could complain that LOB App for MacOS are not being deployed throug... | To fix this issue simply you have to upload the Application again and make su... | 7.5 | contentidea-kb |
| 34 | As an Intune Support Engineer, you should&nbsp;never upload a customer-signed... |  |  | 7.5 | contentidea-kb |
| 35 | There have been numerous requests for Microsoft to look into why a GlobalConn... |  |  | 7.5 | contentidea-kb |
| 36 | Some customers use the Google Play Console to publish LOB apps. After they up... |  |  | 7.5 | contentidea-kb |
| 37 | After configuring conditional access for the Outlook mobile app, the app cras... | As of 3/22/2019, this is a known, emerging issue for Outlook. See More Inform... | If you get a similar case, do not assume this is your issue without verifying... | 4.5 | contentidea-kb |
| 38 | macOS line of business application doesn't install on the device. Problem occ... | Name of .pkg file has spaces. e.g. "Test LOB.pkg" | If the name of a .pkg file has spaces, wrapping of the app using Intune Wrapp... | 3.0 | contentidea-kb |
| 39 | Customer enrolls a Mac device into Jamf and attempts to register with Intune,... | These are some typical reasons why the device fails to register: 1. The permi... | Do the following: 1. Check to make sure that the correct permissions are set,... | 3.0 | contentidea-kb |
| 40 | For steps on how to collect information for troubleshooting, see https://inte... |  |  | 3.0 | contentidea-kb |
