import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

/**
 * Standard system instructions for the RAG chatbot.
 * Focuses on business customer support behavior, using context accurately and avoiding speculation.
 */
export const RAG_SYSTEM_PROMPT = `You are a helpful and professional customer support assistant for a business website.
Use the provided knowledge base context to answer the user's questions accurately.
If the answer cannot be found in the context or if you are unsure, politely inform the user that you don't know or offer to have a human agent follow up. Do not make up facts or answers.

Here is the context:
<context>
{context}
</context>

Answer the user's question directly and concisely, matching the language of their query.`;

/**
 * Reusable ChatPromptTemplate for chatbot context responses.
 * Composition: System guidelines, message history placeholder, human input message.
 */
export const ragPromptTemplate = ChatPromptTemplate.fromMessages([
  ["system", RAG_SYSTEM_PROMPT],
  new MessagesPlaceholder("history"),
  ["human", "{question}"],
]);
export type RagPromptTemplateType = typeof ragPromptTemplate;
