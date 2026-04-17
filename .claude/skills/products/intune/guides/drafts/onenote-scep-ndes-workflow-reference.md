# SCEP/NDES Workflow Reference

## Source
- OneNote: `Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Intune/## NDES_SCEP_PFX TSG/Intune Workflow_ How SCEP and NDES works.md`

## SCEP Certificate Deployment Flow

1. **Admin** creates a SCEP certificate profile and a Trusted Certificate profile in Intune console, assigns to device
   - Trusted Certificate profile delivers the actual trusted root certificate
   - SCEP certificate profile tells the device **how to request** the SCEP certificate (not the cert itself)

2. **Device** receives the SCEP certificate profile and contacts the NDES server using the URI configured in the profile
   - NDES server = same PC with Microsoft Intune Certificate Connector installed
   - Communication is on the customer's internal network

3. **NDES Connector** policy module validates the request is valid

4. **NDES server** forwards the certificate request to the Certification Authority (CA)

5. **CA** issues the SCEP certificate → sends back to NDES → forwards to device
   - Device now has both certificates needed: trusted root + SCEP certificate

6. **Intune Certificate Connector** reports status back to Intune service

## Key Points

- The SCEP certificate profile does NOT contain the certificate — it only contains the request parameters
- The NDES server acts as a proxy between the device and the CA
- Certificate-based authentication requires both the trusted root and the SCEP certificate
- The Intune Certificate Connector handles status reporting back to the Intune cloud service
