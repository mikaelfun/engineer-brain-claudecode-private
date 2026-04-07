---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Compute/Linux/Getting container throttling values on Node level"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Compute/Linux/Getting%20container%20throttling%20values%20on%20Node%20level"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Getting Container CPU Throttling Values on Node Level

## Objective

Parse the cAdvisor metrics from a node to extract `container_cpu_cfs_throttled_seconds_total` values per container.

## Method

Use the Kubernetes raw API to get cAdvisor metrics from a specific node:

```
kubectl get --raw /api/v1/nodes/<NODE_NAME>/proxy/metrics/cadvisor
```

## Python Script

```python
import json
import re
import subprocess
import sys

cmdline = "kubectl get --raw".split(" ")
fileName = "/tmp/rawmetrics"

def getmetrics(cmd):
    full_cmd = cmdline + [cmd]
    process = subprocess.run(full_cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, universal_newlines=True)
    if process.returncode == 3:
        raise ValueError("invalid arguments: {}".format(cmdline))
    if process.returncode == 4:
        raise OSError("fping reported syscall error: {}".format(process.stderr))
    file1 = open(fileName, "w")
    file1.write(process.stdout)
    file1.close()
    return process.stdout

def lookfor(word):
    word = 'container_cpu_cfs_throttled_seconds_total'
    with open(fileName, 'r') as fp:
        lines = fp.readlines()
        for line in lines:
            if line.find(word) != -1:
                if line.find("#") == -1:
                    values = line.split(" ")
                    marker1 = '{'
                    marker2 = '}'
                    regexPattern = marker1 + '(.+?)' + marker2
                    str_found = re.search(regexPattern, line).group(1)
                    column = str_found.split(",")
                    print(column[5], "  ", values[1])

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python cadvisor.py nodeName")
    else:
        nodeName = sys.argv[1]
        apicall = "/api/v1/nodes/" + nodeName + "/proxy/metrics/cadvisor"
        metric_output = getmetrics(apicall)
        lookfor("container_cpu_cfs_throttled_seconds_total")
```

## Usage

```bash
python cadvisor.py <node-name>
```

Output shows container names with their total throttled seconds.

## Owner

Point of Contact: oborlean@microsoft.com
