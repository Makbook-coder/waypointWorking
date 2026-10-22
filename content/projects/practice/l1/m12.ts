import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M12: ProjectSrc[] = [
  practice("m1-2-characters-words-and-tokens", "reimplement",
    pj("Byte-pair encoding from scratch", 60, "Implement the merge loop of byte-pair encoding on a small text and see how tokens are born.",
      [
        ["Start with a short text split into characters, with each word ending in a marker such as `</w>`.", "Count words first so repeated words are not recounted."],
        ["Count every adjacent pair of symbols across the vocabulary.", "Use `collections.Counter`."],
        ["Merge the most frequent pair into one new symbol everywhere and repeat 20 times.", "Print each merge so you can watch the vocabulary grow."],
        ["Write `encode(word)` that applies the learned merges in order.", "Apply them in the order they were learned."],
        ["Encode a few new words and compare with a real tokenizer such as `tiktoken` on the same words.", "The splits will differ but the idea is the same."],
      ],
      "A list of learned merges and an encoder that splits new words into subwords.",
      ["Merges are learned by counting pairs", "Encoder applies them in order", "Compared with a real tokenizer"],
      "Compare tokenization across languages and code next.", ["Python 3.11 or newer", "tiktoken (downloads a vocabulary on first use)"]),
    {}),
  practice("m1-2-tokenizing-across-languages-and-code", "challenge",
    pj("Token tax", 35, "Measure how many tokens the same meaning costs in different languages and in code, with no steps given.",
      [],
      "A table of token counts for the same ideas written in at least four languages and three code styles.",
      ["The same five sentences are translated into at least four languages", "Tokens per character and tokens per sentence are both reported", "Code is compared in two languages or formats, such as Python and JSON", "At least one tokenizer is used consistently for all counts", "You wrote what this means for cost and context limits"],
      "Connect tokens to cost and latency next.", ["Python 3.11 or newer", "tiktoken or another tokenizer"]),
    { hints: ["Use a translation tool or a model to produce the sentences, and keep the meaning identical.", "Count with `len(enc.encode(text))`.", "Compare minified and pretty-printed JSON; whitespace is not free."] }),
  practice("m1-2-why-tokens-drive-cost-and-latency", "optimise",
    pj("Cut the token bill", 40, "Reduce the token count of a wasteful prompt and payload without changing the answer.",
      [
        ["Count the tokens of the prompt and sample data above and work out the cost at a price you look up.", "Write the price and where you found it."],
        ["Remove noise from the instructions, keeping every rule that changes the answer.", "Test the answer before and after."],
        ["Compact the data: remove unused fields, shorten keys and drop pretty-printing.", "Keep the fields the question needs."],
        ["Send both versions to a model with the same question and compare the answers.", "They should match."],
        ["Calculate the saving over 100,000 calls and note what you would not shrink.", "Put accuracy first: do not shrink anything that changes the answer."],
      ],
      "Before and after token counts with equal answers and a yearly saving estimate.",
      ["Token counts measured before and after", "Answers compared", "Saving calculated with a sourced price"],
      "Look inside the model with embeddings next.", [LLM, "tiktoken"]),
    { starter: code(
      "You are a helpful, friendly and extremely careful assistant. Please read the following customer record",
      "very carefully and then, when you are ready, answer the question that follows. It is very important",
      "that you answer in one short sentence. Thank you so much for your help!",
      "",
      "{",
      "    \"customer_identifier\": 10293,",
      "    \"customer_full_name\": \"Asha Rao\",",
      "    \"customer_email_address\": \"asha@example.com\",",
      "    \"customer_account_status\": \"active\",",
      "    \"customer_internal_notes\": \"\",",
      "    \"customer_marketing_preferences\": {\"email\": true, \"sms\": false, \"post\": false}",
      "}",
      "",
      "Question: Is this customer's account active?") }),
];
