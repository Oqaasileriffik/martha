#!/bin/bash

cd /martha
echo "Starting Martha TTS as Festival server"
./server_start.sh &

echo "Starting Apache"
/usr/sbin/apachectl -DFOREGROUND
