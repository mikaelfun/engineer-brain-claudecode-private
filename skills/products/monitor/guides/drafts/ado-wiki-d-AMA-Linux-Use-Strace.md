---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Use strace"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/How-To/AMA%20Linux%3A%20HT%3A%20Use%20strace"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
The [strace](https://www.man7.org/linux/man-pages/man1/strace.1.html) utility runs a specified command until it exits and records the system calls and signals. This is similar to procmon on Windows.

Here are some of the parameters that we might use:
- -t (--absolute-timestamps): Prefix each line of the trace with the wall clock time
- -T (--syscall-times): Show the time spent in system calls. This records the time difference between the beginning and the end of each system call
- -f (--follow-forks): Trace child processes as they are created by currently traced processes
- -Z (--failed-only): 
- -p (--attach): Attach to the process with the process ID <pid> and begin tracing
- -o (--output): Write the trace output to the file filename rather than to stderr

Here is an example of what output might look like:
![image.png](/.attachments/image-2ed5d04e-b908-42e8-86e3-883caa530abd.png)

In the below examples, you will see the use of ```$(pidof mdsd)```. This will dynamically acquire the PID of mdsd - you do not need to manually acquire the PID.

# Scenario: File Access - Permission Denied
This sample was used to identify permissions issues created by system hardening, where AMA was unable to read required files: 

```
systemctl restart azuremonitoragent; strace -t -T -f -Z -p $(pidof mdsd) -o /tmp/strace_ama_startup.log
```

![image.png](/.attachments/image-0785e300-b253-420e-9413-b9e2c3f34cb2.png)

```
# mdsd attempts to open file (/etc/pki/tls/cert.pem) in READ ONLY mode and fails permission check
753178 openat(AT_FDCWD, "/etc/pki/tls/cert.pem", O_RDONLY) = -1 EACCES (Permission denied)
```

# Scenario: HIMDS Socket - Time Out
[Source IcM](https://portal.microsofticm.com/imp/v5/incidents/details/526054744/summary)
This sample was used to identify that the socket to send HIMDS call never entered a ready state and timed out.

```
systemctl restart azuremonitoragent; strace -t -T -f -p $(pidof mdsd) -o /tmp/strace_ama_startup.log
```

```
# AMA calls connect for IMDS
56309 11:35:12 connect(17, {sa_family=AF_INET, sin_port=htons(40342), sin_addr=inet_addr("127.0.0.1")}, 16) = 0 <0.000069>

# AMA sets up a wait to wait until the socket is ready to send data 
56301 11:35:12 epoll_ctl(15, EPOLL_CTL_MOD, 17, {events=EPOLLIN|EPOLLPRI|EPOLLOUT|EPOLLERR|EPOLLHUP|EPOLLET, data={u32=51577888, u64=51577888}}) = 0 <0.000120>

# Socket never signals the ready state and after 30 seconds it fails
56303 11:35:42 <... epoll_wait resumed>[{events=EPOLLIN, data={u32=51315036, u64=51315036}}], 128, -1) = 1 <29.926181>

# Socket gets shutdown
56303 11:35:42 shutdown(17, SHUT_RDWR <unfinished ...>
56298 11:35:42 futex(0x30c0238, FUTEX_WAKE_PRIVATE, 1 <unfinished ...>
56303 11:35:42 <... shutdown resumed>)  = 0 <0.000085>
```

# Scenario: Fluentbit - read error, check permissions

```
systemctl restart azuremonitoragent; strace -t -T -f -p $(pidof fluent-bit) -o /tmp/strace_fluent-bit.log
```

In the below example, we are monitoring ```/var/log/messages```. Here's what we expect to see:

```
2978  16:57:20 newfstatat(AT_FDCWD, "/var/log/messages", {st_mode=S_IFREG|0600, st_size=35874, ...}, AT_SYMLINK_NOFOLLOW) = 0 <0.000031>
2978  16:57:20 stat("/var/log/messages", {st_mode=S_IFREG|0600, st_size=35874, ...}) = 0 <0.000026>
2978  16:57:20 epoll_wait(8, [{events=EPOLLIN, data={u32=1007009616, u64=140519452032848}}, {events=EPOLLIN, data={u32=1007319792, u64=140519452343024}}, {events=EPOLLIN, data={u32=1007263904, u64=140519452287136}}], 256, 0) = 3 <0.000035>
2978  16:57:20 read(66, "\1\0\0\0\0\0\0\0", 8) = 8 <0.000017>
2978  16:57:20 openat(AT_FDCWD, "/tmp", O_RDONLY|O_NONBLOCK|O_CLOEXEC|O_DIRECTORY) = 47 <0.000040>
```
