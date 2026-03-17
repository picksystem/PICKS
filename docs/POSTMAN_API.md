# PICKS Platform - Postman API Testing Guide

## Base URL

```
http://localhost:3001
```

## Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

### How to Get a Token

**POST** `/api/auth`

```json
{
  "action": "signin",
  "email": "admin@picks.com",
  "password": "admin123"
}
```

**Response (201):**

```json
{
  "message": "Sign in successful",
  "data": {
    "user": {
      "userId": 1,
      "userName": "Admin User",
      "userEmail": "admin@picks.com",
      "role": "admin",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Seeded Test Users

| Email | Password | Role |
|-------|----------|------|
| `admin@picks.com` | `admin123` | admin |
| `user@picks.com` | `user123` | user |
| `consultant@picks.com` | `consultant123` | consultant |

---

## Health Check

**GET** `/health`

No auth required.

**Response (200):**

```json
{
  "status": "OK",
  "timestamp": "2025-02-12T10:00:00.000Z"
}
```

---

## Auth Endpoints

All auth endpoints use a single **POST** `/api/auth` with an `action` field.

### Sign Up

```json
{
  "action": "signup",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "phone": "+1-555-0000",
  "workLocation": "NYC",
  "department": "IT",
  "reasonForAccess": "Support ticket handling",
  "employeeId": "EMP123",
  "businessUnit": "Operations",
  "managerName": "Jane Smith",
  "role": "user"
}
```

**Response (201):**

```json
{
  "message": "Account created successfully. Your account is pending admin approval.",
  "data": {
    "user": { "...sanitized user object..." },
    "roleRequestPending": true
  }
}
```

### Forgot Password

```json
{
  "action": "forgot-password",
  "email": "user@example.com"
}
```

**Response (200):**

```json
{
  "message": "If the email exists, an OTP has been sent."
}
```

### Verify OTP

```json
{
  "action": "verify-otp",
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (200):**

```json
{
  "message": "OTP verified successfully",
  "data": {
    "verified": true,
    "resetToken": "jwt-reset-token"
  }
}
```

### Reset Password

```json
{
  "action": "reset-password",
  "email": "user@example.com",
  "resetToken": "jwt-reset-token",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response (200):**

```json
{
  "message": "Password reset successfully. You can now sign in with your new password."
}
```

### Change Password (Requires Auth)

```json
{
  "action": "change-password",
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

### Get All Users (Admin Only)

```json
{
  "action": "get-all-users"
}
```

**Response (200):**

```json
{
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "firstName": "Admin",
      "lastName": "User",
      "name": "Admin User",
      "email": "admin@picks.com",
      "role": "admin",
      "isActive": true,
      "status": "approved",
      "department": "IT",
      "workLocation": "HQ",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Single User (Admin Only)

```json
{
  "action": "get-user",
  "userId": 1
}
```

### Update User (Admin Only)

```json
{
  "action": "update-user",
  "userId": 1,
  "data": {
    "firstName": "Updated",
    "lastName": "Name",
    "name": "Updated Name",
    "email": "updated@example.com",
    "phone": "+1-555-9999",
    "role": "admin",
    "isActive": true,
    "workLocation": "Remote",
    "department": "Engineering",
    "employeeId": "EMP456",
    "businessUnit": "Tech",
    "managerName": "Boss Name",
    "dateOfBirth": "1990-01-15",
    "profilePicture": "https://example.com/photo.jpg",
    "adminNotes": "Approved for elevated access"
  }
}
```

### Delete User (Admin Only)

```json
{
  "action": "delete-user",
  "userId": 2
}
```

### Unlock User (Admin Only)

```json
{
  "action": "unlock-user",
  "userId": 2
}
```

### Get Role Requests (Admin Only)

```json
{
  "action": "get-role-requests"
}
```

### Get Pending Role Requests (Admin Only)

```json
{
  "action": "get-pending-role-requests"
}
```

### Approve Role Request (Admin Only)

```json
{
  "action": "approve-role-request",
  "userId": 2,
  "adminNotes": "Approved - meets requirements"
}
```

### Reject Role Request (Admin Only)

```json
{
  "action": "reject-role-request",
  "userId": 2,
  "adminNotes": "Insufficient justification"
}
```

---

## Incident Endpoints

All incident endpoints require auth. Base path: `/api/admin/incidents`

### Get All Incidents

**GET** `/api/admin/incidents`

**Response (200):**

```json
{
  "message": "Incidents retrieved successfully",
  "data": [
    {
      "id": 1,
      "number": "INC0000001",
      "caller": "John Doe",
      "shortDescription": "Printer not working",
      "status": "new",
      "priority": "3-Medium",
      "impact": "medium",
      "urgency": "medium",
      "createdAt": "2025-02-12T10:00:00Z"
    }
  ]
}
```

### Get Draft Incidents

**GET** `/api/admin/incidents/drafts`

### Get Incident by ID

**GET** `/api/admin/incidents/:id`

### Get Incident by Number

**GET** `/api/admin/incidents/number/:number`

Example: `GET /api/admin/incidents/number/INC0000001`

### Create Incident

**POST** `/api/admin/incidents`

```json
{
  "number": "INC0000001",
  "caller": "John Doe",
  "businessCategory": "IT Support",
  "serviceLine": "Hardware",
  "application": "Windows",
  "shortDescription": "Printer not working",
  "description": "Network printer on floor 3 is not responding",
  "impact": "medium",
  "urgency": "medium",
  "channel": "portal",
  "assignmentGroup": "IT Support Team",
  "createdBy": "admin@picks.com",
  "status": "new",
  "client": "Acme Corp",
  "callerPhone": "+1-555-0000",
  "callerEmail": "john@acme.com",
  "callerLocation": "Floor 3",
  "callerDepartment": "Finance",
  "primaryResource": "Mike Johnson",
  "isRecurring": false,
  "isMajor": false
}
```

**Required fields:** `caller`, `businessCategory`, `serviceLine`, `application`, `shortDescription`, `description`, `impact`, `urgency`, `channel`, `assignmentGroup`, `createdBy`

**For drafts**, only `caller` and `createdBy` are required. Set `status` to `"draft"` and optionally include `draftExpiresAt`.

### Update Incident

**PUT** `/api/admin/incidents/:id`

All fields are optional:

```json
{
  "status": "in_progress",
  "priority": "2-High",
  "assignmentGroup": "Escalation Team",
  "primaryResource": "Senior Engineer"
}
```

### Delete Incident

**DELETE** `/api/admin/incidents/:id`

---

## Comment Endpoints

Base path: `/api/admin/incidents/:id/comments`

### Get Comments

**GET** `/api/admin/incidents/:id/comments`

### Create Comment

**POST** `/api/admin/incidents/:id/comments`

```json
{
  "subject": "Follow-up needed",
  "message": "User confirmed the issue persists after initial fix attempt",
  "isInternal": false,
  "isSelfNote": false,
  "notifyAssigneesOnly": false,
  "status": "in_progress",
  "createdBy": "admin@picks.com"
}
```

**Required fields:** `subject`, `message`

---

## Time Entry Endpoints

Base path: `/api/admin/incidents/:id/time-entries`

### Get Time Entries

**GET** `/api/admin/incidents/:id/time-entries`

### Create Time Entry

**POST** `/api/admin/incidents/:id/time-entries`

```json
{
  "date": "2025-02-12",
  "hours": 2,
  "minutes": 30,
  "billingCode": "PROJECT-001",
  "activityTask": "Troubleshooting printer drivers",
  "externalComment": "Investigated driver compatibility",
  "internalComment": "Need to escalate to vendor",
  "isNonBillable": false,
  "createdBy": "admin@picks.com"
}
```

**Required fields:** `date`, `hours`, `minutes`

---

## Resolution Endpoints

Base path: `/api/admin/incidents/:id/resolutions`

### Get Resolutions

**GET** `/api/admin/incidents/:id/resolutions`

### Create Resolution

**POST** `/api/admin/incidents/:id/resolutions`

```json
{
  "resolutionCode": "permanent_fix",
  "resolution": "Updated printer drivers to latest version, tested successfully",
  "application": "Windows",
  "category": "Hardware Issue",
  "subCategory": "Printer",
  "customerConfirmation": true,
  "isRecurring": false,
  "rootCauseIdentified": true,
  "rootCause": "Outdated printer drivers caused compatibility issue",
  "internalNote": "Recommend updating all printers on floor 3",
  "createdBy": "admin@picks.com"
}
```

**Required fields:** `resolutionCode`, `resolution`

**Resolution Code values:** `permanent_fix`, `workaround`, `known_error`, `duplicate`, `not_reproducible`, `user_error`, `configuration_change`, `software_update`, `hardware_replacement`, `third_party_fix`, `other`

---

## Activity Endpoints

### Get Activities

**GET** `/api/admin/incidents/:id/activities`

Returns the audit log for an incident (read-only).

**Response (200):**

```json
{
  "message": "Activities retrieved successfully",
  "data": [
    {
      "id": 1,
      "incidentId": 1,
      "activityType": "status_change",
      "description": "Status changed from new to in_progress",
      "previousValue": "new",
      "newValue": "in_progress",
      "performedBy": "admin@picks.com",
      "createdAt": "2025-02-12T10:00:00Z"
    }
  ]
}
```

---

## Ticket Type Endpoints

Base path: `/api/admin/ticket-type`

### Get All Ticket Types

**GET** `/api/admin/ticket-type`

### Get Ticket Type by ID

**GET** `/api/admin/ticket-type/:id`

### Create Ticket Type

**POST** `/api/admin/ticket-type`

```json
{
  "type": "incident",
  "name": "Incident"
}
```

### Update Ticket Type

**PUT** `/api/admin/ticket-type/:id`

```json
{
  "name": "Updated Name"
}
```

### Delete Ticket Type

**DELETE** `/api/admin/ticket-type/:id`

---

## Enum Reference

### Impact
`high`, `medium`, `low`

### Urgency
`high`, `medium`, `low`

### Priority (auto-calculated from Impact x Urgency)
`1-Critical`, `2-High`, `3-Medium`, `4-Low`, `5-Planning`

### Channel
`email`, `phone`, `portal`, `chat`, `walk_in`

### Status
`draft`, `new`, `in_progress`, `on_hold`, `assigned`, `resolved`, `closed`, `cancelled`

### Activity Types
`status_change`, `priority_change`, `assignment_change`, `comment_added`, `time_entry_added`, `resolution_added`, `attachment_added`, `field_update`, `follow_added`, `escalation`

---

## Error Responses

| Status | Description | Example |
|--------|-------------|---------|
| 400 | Validation error | `{ "message": "Validation failed", "errors": [...] }` |
| 401 | Unauthorized | `{ "message": "Access token is required" }` |
| 403 | Forbidden | `{ "message": "Admin access required" }` |
| 404 | Not found | `{ "message": "Incident not found" }` |
| 409 | Conflict | `{ "message": "Email already registered" }` |
| 423 | Locked | `{ "message": "Account is locked. Try again after X minutes." }` |
| 429 | Rate limited | `{ "message": "OTP already sent. Wait X minutes." }` |

---

## Postman Setup Tips

1. **Create an environment** with variable `baseUrl` = `http://localhost:3001`
2. **Add a pre-request script** to the Sign In request to auto-save the token:
   ```javascript
   if (pm.response.code === 201) {
     const data = pm.response.json();
     pm.environment.set("token", data.data.token);
   }
   ```
3. **Set the Authorization header** on your collection to `Bearer {{token}}`
4. Use `{{baseUrl}}` in all request URLs
