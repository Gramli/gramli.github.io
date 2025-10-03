*Posted 12/21/2024*

# ARRAY

## Declaration
```column_name datatype []```

## Use in Query
```sql
select * from table t where t.id = ANY (ARRAY[1,2,3])
```

### Indexing
```sql
SELECT
  name,
  phones [ 1 ]
FROM
  contacts;
```

## Construction
```sql
SELECT ARRAY[1,2,3,4] AS numbers;
SELECT ARRAY['apple','banana','cherry'] AS fruits;
```

## Functions
- unnest() – expand array into rows:
  ```sql
  SELECT unnest(ARRAY[1,2,3]) AS number;
  ```

- array_prepend() – adds the element to the beginning of the array:
  ```sql
  SELECT array_prepend(ARRAY[1,2], 3);
  ```
- array_append() – adds the element to the end of the array:
  ```sql
  SELECT array_append(ARRAY[1,2], 3);
  ```
- array_agg(expr) – aggregate values into an array.
    ```sql
  SELECT array_agg(id) FROM users;
  ```
## IN for compare
```sql
SELECT * FROM table t WHERE t.id IN (1, 2, 3);
```

## Performance Notes

- Arrays are stored as a single value → updating one element rewrites the whole array.  
- Indexing inside arrays is limited → use **GIN indexes** for faster lookups with operators like `@>`.  
  ```sql
  CREATE INDEX idx_tags_gin ON posts USING gin(tags);
  SELECT * FROM posts WHERE tags @> ARRAY['sql'];
  ```
- Best for small sets (tags, phone numbers). For large or frequently updated collections, use a separate table instead.
- unnest() can be expensive on large arrays since it expands rows.
- array_agg() is convenient but may use lots of memory for huge result sets.


[Array Functions and Operators](https://www.postgresql.org/docs/9.1/functions-array.html)