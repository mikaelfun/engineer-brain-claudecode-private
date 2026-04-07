# Intune SCEP/NDES Certificate Enrollment Workflow

**Source**: OneNote - Intune Workflow: How SCEP and NDES works
**ID**: intune-onenote-391

## Overview

How SCEP certificate enrollment works end-to-end with Intune and on-premises NDES.

## Workflow Steps

1. **Profile Creation & Assignment**: Admin creates a *SCEP certificate profile* and a *Trusted Certificate profile* in Intune console, assigns to device group.
   - Trusted Certificate profile delivers the actual root certificate
   - SCEP certificate profile tells the device *how* to request the certificate (not the certificate itself)

2. **Device Contacts NDES**: When device receives the SCEP profile, it contacts the NDES server on the customer's internal network (same PC with Intune Certificate Connector). Device locates NDES using the URI in the SCEP profile.

3. **Request Validation**: NDES Connector policy module (part of Intune Certificate Connector) validates the request is legitimate.

4. **Forward to CA**: If valid, NDES forwards the certificate request to the Certification Authority (CA).

5. **Certificate Issuance**: CA sends the SCEP certificate back to NDES, which forwards it to the requesting device. Device now has both:
   - Trusted root certificate
   - SCEP certificate
   - Together enabling certificate-based authentication to company resources

6. **Status Reporting**: Intune Certificate Connector reports enrollment status back to the Intune service.

## Key Points for Troubleshooting

- SCEP profile only contains enrollment instructions, not the certificate itself
- NDES server must be reachable from the device (check URI in SCEP profile)
- Connector policy module validates requests before forwarding to CA
- Both Trusted Root + SCEP profiles must be assigned to the same device group
- Check connector event logs if step 3 (validation) fails
- Check CA issued/failed certificates if step 4-5 fails
