#!/usr/bin/env bash
set -e

echo "Starting Bakehouse front end build..."

# Expect the stack name to be passed in
if [ -z "$BAKEHOUSE_STACK_NAME" ]; then
  echo "BAKEHOUSE_STACK_NAME is not set"
  exit 1
fi

echo "Building for stack: $BAKEHOUSE_STACK_NAME"

# Inject Vite environment variables
export VITE_STACK_NAME="$BAKEHOUSE_STACK_NAME"
export VITE_API_ADDRESS="https://api.${BAKEHOUSE_STACK_NAME}.bakehouse.local"
export VITE_PRODUCT_CARDS_ADDRESS="https://product-cards-${BAKEHOUSE_STACK_NAME}-product-cards.s3.amazonaws.com"

echo "VITE_STACK_NAME=$VITE_STACK_NAME"
echo "VITE_API_ADDRESS=$VITE_API_ADDRESS"
echo "VITE_PRODUCT_CARDS_ADDRESS=$VITE_PRODUCT_CARDS_ADDRESS"

# Install and build
npm install
npm run build

echo "Build complete. Output in dist folder:"
ls ./dist
