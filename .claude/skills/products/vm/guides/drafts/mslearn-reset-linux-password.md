# How to Reset a Local Linux Password on Azure VMs

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/reset-password

## Method 1: Azure Linux Agent (Online)

**Prerequisites**: Azure Linux Agent (waagent) installed and running.

```bash
az vm user update -u $ADMIN_USER -p $NEW_PASSWORD -g $RESOURCE_GROUP -n $VM_NAME
```

Or use the **Reset Password** feature in Azure Portal.

For SSH key reset: `az vm user update` with `--ssh-key-value`.

## Method 2: Serial Console + Single-User Mode

1. Access Serial Console from Azure Portal
2. Enter single-user mode via GRUB
3. Ensure `PasswordAuthentication yes` in `/etc/ssh/sshd_config`
4. Run `passwd <admin_user>` to set new password
5. If SELinux is enforcing: `touch /.autorelabel`
6. Reboot: `/usr/sbin/reboot -f`

## Method 3: Repair VM (Offline)

1. Create repair VM: `az vm repair create -g $RG -n $VM --repair-username $USER --repair-password $PASS`
2. SSH to repair VM, mount + chroot into attached OS disk
3. Fix `PasswordAuthentication` in sshd_config
4. Run `passwd <admin_user>`
5. Handle SELinux relabeling if needed
6. Exit chroot, restore disk: `az vm repair restore -g $RG -n $VM`

## Decision Tree

- waagent running? → Method 1
- Serial Console available? → Method 2
- Neither available → Method 3 (offline repair)
