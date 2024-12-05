*Posted 12/05/2024*

# Problem Details for HTTP APIs
[RFC 9457 - Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html). The document defines a "problem detail" to carry machine-readable details of errors in HTTP response content to avoid the need to define new error response formats for HTTP APIs.

## Cheat Sheet

### Members of a Problem Details Object
* type (URI): - Identifies the problem type, typically a resolvable URL with documentation.
Default: "about:blank" for generic errors.
* title (string): A short, human-readable summary of the problem type.
Example: "Unauthorized".
* status (number): HTTP status code (e.g., 404, 500) associated with the error.
* detail (string): A human-readable explanation specific to this occurrence of the problem.
* instance (URI): Identifies the specific occurrence of the problem, optionally resolvable for further details.

### Media Types
JSON: application/problem+json
XML: application/problem+xml

### Extensibility
Custom properties can be added to the problem object but must follow naming conventions (e.g., start with a letter and use alphanumeric characters or _).

### Best Practices
Use resolvable URIs for type and instance when possible.
Avoid exposing sensitive details (e.g., stack traces) in error responses.
Ensure title, status, and other fields provide clarity without requiring type dereferencing. Ensure proper validation of any additional fields.


### Example

```json
{
  "type": "https://example.com/probs/not-found",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "The requested resource does not exist.",
  "instance": "/api/resource/123"
}
```



