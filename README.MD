# snacris server (backend)

**TABLE OF CONTENTS**

- [snacris server (backend)](#snacris-server-backend)
- [CAPSTONE REQUIREMENTS](#capstone-requirements)
  - [The title of your site and a link to the URL where it is deployed](#the-title-of-your-site-and-a-link-to-the-url-where-it-is-deployed)
  - [WALKTHROUGH](#walkthrough)
    - [User registers \& logs in](#user-registers--logs-in)
    - [User searches for a property's borough, block and lot using street address parameters.](#user-searches-for-a-propertys-borough-block-and-lot-using-street-address-parameters)
    - [Once BBL is obtained, user can view that data and click the "Search By BBL" button which will take them to the "Search By Parcel" page.](#once-bbl-is-obtained-user-can-view-that-data-and-click-the-search-by-bbl-button-which-will-take-them-to-the-search-by-parcel-page)
    - [User can search for deed information by choosing "DEEDS \& OTHER CONVEYANCES" from the DOCUMENT CLASS dropdown menu and then choose "DEED" from the DOCUMENT TYPE dropdown menu and then click submit.](#user-can-search-for-deed-information-by-choosing-deeds--other-conveyances-from-the-document-class-dropdown-menu-and-then-choose-deed-from-the-document-type-dropdown-menu-and-then-click-submit)
    - [The user can then browse the documents by selecting the DOCUMENT ID from a selection menu. While viewing a document the user can SAVE a document's data or view DOCUMENT DETAIL or VIEW DOCUMENT in ACRIS.](#the-user-can-then-browse-the-documents-by-selecting-the-document-id-from-a-selection-menu-while-viewing-a-document-the-user-can-save-a-documents-data-or-view-document-detail-or-view-document-in-acris)
  - [Website Description \& Features](#website-description--features)
  - [List the features you implemented and explain why you chose those features to implement](#list-the-features-you-implemented-and-explain-why-you-chose-those-features-to-implement)
    - [User authentication](#user-authentication)
    - [Real Property Record save feature to database](#real-property-record-save-feature-to-database)
  - [`jest` tests](#jest-tests)
  - [WALKTHROUGH](#walkthrough-1)
    - [User registers \& logs in](#user-registers--logs-in-1)
    - [User searches for a property’s borough, block and lot using street address parameters.](#user-searches-for-a-propertys-borough-block-and-lot-using-street-address-parameters-1)
    - [Once BBL is obtained, user can view that data and click the “Search By BBL” button which will take them to the “Search By Parcel” page.](#once-bbl-is-obtained-user-can-view-that-data-and-click-the-search-by-bbl-button-which-will-take-them-to-the-search-by-parcel-page-1)
    - [User can search for deed information by choosing “DEEDS \& OTHER CONVEYANCES” from the DOCUMENT CLASS dropdown menu and then choose “DEED” from the DOCUMENT TYPE dropdown menu and then click submit.](#user-can-search-for-deed-information-by-choosing-deeds--other-conveyances-from-the-document-class-dropdown-menu-and-then-choose-deed-from-the-document-type-dropdown-menu-and-then-click-submit-1)
    - [The user can then browse the documents by selecting the DOCUMENT ID from a selection menu. While viewing a document the user can SAVE a document’s data or view DOCUMENT DETAIL or VIEW DOCUMENT in ACRIS.](#the-user-can-then-browse-the-documents-by-selecting-the-document-id-from-a-selection-menu-while-viewing-a-document-the-user-can-save-a-documents-data-or-view-document-detail-or-view-document-in-acris-1)
  - [Keep the API in there, and if you have anything to say about the API then add some notes. If you have created your own API, please document the process.](#keep-the-api-in-there-and-if-you-have-anything-to-say-about-the-api-then-add-some-notes-if-you-have-created-your-own-api-please-document-the-process)
  - [Identify the technology stack used to create your website](#identify-the-technology-stack-used-to-create-your-website)
    - [Backend Technologies](#backend-technologies)
    - [Development \& Testing Tools](#development--testing-tools)
    - [DevOps \& Deployment](#devops--deployment)
    - [Security Features](#security-features)
    - [Architecture Patterns](#architecture-patterns)
  - [How to run the application](#how-to-run-the-application)
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

# CAPSTONE REQUIREMENTS

## The title of your site and a link to the URL where it is deployed

https://snacris.nyc/


## WALKTHROUGH

SNACRIS provides a streamlined experience for accessing NYC property records. Here's a detailed user flow from the frontend perspective:

### User registers & logs in

1. **Registration Process**:

   - Navigate to the SNACRIS homepage at https://snacris.nyc
   - Click the "Register" button in the top navigation
   - Complete the registration form with:
     - Username (unique identifier)
     - Password (with confirmation)
     - First and last name
     - Email address
   - Click "Create Account"
   - The system creates your account and automatically logs you in

2. **Login Process (for returning users)**:
   - Navigate to the SNACRIS homepage
   - Click the "Login" button
   - Enter your username and password
   - Click "Sign In"
   - The system authenticates you and redirects to your personalized dashboard

### User searches for a property's borough, block and lot using street address parameters.

> KEEP IN MIND ACRIS DATA DOES NOT ALWAYS MATCH GOOGLE MAPS DATA SO I SUGGEST USING THE ADDRESSES BELOW UNLESS YOU WANT TO TRY USING ADDRESSES FROM GOOGLE.

1. **Accessing the Address Search**:

   - From the dashboard, click the "Search by Address" option in the main navigation
   - The address search form appears with fields for street number, street name, and borough

2. **Entering Address Information**:

   - Enter one of these verified test addresses:
     - 624 EAST 16 STREET, Brooklyn
     - 1424 Avenue J, Brooklyn
     - 19 Old Fulton St, Brooklyn
   - Select "Brooklyn" from the borough dropdown menu
   - Click the "Search" button

3. **Viewing Search Results**:

   - The system queries the NYC ACRIS database and returns matching properties
   - Results display in a clean table format showing:
     - Borough-Block-Lot (BBL) identifier
     - Property type
     - Street address details
     - Unit information (if applicable)
     - Air/subterranean rights indicators

4. **Result Interpretation**:
   - The BBL identifier is displayed prominently (e.g., Borough: 3, Block: 6718, Lot: 48)
   - Property characteristics are shown with clear labels
   - If multiple matches exist, they are listed in order of relevance

### Once BBL is obtained, user can view that data and click the "Search By BBL" button which will take them to the "Search By Parcel" page.

1. **BBL Search Transition**:

   - From the address search results, identify the desired property's BBL
   - Click the "Search By BBL" button adjacent to the property listing
   - The system transitions to the Parcel Search page with the BBL pre-populated

2. **Parcel Search Form**:

   - The form displays with the Borough, Block, and Lot fields already filled
   - Additional options appear:
     - Optional Unit field for condominium searches
     - Document Class dropdown menu
     - Date Range selectors
     - Record Type filters

3. **Refining the Parcel Search**:
   - Leave the BBL information as is
   - Select optional filters if desired:
     - Choose a document class (e.g., "All Classes" for comprehensive results)
     - Set a date range if looking for specific time periods
   - Click "Search" to execute the parcel search

### User can search for deed information by choosing "DEEDS & OTHER CONVEYANCES" from the DOCUMENT CLASS dropdown menu and then choose "DEED" from the DOCUMENT TYPE dropdown menu and then click submit.

1. **Specifying Document Types**:

   - In the Document Class dropdown, select "DEEDS & OTHER CONVEYANCES"
   - Notice that the Document Type dropdown updates with relevant options
   - Select "DEED" from the Document Type dropdown
   - Verify the Borough is still correct (e.g., "Brooklyn")
   - Ensure the BBL information is accurate
   - Click "Submit" to execute the search

2. **Search Processing**:

   - The system displays a loading indicator
   - Behind the scenes, it queries multiple ACRIS datasets:
     - Master records for deed transactions
     - Legal property descriptions
     - Party information (buyers/sellers)
     - Document references
     - Remarks and notes

3. **Results Overview**:
   - Search results appear as a list of document IDs with summary information:
     - Document ID (16-character identifier)
     - Document Type (DEED)
     - Recorded Date
     - Parties involved (typically Grantor/Grantee)
     - Amount (if applicable)
   - Results are sorted by recorded date (newest first)

### The user can then browse the documents by selecting the DOCUMENT ID from a selection menu. While viewing a document the user can SAVE a document's data or view DOCUMENT DETAIL or VIEW DOCUMENT in ACRIS.

1. **Document Selection**:

   - From the search results list, click on a Document ID to view details
   - The system loads a comprehensive document view with five key sections:
     - Master Record (transaction details)
     - Parties (individuals/organizations involved)
     - Property Details (legal description)
     - References (related documents)
     - Remarks (additional notes)

2. **Document Interaction Options**:

   - Three primary action buttons appear with each document:
     - **SAVE** - Saves the complete document to your personal SNACRIS account
     - **DOCUMENT DETAIL** - Expands to show all available metadata and fields
     - **VIEW IN ACRIS** - Opens the official NYC ACRIS website view in a new tab

3. **Saving a Document**:

   - Click the "SAVE" button to add the document to your collection
   - A confirmation appears: "Document successfully saved to your account"
   - The saved document is now accessible from your user dashboard under "Saved Documents"

4. **Viewing Document Details**:

   - Click "DOCUMENT DETAIL" to expand all sections
   - Master Record shows the transaction date, amount, type, and identifiers
   - Parties section lists all entities involved with their roles and contact information
   - Property Details shows the legal description including borough, block, lot, and unit
   - References section displays links to related documents
   - Remarks section shows any additional notes or comments

5. **Exploring in ACRIS**:

   - Click "VIEW IN ACRIS" to open the NYC government ACRIS page
   - Compare the SNACRIS simplified view with the original government interface
   - Use ACRIS for downloading official PDF copies of documents if needed

6. **Additional Features**:
   - Use the breadcrumb navigation to return to search results
   - Click on party names to search for other documents with the same party
   - Use the "Back to Search" button to initiate a new search
   - Access your saved documents anytime from the user dashboard

## Website Description & Features

SNACRIS (Simplified NYC ACRIS) is a modern, user-friendly interface to New York City's Automated City Register Information System (ACRIS) property records database. It provides multiple powerful ways to search, explore, and save NYC property records:

1. **Search by Address** - Find property information by entering a street address. Simply enter the street number and name, and SNACRIS will locate the property and provide its Borough-Block-Lot (BBL) identifier, unit information, and property characteristics.

2. **Search by Document ID/CRFN** - Look up specific property documents using either a Document ID or City Register File Number (CRFN). This retrieves the complete record with all related information, including parties, property details, and document references.

3. **Search by Document Type** - Find property records by document classification (deeds, mortgages, liens, etc.) and specific document types. Filter results by date range and borough to narrow your search to exactly what you need.

4. **Search by Parcel (BBL)** - Retrieve all records associated with a specific property using its Borough-Block-Lot identifier. This search can include unit-specific information and allows filtering by document class and date range.

5. **Search by Party Name** - Find property records by searching for individuals or organizations involved in property transactions. Search results can be filtered by party type (buyer/seller, borrower/lender), date range, and borough.

6. **Search by Reel & Page** - Access legacy pre-ACRIS records using traditional reel and page references. This search requires the borough, reel year, reel number, and page number.

7. **Search by UCC/Federal Lien Number** - Find Uniform Commercial Code (UCC) filings and federal liens using file numbers. This search focuses on personal property records rather than real property.

Each search returns comprehensive property information that can be saved to your account for future reference. SNACRIS streamlines what was once a complex process, making NYC property research accessible to everyone from real estate professionals to curious homeowners.

## List the features you implemented and explain why you chose those features to implement

### User authentication

### Real Property Record save feature to database

SNACRIS offers a powerful document management system that allows users to save and organize property records for future reference. This feature transforms SNACRIS from a simple search tool into a comprehensive research platform:

**For Regular Users:**

- **Save Important Documents** - When you find a valuable property record during your search, you can save the entire document (with all its details) to your personal account with a single click.
- **Build Your Document Library** - View all your saved property documents in one place, creating your own personalized collection of NYC property records.
- **Quick Access to Specific Documents** - Retrieve any saved document instantly by its Document ID without having to search again.
- **Document Management** - Remove documents from your collection when you no longer need them.

**For Advanced Research:**

- **Compare Historical Records** - Save multiple documents related to a property to track its history and changes in ownership over time.
- **Create Project Collections** - Save sets of related documents for specific research projects or property investigations.
- **Export Capability** - Access your saved data for use in reports, presentations, or other applications.

**For Administrators:**

- **User Support** - Administrators can assist users by accessing, managing, and troubleshooting their saved document collections.
- **Data Management** - System administrators have tools to maintain data integrity across all user accounts.

This feature addresses a key pain point in property research: the need to repeatedly search for the same documents across multiple sessions. With SNACRIS's save feature, users can build a personalized library of property records that persist across sessions, streamlining their workflow and making complex property research more efficient.

## `jest` tests

see [Backend/TESTING.MD](Backend/TESTING.MD) for more details.

## WALKTHROUGH

### User registers & logs in

### User searches for a property’s borough, block and lot using street address parameters.

KEEP IN MIND ACRIS DATA DOES NOT ALWAYS MATCH GOOGLE MAPS DATA SO I SUGGEST USING THE ADDRESSES BELOW UNLESS YOU WANT TO USE TRY USING ADDRESSES FROM GOOGLE.

624 EAST 16 STREET, Brooklyn
1424 Avenue J, Brooklyn
19 Old Fulton St, Brooklyn

### Once BBL is obtained, user can view that data and click the “Search By BBL” button which will take them to the “Search By Parcel” page.

### User can search for deed information by choosing “DEEDS & OTHER CONVEYANCES” from the DOCUMENT CLASS dropdown menu and then choose “DEED” from the DOCUMENT TYPE dropdown menu and then click submit.

### The user can then browse the documents by selecting the DOCUMENT ID from a selection menu. While viewing a document the user can SAVE a document’s data or view DOCUMENT DETAIL or VIEW DOCUMENT in ACRIS.

## Keep the API in there, and if you have anything to say about the API then add some notes. If you have created your own API, please document the process.

## Identify the technology stack used to create your website

SNACRIS is built using a modern, robust technology stack that ensures reliability, performance, and maintainability:

### Backend Technologies

- **Node.js (v22+)** - JavaScript runtime for building the server-side application
- **Express.js** - Web framework for creating RESTful API endpoints and handling HTTP requests
- **PostgreSQL** - Relational database for storing user data, saved documents, and application settings
- **pg & pg.Pool** - PostgreSQL client with connection pooling for efficient database interactions
- **JSON Schema** - For request validation and data integrity enforcement
- **JWT (JSON Web Tokens)** - Secure authentication mechanism for user sessions
- **bcrypt** - Industry-standard password hashing for user security
- **axios** - HTTP client for making requests to external APIs (NYC ACRIS)

### Development & Testing Tools

- **Jest** - Testing framework for unit and integration testing
- **Supertest** - HTTP assertions for API endpoint testing
- **nodemon** - Development server with auto-restart capability
- **dotenv** - Environment variable management for different deployment contexts
- **morgan** - HTTP request logger middleware for debugging and monitoring

### DevOps & Deployment

- **Render** - Cloud hosting platform for backend deployment
- **Supabase** - Hosted PostgreSQL database service for production
- **Continuous Integration** - Automated testing workflow via GitHub Actions
- **Git/GitHub** - Version control and code collaboration

### Security Features

- **CORS Protection** - Configured to allow only specific origins
- **Input Validation** - Schema-based validation for all incoming requests
- **Authentication Middleware** - Route protection with role-based access control
- **Error Handling** - Comprehensive error management with appropriate HTTP status codes
- **Environment Isolation** - Separate configurations for development, testing, and production

### Architecture Patterns

- **Model-View-Controller (MVC)** - Separation of concerns for maintainable codebase
- **RESTful API Design** - Consistent and predictable API endpoints
- **Middleware Chaining** - For request processing, authentication, and logging
- **Repository Pattern** - Abstracts database operations from business logic
- **Connection Pooling** - Optimized database connections for scalability

This technology stack was chosen to provide a balance of developer productivity, application performance, and code maintainability while ensuring a secure and reliable experience for end users.

---

---

---

## How to run the application

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
