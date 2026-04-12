#!/usr/bin/env python3
"""
Scrape court availability from twojtenis.pl for Centrum Tenisowe Redeco.

Requires environment variables:
- TWOJ_TENIS_USER: Email or phone number for login
- TWOJ_TENIS_PASSWORD (or TOWJ_TENIS_PASSWORD): Password for login

Usage:
    python scrape_twojtenis.py [--date YYYY-MM-DD] [--output json|text]
"""

import os
import sys
import json
import re
import argparse
from datetime import datetime, timedelta
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout


BASE_URL = "https://www.twojtenis.pl"
CLUB_URL = f"{BASE_URL}/pl/kluby/centrum_tenisowe_redeco"
LOGIN_URL = f"{BASE_URL}/pl/login.html"
SCHEDULE_URL = f"{CLUB_URL}/courts_list.html"


def get_credentials():
    """Get login credentials from environment variables."""
    user = os.environ.get("TWOJ_TENIS_USER")
    # Support both spellings of the password env var
    password = os.environ.get("TWOJ_TENIS_PASSWORD") or os.environ.get("TOWJ_TENIS_PASSWORD")

    if not user or not password:
        print("Error: TWOJ_TENIS_USER and TWOJ_TENIS_PASSWORD (or TOWJ_TENIS_PASSWORD) environment variables must be set",
              file=sys.stderr)
        sys.exit(1)

    return user, password


def login(page, user: str, password: str) -> bool:
    """Login to twojtenis.pl."""
    print(f"Navigating to login page...", file=sys.stderr)
    page.goto(LOGIN_URL, wait_until="networkidle")

    # Wait for login form to be visible (main form uses #email, header uses #login_email)
    page.wait_for_selector('#email', state="visible", timeout=15000)

    # Fill in credentials
    print(f"Logging in as {user}...", file=sys.stderr)
    page.fill('#email', user)
    page.fill('#password', password)

    # Click login button (the main form button has class btn_secure)
    page.click('button.btn_secure:has-text("zaloguj się")')

    # Wait for navigation or error
    try:
        # Check if login was successful by looking for user menu or redirect
        page.wait_for_function(
            """() => {
                // Check if we're no longer on login page or if user is logged in
                return !window.location.href.includes('login.html') ||
                       document.querySelector('a[href*="logout"]') !== null ||
                       document.querySelector('.user-menu') !== null;
            }""",
            timeout=10000
        )
        print("Login successful!", file=sys.stderr)
        return True
    except PlaywrightTimeout:
        # Check for error message
        error = page.query_selector('.error, .alert-danger, [class*="error"]')
        if error:
            print(f"Login failed: {error.inner_text()}", file=sys.stderr)
        else:
            print("Login failed: timeout waiting for redirect", file=sys.stderr)
        return False


def navigate_to_date(page, target_date: datetime) -> bool:
    """Navigate to a specific date in the schedule using the date picker."""
    date_str = target_date.strftime("%d.%m.%Y")
    print(f"Navigating to date: {date_str}", file=sys.stderr)

    # Check if there's a date picker input
    date_input = page.query_selector('input[type="text"][value*="."]')
    if date_input:
        current_value = date_input.get_attribute('value')
        if current_value != date_str:
            # Click on the date input to open picker, or try direct navigation
            # The page might reload with date parameter
            page.goto(f"{SCHEDULE_URL}?date={target_date.strftime('%Y-%m-%d')}", wait_until="networkidle")
            return True

    return False


def scrape_schedule(page, target_date: datetime = None) -> dict:
    """Scrape court availability from the schedule page."""
    print(f"Navigating to schedule page...", file=sys.stderr)
    page.goto(SCHEDULE_URL, wait_until="networkidle")

    # Wait for schedule content to load
    try:
        page.wait_for_selector('.schedule_col', timeout=15000)
    except PlaywrightTimeout:
        # Check if still showing "login required" message
        blocked_msg = page.query_selector('text=zablokował wyświetlanie')
        if blocked_msg:
            print("Error: Schedule still blocked - login may have failed", file=sys.stderr)
            return {"error": "Login required", "courts": []}
        print("Warning: Could not find schedule elements", file=sys.stderr)

    # Navigate to target date if specified
    if target_date:
        navigate_to_date(page, target_date)
        # Wait for page to update
        page.wait_for_timeout(1000)

    # Extract current date from the page
    current_date = extract_current_date(page)

    # Extract schedule data using JavaScript for better performance
    schedule_data = page.evaluate("""() => {
        const courts = [];
        const columns = document.querySelectorAll('.schedule_col');

        columns.forEach((col, colIndex) => {
            // Get court name from header
            const header = col.querySelector('.schedule_header strong');
            if (!header) return;

            const courtName = header.innerText.trim();
            if (!courtName || courtName === '') return;

            // Get all time slots
            const slots = [];
            const rows = col.querySelectorAll('.schedule_row');

            rows.forEach(row => {
                const rowId = row.id || '';
                const rowClass = row.className || '';

                // Parse time from ID (format: bidi_X_X_X_HH_MM)
                const timeMatch = rowId.match(/_(\\d{2})_(\\d{2})$/);
                if (!timeMatch) return;

                const hour = timeMatch[1];
                const minute = timeMatch[2];
                const time = `${hour}:${minute}`;

                // Determine availability
                const isAvailable = rowClass.includes('reservation_bg') && !rowClass.includes('reservation_closed');
                const isClosed = rowClass.includes('reservation_closed');

                slots.push({
                    time: time,
                    available: isAvailable,
                    booked: isClosed,
                    id: rowId
                });
            });

            if (slots.length > 0) {
                // Get additional court info
                const courtInfo = col.querySelector('.schedule_header');
                const infoText = courtInfo ? courtInfo.innerText : '';

                courts.push({
                    name: courtName,
                    info: infoText.replace(courtName, '').trim(),
                    slots: slots,
                    available_count: slots.filter(s => s.available).length,
                    booked_count: slots.filter(s => s.booked).length
                });
            }
        });

        return courts;
    }""")

    result = {
        "scraped_at": datetime.now().isoformat(),
        "club": "Centrum Tenisowe Redeco",
        "url": SCHEDULE_URL,
        "date": current_date or (target_date.strftime("%Y-%m-%d") if target_date else datetime.now().strftime("%Y-%m-%d")),
        "courts": schedule_data
    }

    # Add summary
    total_available = sum(c.get("available_count", 0) for c in schedule_data)
    total_booked = sum(c.get("booked_count", 0) for c in schedule_data)
    result["summary"] = {
        "total_courts": len(schedule_data),
        "total_available_slots": total_available,
        "total_booked_slots": total_booked
    }

    return result


def extract_current_date(page) -> str:
    """Extract the currently displayed date from the schedule page."""
    # Look for the active/bold date in the date selector
    active_date = page.query_selector('.schedule_date strong, [class*="date"] strong')
    if active_date:
        date_text = active_date.inner_text().strip()
        # Parse format like "29.01" and add year
        match = re.match(r'(\d{1,2})\.(\d{1,2})', date_text)
        if match:
            day, month = match.groups()
            year = datetime.now().year
            return f"{year}-{month.zfill(2)}-{day.zfill(2)}"

    # Try date input field
    date_input = page.query_selector('input[value*=".20"]')
    if date_input:
        value = date_input.get_attribute('value')
        # Parse format like "29.01.2026"
        match = re.match(r'(\d{1,2})\.(\d{1,2})\.(\d{4})', value)
        if match:
            day, month, year = match.groups()
            return f"{year}-{month.zfill(2)}-{day.zfill(2)}"

    return None


def format_text_output(schedule: dict) -> str:
    """Format schedule data as human-readable text."""
    lines = []
    lines.append(f"Court Availability - {schedule.get('club', 'Unknown')}")
    lines.append(f"Date: {schedule.get('date', 'Unknown')}")
    lines.append("=" * 60)

    courts = schedule.get("courts", [])
    if not courts:
        lines.append("No court data found")
        return "\n".join(lines)

    for court in courts:
        lines.append(f"\n{court['name']}")
        if court.get('info'):
            lines.append(f"  ({court['info']})")
        lines.append("-" * 40)

        available_slots = [s for s in court.get("slots", []) if s.get("available")]
        booked_slots = [s for s in court.get("slots", []) if s.get("booked")]

        if available_slots:
            lines.append("  Available times:")
            # Group consecutive times
            times = [s["time"] for s in available_slots]
            lines.append(f"    {', '.join(times)}")
        else:
            lines.append("  No available slots")

        lines.append(f"  Summary: {len(available_slots)} available, {len(booked_slots)} booked")

    # Overall summary
    summary = schedule.get("summary", {})
    lines.append("\n" + "=" * 60)
    lines.append(f"Total: {summary.get('total_available_slots', 0)} slots available across {summary.get('total_courts', 0)} courts")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Scrape court availability from twojtenis.pl")
    parser.add_argument("--date", type=str, help="Target date (YYYY-MM-DD), defaults to today")
    parser.add_argument("--output", choices=["json", "text"], default="json",
                       help="Output format (default: json)")
    parser.add_argument("--headless", action="store_true", default=True,
                       help="Run browser in headless mode (default: True)")
    parser.add_argument("--no-headless", dest="headless", action="store_false",
                       help="Run browser with visible window")
    parser.add_argument("--available-only", action="store_true",
                       help="Only show available slots in output")
    args = parser.parse_args()

    # Parse target date
    if args.date:
        try:
            target_date = datetime.strptime(args.date, "%Y-%m-%d")
        except ValueError:
            print(f"Error: Invalid date format '{args.date}'. Use YYYY-MM-DD", file=sys.stderr)
            sys.exit(1)
    else:
        target_date = datetime.now()

    # Get credentials
    user, password = get_credentials()

    # Launch browser and scrape
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=args.headless)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()

        try:
            # Login
            if not login(page, user, password):
                sys.exit(1)

            # Scrape schedule
            schedule = scrape_schedule(page, target_date)

            # Filter to available only if requested
            if args.available_only:
                for court in schedule.get("courts", []):
                    court["slots"] = [s for s in court.get("slots", []) if s.get("available")]

            # Output results
            if args.output == "json":
                print(json.dumps(schedule, indent=2, ensure_ascii=False))
            else:
                print(format_text_output(schedule))

        finally:
            browser.close()


if __name__ == "__main__":
    main()
