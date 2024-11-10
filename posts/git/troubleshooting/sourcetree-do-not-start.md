### SourceTree do not start

#### Cause
The most likely reason for this error is that the user.config file for SourceTree has been corrupted. You can confirm this by locating the file in this location: ```C:\Users\<User>\AppData\Local\Atlassian\SourceTree.exe_<random_string>\<version_number>```

If this is the cause, when you open the file, it will be full of <NULL> values.

#### Resolution

If the user.config file is indeed corrupted, you may delete it. It will be regenerated the next time you start SourceTree, and the application should start normally.

### [Original Link](https://confluence.atlassian.com/sourcetreekb/sourcetree-crashes-on-startup-831655339.html)