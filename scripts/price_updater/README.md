# 🤖 Automatic Price Updater

This script automatically updates tennis court prices in `courts.yaml` by crawling club websites and using AI (Claude or GPT) to extract pricing information.

## 🚀 Setup

### 1. Run the setup script

```bash
cd scripts/price_updater
./setup.sh
```

Or manually:

```bash
# Install dependencies
pip install -r scripts/price_updater/requirements_updater.txt

# Install Playwright browser
playwright install chromium
```

### 2. Set Up API Key

Choose **either** Anthropic (Claude) **or** OpenAI (GPT):

#### Option A: Anthropic (Claude) - Recommended
Get your API key from [console.anthropic.com](https://console.anthropic.com/)

```bash
export ANTHROPIC_API_KEY='sk-ant-your-key-here'
```

#### Option B: OpenAI (GPT-5)
Get your API key from [platform.openai.com](https://platform.openai.com/api-keys)

```bash
export OPENAI_API_KEY='sk-...'

# Optional: Override model (defaults to gpt-5)
export OPENAI_MODEL='gpt-4o'  # or 'gpt-5', 'gpt-4-turbo', etc.
```

**Note:** If both keys are set, Anthropic (Claude) will be used by default. You can override this with `--provider openai`.

## 📖 Usage

### Update All Venues (Dry Run First)

```bash
cd scripts/price_updater

# Dry run - see what would change without applying
python update_prices.py --dry-run

# Apply changes
python update_prices.py

# Use specific provider
python update_prices.py --provider openai --dry-run
```

### Update Single Venue

```bash
cd scripts/price_updater

# Test on one venue first
python update_prices.py --venue "Matchpoint Wrocław" --dry-run

# Apply to that venue
python update_prices.py --venue "Matchpoint Wrocław"

# Use GPT (defaults to GPT-5) instead of Claude
python update_prices.py --venue "Matchpoint Wrocław" --provider openai --dry-run
```

### Command-Line Options

- `--dry-run` - Preview changes without applying them (always use this first!)
- `--venue "Name"` - Update only a specific venue by name
- `--provider anthropic|openai` - Choose LLM provider: 'anthropic' for Claude, 'openai' for GPT (auto-detected if not specified)

## 🎯 How It Works

1. **Reads `courts.yaml`** - Loads all venue data
2. **Crawls pricing pages** - For each venue with `prices_source`, visits the URL
3. **Handles interactive pages** - Automatically clicks "cennik" (pricing) menus if needed
4. **Extracts with Claude** - Sends page content to Claude API with context about the venue
5. **Applies updates** - Updates the YAML structure with new pricing schedules
6. **Saves file** - Writes the updated data back to `courts.yaml`

### 🤖 Multi-Provider LLM Support

The script supports both **Anthropic (Claude)** and **OpenAI (GPT-5)** for price extraction:

**Auto-detection:**
- If only one API key is set, uses that provider automatically
- If both keys are set, defaults to Anthropic (Claude)
- Override with `--provider openai` or `--provider anthropic`

**Models used:**
- **Anthropic:** `claude-sonnet-4-20250514` (latest Claude Sonnet)
- **OpenAI:** `gpt-5` (default, configurable via `OPENAI_MODEL` env var)

**Why both?**
- ✅ Flexibility - use whichever API you have access to
- ✅ Cost optimization - choose based on pricing
- ✅ Redundancy - if one is down, use the other

### 🔍 Interactive Menu Handling

The script automatically handles complex website interactions:

**1. Pricing Menu Navigation:**
- **Searches for pricing links** - Looks for elements containing "cennik" or "ceny"
- **Clicks automatically** - Triggers the menu item to reveal pricing
- **Waits for content** - Allows time for dynamic content (SPAs) to load

**2. Court Type Switches:**
- **Detects switches/tabs** - Finds buttons for "indoor", "dome", "tent", "outdoor"
- **Clicks through all types** - Collects pricing for each court type separately
- **Combines content** - Aggregates all pricing into one structured dataset
- **Smart matching** - LLM matches pricing to correct court types

**Example sites this handles:**
- ✅ **Matchpoint** - Has "indoor" vs "dome" switches that show different prices
- ✅ **tenis4u.pl** - Requires clicking "cennik" tab
- ✅ Other SPAs with hidden pricing sections
- ✅ Traditional sites with dropdown menus

**Polish court type mappings:**
- `hala` → indoor
- `namiot` → tent
- `balon` → balloon
- `odkryte` → outdoor

## 🛡️ Safety Features

- **Dry run mode** - Always test first with `--dry-run`
- **Single venue testing** - Test on one venue before running all
- **Error handling** - Continues processing even if one venue fails
- **Progress tracking** - Shows what's being processed
- **Clear summaries** - Reports success/failure for each venue

## 💡 Tips

1. **Always dry run first**: See what will change before applying
   ```bash
   cd scripts/price_updater
   python update_prices.py --dry-run
   ```

2. **Test on one venue**: Debug any issues on a single venue
   ```bash
   cd scripts/price_updater
   python update_prices.py --venue "Matchpoint Wrocław" --dry-run
   ```

3. **Review changes**: After running, check the diff in git
   ```bash
   git diff src/assets/courts.yaml
   ```

4. **Commit if good**: If changes look correct, commit them
   ```bash
   git add src/assets/courts.yaml
   git commit -m "Update tennis court prices - Winter 2025/2026"
   ```

## 🔧 Troubleshooting

### API Key Error
```
❌ No API keys found!
Set either ANTHROPIC_API_KEY or OPENAI_API_KEY environment variable
```
**Fix**: Set at least one API key:
```bash
export ANTHROPIC_API_KEY='sk-ant-...'  # For Claude
# OR
export OPENAI_API_KEY='sk-...'          # For GPT
```

### Playwright Error
```
❌ Error: Executable doesn't exist at ...
```
**Fix**: Run `playwright install chromium`

### Page Won't Load
```
❌ Error crawling https://...
```
**Fix**: Some sites may block automated access. You may need to manually update that venue.

### LLM Extraction Error
```
❌ Error extracting pricing: ...
```
**Fix**: The page structure might be unusual. Try:
1. Check the pricing page manually
2. Try the other provider: `--provider openai` or `--provider anthropic`
3. Adjust the prompt in the script if needed

### Model Not Found Error (OpenAI)
```
❌ Error: Model 'gpt-5' does not exist
```
**Fix**: The GPT-5 model might not be available in your account yet. Use an alternative:
```bash
# Use GPT-4o instead
export OPENAI_MODEL='gpt-4o'
python update_prices.py --provider openai --dry-run

# Or use GPT-4 Turbo
export OPENAI_MODEL='gpt-4-turbo-preview'
```

## 📅 Recommended Schedule

Run this script:
- **Seasonally** - When winter/summer prices change (April/May and October/November)
- **Quarterly** - To catch any mid-season updates
- **On demand** - When you hear about price changes

## 🎨 Example Output

```
🎾 Tennis Court Price Updater 🎾
Mode: DRY RUN

🤖 Using Anthropic (Claude Sonnet 4)

📂 Loading courts.yaml...

📍 Processing: Matchpoint Wrocław
  🌐 Loading https://matchpoint.com.pl/cennik/
  🤖 Asking Claude to extract pricing...
  ✅ Extracted pricing:
  ┌────────────────────────────────────────┐
  │ {'season': 'winter',                   │
  │  'from': '2025-10-01',                 │
  │  'to': '2026-05-01',                   │
  │  'courts': [...]                       │
  └────────────────────────────────────────┘
  ℹ️  Dry run - changes not applied

📊 Summary: 20/22 venues processed successfully
```

## 🔄 Future Improvements

Ideas for v2:
- [ ] Diff viewer before applying changes
- [ ] Support for summer season updates
- [ ] Email notifications when prices change
- [ ] Scheduled runs via GitHub Actions
- [ ] Better error recovery and retry logic

