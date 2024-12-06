*Posted 12/05/2024*

# Rest API routers naming best practices

## Use Nouns, Not Verbs

Endpoints should represent resources, not actions. 
For example:
* Good: `/users (to retrieve users)`
* Bad: `/getUsers`

Use HTTP methods (e.g., GET, POST, PUT, DELETE) to define actions on resources.

## Pluralize Resource Names

Use plural nouns for collections and singular nouns for specific resources:
* `/users for a collection of users.`
* `/users/{id} for a single user.`

## Keep Endpoints Hierarchical and Logical

Reflect the relationship between resources in the hierarchy:
* `/users/{id}/orders (orders belonging to a specific user).`

## Use Lowercase and Hyphens

Resource names should be lowercase and use hyphens (-) instead of underscores (_) for readability:
* Good: `/pending-orders`
* Bad: `/Pending_Orders or /pending_orders`.

## Avoid Deep Nesting

Keep URLs flat to avoid complexity. Use query parameters for additional filtering:
* Good: `/items/{itemId}?userId={userId}`
* Bad: `/users/{userId}/orders/{orderId}/items/{itemId}`

## Avoid File Extensions

Specify response formats using headers `(Content-Type)` rather than file extensions like `.json or .xml`.

## Be Consistent

Use consistent terminology and patterns across the API to enhance usability.
Use Query Parameters for Filtering and Searching

For operations like filtering or sorting, use query parameters:
`/users?location=USA&sort=name`.

## Versioning

Include a version, for example in the URI to manage updates gracefully:
`/v1/users`.

## Readable and Intuitive Names

Choose intuitive, non-abbreviated names:
* Good: `/users/{id}/profile`
* Bad: `/usr/{id}/prf`.