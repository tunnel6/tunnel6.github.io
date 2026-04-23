#!/bin/bash

echo "🚀 YAT Website Setup"
echo "===================="
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm $(npm -v) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "🎉 Setup complete!"
    echo ""
    echo "📝 Available commands:"
    echo "   npm run docs:dev     - Start development server"
    echo "   npm run docs:build   - Build for production"
    echo "   npm run docs:preview - Preview production build"
    echo ""
    echo "🌐 Starting development server..."
    echo ""
    npm run docs:dev
else
    echo "❌ Failed to install dependencies"
    exit 1
fi
