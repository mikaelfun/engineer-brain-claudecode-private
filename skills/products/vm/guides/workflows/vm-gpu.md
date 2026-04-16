# VM GPU — 排查工作流

**来源草稿**: ado-wiki-a-flickering-nvidia-gpu.md, onenote-gpu-extension-tsg-index.md
**Kusto 引用**: (无额外 Kusto 查询文件)
**场景数**: 6
**覆盖子主题**: vm-gpu
**生成日期**: 2026-04-07

---

## Scenario 1: Flickering Nvidia Gpu
> 来源: ado-wiki-a-flickering-nvidia-gpu.md | 适用: Mooncake \u2705

### 排查步骤
## Troubleshooting
During initial troubleshooting, we noted that nvidia-smi was successfully detecting the A10 GPU. This strongly suggested that the workload was running directly on the Standard_NV72ads_A10_v5 VM and not within a nested virtual machine — unless passthrough was meticulously configured.

---

## Scenario 2: Solution 1: Update the NVIDIA Driver
> 来源: ado-wiki-a-flickering-nvidia-gpu.md | 适用: Mooncake \u2705

### 排查步骤
### Solution 1: Update the NVIDIA Driver
```
sudo dnf config-manager --add-repo https://developer.download.nvidia.com/compute/cuda/repos/rhel8/x86_64/cuda-rhel8.repo
sudo dnf module install nvidia-driver:latest-dkms
sudo reboot
```
In the above scenarios, rhel8 repo was used since the environment was RHEL 8.9.

`[来源: ado-wiki-a-flickering-nvidia-gpu.md]`

---

## Scenario 3: Solution 2: Change the session from Wayland to X11
> 来源: ado-wiki-a-flickering-nvidia-gpu.md | 适用: Mooncake \u2705

### 排查步骤
### Solution 2: Change the session from Wayland to X11
Check current session:
```
echo $XDG_SESSION_TYPE
```
If it returns **Wayland**, then switch to **X11**:
```
sudo vi /etc/gdm/custom.conf

`[来源: ado-wiki-a-flickering-nvidia-gpu.md]`

---

## Scenario 4: Solution 3: Change the Current Settings
> 来源: ado-wiki-a-flickering-nvidia-gpu.md | 适用: Mooncake \u2705

### 排查步骤
### Solution 3: Change the Current Settings
Sometimes rendering instability can stem from refresh rate mismatches or composition pipeline issues.
```
sudo dnf install nvidia-settings
nvidia-settings
```
- Disable G-SYNC or VRR (Variable Refresh Rate)
- Enable "Force Full Composition Pipeline" to reduce tearing/flickering

`[来源: ado-wiki-a-flickering-nvidia-gpu.md]`

---

## Scenario 5: Solution 4: Update the Kernel
> 来源: ado-wiki-a-flickering-nvidia-gpu.md | 适用: Mooncake \u2705

### 排查步骤
### Solution 4: Update the Kernel
Outdated kernels may not play nicely with newer GPU modules or driver versions.
```
uname -r  # Check current kernel version
sudo dnf update kernel
sudo reboot
```

`[来源: ado-wiki-a-flickering-nvidia-gpu.md]`

---

## Scenario 6: Solution 5: Check the RDP client
> 来源: ado-wiki-a-flickering-nvidia-gpu.md | 适用: Mooncake \u2705

### 排查步骤
### Solution 5: Check the RDP client
If using a remote desktop setup (RDP, NICE DCV, VNC, etc.), screen flickering could also be due to:
- Protocol mismatch
- Client-side refresh rate
- Display driver/rendering pipeline
**Recommended Action:** Try a different RDP or remote desktop client or lower display resolution or refresh rate.
If the issue still persists after trying all above steps, engage the HPC & AI Support Team following the GPU Driver Engagement Matrix.

---

## 关联已知问题

| 症状 | 方案 | 指向 |
|------|------|------|
