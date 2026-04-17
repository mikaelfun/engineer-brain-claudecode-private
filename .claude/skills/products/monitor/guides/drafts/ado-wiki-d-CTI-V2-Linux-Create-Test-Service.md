---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Change Tracking(v2) and Inventory/Change Tracking and Inventory (CT&I) V2 - Linux/How-To/How To: Create a test Linux Service"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Change%20Tracking%28v2%29%20and%20Inventory/Change%20Tracking%20and%20Inventory%20%28CT%26I%29%20V2%20-%20Linux/How-To/How%20To%3A%20Create%20a%20test%20Linux%20Service"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::




# Scenario
---
This how-to applies to creating a test service on customer's Linux machine. This may help identify issues of CT&I Agent detecting Linux Services.

# Create a test service
---
1. Create a script named `create_test_service.sh` to create and set up the service, with below content. The service named `test.service`, and will keep writing a log to `/tmp/test_service.log` every 30s. 
```
#!/bin/bash

# Create the script that the service will execute
cat <<EOF > /usr/local/bin/test_service.sh
#!/bin/bash
touch /tmp/test_service.log
while true; do
  echo "Test Service: \$(date)" >> /tmp/test_service.log
  sleep 30
done
EOF

# Give the script execution permissions
chmod +x /usr/local/bin/test_service.sh

# Create the systemd service file
cat <<EOF > /etc/systemd/system/test.service
[Unit]
Description=Test Service

[Service]
Type=simple
ExecStart=/usr/local/bin/test_service.sh
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd to make the new service take effect
systemctl daemon-reload

# Start the service
systemctl start test.service

# Enable the service to start on boot
systemctl enable test.service

echo "Test service created and started."
```

2. Use following commands to run the script
```
chmod +x create_test_service.sh
sudo ./create_test_service.sh
```

3. Use `systemctl status test.service` to check the service status. The output would look similar to below.
![image.png](/.attachments/image-70572f82-1832-47e5-9578-3b432e0191af.png)

4. Let the service run for more than 5 mins so that CT&I Agent should be able to detect it. The result will look similar to below on Azure Portal
![image.png](/.attachments/image-bfe967ee-d2dc-4da6-ab3f-616e0fdf07cc.png)


# Clean up environment
---
1. Once test is done, create a script named `cleanup_test_service.sh` to clean up the test service, with below content. 

```
#!/bin/bash

# Stop the service
systemctl stop test.service

# Disable the service to prevent it from starting on boot
systemctl disable test.service

# Remove the service file
rm /etc/systemd/system/test.service

# Remove the script that the service was executing
rm /usr/local/bin/test_service.sh

# Remove tmp logging
rm /tmp/test_service.log

# Reload systemd to apply changes
systemctl daemon-reload
systemctl reset-failed

echo "Test service has been removed."
```

2. Use following commands to run the script
```
chmod +x cleanup_test_service.sh
sudo ./cleanup_test_service.sh
```

3. Double check the service removal by `systemctl status test.service`. The result will look similar to below
![image.png](/.attachments/image-9939d8ba-6791-4521-9914-9ce8f109a3fa.png)


