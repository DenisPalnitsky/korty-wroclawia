#!/usr/bin/env python3
"""
Automatic Price Updater for Korty Wrocławia

This script crawls tennis club pricing pages and uses the OpenAI API to extract
and update pricing information in courts.yaml.

Usage:
    python update_prices.py --model MODEL [--dry-run] [--venue "Venue Name"]

Options:
    --model         OpenAI model id (required), e.g. gpt-5 or gpt-4o
    --dry-run       Show changes without applying them
    --venue         Update only a specific venue (by name)

Requires OPENAI_API_KEY.
"""

import argparse
import json
import os
import sys
from pathlib import Path

import yaml
from playwright.sync_api import sync_playwright
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.panel import Panel

console = Console()


class PriceUpdater:
    def __init__(self, dry_run=False, *, model):
        self.dry_run = dry_run
        self.model = model
        # Script is in scripts/price_updater/, so go up to project root
        self.yaml_path = Path(__file__).parent.parent.parent / "src" / "assets" / "courts.yaml"

        self.llm_client = self._initialize_openai_client()

    def _initialize_openai_client(self):
        try:
            from openai import OpenAI
        except ImportError:
            console.print("❌ OpenAI package not installed! Run: pip install openai", style="red")
            sys.exit(1)

        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            console.print("❌ OPENAI_API_KEY not set!", style="red")
            sys.exit(1)

        console.print(f"🤖 Using OpenAI ({self.model})", style="cyan")
        return OpenAI(api_key=api_key)

    def load_yaml(self):
        """Load the courts.yaml file"""
        with open(self.yaml_path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)

    def save_yaml(self, data):
        """Save data back to courts.yaml"""
        with open(self.yaml_path, 'w', encoding='utf-8') as f:
            yaml.dump(data, f, allow_unicode=True, sort_keys=False, default_flow_style=False)

    def crawl_page(self, url):
        """Crawl a pricing page and return HTML content"""
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()

                console.print(f"  🌐 Loading [cyan]{url}[/cyan]")
                page.goto(url, wait_until="networkidle", timeout=30000)

                # Wait a bit for any dynamic content
                page.wait_for_timeout(2000)

                # Try to click on "cennik" (pricing) menu if it exists
                # This handles SPAs where pricing is hidden behind navigation
                try:
                    cennik_clicked = page.evaluate("""() => {
                        // Look for elements containing "cennik" (case insensitive)
                        const elements = Array.from(document.querySelectorAll('a, button, [role="button"], .menu-item, .nav-item'));
                        const cennikElement = elements.find(el =>
                            el.textContent.toLowerCase().includes('cennik') ||
                            el.textContent.toLowerCase().includes('ceny') ||
                            el.getAttribute('href')?.includes('cennik')
                        );

                        if (cennikElement) {
                            cennikElement.click();
                            return true;
                        }
                        return false;
                    }""")

                    if cennik_clicked:
                        console.print("  📋 Found 'cennik' menu, clicking...", style="cyan")
                        # Wait for pricing content to load
                        page.wait_for_timeout(2000)
                        # Wait for any network activity to settle
                        try:
                            page.wait_for_load_state("networkidle", timeout=5000)
                        except:
                            pass  # Continue even if timeout
                except Exception as e:
                    console.print(f"  ⚠️  Could not click cennik: {str(e)}", style="yellow")

                # Now try to detect and click through court-type switches (indoor/dome/tent/outdoor)
                # This handles sites like Matchpoint that have separate pricing for each court type
                all_content = []
                try:
                    # Try to find court type switches/tabs - use comprehensive selector
                    court_types = page.evaluate("""() => {
                        // Look for all potentially clickable elements
                        const selectors = [
                            'button', '[role="button"]', 'input[type="radio"]', 'input[type="checkbox"]',
                            '.tab', '.switch', '.btn', '.toggle', 'label', 'a', 'div[onclick]', 'span[onclick]'
                        ];

                        const elements = [];
                        selectors.forEach(sel => {
                            elements.push(...Array.from(document.querySelectorAll(sel)));
                        });

                        // Filter for court-type related elements
                        const courtTypeElements = elements.filter(el => {
                            const text = (el.textContent || '').toLowerCase().trim();
                            const label = (el.getAttribute('aria-label') || '').toLowerCase();
                            const name = (el.getAttribute('name') || '').toLowerCase();
                            const id = (el.getAttribute('id') || '').toLowerCase();
                            const classNames = (el.className || '').toLowerCase();

                            // Look for court type keywords
                            const keywords = ['indoor', 'hala', 'dome', 'balon', 'namiot',
                                            'tent', 'outdoor', 'odkryte', 'court', 'kort'];

                            return keywords.some(keyword =>
                                text.includes(keyword) || label.includes(keyword) ||
                                name.includes(keyword) || id.includes(keyword) ||
                                classNames.includes(keyword)
                            );
                        });

                        // Return unique elements with useful info
                        const seen = new Set();
                        return courtTypeElements
                            .filter(el => {
                                const key = el.textContent.trim() + el.tagName;
                                if (seen.has(key)) return false;
                                seen.add(key);
                                return el.textContent.trim().length > 0;
                            })
                            .map(el => ({
                                text: el.textContent.trim(),
                                tag: el.tagName,
                                type: el.type || null,
                                id: el.id || null,
                                className: el.className || null
                            }));
                    }""")

                    # Debug: show what was found
                    if court_types and len(court_types) > 0:
                        console.print(f"  🔍 Found {len(court_types)} potential court type switches:", style="cyan")
                        for ct in court_types:
                            console.print(f"      - {ct['text']} ({ct['tag']})", style="dim")

                        console.print(f"  🔄 Collecting pricing for each court type...", style="cyan")

                        # Click through each court type and collect content
                        for i, court_type in enumerate(court_types):
                            try:
                                console.print(f"    Attempting to click: {court_type['text']}", style="dim")

                                # Click the switch using exact text match
                                clicked = page.evaluate(f"""(courtTypeText) => {{
                                    const selectors = [
                                        'button', '[role="button"]', 'input[type="radio"]', 'input[type="checkbox"]',
                                        '.tab', '.switch', '.btn', '.toggle', 'label', 'a', 'div[onclick]', 'span[onclick]'
                                    ];

                                    let elements = [];
                                    selectors.forEach(sel => {{
                                        elements.push(...Array.from(document.querySelectorAll(sel)));
                                    }});

                                    // Find exact match by text
                                    const target = elements.find(el =>
                                        el.textContent.trim() === courtTypeText
                                    );

                                    if (target) {{
                                        target.click();
                                        return true;
                                    }}
                                    return false;
                                }}""", court_type["text"])

                                if not clicked:
                                    console.print(f"    ⚠️  Could not click: {court_type['text']}", style="yellow")
                                    continue

                                # Wait for content to update
                                page.wait_for_timeout(2000)

                                # Wait for any network activity
                                try:
                                    page.wait_for_load_state("networkidle", timeout=3000)
                                except:
                                    pass

                                # Get content for this court type
                                type_content = page.evaluate("""() => {
                                    const selectors = ['main', 'article', '.content', '#content', 'body'];
                                    for (const sel of selectors) {
                                        const elem = document.querySelector(sel);
                                        if (elem) return elem.innerText;
                                    }
                                    return document.body.innerText;
                                }""")

                                all_content.append(f"\n=== {court_type['text']} ===\n{type_content}")
                                console.print(f"    ✓ Collected pricing for: {court_type['text']}", style="green")

                            except Exception as e:
                                console.print(f"    ⚠️  Error for {court_type['text']}: {str(e)}", style="yellow")
                    else:
                        console.print("  ℹ️  No court type switches detected", style="dim")

                except Exception as e:
                    console.print(f"  ⚠️  Could not process court type switches: {str(e)}", style="yellow")

                # Get the main content (or combined content if we clicked through switches)
                if all_content:
                    content = "\n\n".join(all_content)
                else:
                    content = page.evaluate("""() => {
                        // Try to find main content areas
                        const selectors = ['main', 'article', '.content', '#content', 'body'];
                        for (const sel of selectors) {
                            const elem = document.querySelector(sel);
                            if (elem) return elem.innerText;
                        }
                        return document.body.innerText;
                    }""")

                browser.close()
                return content
        except Exception as e:
            console.print(f"  ❌ Error crawling {url}: {str(e)}", style="red")
            return None

    def extract_pricing_with_llm(self, venue_name, venue_data, page_content):
        """Use OpenAI to extract pricing information from page content"""

        # Build court structure info for context
        courts_info = []
        for court in venue_data.get('courts', []):
            court_type = court.get('type', 'unknown')
            surface = court.get('surface', 'unknown')
            count = len(court.get('courts', []))
            courts_info.append(f"- {count}x {court_type} courts, surface: {surface}")

        courts_description = "\n".join(courts_info)

        prompt = f"""You are extracting tennis court pricing information for: {venue_name}

VENUE STRUCTURE:
{courts_description}

PRICING PAGE CONTENT:
{page_content[:6000]}

CONTENT FORMAT NOTES:
- The content may have sections marked with "===" headers for different court types (e.g., "=== Indoor ===" or "=== Dome ===")
- Each section contains pricing for that specific court type
- Parse pricing from the appropriate section matching each court type

YOUR TASK:
Extract the current WINTER season pricing (typically Oct/Nov 2025 - Apr/May 2026).

IMPORTANT RULES:
1. **OUTDOOR courts are CLOSED in winter** - return empty schedule for outdoor courts
2. Only extract prices for INDOOR/TENT/BALLOON courts during winter
3. Prices are typically in PLN per hour
4. Common time slots: 6-15 (daytime), 15-23 (evening)
5. Common days: weekdays (mo-fr), weekends (sa, su), holidays (hl)
6. **If content has section headers (===), match pricing from the correct section to the court type**
7. Map court type names: "hala" = indoor, "namiot" = tent, "balon" = balloon, "odkryte" = outdoor

Return ONLY a JSON object with this structure:
{{
  "season": "winter",
  "from": "2025-10-01",
  "to": "2026-05-01",
  "courts": [
    {{
      "type": "indoor/tent/balloon/outdoor",
      "surface": "clay/hard/carpet/grass",
      "schedule": {{
        "*:6-15": "120",
        "*:15-23": "150",
        "su:6-23": "130"
      }}
    }}
  ]
}}

If outdoor courts exist, include them with empty schedule: {{"schedule": {{}}}}

RETURN ONLY VALID JSON, NO MARKDOWN, NO EXPLANATIONS."""

        try:
            console.print(f"  🤖 Asking {self.model} to extract pricing...", style="yellow")
            response_text = self._call_openai(prompt)

            # Try to extract JSON if wrapped in markdown
            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]
                response_text = response_text.strip()

            pricing_data = json.loads(response_text)
            return pricing_data

        except Exception as e:
            console.print(f"  ❌ Error extracting pricing: {str(e)}", style="red")
            return None

    def _call_openai(self, prompt):
        """Call OpenAI API"""
        model = self.model

        # GPT-5/o1 specific parameters
        is_reasoning_model = model.startswith("gpt-5") or model.startswith("o1")
        token_param = "max_completion_tokens" if is_reasoning_model else "max_tokens"

        params = {
            "model": model,
            "messages": [
                {"role": "system", "content": "You are a helpful assistant that extracts structured data from text."},
                {"role": "user", "content": prompt}
            ],
            token_param: 2000
        }

        # GPT-5/o1 doesn't support temperature parameter (always uses 1)
        if not is_reasoning_model:
            params["temperature"] = 0

        response = self.llm_client.chat.completions.create(**params)
        return response.choices[0].message.content.strip()

    def apply_pricing_update(self, venue_data, pricing_data):
        """Apply extracted pricing to venue data"""
        if not pricing_data or 'courts' not in pricing_data:
            return False

        season_from = pricing_data.get('from', '2025-10-01')
        season_to = pricing_data.get('to', '2026-05-01')

        changes_made = False

        for extracted_court in pricing_data['courts']:
            court_type = extracted_court.get('type')
            surface = extracted_court.get('surface')
            schedule = extracted_court.get('schedule', {})

            # Find matching court in venue data
            for court in venue_data.get('courts', []):
                if (court.get('type') == court_type and
                    court.get('surface') == surface):

                    # Update or add pricing schedule
                    if 'prices' not in court:
                        court['prices'] = []

                    # Find existing winter schedule or create new
                    existing_schedule = None
                    for price_entry in court['prices']:
                        if (price_entry.get('from') == season_from and
                            price_entry.get('to') == season_to):
                            existing_schedule = price_entry
                            break

                    if existing_schedule:
                        existing_schedule['schedule'] = schedule
                    else:
                        court['prices'].append({
                            'from': season_from,
                            'to': season_to,
                            'schedule': schedule
                        })

                    changes_made = True
                    break

        return changes_made

    def update_venue(self, venue_data):
        """Update pricing for a single venue"""
        venue_name = venue_data.get('name', 'Unknown')
        prices_source = venue_data.get('prices_source')

        if not prices_source:
            console.print(f"⚠️  {venue_name}: No prices_source URL, skipping", style="yellow")
            return False

        console.print(f"\n📍 Processing: [bold]{venue_name}[/bold]")

        # Crawl the pricing page
        page_content = self.crawl_page(prices_source)
        if not page_content:
            return False

        # Extract pricing with LLM
        pricing_data = self.extract_pricing_with_llm(venue_name, venue_data, page_content)
        if not pricing_data:
            return False

        # Show extracted data
        console.print("  ✅ Extracted pricing:", style="green")
        console.print(Panel(str(pricing_data), expand=False))

        # Apply updates
        if self.dry_run:
            console.print("  ℹ️  Dry run - changes not applied", style="blue")
        else:
            changes_made = self.apply_pricing_update(venue_data, pricing_data)
            if changes_made:
                console.print("  ✅ Pricing updated", style="green")
            else:
                console.print("  ⚠️  No changes applied", style="yellow")

        return True

    def run(self, specific_venue=None):
        """Run the price update process"""
        console.print(Panel.fit(
            "🎾 [bold]Tennis Court Price Updater[/bold] 🎾\n"
            f"Mode: {'DRY RUN' if self.dry_run else 'LIVE UPDATE'}\n"
            f"Model: {self.model}",
            border_style="green"
        ))

        # Load YAML
        console.print("\n📂 Loading courts.yaml...")
        data = self.load_yaml()
        venues = data if isinstance(data, list) else [data]

        # Filter to specific venue if requested
        if specific_venue:
            venues = [v for v in venues if v.get('name') == specific_venue]
            if not venues:
                console.print(f"❌ Venue '{specific_venue}' not found!", style="red")
                return

        # Process each venue
        success_count = 0
        total_venues = len([v for v in venues if 'prices_source' in v])

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            task = progress.add_task(f"Processing {total_venues} venues...", total=total_venues)

            for venue in venues:
                if 'prices_source' in venue:
                    if self.update_venue(venue):
                        success_count += 1
                    progress.advance(task)

        # Save results
        if not self.dry_run and success_count > 0:
            console.print("\n💾 Saving updated courts.yaml...")
            self.save_yaml(data)
            console.print("✅ File saved successfully!", style="green")

        # Summary
        console.print(f"\n📊 Summary: {success_count}/{total_venues} venues processed successfully")

        if self.dry_run:
            console.print("\nℹ️  This was a dry run. Run without --dry-run to apply changes.", style="blue")


def main():
    parser = argparse.ArgumentParser(description="Update tennis court prices automatically")
    parser.add_argument(
        '--model',
        required=True,
        metavar='NAME',
        help='OpenAI model id (required), e.g. gpt-5 or gpt-4o',
    )
    parser.add_argument('--dry-run', action='store_true', help='Show changes without applying them')
    parser.add_argument('--venue', type=str, help='Update only a specific venue')

    args = parser.parse_args()

    updater = PriceUpdater(dry_run=args.dry_run, model=args.model)
    updater.run(specific_venue=args.venue)


if __name__ == "__main__":
    main()

