---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Change Tracking(v2) and Inventory/Change Tracking and Inventory (CT&I) V2 - Linux/How-To/How To: Manually Onboard CT&I Linux Agent"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Change%20Tracking%28v2%29%20and%20Inventory/Change%20Tracking%20and%20Inventory%20%28CT%26I%29%20V2%20-%20Linux/How-To/How%20To%3A%20Manually%20Onboard%20CT%26I%20Linux%20Agent"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::




# Scenario
---
If you are ever in the position where you need to manually onboard the CT&I Agent for Linux, the following process will give you some guidance.


**Method 1** (Recommended)
This is using the same commands the Guest Agent uses to maintain the agent. 
```
# Install package change-tracking-retail & setup cxp.service
cd /var/lib/waagent/Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Linux-*
./cta_linux_handler install

# Enable cxp.service
./cta_linux_handler enable

# Start cxp.service
systemctl start cxp.service
```
**Method 2** (If method 1 does not work)
1. Manually install "change-tracking-retail" package
- rpm series (Redhat, CentOS, SUSE, etc.)
```
cd /var/lib/waagent/Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Linux-*
rpm --force -i change-tracking-retail_<version>.rpm
```
- dpkg series (Ubuntu, Debian, etc.)
```
cd /var/lib/waagent/Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Linux-*
dpkg -i change-tracking-retail_<version>.deb
```
2. Manually setup cxp.service
- create and add below content to `/lib/systemd/system/cxp.service` . 
**Note**: Below content has one place that needs to be modified to the correct extension version. For checking the current extension version, please use command `ls /var/lib/waagent/ | grep ChangeTracking`
```
[Unit]
Description=Azure change tracking Parent Daemon
Wants=network-online.target
After=network-online.target

[Service]
ExecStart=/usr/sbin/changetracking/changetracking /opt/microsoft/changetracking/change_tracking_agent_linux_amd64 /var/lib/waagent/Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Linux-<**replace-correct-version**>
Restart=on-failure

[Install]
WantedBy=multi-user.target
```
- `chmod 0644  /lib/systemd/system/cxp.service`
- `cp /opt/microsoft/changetracking/svc/changetracking /usr/sbin/changetracking/`
- `chmod 0755 /usr/sbin/changetracking/changetracking`
- `systemctl enable cxp`
- `systemctl start cxp`

  **Note**: You may backup any files in `/usr/sbin/changetracking/` if exists prior to these scripts.



