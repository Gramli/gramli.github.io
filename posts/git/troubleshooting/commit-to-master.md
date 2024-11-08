# Accidentaly commit to Master

This will revert the commit, but put the committed changes back into your index. Assuming the branches are relatively up-to-date with regard to each other, git will let you do a checkout into the other branch

```bash
git reset --soft HEAD^
```

Switch to you branche

```bash
git checkout <branch>
```

Commit the changes. In case you want to use original commit message, you can use ```-c ORIG_HEAD```

```bash
git commit -c ORIG_HEAD
```
