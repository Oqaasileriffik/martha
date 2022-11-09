FROM amd64/debian:bullseye

LABEL vendor="Oqaasileriffik" \
	maintainer="Tino Didriksen <tino@oqaasileriffik.gl>" \
	gl.oqaasileriffik.product="Martha TTS Web Service" \
	gl.oqaasileriffik.codename="martha-web"

ENV LANG=C.UTF-8 \
	LC_ALL=C.UTF-8 \
	DEBIAN_FRONTEND=noninteractive \
	DEBCONF_NONINTERACTIVE_SEEN=true

RUN apt-get -q update && \
	apt-get -qfy dist-upgrade --no-install-recommends && \
	apt-get -qfy install --no-install-recommends apache2 libapache2-mod-php php-mbstring libasound2 libncurses5 lame sox && \
	apt-get -qfy autoremove --purge

# Remember to adjust list of modules to disable when changing Debian release
RUN echo 'export APACHE_RUN_USER=martha' >> /etc/apache2/envvars && \
	echo 'export APACHE_RUN_GROUP=martha' >> /etc/apache2/envvars && \
	a2dismod -f authz_host && \
	a2dismod -f authn_core && \
	a2dismod -f auth_basic && \
	a2dismod -f access_compat && \
	a2dismod -f authn_file && \
	a2dismod -f authz_user && \
	a2dismod -f alias && \
	a2dismod -f autoindex && \
	a2dismod -f mime && \
	a2dismod -f negotiation && \
	a2dismod -f deflate && \
	a2dismod -f setenvif && \
	a2dismod -f filter && \
	a2dismod -f env && \
	a2dismod -f status && \
	phpdismod -f opcache && \
	phpdismod -f calendar && \
	phpdismod -f ctype && \
	phpdismod -f exif && \
	phpdismod -f fileinfo && \
	phpdismod -f ftp && \
	phpdismod -f gettext && \
	phpdismod -f iconv && \
	phpdismod -f phar && \
	phpdismod -f posix && \
	phpdismod -f readline && \
	phpdismod -f shmop && \
	phpdismod -f sockets && \
	phpdismod -f sysvmsg && \
	phpdismod -f sysvsem && \
	phpdismod -f sysvshm && \
	phpdismod -f tokenizer

# Fetch from https://oqaasileriffik.gl/d/tts/martha-linux.tar.bz2
ADD martha-linux.tar.bz2 /
COPY stamp.scm /martha/
COPY server_start.sh /martha/

RUN echo 'Listen 8000' > /etc/apache2/ports.conf
COPY martha.tts.conf /etc/apache2/sites-available/
RUN rm -f /etc/apache2/sites-enabled/* && \
	ln -s ../sites-available/martha.tts.conf /etc/apache2/sites-enabled/martha.tts.conf && \
	ln -sf /dev/stdout /var/log/apache2/error.log && \
	ln -sf /dev/stdout /var/log/apache2/other_vhosts_access.log

RUN mkdir -p /martha && \
	groupadd -g 2134 martha && \
	useradd -d /martha -M -u 2134 -g martha martha && \
	chown -R martha:martha /martha && \
	chown -R martha:martha /var/log/apache2 /var/run/apache2

RUN mkdir -p /cache && \
	chown -R martha:martha /cache

COPY index.php /martha/
COPY run.sh /martha/

USER martha

EXPOSE 8000
ENTRYPOINT ["/martha/run.sh"]
