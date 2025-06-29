# ACRIS Real Property Database Routes

## Overview

The Real Property Database Routes (`realPropertyDbRoutes.js`) provide comprehensive CRUD operations for managing saved real property documents in the SNACRIS application. These routes allow authenticated users to save, retrieve, update, and delete their ACRIS real property documents, with additional administrative capabilities for admins.

## Architecture

### Route Prefix

All routes are mounted at `/realPropertyDbRoutes` in the main application.

### Authentication

- **User routes**: Require authentication (`ensureLoggedIn` middleware)
- **Admin routes**: Require admin privileges (`ensureAdmin` middleware)
- **Data isolation**: Users can only access their own documents unless using admin routes

### Model Integration

Routes utilize the `realProperty` model functions:

- `getSavedRealPropertyDocument()` - Retrieve documents
- `saveRealPropertyDocument()` - Create/update documents
- `deleteRealPropertyDocument()` - Delete documents

## User Routes

### GET `/documents`

**Purpose**: Fetch all saved real property documents for the authenticated user

**Authentication**: Required (regular user)

**Response Structure**:

```json
{
  "documents": [
    {
      "master": {
        "id": 123,
        "document_id": "2023111111111001",
        "record_type": "M",
        "crfn": "2023000111001",
        "doc_type": "DEED",
        "document_date": "2023-01-15T05:00:00.000Z",
        "document_amt": "500000.00",
        "recorded_datetime": "2023-01-16T15:30:00.000Z",
        "username": "testuser",
        "saved_at": "2023-01-20T10:00:00.000Z"
      },
      "legals": [...],
      "parties": [...],
      "references": [...],
      "remarks": [...]
    }
  ]
}
```

**Usage Example**:

```javascript
const response = await fetch("/realPropertyDbRoutes/documents", {
  headers: { Authorization: `Bearer ${userToken}` },
});
const { documents } = await response.json();
```

### GET `/document/:documentId`

**Purpose**: Fetch a specific saved real property document by document_id

**Authentication**: Required (regular user)

**Parameters**:

- `documentId` - The ACRIS document_id (e.g., "2023111111111001")

**Response Structure**:

```json
{
  "document": {
    "master": {
      /* master record */
    },
    "legals": [
      /* legal descriptions */
    ],
    "parties": [
      /* involved parties */
    ],
    "references": [
      /* document references */
    ],
    "remarks": [
      /* document remarks */
    ]
  }
}
```

**Error Responses**:

- `404` - Document not found or doesn't belong to user
- `401` - Authentication required

### POST `/document`

**Purpose**: Save (create or update) a complete real property document

**Authentication**: Required (regular user)

**Request Body Structure**:

```json
{
  "master": {
    "document_id": "2023111111111001",
    "record_type": "M",
    "crfn": "2023000111001",
    "recorded_borough": "1",
    "doc_type": "DEED",
    "document_date": "2023-01-15",
    "document_amt": 500000,
    "recorded_datetime": "2023-01-16T10:30:00",
    "good_through_date": "2023-12-31"
  },
  "legals": [
    {
      "record_type": "L",
      "borough": "1",
      "block": 123,
      "lot": 45,
      "property_type": "10",
      "street_number": "123",
      "street_name": "MAIN ST"
    }
  ],
  "parties": [
    {
      "party_index": 1,
      "record_type": "P",
      "party_type": "1",
      "name": "SMITH, JOHN",
      "address_1": "123 SELLER STREET"
    }
  ],
  "references": [...],
  "remarks": [...]
}
```

**Response Structure**:

```json
{
  "savedMasterId": 123
}
```

**Behavior**:

- **Create**: If document_id doesn't exist for user, creates new document
- **Update**: If document_id exists for user, updates existing document
- **Upsert Logic**: Uses the model's built-in upsert functionality

### DELETE `/document/:documentId`

**Purpose**: Delete a saved real property document

**Authentication**: Required (regular user)

**Parameters**:

- `documentId` - The ACRIS document_id to delete

**Response Structure**:

```json
{
  "deletedMasterId": 123
}
```

**Error Responses**:

- `404` - Document not found or doesn't belong to user

## Admin Routes

Admin routes allow administrators to manage any user's real property documents.

### GET `/admin/documents/:username`

**Purpose**: Fetch all saved real property documents for any user

**Authentication**: Required (admin only)

**Parameters**:

- `username` - Target user's username

**Response**: Same structure as user `/documents` route

### GET `/admin/document/:username/:documentId`

**Purpose**: Fetch specific document for any user

**Authentication**: Required (admin only)

**Parameters**:

- `username` - Target user's username
- `documentId` - The ACRIS document_id

**Response**: Same structure as user `/document/:documentId` route

### POST `/admin/document/:username`

**Purpose**: Save document for any user

**Authentication**: Required (admin only)

**Parameters**:

- `username` - Target user's username

**Request/Response**: Same structure as user POST `/document` route

### DELETE `/admin/document/:username/:documentId`

**Purpose**: Delete document for any user

**Authentication**: Required (admin only)

**Parameters**:

- `username` - Target user's username
- `documentId` - The ACRIS document_id to delete

**Response**: Same structure as user DELETE route

## Data Structure

### Master Record Fields

- `document_id` - Unique ACRIS document identifier
- `record_type` - Record type code (typically "M" for master)
- `crfn` - Control Record File Number
- `recorded_borough` - Borough where recorded (1-5)
- `doc_type` - Document type code (references `document_control_codes`)
- `document_date` - Date the document was signed
- `document_amt` - Dollar amount of the transaction
- `recorded_datetime` - When the document was recorded
- `good_through_date` - Data validity period

### Legal Description Fields

- `borough` - NYC borough (1=Manhattan, 2=Bronx, 3=Brooklyn, 4=Queens, 5=Staten Island)
- `block` - Tax block number
- `lot` - Tax lot number
- `property_type` - Property classification code
- `street_number` - Building number
- `street_name` - Street name

### Party Fields

- `party_index` - Sequential party number
- `party_type` - Role code (1=Grantor, 2=Grantee, etc.)
- `name` - Party name (last, first format)
- `address_1` - Primary address
- `city`, `state`, `zip` - Location details

## Error Handling

### Common Error Responses

**401 Unauthorized**:

```json
{
  "error": "Unauthorized"
}
```

**404 Not Found**:

```json
{
  "error": "Document not found"
}
```

**500 Internal Server Error**:

```json
{
  "error": "Internal Server Error",
  "message": "Detailed error message"
}
```

### Error Scenarios

- **Missing authentication**: 401 response
- **Invalid token**: 401 response
- **Non-admin accessing admin routes**: 401 response
- **Document not found**: 404 response
- **Document belongs to different user**: 404 response (security)
- **Database errors**: 500 response
- **Invalid data format**: 400/500 response (depends on validation layer)

## Security Features

### Authentication & Authorization

- JWT token-based authentication
- Role-based access control (user vs admin)
- User data isolation - users cannot access other users' documents

### Data Protection

- User documents are isolated by username
- Admin routes clearly separated with explicit admin-only access
- Document ownership validated on all operations

### Audit Trail

- `saved_at` timestamps on all saved documents
- `modified_date` tracking for updates
- User attribution on all saved records

## Testing

### Test Coverage

The routes are comprehensively tested in `realPropertyDbRoutes.test.js`:

**User Route Tests**:

- ✅ Fetch empty document list
- ✅ Fetch documents after saving
- ✅ Fetch specific document by ID
- ✅ Save new documents
- ✅ Update existing documents
- ✅ Delete documents
- ✅ Authentication validation
- ✅ User isolation security

**Admin Route Tests**:

- ✅ Admin can fetch any user's documents
- ✅ Admin can save documents for any user
- ✅ Admin can delete any user's documents
- ✅ Non-admin users cannot access admin routes

**Integration Tests**:

- ✅ Complete CRUD workflow
- ✅ Admin management capabilities
- ✅ Security isolation between users

**Test Statistics**:

- **24 test cases** covering all routes and edge cases
- **100% route coverage** including success and error paths
- **Authentication testing** for all protected routes
- **Security testing** for user isolation
- **Data integrity validation** for CRUD operations

### Running Tests

```bash
# Run all real property route tests
npm test routes/db/acris/real-property/realPropertyDbRoutes.test.js

# Run specific test pattern
npm test -- --testNamePattern="admin can fetch"
```

## Usage Patterns

### Frontend Integration Example

```javascript
class RealPropertyService {
  constructor(authToken) {
    this.authToken = authToken;
    this.baseUrl = "/realPropertyDbRoutes";
  }

  async getUserDocuments() {
    const response = await fetch(`${this.baseUrl}/documents`, {
      headers: { Authorization: `Bearer ${this.authToken}` },
    });
    return response.json();
  }

  async saveDocument(documentData) {
    const response = await fetch(`${this.baseUrl}/document`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.authToken}`,
      },
      body: JSON.stringify(documentData),
    });
    return response.json();
  }

  async deleteDocument(documentId) {
    const response = await fetch(`${this.baseUrl}/document/${documentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${this.authToken}` },
    });
    return response.json();
  }
}
```

### Typical Workflow

1. **User searches** ACRIS API for real property records
2. **User reviews** results and selects documents to save
3. **User saves** selected documents via POST `/document`
4. **User manages** saved documents via GET `/documents`
5. **User can update** documents by re-posting with same document_id
6. **User can delete** unwanted documents via DELETE `/document/:id`

## Performance Considerations

### Database Optimization

- Indexed on `username` and `document_id` for fast lookups
- Efficient upsert operations minimize database calls
- Cascading operations handle related record updates

### Response Times

- Typical response times: 10-50ms for simple operations
- Complex documents with many related records: 50-100ms
- Admin operations may be slower due to broader data access

### Caching Opportunities

- User document lists could be cached (invalidate on save/delete)
- Recently accessed documents could be cached
- Admin queries might benefit from caching

## Future Enhancements

### Planned Features

- **Document versioning**: Track changes to saved documents over time
- **Bulk operations**: Save/delete multiple documents in one request
- **Document sharing**: Allow users to share documents with other users
- **Export functionality**: Export saved documents to various formats
- **Search within saved**: Filter and search user's saved documents

### API Improvements

- **Pagination**: For users with many saved documents
- **Filtering**: Query parameters for document types, date ranges
- **Sorting**: Configurable sort orders for document lists
- **Partial updates**: PATCH endpoints for updating specific fields

### Integration Enhancements

- **Webhook notifications**: Notify external systems of document changes
- **Batch processing**: Background processing for large document sets
- **Analytics**: Track usage patterns and popular document types

## Change Log

### 2025-06-29

- ✅ **Route Implementation**: Complete CRUD routes for real property documents
- ✅ **Authentication**: JWT-based auth with user/admin role separation
- ✅ **Model Integration**: Full integration with `realProperty` model
- ✅ **Test Suite**: Comprehensive test coverage (24 test cases)
- ✅ **Security**: User data isolation and admin privilege checking
- ✅ **Documentation**: Complete API documentation with examples
- ✅ **Error Handling**: Consistent error responses and status codes

---

_This documentation covers the complete functionality of the Real Property Database Routes as of the latest implementation._
