---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/MEMCM"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FMEMCM"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# MEMCM (Microsoft Endpoint Configuration Manager)

### Introduction: MEMCM and Its Integrated Feature Set

Microsoft Endpoint Configuration Manager (MEMCM), formerly known as System Center Configuration Manager (SCCM), has evolved into a powerful hybrid management platform that bridges traditional on-premises infrastructure with modern cloud capabilities. As organizations increasingly adopt cloud-first strategies, MEMCM plays a pivotal role by integrating with Microsoft Intune and Microsoft Endpoint Manager to offer a unified endpoint management experience.

---

### Endpoint Analytics

Endpoint Analytics provides insights into the user experience and device health across your environment. It helps IT admins identify performance bottlenecks, startup delays, and misconfigurations that impact productivity.
- **Purpose**: Improve end-user experience by analyzing startup performance, app reliability, and policy health.
- **Deployment**: Enabled via MEMCM or Intune; requires devices to be onboarded and telemetry to be configured.
- **Key Benefits**:
  - Visibility into startup times and app performance
  - Proactive remediation of common issues
  - Integration with Microsoft Productivity Score

---

### Advanced Endpoint Analytics

Advanced Endpoint Analytics builds on the core analytics offering by introducing deeper insights and real-time diagnostics.
- **Purpose**: Provide advanced troubleshooting and anomaly detection capabilities.
- **Features**:
  - Device timeline history
  - Battery health and app impact analysis
  - Real-time device queries
  - Custom device scopes for targeted reporting
- **Licensing**: Part of the Intune Suite or available as a standalone add-on.

---

### Co-Management

Co-Management allows devices to be managed simultaneously by both MEMCM and Intune, enabling a gradual transition to modern management.
- **Purpose**: Bridge traditional and modern management by allowing workloads to shift from MEMCM to Intune.
- **Capabilities**:
  - Selective workload redirection (e.g., compliance, Windows updates)
  - Seamless transition path to cloud-native management
  - Integration with Autopilot for provisioning

---

### Tenant Attach

Tenant Attach connects your on-prem MEMCM environment to the Microsoft Intune admin center, enabling cloud-based actions without full Intune enrollment.

- **Purpose**: Provide cloud-based visibility and control over MEMCM-managed devices.
- **Key Features**:
  - View and manage devices from the Intune portal
  - Perform actions like sync policy or app evaluation
  - Access device data and run scripts remotely
- **Architecture**: Uses the ConfigMgr Gateway Service (CMGS) to bridge on-prem and cloud.

---

### Summary

By grouping these features — Endpoint Analytics, Advanced Analytics, Co-Management, and Tenant Attach — under the MEMCM umbrella, Microsoft empowers IT teams to manage devices flexibly across hybrid environments.
