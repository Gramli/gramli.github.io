# ARRAY

```sql
select * from table t where t.id = ANY (ARRAY[1,2,3])
```

# IN
```sql
SELECT * FROM table t WHERE t.id IN (1, 2, 3);
```