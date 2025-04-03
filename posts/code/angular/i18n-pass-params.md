*Posted 03/28/2025*

### Json File

```json
"messageWithParams": "hello this is {{something}} ..."
```

### Template
```html
{% raw %}
{{'messageWithParams' | translate : {something:text} }}
{% endraw %}
```