---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Switch http client from cpprestsdk to libcurl"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/How-To/AMA%20Linux%3A%20HT%3A%20Switch%20http%20client%20from%20cpprestsdk%20to%20libcurl"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
This how-to will demonstrate how to switch the http client that AMA is using to transmit records to remote destinations from the default cpprestsdk to libcurl. At some point in the future, we will switch our default to libcurl. See this [IcM](https://portal.microsofticm.com/imp/v5/incidents/details/608384367/summary) for more details.

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Note:**  This change reverts after reboot!
</div>

# Manual Method
1. Edit '/etc/default/azuremonitoragent' and add the following line:
```export ENABLE_CURL_UPLOAD="true"```

2. Restart the Azure Monitor Agent using the command:
```systemctl restart azuremonitoragent```

3. Verify it's loaded
```ps -ef e | grep mdsd```

# Scripted Method
You'll need to uncomment the restore/clean-up if/when you want to perform those steps.

```
# Get a copy of current config
cp -f /etc/default/azuremonitoragent /tmp/azuremonitoragent.bak

FILE="/etc/default/azuremonitoragent"

# Enable libcurl if not already present
if ! grep -q 'export ENABLE_CURL_UPLOAD="true"' "$FILE"; then
    echo 'export ENABLE_CURL_UPLOAD="true"' >> "$FILE"
fi

# Set the CURL_CA_BUNDLE to the value of SSL_CERT_FILE
SSL_PATH=$(grep "export SSL_CERT_FILE=" "$FILE" | cut -d'=' -f2 | tr -d '"')

if [ -n "$SSL_PATH" ]; then
    # Check if CURL_CA_BUNDLE already exists
    if grep -q "export CURL_CA_BUNDLE=" "$FILE"; then
        # Update the existing line to match the SSL_PATH
        sed -i "s|export CURL_CA_BUNDLE=.*|export CURL_CA_BUNDLE=$SSL_PATH|" "$FILE"
    else
        # Append the new variable if it doesn't exist
        echo "export CURL_CA_BUNDLE=$SSL_PATH" >> "$FILE"
    fi
else
    echo "Warning: SSL_CERT_FILE not found in $FILE. Skipping CURL_CA_BUNDLE update."
fi

# Restart AMA
systemctl restart azuremonitoragent

# Verify config
cat /etc/default/azuremonitoragent

# Restore previous config
# cp /tmp/azuremonitoragent.bak /etc/default/azuremonitoragent

# Cleanup
# rm /tmp/azuremonitoragent.bak
```

# Persisting Reboot
In general, we only need these settings for a short period of time, so we aren't concerned with the settings not persisting through a reboot, however, there are some situations in which we do want to persist through a reboot and keep using libcurl.

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Note:**  This change reverts after an agent upgrade!
</div> 

```
#!/bin/bash

# Configuration Paths
ENV_FILE="/etc/default/azuremonitoragent"
OVERRIDE_DIR="/etc/systemd/system/azuremonitoragent.service.d"
OVERRIDE_FILE="$OVERRIDE_DIR/override.conf"

# 1. Ensure the directory for the systemd override exists
mkdir -p "$OVERRIDE_DIR"

# 2. Extract the SSL_CERT_FILE value from /etc/default/azuremonitoragent
SSL_PATH=$(grep "export SSL_CERT_FILE=" "$ENV_FILE" | cut -d'=' -f2 | tr -d '"' | tr -d "'")

# Check if we actually found a path
if [ -z "$SSL_PATH" ]; then
    echo "Error: Could not find SSL_CERT_FILE in $ENV_FILE"
    exit 1
fi

# 3. Apply the changes to /etc/default/azuremonitoragent (if not already there)
if ! grep -q 'export ENABLE_CURL_UPLOAD="true"' "$ENV_FILE"; then
    echo 'export ENABLE_CURL_UPLOAD="true"' >> "$ENV_FILE"
fi

# Update or append CURL_CA_BUNDLE in the env file to match the extracted path
if grep -q "export CURL_CA_BUNDLE=" "$ENV_FILE"; then
    sed -i "s|export CURL_CA_BUNDLE=.*|export CURL_CA_BUNDLE=$SSL_PATH|" "$ENV_FILE"
else
    echo "export CURL_CA_BUNDLE=$SSL_PATH" >> "$ENV_FILE"
fi

# 4. Write the systemd override (the "systemctl edit" equivalent)
# Systemd uses a slightly different syntax than bash (no 'export' keyword)
cat <<EOF > "$OVERRIDE_FILE"
[Service]
Environment="ENABLE_CURL_UPLOAD=true"
Environment="CURL_CA_BUNDLE=$SSL_PATH"
EOF

# 5. Reload systemd to pick up the new override and restart the agent
systemctl daemon-reload
systemctl restart azuremonitoragent

echo "Success: Azure Monitor Agent updated and restarted with CA Bundle: $SSL_PATH"

# 6. Show the environment variables systemd is passing to this service
systemctl show azuremonitoragent --property=Environment
```