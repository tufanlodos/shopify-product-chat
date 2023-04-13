import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { createEmbedding, cosineSimilarity, giveAnswer, getShopifyProducts } from "./helpers";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

const productEmbeddings: { productString: string; embedding: number[] }[] | null = []; // CAN BE BETTER: use vector database

app.get("/", async (req: Request<{}, {}, {}, { question: string }>, res: Response) => {
  const { question } = req.query;
  if (!question) {
    res.status(400).send("Bad Request");
    return;
  }

  const products = await getShopifyProducts();
  // 1-create embeddings for each products if not exist
  if (productEmbeddings.length === 0) {
    const formattedStringProducts = products
      .slice(0, 15) // get first 15 against 429 Too Many Requests error from createEmbedding (there is a limitation per minute)
      .filter(
        (product) => product.title && product.body_html && product.tags && product.product_type
      )
      .map(
        (product) =>
          `Category: ${product.product_type}; Product Title: ${product.title}; Product Description: ${product.body_html}; Tags: ${product.tags}`
      );
    await Promise.allSettled(
      formattedStringProducts.map(async (productString) => {
        const embedding = await createEmbedding(productString);
        if (embedding) {
          productEmbeddings.push({ productString, embedding });
        }
      })
    );
  }

  // 2-create embedding for the question
  const questionEmbedding = await createEmbedding(question);
  if (!questionEmbedding) {
    res.status(503).send("Couldn't create question embedding");
    return;
  }

  // 3-find the most relevant product based on question
  const cosineSimilarities = productEmbeddings.map((productEmbedding) => {
    return {
      ...productEmbedding,
      similarities: cosineSimilarity(questionEmbedding, productEmbedding.embedding)
    };
  });
  const mostRelevantProduct = cosineSimilarities.reduce((prev, current) =>
    prev.similarities > current.similarities ? prev : current
  );
  // 4-give context to text completion, take the answer and send
  const answer = await giveAnswer(question, mostRelevantProduct.productString);
  res.status(200).send(answer);
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
