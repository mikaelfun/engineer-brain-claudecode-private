# Intune Android Device Management in China

## Overview
Managing Android devices with Intune in China requires special considerations due to Google Mobile Services (GMS) being blocked by the Great Firewall.

## Key Limitations

### Push Notification Delay
- Intune uses Google Play Services for push notifications to Android devices
- In China, GMS is blocked, so push notifications do not work
- Devices will still check in every **8 hours** on their own without push notifications
- Policy application may be delayed up to 8 hours (vs near-instant in other regions)
- Unlike iOS (which depends on APNS), Android can still function without push — just delayed

### Company Portal Sync vs Check Device Settings
- **Sync** = policy update — Company Portal syncs policy settings with Intune check-in service
- **Check Device Settings** = current device status refresh — pulls reported compliance status from Intune

## OEM-Specific Configuration (Critical)

### Huawei Devices
To prevent battery optimization from killing Company Portal:
1. **Auto-start**: Settings > More Settings > Permission Management > Permission > Auto Start > Startup > enable Company Portal
2. **Battery optimization**: Device settings > battery optimization > disable for Company Portal and Outlook
3. **Phone Manager**: Configure Company Portal auto-launch in Huawei Phone Manager
4. **Restart the device** after all changes

Chinese instructions:
1. 打开公司门户并登录
2. 点击设备 > 选择当前设备 > 点击检查设备设置
3. 完成之后请再次点击检查设备设置
4. 点击左上角的菜单按钮 > 点击设置 > 点击同步
5. 等大概5-10分钟，去Intune网站查看设备的合规情况

Battery optimization (华为):
1. 在系统设置中搜索电池优化 > 找到公司门户 > 选择不允许
2. 打开手机管家 > 应用启动管理 > 找到公司门户 > 选择手动管理 > 允许以下3项

## Related Known Issues
- intune-onenote-030: Android enrollment/MAM not working in China (GMS)
- intune-onenote-031: MAM policy not enforced intermittently
- intune-onenote-066: Huawei battery optimization kills Company Portal
- intune-onenote-067: OPPO app optimization blocks MAM

## Source
- OneNote: Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Intune/## Android TSG/Android in China.md
