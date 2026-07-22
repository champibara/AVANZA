#!/bin/bash

# Generate development SSL certificates for Violence Digital Platform
# This script creates self-signed certificates for local development

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERTS_DIR="${SCRIPT_DIR}/../security/certs"

echo "Generating SSL certificates for local development..."

# Create certificates directory
mkdir -p "$CERTS_DIR"

# Generate root CA private key
echo "Generating root CA private key..."
openssl genrsa -out "$CERTS_DIR/rootCA.key" 4096

# Generate root CA certificate
echo "Generating root CA certificate..."
openssl req -x509 -new -nodes -key "$CERTS_DIR/rootCA.key" \
  -sha256 -days 1024 \
  -out "$CERTS_DIR/rootCA.crt" \
  -subj "/C=PE/ST=Lima/L=Lima/O=Violence Digital Platform/OU=Development/CN=violence-platform.local"

# Generate server private key
echo "Generating server private key..."
openssl genrsa -out "$CERTS_DIR/server.key" 2048

# Generate certificate signing request
echo "Generating certificate signing request..."
openssl req -new -key "$CERTS_DIR/server.key" \
  -out "$CERTS_DIR/server.csr" \
  -subj "/C=PE/ST=Lima/L=Lima/O=Violence Digital Platform/OU=Development/CN=violence-platform.local" \
  -reqexts SAN \
  -config <(cat /etc/ssl/openssl.cnf \
    <(printf "\n[SAN]\nsubjectAltName=DNS:violence-platform.local,DNS:localhost,DNS:*.violence-platform.local"))

# Generate server certificate signed by root CA
echo "Generating server certificate..."
openssl x509 -req -in "$CERTS_DIR/server.csr" \
  -CA "$CERTS_DIR/rootCA.crt" \
  -CAkey "$CERTS_DIR/rootCA.key" \
  -CAcreateserial \
  -out "$CERTS_DIR/server.crt" \
  -days 365 \
  -sha256 \
  -extfile <(printf "subjectAltName=DNS:violence-platform.local,DNS:localhost,DNS:*.violence-platform.local")

# Generate Diffie-Hellman parameters for perfect forward secrecy
echo "Generating Diffie-Hellman parameters..."
openssl dhparam -out "$CERTS_DIR/dhparam.pem" 2048

# Set proper permissions
chmod 600 "$CERTS_DIR/rootCA.key"
chmod 600 "$CERTS_DIR/server.key"
chmod 644 "$CERTS_DIR/rootCA.crt"
chmod 644 "$CERTS_DIR/server.crt"
chmod 644 "$CERTS_DIR/dhparam.pem"

# Create certificate bundle for Node.js
echo "Creating certificate bundle..."
cat "$CERTS_DIR/server.crt" "$CERTS_DIR/server.key" > "$CERTS_DIR/server-bundle.pem"
chmod 600 "$CERTS_DIR/server-bundle.pem"

echo ""
echo "Certificates generated successfully in $CERTS_DIR"
echo ""
echo "Files created:"
echo "  - rootCA.key       - Root CA private key"
echo "  - rootCA.crt       - Root CA certificate (install this in your browser)"
echo "  - server.key       - Server private key"
echo "  - server.crt       - Server certificate"
echo "  - dhparam.pem      - Diffie-Hellman parameters"
echo "  - server-bundle.pem - Combined certificate and key for Node.js"
echo ""
echo "To trust the certificate in your browser:"
echo "  1. Import $CERTS_DIR/rootCA.crt as a trusted root certificate"
echo "  2. Restart your browser"
echo ""
echo "To use with Node.js applications:"
echo "  Set TLS_CERT_PATH and TLS_KEY_PATH environment variables to:"
echo "  TLS_CERT_PATH=$CERTS_DIR/server.crt"
echo "  TLS_KEY_PATH=$CERTS_DIR/server.key"