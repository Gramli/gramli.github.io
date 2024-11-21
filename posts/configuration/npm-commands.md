*Posted 11/10/2024*
# Npm commands cheat sheet

### clear and reinstall dependencies
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

### Angular - run single test
```bash
npm t -- --include src/app/some-folder/some-test.spec.ts
```