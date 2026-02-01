#!/bin/bash

# Vahan Data Extraction Script
# Run: ./scripts/run-and-email.sh
# Schedule with cron: crontab -e
# Example: 0 9 * * 1 /path/to/vahan/scripts/run-and-email.sh

set -e

cd "$(dirname "$0")/.."

echo "=== Vahan Data Extraction ==="
echo "Started at: $(date)"

# Clean previous downloads
rm -rf downloads/*.xlsx

# Run Playwright tests
npm test

# Check if files were downloaded
if ls downloads/*.xlsx 1> /dev/null 2>&1; then
    echo "Files downloaded successfully:"
    ls -la downloads/

    # Optional: Send email using mailx or similar
    # zip -r vahan-reports.zip downloads/*.xlsx
    # echo "Vahan reports attached" | mail -s "Vahan Data $(date +%Y-%m-%d)" -a vahan-reports.zip your@email.com
else
    echo "No files downloaded!"
    exit 1
fi

echo "Completed at: $(date)"
