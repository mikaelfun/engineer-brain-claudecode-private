---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Linux Devices/Enterprise SSO for Linux Desktops/Deployment/Installation"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FLinux%20Devices%2FEnterprise%20SSO%20for%20Linux%20Desktops%2FDeployment%2FInstallation"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Authentication
- cw.AAD-Workflow
- cw.Conditional-Access
- comm-idsp
- comm-strauth
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Authentication](/Tags/AAD%2DAuthentication) [AAD-Workflow](/Tags/AAD%2DWorkflow) [Conditional-Access](/Tags/Conditional%2DAccess) 

<span style="color: red">**IMPORTANT**</span>: This private preview article is under construction.

[[_TOC_]]
# Installation

In general, all software should be installed as a dependency of when Intune Agent (Company Portal) is installed. All binaries are stored on packages.microsoft.com

All of the installation steps below, with the exception of Edge install, are covered in the [Enroll Linux device in Intune](https://learn.microsoft.com/en-us/mem/intune/user-help/enroll-device-linux) documentation.

| **Component** | **Ubuntu 20.04 Version** | **Ubuntu 22.04 Version** | **RHEL 9.x** | **Fedora** |
| -- | -- | -- | -- | -- |
| Identity Diagnostics | [diagnostic](https://packages.microsoft.com/ubuntu/20.04/prod/pool/main/m/microsoft-identity-diagnostics/) | [diagnostic](https://packages.microsoft.com/ubuntu/22.04/prod/pool/main/m/microsoft-identity-diagnostics/) | [diagnostics](https://packages.microsoft.com/rhel/9.0/prod/Packages/m/) | [diagnostics](https://packages.microsoft.com/rhel/9.0/prod/Packages/m/) |
| Identity Broker | [broker](https://packages.microsoft.com/ubuntu/20.04/prod/pool/main/m/msft-identity-broker/) | [broker](https://packages.microsoft.com/ubuntu/22.04/prod/pool/main/m/msft-identity-broker/) | [broker](https://packages.microsoft.com/rhel/9.0/prod/Packages/m/) | [broker](https://packages.microsoft.com/rhel/9.0/prod/Packages/m/) |
| Intune | [intune](https://packages.microsoft.com/ubuntu/20.04/prod/pool/main/i/intune-portal/) | [intune](https://packages.microsoft.com/ubuntu/22.04/prod/pool/main/i/intune-portal/) | [intune](https://packages.microsoft.com/rhel/9.0/prod/Packages/i/) | [intune](https://packages.microsoft.com/rhel/9.0/prod/Packages/i/) |

---
# Reference:

![image.png](/.attachments/image-e6757696-d421-474d-b3a7-d83deab20e39.png)

---

## Configure Package Signing & Repositories Sources (Repos)
**Package Signing** ensures the integrity of a package at rest by detecting and deterring tampering. A package is signed with a private key, which is then validated by the public key provided by the package builder and installed by the user. This technique complements TLS encryption, which guards against tampering and snooping in transport.

There are literally thousands of Linux programs available to meet the needs of Linux users - Many of these programs are stored in software archives commonly referred to as **repositories**. Repositories make it easy to install new software, while also providing a high level of security, since the software is thoroughly tested and built specifically for each version of Linux. [Reference](https://help.ubuntu.com/community/Repositories/Ubuntu)

<details>
  <summary>.DEB - Ubuntu 20.04</summary>

```bash
# Install the required dependencies
sudo apt install curl gpg wget software-properties-common apt-transport-https

# Install the Microsoft package signing key, Install keyring
curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg
sudo install -o root -g root -m 644 microsoft.gpg /usr/share/keyrings/
sudo sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft.gpg] https://packages.microsoft.com/ubuntu/20.04/prod focal main" > /etc/apt/sources.list.d/microsoft-ubuntu-focal-prod.list'

# Update the package index
sudo apt update

# Install the Microsoft Edge package signing key
curl -sSl https://packages.microsoft.com/keys/microsoft.asc | sudo tee /etc/apt/trusted.gpg.d/microsoft.asc

# Add the Microsoft Edge repository to the system
sudo add-apt-repository "deb [arch=amd64] https://packages.microsoft.com/repos/edge stable main"

# Update the package index once again to sync with the newly added Microsoft Edge repository
sudo apt update

# Install Microsoft Edge browser
sudo apt install microsoft-edge-stable
```

</details>
<details><summary>.DEB - Ubuntu 22.04</summary>

``` bash
# Install the required dependencies
sudo apt install curl gpg wget software-properties-common apt-transport-https

# Install the Microsoft package signing key, Install keyring
curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg
sudo install -o root -g root -m 644 microsoft.gpg /usr/share/keyrings/
sudo sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft.gpg] https://packages.microsoft.com/ubuntu/22.04/prod jammy main" > /etc/apt/sources.list.d/microsoft-ubuntu-jammy-prod.list'

# Update the package index
sudo apt update

# Install the Microsoft Edge package signing key
curl -sSl https://packages.microsoft.com/keys/microsoft.asc | sudo tee /etc/apt/trusted.gpg.d/microsoft.asc

# Add the Microsoft Edge repository to the system
sudo add-apt-repository "deb [arch=amd64] https://packages.microsoft.com/repos/edge stable main"

# Update the package index once again to sync with the newly added Microsoft Edge repository
sudo apt update

# Install Microsoft Edge browser
sudo apt install microsoft-edge

# install intune
sudo apt install intune-portal
``` 

</details>

<details><summary>.RPM - RHEL/Fedora</summary>

### RHEL 9

```bash
# Install Curl 
sudo dnf install curl gpg

# Update Package Cache
sudo dnf update
dnf check-update

# Install Microsoft Package Repos
curl -O -sSL https://packages.microsoft.com/config/rhel/9/packages-microsoft-prod.rpm
sudo dnf install ./packages-microsoft-prod.rpm
sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
sudo dnf config-manager --add-repo https://packages.microsoft.com/yumrepos/edge
sudo mv /etc/yum.repos.d/packages.microsoft.com_yumrepos_edge.repo /etc/yum.repos.d/microsoft-edge.repo

# Update Package Cache
dnf check-update

# install edge-dev
sudo dnf install microsoft-edge

# install package from repo
sudo dnf install intune-portal

```

### RHEL 8

``` bash
# Install Curl 
sudo dnf install curl gpg

# Update Package Cache
sudo dnf update
dnf check-update

# Install the Microsoft package signing key
curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg
sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc

# Install Microsoft Package Repos
sudo dnf config-manager --add-repo https://packages.microsoft.com/yumrepos/edge
sudo dnf install -y https://packages.microsoft.com/config/rhel/8/packages-microsoft-prod.rpm
sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
sudo dnf config-manager --add-repo https://packages.microsoft.com/yumrepos/edge
sudo mv /etc/yum.repos.d/packages.microsoft.com_yumrepos_edge.repo /etc/yum.repos.d/microsoft-edge.repo

# Update Package Cache
dnf check-update

# install edge-dev
sudo dnf install microsoft-edge

# install package from repo
sudo dnf install intune-portal
```

</details>

---

## Compliance - Configure Intune Compliance Policies

## Pre-Req for compliance policy - Configure minimum password strength[](https://stackoverflow.microsoft.com/articles/285523#heading-pre-req-for-compliance-policy-configure-minimum-password-strength)

Per Microsoft Digital policy, passwords are required to be compliant to a minimum length of 12 characters, and have at least one Uppercase, Lowercase, Number, and Symbol. 

<details><summary>.DEB - Ubuntu/Debian</summary>

Intune checks the pam_pwquality configuration for enforcement. Install libpam-pwquality, then make sure that password requirements meet the policy:

``` bash
sudo apt install libpam-pwquality
   
# check that the pam_pwquality line in /etc/pam.d/common-password contains at least the required settings:
password    requisite           pam_pwquality.so retry=3 dcredit=-1 ocredit=-1 ucredit=-1 lcredit=-1 minlen=12
```

If you need to alter the policy to be compliant, follow these steps

``` bash
sudo nano /etc/pam.d/common-password
```

Scroll down to locate the entry and update it match

``` bash
password    requisite      pam_pwquality.so retry=3 minlen=12 ucredit=-1 lcredit=-1 dcredit=-1 ocredit=-1
```

After editing use ctrl-o, hit enter to save the file, and then ctrl-x to close the file.

</details>

<details><summary>.REL - RHEL/Fedora</summary>

Intune checks the `pam_pwquality` configuration for enforcement. Install libpam-pwquality, then make sure that password requirements meet the policy:

To enable using `pam_quality`, ensure the following line is updated to include the necessary arguments in the `/etc/pam.d/password-auth` file:

```
# check that the pam_pwquality line in /etc/pam.d/passwd contains at least the required settings:
password    required    pam_pwquality.so retry=3 dcredit=-1 ocredit=-1 ucredit=-1 lcredit=-1 minlen=12
```

When complete, your `etc/pam.d/password-auth` file should look something like this:

![image.png](/.attachments/image-daaf95ad-8cfa-440d-9aee-59e58c0aea07.png)

> For more info, refer to the RHEL docs [here](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/security_guide/chap-hardening_your_system_with_tools_and_services) under the "4.1.1.2.Forcing Strong Passwords" section.

</details>

---

## Azure CLI (Optional)

For more information see the [Install the Azure CLI on Linux](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-linux?pivots=apt#installation-options) public documentation.

<details><summary>.DEB - Ubuntu/Debian</summary>

```bash
# All in One Command: 
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash 

# Step by Step 
sudo apt-get update 
sudo apt-get install ca-certificates curl apt-transport-https lsb-release gnupg 
curl -sL https://packages.microsoft.com/keys/microsoft.asc |     gpg --dearmor |     sudo tee /etc/apt/trusted.gpg.d/microsoft.gpg > /dev/null 
AZ_REPO=$(lsb_release -cs) 
echo "deb [arch=amd64] https://packages.microsoft.com/repos/azure-cli/ $AZ_REPO main" |     sudo tee /etc/apt/sources.list.d/azure-cli.list 
sudo apt-get update 
sudo apt-get install azure-cli 
az -v 
```
</details>
<details><summary>.RPM - RHEL/Fedora</summary>

```bash
# Add Key
sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc

# Add Repo
sudo dnf install -y https://packages.microsoft.com/config/rhel/9.0/packages-microsoft-prod.rpm

#install
sudo dnf install azure-cli

```
</details>
