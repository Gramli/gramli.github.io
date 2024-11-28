*Posted 11/28/2024*
# Replace or Format data using JSON.stringify

```js
const jsonData = {
    firstName: 'John',
    surName: 'Doe',
    birthDate: Date.now(),
    password: 'passw',
};

const dataFilter = (key, value) => {
    if(key === 'password') return undefined;
    else if(key.includes('Date')) return new Date(value).toDateString();
    return value;
}

const jsonString = JSON.stringify(jsonData, dataFilter, 1);
```

[Replacer parameter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#the_replacer_parameter)