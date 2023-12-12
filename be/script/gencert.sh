#!/bin/bash
set -e

# Avoiding Chrome's security warning at dev
# -----------------------------------------
# Enable: chrome://flags/#allow-insecure-localhost


CN=localhost
# SANIP=IP-ADDRESS  # OPTIONAL

openssl req -x509 -newkey rsa:4096 -sha256 -days 3650 -nodes \
  -keyout $CN.key -out $CN.crt \
  -subj "/C=KR/ST=Seoul/O=SEC/OU=SE/CN=$CN" \
#  -addext "subjectAltName=IP:$SANIP"
#  -addext "subjectAltName=DNS:localhost"
#  -addext "subjectAltName=DNS:example.com,DNS:www.example.net,IP:10.0.0.1"

# openssl req -x509 -newkey rsa:4096 -sha256 -keyout $CN.key -out $CN.crt \
# -days 3650 -nodes -subj "/C=KR/ST=Seoul/O=SEC/OU=SE/CN=$CN"
