---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Networking/TLS/End to end TLS communication from APP GW to AKS using certificate chain"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Networking/TLS/End%20to%20end%20TLS%20communication%20from%20APP%20GW%20to%20AKS%20using%20certificate%20chain"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# End-to-end TLS communication between App Gateway and AKS

[[_TOC_]]

## Summary

End to end TLS communication from APP GW to AKS i.e when the backend application is configured as nginx ingress and with a chain of certificates(Root CA, Intermediate CA and Server Certificate). Below steps and this has worked for me and cx. Please note, this might not be applicable for all scenarios related to  end to end TLS communication from APP GW to AKS but can be used as a reference.

Please note, this setup is specifically when cx has a chain of certificates to configure end to end secure communication from App GW to AKS and not with a single certificate. As configuring end to end tls with a single certificate is pretty straight forward, just like any client to server TLS communication.

## Problem

Configure end to end TLS communication from APP GW to AKS i.e nginx ingress controller. Below is the traffic flow:

`Client(TLS request)  -> Application Gateway PIP -> Nginx ingress IP(TLS termination) -> Application Pod`

And cx s internal team has provided a certificate chain to configure nginx ingress with TLS. The certificate chain considers below certificates and keys. Since  the certs are provided by their internal team and not signed by any unknown CA, this certs and CA are untrusted. However, below are the same steps even when certs are signed by a known CA.

```text
Root CA
Intermediate CA (Which is signed by Root CA)
Server Certificate(Which is signed by Intermediate CA)
Server Certificate Private Key
```

## Issue Description

Nginx ingress controller route has been successfully configured with TLS and was able to access successfully using the following curl: `curl https://<nginx-ingress-ILB>:443  cacert <CACert file>`.  Configured nginx ingress ip as backend to App GW for any traffic to APP GW to be  securely routed to AKS nginx ingress. Also configured HTTP setting with TLS certificate for end to end secure communication. And also configured Listener  with HTTPS to access the APP GW securely. After the setup, now the challenge is the backend health is showing unhealthy with multiple errors i.e Can t trust the backend certificate, 502 Gateway timeout etc.

> Note: In this scenario, cx was using their own CA, which is untrusted and by default client doesn t  info about cx CA, so manually passing CAcert file to client using parameter   cacert , so that client can verify the server certificate using the CA cert file.

Since accessing the nginx ingress with https was able to access the application successfully, so issue doesn t looks to be at AKS nginx ingress but finally to fix this setup, changes has to be made at certificate configured at nginx ingress and also at APP GW http setting.

## High level steps to configure ingress-nginx and App Gateway for end-to-end TLS

- Create an TLS Secret in AKS, the certificate bundle should include an Root CA, Intermediate CA, Server Certificate and Server Certificate private Key and the key should just have Server Certificate private Key. The following command will create a certificate bundle secret in the cluster: `kubectl create secret tls  ingress07 --cert=server_ingress07.pem--key=www.example.com.key.pem07`
- Create a CA file to merge the Root CA & Intermediate CA: `cat intermediate.cert.pem ca.cert.pem >> cacert.pem`
- Create an nginx ingress with TLS and use above secret for https
- As usual create a busybox helper pod andcopy the cacert to the pod and validate the application accessibility overHTTPS for nginx ingress route.

   ```bash
   kubectl exec -it busybox-delete01 /bin/bash
   curl https://ingress07.nginx.com--cacert /tmp/cacert.pem 
   ```

- Once the above validation is successful, configure HTTP settings in APP GW. The cert in HTTP settings should just include the ROOT CA in only cer format and also in  hostname override, configure the hostname specified in nginx ingress route.

   ![App Gateway page in Azure Portal showing the certificate configuration section](/.attachments/image-d5ecc7d7-1b0a-40d0-b6bf-f941821a4d37.png)

- Now navigate to backend health in APP GW and verify the backend should result in healthy with status 200 OK.

## Key Takeaways

- Configuring the nginx ingress route only with Server certificate will not work. Make sure, the certificate should include all CA s with Server certificate and Server Private Key.
- In Http Setting, only Root CA should be configured in cer format and configuring the same certificate configured in nginx ingress route will not work.
- The backend health will result in healthy but testing the health probe will fail with CN mismatch. This is expected and I have verified with network team, they confirmed it s a bug(This might be fixed when you're reviewing it, please cross check with n/w team).

## Steps to create certificate bundle which will include all the above defined certs

### Scenario 1

If cx has provided certificate bundle in PFX format. Extract RootCA, Intermediate CA,  Server Certificate and Server Certificate private key from PFX cert and validate the Server Certificate with Intermediate CA. We can find many different ways to extract certs from PFX file in external source; the steps at <https://www.getfilecloud.com/supportdocs/display/cloud/Converting+Existing+PFX+SSL+Certificate+to+PEM+SSL+Certificate> look to be valid. I haven t tried this in my current issue as cx is using individual certs instead of PFX cert bundle.

After extracting individual certs, below steps can be followed to create a certificate bundle in pem format.

### Scenario 2

If cx has provided with individual certs like RootCA, Intermediate CA,  Server Certificate and Server Certificate private key. Follow below steps to create a cert bundle in pem format to configure in nginx ingress.

1. Using the individual cert components of:
   <!-- markdownlint-disable MD034 -->

   - ca.cert.pem
   - intermediate.cert.pem
   - www.example.com.cert.pem07
   - www.example.com.key.pem07

   <!-- markdownlint-enable MD034 -->

2. Merge the CA certs (root and intermediate) to create a single CA cert bundle: `cat intermediate.cert.pem ca.cert.pem >> cacert.pem`
3. Verify the above created chain CA cert for issuers in order:

   ```bash
   openssl crl2pkcs7 -nocrl -certfile cacert.pem  | openssl pkcs7 -print_certs -noout
   
   subject=C = IN, ST = TNG, O = Testing, OU = Testing CA, CN = Intermediate CA
   issuer=C = IN, ST = TNG, L = HYD, O = Testing, OU = Testing CA, CN = Root CA
   
   subject=C = IN, ST = TNG, L = HYD, O = Testing, OU = Testing CA, CN = Root CA
   issuer=C = IN, ST = TNG, L = HYD, O = Testing, OU = Testing CA, CN = Root CA
   ```

4. Created an PFX cert:

   ```bash
   openssl pkcs12 -export -out ingress07.pfx -inkey www.example.com.key.pem07 -in www.example.com.cert.pem07  -certfile cacert.pem
   Enter Export Password:
   Verifying - Enter Export Password:
   
   # ls
   ca.cert.pem  cacert.pem  ingress07.pfx  intermediate.cert.pem  www.example.com.cert.pem07  www.example.com.key.pem07
   ```

5. View the contents of PFX file: `openssl pkcs12 -info -in ingress07.pfx`
6. Convert the PFX to Pem file:

   ```bash
   openssl pkcs12 -in ingress07.pfx -out server_ingress07.pem -nodes
   Enter Import Password:
   ```

7. View contents of pem file: `openssl x509 -in server_ingress07.pem -text`
8. Created below Kubernetes secreted with above created pem file and Server key:

   ```bash
   kubectl create secret tls  ingress07 --cert=server_ingress07.pem --key=www.example.com.key.pem07
   secret/ingress07 created
   ```

9. Created below nginx ingress route:

   ```bash
   ; kubectl get ing ingress07
   NAME        CLASS    HOSTS                 ADDRESS     PORTS     AGE
   ingress07   <none>   ingress07.nginx.com   10.0.0.97   80, 443   2m29s
   
   ; cat nginx-ing07.yaml
   apiVersion: extensions/v1beta1
   kind: Ingress
   metadata:
     name: ingress07
     annotations:
       kubernetes.io/ingress.class: nginx
       nginx.ingress.kubernetes.io/ssl-redirect: "false"
       #    nginx.ingress.kubernetes.io/rewrite-target: /$2
   spec:
     tls:
      - secretName: ingress07
        hosts:
         - ingress07.nginx.com
     rules:
     - host: ingress07.nginx.com
       http:
         paths:
         - backend:
             serviceName: nginx
             servicePort: 80
           path: /
   ```

10. Successfully verified the access to above ingress route from a sample busybox pod:

   ```bash
   kubectl exec -it busybox-delete01 /bin/bash
   curl https://ingress07.nginx.com --cacert /tmp/cacert.pem
   ```

With above steps, setup at AKS nginx ingress and validation has been completed. Now need to focus on configuring cert at APP GW http setting.

## Configure APP GW http setting with certificate in cer format for backend application TLS validation and end to end secure communication

1. Download the pfx file  ingress07.pfx  from linux machine to windows machine and install the PFX file in windows certmgr tool, export  the RootCA file in cer format. The documentation at <https://docs.microsoft.com/en-us/azure/application-gateway/certificates-for-backend-authentication#export-trusted-root-certificate-for-v2-sku> walks through downloading the certificate in a CER format from the Cert Manager tool.
2. Verified the backend health for the health probe configured for the above http setting and returned Status Code 200.

   ![image.png](/.attachments/image-f5709978-f57f-4376-bf17-98bb67baa4cd.png)

3. Below command to access the app hosted in webapp using AppGW PIP.

   ```bash
   curl https://ingress07.nginx.com:444 --cacert cacert.pem
   
   # ping ingress07.nginx.com
   PING ingress07.nginx.com (52.250.72.48) 56(84) bytes of data.
   ```

## Few Useful commands while troubleshooting the issue

- Verify the content in the PEM cert file: `openssl x509 -in <cert> -text`
- Validate certificate with CA file: `openssl verify -CAfile ca.cert.pem intermediate.cert.pem`
- Verify the issuers of certificate chain in order: `openssl crl2pkcs7 -nocrl -certfile ca-chain.cert.pem  | openssl pkcs7 -print_certs -noout`
- Verify the TLS connectivity to server using openssl tool: `openssl s_client -connect ingress07.example.com:443 -servername ingress07.example.com -CAfile  chain.cert.pem`

## Owner and Contributors

**Owner:** Andrew Schull <anschul@microsoft.com>
**Contributors:**

- Naomi Priola <Naomi.Priola@microsoft.com>
- Steven Xiao <xinxia@microsoft.com>
- Rakesh Kumar B <rabingi@microsoft.com>
