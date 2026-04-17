# Linux and Open-Source Technology Support Scope in Azure

Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/support-linux-open-source-technology

## Endorsed Linux Distributions
- AlmaLinux, Debian (Credativ), Flatcar (Kinvolk), Ubuntu (Canonical), Oracle Linux, RHEL, Rocky Linux (CIQ), SLES

## Support Models by Distro

### RHEL
- **On-Demand (PAYG)**: Microsoft manages first-level Linux support, engages Red Hat if needed
- **Cloud Access (BYOS)**: Customer needs support agreements with both Microsoft and Red Hat
- Conversion via Azure Hybrid Benefit

### SUSE
- **BYOS**: Must register with SUSE, Microsoft may defer to SUSE
- **Patching Support**: Microsoft assists, no extra SUSE support
- **24x7 Support**: Full support from Microsoft, SUSE Level 3

### Ubuntu
- Ubuntu Pro available for ESM (Extended Security Maintenance)
- Ubuntu 18.04 LTS out of standard support since May 31, 2023

## Microsoft Support Scope
- Azure platform and commercially viable Linux support (requires support plan)
- Does NOT cover: basic Linux admin, design/architecture, app deployment, security incidents
- Custom kernels/modules may not be supported by vendor

## Open-Source Tech Support
- Supported: PHP, Java, Python, Node.JS, MySQL, Apache HTTP Server, Tomcat, WordPress
- Covers: installation/config issues, deployment errors, runtime errors, performance on Azure
- NOT covered: app development, custom app troubleshooting, custom code
