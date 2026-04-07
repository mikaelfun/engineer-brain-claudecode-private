# Enable CUDA on NV Series (NVadsA10v5) Linux VM

> Source: OneNote - 4.11-Enable CUDA on NVadsA10v5 Series VM running Ubuntu
> Related: vm-onenote-208, vm-onenote-128

## Background

- **NC Series**: Designed for HPC and Deep Learning Training → use **CUDA** driver (NVIDIA published)
- **NV Series**: Designed for Remote Visualization → use **GRID** driver (Microsoft redistributed, includes GRID license)
- NVv4 uses AMD GPU, not applicable for CUDA/GRID
- It is NOT recommended to install both CUDA and GRID on Azure VM (unlike personal GPU cards)
- NVIDIA GPU Driver Extension works on Global Azure but must be manually installed on Azure China

## Problem

On Linux NV series, installing CUDA driver directly causes **OS no-boot**.

## Workaround: Install GRID First, Then CUDA Toolkit

### Prerequisites
- Ubuntu 22.04, Standard NV6ads A10 v5

### Steps

```bash
# 1. System preparation
sudo apt-get update
sudo apt upgrade
sudo reboot
sudo apt install gcc -y
sudo apt install make -y
sudo apt-get install linux-headers-$(uname -r)

# 2. Install GRID driver (535 version recommended for Mooncake)
# Latest (550) may not work in Mooncake
wget https://download.microsoft.com/download/8/d/a/8da4fb8e-3a9b-4e6a-bc9a-72ff64d7a13c/NVIDIA-Linux-x86_64-535.161.08-grid-azure.run -O NV-grid.run -nv
sudo sh NV-grid.run
nvidia-smi   # Verify GRID driver
sudo reboot

# 3. Install CUDA toolkit (SKIP driver!)
wget https://developer.download.nvidia.com/compute/cuda/11.8.0/local_installers/cuda_11.8.0_520.61.05_linux.run
sudo sh cuda_11.8.0_520.61.05_linux.run
# IMPORTANT: Deselect "Driver" during installation, only install toolkit

# 4. Verify
nvidia-smi
sudo reboot
nvidia-smi
/usr/local/cuda-11.8/bin/nvcc -V
```

## Key Notes

- On **Windows**: Just install CUDA drivers directly (no issue)
- On **Linux**: Must install GRID first → then CUDA toolkit (skip driver)
- GRID driver 550 has known issues in Mooncake; use 535 version
- After kernel upgrade, NVIDIA driver may disappear (see vm-onenote-128)

## References

- [Azure N-series NVIDIA GPU driver setup](https://learn.microsoft.com/en-us/azure/virtual-machines/windows/n-series-driver-setup)
- [NVIDIA CUDA Installation Guide](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html)
