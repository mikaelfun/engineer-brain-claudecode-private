# SCEP/NDES Architecture — How It Works

## High-Level Workflow

1. **Admin creates profiles**: A *SCEP certificate* profile and a *Trusted Certificate* profile are created in Intune and assigned to a device.
   - The Trusted Certificate profile delivers the actual root certificate
   - The SCEP certificate profile tells the device *how* to request the SCEP certificate (not the certificate itself)

2. **Device contacts NDES**: When the device receives the SCEP profile, it contacts the NDES server on the customer's internal network (same PC as the Intune Certificate Connector). The device finds the NDES server using the URI in the SCEP Certificate profile.

3. **Request validation**: The NDES Connector policy module (part of the Intune Certificate Connector) validates the request.

4. **Certificate request forwarding**: If valid, the NDES server forwards the certificate request to the Certification Authority (CA).

5. **Certificate delivery**: The CA sends the SCEP certificate back to the NDES server, which forwards it to the device. At this point the device has both:
   - The trusted root certificate
   - The SCEP certificate
   → Ready for certificate-based authentication to company resources.

6. **Status reporting**: The Intune Certificate Connector reports status back to the Intune service.

## Key Points

- NDES server and Intune Certificate Connector run on the **same machine**
- The SCEP URI in the profile must be reachable from the device
- Both Trusted Root CA and SCEP profiles must be deployed (Trusted Root first)
- Certificate-based auth requires both certs in the chain to be valid

---
*Source: OneNote — Intune Workflow: How SCEP and NDES works*
