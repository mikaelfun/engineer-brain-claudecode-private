---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/How To/View Request Headers"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FView%20Request%20Headers"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# View Request Headers

This guide provides a way to view request headers being received by a backend server through a webpage — useful for validating AppGW Rewrites or AFD Rules without relying on packet captures.

## Overview

There are two options for setting up a webpage on a web server where we can see the request headers that the backend received. These can be added to the backend pool of an AppGW or in an origin group of AFD.

**Common headers seen:**

- Client to Server: `Host`, `Connection`, `Cache-Control`, `User-Agent`, `Accept`, `Accept-Language`
- Client → AppGW → Server: `X-Forwarded-For`, `X-Forwarded-Port`, `X-Forwarded-Proto`, `X-Original-Host`, `X-Original-Url`, `X-Appgw-Trace-Id`
- Client → Azure Front Door → Server: `Via`, `X-Azure-ClientIP`, `X-Azure-SocketIP`, `X-Azure-Ref`, `X-Azure-FDID`, `X-Forwarded-For`, `X-Forwarded-Host`, `X-Forwarded-Proto`

> The PHP file can be named anything as long as it ends with `.php`. Default web root is typically `/var/www/html`.

## Apache Setup

```bash
# Update and upgrade the system
sudo apt update && sudo apt upgrade -y
# Install Apache web server
sudo apt install apache2 -y
# Install PHP
sudo apt install php -y
# Create the PHP webpage
sudo nano /var/www/html/index.php
```

Paste this PHP content into `index.php`:

```php
<?php
$headers = apache_request_headers();

foreach ($headers as $header => $value) {
    echo "$header: $value <br />\n";
}
?>
```

Navigate to `http://<vm-ip>/index.php` to see the request headers.

> To verify PHP mod is loaded: `ls -al /etc/apache2/mods-enabled/ | grep php` — should see `phpX.X.conf` and `phpX.X.load` symbolic links.

## Nginx Setup

```bash
# Update and upgrade the system
sudo apt update && sudo apt upgrade -y
# Install Nginx
sudo apt install nginx -y
# Install PHP-FPM
sudo apt install php-fpm -y
# Create the PHP webpage
sudo nano /var/www/html/index.php
# Edit default nginx site to enable PHP processing
sudo nano /etc/nginx/sites-available/default
```

`index.php` content (same as Apache):

```php
<?php
$headers = apache_request_headers();

foreach ($headers as $header => $value) {
    echo "$header: $value <br />\n";
}
?>
```

`/etc/nginx/sites-available/default` configuration:

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;
    index index.html index.htm index.php;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

```bash
# Test and reload nginx
sudo nginx -t
sudo systemctl reload nginx
```

## References

- [AppGW Headers](https://learn.microsoft.com/en-us/azure/application-gateway/how-application-gateway-works#modifications-to-the-request)
- [AppGW Rewrites](https://learn.microsoft.com/en-us/azure/application-gateway/rewrite-http-headers-url)
- [AFD Headers](https://learn.microsoft.com/en-us/azure/frontdoor/front-door-http-headers-protocol#from-the-front-door-to-the-backend)
- [AFD Rules](https://learn.microsoft.com/en-us/azure/frontdoor/front-door-rules-engine?pivots=front-door-standard-premium)
