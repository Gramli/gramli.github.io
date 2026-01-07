*Posted 05/07/2025*

# Cleaning in GIT

This post lists common Git cleanup commands for removing local branches and clearing stashes.

> WARNING: These operations are destructive and cannot be undone.

### Delete local branches by pattern
For example delete all branches which has '*feature/*' in name.
```bash
git branch -D $(git branch --list '*feature/*')
```

Explanation:
* git branch --list 'feature/*' lists matching local branches
* git branch -D force-deletes each listed branch

### Clear stash
Delete all stashed changes:
```bash
git stash clear
```

### List stashes before clearing
```bash
git stash list
```

### Drop a single stash
```bash
git stash drop stash@{0}
```