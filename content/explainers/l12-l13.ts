import type { ExplainerSrc } from "./types";

export const EXPLAINERS_L12_L13: ExplainerSrc[] = [
  {
    id: "M12.1",
    diagram: {
      kind: "flow",
      steps: ["Image | Audio | Text", "Encoders :: turn each into tokens", "One model :: reads them together", "Output :: text, image or speech"],
      caption: "A native multimodal model reads different kinds of input as tokens in one sequence. A pipeline converts everything to text first and loses detail.",
    },
    example: {
      title: "Native model versus a text pipeline",
      problem: "A user sends a photo of a rash and asks \"is this getting worse?\" with a voice note.",
      steps: [
        ["Pipeline: caption the image, transcribe the audio, send text to an LLM.", "caption: \"red patch on arm\"; transcript: \"is this getting worse\""],
        ["The caption drops what matters: size, edges, colour change.", "lost: detail the question depends on"],
        ["The transcript drops tone: the user sounds worried.", "lost: urgency"],
        ["A native model reads the pixels and audio directly.", "can describe edges and colour from the image itself"],
      ],
      result: "The native model has more to work with. A pipeline can still be right for simple tasks, but know what each conversion throws away.",
    },
    yourTurn: {
      task: "When is a caption-then-text pipeline good enough?",
      hints: ["Does the question need fine visual detail?", "Is a short description enough?"],
      answer: "When the text summary carries everything the task needs, such as \"is there a dog in this photo?\" or tagging images by topic.",
    },
  },
  {
    id: "M12.2",
    diagram: {
      kind: "flow",
      steps: ["Image :: 2048×1536", "Resize / tile :: fixed-size pieces", "Patches :: small squares", "Vision encoder :: tokens", "Context :: shares space with text"],
      caption: "Images become many tokens. Bigger or higher-detail images cost more and fill the context faster.",
    },
    example: {
      title: "Estimate image token cost",
      problem: "A provider tiles images into 512×512 tiles at about 170 tokens each, plus 85 base tokens. Cost of a 1024×1024 image?",
      steps: [
        ["Count tiles: 1024 ÷ 512 = 2 across and 2 down.", "2 × 2 = 4 tiles"],
        ["Tokens for tiles.", "4 × 170 = 680"],
        ["Add the base.", "680 + 85 = 765 tokens"],
        ["Low-detail mode skips tiles.", "low detail ≈ 85 tokens"],
      ],
      result: "About 765 tokens in high detail versus 85 in low (using these example rates). For \"what colour is the car?\" low detail is plenty.",
    },
    yourTurn: {
      task: "A model misreads tiny text in a full-page screenshot. What do you try?",
      hints: ["What did downscaling do to the text?", "Could you send part of the image?"],
      answer: "Crop to the region with the text, or send it in high detail or as tiles, so the small text survives resizing.",
    },
  },
  {
    id: "M12.3",
    diagram: {
      kind: "flow",
      steps: ["Strong :: describe, read clear text, classify", "Weak :: count, measure, dense tables", "Risk :: invents detail", "Safeguards :: verify, crop, ask a human"],
      caption: "Vision models describe scenes well and fail at counting, spatial detail and dense tables. Measure reliability on your images.",
    },
    example: {
      title: "Check counting reliability",
      problem: "Can a model count items on warehouse shelf photos?",
      steps: [
        ["Label 40 photos with true counts.", "cases = [(\"shelf_01.jpg\", 17), ...]"],
        ["Ask the model for counts.", "pred = vision(\"How many boxes? Number only.\", img)"],
        ["Measure exact and near accuracy.", "exact: 14/40; within ±2: 27/40"],
        ["Look at failures.", "misses grow above ~12 boxes and with overlap"],
      ],
      result: "Too unreliable for inventory counts. Use a detection model for counting, or the LLM only for small, clear scenes with human checks.",
    },
    yourTurn: {
      task: "The model says a receipt total is $48.20; the image shows $46.20. What safeguard would catch this?",
      hints: ["Is there a way to check the number?", "Do the line items add up?"],
      answer: "Check the extracted total against the sum of extracted line items, and route mismatches to a human.",
    },
  },
  {
    id: "M12.4",
    diagram: {
      kind: "flow",
      steps: ["PDF page", "Text layer? :: extract | Scan? :: OCR or vision", "Schema :: fields to fill", "Validate :: types, totals, page region", "Low confidence → review"],
      caption: "Document AI: pick the right reader for each page, extract into a schema, validate, and send uncertain fields to a person.",
    },
    example: {
      title: "Extract fields from invoices",
      problem: "Pull vendor, date and total from mixed digital and scanned invoices.",
      steps: [
        ["Decide per page: real text or image?", "text = page.extract_text()\nuse_vision = len(text.strip()) < 30"],
        ["Define the schema first.", "class Inv(BaseModel):\n    vendor: str\n    date: date\n    total: Decimal\n    page: int"],
        ["Extract with the schema (text model or vision model).", "inv = extract(Inv, text or page_image)"],
        ["Validate business rules.", "ok = inv.total == sum(line.amount for line in lines)"],
        ["Route failures to review with the page attached.", "if not ok: review_queue.add(doc_id, page=inv.page)"],
      ],
      result: "Clean structured data for most invoices, and the doubtful ones go to a person with the page in hand.",
    },
    yourTurn: {
      task: "For visual RAG over slide decks, what should the retrieval unit be?",
      hints: ["Slides mix text, charts and layout.", "What can you cite?"],
      answer: "The page or slide (or a region of it), stored as an image with any extracted text, so answers can cite and show the exact slide.",
    },
  },
  {
    id: "M12.5",
    diagram: {
      kind: "loop",
      steps: ["Noise :: random pixels", "Denoise step :: guided by the prompt", "Slightly clearer image"],
      back: "repeat for N steps",
      caption: "Image generators start from noise and clean it step by step toward the prompt. A seed fixes the starting noise.",
    },
    example: {
      title: "Get a reproducible product image",
      problem: "Generate a product photo, then make small changes without starting over.",
      steps: [
        ["Write a specific prompt: subject, setting, lighting, style.", "\"white ceramic mug on a wooden desk, soft morning light, product photo\""],
        ["Fix the seed so you can reproduce it.", "seed = 1234"],
        ["Generate a few and pick one.", "imgs = gen(prompt, seed=seed, n=4)"],
        ["Change one area with inpainting instead of regenerating.", "inpaint(img, mask=mug_handle, prompt=\"blue handle\")"],
        ["Track cost per accepted image.", "12 generations for 3 accepted images -> 4 per keeper"],
      ],
      result: "A repeatable image with targeted edits. Cost per accepted image, not per generation, is the real number.",
    },
    yourTurn: {
      task: "Why does the same prompt give a completely different picture each time?",
      hints: ["Where does the process start?", "What controls that?"],
      answer: "Each run starts from different random noise. Set a fixed seed to get the same starting point and a reproducible result.",
    },
  },
  {
    id: "M12.6",
    diagram: {
      kind: "flow",
      steps: ["Waveform", "Spectrogram :: frequencies over time", "Audio tokens", "Model", "Text or speech out"],
      caption: "Audio becomes tokens by time, so cost and latency grow with seconds, not words.",
    },
    example: {
      title: "Transcribe-then-prompt versus audio-native",
      problem: "Analyse 1,000 support calls for customer frustration.",
      steps: [
        ["Transcribe-then-prompt: cheap, text is searchable.", "whisper -> text -> LLM \"rate frustration 1 to 5\""],
        ["But the transcript drops tone, pauses and sighs.", "\"Fine. Whatever.\" reads neutral on paper"],
        ["Audio-native: the model hears tone directly.", "audio_model(call_audio, \"rate frustration 1 to 5\")"],
        ["Compare on 50 calls rated by people.", "transcript 62% agree, audio-native 81% agree"],
      ],
      result: "Audio-native is better for emotion; transcripts are cheaper and fine for \"what was the call about?\".",
    },
    yourTurn: {
      task: "A 10-minute call costs far more than a 10-line chat. Why?",
      hints: ["How is audio counted?", "Silence still takes time."],
      answer: "Audio is billed and processed per second, so a long call is many tokens even if few words are said.",
    },
  },
  {
    id: "M12.7",
    diagram: {
      kind: "flow",
      steps: ["Speech in", "STT :: Whisper → text + timestamps", "Diarize :: who spoke", "LLM", "TTS :: text → voice"],
      caption: "Speech-to-text and text-to-speech wrap an LLM. Check word error rate on your accents and noise, not a benchmark.",
    },
    example: {
      title: "Measure word error rate",
      problem: "Is your speech-to-text good enough for Indian-English support calls?",
      steps: [
        ["Get 20 short clips with human transcripts.", "refs = [\"please reset my upi pin\", ...]"],
        ["Transcribe them.", "hyps = [stt(clip) for clip in clips]"],
        ["Compute WER = (substitutions + deletions + insertions) ÷ reference words.", "import jiwer\nwer = jiwer.wer(refs, hyps)"],
        ["Read the errors, not just the number.", "\"UPI\" -> \"you pee eye\"; product names mangled"],
        ["Fix with a vocabulary prompt or custom terms.", "prompt=\"UPI, NEFT, IFSC\" -> WER 14% -> 8%"],
      ],
      result: "WER drops from 14% to 8% by giving the model your domain words, and you know which errors remain.",
    },
    yourTurn: {
      task: "The TTS voice reads \"Dr.\" as \"drive\". How do you fix it?",
      hints: ["You control the text before it's spoken.", "Some engines take pronunciation hints."],
      answer: "Normalise the text first (\"Dr.\" → \"Doctor\"), or use the engine's pronunciation controls such as SSML or a custom lexicon.",
    },
  },
  {
    id: "M12.8",
    diagram: {
      kind: "flow",
      steps: ["User speaks", "VAD + endpointing :: detect end of turn", "STT → LLM → TTS :: or speech-to-speech", "Agent speaks", "Barge-in :: user interrupts, agent stops"],
      caption: "Voice agents live or die on latency. Every stage adds milliseconds, and turn-taking has to feel natural.",
    },
    example: {
      title: "Find where the milliseconds go",
      problem: "A voice agent takes 2.4 s to reply after the user stops talking. Target: under 1 s.",
      steps: [
        ["Measure each stage.", "endpointing 700 ms | STT final 300 ms | LLM first token 900 ms | TTS first audio 500 ms"],
        ["Shorten the silence needed to decide the user finished.", "endpoint wait 700 -> 300 ms (with a smarter turn detector)"],
        ["Start the LLM on the partial transcript.", "saves ~200 ms"],
        ["Smaller, faster model and streaming TTS that speaks the first sentence early.", "LLM 900 -> 350 ms; TTS 500 -> 200 ms"],
      ],
      result: "Roughly 0.9 s end to end. The biggest win was endpointing, which most people don't think to measure.",
    },
    yourTurn: {
      task: "The agent is mid-sentence and the user says \"no, wait\". What should happen?",
      hints: ["Barge-in.", "What does the agent's state need to know?"],
      answer: "Stop speaking immediately, listen, and record that the user only heard part of the reply, so the next turn doesn't assume they heard it all.",
    },
  },
  {
    id: "M12.9",
    diagram: {
      kind: "flow",
      steps: ["Text query :: \"red running shoes\"", "Shared embedding space :: CLIP-style", "Image vectors", "Nearest images"],
      caption: "Cross-modal search puts text and images in one embedding space, so words can find pictures directly.",
    },
    example: {
      title: "Search photos with text",
      problem: "Find product photos matching \"red running shoes\" without captions.",
      steps: [
        ["Embed every image once with the image encoder.", "img_vecs = clip.encode_images(photos)"],
        ["Embed the query with the matching text encoder.", "q = clip.encode_text(\"red running shoes\")"],
        ["Score by cosine similarity and take the top 10.", "top = np.argsort(-(img_vecs @ q))[:10]"],
        ["Check on your own catalogue with a few labelled queries.", "precision@10: 0.8 for colours, 0.4 for brand names"],
      ],
      result: "Good for visual concepts like colour and type; weak for brand names and text on the product, where captions or OCR help.",
    },
    yourTurn: {
      task: "When might caption-then-search beat cross-modal embeddings?",
      hints: ["What does CLIP read poorly?", "What can a caption include?"],
      answer: "When queries depend on text in the image or specific details (brands, model numbers) that a good caption or OCR captures better.",
    },
  },
  {
    id: "M12.10",
    diagram: {
      kind: "flow",
      steps: ["Modalities needed", "Price :: per image, per minute", "Latency per modality", "Privacy :: faces, voices, scans", "Shortlist → test on your data"],
      caption: "Choose multimodal models from what you must handle, then price, latency and privacy, then your own test.",
    },
    example: {
      title: "Pick a model for a receipts app",
      problem: "Users photograph receipts; the app extracts totals. 30,000 receipts a month.",
      steps: [
        ["Modalities: image in, structured text out.", "need vision + schema output"],
        ["Price per image at your typical resolution.", "model A $0.002, model B $0.006"],
        ["Monthly cost.", "A: 30,000 × 0.002 = $60; B: $180"],
        ["Test on 100 real receipts.", "A 91% exact totals, B 96%"],
        ["Privacy: receipts can show card digits and names.", "redact before storing; check retention terms"],
      ],
      result: "B for $120 more per month if 5 points of accuracy saves enough manual fixes; otherwise A plus a validation step.",
    },
    yourTurn: {
      task: "Why test on your own data rather than trusting a vision leaderboard?",
      hints: ["Your images vs benchmark images.", "Lighting, angles, crumpled paper..."],
      answer: "Your images (lighting, angles, languages, layouts) differ from benchmark sets, so rankings may not hold. Only your data tells you.",
    },
  },
  {
    id: "M12.11",
    diagram: {
      kind: "flow",
      steps: ["Question", "Plan :: sub-questions", "Search wide, then deep", "Notes :: claims + sources", "Report :: auditable, with citations"],
      caption: "Deep research agents run for a long time. They need a plan, notes outside the context, a stop rule and a report a human can check.",
    },
    example: {
      title: "Structure a research run",
      problem: "\"How are Indian banks using GenAI in customer service?\"",
      steps: [
        ["Break it into sub-questions.", "which banks? which use cases? results reported? risks raised?"],
        ["Search broadly first, then read the best sources in depth.", "20 search results -> 8 read fully"],
        ["Write each claim with its source to a notes file.", "- HDFC chatbot handles X queries/month (source URL, date)"],
        ["Reconcile conflicts by date and source quality.", "two figures disagree -> prefer the newer official release, note both"],
        ["Stop when sub-questions are answered or the budget is spent.", "max 40 tool calls, 15 minutes"],
      ],
      result: "A report where every claim links to a source, so a reader can verify it in minutes.",
    },
    yourTurn: {
      task: "Name one common way long research runs fail.",
      hints: ["Context fills up...", "...or the agent never stops."],
      answer: "For example: losing the original question as context grows, looping on searches, or trusting one weak source. Notes, plans and stop rules prevent these.",
    },
  },
  {
    id: "M12.12",
    diagram: {
      kind: "flow",
      steps: ["Full model :: 16-bit, large", "Quantize :: 4-bit, smaller", "Device :: phone or laptop", "Benefits :: offline, private, no per-call cost", "Limits :: memory, battery, quality"],
      caption: "On-device AI trades some quality for privacy, offline use and zero per-call cost. Quantization makes models small enough to fit.",
    },
    example: {
      title: "Will it fit on a laptop?",
      problem: "Can a 7B model run on a laptop with 16 GB RAM?",
      steps: [
        ["At 16-bit, each parameter is 2 bytes.", "7B × 2 = 14 GB (too tight with the OS and apps)"],
        ["At 4-bit, each parameter is half a byte.", "7B × 0.5 = 3.5 GB"],
        ["Add room for the KV cache and runtime.", "≈ 5 GB total"],
        ["Run it locally and check quality on your task.", "ollama run <7b-model>:q4 -> 4% lower on your eval than 16-bit"],
      ],
      result: "The 4-bit version fits comfortably with a small quality cost, and nothing leaves the laptop.",
    },
    yourTurn: {
      task: "Give one reason to choose on-device and one reason to choose an API.",
      hints: ["Privacy and offline...", "...versus quality and device limits."],
      answer: "On-device: private data stays local and works offline. API: much stronger models without draining the user's battery or memory.",
    },
  },

  // L13 Fine-tuning
  {
    id: "M13.1",
    diagram: {
      kind: "flow",
      steps: ["Measured failure", "Try prompt fixes", "Try RAG / tools", "Still failing on style or format? :: fine-tune", "Accept the costs :: data, training, serving"],
      caption: "Fine-tuning is the most expensive option. Reach for it after a measured failure that prompts and retrieval can't fix.",
    },
    example: {
      title: "Should this team fine-tune?",
      problem: "Ticket tags are inconsistent with the company's 40-label scheme. A team wants to fine-tune.",
      steps: [
        ["Measure the current baseline.", "prompted model: 78% correct tags"],
        ["Try cheaper fixes first: better label descriptions and 20 examples.", "-> 84%"],
        ["Add retrieval of similar past tickets as examples.", "-> 88%"],
        ["The target is 95% and the remaining errors are subtle house conventions.", "consistent style/format problem -> fine-tuning fits"],
        ["Count the full cost: labelled data, training, evals, serving, retraining.", "2,000 labelled tickets, a pinned base model"],
      ],
      result: "Fine-tuning is justified here, but only after cheaper steps got 10 points and the gap that remains is the kind tuning fixes.",
    },
    yourTurn: {
      task: "Should you fine-tune to teach the model your product prices?",
      hints: ["Is this a fact or a behaviour?", "How often do prices change?"],
      answer: "No. Facts that change belong in RAG or a tool. Fine-tuning is for consistent behaviour, style or format.",
    },
  },
  {
    id: "M13.2",
    diagram: {
      kind: "flow",
      steps: ["Spec :: what good looks like", "Collect :: real examples", "Clean :: fix or drop bad ones", "Format :: model's chat template", "Split :: train / val / test, no leaks"],
      caption: "Fine-tuning data matters more than settings. A few hundred clean, varied examples beat thousands of noisy ones.",
    },
    example: {
      title: "Build a leak-free dataset",
      problem: "Make training data from 3,000 past tagged tickets.",
      steps: [
        ["Deduplicate near-identical tickets so copies can't land in both train and test.", "dedupe by normalised text hash"],
        ["Remove bad labels found by spot checks.", "drop 180 tickets with wrong or missing tags"],
        ["Strip PII.", "names, emails, order ids -> placeholders"],
        ["Format as chat messages in the expected template.", "{\"messages\": [{\"role\": \"system\", ...}, {\"role\": \"user\", \"content\": ticket}, {\"role\": \"assistant\", \"content\": tag}]}"],
        ["Split by customer, not randomly, to avoid leakage.", "train 80% / val 10% / test 10%, grouped by customer_id"],
        ["Version the dataset.", "tickets-v3.jsonl, sha256 recorded"],
      ],
      result: "About 2,800 clean, private, leak-free examples with a fixed test set you never train on.",
    },
    yourTurn: {
      task: "Why train on the response tokens only, not the prompt?",
      hints: ["What do you want the model to learn to produce?", "Prompts repeat a lot."],
      answer: "You want it to learn the answers, not to reproduce the prompts. Masking the prompt focuses learning on the responses.",
    },
  },
  {
    id: "M13.3",
    diagram: {
      kind: "flow",
      steps: ["Base model", "Train :: examples, a few epochs", "Watch loss :: train and validation", "Read outputs :: not just loss", "Pick checkpoint :: best on validation"],
      caption: "SFT teaches by example. Watch both loss curves, read real outputs, and stop before the model memorises.",
    },
    example: {
      title: "A first SFT run with TRL",
      problem: "Fine-tune a small model on your tagged tickets.",
      steps: [
        ["Load the dataset.", "from datasets import load_dataset\nds = load_dataset(\"json\", data_files={\"train\": \"train.jsonl\", \"validation\": \"val.jsonl\"})"],
        ["Set a few key hyperparameters.", "from trl import SFTConfig, SFTTrainer\ncfg = SFTConfig(output_dir=\"out\", num_train_epochs=2, learning_rate=2e-5, eval_strategy=\"steps\", eval_steps=50)"],
        ["Train.", "trainer = SFTTrainer(model=BASE, args=cfg, train_dataset=ds[\"train\"], eval_dataset=ds[\"validation\"])\ntrainer.train()"],
        ["Read the curves: if validation loss rises while training loss falls, it's overfitting.", "best validation loss at step 300 of 500"],
        ["Read 20 outputs from the step-300 checkpoint and run the test set.", "test accuracy 93%"],
      ],
      result: "Checkpoint 300 is the one to keep: best on validation and good on real outputs.",
    },
    yourTurn: {
      task: "After fine-tuning, the model is great at tags but worse at simple chat. What happened?",
      hints: ["It learned the narrow task very well...", "...and lost something else."],
      answer: "Catastrophic forgetting. Use fewer epochs or a lower learning rate, mix in some general data, or use LoRA, and test general skills too.",
    },
  },
  {
    id: "M13.4",
    diagram: {
      kind: "flow",
      steps: ["Base model :: frozen", "LoRA adapter :: small trainable matrices", "QLoRA :: base in 4-bit to save memory", "Train adapter only", "Small file :: a few MB to hundreds of MB"],
      caption: "LoRA trains a small add-on instead of the whole model, so tuning fits on one GPU and adapters are cheap to store and swap.",
    },
    example: {
      title: "Set up QLoRA",
      problem: "Fine-tune an 8B model on a single 24 GB GPU.",
      steps: [
        ["Load the base in 4-bit.", "bnb = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type=\"nf4\")\nmodel = AutoModelForCausalLM.from_pretrained(BASE, quantization_config=bnb)"],
        ["Add a LoRA adapter on the attention projections.", "lora = LoraConfig(r=16, lora_alpha=32, target_modules=[\"q_proj\", \"k_proj\", \"v_proj\", \"o_proj\"], task_type=\"CAUSAL_LM\")"],
        ["Only the adapter trains.", "model = get_peft_model(model, lora)\nmodel.print_trainable_parameters()  # well under 1% of all parameters"],
        ["Estimate memory: 8B × 0.5 bytes ≈ 4 GB for the base, plus activations and optimizer state for the adapter.", "fits in 24 GB with a modest batch"],
      ],
      result: "Training fits on one GPU, and the result is a small adapter file instead of a whole new model.",
    },
    yourTurn: {
      task: "What does raising the LoRA rank `r` do?",
      hints: ["More trainable numbers...", "...more capacity, more memory."],
      answer: "It gives the adapter more capacity to learn, at the cost of more memory and a higher chance of overfitting on small data. Start small (8 to 16) and test.",
    },
  },
  {
    id: "M13.5",
    diagram: {
      kind: "flow",
      steps: ["SFT model", "Preference pairs :: chosen vs rejected", "DPO :: push toward chosen", "Better-preferred answers"],
      caption: "Preference tuning teaches which of two answers is better, for things that are easier to judge than to demonstrate.",
    },
    example: {
      title: "Build preference pairs",
      problem: "Support replies are correct but too long. Teach the model to prefer concise ones.",
      steps: [
        ["Generate two replies per prompt.", "a, b = model(prompt), model(prompt)"],
        ["Have reviewers pick the better one with a written guide.", "guide: correct first, then concise, then friendly"],
        ["Store as pairs.", "{\"prompt\": p, \"chosen\": short_correct, \"rejected\": long_correct}"],
        ["Watch for length bias: don't always prefer the shorter one.", "include pairs where the longer answer is better because it's complete"],
        ["Check rater agreement.", "two raters agree on 84% of pairs"],
      ],
      result: "A dataset that teaches \"concise but complete\", not just \"short\". Train DPO on top of the SFT model.",
    },
    yourTurn: {
      task: "When is SFT alone enough, without DPO?",
      hints: ["Can you write the ideal answer easily?", "Is there one right format?"],
      answer: "When you can write good example answers directly and the task has a clear right output, such as classification or a fixed format.",
    },
  },
  {
    id: "M13.6",
    diagram: {
      kind: "loop",
      steps: ["Model answers", "Grader :: scores each answer", "Update :: reward higher scores"],
      back: "repeat over many prompts",
      caption: "Reinforcement fine-tuning improves a model using a grader's scores. It works when answers can be checked automatically.",
    },
    example: {
      title: "Design a reward for SQL generation",
      problem: "Improve a model that writes SQL from questions.",
      steps: [
        ["Answers are gradable: run the SQL and compare results.", "score = 1.0 if run(sql) == run(gold_sql) else 0.0"],
        ["Give partial credit carefully.", "+0.2 if it runs without error"],
        ["Look for reward hacking: could the model score without being right?", "e.g. `SELECT * FROM t` matching on tiny tables"],
        ["Close the hole.", "test on several databases with different data"],
        ["Compare with SFT on the same test set.", "SFT 71%, RFT 79%"],
      ],
      result: "RFT helps because correctness can be checked by running the query, and testing on varied data stops the model gaming the reward.",
    },
    yourTurn: {
      task: "Why is RFT a poor fit for \"write a friendlier email\"?",
      hints: ["Can a program reliably score friendliness?", "What would the model learn to exploit?"],
      answer: "There's no reliable automatic grader, so the model would learn to game whatever imperfect score you use. Preference tuning fits better.",
    },
  },
  {
    id: "M13.7",
    diagram: {
      kind: "flow",
      steps: ["Teacher :: large, expensive", "Generate :: answers on many inputs", "Filter :: keep the good ones", "Student :: small model trained on them", "Cheaper, faster at this task"],
      caption: "Distillation copies a big model's skill on one task into a small model. It also copies the teacher's mistakes.",
    },
    example: {
      title: "Distil a classifier",
      problem: "A large model classifies support tickets at 94% but costs too much at scale.",
      steps: [
        ["Run the teacher on 10,000 unlabelled tickets.", "labels = [teacher(t) for t in tickets]"],
        ["Filter: drop low-confidence or disagreeing outputs.", "keep 8,700"],
        ["Train a small model on them.", "SFT small model on (ticket, label) pairs"],
        ["Test on a human-labelled set, not teacher labels.", "teacher 94%, student 91%"],
        ["Check the teacher's terms allow training on its outputs.", "provider terms reviewed: allowed for this use"],
      ],
      result: "91% at about a tenth of the cost and latency. The 3-point drop is accepted because volume is huge.",
    },
    yourTurn: {
      task: "Why test the student on human labels, not more teacher labels?",
      hints: ["What if the teacher is wrong?", "The student copies it."],
      answer: "Teacher labels contain the teacher's mistakes, so matching them can look perfect while being wrong. Human labels measure real accuracy.",
    },
  },
  {
    id: "M13.8",
    diagram: {
      kind: "flow",
      steps: ["Baselines :: prompted model, base model", "Same held-out set :: same judge", "Task score", "Regressions :: other skills, safety", "Decision record"],
      caption: "A fine-tune is only good if it beats a strong prompted baseline on the same test, without breaking other things.",
    },
    example: {
      title: "Evaluate a fine-tune honestly",
      problem: "Your LoRA scores 93%. Is it worth deploying?",
      steps: [
        ["Same test set and judge for everything.", "test.jsonl, 300 examples, never trained on"],
        ["Compare against a well-prompted baseline.", "prompted large model 90%, prompted small 82%, LoRA small 93%"],
        ["Check for regressions outside the task.", "general chat eval: -2%; safety refusals: unchanged"],
        ["Read individual failures.", "LoRA fails on new product names (not in training data)"],
        ["Write the decision down.", "Deploy LoRA: +3 points vs large prompted, at 1/6 of the cost. Retrain monthly for new products."],
      ],
      result: "A clear, evidence-backed decision, including the known weakness and the plan to handle it.",
    },
    yourTurn: {
      task: "The fine-tune beats the base model but not a well-prompted large model. What now?",
      hints: ["Is there another reason to keep it?", "Cost, latency, privacy?"],
      answer: "Only deploy if it wins on something that matters, like cost, latency or running privately. Otherwise use the prompted model and save the upkeep.",
    },
  },
  {
    id: "M13.9",
    diagram: {
      kind: "flow",
      steps: ["Adapter :: separate or merged", "Serve :: vLLM multi-LoRA or managed", "Gateway :: route 10% → new version", "Watch :: quality, latency, cost", "Roll out or roll back"],
      caption: "Serving a fine-tune means versioning the adapter, matching the template, and rolling it out gradually like any release.",
    },
    example: {
      title: "Serve a LoRA with vLLM and roll it out",
      problem: "Deploy the ticket-tagging adapter safely.",
      steps: [
        ["Start vLLM with LoRA enabled and the adapter registered.", "vllm serve BASE --enable-lora --lora-modules tagger-v2=./adapters/tagger-v2"],
        ["Call it by the adapter's name.", "client.chat.completions.create(model=\"tagger-v2\", messages=msgs)"],
        ["Use the exact chat template from training.", "same system prompt and message format as train.jsonl"],
        ["Route 10% of traffic to it through the gateway.", "tagger: 90% tagger-v1, 10% tagger-v2"],
        ["Compare live metrics, then increase or roll back.", "v2 accuracy on sampled checks +4%, latency same -> 100%"],
      ],
      result: "The new adapter reaches all traffic only after proving itself on 10%, and switching back is one routing change.",
    },
    yourTurn: {
      task: "The served adapter gives worse answers than in testing. What's the first thing to check?",
      hints: ["Training saw text in a specific format.", "Is serving using the same?"],
      answer: "That the chat template, tokenizer and system prompt match training exactly. A mismatched template is a very common cause.",
    },
  },
];
