# VM Vm Extension D — 排查速查

**来源数**: 1 | **21V**: 未标注
**条目数**: 2 | **关键词**: extension, d
**最后更新**: 2026-04-07

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Linux VM extension fails with non-zero exit code 126. All extensions fail to execute. | /var partition mounted with noexec flag in /etc/fstab, blocking script execution... | Check /etc/fstab for noexec on /var. Remount: mount -o remount,exec /var | 🔵 7.5 | OneNote |
| 2 | Guest Agent: Unable to connect to remote server. SocketException: target machine actively refused it... | machine.config has proxy settings overriding GuestAgent WebClient, redirecting t... | Remove proxy config from machine.config, or upgrade WinGA to >= 2.7.41491.992 wh... | 🔵 7.5 | OneNote |
