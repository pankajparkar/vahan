#!/bin/bash

# Oracle Cloud VM Setup Script for GitHub Actions Self-Hosted Runner
# Run this on your Oracle Cloud Ubuntu VM

set -e

echo "=== Setting up GitHub Actions Runner on Oracle Cloud ==="

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install dependencies
sudo apt-get install -y \
    curl \
    git \
    nodejs \
    npm \
    zip \
    unzip \
    jq

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Playwright dependencies
sudo npx playwright install-deps chromium

# Create runner directory
mkdir -p ~/actions-runner && cd ~/actions-runner

# Download latest runner
RUNNER_VERSION=$(curl -s https://api.github.com/repos/actions/runner/releases/latest | jq -r '.tag_name' | sed 's/v//')
curl -o actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz -L https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz
tar xzf ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

echo ""
echo "=== Runner downloaded ==="
echo ""
echo "Now configure the runner:"
echo ""
echo "1. Go to: https://github.com/YOUR_USERNAME/vahan/settings/actions/runners/new"
echo "2. Copy the token from the configuration command"
echo "3. Run: ./config.sh --url https://github.com/YOUR_USERNAME/vahan --token YOUR_TOKEN"
echo ""
echo "4. Install as service (runs on boot):"
echo "   sudo ./svc.sh install"
echo "   sudo ./svc.sh start"
echo ""
echo "=== Setup complete ==="
