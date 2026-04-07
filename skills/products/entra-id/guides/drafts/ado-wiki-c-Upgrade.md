---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Device Registration/Linux Devices/Enterprise SSO for Linux Desktops/Deployment/Upgrade"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FLinux%20Devices%2FEnterprise%20SSO%20for%20Linux%20Desktops%2FDeployment%2FUpgrade"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Upgrade

## How to upgrade to the latest version of the software

If you identify that the software is of an older version, you can execute the following to upgrade to the latest.

### Ubuntu/Debian
<details><summary>.DEB - Ubuntu/Debian</summary>

#### Update Packages

```bash
# Update package/repo metadata
sudo apt update

# upgrade packages & clean up dependencies
sudo apt-get dist-upgrade
```

#### Clean

```bash
# remove the content from /var/cache/apt/archives (except for the lock file).
sudo apt-get clean

#Another APT option is to run:
sudo apt-get autoclean
```

> `apt-get upgrade` is restricted to replacing packages with newer versions but no package needs to be added or removed.  
> `apt-get dist-upgrade` intelligently handles changing dependencies with new versions of packages.

</details>

### RedHat/Fedora
<details><summary>.RPM - RHEL/Fedora</summary>

#### Update Packages

``` bash
sudo dnf update

# If that doesn't work for some reason, you can manually re-install latest from packages.microsoft.com using:
dnf check-update

sudo dnf install microsoft-identity-broker
sudo dnf install intune-portal
sudo dnf install microsoft-edge-dev
```

#### Upgrade Packages & Clean

```bash
# remove all cache files generated from the repository metadata.
sudo dnf clean dbcache

# run a complete clean with the command:
sudo dnf clean all
``` 

#### Upgrade OS:

```bash
# To update your Fedora release from the command-line do:
sudo dnf upgrade --refresh
```

</details>
