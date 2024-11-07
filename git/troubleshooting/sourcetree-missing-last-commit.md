# SourceTree - Error when rebase
Sometimes when I do rebase with conflicts sourcetree fails and drops last commit. So You need to find commit you want to return and use git reset.

Shows commits
```bash
git reflog
```
Find commit you want in reflog and reset branche to that commit using:

```bash
git reset <commitId> --hard
```

Then do rebase with git bash, because sourceTree will fails again.