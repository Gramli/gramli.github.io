*Posted 02/28/2024*

# Accidentaly commit to Master

If you accidentally commit directly to master, you can safely move that commit to a new branch without losing your work. Below are two common approaches: using Bash and using SourceTree.

## Using Bash
This approach rewinds master while keeping your changes staged. Git allows you to switch branches afterward, assuming the branches are reasonably in sync.

### Step 1: Reset the last commit but keep changes staged
```bash
git reset --soft HEAD^
```
This removes the commit from master while preserving the changes in the index.

### Step 2: Create and switch to a new branch

```bash
git checkout -b <branch>
```

### Step 3: Commit the changes
Commit the changes. In case you want to use original commit message, you can use ```-c ORIG_HEAD```

```bash
git commit -c ORIG_HEAD
```

## In SourceTree
1. Open Workspace → History
2. Right-click on origin/master or master
3. Select `Reset current branch to this commit`
4. Create a new branch
5. Commit the changes

Most Git GUI tools offer a similar workflow: when you select a specific commit in the history view, there is usually an option to **Reset to this commit**, which can be used to undo the commit on master and reapply it elsewhere.