*Posted 06/13/2025*

## Composite Index and Separate Indexes
### Separate Indexes
Useful when queries filter or join using only one column.
Provides flexibility for queries that use only one column.
### Composite Index
Useful when queries filter or join using both columns together.
Example:
How Foreign Keys and Indexes Work Together
Foreign keys ensure referential integrity but do not optimize query performance.
Indexes on foreign key columns improve query performance by reducing the number of rows scanned during joins, filters, updates, and deletes.

## Best Practices
* Index Columns: Create indexes on columns that are frequently used in joins or filters, even if they are foreign keys.
* Analyze Query Patterns: Use EXPLAIN ANALYZE to check if indexes are being used effectively.
* Create Indexes Strategically: Focus on columns frequently used in WHERE, JOIN, or ORDER BY clauses.
* Monitor Index Usage: Use pg_stat_user_indexes to identify unused indexes.
* Use CONCURRENTLY for Index Creation: Avoid locking tables during index creation.
* Regular Maintenance: Use VACUUM and REINDEX to keep indexes efficient.

## Disadvantages
* Increased storage usage -	Indexes consume additional disk space.
* Slower write operations -	INSERT, UPDATE, and DELETE become slower due to index updates.
* Maintenance overhead - Indexes require periodic VACUUM and REINDEX to avoid bloat.
* Query planner complexity - Too many indexes can confuse the query planner.
* Redundant or unused indexes  - Wastes storage and slows down write operations.
* Locking during index creation - Non-concurrent index creation locks the table.
* Limited use cases	Indexes may not help for low-cardinality columns or large result sets.
* Index fragmentation -	Fragmentation leads to slower queries and increased storage usage.
* Increased complexity - Adds administrative overhead to manage indexes effectively.
* Cost of index creation -	Index creation on large tables can degrade performance temporarily.


## CREATE INDEX
```sql
CREATE INDEX IF NOT EXISTS indexName ON tableName USING btree (columns);
```
- Locks the table, blocking writes while the index is being built.
- Faster than CONCURRENTLY, but not suitable for production systems with live writes.

### CREATE INDEX CONCURRENTLY

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS indexName ON tableName USING btree (columns);
```

- Does not lock the table—reads and writes can continue during index creation.
- Slower, but safe for production environments with ongoing traffic.
- Use CONCURRENTLY when working on large tables in production to avoid downtime.