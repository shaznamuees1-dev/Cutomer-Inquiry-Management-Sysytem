# Technical Decisions — Coffee Ninja Inquiry Management System

## 1. Architecture

The application uses React for the frontend, Express.js for the REST API, and PostgreSQL for persistent storage.

The frontend communicates with the backend through HTTP requests. Database operations are handled by the backend using parameterized SQL queries.

**Trade-off:** This architecture is simple and suitable for the assessment, but larger applications would benefit from additional service and repository layers.

## 2. JavaScript vs. TypeScript

I chose JavaScript instead of TypeScript because I have more hands-on experience with JavaScript. This allowed me to focus on implementing the required features, backend security, and testing within the assessment timeline.

**Trade-off:** TypeScript provides static type checking and can improve maintainability as an application grows. JavaScript was a practical choice for this project's scope and timeline.

**Future Improvement:** Consider migrating to TypeScript as the application expands.


## 3. Authentication and Authorization

Staff authenticate using email and password. Passwords are hashed with bcrypt, and successful login returns a JWT.

Inquiry endpoints require authentication. Every inquiry belongs to a staff member through `owner_id`.

The backend restricts inquiry queries and updates to the authenticated owner.

**Decision:** Ownership is enforced by the backend rather than relying on frontend route protection.

## 4. Inquiry Validation and Duplicate Handling

Customer name, contact, subject, and description are required. Input lengths are validated before insertion.

The application allows inquiries with similar customer information or subjects because a customer may legitimately submit multiple requests.

**Trade-off:** Duplicate detection is not automated. Future versions could flag potentially repeated inquiries for staff review.

## 5. Status Transitions

Allowed transitions:

- New → In Progress
- In Progress → Resolved
- Resolved → In Progress

Direct New → Resolved transitions are rejected.

**Reason:** Explicit transitions provide a predictable workflow while allowing resolved inquiries to be reopened.

## 6. Concurrent Updates

Status updates require the inquiry's previously observed `updated_at` timestamp.

The backend compares the supplied timestamp against the stored value and returns HTTP 409 when a stale update is detected.

The frontend displays a conflict message and offers a refresh action.

**Trade-off:** Timestamp-based optimistic concurrency is lightweight, but a dedicated integer version column would provide more robust concurrency control.

## 7. Error Handling

The application handles:

- Invalid input
- Missing or expired authentication
- Unauthorized inquiry access
- Invalid inquiry identifiers
- Invalid status transitions
- Stale updates
- Network and server errors
- Loading and empty states

## 8. Testing

Backend automated tests verify that unauthenticated inquiry requests are rejected.

Frontend automated tests verify that the login form renders and displays an error when credentials are rejected.

Manual testing covered inquiry creation, searching, filtering, status updates, staff ownership, and two-tab concurrency conflicts.

## 9. Known Limitations and Future Improvements

- Improve token management and session handling.
- Add pagination for larger inquiry lists.
- Introduce an integer version column for concurrency control.
- Add more automated integration tests.
- Improve accessibility and responsive design.
- Review and remediate the remaining frontend dependency advisory.
- Add deployment and production monitoring.

## 10. AI Usage Disclosure

AI-assisted tools were used for development support, debugging, and documentation. The implementation was personally reviewed and validated through manual and automated testing.