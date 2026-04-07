# MDC Recommendations Not Managed by Policy

> Source: OneNote — Recommendations / Recommendation that are not managed by policy
> Quality: draft | Needs: review, check current status

## Overview

The following recommendations do NOT support Azure Policy management — they rely on internal Core/R3 logic only.

## VMSS Recommendations

- System updates on virtual machine scale sets should be installed
- Monitoring agent should be installed on virtual machine scale sets
- Endpoint protection health failures should be remediated on virtual machine scale sets
- Vulnerabilities in security configuration on your virtual machine scale sets should be remediated

## SQL Recommendations

- Sensitive data in your SQL databases should be classified
- Vulnerabilities on your SQL databases should be remediated
- Vulnerabilities on your SQL databases in VMs should be remediated

## IoT Recommendations

- Identical Authentication Credentials
- Default IP Filter Policy should be Deny
- IP Filter rule large IP range
- IoT Devices - Open Ports On Device
- IoT Devices - Permissive firewall policy in one of the chains was found
- IoT Devices - Permissive firewall rule in the output chain was found
- IoT Devices - Install the Azure Security of Things Agent

## Nested Recommendations

- Vulnerabilities in Azure Container Registry images should be remediated (powered by Qualys)
- Remediate vulnerabilities found on your virtual machines (powered by Qualys)

## Legacy Recommendations (No Policies)

- OS version should be updated for your cloud service roles
- Install endpoint protection solution on your machines
- Monitoring agent health issues should be resolved on your machines (VM & OnPrem)
- Install monitoring agent on your virtual machines (VM & OnPrem)

> Platform-level policy support tracked in ADO Feature 4554685.
