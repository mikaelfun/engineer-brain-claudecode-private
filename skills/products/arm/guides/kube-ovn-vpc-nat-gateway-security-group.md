# ARM Kube-OVN 网络 vpc nat gateway security group — 排查速查

**来源数**: 13 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Kube-OVN IptablesEIP binding fails with pods vpc-nat-gw-xxx not found error in kube-ovn-controller … | Gateway Pod not ready/running when EIP controller tries to bind the IP | Wait for VpcNatGateway Pod to be Running before applying IptablesEIP objects, or delete and re-crea… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | IptablesEIP creation fails with no available ip from external subnet | External subnet IP pool exhausted or subnet misconfigured | Check IP pool status: kubectl get subnet <subnet-name> -o jsonpath=.status. Expand subnet CIDR or r… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | IptablesSnatRule fails with iptables: No chain/target/match by that name in kube-ovn-controller logs | Referenced IptablesEIP is not yet in READY state when SNAT rule tries to apply | Check EIP status: kubectl get iptables-eips <eip-name> -o wide. Ensure EIP is READY before applying… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Kube-OVN VPC NAT Gateway Pod in CrashLoopBackOff with panic: interface conversion | Kube-OVN version mismatch between controller and gateway Pod image | Ensure controller and gateway Pod images are from the same Kube-OVN release | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | Kube-OVN VPC NAT Gateway Pod fails with cant initialize iptables table nat or address already in use | Required kernel modules (ip_tables, nf_nat) missing on node, or stale EIP allocation from previous … | Load kernel modules: modprobe ip_tables nf_nat. For stale allocation: clean up stale Pod and re-cre… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | Kube-OVN SecurityGroup allows traffic but connection is dropped by ACL due to priority inversion | A broad drop ACL at higher priority shadows the specific allow rule. OVN evaluates ACLs by descendi… | Ensure specific allow rules have higher priority than broad deny rules. Verify: ovn-nbctl acl-list … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 | Kube-OVN SecurityGroup rule defined but no corresponding OVN ACL generated | kube-ovn-controller has not reconciled the SecurityGroup, or controller is stuck/not running | Check controller logs: kubectl -n kube-system logs deployment/kube-ovn-controller \| grep <sg-name>… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 | Kube-OVN SecurityGroup denies traffic but connection still succeeds despite deny rule | Stale conntrack entry from previously allowed connections persists after adding deny rule, or defau… | Flush conntrack: ovs-appctl dpctl/flush-conntrack. Check default ACLs: ovn-nbctl acl-list <port-gro… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 | Kube-OVN SecurityGroup allow rule exists but traffic still blocked in one direction only | Rule direction mismatch: ingress rules map to to-lport, egress rules map to from-lport in OVN ACL | Verify ACL direction matches intended traffic flow. ingressRules -> to-lport (into pod), egressRule… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 10 | Kube-OVN SecurityGroup rule silently fails to match any traffic | remoteAddress CIDR does not overlap with actual source/destination IP, or uses wrong namespace subn… | Compare pod IPs vs ACL: kubectl get pod -o wide then ovn-nbctl acl-list <port-group> \| grep ip4. C… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 11 | IptablesEIP not reachable from outside cluster - all VPC NAT Gateway CRDs show READY=true but EIP d… | EIP not added as secondary IP on gateway Pod uplink (controller reconciliation error) or upstream r… | 1) Confirm gateway Pod Running, 2) Verify EIP on Pod uplink: ip addr show, 3) Check iptables rules,… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 12 | NAT rule READY=true and iptables rule exists in VPC NAT Gateway Pod but traffic is not being NATed | ip_forward disabled inside gateway Pod namespace, earlier ACCEPT rule in FORWARD chain bypasses NAT… | 1) sysctl net.ipv4.ip_forward check, 2) conntrack -L for flow, 3) iptables rule ordering check, 4) … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 13 | Non-deterministic NAT, double NAT, or asymmetric traffic in Kube-OVN VPC when both iptables gateway… | Mixing iptables-path CRDs (VpcNatGateway/IptablesEIP) and OVN-native CRDs (OvnEip/OvnSnatRule) for … | kubectl get iptables-eip,oeip -o wide \| grep <vpc>. Remove all objects from one path. Never mix bo… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. Wait for VpcNatGateway Pod to be Running before applying IptablesEIP objects, o… `[来源: ado-wiki]`
2. Check IP pool status: kubectl get subnet <subnet-name> -o jsonpath=.status. Exp… `[来源: ado-wiki]`
3. Check EIP status: kubectl get iptables-eips <eip-name> -o wide. Ensure EIP is R… `[来源: ado-wiki]`
