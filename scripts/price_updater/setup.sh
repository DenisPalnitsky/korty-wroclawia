#!/bin/bash
# Quick setup script for the price updater

echo "🎾 Setting up Tennis Court Price Updater..."
echo ""

# Check Python version
echo "1️⃣  Checking Python..."
python3 --version || { echo "❌ Python 3 not found!"; exit 1; }

# Install dependencies
echo ""
echo "2️⃣  Installing Python dependencies..."
pip3 install -r requirements_updater.txt || pip3 install -r "$(dirname "$0")/requirements_updater.txt"

# Install Playwright
echo ""
echo "3️⃣  Installing Playwright browser..."
playwright install chromium

# Check for API keys
echo ""
echo "4️⃣  Checking API keys..."
has_key=false

if [ -n "$ANTHROPIC_API_KEY" ]; then
    echo "✅ ANTHROPIC_API_KEY is set (Claude)"
    has_key=true
fi

if [ -n "$OPENAI_API_KEY" ]; then
    echo "✅ OPENAI_API_KEY is set (GPT)"
    has_key=true
fi

if [ "$has_key" = false ]; then
    echo "⚠️  No API keys found!"
    echo ""
    echo "Set at least one API key:"
    echo "  For Claude: export ANTHROPIC_API_KEY='sk-ant-your-key'"
    echo "  For GPT:    export OPENAI_API_KEY='sk-...'"
    echo ""
    echo "Get your key from:"
    echo "  Claude: https://console.anthropic.com/"
    echo "  GPT:    https://platform.openai.com/api-keys"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Try a dry run:"
echo "  python update_prices.py --dry-run"

