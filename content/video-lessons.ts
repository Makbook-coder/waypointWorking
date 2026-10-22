/**
 * Short video lessons, added on top of the per-module resources.
 *
 * Every URL here appeared verbatim in a web search result on 2026-10-21. We list
 * whole courses or talks only: no timestamps or lesson deep links, because those
 * can't be checked. "watchFor" is our own one-line pointer, not a summary of the video.
 */
export interface VideoLesson {
  id: string;
  title: string;
  url: string;
  source: string;
  /** Module ids this lesson supports, in the order the roadmap meets them. */
  modules: string[];
  watchFor: string;
}

const DLAI = "DeepLearning.AI short course (free account)";

export const VIDEO_LESSONS: VideoLesson[] = [
  {
    id: "dlai-prompt-eng",
    title: "ChatGPT Prompt Engineering for Developers",
    url: "https://deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/",
    source: DLAI,
    modules: ["M3.1", "M3.2", "M3.5"],
    watchFor: "How clear instructions and a few examples change the output.",
  },
  {
    id: "dlai-building-systems",
    title: "Building Systems with the ChatGPT API",
    url: "https://www.deeplearning.ai/short-courses/building-systems-with-chatgpt/",
    source: DLAI,
    modules: ["M2.7", "M3.4"],
    watchFor: "Splitting one job into several model calls, and checking each output.",
  },
  {
    id: "dlai-functions-tools-agents",
    title: "Functions, Tools and Agents with LangChain",
    url: "https://www.deeplearning.ai/courses/functions-tools-agents-langchain",
    source: DLAI,
    modules: ["M2.3", "M2.5"],
    watchFor: "How a tool's description decides when the model calls it.",
  },
  {
    id: "dlai-efficient-serving",
    title: "Efficiently Serving LLMs",
    url: "https://www.deeplearning.ai/courses/efficiently-serving-llms",
    source: DLAI,
    modules: ["M1.5", "M9.4"],
    watchFor: "Why batching and caching make generation faster and cheaper.",
  },
  {
    id: "dlai-preprocessing",
    title: "Preprocessing Unstructured Data for LLM Applications",
    url: "https://www.deeplearning.ai/courses/preprocessing-unstructured-data-for-llm-applications",
    source: DLAI,
    modules: ["M4.1", "M12.4"],
    watchFor: "Turning PDFs and images into clean, labelled chunks.",
  },
  {
    id: "dlai-vector-dbs",
    title: "Vector Databases: from Embeddings to Applications",
    url: "https://www.deeplearning.ai/courses/vector-databases-embeddings-applications",
    source: DLAI,
    modules: ["M4.3", "M4.5"],
    watchFor: "What an embedding is, and how approximate search trades accuracy for speed.",
  },
  {
    id: "dlai-advanced-rag",
    title: "Building and Evaluating Advanced RAG",
    url: "https://www.deeplearning.ai/courses/building-evaluating-advanced-rag",
    source: DLAI,
    modules: ["M4.13", "M7.8"],
    watchFor: "Measuring retrieval and answer quality before trying fancier retrieval.",
  },
  {
    id: "dlai-agents-langgraph",
    title: "AI Agents in LangGraph",
    url: "https://www.deeplearning.ai/courses/ai-agents-in-langgraph",
    source: DLAI,
    modules: ["M5.2", "M5.7"],
    watchFor: "The agent loop as a graph: nodes, edges and saved state.",
  },
  {
    id: "dlai-mcp",
    title: "MCP: Build Rich-Context AI Apps with Anthropic",
    url: "https://www.deeplearning.ai/courses/mcp-build-rich-context-ai-apps-with-anthropic",
    source: DLAI,
    modules: ["M5.4"],
    watchFor: "The split between MCP hosts, clients and servers.",
  },
  {
    id: "dlai-agent-memory",
    title: "Long-Term Agentic Memory With LangGraph",
    url: "https://www.deeplearning.ai/courses/long-term-agentic-memory-with-langgraph",
    source: DLAI,
    modules: ["M5.5", "M6.4"],
    watchFor: "Which memories to save, and when to load them back.",
  },
  {
    id: "dlai-automated-testing",
    title: "Automated Testing for LLMOps",
    url: "https://learn.deeplearning.ai/courses/automated-testing-llmops/information",
    source: DLAI,
    modules: ["M7.7", "M10.4"],
    watchFor: "Running evals in CI so a bad change fails the build.",
  },
  {
    id: "dlai-evaluating-agents",
    title: "Evaluating AI Agents",
    url: "https://www.deeplearning.ai/courses/evaluating-ai-agents",
    source: DLAI,
    modules: ["M7.9"],
    watchFor: "Scoring each step of an agent run, not just the final answer.",
  },
  {
    id: "dlai-red-teaming",
    title: "Red Teaming LLM Applications",
    url: "https://www.deeplearning.ai/courses/red-teaming-llm-applications",
    source: DLAI,
    modules: ["M8.7"],
    watchFor: "Attacking your own app on purpose and logging what got through.",
  },
  {
    id: "dlai-voice-agents",
    title: "Building AI Voice Agents for Production",
    url: "https://www.deeplearning.ai/courses/building-ai-voice-agents-for-production",
    source: DLAI,
    modules: ["M12.8"],
    watchFor: "Where the delay goes in a voice pipeline, and how turn-taking works.",
  },
  {
    id: "dlai-finetuning",
    title: "Finetuning Large Language Models",
    url: "https://www.deeplearning.ai/courses/finetuning-large-language-models",
    source: DLAI,
    modules: ["M13.1", "M13.3"],
    watchFor: "When fine-tuning beats prompting, and what the training data looks like.",
  },
  {
    id: "dlai-grpo",
    title: "Reinforcement Fine-Tuning LLMs With GRPO",
    url: "https://www.deeplearning.ai/courses/reinforcement-fine-tuning-llms-grpo",
    source: DLAI,
    modules: ["M13.6"],
    watchFor: "How a reward function is written, and how models learn to game it.",
  },
];
