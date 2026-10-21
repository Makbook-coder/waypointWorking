/**
 * Generates data/resources.json from a curated library of verified URLs.
 *
 *   npm run build:resources
 *
 * Every URL in LIBRARY was confirmed to exist (it appeared verbatim in a web search
 * or fetch result) when this file was written. Each module additionally gets one
 * YouTube search link, flagged `searchLink: true`, so there is always a way to find
 * a current video without inventing a deep link.
 */
import { youtubeSearch } from "../src/lib/youtube";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Resource, ResourceMap, Roadmap } from "../src/lib/types";

type Entry = Omit<Resource, "searchLink">;
const d = (title: string, url: string, free = true): Entry => ({ type: "docs", title, url, free });
const a = (title: string, url: string, free = true): Entry => ({ type: "article", title, url, free });
const v = (title: string, url: string, free = true): Entry => ({ type: "video", title, url, free });
const c = (title: string, url: string, free = true): Entry => ({ type: "course", title, url, free });
const r = (title: string, url: string): Entry => ({ type: "repo", title, url, free: true });
const p = (title: string, url: string): Entry => ({ type: "paper", title, url, free: true });

const CXO = "https://learnwith.campusx.in/#cxo-pricing";
const DSMP = "https://learnwith.campusx.in/courses/Data-Science-Mentorship-Program-DSMP-20-653f50d1e4b0d2eae855480a";
const RM = "https://ai-engineer-roadmap-2026.vercel.app";

export const LIBRARY = {
  // CampusX (links taken from the roadmap pages and the CampusX YouTube channel)
  cxPython: c("Python (CampusX One, DSMP)", DSMP, false),
  cxGit: c("Git & GitHub (CampusX One, DSMP)", DSMP, false),
  cxSql: c("SQL (CampusX One, DSMP)", DSMP, false),
  cxDocker: c("Docker for Machine Learning (CampusX One)", "https://learnwith.campusx.in/courses/Docker-for-Machine-Learning-68a022773f7a067efc5df47e", false),
  cxFastapi: c("FastAPI (CampusX One)", "https://learnwith.campusx.in/courses/FastAPI-6873cb2075f40c2715c809fe", false),
  cxFlask: c("Web & API Development using Flask (CampusX One)", "https://learnwith.campusx.in/courses/Web-and-API-Development-using-Flask-6839ae3fb109825d2ca6526d", false),
  cxClaudeCode: v("Agentic Coding using Claude Code (CampusX playlist)", "https://www.youtube.com/playlist?list=PLKnIA16_RmvaYH3poI0oJvbDF4zEvpq8W"),
  cxLangchainIntro: v("Introduction to LangChain (CampusX)", "https://www.youtube.com/watch?v=nlz9j-r0U9U"),
  cxLangchainComponents: v("LangChain Components (CampusX)", "https://www.youtube.com/watch?v=-xSJA8-o6Eg"),
  cxEvalPipelines: v("Why Your AI Application Needs Multiple Eval Pipelines (CampusX)", "https://www.youtube.com/watch?v=DcZ-XCk-O_M"),
  cxGenaiLangchain: c("GenAI using LangChain (CampusX One)", CXO, false),
  cxGenaiOpenSource: c("GenAI using Open Source Models (CampusX One)", CXO, false),
  cxPrompt: c("Prompt Engineering (CampusX One)", CXO, false),
  cxAdvancedRag: c("Advanced RAG (CampusX One)", CXO, false),
  cxLanggraph: c("LangGraph (CampusX One)", CXO, false),
  cxCrewai: c("CrewAI (CampusX One)", CXO, false),
  cxAgno: c("Agno (CampusX One)", CXO, false),
  cxMcp: c("MCP (CampusX One)", CXO, false),
  cxInterview: c("AI Engineer Interview Prep (CampusX One)", CXO, false),
  rm100LlmFund: a("100 Days of AI Engineering: LLM fundamentals (6-day track)", `${RM}/100-days/llm-fundamentals/`),
  rm100Apis: a("100 Days of AI Engineering: building with LLM APIs (11-day track)", `${RM}/100-days/building-with-llm-apis/`),
  rm100Prompt: a("100 Days of AI Engineering: prompt engineering (7-day track)", `${RM}/100-days/prompt-engineering/`),
  rm100Rag: a("100 Days of AI Engineering: RAG (32-day track)", `${RM}/100-days/rag/`),
  rm100Agents: a("100 Days of AI Engineering: agents (27-day track)", `${RM}/100-days/agents/`),
  rm100Prod: a("100 Days of AI Engineering: shipping to production (17-day track)", `${RM}/100-days/shipping-to-production/`),
  chipBook: a("AI Engineering: Building Applications with Foundation Models (Chip Huyen, book)", "https://bookshop.org/p/books/ai-engineering-building-applications-with-foundation-models-chip-huyen/d1a4892f5eb5134f", false),

  // Software engineering
  mdnHttp: d("Overview of HTTP (MDN)", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview"),
  mdnMessages: d("HTTP messages (MDN)", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Messages"),
  mdnHttpRef: d("HTTP reference: methods, status codes, headers (MDN)", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference"),
  mdnSse: d("Server-sent events (MDN)", "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events"),
  pyAsyncioHowto: d("A conceptual overview of asyncio (Python docs)", "https://docs.python.org/3/howto/a-conceptual-overview-of-asyncio.html"),
  pyAsyncioTasks: d("Coroutines and tasks (Python docs)", "https://docs.python.org/3/library/asyncio-task.html"),
  uv: d("uv documentation", "https://docs.astral.sh/uv/"),
  uvDocker: d("Using uv in Docker", "https://docs.astral.sh/uv/guides/integration/docker/"),
  pytest: d("pytest: Get started", "https://docs.pytest.org/en/stable/getting-started.html"),
  pydanticModels: d("Pydantic: Models", "https://pydantic.dev/docs/validation/latest/concepts/models/"),
  fastapiTutorial: d("FastAPI tutorial / user guide", "https://fastapi.tiangolo.com/tutorial/"),
  fastapiResponseModel: d("FastAPI: Response model", "https://fastapi.tiangolo.com/tutorial/response-model/"),
  fastapiSql: d("FastAPI: SQL (relational) databases", "https://fastapi.tiangolo.com/tutorial/sql-databases/"),
  fastapiTestingDb: d("FastAPI: Testing a database", "https://fastapi.tiangolo.com/how-to/testing-database/"),
  fastapiTemplate: d("FastAPI: Full stack template", "https://fastapi.tiangolo.com/project-generation/"),
  pgTutorial: d("PostgreSQL tutorial (official)", "https://www.postgresql.org/docs/current/tutorial.html"),
  pgSqlIntro: d("PostgreSQL: The SQL language, introduction", "https://www.postgresql.org/docs/current/tutorial-sql-intro.html"),
  proGit: d("Pro Git (free book)", "https://git-scm.com/book/en/v2"),
  gitLearn: d("Git: Learn", "https://git-scm.com/learn"),
  ghActions: d("Quickstart for GitHub Actions", "https://docs.github.com/en/actions/get-started/quickstart"),
  dockerStart: d("Docker: Get started", "https://docs.docker.com/get-started/"),
  dockerWorkshop: d("Docker workshop", "https://docs.docker.com/get-started/workshop/"),
  composeQuickstart: d("Docker Compose quickstart", "https://docs.docker.com/compose/gettingstarted/"),
  claudeCode: d("Claude Code overview", "https://code.claude.com/docs/en/overview"),
  claudeCodeBest: d("Best practices for Claude Code", "https://code.claude.com/docs/en/best-practices"),
  claudeCodeExtend: d("Extend Claude Code: skills, subagents, hooks, MCP, plugins", "https://code.claude.com/docs/en/features-overview"),
  claudeMd: a("Using CLAUDE.md files", "https://claude.com/blog/using-claude-md-files"),

  // LLM fundamentals
  karpathyIntro: v("Intro to Large Language Models (Andrej Karpathy)", "https://www.youtube.com/watch?v=zjkBMFhNj_g"),
  karpathyDeepDive: v("Deep Dive into LLMs like ChatGPT (Andrej Karpathy)", "https://www.youtube.com/watch?v=7xTGNNLPyMI"),
  karpathyGpt: v("Let's build GPT: from scratch, in code (Andrej Karpathy)", "https://www.youtube.com/watch?v=kCc8FmEb1nY"),
  karpathyTokenizer: v("Let's build the GPT Tokenizer (Andrej Karpathy)", "https://www.youtube.com/watch?v=zduSFxRajkE"),
  b3GPT: v("Transformers, the tech behind LLMs (3Blue1Brown)", "https://www.3blue1brown.com/lessons/gpt/"),
  b3Attention: v("Attention in transformers, step by step (3Blue1Brown)", "https://www.3blue1brown.com/lessons/attention/"),
  b3MiniLlm: v("Large Language Models explained briefly (3Blue1Brown)", "https://www.3blue1brown.com/lessons/mini-llm/"),
  illustratedTransformer: a("The Illustrated Transformer (Jay Alammar)", "https://jalammar.github.io/illustrated-transformer/"),
  hfLlmCourse: c("Hugging Face LLM Course", "https://huggingface.co/learn/llm-course/en/chapter1/1"),
  hfPipeline: c("HF LLM Course: Behind the pipeline", "https://huggingface.co/learn/llm-course/chapter2/2"),
  hfTokenizers: c("HF LLM Course: Building a tokenizer, block by block", "https://huggingface.co/learn/llm-course/en/chapter6/8"),
  instructGpt: p("Training language models to follow instructions with human feedback (InstructGPT)", "https://arxiv.org/abs/2203.02155"),
  lostMiddle: p("Lost in the Middle: How Language Models Use Long Contexts", "https://arxiv.org/pdf/2307.03172"),
  chipSampling: a("Generation configurations: temperature, top-k, top-p, test-time compute (Chip Huyen)", "https://huyenchip.com/2024/01/16/sampling.html"),
  claudeThinking: d("Extended thinking (Claude docs)", "https://platform.claude.com/docs/en/build-with-claude/extended-thinking"),
  claudeContext: d("Context windows (Claude docs)", "https://platform.claude.com/docs/en/build-with-claude/context-windows"),
  claudeModels: d("Models overview (Claude docs)", "https://platform.claude.com/docs/en/models/overview"),
  lilianHallucination: a("Extrinsic Hallucinations in LLMs (Lilian Weng)", "https://lilianweng.github.io/posts/2024-07-07-hallucination/"),
  lilianThinking: a("Why We Think (Lilian Weng)", "https://lilianweng.github.io/posts/2025-05-01-thinking/"),
  aaLeaderboard: d("Artificial Analysis LLM leaderboard", "https://artificialanalysis.ai/leaderboards/models"),
  aaModels: d("Artificial Analysis: models by intelligence, speed and price", "https://artificialanalysis.ai/models"),
  hfModelCards: d("Model cards (Hugging Face Hub docs)", "https://huggingface.co/docs/hub/model-cards"),

  // LLM APIs & orchestration
  claudeMessages: d("Using the Messages API (Claude docs)", "https://platform.claude.com/docs/en/build-with-claude/working-with-messages"),
  claudeToolUse: d("Tool use with Claude", "https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview"),
  claudeImplementTools: d("How to implement tool use (Claude docs)", "https://platform.claude.com/docs/en/agents-and-tools/tool-use/implement-tool-use"),
  claudeStreaming: d("Streaming messages (Claude docs)", "https://platform.claude.com/docs/en/build-with-claude/streaming"),
  claudeStructured: d("Structured outputs (Claude docs)", "https://platform.claude.com/docs/en/build-with-claude/structured-outputs"),
  claudeCaching: d("Prompt caching (Claude docs)", "https://platform.claude.com/docs/en/build-with-claude/prompt-caching"),
  claudePromptBest: d("Prompting best practices (Claude docs)", "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices"),
  claudePromptOverview: d("Prompt engineering overview (Claude docs)", "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview"),
  claudeSystemPrompts: d("Giving Claude a role with a system prompt", "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/system-prompts"),
  claudeVision: d("Vision (Claude docs)", "https://platform.claude.com/docs/en/build-with-claude/vision"),
  claudePdf: d("PDF support (Claude docs)", "https://platform.claude.com/docs/en/build-with-claude/pdf-support"),
  oaiStructured: d("Structured model outputs (OpenAI docs)", "https://developers.openai.com/api/docs/guides/structured-outputs"),
  oaiFunctions: d("Function calling (OpenAI docs)", "https://developers.openai.com/api/docs/guides/function-calling"),
  oaiStreaming: d("Streaming API responses (OpenAI docs)", "https://developers.openai.com/api/docs/guides/streaming-responses"),
  oaiVision: d("Images and vision (OpenAI docs)", "https://developers.openai.com/api/docs/guides/images-vision"),
  oaiRealtime: d("Realtime conversations (OpenAI docs)", "https://developers.openai.com/api/docs/guides/realtime-conversations"),
  oaiVoiceAgents: d("Voice agents (OpenAI docs)", "https://developers.openai.com/api/docs/guides/voice-agents"),
  oaiStt: d("Speech to text / file transcription (OpenAI docs)", "https://developers.openai.com/api/docs/guides/speech-to-text"),
  oaiAudio: d("Audio and voice (OpenAI docs)", "https://developers.openai.com/api/docs/guides/audio"),
  oaiRft: d("Reinforcement fine-tuning (OpenAI docs)", "https://developers.openai.com/api/docs/guides/reinforcement-fine-tuning"),
  oaiModelOpt: d("Model optimization: evals, fine-tuning, distillation (OpenAI docs)", "https://developers.openai.com/api/docs/guides/model-optimization"),
  lcQuickstart: d("LangChain quickstart", "https://docs.langchain.com/oss/python/langchain/quickstart"),
  lcStreaming: d("LangChain: Streaming", "https://docs.langchain.com/oss/python/langchain/streaming/overview"),
  lcSemanticSearch: d("Build a semantic search engine with LangChain", "https://docs.langchain.com/oss/python/langchain/knowledge-base"),
  lcProducts: d("Runtimes, frameworks, and harnesses (LangChain docs)", "https://docs.langchain.com/oss/python/concepts/products"),
  lgOverview: d("LangGraph overview", "https://docs.langchain.com/oss/python/langgraph/overview"),
  lgThinking: d("Thinking in LangGraph", "https://docs.langchain.com/oss/python/langgraph/thinking-in-langgraph"),
  lgPersistence: d("LangGraph: Persistence", "https://docs.langchain.com/oss/python/langgraph/persistence"),
  lgInterrupts: d("LangGraph: Interrupts (human-in-the-loop)", "https://docs.langchain.com/oss/python/langgraph/interrupts"),
  lcAcademyLanggraph: c("Introduction to LangGraph (LangChain Academy, free)", "https://academy.langchain.com/courses/intro-to-langgraph"),
  lcAcademyResearch: c("Deep Research with LangGraph (LangChain Academy)", "https://academy.langchain.com/courses/deep-research-with-langgraph"),
  liRag: d("LlamaIndex: Introduction to RAG", "https://developers.llamaindex.ai/python/framework/understanding/rag/"),
  liConcepts: d("LlamaIndex: High-level concepts", "https://developers.llamaindex.ai/python/framework/getting_started/concepts/"),
  liRagScratch: d("LlamaIndex: Building RAG from scratch", "https://developers.llamaindex.ai/python/framework/optimizing/building_rag_from_scratch/"),
  dspy: d("DSPy overview", "https://dspy.ai/current/"),
  dspyProgram: d("DSPy: Program, don't prompt", "https://dspy.ai/current/getting-started/program-dont-prompt/"),
  chipLlmProd: a("Building LLM applications for production (Chip Huyen)", "https://huyenchip.com/2023/04/11/llm-engineering.html"),
  chipPlatform: a("Building a generative AI platform (Chip Huyen)", "https://huyenchip.com/2024/07/25/genai-platform.html"),
  chipPitfalls: a("Common pitfalls when building generative AI applications (Chip Huyen)", "https://huyenchip.com/2025/01/16/ai-engineering-pitfalls.html"),
  chipAgents: a("Agents (Chip Huyen)", "https://huyenchip.com/2025/01/07/agents.html"),
  chipMlops: a("MLOps guide (Chip Huyen)", "https://huyenchip.com/mlops/"),
  chipInterviews: a("Machine Learning Interviews Book (Chip Huyen)", "https://huyenchip.com/ml-interviews-book/"),
  eugenePatterns: a("Patterns for building LLM-based systems & products (Eugene Yan)", "https://eugeneyan.com/writing/llm-patterns/"),
  eugeneEvalProcess: a("An LLM-as-judge won't save the product (Eugene Yan)", "https://eugeneyan.com/writing/eval-process/"),
  lilianPrompt: a("Prompt Engineering (Lilian Weng)", "https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/"),
  lilianAgents: a("LLM Powered Autonomous Agents (Lilian Weng)", "https://lilianweng.github.io/posts/2023-06-23-agent/"),
  lilianRewardHacking: a("Reward Hacking in Reinforcement Learning (Lilian Weng)", "https://lilianweng.github.io/posts/2024-11-28-reward-hacking/"),
  lilianHarness: a("Harness Engineering for Self-Improvement (Lilian Weng)", "https://lilianweng.github.io/posts/2026-07-04-harness/"),

  // Retrieval
  ragPaper: p("Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", "https://arxiv.org/abs/2005.11401"),
  ragSurvey: p("Retrieval-Augmented Generation for Large Language Models: A Survey", "https://arxiv.org/pdf/2312.10997"),
  selfRag: p("Self-RAG: Learning to Retrieve, Generate, and Critique", "https://arxiv.org/pdf/2310.11511"),
  crag: p("Corrective Retrieval Augmented Generation (CRAG)", "https://arxiv.org/html/2401.15884"),
  hyde: p("Precise Zero-Shot Dense Retrieval without Relevance Labels (HyDE)", "https://arxiv.org/abs/2212.10496"),
  graphrag: r("microsoft/graphrag", "https://github.com/microsoft/graphrag"),
  pgvector: r("pgvector/pgvector", "https://github.com/pgvector/pgvector"),
  qdrantDocs: d("Qdrant documentation", "https://qdrant.tech/documentation/"),
  qdrantHybridArticle: a("Hybrid search in Qdrant", "https://qdrant.tech/articles/hybrid-search/"),
  qdrantHybridDocs: d("Qdrant: Hybrid search", "https://qdrant.tech/documentation/search/text-search/hybrid-search/"),
  qdrantFiltering: a("Filtering in vector search: when to use what (Qdrant)", "https://qdrant.tech/articles/vector-search-filtering/"),
  sbert: d("Sentence Transformers documentation", "https://sbert.net/"),
  sbertSemantic: d("Sentence Transformers: Semantic search", "https://sbert.net/examples/sentence_transformer/applications/semantic-search/README.html"),
  sbertRerank: d("Sentence Transformers: Retrieve & re-rank", "https://sbert.net/examples/sentence_transformer/applications/retrieve_rerank/README.html"),
  sbertCross: d("Sentence Transformers: Cross-encoders", "https://www.sbert.net/examples/cross_encoder/applications/README.html"),
  mteb: a("MTEB: Massive Text Embedding Benchmark", "https://huggingface.co/blog/mteb"),
  pineconeRag: a("Retrieval Augmented Generation series (Pinecone)", "https://www.pinecone.io/learn/series/rag/"),
  pineconeRerank: a("Rerankers and two-stage retrieval (Pinecone)", "https://www.pinecone.io/learn/series/rag/rerankers/"),
  pineconeAdvanced: a("Advanced RAG techniques (Pinecone)", "https://www.pinecone.io/learn/advanced-rag-techniques/"),
  elasticRrf: d("Reciprocal rank fusion (Elasticsearch docs)", "https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion"),
  elasticHybrid: a("What is hybrid search? (Elastic)", "https://www.elastic.co/what-is/hybrid-search"),

  // Agents & context
  anthContext: a("Effective context engineering for AI agents (Anthropic)", "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents"),
  anthTools: a("Writing effective tools for AI agents (Anthropic)", "https://www.anthropic.com/engineering/writing-tools-for-agents"),
  anthHarness: a("Effective harnesses for long-running agents (Anthropic)", "https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents"),
  anthHarnessDesign: a("Harness design for long-running apps (Anthropic)", "https://anthropic.com/engineering/harness-design-long-running-apps"),
  anthMultiAgent: a("How we built our multi-agent research system (Anthropic)", "https://www.anthropic.com/engineering/multi-agent-research-system"),
  anthAgentSdk: a("Building agents with the Claude Agent SDK (Anthropic)", "https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk"),
  anthCodeExecMcp: a("Code execution with MCP (Anthropic)", "https://anthropic.com/engineering/code-execution-with-mcp"),
  mcpIntro: d("What is the Model Context Protocol?", "https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro"),
  mcpArch: d("MCP architecture overview", "https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture"),
  mcpSpec: d("MCP specification", "https://modelcontextprotocol.io/specification/2026-07-28"),
  mcpTools: d("MCP spec: Tools", "https://modelcontextprotocol.io/specification/2025-06-18/server/tools"),
  a2a: d("Agent2Agent (A2A) protocol specification", "https://a2a-protocol.org/latest/specification/"),
  react: p("ReAct: Synergizing Reasoning and Acting in Language Models", "https://arxiv.org/abs/2210.03629"),
  oaiAgentsSdk: d("OpenAI Agents SDK", "https://openai.github.io/openai-agents-python/"),
  adk: d("Agent Development Kit (Google ADK)", "https://adk.dev/"),
  adkMulti: d("ADK: Multi-agent workflows", "https://adk.dev/workflows/"),
  crewai: d("CrewAI introduction", "https://docs.crewai.com/en/introduction"),
  crewaiFlows: d("CrewAI: Flows", "https://docs.crewai.com/en/concepts/flows"),
  agnoAgents: d("Agno: What are agents?", "https://docs.agno.com/agents/overview"),
  agnoWorkflows: d("Agno: Workflows", "https://docs.agno.com/workflows/overview"),
  e2b: d("E2B sandbox quickstart", "https://docs.e2b.dev/quickstart"),
  modal: d("Modal guide", "https://modal.com/docs/guide"),

  // Evaluation
  deepevalIntro: d("Introduction to DeepEval", "https://deepeval.com/docs/introduction"),
  deepevalRag: d("DeepEval: RAG evaluation quickstart", "https://deepeval.com/docs/getting-started-rag"),
  deepevalTriad: d("DeepEval: Using the RAG triad", "https://deepeval.com/guides/guides-rag-triad"),
  deepevalMetrics: d("DeepEval: Introduction to LLM evaluation metrics", "https://deepeval.com/docs/metrics-introduction"),
  ragasMetrics: d("Ragas: Available metrics", "https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/"),
  ragasFaithfulness: d("Ragas: Faithfulness", "https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/faithfulness/"),
  hamelFaq: a("AI Evals: everything you need to know (Hamel Husain & Shreya Shankar)", "https://hamel.dev/blog/posts/evals-faq/"),
  hamelJudge: a("Using LLM-as-a-judge for evaluation (Hamel Husain)", "https://hamel.dev/blog/posts/llm-judge/"),
  hamelStart: a("Evals: getting started (Hamel Husain)", "https://hamel.dev/notes/llm/evals/start/new-to-evals/index.html"),
  langfuse: d("Langfuse documentation", "https://langfuse.com/docs"),
  langfuseTracing: d("Langfuse: LLM observability & tracing", "https://langfuse.com/docs/observability/overview"),
  langfusePrompts: d("Langfuse: Prompt management", "https://langfuse.com/docs/prompt-management/get-started"),
  langfuseLinkTraces: d("Langfuse: Link prompts to traces", "https://langfuse.com/docs/prompt-management/features/link-to-traces"),
  mlflowTracing: d("MLflow tracing for GenAI", "https://mlflow.org/docs/latest/genai/tracing/"),
  mlflowCost: d("MLflow: token usage and cost tracking", "https://mlflow.org/docs/latest/genai/tracing/token-usage-cost/"),
  mlflowStart: d("Getting started with MLflow for GenAI", "https://mlflow.org/docs/3.5.1/genai/getting-started/"),
  mlflowVersions: d("MLflow: version tracking for GenAI apps", "https://mlflow.org/docs/latest/genai/version-tracking/"),

  // Security & governance
  owaspTop10: d("OWASP Top 10 for LLM Applications 2025", "https://genai.owasp.org/resource/owasp-top-10-for-llm-applications-2025/"),
  owaspRisks: d("OWASP GenAI: LLM risks", "https://genai.owasp.org/llm-top-10/"),
  willisonTrifecta: a("The lethal trifecta (Simon Willison)", "https://simonwillison.net/2025/Aug/9/bay-area-ai/"),
  willisonRuleOfTwo: a("Agents Rule of Two and The Attacker Moves Second (Simon Willison)", "https://simonwillison.net/2025/Nov/2/new-prompt-injection-papers/"),
  nemoGuardrails: d("NeMo Guardrails overview", "https://docs.nvidia.com/nemo/guardrails/latest/index.html"),
  guardrailsAi: d("Guardrails AI: Validators", "https://guardrailsai.com/guardrails/docs/concepts/validators"),
  presidio: r("microsoft/presidio (PII detection & anonymization)", "https://github.com/microsoft/presidio"),
  garak: r("NVIDIA/garak (LLM vulnerability scanner)", "https://github.com/NVIDIA/garak"),
  euAiAct: a("EU AI Act: high-level summary", "https://artificialintelligenceact.eu/high-level-summary/"),
  dpdp: d("Digital Personal Data Protection Act, 2023 (MeitY, PDF)", "https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf"),

  // Production & platforms
  codedeploy: d("What is CodeDeploy? (AWS)", "https://docs.aws.amazon.com/codedeploy/latest/userguide/welcome.html"),
  codedeployAsg: d("CodeDeploy with EC2 Auto Scaling (AWS)", "https://docs.aws.amazon.com/codedeploy/latest/userguide/integrations-aws-auto-scaling.html"),
  promGrafana: d("Grafana support for Prometheus", "https://prometheus.io/docs/visualization/grafana/"),
  grafanaPromStart: d("Get started with Grafana and Prometheus", "https://grafana.com/docs/grafana/latest/fundamentals/getting-started/first-dashboards/get-started-grafana-prometheus/"),
  grafanaIntroProm: d("What is Prometheus? (Grafana docs)", "https://grafana.com/docs/grafana/latest/fundamentals/intro-to-prometheus/"),
  streamlitChat: d("Build a basic LLM chat app (Streamlit)", "https://docs.streamlit.io/develop/tutorials/chat-and-llm-apps/build-conversational-apps"),
  streamlitWriteStream: d("st.write_stream (Streamlit)", "https://docs.streamlit.io/develop/api-reference/write-magic/st.write_stream"),
  bedrock: d("What is Amazon Bedrock?", "https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html"),
  bedrockConverse: d("Amazon Bedrock: Converse API", "https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html"),
  bedrockEndpoints: d("Amazon Bedrock: inference endpoints", "https://docs.aws.amazon.com/bedrock/latest/userguide/endpoints.html"),
  vertex: d("Vertex AI generative AI overview", "https://docs.cloud.google.com/vertex-ai/generative-ai/docs/learn/overview"),
  foundry: d("What is Microsoft Foundry?", "https://learn.microsoft.com/en-us/azure/ai-foundry/what-is-azure-ai-foundry"),
  azureAiArch: d("Get started with AI architecture design (Azure)", "https://learn.microsoft.com/en-us/azure/architecture/ai-ml/ai-get-started"),
  vllmLora: d("vLLM: LoRA adapters", "https://docs.vllm.ai/en/latest/features/lora/"),
  litellmRouting: d("LiteLLM: Router & load balancing", "https://docs.litellm.ai/docs/routing"),
  litellmFallbacks: d("LiteLLM: Fallbacks (provider failover)", "https://docs.litellm.ai/docs/proxy/reliability"),
  litellmBudgets: d("LiteLLM: Budgets & rate limits", "https://docs.litellm.ai/docs/proxy/users"),
  openrouter: d("OpenRouter quickstart", "https://openrouter.ai/docs/quickstart"),
  openrouterRouting: d("OpenRouter: Provider routing", "https://openrouter.ai/docs/guides/routing/provider-selection"),
  hfHub: d("Hugging Face Hub documentation", "https://huggingface.co/docs/hub/index"),
  tgi: d("Text Generation Inference (Hugging Face)", "https://huggingface.co/docs/text-generation-inference/index"),

  // Fine-tuning
  trlQuickstart: d("TRL quickstart", "https://huggingface.co/docs/trl/quickstart"),
  trlPeft: d("TRL: PEFT integration", "https://huggingface.co/docs/trl/peft_integration"),
  trlMemory: d("TRL: Reducing memory usage", "https://huggingface.co/docs/trl/reducing_memory_usage"),
  peftLora: d("PEFT: LoRA", "https://huggingface.co/docs/peft/en/package_reference/lora"),
  unsloth: d("Unsloth: Fine-tuning LLMs guide", "https://unsloth.ai/docs/get-started/fine-tuning-llms-guide"),
  unslothLora: d("Unsloth: LoRA hyperparameters guide", "https://unsloth.ai/docs/get-started/fine-tuning-llms-guide/lora-hyperparameters-guide"),
  axolotl: d("Axolotl documentation", "https://docs.axolotl.ai/"),
  axolotlChoosing: d("Axolotl: Which fine-tuning method should I use?", "https://docs.axolotl.ai/docs/choosing_method.html"),
  loraPaper: p("LoRA: Low-Rank Adaptation of Large Language Models", "https://arxiv.org/abs/2106.09685"),
  qloraPaper: p("QLoRA: Efficient Finetuning of Quantized LLMs", "https://arxiv.org/abs/2305.14314"),
  dpoPaper: p("Direct Preference Optimization", "https://arxiv.org/abs/2305.18290"),

  // Multimodal
  whisperCard: r("openai/whisper model card", "https://github.com/openai/whisper/blob/main/model-card.md"),
  whisperPaper: p("Robust Speech Recognition via Large-Scale Weak Supervision (Whisper)", "https://arxiv.org/pdf/2212.04356"),
  whisperCpp: r("ggml-org/whisper.cpp", "https://github.com/ggml-org/whisper.cpp"),
  kokoro: r("hexgrad/kokoro (TTS)", "https://github.com/hexgrad/kokoro"),
  sileroVad: r("snakers4/silero-vad", "https://github.com/snakers4/silero-vad"),
  clipPaper: p("Learning Transferable Visual Models From Natural Language Supervision (CLIP)", "https://arxiv.org/pdf/2103.00020"),
  colpali: p("ColPali: Efficient Document Retrieval with Vision Language Models", "https://arxiv.org/html/2407.01449v5"),
  diffusers: d("Diffusers documentation", "https://huggingface.co/docs/diffusers/index"),
  diffusersInpaint: d("Diffusers: Inpainting", "https://huggingface.co/docs/diffusers/using-diffusers/inpaint"),
  hfStableDiffusion: c("Introduction to Stable Diffusion (HF computer vision course)", "https://huggingface.co/learn/computer-vision-course/unit5/generative-models/diffusion-models/stable-diffusion"),
  illustratedSd: a("The Illustrated Stable Diffusion (Jay Alammar)", "https://jalammar.github.io/illustrated-stable-diffusion/"),
  livekitAgents: d("LiveKit Agents", "https://docs.livekit.io/agents/"),
  // New in the resource re-check (verified 2026-10-21)
  tiktoken: r("openai/tiktoken (fast BPE tokenizer)", "https://github.com/openai/tiktoken"),
  oaiBatch: d("Batch API (OpenAI docs)", "https://developers.openai.com/api/docs/guides/batch"),
  claudeBatch: d("Batch processing (Claude docs)", "https://platform.claude.com/docs/en/build-with-claude/batch-processing"),
  oaiCaching: d("Prompt caching (OpenAI docs)", "https://developers.openai.com/api/docs/guides/prompt-caching"),
  ghPython: d("Building and testing Python (GitHub Actions)", "https://docs.github.com/en/actions/tutorials/build-and-test-code/python"),
  trlGrpo: d("TRL: GRPO trainer", "https://huggingface.co/docs/trl/grpo_trainer"),
  trlGkd: d("TRL: Generalized knowledge distillation trainer", "https://huggingface.co/docs/trl/gkd_trainer"),
  ghProfileReadme: d("Managing your GitHub profile README", "https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme"),
} satisfies Record<string, Entry>;

type Key = keyof typeof LIBRARY;

/** module id -> library keys (2-5 each); a YouTube search link is appended to every module. */
export const MAP: Record<string, Key[]> = {
  "M0.1": ["cxPython", "pyAsyncioHowto", "uv", "pytest", "pydanticModels"],
  "M0.2": ["mdnHttp", "mdnMessages", "mdnHttpRef", "cxFlask"],
  "M0.3": ["fastapiTutorial", "fastapiResponseModel", "pydanticModels", "cxFastapi"],
  "M0.4": ["pgTutorial", "pgSqlIntro", "fastapiSql", "cxSql"],
  "M0.5": ["proGit", "gitLearn", "cxGit"],
  "M0.6": ["claudeCode", "claudeCodeBest", "claudeCodeExtend", "claudeMd", "cxClaudeCode"],
  "M0.7": ["dockerStart", "dockerWorkshop", "uvDocker", "cxDocker"],
  "M0.8": ["fastapiTemplate", "fastapiTestingDb", "composeQuickstart", "claudeCodeBest"],

  "M1.1": ["karpathyIntro", "b3MiniLlm", "rm100LlmFund"],
  "M1.2": ["karpathyTokenizer", "hfTokenizers", "tiktoken"],
  "M1.3": ["b3GPT", "b3Attention", "illustratedTransformer", "karpathyGpt"],
  "M1.4": ["karpathyDeepDive", "instructGpt", "hfLlmCourse"],
  "M1.5": ["karpathyDeepDive", "hfPipeline", "chipSampling"],
  "M1.6": ["chipSampling", "hfPipeline", "karpathyDeepDive"],
  "M1.7": ["claudeThinking", "lilianThinking", "chipSampling"],
  "M1.8": ["claudeContext", "lostMiddle", "anthContext"],
  "M1.9": ["lilianHallucination", "chipPitfalls", "karpathyIntro"],
  "M1.10": ["claudeModels", "hfModelCards", "aaModels"],
  "M1.11": ["aaLeaderboard", "mteb", "chipPitfalls"],
  "M1.12": ["aaModels", "claudeModels", "hfModelCards"],

  "M2.1": ["claudeMessages", "oaiFunctions", "rm100Apis", "cxGenaiOpenSource"],
  "M2.2": ["claudeStreaming", "oaiStreaming", "lcStreaming"],
  "M2.3": ["lcQuickstart", "cxLangchainIntro", "cxLangchainComponents", "cxGenaiLangchain"],
  "M2.4": ["claudeStructured", "oaiStructured", "pydanticModels"],
  "M2.5": ["claudeToolUse", "claudeImplementTools", "oaiFunctions"],
  "M2.6": ["anthTools", "claudeImplementTools", "oaiFunctions"],
  "M2.7": ["eugenePatterns", "chipLlmProd", "lgThinking"],
  "M2.8": ["pyAsyncioTasks", "pyAsyncioHowto", "oaiBatch", "claudeBatch"],
  "M2.9": ["litellmFallbacks", "chipPlatform", "pyAsyncioTasks"],
  "M2.10": ["langfuseTracing", "mlflowCost", "mlflowTracing"],
  "M2.11": ["liConcepts", "lgOverview", "dspyProgram", "lcProducts"],
  "M2.12": ["claudeToolUse", "lcStreaming", "langfuseTracing"],

  "M3.1": ["claudePromptOverview", "claudePromptBest", "rm100Prompt"],
  "M3.2": ["lilianPrompt", "claudePromptBest", "cxPrompt"],
  "M3.3": ["lilianPrompt", "claudeThinking", "lilianThinking"],
  "M3.4": ["claudeSystemPrompts", "claudePromptBest", "lilianPrompt"],
  "M3.5": ["claudeStructured", "oaiStructured", "claudePromptBest"],
  "M3.6": ["hamelStart", "hamelFaq", "eugenePatterns"],
  "M3.7": ["claudeCaching", "langfusePrompts", "mlflowVersions", "oaiCaching"],
  "M3.8": ["willisonTrifecta", "owaspTop10", "willisonRuleOfTwo", "owaspRisks"],
  "M3.9": ["hamelStart", "langfusePrompts", "mlflowStart"],

  "M4.1": ["liConcepts", "pineconeRag", "claudePdf"],
  "M4.2": ["pineconeRag", "liRagScratch", "lcSemanticSearch"],
  "M4.3": ["sbert", "mteb", "illustratedTransformer"],
  "M4.4": ["sbertSemantic", "sbert", "lcSemanticSearch"],
  "M4.5": ["pgvector", "qdrantDocs", "qdrantFiltering"],
  "M4.6": ["elasticRrf", "elasticHybrid", "qdrantHybridArticle", "qdrantHybridDocs"],
  "M4.7": ["qdrantHybridDocs", "pgvector", "elasticRrf"],
  "M4.8": ["ragPaper", "pineconeRag", "cxAdvancedRag", "rm100Rag"],
  "M4.9": ["liRagScratch", "lcSemanticSearch", "ragSurvey"],
  "M4.10": ["pineconeRerank", "sbertRerank", "sbertCross"],
  "M4.11": ["hyde", "pineconeAdvanced", "elasticRrf"],
  "M4.12": ["claudePdf", "lilianHallucination", "ragasFaithfulness"],
  "M4.13": ["selfRag", "crag", "graphrag", "ragSurvey"],
  "M4.14": ["liRag", "lcSemanticSearch", "liConcepts"],
  "M4.15": ["deepevalRag", "fastapiTutorial", "pineconeAdvanced"],

  "M5.1": ["chipAgents", "lilianAgents", "rm100Agents"],
  "M5.2": ["react", "lilianAgents", "chipAgents"],
  "M5.3": ["anthTools", "claudeToolUse", "claudeImplementTools", "mcpTools"],
  "M5.4": ["mcpIntro", "mcpArch", "mcpSpec", "mcpTools", "cxMcp"],
  "M5.5": ["lgPersistence", "lilianAgents", "anthContext"],
  "M5.6": ["anthMultiAgent", "adkMulti", "a2a"],
  "M5.7": ["lgOverview", "lgPersistence", "lgInterrupts", "lcAcademyLanggraph", "cxLanggraph"],
  "M5.8": ["e2b", "modal", "anthCodeExecMcp"],
  "M5.9": ["lgInterrupts", "chipAgents", "anthAgentSdk"],
  "M5.10": ["oaiAgentsSdk", "adk", "crewai", "agnoAgents", "cxCrewai"],
  "M5.11": ["lcAcademyResearch", "anthMultiAgent", "mcpIntro"],

  "M6.1": ["anthContext", "lostMiddle", "claudeContext"],
  "M6.2": ["anthContext", "claudeContext", "lostMiddle"],
  "M6.3": ["anthContext", "lgPersistence", "anthHarness"],
  "M6.4": ["anthHarness", "lgPersistence", "anthContext"],
  "M6.5": ["lostMiddle", "claudeContext", "anthContext"],
  "M6.6": ["anthTools", "anthCodeExecMcp", "anthContext"],
  "M6.7": ["claudeCaching", "anthContext", "oaiCaching"],
  "M6.8": ["anthHarness", "anthHarnessDesign", "lilianHarness", "claudeCodeBest"],
  "M6.9": ["anthHarness", "anthContext", "anthHarnessDesign"],

  "M7.1": ["hamelFaq", "hamelStart", "chipPitfalls"],
  "M7.2": ["hamelJudge", "deepevalMetrics", "eugeneEvalProcess"],
  "M7.3": ["cxEvalPipelines", "langfuseTracing", "hamelFaq"],
  "M7.4": ["aaLeaderboard", "mteb", "chipPitfalls"],
  "M7.5": ["aaLeaderboard", "aaModels", "mteb"],
  "M7.6": ["aaModels", "hamelStart", "claudeCaching"],
  "M7.7": ["deepevalIntro", "mlflowStart", "ghActions"],
  "M7.8": ["deepevalRag", "deepevalTriad", "ragasMetrics", "ragasFaithfulness"],
  "M7.9": ["deepevalMetrics", "anthMultiAgent", "langfuseTracing"],

  "M8.1": ["owaspTop10", "willisonTrifecta", "willisonRuleOfTwo"],
  "M8.2": ["willisonTrifecta", "willisonRuleOfTwo", "owaspRisks"],
  "M8.3": ["nemoGuardrails", "guardrailsAi", "owaspTop10"],
  "M8.4": ["willisonRuleOfTwo", "e2b", "lgInterrupts"],
  "M8.5": ["owaspRisks", "willisonTrifecta", "qdrantFiltering"],
  "M8.6": ["presidio", "owaspTop10", "dpdp"],
  "M8.7": ["garak", "owaspTop10", "owaspRisks"],
  "M8.8": ["euAiAct", "dpdp", "hfModelCards"],
  "M8.9": ["garak", "presidio", "nemoGuardrails"],

  "M9.1": ["chipPlatform", "chipLlmProd", "chipBook", "rm100Prod"],
  "M9.2": ["eugenePatterns", "pineconeAdvanced", "graphrag"],
  "M9.3": ["litellmRouting", "openrouterRouting", "chipPlatform"],
  "M9.4": ["claudeStreaming", "chipPlatform", "pyAsyncioTasks"],
  "M9.5": ["claudeCaching", "chipPlatform", "eugenePatterns"],
  "M9.6": ["litellmFallbacks", "nemoGuardrails", "chipPlatform"],
  "M9.7": ["lgThinking", "eugenePatterns", "lgPersistence", "chipPlatform"],
  "M9.8": ["langfuseTracing", "hamelFaq", "eugeneEvalProcess"],
  "M9.9": ["anthMultiAgent", "chipPlatform", "chipBook"],
  "M9.10": ["chipPlatform", "eugenePatterns", "chipBook"],

  "M10.1": ["chipMlops", "chipPlatform", "rm100Prod"],
  "M10.2": ["mlflowVersions", "langfusePrompts", "chipLlmProd"],
  "M10.3": ["mlflowStart", "mlflowVersions", "langfusePrompts", "langfuseLinkTraces"],
  "M10.4": ["deepevalIntro", "deepevalMetrics", "ghActions"],
  "M10.5": ["guardrailsAi", "nemoGuardrails", "presidio"],
  "M10.6": ["fastapiTutorial", "mdnSse", "streamlitChat", "streamlitWriteStream", "composeQuickstart"],
  "M10.7": ["ghActions", "dockerStart", "ghPython"],
  "M10.8": ["codedeploy", "codedeployAsg", "bedrock"],
  "M10.9": ["grafanaPromStart", "promGrafana", "langfuseTracing"],
  "M10.10": ["chipMlops", "litellmFallbacks", "langfusePrompts"],
  "M10.11": ["ghActions", "codedeploy", "langfuse", "deepevalIntro"],

  "M11.1": ["bedrock", "vertex", "foundry"],
  "M11.2": ["bedrock", "bedrockConverse", "vertex", "foundry"],
  "M11.3": ["azureAiArch", "bedrockEndpoints", "litellmBudgets"],
  "M11.4": ["bedrockEndpoints", "dpdp", "euAiAct"],
  "M11.5": ["aaModels", "litellmBudgets", "bedrock"],
  "M11.6": ["hfHub", "tgi", "vllmLora", "modal"],
  "M11.7": ["litellmRouting", "litellmFallbacks", "openrouter", "openrouterRouting"],
  "M11.8": ["bedrock", "chipPlatform", "vertex"],
  "M11.9": ["litellmRouting", "chipPlatform", "openrouter", "litellmFallbacks"],
  "M11.10": ["bedrockConverse", "litellmFallbacks", "deepevalIntro"],

  "M12.1": ["oaiVision", "claudeVision", "oaiAudio"],
  "M12.2": ["claudeVision", "oaiVision", "clipPaper"],
  "M12.3": ["claudeVision", "lilianHallucination", "claudePdf"],
  "M12.4": ["claudePdf", "colpali", "oaiVision"],
  "M12.5": ["diffusers", "diffusersInpaint", "hfStableDiffusion", "illustratedSd"],
  "M12.6": ["whisperPaper", "oaiAudio", "whisperCard"],
  "M12.7": ["whisperCard", "oaiStt", "kokoro"],
  "M12.8": ["oaiRealtime", "oaiVoiceAgents", "livekitAgents", "sileroVad"],
  "M12.9": ["clipPaper", "sbert", "colpali"],
  "M12.10": ["aaModels", "oaiAudio", "claudeVision"],
  "M12.11": ["anthMultiAgent", "lcAcademyResearch", "anthHarness"],
  "M12.12": ["whisperCpp", "hfHub", "kokoro", "sileroVad"],
  "M12.13": ["livekitAgents", "claudePdf", "whisperCard"],

  "M13.1": ["oaiModelOpt", "axolotlChoosing", "rm100Prod"],
  "M13.2": ["unsloth", "trlQuickstart", "axolotl"],
  "M13.3": ["trlQuickstart", "unsloth", "trlMemory"],
  "M13.4": ["loraPaper", "qloraPaper", "peftLora", "unslothLora", "axolotl"],
  "M13.5": ["dpoPaper", "trlQuickstart", "instructGpt"],
  "M13.6": ["oaiRft", "lilianRewardHacking", "trlGrpo"],
  "M13.7": ["oaiModelOpt", "trlQuickstart", "trlGkd"],
  "M13.8": ["hamelFaq", "deepevalIntro", "oaiModelOpt"],
  "M13.9": ["vllmLora", "trlPeft", "litellmRouting"],
  "M13.10": ["unsloth", "vllmLora", "hamelFaq"],

  "M14.1": ["liRag", "fastapiTutorial", "deepevalRag"],
  "M14.2": ["claudeStructured", "claudeToolUse", "oaiStructured", "pydanticModels"],
  "M14.3": ["lcAcademyResearch", "lgOverview", "anthMultiAgent"],
  "M14.4": ["mcpIntro", "mcpTools", "mcpArch", "anthCodeExecMcp"],
  "M14.5": ["litellmFallbacks", "langfuseTracing", "litellmBudgets"],
  "M14.6": ["livekitAgents", "claudeVision", "oaiRealtime", "oaiVoiceAgents"],
  "M14.7": ["chipInterviews", "proGit", "ghProfileReadme"],

  "M15.1": ["chipInterviews", "cxInterview", "chipPlatform"],
  "M15.2": ["chipPlatform", "pineconeAdvanced", "deepevalRag"],
  "M15.3": ["chipAgents", "anthMultiAgent", "willisonRuleOfTwo"],
  "M15.4": ["axolotlChoosing", "oaiModelOpt", "vllmLora"],
  "M15.5": ["chipMlops", "litellmFallbacks", "langfuseTracing"],
  "M15.6": ["chipPlatform", "eugenePatterns", "chipBook"],
  "M15.7": ["aaLeaderboard", "hamelFaq", "eugenePatterns"],
  "M15.8": ["chipInterviews", "chipPitfalls", "chipLlmProd"],
  "M15.9": ["chipInterviews", "chipPitfalls"],
  "M15.10": ["chipInterviews", "chipPlatform", "cxInterview"],
};


export function buildResources(roadmap: Roadmap): ResourceMap {
  const out: ResourceMap = {};
  for (const level of roadmap.phases.flatMap((ph) => ph.levels)) {
    for (const m of level.modules) {
      const keys = MAP[m.id];
      if (!keys) throw new Error(`No resources mapped for ${m.id}`);
      const list: Resource[] = keys.map((k) => ({ ...LIBRARY[k] }));
      const title = m.title.replace(/^Capstone:\s*/i, "");
      list.push(youtubeSearch(`${title} ${m.isCapstone ? "project tutorial" : "explained"}`));
      if (list.length < 3 || list.length > 6) throw new Error(`${m.id} has ${list.length} resources (want 3-6)`);
      out[m.id] = list;
    }
  }
  return out;
}

async function main() {
  const root = path.resolve(__dirname, "..");
  const roadmap = JSON.parse(await readFile(path.join(root, "data", "roadmap.json"), "utf8")) as Roadmap;
  const resources = buildResources(roadmap);
  await writeFile(path.join(root, "data", "resources.json"), JSON.stringify(resources, null, 2) + "\n");
  const all = Object.values(resources).flat();
  const unique = new Set(all.map((x) => x.url));
  const search = all.filter((x) => x.searchLink);
  console.log(`modules=${Object.keys(resources).length} resources=${all.length} uniqueUrls=${unique.size} searchLinks=${search.length}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
