*Posted 05/28/2025*
# Bulk insert optimalization

Optimize bulk insert of json data using temporary table.

### Before Optimalization
```sql
CREATE OR REPLACE FUNCTION bulk_insert(
p_data json
)
RETURNS INT[] 
AS $$
DECLARE
  ids INT[];
BEGIN
  WITH inserted_users AS (
    INSERT INTO beneficiary (
      name,
      street,
      postal_code,
      city,
      created,
      country
    )
    SELECT 
      (j.p_data->>'Name')::VARCHAR(150),
      (j.p_data->>'Street')::VARCHAR(100),
      (j.p_data->>'PostalCode')::VARCHAR(10),
      (j.p_data->>'City')::VARCHAR(100),
      (j.p_data->>'Created')::TIMESTAMP,
      (j.p_data->>'Country')::SMALLINT
    FROM json_array_elements(p_data) as j(p_data)
    RETURNING id
  )
  SELECT array_agg(id) INTO ids FROM inserted_users;
  
  RETURN ids;
END;
$$ LANGUAGE plpgsql;
```

### After Optimalization

```sql
CREATE OR REPLACE FUNCTION bulk_insert(
  p_data json
)
RETURNS INT[]
AS $$
DECLARE
  ids INT[];
BEGIN
  -- Step 1: Create a temporary table
  CREATE TEMP TABLE temp_user (
    name VARCHAR(150),
    street VARCHAR(100),
    postal_code VARCHAR(10),
    city VARCHAR(100),
    created TIMESTAMP,
    country SMALLINT
  );

  -- Step 2: Insert data into the temporary table
  INSERT INTO temp_user (
    name,
    street,
    postal_code,
    city,
    created,
    country
  )
  SELECT 
    (j.p_data->>'Name')::VARCHAR(150),
    (j.p_data->>'Street')::VARCHAR(100),
    (j.p_data->>'PostalCode')::VARCHAR(10),
    (j.p_data->>'City')::VARCHAR(100),
    (j.p_data->>'Created')::TIMESTAMP,
    (j.p_data->>'Country')::SMALLINT
  FROM json_array_elements(p_data) AS j(p_data);

  -- Step 3: Bulk insert into the main table
  WITH inserted_users AS (
    INSERT INTO user (
      name,
      street,
      postal_code,
      city,
      created,
      country
    )
    SELECT * FROM temp_user
    RETURNING id
  )
  SELECT array_agg(id) INTO ids FROM inserted_users;

  -- Step 4: Drop the temporary table
  DROP TABLE temp_user;

  RETURN ids;
END;
$$ LANGUAGE plpgsql;
```

## Why Temporary Tables Improve Performance
1. **What Happens in not optimized Function**

    In not optimized function, you're directly inserting rows into the user table using a WITH clause and INSERT INTO ... SELECT. This works fine, but PostgreSQL has to do extra work for each row being inserted:

    - Maintain indexes: Every row inserted into the user table updates the indexes on that table.
    - Check constraints: PostgreSQL checks constraints (e.g., foreign keys, unique constraints) for every row.
    - Write-Ahead Logging (WAL): PostgreSQL logs every change to the user table to ensure durability (so it can recover if something goes wrong).

    This overhead happens for every row, which can slow things down when inserting a large number of rows.

2. **What Happens with a Temporary Table**

    When you use a temporary table, the initial insert goes into the temporary table instead of the user table. Temporary tables are special because:

    - No Index Maintenance: Temporary tables usually don't have indexes unless you explicitly create them. This means PostgreSQL doesn't have to update indexes during the initial insert, making it faster.
    - No Constraints: Temporary tables don't have constraints (like foreign keys or unique constraints), so PostgreSQL skips those checks during the initial insert.
    - No WAL Logging: Temporary tables are not logged in the Write-Ahead Log (WAL). This reduces disk I/O and makes the insert faster.

    After all the rows are inserted into the temporary table, you can bulk insert them into the user table in one operation. This reduces the overhead compared to inserting rows one by one.

## Why Bulk Insert from Temporary Table is Faster
- Batching Rows:
    Instead of inserting rows one by one into the user table, you insert all rows at once from the temporary table. PostgreSQL processes bulk inserts more efficiently than individual inserts.
- Deferred Index Updates:
    When you insert rows into the user table in bulk, PostgreSQL updates the indexes in batches instead of row-by-row. This is much faster.
- Reduced Lock Contention:
    If other transactions are accessing the user table, inserting rows one by one can cause contention (waiting for locks). Bulk inserts reduce the time the table is locked, improving performance.

## Key Benefits of Temporary Tables
- Faster Initial Insert:
The temporary table skips index updates, constraint checks, and logging, making the initial insert faster.
- Efficient Bulk Insert:
The final insert into the user table happens in bulk, reducing overhead.
- Reduced Disk I/O:
Temporary tables avoid WAL logging, which reduces disk writes during the initial insert.

## When to Use Temporary Tables
Temporary tables are especially useful when:

- You're inserting a large number of rows.
- The target table has many indexes or constraints.
- You want to preprocess or validate the data before inserting it into the main table.
## Conclusion
Using a temporary table improves performance because it defers the expensive operations (index updates, constraint checks, logging) until the final bulk insert into the user table. This reduces the overhead and speeds up the overall process.