---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Rack Scale/Readiness/ALRS Kube-OVN/KubeVirt  Deploy an Ubuntu VM Pod on Kube-OVN VNET Subnet"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Rack%20Scale/Readiness/ALRS%20Kube-OVN/KubeVirt%20%E2%80%94%20Deploy%20an%20Ubuntu%20VM%20Pod%20on%20Kube-OVN%20VNET%20Subnet"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# KubeVirt — Deploy an Ubuntu VM Pod on Kubernetes

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step 1 — Create the VirtualMachine Resource](#step-1-create-the-virtualmachine-resource)
4. [Step 2 — Start the VM](#step-2-start-the-vm)
5. [Step 3 — Verify the VM is Running](#step-3-verify-the-vm-is-running)
6. [Step 4 — Connect to the VM Console](#step-4-connect-to-the-vm-console)
7. [Cleanup](#cleanup)

---

<a id="overview"></a>
## Overview

This guide walks through creating an Ubuntu virtual machine as a Kubernetes pod using KubeVirt. The VM uses a container disk image (no persistent storage required) and cloud-init for initial provisioning including SSH access and is connected to an Kube-OVN VNET Subnet.

---

<a id="prerequisites"></a>
## Prerequisites

- A running Kubernetes cluster with **KubeVirt** installed (operator + CR)
- **Kube-OVN** SDN with at least one custom subnet (e.g. `subnet-1`)
- `kubectl` configured with cluster access
- `virtctl` CLI plugin installed (`kubectl virt` subcommand)

---

<a id="step-1-create-the-virtualmachine-resource"></a>
## Step 1 — Create the VirtualMachine Resource

> **Note:** Replace `<USERNAME>` and `<PASSWORD>` with your desired credentials before applying.

```yaml
cat <<EOF | kubectl apply -f -
apiVersion: kubevirt.io/v1
kind: VirtualMachine
metadata:
  name: ubuntu-test
  namespace: default
spec:
  running: false
  template:
    metadata:
      labels:
        kubevirt.io/domain: ubuntu
      annotations:
        # Change the Subnet bindings according to your configuration
        ovn.kubernetes.io/logical_switch: subnet-1
    spec:
      # ---- Manual DNS overwrite configuration ----
      # Remove this section if you want to use other configuration sources
      dnsPolicy: None
      dnsConfig:
        nameservers:
          - 168.63.129.16
      # -------------------------------------------
      domain:
        cpu:
          cores: 2
        resources:
          requests:
            memory: 2Gi
        devices:
          disks:
            - name: containerdisk
              disk:
                bus: virtio
            - name: cloudinitdisk
              disk:
                bus: virtio
      volumes:
        - name: containerdisk
          containerDisk:
            # Pin to an Ubuntu cloud image; 22.04 LTS shown here.
            # You can switch to 24.04 if you prefer.
            image: quay.io/containerdisks/ubuntu:22.04
        - name: cloudinitdisk
          cloudInitNoCloud:
            userData: |
              #cloud-config
              ssh_pwauth: true
              disable_root: false
              #users config
              users:
                - name: <USERNAME>
                  groups: [sudo]
                  shell: /bin/bash
                  sudo: ALL=(ALL) NOPASSWD:ALL
                  lock_passwd: false
              # password settings
              chpasswd:
                expire: false
                encrypted: false
                list: |
                  <USERNAME>:<PASSWORD>
              # Enable password authentication over SSH
              write_files:
                - path: /etc/ssh/sshd_config.d/60-cloudinit-password.conf
                  permissions: '0644'
                  content: |
                    PasswordAuthentication yes
                    KbdInteractiveAuthentication yes
                    ChallengeResponseAuthentication yes
                    UsePAM yes
              # Enable SSH
              runcmd:
                - systemctl enable ssh
                - systemctl restart ssh
EOF
```

### Key Configuration Notes

| Field | Purpose |
|---|---|
| `spec.running: false` | VM is created in a stopped state — must be started manually |
| `ovn.kubernetes.io/logical_switch` | Binds the VM pod to a specific Kube-OVN subnet (change `subnet-1` to match your configuration) |
| `dnsPolicy: None` + `dnsConfig` | Overrides cluster DNS with Azure DNS (`168.63.129.16`). Remove this block to use default cluster DNS instead |
| `containerDisk.image` | Ephemeral boot disk from a container image — no PVC needed. Use `ubuntu:22.04` or `ubuntu:24.04` |
| `cloudInitNoCloud` | Provisions the VM on first boot: creates a user, sets a password, and enables SSH password authentication |

---

<a id="step-2-start-the-vm"></a>
## Step 2 — Start the VM

The VM pod **will not start automatically** after creation. Start it manually:

```powershell
kubectl virt start ubuntu-test
```

---

<a id="step-3-verify-the-vm-is-running"></a>
## Step 3 — Verify the VM is Running

List all KubeVirt VirtualMachine resources:

```powershell
kubectl get vm
```

List all running KubeVirt launcher pods across all namespaces:

```powershell
kubectl get pods -A -l kubevirt.io=virt-launcher
```

---

<a id="step-4-connect-to-the-vm-console"></a>
## Step 4 — Connect to the VM Console

Open an interactive console session to the VM:

```powershell
kubectl virt console ubuntu-test
```

> **Tip:** Press `Ctrl + ]` to disconnect from the console without stopping the VM.

---

<a id="cleanup"></a>
## Cleanup

To stop and delete the VM:

```powershell
kubectl virt stop ubuntu-test
kubectl delete vm ubuntu-test
```