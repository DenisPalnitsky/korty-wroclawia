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

# Check for API key
echo ""
echo "4️⃣  Checking API key..."

if [ -n "$OPENAI_API_KEY" ]; then
    echo "✅ OPENAI_API_KEY is set"
else
    echo "⚠️  OPENAI_API_KEY not set"
    echo ""
    echo "  export OPENAI_API_KEY='sk-...'"
    echo "  https://platform.openai.com/api-keys"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Try a dry run (pick your model):"
echo "  python update_prices.py --model gpt-5 --dry-run"

