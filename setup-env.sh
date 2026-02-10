#!/bin/bash

# ==============================================================================
# BidStream Local Development Setup Script
# ==============================================================================
# This script helps you set up your local .env.local file for development.
# ==============================================================================

set -e  # Exit on any error

echo "🚀 BidStream - Local Environment Setup"
echo "======================================"
echo ""

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled."
        exit 0
    fi
fi

echo "📝 Creating .env.local from template..."

# Generate a secure JWT secret
JWT_SECRET=$(openssl rand -base64 32)

cat > .env.local << EOF
# ==============================================================================
# BidStream Local Development Environment
# Generated on: $(date)
# ==============================================================================

# --- DATABASE SECRETS ---
DB_USERNAME=admin
DB_PASSWORD=admin@1234

# --- SECURITY SECRETS ---
JWT_SECRET=$JWT_SECRET

# --- REDIS ---
REDIS_PASSWORD=

# --- THIRD PARTY KEYS ---
# NOTE: You need to fill these in manually!
GMAIL_USERNAME=your-email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# --- OAuth2 (Optional for Phase 1) ---
GOOGLE_CLIENT_ID=dummy-id
GOOGLE_CLIENT_SECRET=dummy-secret
OKTA_CLIENT_ID=dummy-okta-id
OKTA_CLIENT_SECRET=dummy-secret
OKTA_ISSUER_URI=https://dev-dummy.okta.com

# --- AI Services (Phase 2) ---
# GEMINI_API_KEY=your_api_key_here

# --- Payment Gateway (Phase 7) ---
# RAZORPAY_KEY_ID=rzp_test_example
# RAZORPAY_SECRET=example_secret
EOF

echo "✅ .env.local created successfully!"
echo ""
echo "🔑 Generated secure JWT_SECRET: $JWT_SECRET"
echo ""
echo "⚠️  IMPORTANT: Update the following manually in .env.local:"
echo "   - GMAIL_USERNAME (your Gmail address)"
echo "   - GMAIL_APP_PASSWORD (get from: https://myaccount.google.com/apppasswords)"
echo ""
echo "💡 To load environment variables, run:"
echo "   export \$(cat .env.local | xargs)"
echo ""
echo "🐳 To start services with Docker:"
echo "   docker-compose up -d"
echo ""
echo "🎉 Setup complete!"
