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

## IN for compare
```sql
SELECT * FROM table t WHERE t.id IN (1, 2, 3);
```

[Array Functions and Operators](https://www.postgresql.org/docs/9.1/functions-array.html)