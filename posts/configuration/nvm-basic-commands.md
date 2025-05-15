*Posted 11/10/2024*
# NVM and FNM basic commands 

Most of the nvm commands works with fnm.

### FNM setup
#### Bash
Add the following to your .bashrc profile:
```bash
eval "$(fnm env --use-on-cd --shell bash)"
```

### check version
```bash
node -v || node --version
```

### list installed versions (via nvm/fnm)
```bash
nvm ls
```

### To list available remote versions on Windows
```bash 
nvm list available
 ```

### install a specific version
```bash
nvm install 18.19.1
```

### switch version
```bash 
nvm use 18.19.1
```

### set default version
```bash
nvm alias default 18.19.1
```

### end of execution of a command
``` 
ctrl + c 
```

[Original Link](https://gist.github.com/chranderson/b0a02781c232f170db634b40c97ff455)