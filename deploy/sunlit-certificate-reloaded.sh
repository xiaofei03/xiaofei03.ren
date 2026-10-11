#!/bin/sh
set -eu
# Install in /etc/letsencrypt/renewal-hooks/deploy/ after the certificate exists.
# Do not change certificate renewal for other existing websites.
case " ${RENEWED_DOMAINS:-} " in
  *" xiaofei03.ren "*) /usr/sbin/nginx -t && /bin/systemctl reload nginx ;;
esac
