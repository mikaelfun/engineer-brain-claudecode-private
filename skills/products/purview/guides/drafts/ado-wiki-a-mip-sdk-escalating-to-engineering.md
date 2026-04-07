---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/MIP SDK/MIP SDK Escalating to Engineering"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FMIP%20SDK%2FMIP%20SDK%20Escalating%20to%20Engineering"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# MIP SDK Escalating to Engineering — ICM Creation Workflow

## 1. Understand the Issue

Before creating a ICM (Customer Management) incident, gather the following information:

- **Platform**: What platform is the app built on?
- **Operating System**: Which OS does the app run on?
- **MIP SDK Version**: Identify the version and platform details.
- **Logs**: Collect MIP SDK logs while reproducing the issue.
  Reference: [MIP SDK Logs - Overview](https://supportability.visualstudio.com/Developer/_wiki/wikis/Developer/2021218/MIP-SDK-Logs)
- **Screenshots**: Capture screenshots of any errors, if possible.

---

## 2. Create the Incident

Use the following template to create an ICM entry for MIP SDK:
- Reference: [Create Incident - IcM](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=C3jZ2v)
- Work with the customer to fill in the ICM template and provide all requested data.

---

## 3. ICM Configuration

- **ICM Type**: Select **CSS Escalated**
- **Description**: Mention all collected information:
  - Platform and OS
  - MIP SDK version
  - Logs and screenshots
  - Any impacted files (e.g., PDFs, Word documents)
- **Attachments**:
  - Upload MIP SDK logs
  - Upload other relevant files (e.g., impacted documents)

---

## 4. Submit

Click **Submit** to route the ICM to the **CXECARE/CEMPURVIEW** queue.
