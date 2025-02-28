*Posted 02/28/2024*

# Accidentaly commit to Master

## Using Bash
This will revert the commit, but put the committed changes back into your index. Assuming the branches are relatively up-to-date with regard to each other, git will let you do a checkout into the other branch

```bash
git reset --soft HEAD^
```

Switch to you branche

```bash
git checkout -b <branch>
```

Commit the changes. In case you want to use original commit message, you can use ```-c ORIG_HEAD```

```bash
git commit -c ORIG_HEAD
```

## In SourceTree
1. Workspace => History
    - Right click on **origin/master** or **master** row and select 'Reset current branche to this commit'
2. New Branche
3. Commit