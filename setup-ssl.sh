#!/bin/bash

# SSL Setup Script for Albadil Platform
# This script sets up SSL certificates using Let's Encrypt

set -e

echo "🔒 Setting up SSL for Albadil Platform..."

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root (use sudo)"
   exit 1
fi

# Variables
DOMAIN="albadil.com"
EMAIL="admin@albadil.com"
NGINX_CONF="/etc/nginx/sites-available/albadil"
NGINX_ENABLED="/etc/nginx/sites-enabled/albadil"

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install required packages
echo "🔧 Installing required packages..."
apt install -y nginx certbot python3-certbot-nginx ufw

# Configure firewall
echo "🔥 Configuring firewall..."
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw --force enable

# Create Nginx configuration
echo "🌐 Creating Nginx configuration..."
cp nginx.conf $NGINX_CONF

# Create symbolic link
ln -sf $NGINX_CONF $NGINX_ENABLED

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
nginx -t

# Reload Nginx
echo "🔄 Reloading Nginx..."
systemctl reload nginx

# Obtain SSL certificate
echo "🎫 Obtaining SSL certificate from Let's Encrypt..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive

# Test SSL configuration
echo "🧪 Testing SSL configuration..."
curl -I https://$DOMAIN

# Setup auto-renewal
echo "🔄 Setting up auto-renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Create SSL renewal script
cat > /etc/nginx/ssl-renew.sh << 'EOF'
#!/bin/bash
certbot renew --quiet
nginx -s reload
EOF

chmod +x /etc/nginx/ssl-renew.sh

# Final configuration test
echo "🧪 Final configuration test..."
nginx -t
systemctl reload nginx

echo "✅ SSL setup completed successfully!"
echo "🌐 Your site is now available at: https://$DOMAIN"
echo "📧 SSL certificate will auto-renew"
echo "🔒 Security headers are configured"
echo "📊 Nginx is configured with gzip compression"

# Show status
echo ""
echo "📊 Current status:"
systemctl status nginx --no-pager -l
echo ""
echo "🔐 SSL certificate info:"
certbot certificates
