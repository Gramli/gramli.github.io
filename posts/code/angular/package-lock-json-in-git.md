*Posted 06/20/2025*

# package-lock.json in repo

We are commit package-lock.json only when we add or update some package.
When you use `npm install` it will re-generate package-lock.json so to do not need have package-lock.json in unstaged use `npm ci` instead.
 
npm ci - install exactly what is listed in package-lock.json.
keep in mind the package-lock.json file is going to be tied to the specific version of Node that originally created it. all the packages it downloads are going to be for that Node version, even if your Node version is different.
npm install - without changing any versions in package.json, use package.json to write package-lock.json, then install exactly what is listed in package-lock.json
benefits of commit package-lock.json: https://codefinity.com/blog/Should-I-Commit-package-lock.json