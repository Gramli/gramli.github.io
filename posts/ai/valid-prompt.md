*Posted 11/12/2025*

# General “Prompt Structure” for Clear Results
A good prompt follows a simple structure — it’s basically context + task + constraints + output format and optionaly tone/style.

## Prompt Template

### Example

- **Role/Context**: [Who is asking, e.g., QA engineer testing an API]
- **Goal**: [What do you want to achieve]
- **Details**: [System, framework, method, data, environment]
- **Constraints**: [Number of cases, coverage level, edge cases, etc.]
- **Output format**: [Gherkin / JSON / test code / summary]
- **Tone/style**: [Concise / detailed / expert / educational]

### Copy
```text
Role/Context:
Goal: 
Details:
Constraints:
Output format:
Tone/Style:
```

### Context

Give the AI background so it knows who it’s helping and what the goal is.

```“You are a QA engineer testing a web application with an authentication API.”```
or
```“I am a QA engineer working on a Playwright test suite for a shopping cart.”```

✅ Why it matters: context sets tone and domain expectations (test cases vs essays).


### Task

Say exactly what you want the AI to do, using an action verb.
Use clear verbs like:

- “Generate”
- “Explain”
- “List”
- “Summarize”
- “Convert”

```“Generate test cases for the login feature.”```  
```“Explain why this test might fail intermittently.”```  
```“List possible negative test scenarios for registration.”```  

### Details (Input Data or Constraints)

- Add specifics that narrow down the response.
- Input details: URL, API spec, body, steps, scenario
- Tools/framework: Postman, Playwright, C#, Jest
- Desired scope: positive/negative/edge
- Environment or assumptions: “assume staging server with test users”

```“Use the OpenAPI spec below.”```  
```“Use Playwright with TypeScript.”```  
```“Include 3 positive and 2 negative scenarios.”```  

### Output Format

Specify exactly what the response should look like.
If you don’t, AI might produce verbose explanations.

```“Output only Gherkin scenarios.”```  
```“Output as a JSON array of test cases.”```  
```“Output code ready to copy into a Jest test file.”```  

### Optional: Role + Tone

This is underrated — telling the AI how to think.

```“Act as a senior QA automation engineer.”```  
```“Think step by step.”```  
```“Be concise and structured.”```  


### Example: Bad vs Good Prompt (QA Use Case)

❌ Bad Prompt

```text
“Write some tests for login.”
```

✅ Good Prompt

```text
“You are a QA automation engineer.
Generate 5 test cases for the POST /api/login endpoint.
Include both positive and negative cases (e.g., valid credentials, invalid password, missing fields).
Output in Gherkin format, no explanations.”
```