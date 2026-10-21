import type { ExplainerSrc } from "./types";

export const EXPLAINERS_L0_L1: ExplainerSrc[] = [
  {
    id: "M0.1",
    diagram: {
      kind: "flow",
      steps: ["Project env :: uv makes a private venv", "Typed code :: functions with type hints", "Data in/out :: files, env vars, JSON", "Tests :: pytest checks each piece"],
      caption: "A small Python project: an isolated environment, typed functions, clear input and output, and tests that prove it works.",
    },
    example: {
      title: "Count words in a file, safely",
      problem: "Write a typed function that reads a text file and returns how many words it has, and a test for it.",
      steps: [
        ["Import `Path` so the file path works on any operating system.", "from pathlib import Path"],
        ["Say in the signature what goes in and what comes out: a path in, a whole number out.", "def count_words(path: Path) -> int:"],
        ["Read the whole file as text. `encoding` avoids surprises on Windows.", "    text = path.read_text(encoding=\"utf-8\")"],
        ["`split()` with no argument splits on any run of spaces or newlines, so double spaces don't create empty words.", "    return len(text.split())"],
        ["The test writes a temporary file using pytest's `tmp_path`, then checks the answer.", "def test_count_words(tmp_path):\n    f = tmp_path / \"a.txt\"\n    f.write_text(\"hello  big\\nworld\")\n    assert count_words(f) == 3"],
      ],
      result: "`pytest` passes: the file has 3 words even with a double space and a newline.",
    },
    yourTurn: {
      task: "Write `count_lines(path: Path) -> int` that ignores blank lines, plus one test.",
      hints: ["`read_text().splitlines()` gives you a list of lines.", "Keep a line only if `line.strip()` is not empty."],
      answer: "`return sum(1 for line in path.read_text(encoding=\"utf-8\").splitlines() if line.strip())`, tested on a file like `\"a\\n\\nb\\n\"` which should give 2.",
    },
  },
  {
    id: "M0.2",
    diagram: {
      kind: "flow",
      steps: ["Client :: your code or browser", "Request :: method, URL, headers, body", "Server :: does the work", "Response :: status code, headers, JSON body"],
      caption: "Every web API call is one request and one response. The status code tells you what happened before you read the body.",
    },
    example: {
      title: "Read an HTTP exchange",
      problem: "You send a request to create an order and get a reply. Work out what happened.",
      steps: [
        ["The method `POST` means \"create something\". The path names the collection.", "POST /orders HTTP/1.1"],
        ["Headers carry extra facts: the body is JSON, and who you are.", "Content-Type: application/json\nAuthorization: Bearer sk-..."],
        ["The body is the new order, as JSON.", "{\"item\": \"book\", \"qty\": 2}"],
        ["The reply starts with a status. `201` means created (2xx is success).", "HTTP/1.1 201 Created"],
        ["The `Location` header and the body tell you the new order's id.", "Location: /orders/42\n\n{\"id\": 42, \"item\": \"book\", \"qty\": 2}"],
      ],
      result: "The order was created with id 42. If you'd seen `401` the key was wrong; `422` would mean the JSON didn't pass validation; `429` means slow down.",
    },
    yourTurn: {
      task: "A request `GET /orders/99` returns `404`. What does it mean, and is it safe to send the same request again?",
      hints: ["4xx codes mean the problem is in the request, not the server.", "GET only reads, so repeating it changes nothing."],
      answer: "404 means there is no order 99. GET is idempotent and safe to repeat, but repeating won't help unless the order is created first.",
    },
  },
  {
    id: "M0.3",
    diagram: {
      kind: "flow",
      steps: ["Request :: JSON arrives", "Pydantic model :: checks fields and types", "Route function :: your logic", "Response model :: shapes the reply", "Docs :: /docs generated for free"],
      caption: "FastAPI checks input against your models before your code runs, and turns bad input into a clear 422 error automatically.",
    },
    example: {
      title: "A validated POST endpoint",
      problem: "Build `POST /notes` that accepts a title and body, rejects empty titles and returns the saved note with an id.",
      steps: [
        ["Create the app.", "from fastapi import FastAPI\nfrom pydantic import BaseModel, Field\n\napp = FastAPI()"],
        ["Describe valid input. `min_length=1` rejects an empty title.", "class NoteIn(BaseModel):\n    title: str = Field(min_length=1)\n    body: str = \"\""],
        ["Describe the output, which adds an id.", "class NoteOut(NoteIn):\n    id: int"],
        ["Keep notes in memory for now.", "NOTES: list[NoteOut] = []"],
        ["The route receives an already-checked `NoteIn` and returns status 201.", "@app.post(\"/notes\", response_model=NoteOut, status_code=201)\ndef create(note: NoteIn) -> NoteOut:\n    saved = NoteOut(id=len(NOTES) + 1, **note.model_dump())\n    NOTES.append(saved)\n    return saved"],
      ],
      result: "Posting `{\"title\": \"hi\"}` returns `201` with `{\"title\": \"hi\", \"body\": \"\", \"id\": 1}`. Posting `{\"title\": \"\"}` returns `422` without your code running.",
    },
    yourTurn: {
      task: "Add `GET /notes/{note_id}` that returns the note, or a 404 if it doesn't exist.",
      hints: ["Path parameters are function arguments with the same name: `def get(note_id: int)`.", "Raise `HTTPException(status_code=404, detail=\"Not found\")` when there's no match."],
      answer: "`@app.get(\"/notes/{note_id}\", response_model=NoteOut)` then loop over `NOTES`, return the match, and `raise HTTPException(404, \"Not found\")` after the loop.",
    },
  },
  {
    id: "M0.4",
    diagram: {
      kind: "flow",
      steps: ["Tables :: users, orders", "Keys :: orders.user_id → users.id", "Index :: fast lookup on a column", "Query :: SQL joins and filters", "App :: connects with a URL from env"],
      caption: "Data lives in related tables. Indexes make common lookups fast, and the app reads its database URL from the environment, not the code.",
    },
    example: {
      title: "Find a user's recent orders",
      problem: "Given `users(id, email)` and `orders(id, user_id, total, created_at)`, list the last 5 orders for one email, quickly.",
      steps: [
        ["Join the two tables on the key that links them.", "SELECT o.id, o.total, o.created_at\nFROM orders o\nJOIN users u ON u.id = o.user_id"],
        ["Filter to one user. Use a parameter, never string formatting, to avoid SQL injection.", "WHERE u.email = %s"],
        ["Newest first, and only 5.", "ORDER BY o.created_at DESC\nLIMIT 5;"],
        ["Without an index Postgres reads every order. This index matches the filter and the sort.", "CREATE INDEX orders_user_created ON orders (user_id, created_at DESC);"],
        ["Check the plan says \"Index Scan\" rather than \"Seq Scan\".", "EXPLAIN ANALYZE SELECT ...;"],
      ],
      result: "The query returns 5 rows and, with the index, stays fast even with millions of orders.",
    },
    yourTurn: {
      task: "Write SQL for the total amount each user has spent, biggest spenders first.",
      hints: ["You need one row per user, so use `GROUP BY`.", "`SUM(o.total)` adds the totals; sort by that sum."],
      answer: "`SELECT u.email, SUM(o.total) AS spent FROM users u JOIN orders o ON o.user_id = u.id GROUP BY u.email ORDER BY spent DESC;`",
    },
  },
  {
    id: "M0.5",
    diagram: {
      kind: "flow",
      steps: ["Branch :: git switch -c feature", "Commits :: small, clear messages", "Push :: send the branch to GitHub", "Pull request :: teammates review", "Merge :: into main"],
      caption: "Work happens on a branch, gets reviewed in a pull request, and only then joins main.",
    },
    example: {
      title: "Ship a small change with a pull request",
      problem: "Fix a typo in the README without touching main directly.",
      steps: [
        ["Start from an up-to-date main.", "git switch main\ngit pull"],
        ["Make a branch named for the change.", "git switch -c fix-readme-typo"],
        ["Edit the file, then look at exactly what changed.", "git diff"],
        ["Stage and commit with a message that says what and why.", "git add README.md\ngit commit -m \"Fix typo in setup steps\""],
        ["Push the branch and open a pull request on GitHub.", "git push -u origin fix-readme-typo"],
      ],
      result: "A pull request shows a one-line diff. After review it is merged and main gets the fix, with history showing why.",
    },
    yourTurn: {
      task: "You accidentally created `.env` with an API key and Git shows it as a new file. What do you do before committing?",
      hints: ["There's a file that tells Git which paths to ignore.", "Check `git status` again after the change."],
      answer: "Add `.env` to `.gitignore`, confirm `git status` no longer lists it, and commit `.gitignore`. If the key was ever pushed, rotate it.",
    },
  },
  {
    id: "M0.6",
    diagram: {
      kind: "loop",
      steps: ["Context :: CLAUDE.md, the relevant files", "Plan :: agree what to change", "Agent edits :: code and tests", "Verify :: run tests, read the diff"],
      back: "not right yet? give feedback",
      caption: "Working with a coding agent is a loop: give it the minimum useful context, agree a plan, let it change code, then verify before you accept.",
    },
    example: {
      title: "Delegate a bug fix to a coding agent",
      problem: "The `/health` endpoint returns 500 when the database is down. Get an agent to fix it properly.",
      steps: [
        ["Give a specific task with the expected behaviour and how to check it.", "\"/health returns 500 when Postgres is down. It should return 200 with {\\\"db\\\": \\\"down\\\"}. Add a test that fakes a DB failure.\""],
        ["Ask for a plan first, so you can correct the approach before code is written.", "\"Before editing, list the files you'll change and why.\""],
        ["Let it edit and run the tests itself.", "pytest tests/test_health.py"],
        ["Read the diff yourself. Check it didn't just catch every exception and hide real bugs.", "git diff"],
        ["Run the whole test suite, not just the new test.", "pytest"],
      ],
      result: "A focused diff with a new test, which you understood and verified, instead of code you merged on trust.",
    },
    yourTurn: {
      task: "Write two lines for a project's CLAUDE.md that would stop an agent making the mistake above again.",
      hints: ["What command should it always run?", "What rule about errors should it follow?"],
      answer: "For example: \"Run `pytest` before saying a task is done.\" and \"Never catch broad `Exception` to hide errors; handle the specific failure and log it.\"",
    },
  },
  {
    id: "M0.7",
    diagram: {
      kind: "flow",
      steps: ["Dockerfile :: recipe", "Image :: built once", "Container :: running copy", "Host :: cloud server with env vars", "Public URL :: users reach it"],
      caption: "You write a recipe, build an image, run it as a container, and the host injects secrets as environment variables at run time.",
    },
    example: {
      title: "Containerize a FastAPI app",
      problem: "Package `main.py` (a FastAPI app) so it runs the same anywhere.",
      steps: [
        ["Start from a small official Python image.", "FROM python:3.12-slim"],
        ["Copy the dependency list first, so this slow layer is cached when only code changes.", "WORKDIR /app\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt"],
        ["Now copy the code.", "COPY . ."],
        ["Listen on all interfaces, not just localhost, or nothing outside the container can reach it.", "CMD [\"uvicorn\", \"main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]"],
        ["Build, then run with the port mapped and the secret passed in, never baked in.", "docker build -t notes-api .\ndocker run -p 8000:8000 -e API_KEY=$API_KEY notes-api"],
      ],
      result: "`curl localhost:8000/docs` works on your machine, and the same image runs on any host.",
    },
    yourTurn: {
      task: "Your container starts and then exits immediately. Which command shows you why?",
      hints: ["Containers keep their output even after they stop.", "You need the container's id or name from `docker ps -a`."],
      answer: "`docker logs <container>` shows the error, often a missing env var or a crash on import.",
    },
  },

  // L1 LLM 101
  {
    id: "M1.1",
    diagram: {
      kind: "loop",
      steps: ["Text so far :: \"The cat sat on the\"", "Model :: scores every possible next token", "Pick one :: \"mat\"", "Append :: text grows by one token"],
      back: "repeat until a stop token",
      caption: "An LLM writes by predicting one next token at a time and feeding its own output back in.",
    },
    example: {
      title: "Next-token prediction by hand",
      problem: "Show how a model completes \"The capital of France is\".",
      steps: [
        ["The prompt is split into tokens and given to the model.", "[\"The\", \" capital\", \" of\", \" France\", \" is\"]"],
        ["The model outputs a probability for every token in its vocabulary.", "{\" Paris\": 0.92, \" a\": 0.03, \" the\": 0.02, ...}"],
        ["One token is chosen (here, the most likely).", "\" Paris\""],
        ["It's appended and the whole thing goes back in for the next step.", "\"The capital of France is Paris\" -> {\".\": 0.71, \",\": 0.12, ...}"],
        ["This repeats until the model emits an end token or hits a length limit.", "\"The capital of France is Paris.\" <end>"],
      ],
      result: "No lookup in a database happened. The answer came from patterns learned in training, which is why it can also be confidently wrong.",
    },
    yourTurn: {
      task: "Why might the same prompt give a different answer on two runs?",
      hints: ["Step 3 \"chooses\" a token. Does it always take the top one?", "Look at the sampling settings."],
      answer: "With sampling (temperature above 0) the model sometimes picks a less likely token, and one different token changes everything after it.",
    },
  },
  {
    id: "M1.2",
    diagram: {
      kind: "flow",
      steps: ["Text :: \"unbelievable!\"", "Tokenizer :: splits into pieces", "Tokens :: \"un\" | \"believ\" | \"able\" | \"!\"", "IDs :: numbers the model reads", "Cost :: you pay per token"],
      caption: "Models don't see letters or words. They see tokens, and tokens decide cost, speed and what fits in the context.",
    },
    example: {
      title: "Estimate the cost of a prompt",
      problem: "Count tokens for a prompt and estimate the price of 10,000 calls.",
      steps: [
        ["Use the tokenizer for your model family. `tiktoken` covers OpenAI models.", "import tiktoken\nenc = tiktoken.get_encoding(\"o200k_base\")"],
        ["Encode the prompt and count.", "prompt = \"Summarise this support ticket in one sentence: ...\"\nn = len(enc.encode(prompt))  # say 480"],
        ["Add the expected answer length. Output tokens usually cost more than input.", "out = 60"],
        ["Multiply by the per-million prices from the pricing page (example numbers).", "cost = 10_000 * (n * 0.40 + out * 1.60) / 1_000_000"],
        ["Print it.", "print(round(cost, 2))  # 2.88"],
      ],
      result: "About $2.88 for 10,000 calls at these example prices. The same text in Hindi or as code can take more tokens, so measure your real inputs.",
    },
    yourTurn: {
      task: "A teammate says \"1 token = 1 word\". Give a quick way to show them why that's wrong.",
      hints: ["Pick a long or rare word.", "Encode it and count the pieces."],
      answer: "Encode something like \"tokenization\" or a Hindi sentence: you'll get several tokens for one word. English averages roughly 3 to 4 characters per token.",
    },
  },
  {
    id: "M1.3",
    diagram: {
      kind: "flow",
      steps: ["Token IDs :: numbers", "Embeddings :: a vector per token", "Attention :: each token looks at earlier ones", "Layers :: repeated many times", "Next-token scores :: probability for each token"],
      caption: "Inside a transformer: tokens become vectors, attention mixes in context from earlier tokens, and after many layers the model scores the next token.",
    },
    example: {
      title: "Attention in one sentence",
      problem: "In \"The trophy didn't fit in the suitcase because it was too big\", how does the model know what \"it\" means?",
      steps: [
        ["Each token gets an embedding vector. At first \"it\" knows nothing about the sentence.", "it -> [0.12, -0.40, ...]"],
        ["\"it\" makes a query: roughly, \"which earlier noun could I refer to?\"", "q_it = W_q · e_it"],
        ["Every earlier token offers a key. The query is compared with each key.", "score(it, trophy) = q_it · k_trophy  (high)\nscore(it, suitcase) = q_it · k_suitcase  (lower)"],
        ["Scores become weights that add up to 1 (softmax).", "weights: trophy 0.7, suitcase 0.2, others 0.1"],
        ["\"it\" becomes a weighted mix of the others' values, so it now carries the meaning of \"trophy\".", "new_it = 0.7·v_trophy + 0.2·v_suitcase + ..."],
      ],
      result: "After attention, \"it\" mostly represents \"trophy\". Many attention heads and layers do this in parallel for every token.",
    },
    yourTurn: {
      task: "A Mixture-of-Experts model has 400B total parameters but 17B active. Which number matters for speed per token, and which for memory?",
      hints: ["Only some experts run for each token.", "All experts must still be loaded somewhere."],
      answer: "Active parameters (17B) drive compute per token, so speed. Total parameters (400B) drive the memory needed to hold the model.",
    },
  },
  {
    id: "M1.4",
    diagram: {
      kind: "flow",
      steps: ["Pretraining :: predict next token on huge text", "Base model :: knows language, not manners", "SFT :: learn from good example answers", "Preference tuning :: RLHF or DPO", "Chat model :: helpful assistant"],
      caption: "A chat model is made in stages: pretraining gives knowledge, then post-training teaches it to follow instructions and be helpful.",
    },
    example: {
      title: "Why a base model and a chat model answer differently",
      problem: "Give both the prompt \"How do I boil an egg?\" and explain the different outputs.",
      steps: [
        ["A base model only continues text. Web pages often follow a question with more questions.", "Base: \"How do I boil an egg? How do I fry an egg? How do I poach...\""],
        ["SFT showed the model thousands of instruction → answer pairs.", "{\"prompt\": \"How do I...\", \"response\": \"1. Put the egg in...\"}"],
        ["Preference tuning compared answers and rewarded the clearer, safer one.", "chosen: numbered steps with times\nrejected: a long story about eggs"],
        ["So the chat model has learned the answer format people prefer.", "Chat: \"1. Place eggs in a pan of cold water. 2. Bring to a boil...\""],
      ],
      result: "Same knowledge, different behaviour. Post-training shaped how the model uses what pretraining taught it.",
    },
    yourTurn: {
      task: "A chat model keeps writing long, hedged answers. Which training stage most likely caused that habit?",
      hints: ["It's about style, not knowledge.", "Which stage uses people's preferences?"],
      answer: "Preference tuning (RLHF or DPO): if raters preferred thorough, careful answers, the model learned to write long and hedge.",
    },
  },
  {
    id: "M1.5",
    diagram: {
      kind: "flow",
      steps: ["Prompt :: 2,000 tokens", "Prefill :: read all at once (sets TTFT)", "First token :: user sees text", "Decode :: one token at a time, KV cache reused", "Done :: total latency"],
      caption: "Long prompts slow the first token (prefill). Long answers slow the finish (decode).",
    },
    example: {
      title: "Estimate response time",
      problem: "A model prefills at 5,000 tokens/s and decodes at 50 tokens/s. How long for a 3,000-token prompt and a 200-token answer?",
      steps: [
        ["Prefill time is prompt tokens ÷ prefill speed.", "3000 / 5000 = 0.6 s"],
        ["Add network and queue time, say 0.2 s, to get time to first token.", "TTFT ≈ 0.6 + 0.2 = 0.8 s"],
        ["Decode time is output tokens ÷ decode speed.", "200 / 50 = 4.0 s"],
        ["Total latency is the sum.", "total ≈ 0.8 + 4.0 = 4.8 s"],
      ],
      result: "About 0.8 s until text appears and about 4.8 s in total. Cutting the answer to 100 tokens saves 2 s; cutting the prompt in half saves only 0.3 s.",
    },
    yourTurn: {
      task: "Users complain the chatbot \"takes ages to start\". Which number do you look at, and what's one fix?",
      hints: ["\"Start\" means the first visible text.", "What makes prefill slow?"],
      answer: "Look at TTFT. Shorten or cache the long prompt prefix (prompt caching), and stream the response so text shows as soon as it exists.",
    },
  },
  {
    id: "M1.6",
    diagram: {
      kind: "flow",
      steps: ["Scores :: every token's probability", "Temperature :: sharpen or flatten", "Top-p / top-k :: cut the unlikely tail", "Sample :: pick one token"],
      caption: "Sampling settings control how adventurous the model's choices are. Match them to the task.",
    },
    example: {
      title: "Choose settings for two tasks",
      problem: "Pick settings for (a) extracting an invoice total and (b) brainstorming product names.",
      steps: [
        ["Extraction has one right answer. Make the model pick the most likely token every time.", "extract = {\"temperature\": 0}"],
        ["Brainstorming wants variety. Raise temperature so less likely words get a chance.", "brainstorm = {\"temperature\": 1.0}"],
        ["Top-p trims nonsense: only tokens in the top 90% of probability can be chosen.", "brainstorm[\"top_p\"] = 0.9"],
        ["Ask for several options in one call instead of turning temperature even higher.", "\"Give 10 different names, one per line.\""],
      ],
      result: "Extraction is repeatable and reliable; brainstorming gives varied but still sensible names.",
    },
    yourTurn: {
      task: "Your JSON output sometimes has strange typos in field names. Which setting do you check first?",
      hints: ["Typos are low-probability tokens being picked.", "What makes unlikely tokens more likely?"],
      answer: "Temperature: lower it (to 0 or near it) for structured output, and use the provider's structured output mode as well.",
    },
  },
  {
    id: "M1.7",
    diagram: {
      kind: "flow",
      steps: ["Question :: hard maths or planning", "Thinking :: hidden reasoning tokens", "Budget :: you cap how much it thinks", "Answer :: better on hard tasks, slower and pricier"],
      caption: "Reasoning models spend extra tokens thinking before they answer. That helps hard problems and wastes money on easy ones.",
    },
    example: {
      title: "Decide when to use a reasoning model",
      problem: "Route three tasks: classify ticket sentiment, plan a 6-step data migration, extract a date from an email.",
      steps: [
        ["Sentiment is a quick pattern match. A normal model is accurate and fast.", "sentiment -> standard model"],
        ["Date extraction has one clear answer in the text.", "extract date -> standard model, temperature 0"],
        ["The migration plan needs ordering, dependencies and checking edge cases. Thinking helps.", "migration plan -> reasoning model, medium budget"],
        ["Measure: try both on 20 examples of the hard task and compare quality, cost and time.", "reasoning: 18/20 good, 25 s, $0.04\nstandard: 12/20 good, 4 s, $0.005"],
      ],
      result: "Use the reasoning model only for the planning task, where it clearly earns its extra time and cost.",
    },
    yourTurn: {
      task: "A reasoning model's answers are great but users wait 30 seconds. Name two ways to cut the wait.",
      hints: ["There's a setting that limits how long it thinks.", "Not every request needs thinking."],
      answer: "Lower the thinking budget or effort, and route easy requests to a non-reasoning model. Streaming a status message also helps the wait feel shorter.",
    },
  },
  {
    id: "M1.8",
    diagram: {
      kind: "flow",
      steps: ["System prompt :: rules", "Tools :: definitions", "History :: earlier turns", "Documents :: retrieved text", "Reply :: room left for the answer"],
      caption: "The context window is a fixed budget shared by everything the model sees and everything it writes.",
    },
    example: {
      title: "Will it fit?",
      problem: "A model has a 128k-token window. Check whether a request fits and leaves room to answer.",
      steps: [
        ["Count each part.", "system = 1_500\ntools = 3_000\nhistory = 40_000\ndocs = 80_000"],
        ["Add them up.", "used = 1_500 + 3_000 + 40_000 + 80_000  # 124_500"],
        ["Reserve space for the answer, say 4,000 tokens.", "left = 128_000 - used - 4_000  # -500"],
        ["It doesn't fit. Trim the cheapest-to-lose part first: summarise old history.", "history = 10_000  # summary of older turns\nleft = 128_000 - 94_500 - 4_000  # 29_500"],
      ],
      result: "It fits after summarising history. Even when everything fits, models use the middle of a long context less well, so less is often better.",
    },
    yourTurn: {
      task: "A user asks the bot about something they said 300 messages ago and it doesn't remember. Explain why in one sentence.",
      hints: ["The API is stateless.", "What happens to old messages when the window is full?"],
      answer: "Only what's sent in the current context exists for the model; old messages were trimmed or summarised away, so that detail never reached it.",
    },
  },
  {
    id: "M1.9",
    diagram: {
      kind: "flow",
      steps: ["Strong :: summarise, rewrite, classify", "Weak :: exact counting, rare facts, maths", "Hallucination :: fluent but false", "Ask :: \"how reliably?\" with a test set"],
      caption: "LLMs are strong at language tasks and unreliable at exact facts and arithmetic. Measure how often they're right on your task.",
    },
    example: {
      title: "Measure reliability instead of guessing",
      problem: "Can a model extract the invoice number from your PDFs? Find out properly.",
      steps: [
        ["Collect 50 real invoices and write down the correct numbers.", "cases = [(\"inv_01.txt\", \"INV-2041\"), ...]"],
        ["Run the model on each.", "preds = [extract(open(f).read()) for f, _ in cases]"],
        ["Count exact matches.", "acc = sum(p == y for p, (_, y) in zip(preds, cases)) / len(cases)"],
        ["Read the misses to learn the failure mode.", "for p, (f, y) in zip(preds, cases):\n    if p != y: print(f, p, y)"],
      ],
      result: "For example 46/50 (92%). The misses were scans with two numbers on the page, so you add a rule or a human check for those.",
    },
    yourTurn: {
      task: "The model gives a confident citation to a paper that doesn't exist. What's this called and what's one guard?",
      hints: ["It's the most famous LLM failure.", "Can you check the citation automatically?"],
      answer: "A hallucination. Ground the answer in retrieved sources and verify each citation exists before showing it.",
    },
  },
  {
    id: "M1.10",
    diagram: {
      kind: "hub",
      steps: ["Your app", "Closed API :: GPT, Claude, Gemini", "Open weights :: Llama, Qwen, Mistral", "Managed platform :: Bedrock, Vertex, Foundry", "Self-hosted :: vLLM on your GPUs"],
      caption: "The same app can use a closed API, open weights via a host, a cloud platform, or your own servers. Each trades control against effort.",
    },
    example: {
      title: "Pick a family for a privacy-sensitive app",
      problem: "A hospital wants summaries of notes; data may not leave their cloud account.",
      steps: [
        ["List the hard constraint: data stays in their account.", "constraint: no public third-party API"],
        ["Closed public APIs are out unless offered inside their cloud.", "public API: no"],
        ["A managed platform in their cloud region may host suitable models.", "managed platform in-region: maybe"],
        ["Open weights on their own GPUs gives full control but needs ops skill.", "self-hosted open weights: yes, more work"],
        ["Check knowledge cutoff, licence and deprecation dates for the shortlist.", "model card -> licence allows commercial use? retirement date?"],
      ],
      result: "Shortlist: a model on their cloud's managed platform, with a self-hosted open-weight model as backup. Then test both on real notes.",
    },
    yourTurn: {
      task: "Your app pins `model-2024-05` and the provider announces it will be retired. What do you do?",
      hints: ["Don't just switch the name in production.", "What tells you the new one is as good?"],
      answer: "Run your eval set on the replacement snapshot, compare quality, cost and latency, then switch behind a config flag before the retirement date.",
    },
  },
  {
    id: "M1.11",
    diagram: {
      kind: "flow",
      steps: ["Benchmark :: fixed test set", "Score :: % correct", "Leaderboard :: rank models", "Caveats :: contamination, prompt tricks", "Shortlist :: then test on your task"],
      caption: "Leaderboards help you pick candidates. They don't tell you which model is best for your task.",
    },
    example: {
      title: "From leaderboard to shortlist",
      problem: "Choose models to test for a coding assistant.",
      steps: [
        ["Pick benchmarks close to the job: coding ones, not trivia.", "relevant: SWE-bench style, LiveCodeBench\nignore: general knowledge quizzes"],
        ["Take the top few within your budget and context needs.", "candidates = [\"model A\", \"model B\", \"model C\"]"],
        ["Note how scores were produced: same harness? self-reported?", "A: self-reported, B and C: independent"],
        ["Run them on 30 of your own tasks.", "A 19/30, B 22/30, C 21/30"],
      ],
      result: "B wins on your tasks even though A ranked higher publicly. Rank doesn't transfer automatically.",
    },
    yourTurn: {
      task: "Give one reason a model can score high on a benchmark yet do poorly for you.",
      hints: ["Where might the test questions have ended up?", "Is the benchmark like your data?"],
      answer: "The test questions may have leaked into training data (contamination), or the benchmark's tasks just differ from yours.",
    },
  },
  {
    id: "M1.12",
    diagram: {
      kind: "flow",
      steps: ["Requirements :: quality, latency, cost, privacy", "Filter :: context, modalities, deployment", "Shortlist :: 2 to 4 models", "Test :: your own examples", "Choose :: and write down why"],
      caption: "Model choice is a workflow: hard constraints first, then a small test on your data, then a written decision.",
    },
    example: {
      title: "Pick a model for support replies",
      problem: "Need: under 2 s to first token, under $0.002 per reply, EU data, good tone.",
      steps: [
        ["Drop models that fail a hard constraint.", "no EU region -> out\ntoo slow -> out"],
        ["Estimate cost per reply from token counts and prices.", "1,200 in + 150 out at listed prices -> $0.0011"],
        ["Test the 3 survivors on 40 real tickets, graded with a rubric.", "tone + correctness score: A 4.1, B 4.3, C 3.6"],
        ["Write it down so the choice can be revisited.", "Chose B: best score, $0.0012/reply, TTFT 0.9 s. Re-test on new versions."],
      ],
      result: "Model B, chosen on measured quality within the budget, not by reputation.",
    },
    yourTurn: {
      task: "The cheapest model scores 3.9 and the best scores 4.3 but costs 8×. How do you decide?",
      hints: ["What does a 0.4 difference mean for users?", "Could you use both?"],
      answer: "Look at what the failures are. If cheap mistakes are rare and harmless, use it; or route hard tickets to the better model and the rest to the cheap one.",
    },
  },
];
