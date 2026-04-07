---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Expert Troubleshooting/Regression Testing & Validation On Customer Applications"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Expert%20Troubleshooting/Regression%20Testing%20%26%20Validation%20On%20Customer%20Applications"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Regression Testing & Validation On Customer Applications

## Description

Siege is a web application regression testing tool used to simulate internet traffic with concurrent transactions.

## Scenario

Customers sometimes do stress tests on their website from VSTS or other tools, and we have to rely on their results. Siege helps when Application Gateway is in front or there are multiple VMSS servers hosting the website with specific architecture and disk size.

## Installation

**Ubuntu** (tested on Ubuntu 17):
```bash
apt-get update
apt-get upgrade
apt-get install siege
```

Other Linux versions require perl, gcc compiler, newer OpenSSL and referencing the new OpenSSL version during configure. More info: https://github.com/JoeDog/siege/blob/master/INSTALL

## Running Siege

Run with `-v` (verbose) for detailed output.

**Siege presents results in Transactions — the number of server hits.**
Note: 301 redirection is a valid transaction hit.

## Useful Keys

| Flag | Description |
|------|-------------|
| `-c` | Number of concurrent users to simulate (default: 25) |
| `-r` | Number of repetitions |
| `-v` | Verbose output |
| `-t` | Time period for test (M, S, H) — useful for duration-based testing |

## Getting Response Code Counts

```bash
# Run siege and redirect output
siege https://example.com -c20 -r10 -v > abc.txt

# Count response codes
cut -d ' ' -f 2 abc.txt | sort | uniq -c
```

Helpful for application-level troubleshooting, especially for Application Gateway where many 502s occur during stress tests.

## References

- https://www.joedog.org/siege-manual/
- http://manpages.ubuntu.com/manpages/trusty/man1/siege.1.html
