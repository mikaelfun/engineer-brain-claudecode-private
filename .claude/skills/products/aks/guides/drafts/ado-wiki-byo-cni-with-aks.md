---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Networking/BYO CNI with AKS"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FBYO%20CNI%20with%20AKS"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AKS BYO CNI

[TOC]

---

## PREFACE

This feature is for advanced customers, who want to manage the Pod Networking themselves. The support around this feature is limited.

## Testing

Before setting up the Cluster and CNI, plan the IP addressing for the cluster. Because once the cluster is created, most of the networking parameters cannot be modified.

Ensure that you have the latest CLI version installed, or upgrade it before running the commands using `az upgrade`.

More details: <https://docs.microsoft.com/en-us/azure/aks/use-byo-cni?tabs=azure-cli#cluster-creation-steps>

### Initial Values

```txt
Location:   eastus
Node Count:  1 (Using just 1 node count so that the configuration would be easy. Remember that setting up CNI will have to be done on all the worker nodes)
Service CIDR: 10.20.0.0/16 (Virtual range for the Services)
DNS Service IP: 10.20.0.10
```

### Cluster Creation

```bash
az group create -l eastus -n cni-rg
az aks create -l eastus -n cni-cluster -g cni-rg --network-plugin none --node-count 1 --dns-service-ip 10.20.0.10 --service-cidr 10.20.0.0/16 --pod-cidr 10.25.0.0/16
```

### CNI Installation

SSH to all worker nodes and configure networking:

```bash
## Install OS dependencies
sudo apt-get update
sudo apt-get -y install socat conntrack ipset

## Download binaries
wget -q --show-progress --https-only --timestamping https://github.com/containernetworking/plugins/releases/download/v0.9.1/cni-plugins-linux-amd64-v0.9.1.tgz https://storage.googleapis.com/kubernetes-release/release/v1.21.0/bin/linux/amd64/kube-proxy

## Create Directories
sudo mkdir -p /etc/cni/net.d /opt/cni/bin /var/lib/kube-proxy

## Install Binaries
sudo tar -xvf cni-plugins-linux-amd64-v0.9.1.tgz -C /opt/cni/bin/
chmod +x kube-proxy
sudo mv kube-proxy /usr/local/bin/

## Configure CNI Networking
POD_CIDR=10.25.0.0/16

## Create bridge network
cat <<EOF | sudo tee /etc/cni/net.d/10-bridge.conf
{
    "cniVersion": "0.4.0",
    "name": "bridge",
    "type": "bridge",
    "bridge": "cnio0",
    "isGateway": true,
    "ipMasq": true,
    "ipam": {
        "type": "host-local",
        "ranges": [
          [{"subnet": "${POD_CIDR}"}]
        ],
        "routes": [{"dst": "0.0.0.0/0"}]
    }
}
EOF

## Create loopback interface
cat <<EOF | sudo tee /etc/cni/net.d/99-loopback.conf
{
    "cniVersion": "0.4.0",
    "name": "lo",
    "type": "loopback"
}
EOF

## Configure kube-proxy
cat <<EOF | sudo tee /var/lib/kube-proxy/kube-proxy-config.yaml
kind: KubeProxyConfiguration
apiVersion: kubeproxy.config.k8s.io/v1alpha1
clientConnection:
  kubeconfig: "/var/lib/kube-proxy/kubeconfig"
mode: "iptables"
clusterCIDR: "10.25.0.0/16"
EOF

## Create kube-proxy.service file
cat <<EOF | sudo tee /etc/systemd/system/kube-proxy.service
[Unit]
Description=Kubernetes Kube Proxy
Documentation=https://github.com/kubernetes/kubernetes
[Service]
ExecStart=/usr/local/bin/kube-proxy \\
  --config=/var/lib/kube-proxy/kube-proxy-config.yaml
Restart=on-failure
RestartSec=5
[Install]
WantedBy=multi-user.target
EOF

## Start the Service
sudo systemctl daemon-reload
sudo systemctl enable kube-proxy
sudo systemctl start kube-proxy
```

### Validation

Node should be in `Ready` state and all pending Pods should be deployed.

### DNS Resolution issue from the Pods

Issue: DNS Resolution fails inside pods. `nslookup` returns `reply from unexpected source` with pod IP instead of expected kube-dns ClusterIP.

**Solution**: Load `br_netfilter` kernel module:

```bash
sudo modprobe br_netfilter
sudo sh -c 'echo "br_netfilter" > /etc/modules-load.d/br_netfilter.conf'
```

This module is required to enable transparent masquerading and to facilitate VxLAN traffic for communication between Kubernetes pods across the cluster.
