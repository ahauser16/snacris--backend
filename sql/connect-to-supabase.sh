#!/bin/bash
# Supabase Database Reset Helper Script

echo "=== Supabase Database Reset Helper ==="
echo ""
echo "This script will help you reset your Supabase database with your SQL files."
echo ""

# Check if connection string is provided
if [ -z "$1" ]; then
    echo "Usage: $0 \"your-connection-string\""
    echo ""
    echo "To get your connection string:"
    echo "1. Go to your Supabase project dashboard"
    echo "2. Navigate to Settings → Database"
    echo "3. Copy the connection string (it looks like):"
    echo "   postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
    echo ""
    echo "Example usage:"
    echo "  $0 \"postgresql://postgres:yourpassword@db.abcdefghijklmnop.supabase.co:5432/postgres\""
    echo ""
    exit 1
fi

CONNECTION_STRING="$1"

echo "Testing connection to Supabase..."
if psql "$CONNECTION_STRING" -c "SELECT version();" > /dev/null 2>&1; then
    echo "✅ Connection successful!"
    echo ""
    echo "Running database reset script..."
    echo "This will:"
    echo "  - Drop all existing tables"
    echo "  - Create new schema from your files"
    echo "  - Insert seed data"
    echo ""
    read -p "Continue? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd "$(dirname "$0")"
        psql "$CONNECTION_STRING" -f supabase-reset.sql
        echo ""
        echo "✅ Database reset complete!"
    else
        echo "❌ Operation cancelled."
    fi
else
    echo "❌ Connection failed. Please check your connection string."
    echo ""
    echo "Make sure:"
    echo "  - Your password is correct"
    echo "  - Your project reference is correct"
    echo "  - Your network allows connections to Supabase"
fi
