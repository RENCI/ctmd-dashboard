# CTMD Dashboard API Endpoints Documentation

## Base URL
The API runs on port 3030 (configurable via `API_PORT` environment variable).

## Authentication
- Most endpoints require authentication via session-based auth
- Non-protected routes: `/auth_status`, `/auth`, `/logout`
- Development mode bypasses authentication when `AUTH_ENV=development`

---

## Authentication Endpoints

### POST /auth
**Description:** Authenticate user via external auth service (Vanderbilt provider)

**Request Body:**
- `code` (string): Authorization code

**Response:**
- Redirects to auth URL on success
- Sets session with user info

### GET /auth_status
**Description:** Get current authentication status

**Response (200):**
```json
{
  "access_level": "1",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "organization": "Organization Name",
  "username": "johndoe",
  "authenticated": true
}
```

### GET /is_heal_user
**Description:** Check if current user is a HEAL user (only if HEAL server is enabled)

**Response:** HEAL user data or 401

### POST /logout
**Description:** Destroy user session and log out

**Response:** Clears session cookie

---

## Proposals

### GET /proposals
**Description:** Get all proposals with related data (requested services, approved services, profiles)

**Response (200):**
```json
[
  {
    "proposalID": 123,
    "shortTitle": "Study Title",
    "longTitle": "Full Study Title",
    "shortDescription": "Description",
    "covidStudy": "YES",
    "dateSubmitted": "2023-01-15",
    "piName": "John Doe",
    "proposalStatus": "Approved",
    "assignToInstitution": "TIC Name",
    "submitterInstitution": "Institution Name",
    "therapeuticArea": "Oncology",
    "fundingStatus": "Funded",
    "fundingAmount": 500000,
    "requestedServices": ["Service 1", "Service 2"],
    "approvedServices": ["Service 1"],
    "profile": { ... }
  }
]
```

### GET /proposals/:id
**Description:** Get a single proposal by ID

**Parameters:**
- `id` (integer, path): Proposal ID

**Response (200):** Single proposal object with detailed information

### GET /proposals/by-status
**Description:** Get proposals grouped by status

**Response (200):**
```json
[
  {
    "name": "Approved for Initial Consultation",
    "proposals": [ ... ]
  }
]
```

### GET /proposals/by-submitted-service
**Description:** Get proposals grouped by submitted/requested service

**Response (200):** Array of services with associated proposals

### GET /proposals/by-tic
**Description:** Get proposals grouped by TIC (Translational Innovation Center)

**Response (200):** Array of TICs with associated proposals

### GET /proposals/by-organization
**Description:** Get proposals grouped by submitter institution/organization

**Response (200):** Array of organizations with associated proposals

### GET /proposals/by-therapeutic-area
**Description:** Get proposals grouped by therapeutic area

**Response (200):** Array of therapeutic areas with associated proposals

### GET /proposals/by-date
**Description:** Get proposal counts by submission date

**Response (200):**
```json
[
  {
    "day": "2023-01-15",
    "value": 5
  }
]
```

### GET /proposals/approved-services
**Description:** Get approved services for proposals

**Response (200):** Array of proposals with their approved services

### GET /proposals/submitted-services
**Description:** Get submitted/requested services for proposals

**Response (200):** Array of proposals with their requested services

### GET /proposals/network
**Description:** Get all proposals for network visualization

**Response (200):** Array of all proposals

---

## Statuses

### GET /statuses
**Description:** List all proposal statuses

**Response (200):** Array of status descriptions

---

## Resources

### GET /resources
**Description:** List all available resources/services

**Response (200):** Array of resource description strings

### GET /resources/requested
**Description:** Get list of requestable resources with index and ID

**Response (200):**
```json
[
  {
    "index": 1,
    "id": 123,
    "description": "Service Name"
  }
]
```

### GET /resources/approved
**Description:** Get list of approved resources with index and ID

**Response (200):**
```json
[
  {
    "index": 1,
    "id": 123,
    "description": "Service Name"
  }
]
```

---

## PIs (Principal Investigators)

### GET /pis
**Description:** List all principal investigators

**Response (200):** Array of PI data

---

## TICs (Translational Innovation Centers)

### GET /tics
**Description:** List all TICs

**Response (200):** Array of TIC data

---

## Organizations

### GET /organizations
**Description:** List all organizations/institutions

**Response (200):** Array of organization data

---

## Therapeutic Areas

### GET /therapeutic-areas
**Description:** List all therapeutic areas

**Response (200):** Array of therapeutic area data

---

## Studies

### GET /studies/:id
**Description:** Get study profile by proposal ID

**Parameters:**
- `id` (integer, path): Proposal ID

**Response (200):**
```json
{
  "fieldName": {
    "value": "field value",
    "displayName": "Field Display Name"
  }
}
```

### GET /studies/:id/sites
**Description:** Get all sites for a specific study

**Parameters:**
- `id` (integer, path): Proposal ID

**Response (200):**
```json
[
  {
    "siteId": 1,
    "siteName": "Site Name",
    "siteNumber": "001",
    "ctsaId": 1,
    "ctsaName": "CTSA Name",
    "principalInvestigator": "PI Name",
    "dateRegPacketSent": "2023-01-15",
    "dateIrbApproval": "2023-02-01",
    "patientsEnrolledCount": 25
  }
]
```

### GET /studies/studysites
**Description:** Get all study sites across all studies

**Response (200):** Array of all study sites with enrollment data

### GET /studies/:id/enrollment-data
**Description:** Get enrollment data for a specific study

**Parameters:**
- `id` (integer, path): Proposal ID

**Response (200):**
```json
[
  {
    "ProposalID": 123,
    "date": "2023-01-15",
    "revisedProjectedSites": 10,
    "actualSites": 8,
    "actualEnrollment": 150,
    "targetEnrollment": 200
  }
]
```

---

## Sites

### GET /sites
**Description:** List all sites

**Response (200):** Array of site data

---

## CTSAs

### GET /ctsas
**Description:** List all CTSAs (Clinical and Translational Science Awards)

**Response (200):** Array of CTSA data

---

## Template Download

### GET /template/:tableName
**Description:** Download CSV template for a specific table

**Parameters:**
- `tableName` (string, path): Name of the database table

**Response (200):** CSV file download

---

## Graphics

### GET /graphics/proposals-by-tic
**Description:** Generate SVG graphic showing proposals grouped by TIC and status

**Response (200):**
- Content-Type: `image/svg+xml`
- Returns SVG visualization of stacked bar chart

---

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
```json
"Please login"
```

### 500 Internal Server Error
```json
"There was an error fetching data."
```

---

## Environment Variables

- `API_PORT`: Server port (default: 3030)
- `AUTH_URL`: External authentication service URL
- `FUSE_AUTH_API_KEY`: API key for auth service
- `AUTH_ENV`: Set to 'development' to bypass authentication
- `IS_HEAL_SERVER`: Enable HEAL user checks (default: false)
- `HEAL_USERS_FILE_PATH`: Path to HEAL users file
- `REACT_APP_API_ROOT`: API root URL for redirects
- `API_SESSION_SECRET`: Secret for session management

---

## Notes

- All date fields are returned as strings in VARCHAR format
- The API uses PostgreSQL database via pg-promise
- Session expires after 12 hours
- CORS is enabled for all origins (`origin: '*'`)
