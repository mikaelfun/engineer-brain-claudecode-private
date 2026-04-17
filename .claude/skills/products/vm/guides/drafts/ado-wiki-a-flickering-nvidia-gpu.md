---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/TSGs/Extension/Flickering in screen nvidia gpu_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20(AGEX)%2FTSGs%2FExtension%2FFlickering%20in%20screen%20nvidia%20gpu_AGEX"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Issue

Customer reported a significant issue with their server experiencing high-frequency screen flickering during post-processing. The flickering was severe enough to disrupt their tasks.

## Environment

Customer was using a RHEL 8.9 VM with SKU Standard_NV72ads_A10_v5.

## Troubleshooting

During initial troubleshooting, we noted that nvidia-smi was successfully detecting the A10 GPU. This strongly suggested that the workload was running directly on the Standard_NV72ads_A10_v5 VM and not within a nested virtual machine — unless passthrough was meticulously configured.

## Possible Causes

In this scenario, there might be multiple factors like GPU, driver, display configuration, and application-level factors that may be contributing to the screen flickering.

1. NVIDIA Driver Version
2. Wayland vs. X11 Display Session
3. GPU Rendering Settings (nvidia-settings)
4. Kernel Compatibility
5. Remote Display or Physical Monitor Issues

## Solution/Mitigation

### Solution 1: Update the NVIDIA Driver

```
sudo dnf config-manager --add-repo https://developer.download.nvidia.com/compute/cuda/repos/rhel8/x86_64/cuda-rhel8.repo
sudo dnf module install nvidia-driver:latest-dkms
sudo reboot
```

In the above scenarios, rhel8 repo was used since the environment was RHEL 8.9.

### Solution 2: Change the session from Wayland to X11

Check current session:

```
echo $XDG_SESSION_TYPE
```

If it returns **Wayland**, then switch to **X11**:

```
sudo vi /etc/gdm/custom.conf
# Add or uncomment: WaylandEnable=false
sudo reboot
```

### Solution 3: Change the Current Settings

Sometimes rendering instability can stem from refresh rate mismatches or composition pipeline issues.

```
sudo dnf install nvidia-settings
nvidia-settings
```

- Disable G-SYNC or VRR (Variable Refresh Rate)
- Enable "Force Full Composition Pipeline" to reduce tearing/flickering

### Solution 4: Update the Kernel

Outdated kernels may not play nicely with newer GPU modules or driver versions.

```
uname -r  # Check current kernel version
sudo dnf update kernel
sudo reboot
```

### Solution 5: Check the RDP client

If using a remote desktop setup (RDP, NICE DCV, VNC, etc.), screen flickering could also be due to:
- Protocol mismatch
- Client-side refresh rate
- Display driver/rendering pipeline

**Recommended Action:** Try a different RDP or remote desktop client or lower display resolution or refresh rate.

If the issue still persists after trying all above steps, engage the HPC & AI Support Team following the GPU Driver Engagement Matrix.
