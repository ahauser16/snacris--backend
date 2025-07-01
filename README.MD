# snacris server (backend)

## Recent Changes (June 2025)

**Database Connection Pooling & Test Suite Improvements:**

- **RESOLVED: Intermittent SASL connection errors** - Migrated from `pg.Client` to `pg.Pool` for reliable database connections
- **Enhanced test reliability** - All 194 tests now pass consistently across 17 test suites
- **Environment-aware pooling** - Optimized connection settings for test (5), development (10), and production (20 connections)
- **Supabase compatibility** - Connection pooling works seamlessly with hosted database environments
- **Updated documentation** - Removed outdated troubleshooting workarounds and updated all test-related instructions

**TABLE OF CONTENTS**

- [snacris server (backend)](#snacris-server-backend)
  - [Recent Changes (June 2025)](#recent-changes-june-2025)
- [How to run the application](#how-to-run-the-application)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
    - [1. Install Dependencies](#1-install-dependencies)
    - [2. Database Setup](#2-database-setup)
      - [Create Development Database](#create-development-database)
      - [Set Up Database Schema](#set-up-database-schema)
      - [Optional: Set Up Test Database](#optional-set-up-test-database)
    - [3. Environment Variables](#3-environment-variables)
  - [Running the Application](#running-the-application)
    - [Development Mode](#development-mode)
    - [Production Mode](#production-mode)
    - [Verify the Server is Running](#verify-the-server-is-running)
  - [Common Issues \& Solutions](#common-issues--solutions)
    - [Port Already in Use](#port-already-in-use)
    - [Database Connection Issues](#database-connection-issues)
    - [Environment Variables Not Loading](#environment-variables-not-loading)
  - [Production Deployment](#production-deployment)
    - [Supabase/Hosted Database](#supabasehosted-database)
- [Testing](#testing)
- [Overview of SNACRIS](#overview-of-snacris)
  - [Features Implemented](#features-implemented)
  - [Technology Stack](#technology-stack)
  - [Features To Be Added](#features-to-be-added)
    - [**Personal Notes \& Annotations**](#personal-notes--annotations)
    - [**Organization Collaboration**](#organization-collaboration)
    - [**Custom Search Form Builder**](#custom-search-form-builder)
    - [Data Flow - User Perspective](#data-flow---user-perspective)
      - [**Getting Started: User Registration**](#getting-started-user-registration)
      - [**Returning Users: Login Process**](#returning-users-login-process)
      - [**Using SNACRIS: Property Search Experience**](#using-snacris-property-search-experience)
      - [**Behind the Scenes: System Architecture**](#behind-the-scenes-system-architecture)

# How to run the application

## Prerequisites

Before running the SNACRIS backend server, ensure you have:

1. **Node.js** installed (version 22.x as specified in package.json)
2. **PostgreSQL** database server running
3. **Database** created (`snacris` for development, `snacris_test` for testing)
4. **Dependencies** installed

## Environment Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

#### Create Development Database

```bash
# Connect to PostgreSQL and create development database
createdb snacris
```

#### Set Up Database Schema

```bash
# Navigate to the sql directory and run schema setup
psql -d snacris -f sql/snacris.sql
```

#### Optional: Set Up Test Database

```bash
# Create test database for running tests
createdb snacris_test
psql -d snacris_test -f sql/snacris.sql
```

### 3. Environment Variables

Create a `.env` file in the root directory (optional - the application has sensible defaults):

```bash
# .env file (optional)
SECRET_KEY=your-secret-key-here
PORT=3001
DATABASE_URL=postgresql://username:password@localhost/snacris

# For production deployment (e.g., Supabase)
# DATABASE_URL=postgresql://user:password@host:port/database

# Optional: Override bcrypt work factor (default: 12 for production, 1 for tests)
# BCRYPT_WORK_FACTOR=12
```

**Default Configuration (if no .env file is provided):**

- `SECRET_KEY`: "secret-dev"
- `PORT`: 3001
- `DATABASE_URL`: "snacris" (local PostgreSQL database)
- `BCRYPT_WORK_FACTOR`: 12 (production), 1 (tests)

## Running the Application

### Development Mode

```bash
# Start the server in development mode with auto-restart
npm run dev
```

This uses `nodemon` to automatically restart the server when files change.

### Production Mode

```bash
# Start the server in production mode
npm start
```

### Verify the Server is Running

Once started, you should see output similar to:

```bash
Snacris Config:
SECRET_KEY: secret-dev
PORT: 3001
BCRYPT_WORK_FACTOR: 12
Database: snacris
---
Started on http://localhost:3001
```

The server will be available at: `http://localhost:3001`

## Common Issues & Solutions

### Port Already in Use

If port 3001 is already in use:

```bash
# Kill process using port 3001
sudo lsof -ti:3001 | xargs kill -9

# Or use a different port
PORT=3002 npm start
```

### Database Connection Issues

1. **Ensure PostgreSQL is running:**

   ```bash
   # Check if PostgreSQL is running
   sudo systemctl status postgresql

   # Start PostgreSQL if needed
   sudo systemctl start postgresql
   ```

2. **Verify database exists:**

   ```bash
   psql -l | grep snacris
   ```

3. **Check database permissions:**
   ```bash
   # Connect to test database access
   psql -d snacris -c "SELECT 1;"
   ```

### Environment Variables Not Loading

1. Ensure `.env` file is in the root directory (same level as `package.json`)
2. Check that `.env` is not in `.gitignore` if you want to commit it
3. Restart the server after making `.env` changes

## Production Deployment

### Supabase/Hosted Database

For hosted databases (like Supabase), use the full connection string:

```bash
DATABASE_URL=postgresql://user:password@host:port/database?option=value
```

# Testing

For comprehensive testing documentation, including how to run tests, testing architecture, and troubleshooting guides, please see **[TESTING.MD](./TESTING.MD)**.

**Quick reference:**

- Run all tests: `npm test`
- Run specific test: `npx jest <filename>`
- Run with coverage: `npx jest --coverage`

# Overview of SNACRIS

- Unified Data Layer
  15 APIs under the hood:

Real-Property (master, legals, parties, references, remarks)

Personal-Property (master, legals, parties, references, remarks)

Code Mappings (document classes, document types, boroughs, party types, UCC codes, etc.)

Code Mappings tables are pre-seeded from JSON key/value pairs to drive dropdowns and validate inputs when querying the Real- and Personal-Property endpoints.

- Search By Party Name
  Mirrors ACRIS’s “Name” search:

Free-form individual (Last, First, MI, Suffix) or business name entry (all-caps).

Partial match on leading substrings (e.g. “SMI” returns SMITH, SMILEY, etc.).

Date range, Party type (Grantor/Grantee, Borrower/Lender…), and Borough filters.

Dropdowns populated dynamically from Code Mappings (party roles, borough list).

- Search By Parcel Identifier (BBL)
  Borough–Block–Lot (+ unit):

Exact BBL → returns all records for that parcel.

BBL + unit → returns matching unit-level records.

Block only (lot=0000) → returns all lots in block.

Date range & Document class filters via Code Mappings.

- Search By Document Type & Class
  Document Class dropdown (e.g. Deeds, Mortgages, Liens)

Document Type dropdown, filtered by chosen class

Date range (max 30 days) and Borough qualifiers

- Search By Document ID / CRFN
  Enter either the 16-char Document ID or City Register File Number.

Returns the single cover‐page record with full metadata.

- Search By Transaction Number
  Returns all docs sharing the same Transaction Number (grouping of related filings).

- Legacy Searches
  Reel & Page (pre-ACRIS records, by Borough + Year + Reel + Page).

UCC / Federal Lien File Number (pre-2003 lien docs, by Borough + File Number).

## Features Implemented

- “Favorite” & “Save” Workflows
  After any search, users can bookmark:

Entire document (all five sub-tables)

Single Party Name or Party Contact

Parcel Identifier (BBL)

Favorites persist via user-scoped tables (saved_party_names, saved_party_contacts, saved_properties) and reload automatically as dropdown/autocomplete options.

## Technology Stack

Front End: React + TypeScript, dynamic forms & results tables

Back End: Node.js/Express + PostgreSQL, with REST endpoints for each of the 15 APIs

Data Modeling: 10 relational tables for Real & Personal Property, plus 3 “favorites” tables and Code Mappings

Authentication: JWT Authentication with per-user favorites and CRUD

SNACRIS brings ACRIS’s full power to a modern web stack, enriched with code-driven dropdowns, “save for later” workflows, and a unified developer-friendly API layer.

## Features To Be Added

### **Personal Notes & Annotations**

Users will soon be able to add their own personal notes and annotations to any ACRIS property record they've saved or are viewing. This feature transforms SNACRIS from a simple search tool into a comprehensive research platform where professionals can document their insights, observations, and analysis directly alongside the official NYC property data. Notes can be attached to specific document fields, party contacts, or entire property records, creating a rich layer of user-generated context that enhances the value of the underlying ACRIS data. Users will have full control over note visibility - keeping them private for personal use, sharing them publicly with the entire SNACRIS community, or limiting access to specific organization members. The notes system includes robust sharing capabilities, allowing users to collaborate by granting access to specific colleagues or team members, making it perfect for real estate teams, legal firms, or research organizations working together on property analysis projects.

### **Organization Collaboration**

SNACRIS will introduce a comprehensive organization feature that enables teams and companies to work together seamlessly within the platform. Organizations can be created by any user and include features like member management with role-based permissions (officers, admins, and regular members), approval workflows for new member requests, and shared access to notes and saved property data. This feature is particularly valuable for real estate firms, law offices, title companies, and research institutions where multiple team members need to collaborate on property research and share insights. Organization members will be able to view and contribute to shared notes, access the team's collective saved properties and searches, and benefit from the institutional knowledge built up over time. The organization structure supports various use cases, from small teams sharing informal observations to large institutions maintaining comprehensive property research databases with controlled access and audit trails.

### **Custom Search Form Builder**

A powerful custom form builder tool will leverage SNACRIS's existing frontend components and third-party API modules to allow users to create their own specialized search interfaces. Rather than being limited to the standard search forms provided by the application, users will be able to design custom forms that match their specific workflow needs and research patterns. The form builder will provide drag-and-drop functionality using the same React TypeScript components that power the main SNACRIS interface, along with pre-configured connections to all 15 ACRIS API endpoints in the `thirdPartyApi/acris` directory. This means users can create forms that combine multiple search criteria in unique ways, set up automated searches for ongoing monitoring, or build specialized interfaces for specific property types or business processes. The tool will be particularly valuable for power users who have developed their own methodologies for property research and want to streamline their repetitive tasks, as well as organizations that need to standardize their team's approach to property data gathering and analysis.

### Data Flow - User Perspective

SNACRIS provides users with a seamless experience for accessing NYC property records through a secure registration and authentication system. Here's how users interact with the application and what happens behind the scenes:

#### **Getting Started: User Registration**

**What the user experiences:**

1. **Simple Registration Form** - Users fill out a straightforward registration form with their basic information (username, password, first name, last name, email)
2. **Instant Account Creation** - After submitting, users receive immediate confirmation and are automatically logged in
3. **Secure Access** - Users get a secure access token that keeps them logged in across sessions

**What happens behind the scenes:**

- The registration form data is sent to the `/auth/register` endpoint handled by `routes/auth.js`
- Input validation occurs using `schemas/userRegister.json` to ensure all required fields are properly formatted
- The `models/user.js` model securely hashes the user's password using bcrypt (configured in `config.js`)
- User data is safely stored in the PostgreSQL database (connection managed by `db.js`)
- A JWT token is generated and returned, allowing immediate access to the application

#### **Returning Users: Login Process**

**What the user experiences:**

1. **Quick Login** - Users enter their username and password on a clean login form
2. **Automatic Recognition** - The system remembers their preferences and saved searches
3. **Personalized Dashboard** - Users see their saved properties, favorite searches, and recent activity

**What happens behind the scenes:**

- Login credentials are sent to the `/auth/token` endpoint in `routes/auth.js`
- Validation occurs through `schemas/userAuth.json` to check input format
- The `models/user.js` model authenticates credentials by comparing the hashed password
- Upon successful login, a new JWT token is issued for secure session management

#### **Using SNACRIS: Property Search Experience**

**What the user experiences:**

1. **Intuitive Search Options** - Users choose from various search methods (by address, document ID, party name, etc.)
2. **Smart Dropdowns** - Form fields auto-populate with valid options (document types, boroughs, etc.)
3. **Rich Results** - Search results display comprehensive property information in easy-to-read tables
4. **Save for Later** - Users can bookmark interesting properties and searches for future reference

**What happens behind the scenes:**

- Search requests go to specific ACRIS endpoints like `/api/acris/realProperty` or `/api/acris/personalProperty`
- The Express application (`app.js`) routes requests to appropriate handlers in the `routes/api/acris/` directory
- Input validation ensures search parameters are properly formatted using schemas from `schemas/acris/`
- Third-party API calls are made to NYC's ACRIS system using modules in `thirdPartyApi/acris/`
- Results are processed, formatted, and returned to the user's browser
- Users can save searches and properties to their personal database tables for quick access later

#### **Behind the Scenes: System Architecture**

**Application Foundation:**

- **`server.js`** - The starting point that launches the SNACRIS backend server
- **`app.js`** - The main Express application that handles all incoming requests and coordinates responses
- **`config.js`** - Manages environment settings, security keys, and database connections for different deployment environments
- **`db.js`** - Maintains a reliable connection pool to the PostgreSQL database for fast, consistent data access

**Security & Data Protection:**

- All user passwords are encrypted using industry-standard bcrypt hashing
- JWT tokens provide secure, stateless authentication across all requests
- Database connections use SSL encryption in production environments
- Input validation prevents malicious data from entering the system

**Performance & Reliability:**

- Connection pooling ensures fast database access even with multiple concurrent users
- The system automatically handles different environments (development, testing, production)
- Error handling provides clear feedback when something goes wrong
- The modular architecture allows easy maintenance and feature additions

This architecture ensures that users enjoy a fast, secure, and reliable experience while accessing NYC's comprehensive property records through SNACRIS, whether they're real estate professionals, researchers, or curious citizens exploring property history.

[BACK TO TOC](#snacris-server-backend)
