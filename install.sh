#!/usr/bin/env bash

set -e

echo "Starting Bakehouse session setup..."
echo ""

# Root dependencies (CDK app)
echo "Installing root dependencies..."
npm install
echo ""

# CDK Lambda functions
if [ -d "functions" ]; then
  echo "Installing Lambda function dependencies..."
  cd functions
  npm install
  cd ..
  echo ""
fi

# Client build
if [ -d "client" ]; then
  echo "Installing client dependencies..."
  cd client
  npm install

  if [ -f "build.sh" ]; then
    echo "Running client build script..."
    chmod +x build.sh
    ./build.sh
  else
    echo "build.sh not found in client folder"
    exit 1
  fi

  cd ..
  echo ""
fi

echo "Setup complete"
