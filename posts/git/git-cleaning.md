*Posted 05/07/2025*

# Cleaning in GIT

### Delete all branches by pattern
For example delete all branches which has '*feature/*' in name.
```bash
git branch -D $(git branch --list '*feature/*')
```

### Clear stash
For example delete all branches which has '*feature/*' in name.
```bash
git stash clear
```