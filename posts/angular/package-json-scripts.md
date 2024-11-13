# Package json Scripts

Cheat sheet for package.json angular scripts and work with dependencies.

### Clear and reinstall dependencies
* Git Bash
    ```bash
    rm -rf node_modules && rm package-lock.json && npm i
    ```
* Powershell
    ```shell 
    rm -Recurse -Force .\node_modules\; rm package-lock.json
    npm i
    ```

### clear cache
```bash
npm cache clean --force
```