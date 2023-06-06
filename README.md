# Shopify Product Chat

- This is a ready to use Node.js REST API project to use ChatGPT (through OpenAI API) on existing Shopify shop for asking questions about products.

### How?

- SHOPIFY_STORE_NAME, SHOPIFY_ACCESS_TOKEN and OPENAI_API_KEY environment variable values should be provided. Then when you send question to endpoint (e.g. `http://localhost:PORT?question=QUESTION_HERE`), API will fetch your products from Shopify, it will give these informations as context to OpenAI API and will give an answer using `text-davinci-003` model.
