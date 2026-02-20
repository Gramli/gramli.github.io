*Posted 06/13/2025*

# PostgreSQL Database Optimization and Cleanup

In PostgreSQL, the **VACUUM ANALYZE** command is used to optimize database performance by cleaning up dead tuples and updating statistics for query planning. Here's a breakdown of what it does:

### VACUUM:
- **Purpose**: Removes dead tuples (rows that were deleted or updated but are still occupying space) from tables.
- **Why Needed**: PostgreSQL uses Multi-Version Concurrency Control (MVCC), which keeps old versions of rows for transaction isolation. Over time, these old versions accumulate and need to be cleaned up.
- **Effect**: Frees up space and prevents table bloat, ensuring efficient storage and performance.

### ANALYZE:
- **Purpose**: Collects statistics about the contents of tables and indexes.
- **Why Needed**: These statistics are used by the query planner to make decisions about the most efficient way to execute queries.
- **Effect**: Improves query performance by enabling better execution plans.

### Combined Command: VACUUM ANALYZE
- **Purpose**: Performs both tasks in a single operation—cleaning up dead tuples and updating statistics.
- **Use Case**: It's commonly used after large data modifications (e.g., bulk inserts, updates, or deletes) to ensure the database remains performant.

**Notes:**
Locks: VACUUM ANALYZE acquires a lock on the table, but it doesn't block reads or writes unless you use VACUUM FULL.
Autovacuum: PostgreSQL has an automatic vacuuming process (autovacuum) that runs periodically, but manual VACUUM ANALYZE can be useful for specific scenarios.

```sql
VACUUM ANALYZE;
```

### Check Dead tuples
```sql
SELECT schemaname, relname, n_live_tup, n_dead_tup
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;
```

### Reindex
REINDEX rebuilds indexes to remove corruption or reduce bloat when performance degrades.

```sql
REINDEX TABLE tableName;
```

### Check Index Sizes
```sql 
SELECT
    schemaname,
    relname AS table_name,
    indexrelname AS index_name,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
    idx_scan AS index_scans
FROM
    pg_stat_user_indexes
WHERE
    idx_scan = 0 -- Indexes that are not being used
    OR pg_relation_size(indexrelid) > 100000000; -- Large indexes (adjust size threshold)
```

### Check Index Usage
```sql
SELECT indexrelname, idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = '' AND tablename = '';
```