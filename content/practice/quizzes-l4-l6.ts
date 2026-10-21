import type { QuizSrc } from "./types";

export const QUIZZES_L4_L6: QuizSrc[] = [
  // M4.1 Ingestion
  ["M4.1", "e", "Why is preserving headings and tables during PDF extraction worth the effort?", "Structure gives chunks context and lets you split on meaningful boundaries", ["It makes files smaller", "Embedding models refuse unstructured text", "It removes the need for chunking"], "Flattened text loses which section a sentence belongs to, which hurts both chunking and retrieval."],
  ["M4.1", "m", "A source document is edited. What should a sound ingestion pipeline do?", "Detect the change (e.g. by content hash) and replace that document's old chunks and vectors", ["Append the new version and keep the old one", "Rebuild the whole index from scratch every time", "Nothing, embeddings update automatically"], "Stale chunks left in the index cause contradictory or outdated answers; track a stable document id and hash."],
  ["M4.1", "e", "What is a common cheap way to detect exact duplicate documents?", "Hash the normalized text and compare hashes", ["Compare file names", "Compare file sizes only", "Ask an LLM whether they match"], "A hash of normalized content catches exact duplicates in O(1) per document; near-duplicates need fuzzier methods like MinHash."],
  ["M4.1", "m", "Which metadata is most useful to store with every chunk?", "Source id, title or section, and a last-updated timestamp", ["Only the chunk's token count", "The embedding model's license", "Nothing, metadata slows retrieval"], "Metadata enables filtering, citations and freshness checks."],
  ["M4.1", "h", "A scanned PDF returns empty text from a text extractor. Why?", "The pages are images, so OCR is needed to get text", ["The PDF is encrypted with AES", "The extractor only reads DOCX", "Scanned PDFs store text in metadata"], "Scanned documents have no text layer; you must run OCR (or a vision model) first."],

  // M4.2 Chunking
  ["M4.2", "e", "Why are documents split into chunks before embedding?", "Embedding models have input limits, and smaller units retrieve more precisely", ["Vector databases cannot store long strings", "It makes the LLM respond faster by itself", "Chunks are required by the HTTP spec"], "One vector per huge document averages away meaning; chunks give focused, retrievable units."],
  ["M4.2", "m", "What does chunk overlap help with?", "Keeping information that straddles a boundary present in at least one chunk", ["Reducing index size", "Removing duplicate documents", "Making embeddings normalized"], "Overlap repeats a little text across neighbours so a sentence cut in half is still retrievable."],
  ["M4.2", "m", "What does a recursive character splitter do?", "Tries separators in order (paragraphs, then lines, then sentences) until pieces fit the size limit", ["Splits at a random position", "Embeds every character separately", "Splits only on page breaks"], "It prefers the largest natural boundary that keeps chunks under the limit."],
  ["M4.2", "h", "Very small chunks typically cause which problem?", "Precise matches that lack the surrounding context needed to answer", ["Index build failures", "Higher embedding dimensionality", "Fewer chunks in the index"], "Tiny chunks are precise but context-poor; a common fix is retrieving small chunks and expanding to their parent section."],
  ["M4.2", "m", "What is semantic chunking?", "Splitting where embedding similarity between adjacent sentences drops", ["Splitting every 512 tokens", "Splitting by file type", "Letting the vector DB choose boundaries"], "It places boundaries at topic shifts instead of fixed sizes, at extra compute cost."],

  // M4.3 Embeddings
  ["M4.3", "e", "What does a text embedding represent?", "A dense vector where semantically similar texts lie close together", ["A compressed copy of the text that can be decoded exactly", "A list of keywords", "A hash used for deduplication"], "Embeddings map meaning to geometry; they are not reversible compression."],
  ["M4.3", "m", "You switch embedding models. What must you do with the existing index?", "Re-embed the whole corpus, because vectors from different models are not comparable", ["Nothing, all embeddings share one space", "Only re-embed new documents", "Normalize old vectors and keep them"], "Each model defines its own vector space; mixing them makes similarity scores meaningless."],
  ["M4.3", "m", "Which is a sensible way to choose an embedding model?", "Evaluate candidates on your own queries and documents, using public leaderboards as a starting point", ["Always pick the largest dimension", "Use the model with the most downloads", "Use the same model as your chat LLM"], "Benchmarks like MTEB help shortlist, but domain data decides."],
  ["M4.3", "e", "Should queries and documents be embedded with the same model?", "Yes, unless the model explicitly provides paired query/document encoders", ["No, always use different models", "Only documents need embeddings", "Only queries need embeddings"], "Retrieval compares query and document vectors, so they must live in the same space."],
  ["M4.3", "h", "Some embedding models expect prefixes like \"query:\" and \"passage:\". What happens if you omit them?", "Retrieval quality usually drops because inputs differ from training", ["The API rejects the request", "Vectors become longer", "Nothing, prefixes are cosmetic"], "Instruction-tuned embedders were trained with those prefixes; follow the model card."],

  // M4.4 Similarity
  ["M4.4", "e", "For L2-normalized vectors, cosine similarity equals what?", "The dot product", ["Euclidean distance", "Zero", "The vector length"], "Cosine is dot product divided by the norms; with unit vectors the norms are 1."],
  ["M4.4", "m", "Which query is semantic search most likely to get wrong?", "An exact product code like \"ERR-4021\"", ["\"how do I reset my password\"", "\"refund policy for damaged items\"", "\"steps to cancel a subscription\""], "Embeddings blur rare exact tokens such as ids and codes; keyword search handles them better."],
  ["M4.4", "m", "Why can semantic search return a passage that sounds related but does not answer the question?", "Similarity measures topical closeness, not whether the passage contains the answer", ["The cosine formula is wrong", "Vectors were not sorted", "The database lost precision"], "Topically similar is not the same as relevant; reranking helps."],
  ["M4.4", "e", "Building semantic search from scratch, what is the core operation per query?", "Embed the query and rank stored vectors by similarity", ["Train a new model on the query", "Run a SQL LIKE search", "Tokenize documents again"], "Embed, compare, sort, take top-k."],
  ["M4.4", "h", "Euclidean distance and cosine give the same ranking when…", "All vectors are normalized to unit length", ["Vectors have more than 100 dimensions", "Never", "Only for binary vectors"], "For unit vectors, ||a-b||² = 2 - 2·cos(a,b), so the orderings match."],

  // M4.5 Vector DBs
  ["M4.5", "e", "Why do vector databases use approximate nearest neighbour (ANN) search?", "Exact search over millions of vectors is too slow, so they trade a little recall for speed", ["Exact search is mathematically impossible", "ANN gives perfect recall", "It reduces embedding size"], "ANN indexes like HNSW answer in sub-linear time with high but not perfect recall."],
  ["M4.5", "m", "What is HNSW?", "A multi-layer proximity graph searched greedily from coarse to fine layers", ["A hash table of vectors", "A clustering algorithm that needs labels", "A compression codec"], "Hierarchical Navigable Small World graphs give fast, high-recall search at the cost of memory."],
  ["M4.5", "m", "How does an IVF index speed up search?", "It clusters vectors and only searches the nearest clusters (nprobe)", ["It sorts vectors alphabetically", "It stores vectors on GPU only", "It removes duplicate vectors"], "Inverted file indexes partition space; more probes means better recall but slower queries."],
  ["M4.5", "h", "A strict metadata filter makes ANN search return fewer than k results. Why?", "Post-filtering removes candidates after the ANN step, leaving too few matches", ["The filter corrupts the index", "k is ignored with filters", "Vectors are deleted by the filter"], "Engines handle this with pre-filtering or filtered graph traversal; check how yours works."],
  ["M4.5", "e", "pgvector adds vector search to which database?", "PostgreSQL", ["MongoDB", "Redis", "SQLite"], "pgvector is a Postgres extension supporting exact and HNSW/IVFFlat indexes."],

  // M4.6 Hybrid
  ["M4.6", "e", "BM25 is an example of what kind of retrieval?", "Sparse lexical retrieval based on term frequency and inverse document frequency", ["Dense neural retrieval", "Graph traversal", "Reranking with a cross-encoder"], "BM25 scores exact term overlap with TF saturation and length normalization."],
  ["M4.6", "m", "In Reciprocal Rank Fusion, what is a document's score?", "The sum over result lists of 1 / (k + rank)", ["The product of raw similarity scores", "The maximum BM25 score", "The average embedding norm"], "RRF uses ranks only, so it fuses lists with incompatible score scales; k is commonly 60."],
  ["M4.6", "m", "Why fuse by rank instead of adding BM25 and cosine scores?", "The two scores are on different, unnormalized scales", ["Ranks are always more accurate", "Scores cannot be stored", "Adding scores is too slow"], "BM25 is unbounded while cosine is in [-1, 1]; rank fusion sidesteps calibration."],
  ["M4.6", "e", "When does hybrid retrieval help most?", "When queries mix natural language with exact terms like names, codes or acronyms", ["When the corpus has one document", "When all queries are paraphrases", "Never, dense always wins"], "Dense captures meaning; sparse catches exact tokens. Together they cover each other's gaps."],
  ["M4.6", "h", "What does IDF do in BM25?", "Weights rare terms higher than common ones", ["Normalizes document length", "Caps term frequency", "Removes stop words"], "Inverse document frequency rewards terms that are distinctive across the corpus."],

  // M4.7 Capstone hybrid search
  ["M4.7", "m", "How should you prove your hybrid engine beats dense-only?", "Measure recall@k or MRR on a labeled query set for dense, BM25 and hybrid", ["Show a few good examples", "Compare index sizes", "Measure only latency"], "A small labeled set with standard metrics makes the comparison honest."],
  ["M4.7", "e", "What does recall@10 measure?", "The share of relevant documents that appear in the top 10 results", ["How fast the top 10 return", "How many queries returned 10 results", "Precision of the first result"], "Recall@k asks whether the relevant items were found at all within k."],
  ["M4.7", "m", "What does MRR reward?", "Placing the first relevant result as high as possible", ["Returning many results", "Low latency", "Diversity of results"], "Mean Reciprocal Rank averages 1/rank of the first relevant hit."],
  ["M4.7", "e", "Which belongs in a minimal search API response?", "Ranked results with ids, snippets, scores and source metadata", ["Only the top document's full text", "The raw embeddings", "The BM25 index"], "Clients need enough to display, cite and debug results."],
  ["M4.7", "h", "Your hybrid search is slower than dense-only. A reasonable fix is…", "Run dense and BM25 queries in parallel and fuse the results", ["Remove the BM25 index", "Increase k to 1000", "Re-embed every query twice"], "The two retrievers are independent, so their latency overlaps when run concurrently."],

  // M4.8 RAG architecture
  ["M4.8", "e", "What are the core stages of a RAG pipeline?", "Retrieve relevant context, augment the prompt, generate an answer", ["Fine-tune, deploy, monitor", "Tokenize, train, evaluate", "Scrape, label, cluster"], "RAG grounds generation in retrieved evidence at query time."],
  ["M4.8", "m", "When is RAG a poor choice?", "When the task needs a new skill or style rather than access to facts", ["When knowledge changes often", "When answers need citations", "When documents are private"], "RAG supplies knowledge; behaviour or format changes are better handled by prompting or fine-tuning."],
  ["M4.8", "m", "The right passage was retrieved but the answer is wrong. What kind of failure is this?", "A generation failure", ["A retrieval failure", "An ingestion failure", "An embedding failure"], "Separating retrieval from generation failures tells you which stage to fix."],
  ["M4.8", "e", "Which problem does RAG directly address?", "Answering from private or recent information the model was not trained on", ["Slow tokenization", "Model weight size", "GPU memory limits"], "Retrieval injects current, domain-specific evidence."],
  ["M4.8", "h", "The corpus is 20 pages and rarely changes. What is a simpler alternative to RAG?", "Put the whole corpus in the prompt, ideally with prompt caching", ["Fine-tune a model on it", "Build a knowledge graph", "Train an embedding model"], "If it fits in context cheaply, retrieval adds complexity without benefit."],

  // M4.9 Baseline RAG
  ["M4.9", "e", "What instruction helps keep answers grounded?", "Answer only from the provided context and say when it is insufficient", ["Be as creative as possible", "Ignore the context if you know better", "Always give a confident answer"], "Explicit grounding and abstention instructions reduce hallucination."],
  ["M4.9", "m", "What usually happens as you raise k from 3 to 30?", "Recall rises but more noise enters the prompt, raising cost and sometimes lowering answer quality", ["Answers always improve", "Latency falls", "Nothing changes"], "More context is not free; tune k against your eval set."],
  ["M4.9", "m", "Why label each retrieved chunk with an id in the prompt?", "So the model can cite which source supports each claim", ["To make chunks shorter", "Because LLMs need numbered lists", "To improve embedding quality"], "Ids enable citations and make debugging easier."],
  ["M4.9", "h", "Why might chunk order in the prompt matter?", "Models attend unevenly across long contexts, often using the start and end best", ["Order changes the embedding", "Order changes token count", "It does not matter at all"], "Lost-in-the-middle effects mean the most relevant chunks are best placed early or late."],
  ["M4.9", "e", "Retrieval returns nothing relevant. What should the system do?", "Say it cannot find the answer, or ask a clarifying question", ["Answer from general knowledge without saying so", "Return a random document", "Crash"], "Graceful abstention is better than a confident hallucination."],

  // M4.10 Reranking
  ["M4.10", "e", "What is the typical reranking pattern?", "Retrieve a broad candidate set, rerank with a stronger model, keep the top few", ["Rerank the whole corpus", "Rerank before retrieving", "Rerank only the first result"], "Cheap recall first, expensive precision second."],
  ["M4.10", "m", "How does a cross-encoder differ from a bi-encoder?", "It reads the query and document together, which is more accurate but cannot be precomputed", ["It embeds them separately and compares vectors", "It is faster than a bi-encoder", "It only works on images"], "Cross-encoders score each pair jointly, so they are used on tens of candidates, not millions."],
  ["M4.10", "m", "What is the main cost of adding a reranker?", "Extra latency per query", ["Larger vector index", "Re-embedding the corpus", "Less recall"], "Reranking 50 candidates adds a model call; measure the latency against the gain."],
  ["M4.10", "h", "When does reranking add little?", "When the first-stage retriever already puts the right passages in the top few", ["When the corpus is large", "When queries are ambiguous", "When using BM25"], "If precision at the top is already high, there is little left to fix."],
  ["M4.10", "e", "Reranking can only reorder which documents?", "Those the first-stage retriever returned", ["Any document in the corpus", "Documents it generates", "Only the top-1 result"], "A reranker cannot recover a document that was never retrieved, so first-stage recall still matters."],

  // M4.11 Query transformation
  ["M4.11", "e", "What is HyDE?", "Generating a hypothetical answer and embedding it to search", ["A hybrid dense encoder", "A hashing scheme for deduplication", "A reranking model"], "A fake answer often looks more like real passages than the short question does."],
  ["M4.11", "m", "What does RAG-Fusion do?", "Generates several query variants, retrieves for each and merges results with RRF", ["Fuses two LLMs into one", "Combines chunks into a single document", "Fine-tunes the retriever"], "Multiple phrasings improve recall; RRF merges the ranked lists."],
  ["M4.11", "m", "What is the main cost of multi-query transformation?", "Extra LLM calls and retrieval round trips, adding latency and tokens", ["Re-indexing the corpus", "Lower recall", "Larger embeddings"], "Each rewrite costs a model call and a search."],
  ["M4.11", "h", "In a chat, a user asks \"what about the second one?\". Which transformation helps?", "Rewrite the question into a standalone query using conversation history", ["HyDE with no history", "Reranking", "Lowering k"], "Follow-ups lack context; condensing them into standalone queries fixes retrieval."],
  ["M4.11", "e", "When should you skip query transformation?", "When queries are already clear and baseline retrieval performs well", ["Always skip it", "Never skip it", "Only on weekends"], "Measure first; transformation adds cost that must earn its keep."],

  // M4.12 Grounding
  ["M4.12", "e", "What does abstention mean in RAG?", "Declining to answer when the evidence does not support an answer", ["Refusing all questions", "Retrieving zero documents", "Removing citations"], "Saying \"I don't know\" on weak evidence protects user trust."],
  ["M4.12", "m", "Why are citations not proof of grounding?", "A model can cite a source that does not actually support the claim", ["Citations are always fabricated", "Citations slow responses", "Users ignore citations"], "You must check that the cited text entails the claim."],
  ["M4.12", "m", "How can you verify that a claim is supported by its cited chunk?", "Check entailment with an NLI model or an LLM judge against the chunk text", ["Check the chunk length", "Check that the citation id exists", "Count matching words only"], "Existence of a citation is not support; entailment checks are."],
  ["M4.12", "h", "Why keep evidence and synthesis visibly distinct in an answer?", "So users can tell what the sources say from what the model inferred", ["It reduces tokens", "It improves retrieval", "It is required by HTTP"], "Separating quotes or facts from interpretation makes errors easier to spot."],
  ["M4.12", "e", "A good grounded answer to a question the sources only partly cover should…", "Answer the covered part and say what is missing", ["Fill the gaps with guesses", "Refuse entirely", "Ignore the question"], "Partial answers with explicit gaps are honest and still useful."],

  // M4.13 RAG variants
  ["M4.13", "m", "What does CRAG (Corrective RAG) add?", "An evaluator that grades retrieved documents and triggers corrective actions such as web search", ["A graph database", "Fine-tuning of the generator", "Larger chunks"], "CRAG checks retrieval quality and falls back when it is poor."],
  ["M4.13", "m", "What is distinctive about Self-RAG?", "The model decides when to retrieve and critiques its own output with reflection tokens", ["It retrieves on every token", "It never retrieves", "It uses only BM25"], "Self-RAG trains the model to emit retrieval and critique signals."],
  ["M4.13", "e", "Multi-hop RAG is needed when…", "The answer requires combining facts found in different documents", ["The corpus is small", "Queries are single keywords", "Documents are images"], "Each hop's result informs the next query."],
  ["M4.13", "m", "When is Graph RAG especially useful?", "For questions about relationships or themes across many entities and documents", ["For exact keyword lookup", "For single-fact lookups in one document", "For image search"], "Graph structures capture connections that independent chunks miss."],
  ["M4.13", "h", "How should you choose an advanced RAG pattern?", "By the failure mode your evals reveal, not by novelty", ["By the newest paper", "By the most GitHub stars", "Use all of them together"], "Each pattern fixes a specific weakness and adds cost."],

  // M4.14 Frameworks
  ["M4.14", "e", "In LlamaIndex, what does a query engine do?", "Combines retrieval and response synthesis to answer a query over an index", ["Trains embeddings", "Stores raw files", "Serves the web UI"], "Query engines wrap retrievers plus an LLM response step."],
  ["M4.14", "m", "Why build RAG by hand before using a framework?", "So you understand what the abstractions hide and can debug them", ["Frameworks are slower in all cases", "Frameworks cannot do retrieval", "It is required for deployment"], "Knowing the pipeline makes framework defaults visible and changeable."],
  ["M4.14", "m", "A common risk of framework defaults is…", "Hidden prompts, chunk sizes or k values that do not suit your data", ["They refuse to run", "They always use GPUs", "They delete your index"], "Inspect and override defaults rather than trusting them."],
  ["M4.14", "e", "In LangChain, what does a retriever return?", "A list of relevant documents for a query", ["A final answer", "An embedding model", "A vector index file"], "Retrievers take a query and return Documents; chains use them downstream."],
  ["M4.14", "h", "When is hand-built RAG preferable to a framework?", "When you need tight control over every step and the pipeline is simple", ["Never", "Only for prototypes", "When using more than one LLM"], "Frameworks speed up common cases; hand-built code wins on control and transparency."],

  // M4.15 Capstone advanced RAG
  ["M4.15", "m", "What makes \"one real improvement\" over the baseline credible?", "A before-and-after measurement on the same eval set", ["A new framework", "A longer prompt", "A screenshot"], "Improvements must be measured, not asserted."],
  ["M4.15", "e", "Which per-request metrics should a deployed RAG app track?", "Latency, token usage and cost", ["Only uptime", "Only the number of documents", "GPU temperature"], "These drive user experience and budget."],
  ["M4.15", "m", "What does degrading gracefully on weak evidence look like?", "Telling the user the evidence is thin and showing what was found", ["Returning a 500 error", "Making up an answer", "Silently returning nothing"], "Graceful degradation keeps trust when retrieval is weak."],
  ["M4.15", "h", "Where is per-request cost easiest to compute?", "From the token counts the LLM API returns in each response", ["From monthly invoices only", "From the vector DB", "From the user's browser"], "Usage fields give input and output tokens; multiply by price."],
  ["M4.15", "e", "Why log retrieved chunk ids for each answer?", "To debug bad answers and trace them to specific sources", ["To train the LLM", "To reduce latency", "To compress logs"], "Traces make failures reproducible."],

  // M5.1 Agents
  ["M5.1", "e", "What defines an agent compared to a fixed workflow?", "The model decides the next step and which tools to use in a loop", ["It uses a larger model", "It always uses multiple models", "It never calls tools"], "In a workflow the code fixes the path; an agent chooses it at run time."],
  ["M5.1", "m", "When is a workflow better than an agent?", "When the steps are known in advance and predictability matters", ["When the task is open-ended", "When tools are many", "Never"], "Workflows are cheaper, faster and easier to test."],
  ["M5.1", "e", "What are the core components of an agent?", "A model, tools, a loop, and state or memory", ["A GPU, a database and a UI", "Only a prompt", "A vector index only"], "The loop lets the model observe tool results and decide again."],
  ["M5.1", "m", "What is the basic agent loop?", "Model chooses an action, the tool runs, the result is fed back, repeat until done", ["Train, evaluate, deploy", "Retrieve once and answer", "Generate once and stop"], "Observe-think-act until a stopping condition."],
  ["M5.1", "h", "Why are agents riskier than single calls?", "Errors compound across steps and costs grow with each loop", ["They use different APIs", "They cannot be logged", "They are always slower to start"], "Multi-step autonomy multiplies both capability and failure."],

  // M5.2 ReAct
  ["M5.2", "e", "What does ReAct interleave?", "Reasoning steps and actions (tool calls) with observations", ["Retrieval and caching", "Training and inference", "Read and write database calls"], "ReAct alternates thought, action and observation."],
  ["M5.2", "m", "Why must an agent loop have a stopping condition such as a max-step limit?", "To prevent infinite or runaway loops that burn cost", ["To improve accuracy", "Because APIs require it", "To reduce prompt size"], "Hard limits are the last defence against loops."],
  ["M5.2", "m", "What is the trade-off of plan-first agents?", "Upfront plans are efficient but can go stale when observations change", ["They never use tools", "They are always cheaper", "They cannot revise"], "Plans need revision points; step-by-step adapts but may wander."],
  ["M5.2", "h", "Reflection loops (critique then revise) mainly cost…", "Extra model calls and latency per revision", ["Retrieval accuracy", "Tool permissions", "Memory leaks"], "Reflection can improve quality, but each round is another call."],
  ["M5.2", "e", "Why write the agent loop by hand first?", "To understand exactly what frameworks automate", ["Frameworks cannot run loops", "Hand-written loops are always faster", "To avoid using tools"], "A 50-line loop makes framework behaviour transparent."],

  // M5.3 Tools for agents
  ["M5.3", "e", "What most improves a model's tool selection?", "Clear tool names and descriptions with well-typed parameters", ["More tools", "Longer system prompts", "Higher temperature"], "The model picks tools from their descriptions; ambiguity causes misuse."],
  ["M5.3", "m", "A tool returns a 5 MB JSON blob. What should you do?", "Truncate, filter or summarize the result before returning it to the model", ["Pass it in full", "Retry the call", "Increase max tokens"], "Large results waste context and bury the useful part."],
  ["M5.3", "m", "How should consequential tools (send email, delete record) be treated?", "Gate them with confirmation or approval and log them", ["Treat them like read-only tools", "Remove them", "Call them in parallel"], "Irreversible actions need human or policy checks."],
  ["M5.3", "h", "A tool call fails with a validation error. What helps the agent recover?", "Return a clear error message that says what was wrong so the model can fix the arguments", ["Return an empty string", "Crash the loop", "Silently retry the same call"], "Informative errors let the model self-correct."],
  ["M5.3", "e", "When can tool calls run in parallel?", "When they are independent of each other's results", ["Always", "Never", "Only for write operations"], "Dependent calls must be sequential."],

  // M5.4 MCP
  ["M5.4", "e", "In MCP, what are the three roles?", "Host, client and server", ["Producer, broker and consumer", "Master, worker and scheduler", "Frontend, backend and database"], "The host app runs clients, each connected to one MCP server."],
  ["M5.4", "m", "Which transports does MCP define?", "stdio for local processes and Streamable HTTP for remote servers", ["FTP and SMTP", "gRPC only", "WebRTC only"], "stdio suits local tools; Streamable HTTP supports remote servers."],
  ["M5.4", "m", "What primitives can an MCP server expose?", "Tools, resources and prompts", ["Only SQL queries", "Only images", "Only embeddings"], "Tools are actions, resources are data, prompts are templates."],
  ["M5.4", "h", "Why treat third-party MCP servers as untrusted?", "Their tool descriptions and outputs can carry prompt injection or perform harmful actions", ["They are always slower", "They cannot be authenticated", "They use a different JSON format"], "Grant least privilege and review what a server can do."],
  ["M5.4", "e", "What problem does MCP solve?", "A standard way to connect any AI app to any tool or data source", ["Training models faster", "Compressing prompts", "Hosting LLMs"], "It replaces N×M custom integrations with one protocol."],

  // M5.5 Memory
  ["M5.5", "e", "What is short-term memory in an agent?", "The conversation history and state within the current session", ["A database of all users", "The model weights", "A cache of embeddings"], "Short-term memory lives in the context window for the current task."],
  ["M5.5", "m", "What should go into long-term memory?", "Durable, useful facts such as stable user preferences, not every message", ["Every token ever seen", "Only errors", "Nothing"], "Storing everything makes retrieval noisy and raises privacy risk."],
  ["M5.5", "m", "Why must memories be updatable and deletable?", "Facts change and users may ask to be forgotten", ["To save GPU", "Because vectors expire", "To speed up tokenization"], "Stale or unwanted memories mislead the agent and can breach privacy rules."],
  ["M5.5", "h", "How do you keep a long chat within context limits?", "Keep recent turns verbatim and summarize older ones", ["Delete the system prompt", "Drop every other message", "Raise temperature"], "Rolling summaries preserve goals while bounding size."],
  ["M5.5", "e", "Memory retrieval should return…", "Only memories relevant to the current request", ["All memories every time", "Random memories", "The newest memory only"], "Relevant recall keeps context focused."],

  // M5.6 Multi-agent
  ["M5.6", "e", "In an orchestrator-worker pattern, what does the orchestrator do?", "Breaks down the task, delegates to workers and combines their results", ["Executes every tool itself", "Stores vectors", "Only logs output"], "Workers handle subtasks; the orchestrator coordinates."],
  ["M5.6", "m", "How does A2A differ from MCP?", "A2A connects agents to other agents; MCP connects agents to tools and data", ["They are the same protocol", "A2A is for databases", "MCP is only for images"], "The two are complementary layers."],
  ["M5.6", "m", "A common multi-agent failure is…", "Context lost in handoffs and duplicated or conflicting work", ["Too few tokens", "Faster responses", "Lower costs"], "Coordination overhead is the main multi-agent tax."],
  ["M5.6", "h", "When is one strong agent better than several?", "When the task is tightly coupled and needs shared context throughout", ["When subtasks are independent", "When parallelism helps", "Always"], "Splitting tightly coupled work causes context loss."],
  ["M5.6", "e", "Parallel specialist agents help most when…", "Subtasks are independent, like researching separate topics", ["Each step depends on the last", "The task is a single question", "Tools are unavailable"], "Independence makes parallelism safe and faster."],

  // M5.7 LangGraph
  ["M5.7", "e", "In LangGraph, what are the core building blocks?", "State, nodes and edges", ["Tables, rows and columns", "Pods and services", "Topics and partitions"], "Nodes update shared state; edges decide what runs next."],
  ["M5.7", "m", "What does a checkpointer give a LangGraph app?", "Persisted state per thread so runs can resume, be inspected or rewound", ["Faster inference", "Smaller prompts", "Vector search"], "Checkpointers save state after each step."],
  ["M5.7", "m", "What is a conditional edge?", "A routing function that picks the next node based on the current state", ["An edge that runs twice", "An edge that never runs", "A database constraint"], "Conditional edges implement branching and loops."],
  ["M5.7", "h", "How does LangGraph support human-in-the-loop approval?", "Interrupts pause the graph, and it resumes from the checkpoint with human input", ["It emails the user", "It restarts the whole graph", "It cannot"], "Interrupts require a checkpointer so state survives the pause."],
  ["M5.7", "e", "When does a graph beat a simple while loop?", "When you need branching, persistence, resumability or human checkpoints", ["For a single LLM call", "Never", "When there are no tools"], "Graphs make complex control flow explicit."],

  // M5.8 Sandboxing
  ["M5.8", "e", "Why must model-generated code not run in your app process?", "It could read secrets, change files or attack your network", ["It runs too slowly", "Python forbids it", "It cannot print output"], "Generated code is untrusted input."],
  ["M5.8", "m", "Which restrictions belong on a code sandbox?", "Limits on filesystem, network, CPU, memory and wall-clock time", ["Only a time limit", "None if the model is trusted", "Only a memory limit"], "Defence in depth limits the blast radius."],
  ["M5.8", "m", "What do services like E2B or Modal provide?", "Isolated cloud environments for running untrusted code", ["Vector databases", "LLM hosting only", "Prompt templates"], "They give disposable, isolated execution."],
  ["M5.8", "h", "Why cap the size of captured stdout?", "Huge output can exhaust memory or flood the model's context", ["Output is always small", "To hide errors", "To speed up network"], "Truncate and summarize output safely."],
  ["M5.8", "e", "Why use a fresh sandbox per task?", "State from one run cannot leak into or poison another", ["It is cheaper", "It is required by Python", "It avoids logging"], "Isolation between runs prevents cross-contamination."],

  // M5.9 Reliability
  ["M5.9", "e", "Why are idempotent operations important for agents?", "Retries do not cause duplicate side effects", ["They run faster", "They need no tools", "They reduce tokens"], "Retries are common, so actions should be safe to repeat (e.g. with idempotency keys)."],
  ["M5.9", "m", "Which budgets should a production agent enforce?", "Steps, wall-clock time, retries and cost", ["Only token count", "Only memory", "None"], "Multiple budgets stop different kinds of runaway behaviour."],
  ["M5.9", "m", "Why persist agent state after each step?", "So a crash or timeout can resume instead of restarting", ["To train the model", "To reduce latency", "To hide progress"], "Durable state makes long tasks robust."],
  ["M5.9", "h", "How should an agent show progress without exposing raw chain of thought?", "Show high-level step status such as \"searching docs\" and tool results summaries", ["Hide everything", "Stream every token of reasoning", "Show only the final answer after minutes"], "Users need visibility, not internal reasoning dumps."],
  ["M5.9", "e", "When should an agent escalate to a human?", "When it is uncertain, blocked or facing a high-risk action", ["Never", "On every step", "Only after budgets are exceeded twice"], "Escalation is a feature, not a failure."],

  // M5.10 Frameworks
  ["M5.10", "e", "Which of these is an agent framework?", "CrewAI", ["NumPy", "Pandas", "Matplotlib"], "CrewAI, LangGraph, Google ADK, Agno and the OpenAI Agents SDK are agent frameworks."],
  ["M5.10", "m", "What is a fair way to compare agent frameworks?", "Build the same agent in each and compare control, state, observability and effort", ["Count GitHub stars", "Compare logos", "Pick the newest"], "Same task, same criteria."],
  ["M5.10", "m", "What does the OpenAI Agents SDK use to pass control between agents?", "Handoffs", ["Checkpoints only", "Graph edges only", "SQL triggers"], "Handoffs let one agent delegate to another."],
  ["M5.10", "h", "A sign a framework is wrong for your project is…", "You spend more time fighting its abstractions than building features", ["It has documentation", "It supports tools", "It is open source"], "Abstractions should reduce work, not add it."],
  ["M5.10", "e", "Google ADK stands for…", "Agent Development Kit", ["Advanced Data Kernel", "Automated Deployment Kit", "API Design Kit"], "ADK is Google's framework for building agents."],

  // M5.11 Capstone agent
  ["M5.11", "m", "What makes an agent capstone \"production-style\"?", "Budgets, error recovery, tracing, tests and a usable interface", ["Using the largest model", "Many agents", "A long system prompt"], "Production is about reliability, not size."],
  ["M5.11", "e", "Why trace every tool call in your capstone agent?", "To debug failures and explain behaviour", ["To slow it down", "To train it", "To hide errors"], "Traces show what the agent did and why."],
  ["M5.11", "m", "How should you evaluate the capstone agent?", "Run a fixed set of tasks and measure success rate, steps, cost and failures", ["Try one task manually", "Ask the agent to grade itself only", "Measure lines of code"], "Task suites give repeatable evidence."],
  ["M5.11", "h", "Which feature most reduces risk for a consequential agent action?", "A human approval step before executing it", ["Higher temperature", "More tools", "Longer context"], "Approval gates stop irreversible mistakes."],
  ["M5.11", "e", "A good capstone project choice is one that…", "Needs multiple tools and steps, with a clear success definition", ["Needs a single call", "Has no measurable outcome", "Copies a tutorial unchanged"], "Substance plus measurable success."],

  // M6.1 Context as resource
  ["M6.1", "e", "What is \"lost in the middle\"?", "Models tend to use information at the start and end of long contexts better than the middle", ["Tokens are dropped in transit", "The middle layer of a model fails", "Middleware loses requests"], "Placement within long inputs affects recall."],
  ["M6.1", "m", "What is context rot?", "Output quality degrades as the context grows long and cluttered", ["Embeddings expiring", "Cache eviction", "Model weights decaying"], "More tokens can dilute attention on what matters."],
  ["M6.1", "m", "Why inspect the exact prompt sent to the model?", "Hidden templates, tool definitions and history often take more space than expected", ["APIs require it", "To speed up decoding", "To change the model"], "You cannot budget what you have not measured."],
  ["M6.1", "e", "Treating context as a budget means…", "Deciding deliberately how many tokens each component may use", ["Buying more tokens", "Always maxing out the window", "Ignoring token counts"], "Allocate space to instructions, retrieval, history and output."],
  ["M6.1", "h", "Why reserve part of the window for output?", "Input and output share the context limit, so a full prompt can truncate the answer", ["Output is free", "APIs ignore output tokens", "It speeds tokenization"], "max_tokens must fit alongside the prompt."],

  // M6.2 Selection
  ["M6.2", "e", "What belongs in \"always present\" context?", "Core instructions and constraints the model needs on every turn", ["The full chat history", "All retrieved documents", "Every tool output"], "Stable essentials stay; the rest is selected per request."],
  ["M6.2", "m", "Why mark sources with clear delimiters?", "So the model can distinguish instructions, user input and retrieved data", ["To save tokens", "Because JSON requires it", "To improve embeddings"], "Clear boundaries reduce confusion and injection risk."],
  ["M6.2", "m", "What should happen to stale context?", "Remove or replace it so outdated facts do not mislead the model", ["Keep it forever", "Move it to the start", "Duplicate it"], "Stale context causes contradictory answers."],
  ["M6.2", "h", "Two retrieved chunks say nearly the same thing. What should you do?", "Deduplicate to save space for different information", ["Keep both for emphasis", "Remove both", "Reorder them randomly"], "Redundant context wastes budget."],
  ["M6.2", "e", "Context assembly should be…", "Deliberate, with explicit rules for what is included and why", ["Everything available", "Random", "Whatever the framework defaults to"], "Intentional assembly is the core of context engineering."],

  // M6.3 Compression
  ["M6.3", "e", "What must a history summary preserve?", "The user's goals, decisions made and open tasks", ["Exact wording of every message", "Only the last message", "Only greetings"], "Losing the goal is the most damaging compaction failure."],
  ["M6.3", "m", "Why should IDs, numbers and code survive compaction exactly?", "Paraphrasing structured data introduces errors", ["They are short", "Models cannot read them", "They are encrypted"], "Keep structured data verbatim or offload it."],
  ["M6.3", "m", "What is a hierarchical summary?", "Summaries of summaries at increasing levels of abstraction", ["A sorted list", "A database index", "A model layer"], "It scales compression over very long histories."],
  ["M6.3", "h", "How should you check that compaction is safe?", "Compare task success with and without compaction on the same tasks", ["Count tokens only", "Read one summary", "Assume it works"], "Compaction trades tokens for information; measure the loss."],
  ["M6.3", "e", "Compacting a large tool output usually means…", "Keeping the relevant fields and dropping the rest", ["Sending it twice", "Converting it to an image", "Deleting the tool"], "Only what the next step needs should stay."],

  // M6.4 Offloading
  ["M6.4", "e", "What is state offloading?", "Writing plans, notes or results to external storage and reading them back when needed", ["Deleting old messages", "Moving to a bigger model", "Using a CDN"], "The context holds what is active; storage holds the rest."],
  ["M6.4", "m", "Why do note-taking agents help on long tasks?", "Notes persist progress beyond any single context window", ["Notes are faster than tools", "They reduce model size", "They replace evaluation"], "Durable notes survive compaction and restarts."],
  ["M6.4", "m", "What is the risk of offloading too aggressively?", "The agent may forget to retrieve information it needs", ["Higher token cost", "Slower GPUs", "Larger embeddings"], "Offloaded data is only useful if the agent knows to fetch it."],
  ["M6.4", "h", "Where should a long-running agent keep its plan?", "In a persistent file or store it re-reads and updates", ["Only in the first message", "Nowhere", "In the model weights"], "A persisted plan anchors the goal across windows."],
  ["M6.4", "e", "Active context should contain…", "What the current step needs", ["Everything ever seen", "Only the system prompt", "Random samples"], "Keep active context focused."],

  // M6.5 Long context
  ["M6.5", "e", "Why don't million-token windows solve context problems?", "Quality, latency and cost still degrade as context grows", ["They are not real", "They only accept images", "They cannot be cached"], "Bigger windows shift the problem, they do not remove it."],
  ["M6.5", "m", "When is stuffing the whole document better than retrieval?", "When the document is modest in size and the task needs global understanding", ["Always", "Never", "When the corpus is huge"], "Summaries of a whole contract need all of it; lookups do not."],
  ["M6.5", "m", "How can you reduce lost-in-the-middle effects?", "Place key information at the start or end and keep the context lean", ["Shuffle the context", "Use higher temperature", "Repeat the question 10 times"], "Position and density matter."],
  ["M6.5", "h", "What is a \"needle in a haystack\" test?", "Hiding a fact in long context and checking whether the model retrieves it", ["A search engine benchmark", "A security audit", "A tokenizer test"], "It probes recall at different depths and lengths."],
  ["M6.5", "e", "More context or better context?", "Better context usually wins", ["More always wins", "They are identical", "Neither matters"], "Relevance beats volume."],

  // M6.6 Tool context
  ["M6.6", "e", "Why do tool definitions consume context?", "Their names, descriptions and schemas are sent with every request", ["They are stored in weights", "They run on the GPU", "They are free"], "Fifty tools can cost thousands of tokens per call."],
  ["M6.6", "m", "How can you expose only relevant tools?", "Select tools per task by routing or retrieving over tool descriptions", ["Expose all tools always", "Randomly pick tools", "Remove descriptions"], "Dynamic tool selection saves context and improves accuracy."],
  ["M6.6", "m", "How should a 10,000-row query result be handled?", "Store it externally and give the model a summary plus a handle to fetch details", ["Paste it all", "Discard it", "Convert it to an image"], "Keep full results out of the window."],
  ["M6.6", "h", "What is observation build-up?", "Old tool outputs piling up in history and crowding the window", ["A logging feature", "A caching layer", "A rate limit"], "Clear or summarize old observations once used."],
  ["M6.6", "e", "Too many similar tools typically cause…", "Wrong tool selection", ["Faster responses", "Lower costs", "Better accuracy"], "Overlap confuses the model."],

  // M6.7 Caching
  ["M6.7", "e", "How should a prompt be structured for prefix caching?", "Stable content first, changing content last", ["Changing content first", "Random order", "Caching ignores order"], "Caches match on prefixes, so variable parts at the start break hits."],
  ["M6.7", "m", "What invalidates a prompt cache hit?", "Any change in the cached prefix, even a timestamp", ["Changing the user message at the end", "Changing max_tokens", "Changing output language"], "Prefix caching requires byte-identical prefixes."],
  ["M6.7", "m", "What does prompt caching reduce?", "Cost and latency for repeated static context", ["Output length", "Model size", "Accuracy"], "Cached input tokens are billed at a discount and processed faster."],
  ["M6.7", "h", "How do you measure cache utilization?", "Track cached versus uncached input tokens reported in API responses", ["Count requests", "Measure GPU temperature", "Check the model card"], "Usage fields report cache reads and writes."],
  ["M6.7", "e", "Which context is the best candidate for caching?", "Long system prompts, tool definitions and reference documents", ["The user's latest message", "Random IDs", "Timestamps"], "Static, reused context benefits most."],

  // M6.8 Harness
  ["M6.8", "e", "What is an agent harness?", "The code around the model that runs the loop, tools, context and guardrails", ["The model's weights", "A GPU cluster", "A prompt template only"], "The harness decides what the model sees and can do."],
  ["M6.8", "m", "An agent forgets its goal after several context windows. Is this a model or harness problem first?", "A harness problem: persist the goal and progress outside the window", ["A model problem, switch models", "A tokenizer problem", "A network problem"], "Many failures come from what the harness feeds the model."],
  ["M6.8", "m", "Why use durable artifacts (files, tests, commits) as the source of truth?", "They survive context resets and can be verified", ["They are smaller", "Models prefer files", "They avoid tools"], "State in artifacts outlives any single window."],
  ["M6.8", "h", "Why use sub-agents with isolated context?", "To explore a side task without polluting the main agent's context", ["To use fewer tokens overall in all cases", "To avoid tools", "To skip evaluation"], "Sub-agents return only their conclusions."],
  ["M6.8", "e", "What is a self-run feedback loop?", "The agent runs tests or checks and uses the results to fix its work", ["A user rating", "A training run", "A cron job"], "Automatic verification lets the agent self-correct."],

  // M6.9 Capstone long-horizon
  ["M6.9", "m", "What should the capstone comparison show?", "Success, cost and drift for the managed agent versus a keep-everything baseline", ["Only that it runs", "Code length", "Model size"], "A head-to-head comparison proves context management helps."],
  ["M6.9", "e", "What is an explicit context budget?", "Fixed token allowances for each part of the prompt", ["Unlimited tokens", "A monthly bill", "A GPU quota"], "Budgets force deliberate trade-offs."],
  ["M6.9", "m", "How can you detect goal drift in a long run?", "Periodically check actions against the persisted goal", ["Wait for the user", "Ignore it", "Restart every step"], "Re-grounding on the goal keeps the run on track."],
  ["M6.9", "h", "The managed agent is cheaper but fails more. What does that suggest?", "Compaction or offloading is dropping information the task needs", ["Context management never works", "The baseline is wrong", "Use higher temperature"], "Find what was lost and keep it."],
  ["M6.9", "e", "A good long-horizon task for this capstone is one that…", "Degrades noticeably when context is managed naively", ["Fits in one prompt", "Takes one step", "Has no success criteria"], "You need a task that exposes the problem."],
];
