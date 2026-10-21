import type { ExplainerSrc } from "./types";

export const EXPLAINERS_L4_L5: ExplainerSrc[] = [
  {
    id: "M4.1",
    diagram: {
      kind: "flow",
      steps: ["Files :: PDF, HTML, DOCX", "Extract :: text (OCR for scans)", "Clean :: keep headings and tables", "Deduplicate :: hash each document", "Store :: text + metadata"],
      caption: "Ingestion turns messy files into clean text with metadata. Bad ingestion can't be fixed later by a better prompt.",
    },
    example: {
      title: "Ingest a folder of PDFs without duplicates",
      problem: "Load 500 policy PDFs, some uploaded twice, keeping the source and page for citations.",
      steps: [
        ["Extract text page by page so you keep the page number.", "from pypdf import PdfReader\npages = [(i + 1, p.extract_text() or \"\") for i, p in enumerate(PdfReader(path).pages)]"],
        ["A page with almost no text is probably a scan, so send it to OCR.", "if len(text.strip()) < 20:\n    text = ocr(page_image)"],
        ["Normalise whitespace but keep line breaks that mark headings.", "text = re.sub(r\"[ \\t]+\", \" \", text)"],
        ["Hash the cleaned text; skip anything you've seen.", "h = hashlib.sha256(text.encode()).hexdigest()\nif h in seen: continue"],
        ["Save text with metadata you'll need later.", "{\"text\": text, \"source\": path.name, \"page\": n, \"hash\": h, \"updated\": mtime}"],
      ],
      result: "Clean pages, each with source and page, duplicates removed, and a hash that tells you later which documents changed and need re-indexing.",
    },
    yourTurn: {
      task: "A policy PDF is updated. How do you avoid re-embedding all 500 documents?",
      hints: ["You stored a hash per document.", "Compare old and new."],
      answer: "Re-hash the new file; if the hash changed, delete that document's old chunks and re-index only it. Unchanged hashes are skipped.",
    },
  },
  {
    id: "M4.2",
    diagram: {
      kind: "flow",
      steps: ["Document :: 20 pages", "Split :: by headings, then size", "Overlap :: a little shared text", "Chunks :: 300 to 800 tokens each", "Metadata :: source, section, page"],
      caption: "Chunking splits documents into pieces that can be found and fit in the prompt. Size and boundaries decide what search can find.",
    },
    example: {
      title: "Recursive chunking with overlap",
      problem: "Split a handbook into chunks of about 500 characters that don't cut sentences in half.",
      steps: [
        ["Try to split on the biggest natural boundary first, then smaller ones.", "separators = [\"\\n## \", \"\\n\\n\", \"\\n\", \". \", \" \"]"],
        ["Use a library that does exactly this.", "from langchain_text_splitters import RecursiveCharacterTextSplitter\nsplitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50, separators=separators)"],
        ["Split, keeping each chunk's source.", "chunks = splitter.create_documents([text], metadatas=[{\"source\": \"handbook.md\"}])"],
        ["Look at a few chunks yourself. Does each make sense alone?", "print(chunks[3].page_content)"],
      ],
      result: "Chunks end at paragraph or sentence breaks, the 50-character overlap keeps ideas that cross a boundary, and each chunk knows its source.",
    },
    yourTurn: {
      task: "Answers about a policy keep missing its exceptions, which are in the next paragraph. What do you change?",
      hints: ["The exception is being cut into a different chunk.", "Size, overlap or boundaries?"],
      answer: "Chunk by section (headings) so a rule and its exceptions stay together, or increase chunk size or overlap. Check by reading the chunks.",
    },
  },
  {
    id: "M4.3",
    diagram: {
      kind: "flow",
      steps: ["Text :: \"reset my password\"", "Embedding model :: same one for all", "Vector :: e.g. 1,536 numbers", "Similar meaning :: nearby vectors"],
      caption: "An embedding turns text into numbers so that similar meanings sit close together. Never mix vectors from different models.",
    },
    example: {
      title: "See that embeddings capture meaning",
      problem: "Compare \"reset my password\", \"I forgot my login\" and \"pizza recipe\".",
      steps: [
        ["Embed all three with the same model.", "vecs = embed([\"reset my password\", \"I forgot my login\", \"pizza recipe\"])"],
        ["Each is a list of numbers of the same length.", "len(vecs[0])  # 1536"],
        ["Compare with cosine similarity.", "cos(vecs[0], vecs[1])  # 0.71\ncos(vecs[0], vecs[2])  # 0.08"],
        ["The two login questions are close despite sharing no words.", "\"password\" vs \"login\": different words, same idea"],
      ],
      result: "Similarity 0.71 for the login pair versus 0.08 for pizza (example numbers). That's why semantic search finds answers phrased differently from the question.",
    },
    yourTurn: {
      task: "You switch to a new embedding model but keep the old vectors in the index. What happens?",
      hints: ["Each model has its own space.", "Are the numbers comparable?"],
      answer: "Queries embedded with the new model are compared against vectors from the old one, so results are meaningless. Re-embed everything with the new model.",
    },
  },
  {
    id: "M4.4",
    diagram: {
      kind: "flow",
      steps: ["Query :: embed it", "Compare :: cosine with every chunk", "Sort :: highest first", "Top k :: best matches"],
      caption: "Semantic search is just: embed the question, score each chunk by similarity, return the best few.",
    },
    example: {
      title: "Semantic search from scratch",
      problem: "Find the 2 most relevant chunks for a question using only NumPy.",
      steps: [
        ["Embed the chunks once and stack them into a matrix.", "import numpy as np\nM = np.array(embed(chunks))  # shape (n, d)"],
        ["Normalise rows so a dot product equals cosine similarity.", "M = M / np.linalg.norm(M, axis=1, keepdims=True)"],
        ["Embed and normalise the query.", "q = np.array(embed([question])[0])\nq = q / np.linalg.norm(q)"],
        ["One matrix multiply scores every chunk.", "scores = M @ q"],
        ["Take the top 2.", "top = np.argsort(-scores)[:2]\n[(chunks[i], round(float(scores[i]), 2)) for i in top]"],
      ],
      result: "The two chunks closest in meaning, with their scores. A vector database does the same thing, faster, at scale.",
    },
    yourTurn: {
      task: "A user searches for the error code `E-4021` and semantic search returns general error pages. Why?",
      hints: ["What does an embedding capture well?", "Codes have no \"meaning\"."],
      answer: "Embeddings capture meaning, not exact strings, so a rare code isn't matched precisely. Add keyword (BM25) search for exact terms.",
    },
  },
  {
    id: "M4.5",
    diagram: {
      kind: "flow",
      steps: ["Insert :: vector + metadata", "Index :: HNSW graph", "Query :: vector + filter", "ANN search :: fast, nearly exact", "Top k :: with metadata"],
      caption: "A vector database stores embeddings with metadata and finds near neighbours fast using an approximate index.",
    },
    example: {
      title: "Store and search with pgvector",
      problem: "Keep chunks in Postgres and search only one team's documents.",
      steps: [
        ["Enable the extension and create a table with a vector column.", "CREATE EXTENSION IF NOT EXISTS vector;\nCREATE TABLE chunks (id bigserial PRIMARY KEY, team_id int, text text, embedding vector(1536));"],
        ["Add an HNSW index for fast cosine search.", "CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);"],
        ["Search: filter by team, order by distance (`<=>` is cosine distance).", "SELECT text FROM chunks\nWHERE team_id = %s\nORDER BY embedding <=> %s\nLIMIT 5;"],
        ["Deleting a document means deleting its rows; the index updates itself.", "DELETE FROM chunks WHERE source = 'old.pdf';"],
      ],
      result: "Five nearest chunks for that team in milliseconds, in the same database as the rest of your app.",
    },
    yourTurn: {
      task: "Why is ANN search \"approximate\", and why is that usually fine?",
      hints: ["Checking every vector is exact but slow.", "How much does missing one neighbour matter?"],
      answer: "It skips most vectors to be fast, so it can occasionally miss a true neighbour. Recall is typically very high, and you're retrieving several results anyway.",
    },
  },
  {
    id: "M4.6",
    diagram: {
      kind: "flow",
      steps: ["Query", "BM25 :: exact words | Vector search :: meaning", "RRF :: merge by rank", "Top results :: best of both"],
      caption: "Hybrid retrieval runs keyword and semantic search side by side and merges the two ranked lists.",
    },
    example: {
      title: "Merge two result lists with RRF",
      problem: "BM25 returns [A, B, C] and vector search returns [C, D, A]. Combine them.",
      steps: [
        ["RRF gives each document 1 / (k + rank) from each list, with k = 60.", "def rrf(*lists, k=60):\n    scores = {}\n    for lst in lists:\n        for rank, doc in enumerate(lst, start=1):\n            scores[doc] = scores.get(doc, 0) + 1 / (k + rank)\n    return sorted(scores, key=scores.get, reverse=True)"],
        ["A is 1st and 3rd.", "A = 1/61 + 1/63 ≈ 0.0323"],
        ["C is 3rd and 1st, the same total.", "C = 1/63 + 1/61 ≈ 0.0323"],
        ["B and D appear once.", "B = 1/62 ≈ 0.0161\nD = 1/62 ≈ 0.0161"],
        ["Run it.", "rrf([\"A\", \"B\", \"C\"], [\"C\", \"D\", \"A\"])  # ['A', 'C', 'B', 'D']"],
      ],
      result: "A and C, found by both methods, rise to the top. RRF uses ranks only, so you never compare BM25 scores with cosine scores directly.",
    },
    yourTurn: {
      task: "Why not just add the BM25 score and the cosine score together?",
      hints: ["What range does each score have?", "BM25 can be 12.4; cosine is between -1 and 1."],
      answer: "They're on different scales, so one would dominate. RRF avoids this by using positions in each list, not raw scores.",
    },
  },
  {
    id: "M4.8",
    diagram: {
      kind: "flow",
      steps: ["Question", "Retrieve :: top chunks", "Assemble :: prompt with the chunks", "Generate :: answer from them", "Cite :: which chunk said what"],
      caption: "RAG = look things up first, then answer from what you found. When it fails, check retrieval before blaming the model.",
    },
    example: {
      title: "Diagnose a wrong RAG answer",
      problem: "\"What's the refund window?\" gets \"14 days\", but policy says 30.",
      steps: [
        ["Print the retrieved chunks for that question.", "for c in retrieve(q): print(c.source, c.text[:80])"],
        ["Is the right chunk there? If not, it's a retrieval failure.", "returned: old-policy-2023.pdf \"refunds within 14 days\""],
        ["If it was there and the answer was still wrong, it's a generation failure.", "(not the case here)"],
        ["Fix the actual cause: the old policy is still indexed.", "remove old-policy-2023.pdf; filter by effective date"],
      ],
      result: "Now the 30-day chunk is retrieved and the answer is right. Changing the prompt would not have fixed it.",
    },
    yourTurn: {
      task: "A team wants RAG for a 3-page FAQ that rarely changes. Is RAG needed?",
      hints: ["How many tokens is 3 pages?", "Does it fit in the prompt?"],
      answer: "Probably not. Three pages fit easily in the context, so put them in the prompt (with caching). RAG pays off when the content is too big or changes often.",
    },
  },
  {
    id: "M4.9",
    diagram: {
      kind: "flow",
      steps: ["Embed question", "Top k :: 4 chunks", "Prompt :: \"answer only from these\"", "LLM :: grounded answer", "Weak context? :: say you don't know"],
      caption: "A baseline RAG is about 30 lines. Build it by hand once so you understand every step frameworks hide.",
    },
    example: {
      title: "Baseline RAG in a few lines",
      problem: "Answer questions from your chunks, and refuse when they don't contain the answer.",
      steps: [
        ["Retrieve the top 4 chunks.", "hits = search(question, k=4)"],
        ["Number them so the model can cite.", "context = \"\\n\\n\".join(f\"[{i+1}] {h.text}\" for i, h in enumerate(hits))"],
        ["Tell the model to use only this context and to say when it can't answer.", "prompt = f\"\"\"Answer using only the sources below. Cite like [1].\nIf they don't contain the answer, reply: I don't know.\n\n{context}\n\nQuestion: {question}\"\"\""],
        ["Generate with low temperature.", "answer = llm(prompt, temperature=0)"],
        ["Skip the call when even the best match is weak.", "if hits[0].score < 0.3:\n    answer = \"I don't know.\""],
      ],
      result: "\"Refunds are accepted within 30 days [2].\" and an honest \"I don't know\" for questions outside the documents.",
    },
    yourTurn: {
      task: "Raising k from 4 to 20 made answers worse. Why might that be?",
      hints: ["What else came in with the extra chunks?", "Remember lost in the middle."],
      answer: "More chunks added noise and pushed the good ones into the middle of a long context, where models use them less. Rerank and send fewer, better chunks.",
    },
  },
  {
    id: "M4.10",
    diagram: {
      kind: "flow",
      steps: ["Retrieve many :: top 50, fast", "Rerank :: cross-encoder scores each", "Keep best :: top 5", "Generate"],
      caption: "Retrieve wide and cheap, then rerank carefully, then send only the best few to the model.",
    },
    example: {
      title: "Add a reranker",
      problem: "The right chunk is in the top 50 but usually not the top 5.",
      steps: [
        ["Retrieve a wide net.", "candidates = search(question, k=50)"],
        ["A cross-encoder reads question and chunk together and scores the match.", "from sentence_transformers import CrossEncoder\nce = CrossEncoder(\"cross-encoder/ms-marco-MiniLM-L-6-v2\")\nscores = ce.predict([(question, c.text) for c in candidates])"],
        ["Sort by the new scores and keep 5.", "best = [c for _, c in sorted(zip(scores, candidates), key=lambda x: -x[0])][:5]"],
        ["Measure on your test set before and after.", "hit@5: 0.62 -> 0.84, latency +120 ms"],
      ],
      result: "The right chunk reaches the top 5 far more often, for about 120 ms extra. Worth it here; check that trade-off on your own data.",
    },
    yourTurn: {
      task: "When would a reranker add little?",
      hints: ["What if the first stage is already very good?", "What if there are only a few documents?"],
      answer: "When first-stage retrieval already puts the right chunk at the top almost always, or the corpus is tiny. Measure before adding the latency.",
    },
  },
  {
    id: "M4.11",
    diagram: {
      kind: "flow",
      steps: ["User question :: vague", "Rewrite :: 3 search queries", "Search each", "Merge :: RRF", "Answer"],
      caption: "Users ask questions, not search queries. Rewriting or expanding the question can find what a literal search misses, at the cost of extra calls.",
    },
    example: {
      title: "Multi-query rewriting",
      problem: "\"it won't let me in after the update\" retrieves nothing useful.",
      steps: [
        ["Ask a small model for alternative search queries.", "queries = llm(\"Write 3 short search queries for: \" + q).splitlines()"],
        ["It produces clearer phrasings.", "[\"login fails after app update\", \"authentication error new version\", \"cannot sign in after upgrade\"]"],
        ["Search with each, plus the original.", "lists = [search(x, k=10) for x in [q, *queries]]"],
        ["Merge with RRF.", "hits = rrf(*lists)[:5]"],
      ],
      result: "The login-after-update troubleshooting page is now found. Cost: one extra small call and three extra searches.",
    },
    yourTurn: {
      task: "Should you rewrite \"What is the leave policy?\" before searching?",
      hints: ["Is the question already a clear query?", "What does rewriting cost?"],
      answer: "No. It's already a clear, specific query; rewriting adds latency and cost for no gain. Use transformation for vague or multi-part questions.",
    },
  },
  {
    id: "M4.12",
    diagram: {
      kind: "flow",
      steps: ["Sources :: numbered chunks", "Answer :: each claim cites a source", "Check :: is each claim supported?", "Not enough evidence :: abstain"],
      caption: "Grounding means every claim comes from the evidence. A citation is only useful if the cited text really says it.",
    },
    example: {
      title: "Verify citations after generation",
      problem: "The model writes \"Remote work is allowed 3 days a week [2]\". Check it.",
      steps: [
        ["Split the answer into claims with their citation numbers.", "claims = [(\"Remote work is allowed 3 days a week\", 2)]"],
        ["Look up the cited chunk.", "src = sources[2 - 1].text  # \"Employees may work remotely up to 2 days a week.\""],
        ["Ask a judge (or a rule) whether the source supports the claim.", "judge(f\"Does the source support the claim? yes/no\\nSource: {src}\\nClaim: {claim}\")  # no"],
        ["Unsupported claims are removed or the answer abstains.", "\"The policy allows remote work up to 2 days a week [2].\""],
      ],
      result: "The wrong number is caught. A citation was present, but it pointed to text that said something else.",
    },
    yourTurn: {
      task: "None of the retrieved chunks mention parental leave. What should the bot say?",
      hints: ["Guessing is the failure we're avoiding.", "Can you still help the user?"],
      answer: "Say it couldn't find this in the documents, and point to where to ask (for example HR), instead of answering from general knowledge.",
    },
  },
  {
    id: "M4.13",
    diagram: {
      kind: "loop",
      steps: ["Retrieve", "Grade :: are these chunks relevant?", "Good :: answer | Poor :: rewrite query or search elsewhere"],
      back: "retry with a better query",
      caption: "Advanced RAG adds checks and loops (corrective, adaptive, multi-hop). Pick one because of a measured failure, not because it's new.",
    },
    example: {
      title: "Choose a variant from the failure",
      problem: "Three failures: (a) vague questions get junk, (b) \"Which manager of the Pune office approved X?\" needs two lookups, (c) simple FAQ questions are slow.",
      steps: [
        ["(a) Retrieval is often irrelevant: grade it and retry if poor.", "Corrective RAG: grade chunks -> rewrite -> search again"],
        ["(b) The answer needs facts joined across documents.", "Multi-hop / iterative RAG: find the Pune manager, then search approvals by that name"],
        ["(c) Easy questions don't need the full pipeline.", "Adaptive RAG: route simple questions to a direct answer or a cache"],
        ["Measure each change against the baseline on the same test set.", "baseline vs variant: accuracy, latency, cost"],
      ],
      result: "Three different fixes for three different failures. None of them is \"the best RAG\"; each solves a specific problem.",
    },
    yourTurn: {
      task: "When is Graph RAG worth the extra work?",
      hints: ["What does a graph store well?", "Think about \"who is connected to whom\" questions."],
      answer: "When questions are about relationships between many entities (people, companies, parts), which plain chunk search answers poorly.",
    },
  },
  {
    id: "M4.14",
    diagram: {
      kind: "flow",
      steps: ["Loader :: read files", "Splitter :: chunks", "Index :: embeddings", "Retriever / query engine", "Response :: with sources"],
      caption: "Frameworks package the same RAG steps you built by hand. Use them to move faster, but know what each piece does.",
    },
    example: {
      title: "Rebuild the baseline with LlamaIndex",
      problem: "Recreate your hand-built RAG in a few lines.",
      steps: [
        ["Load every file in a folder.", "from llama_index.core import SimpleDirectoryReader, VectorStoreIndex\ndocs = SimpleDirectoryReader(\"policies/\").load_data()"],
        ["Chunk, embed and index in one call.", "index = VectorStoreIndex.from_documents(docs)"],
        ["Create a query engine that retrieves 4 chunks.", "qe = index.as_query_engine(similarity_top_k=4)"],
        ["Ask, and look at the sources it used.", "r = qe.query(\"What is the refund window?\")\nprint(r, [n.metadata[\"file_name\"] for n in r.source_nodes])"],
        ["Run your existing test set to compare with the hand-built version.", "hand-built 41/50, framework 40/50"],
      ],
      result: "Same quality in far less code. Now you can swap in the framework's reranker or query transforms and measure each.",
    },
    yourTurn: {
      task: "The framework version is worse than your hand-built one. What do you check first?",
      hints: ["Defaults may differ from your choices.", "Chunk size? Top k? Embedding model?"],
      answer: "Compare settings: chunk size and overlap, embedding model, top k and the prompt template. Framework defaults often differ from what you tuned.",
    },
  },

  // L5 Agents
  {
    id: "M5.1",
    diagram: {
      kind: "loop",
      steps: ["Goal :: from the user", "Think :: what's next?", "Act :: call a tool", "Observe :: read the result"],
      back: "repeat until done or out of budget",
      caption: "An agent is an LLM in a loop that chooses its own next step using tools.",
    },
    example: {
      title: "Workflow or agent?",
      problem: "Decide for: (a) translate every new product description, (b) \"find why yesterday's sales dropped\".",
      steps: [
        ["(a) Steps are always the same: read, translate, save.", "(a) workflow: fixed, cheap, testable"],
        ["(b) You don't know the steps: check traffic? prices? a broken checkout?", "(b) the path depends on what each check finds"],
        ["An agent can choose: query sales, then error logs, then the deploy history.", "tools: run_sql, read_logs, list_deploys"],
        ["Still give it a budget and a stop rule.", "max_steps = 10, stop when it can name a cause with evidence"],
      ],
      result: "(a) is a workflow and (b) is an agent. Most tasks are (a); reach for an agent only when the path really varies.",
    },
    yourTurn: {
      task: "Name the parts every agent needs.",
      hints: ["Something that decides, things it can do...", "...and something that remembers and stops it."],
      answer: "A model (to decide), tools (to act), state or memory (what has happened), instructions (the goal and rules) and a stop condition or budget.",
    },
  },
  {
    id: "M5.2",
    diagram: {
      kind: "loop",
      steps: ["Thought :: \"I need the price\"", "Action :: search(\"price of X\")", "Observation :: \"$40\"", "Next thought :: \"Now convert\""],
      back: "until Final Answer or max steps",
      caption: "ReAct interleaves reasoning and tool use. A step limit stops it looping forever.",
    },
    example: {
      title: "An agent loop by hand",
      problem: "Write the core loop of a tool-using agent with a safety limit.",
      steps: [
        ["Start with the goal in the message history.", "messages = [{\"role\": \"user\", \"content\": goal}]"],
        ["Loop with a hard cap on steps.", "for step in range(8):\n    r = llm(messages, tools=TOOLS)"],
        ["No tool call means the model is done.", "    if not r.tool_calls:\n        return r.content"],
        ["Run each requested tool and add the results.", "    messages.append(r.message)\n    for c in r.tool_calls:\n        messages.append(tool_result(c.id, run(c)))"],
        ["Out of steps: stop honestly.", "return \"Stopped after 8 steps without finishing.\""],
      ],
      result: "A working agent in about 10 lines. Frameworks add state, retries and tracing, but this is the heart of every one.",
    },
    yourTurn: {
      task: "The agent calls the same search with the same query three times in a row. Add a guard.",
      hints: ["Keep track of what was already called.", "What should happen on a repeat?"],
      answer: "Store (tool, arguments) pairs; on a repeat, return a message like \"You already ran this; result was X. Try something else.\" or stop the loop.",
    },
  },
  {
    id: "M5.3",
    diagram: {
      kind: "flow",
      steps: ["Agent picks tool", "Validate args", "Read-only :: run | Risky :: ask a human", "Trim result :: keep it small", "Back to agent"],
      caption: "Agent tools need checks: validate every argument, keep results small, and put a human in front of anything consequential.",
    },
    example: {
      title: "Make a search tool agent-friendly",
      problem: "The agent's `search_tickets` returns 200 full tickets and floods the context.",
      steps: [
        ["Add a limit argument with a safe default and maximum.", "def search_tickets(query: str, limit: int = 5):\n    limit = min(limit, 20)"],
        ["Return only fields the agent needs.", "return [{\"id\": t.id, \"title\": t.title, \"status\": t.status} for t in hits[:limit]]"],
        ["Offer a second tool for full detail on one ticket.", "def get_ticket(id: str) -> dict: ..."],
        ["Return useful errors instead of raising.", "except TimeoutError:\n    return {\"error\": \"search timed out, try a narrower query\"}"],
      ],
      result: "Results are a few lines instead of thousands of tokens, and the agent can drill into one ticket when it needs to.",
    },
    yourTurn: {
      task: "Which of these should need human approval: `list_files`, `read_file`, `delete_file`, `send_invoice`?",
      hints: ["Which change the world?", "Which can't be undone?"],
      answer: "`delete_file` and `send_invoice`: they change things and are hard to undo. Listing and reading can run freely.",
    },
  },
  {
    id: "M5.4",
    diagram: {
      kind: "flow",
      steps: ["Host :: chat app or IDE", "MCP client :: inside the host", "MCP server :: exposes tools", "Real system :: GitHub, a DB, files"],
      caption: "MCP is a standard plug: write a tool server once and any MCP host can use it.",
    },
    example: {
      title: "A tiny MCP server",
      problem: "Expose a \"look up order status\" tool to any MCP host.",
      steps: [
        ["Use the official Python SDK's quick server class.", "from mcp.server.fastmcp import FastMCP\nmcp = FastMCP(\"orders\")"],
        ["A decorated function becomes a tool. The docstring is its description.", "@mcp.tool()\ndef order_status(order_id: str) -> str:\n    \"\"\"Status of one order, by id like ORD-1234.\"\"\"\n    return db.status(order_id)"],
        ["Run it over stdio so a local host can start it.", "if __name__ == \"__main__\":\n    mcp.run()"],
        ["Register it in the host's config with the command to start it.", "{\"mcpServers\": {\"orders\": {\"command\": \"python\", \"args\": [\"orders_server.py\"]}}}"],
      ],
      result: "The host lists `order_status` as a tool and the model can call it, with no host-specific integration code.",
    },
    yourTurn: {
      task: "You find a third-party MCP server online. What do you check before connecting it?",
      hints: ["It runs code and its tool descriptions go into your model's context.", "What can it access?"],
      answer: "Who publishes it, what permissions and data it can reach, and its tool descriptions (they can contain injected instructions). Prefer read-only scopes and review the code.",
    },
  },
  {
    id: "M5.5",
    diagram: {
      kind: "flow",
      steps: ["Conversation :: short-term memory", "Extract :: facts worth keeping", "Store :: long-term memory", "Retrieve :: only relevant ones", "Update or forget"],
      caption: "Short-term memory is the current conversation. Long-term memory is what you choose to save and fetch again later.",
    },
    example: {
      title: "Remember a user preference",
      problem: "A user says \"I'm vegetarian\" in one chat. Use it next week.",
      steps: [
        ["After each conversation, ask a small model what's worth saving.", "facts = llm(\"List lasting user facts as JSON list: \" + transcript)  # [\"is vegetarian\"]"],
        ["Store each fact with the user id and an embedding.", "memory.add(user_id, \"is vegetarian\", embed(\"is vegetarian\"))"],
        ["Next session, fetch memories related to the new message.", "related = memory.search(user_id, embed(\"suggest a dinner recipe\"), k=3)"],
        ["Put them in the prompt.", "system += \"\\nKnown about user: \" + \"; \".join(related)"],
        ["If the user says \"I eat fish now\", update rather than add.", "memory.update(user_id, old=\"is vegetarian\", new=\"pescatarian\")"],
      ],
      result: "The recipe suggestion is vegetarian a week later, and the memory stays correct when things change.",
    },
    yourTurn: {
      task: "Why not just save the whole conversation forever and send it every time?",
      hints: ["What about the context window?", "And old, wrong facts?"],
      answer: "It grows without limit, costs more each turn, buries the important facts, and keeps outdated information. Save selected facts and retrieve only relevant ones.",
    },
  },
  {
    id: "M5.6",
    diagram: {
      kind: "hub",
      steps: ["Orchestrator :: splits work, combines results", "Researcher", "Writer", "Reviewer", "Coder"],
      caption: "In an orchestrator pattern, one agent hands focused jobs to workers and merges what they return.",
    },
    example: {
      title: "Design a research report team",
      problem: "Produce a market report on three competitors.",
      steps: [
        ["The orchestrator splits the job into independent parts.", "tasks = [\"research A\", \"research B\", \"research C\"]"],
        ["Researcher workers run in parallel, each with a small focused context.", "results = await gather(*(researcher(t) for t in tasks))"],
        ["Each returns a structured summary, not its whole transcript.", "{\"company\": \"A\", \"pricing\": ..., \"sources\": [...]}"],
        ["A writer combines them; a reviewer checks claims against sources.", "draft = writer(results)\nissues = reviewer(draft, results)"],
        ["If a worker fails, the orchestrator retries once or marks that part missing.", "if r.error: r = retry(t) or {\"company\": t, \"missing\": True}"],
      ],
      result: "A report built from parallel research, with each agent's context kept small. Cost is several times a single agent, so it must be worth it.",
    },
    yourTurn: {
      task: "When is one strong agent better than five?",
      hints: ["What do extra agents add?", "Is the task really separable?"],
      answer: "When the work is small or tightly connected. Extra agents add cost, latency and hand-off errors, so use them only for parallel or truly separate jobs.",
    },
  },
  {
    id: "M5.7",
    diagram: {
      kind: "loop",
      steps: ["State :: shared dict", "Node :: call model", "Edge :: if tool call → tools, else end", "Node :: run tools"],
      back: "tools → back to model",
      caption: "LangGraph models an agent as nodes that update shared state, with edges deciding what runs next. Checkpoints let it pause and resume.",
    },
    example: {
      title: "A graph with a human approval step",
      problem: "An agent drafts a refund; a person must approve before it's sent.",
      steps: [
        ["Define state.", "class State(TypedDict):\n    request: str\n    draft: str\n    approved: bool"],
        ["Add nodes for each step.", "g = StateGraph(State)\ng.add_node(\"draft\", draft_refund)\ng.add_node(\"send\", send_refund)"],
        ["Wire the edges.", "g.add_edge(START, \"draft\")\ng.add_edge(\"draft\", \"send\")\ng.add_edge(\"send\", END)"],
        ["Compile with a checkpointer and pause before sending.", "app = g.compile(checkpointer=MemorySaver(), interrupt_before=[\"send\"])"],
        ["Run until the pause; resume after a person approves.", "app.invoke({\"request\": r}, config)\n# ...human reviews the draft...\napp.invoke(None, config)  # continues to send"],
      ],
      result: "The run stops before `send`, its state is saved, and it continues from exactly there once approved, even after a restart if you use a persistent checkpointer.",
    },
    yourTurn: {
      task: "Which LangGraph feature lets a 2-hour run survive a server restart?",
      hints: ["Something saved after each step.", "It's passed to `compile`."],
      answer: "A persistent checkpointer (for example backed by Postgres or SQLite), so the run resumes from the last saved step using its thread id.",
    },
  },
  {
    id: "M5.8",
    diagram: {
      kind: "flow",
      steps: ["Agent writes code", "Sandbox :: separate container or VM", "Limits :: no network, 10 s, read-only files", "Capture :: stdout, errors", "Back to agent"],
      caption: "Never run model-written code in your own process. Run it somewhere isolated, with limits, and only bring back the output.",
    },
    example: {
      title: "Run generated code safely",
      problem: "A data agent writes Python to analyse a CSV. Execute it without risking your server.",
      steps: [
        ["Start a fresh sandbox per run (E2B, Modal or a locked-down container).", "sbx = Sandbox()  # isolated machine"],
        ["Copy in only the file it needs.", "sbx.files.write(\"/data/sales.csv\", csv_bytes)"],
        ["Run with a time limit.", "result = sbx.run_code(agent_code, timeout=10)"],
        ["Bring back output and errors, trimmed.", "out = (result.stdout or \"\")[-2000:]\nerr = (result.error or \"\")[-1000:]"],
        ["Destroy the sandbox.", "sbx.kill()"],
      ],
      result: "Even if the code tries `rm -rf /` or reads your secrets, it only damages a throwaway machine with nothing in it.",
    },
    yourTurn: {
      task: "Why turn off network access in the sandbox?",
      hints: ["What could malicious code send out?", "And what could it download?"],
      answer: "So injected or buggy code can't send data out (exfiltration) or download more tools. Allow only the specific hosts a task really needs.",
    },
  },
  {
    id: "M5.9",
    diagram: {
      kind: "flow",
      steps: ["Budgets :: steps, time, cost", "Save state :: after each step", "Idempotent actions :: safe to repeat", "Show progress :: to the user", "Escalate :: hand to a human"],
      caption: "Reliable agents stop on a budget, can resume after failure, never do a harmful action twice, and keep the user informed.",
    },
    example: {
      title: "Make a booking agent safe to retry",
      problem: "The agent crashed after paying but before confirming. On restart it might pay again.",
      steps: [
        ["Give each action an idempotency key derived from the task.", "key = f\"booking-{task_id}-pay\""],
        ["The payment API ignores a repeated key.", "pay(amount, idempotency_key=key)"],
        ["Save state after each completed step.", "state.done.append(\"pay\"); save(state)"],
        ["On restart, skip steps already done.", "if \"pay\" not in state.done:\n    pay(...)"],
        ["Enforce budgets and hand over when they run out.", "if state.cost > 0.50 or state.steps > 20:\n    escalate(state)"],
      ],
      result: "A restart continues from \"confirm\" and the customer is charged once.",
    },
    yourTurn: {
      task: "Users can't tell if the agent is stuck or working. Name two UX fixes.",
      hints: ["What is it doing right now?", "What can the user do about it?"],
      answer: "Show live progress (\"Searching flights… 2 of 4 steps\") and give Cancel or Pause controls, without exposing raw internal reasoning.",
    },
  },
  {
    id: "M5.10",
    diagram: {
      kind: "hub",
      steps: ["Same agent", "LangGraph :: explicit graph, checkpoints", "Google ADK :: agents on Google's stack", "CrewAI :: role-based crews", "OpenAI Agents SDK :: handoffs, guardrails", "Agno :: lightweight agents"],
      caption: "Many frameworks build the same loop. Compare them on control, state, debugging, and how much they hide.",
    },
    example: {
      title: "Compare two frameworks fairly",
      problem: "Build the same \"answer from docs, file a ticket if unsure\" agent in two frameworks.",
      steps: [
        ["Fix the task, tools and model so only the framework changes.", "same tools: search_docs, create_ticket; same model"],
        ["Build it in each.", "LangGraph: 80 lines, explicit state\nOpenAI Agents SDK: 35 lines, handoff to a ticket agent"],
        ["Run the same 20 test questions.", "LangGraph 17/20, Agents SDK 17/20"],
        ["Compare what matters to you: debugging, persistence, lock-in.", "LangGraph: easy to pause and resume\nAgents SDK: less code, built-in tracing"],
      ],
      result: "Quality is the same; the choice comes down to control versus speed of building, and your stack.",
    },
    yourTurn: {
      task: "Name three things to compare frameworks on, besides \"which is popular\".",
      hints: ["How do you debug it?", "What happens when a run crashes?"],
      answer: "For example: state and persistence, human-in-the-loop support, tracing and debugging, model and provider flexibility, and how much behaviour is hidden.",
    },
  },
];
