import { Configuration, OpenAIApi } from "openai";
import GPT3Tokenizer from "gpt3-tokenizer";
import { normalizeText } from "./common";

function calculateTokens(text: string) {
  const tokenizer = new GPT3Tokenizer({ type: "gpt3" });
  const encoded: { bpe: number[]; text: string[] } = tokenizer.encode(text);
  const decoded = tokenizer.decode(encoded.bpe);
  return { tokens: encoded.text.length, characters: decoded.length, tokenIds: encoded.bpe };
}

export async function createEmbedding(input: string) {
  try {
    // Creates an embedding vector representing the input text.
    const normalizedInput = normalizeText(input);
    const { tokens } = calculateTokens(normalizedInput);
    if (tokens > 8000) {
      // current token limit for Ada v2 is around 8000
      return null;
    }
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: normalizedInput
    });
    return response.data.data[0].embedding;
  } catch (error) {
    console.log("Error on createEmbedding", error);
    return null;
  }
}

export async function giveAnswer(question: string, context: string) {
  try {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY
    });
    const prompt = `The following is a chat conversation between an AI e-commerce assistant and a user. Write a paragraph, addressing the user's question and use the context below to obtain relevant information. If the question absolutely cannot be answered based on the context, say you don't know and you can't help for this question. Don't mention about tags and context.\nContext: ${context}\nQuestion: ${question}`;
    // CAN BE BETTER: Give vector database as context instead of pre-operations for create embedding
    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      temperature: 0.7,
      max_tokens: 4000 - calculateTokens(prompt).tokens
    });
    // response type: AxiosResponse<CreateCompletionResponse, any>
    // e.g.
    // response.data = {
    //   id: "cmpl-6lzRlD0PxdblNtir4IE3mnkC6JOJ6",
    //   object: "text_completion",
    //   created: 1676895637,
    //   model: "text-davinci-003",
    //   choices: [ [Object] ],
    //   usage: { prompt_tokens: 173, completion_tokens: 54, total_tokens: 227 }
    // };
    return response.data.choices[0].text;
  } catch (error) {
    console.log("Error on giveAnswer", error);
  }
}

/*
Examples:
Question: do you sell something pink?
Answer: Yes, we do sell something pink! We have an Animal Print Furry Hair Band available in various colours, including pink.

Question: how can i use Animal Print Furry Hair Band?
Answer: The Animal Print Furry Hair Band is the perfect accessory for any outfit. It can be used to add a touch of style to your
look, whether you're going for a casual or formal style. The band is available in a variety of colors and animal prints,
so you can find the perfect look for you. It's also comfortable to wear and easy to take off and put back on. With this
stylish hair band, you can easily add a touch of flair to your look.
*/
