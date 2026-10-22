import type { AppliedModule } from "./types";

const BE_MY_EYES = { label: "OpenAI customer story: Be My Eyes", url: "https://openai.com/customer-stories/be-my-eyes", kind: "case-study" } as const;
const CLAUDE_VISION = { label: "Claude docs: Vision", url: "https://platform.claude.com/docs/en/build-with-claude/vision", kind: "docs" } as const;
const CLAUDE_PDF = { label: "Claude docs: PDF support", url: "https://platform.claude.com/docs/en/build-with-claude/pdf-support", kind: "docs" } as const;
const CLIP = { label: "Radford et al.: Learning transferable visual models from natural language supervision (CLIP)", url: "https://arxiv.org/pdf/2103.00020", kind: "paper" } as const;
const COLPALI = { label: "Faysse et al.: ColPali, efficient document retrieval with vision language models", url: "https://arxiv.org/html/2407.01449v5", kind: "paper" } as const;
const KLARNA_IMAGES = { label: "Marketing Dive: Klarna uses generative AI to cut marketing costs", url: "https://www.marketingdive.com/news/klarna-gen-ai-openai-cut-marketing-spend-efficiency/717332/", kind: "news" } as const;
const DIFFUSERS = { label: "Hugging Face docs: Diffusers", url: "https://huggingface.co/docs/diffusers/index", kind: "docs" } as const;
const DIFFUSERS_INPAINT = { label: "Hugging Face docs: Inpainting with Diffusers", url: "https://huggingface.co/docs/diffusers/using-diffusers/inpaint", kind: "docs" } as const;
const WHISPER = { label: "Radford et al.: Robust speech recognition via large-scale weak supervision (Whisper)", url: "https://arxiv.org/pdf/2212.04356", kind: "paper" } as const;
const WHISPER_CARD = { label: "OpenAI: Whisper model card", url: "https://github.com/openai/whisper/blob/main/model-card.md", kind: "docs" } as const;
const VOICE_AGENTS = { label: "OpenAI docs: Voice agents", url: "https://developers.openai.com/api/docs/guides/voice-agents", kind: "docs" } as const;
const DUOLINGO = { label: "Tech Brew: Duolingo debuts AI video chats", url: "https://www.techbrew.com/stories/2024/09/25/duolingo-debuts-ai-video-chats", kind: "news" } as const;
const LIVEKIT = { label: "LiveKit docs: Agents framework", url: "https://docs.livekit.io/agents/", kind: "docs" } as const;
const SILERO = { label: "Silero VAD (GitHub)", url: "https://github.com/snakers4/silero-vad", kind: "docs" } as const;
const KOKORO = { label: "Kokoro text-to-speech model (GitHub)", url: "https://github.com/hexgrad/kokoro", kind: "docs" } as const;
const WHISPER_CPP = { label: "whisper.cpp (GitHub)", url: "https://github.com/ggml-org/whisper.cpp", kind: "docs" } as const;
const APPLE_FM = { label: "Apple Machine Learning Research: Introducing Apple's on-device and server foundation models", url: "https://machinelearning.apple.com/research/introducing-apple-foundation-models", kind: "blog" } as const;
const DOORDASH_BEDROCK = { label: "AWS case study: DoorDash builds a generative AI contact center with Amazon Bedrock", url: "https://aws.amazon.com/solutions/case-studies/doordash-bedrock-case-study", kind: "case-study" } as const;
const RESEARCH = { label: "Anthropic: How we built our multi-agent research system", url: "https://www.anthropic.com/engineering/multi-agent-research-system", kind: "blog" } as const;
const HARNESS = { label: "Anthropic: Effective harnesses for long-running agents", url: "https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents", kind: "case-study" } as const;
const DEEP_RESEARCH_COURSE = { label: "LangChain Academy: Deep research with LangGraph", url: "https://academy.langchain.com/courses/deep-research-with-langgraph", kind: "docs" } as const;
const AA_MODELS = { label: "Artificial Analysis: models by intelligence, speed and price", url: "https://artificialanalysis.ai/models", kind: "docs" } as const;
const SBERT_SEARCH = { label: "Sentence Transformers: Semantic search", url: "https://sbert.net/examples/sentence_transformer/applications/semantic-search/README.html", kind: "docs" } as const;

export const APPLIED_L12: AppliedModule[] = [
  {
    moduleId: "M12.1",
    howItWorks:
      "A multimodal model takes more than text as input (images, PDFs, audio, sometimes video) and sometimes produces more than text. In most products the extra modality is just another part of the request: the app sends a photo or a recording alongside the instructions, and the model answers in text that the app then acts on. The value comes from removing a manual step, such as typing out what is on a screen, describing a photo, or transcribing a call. The engineering work is the same as for text (prompts, evals, cost and latency) plus a few new concerns: file size and resolution, privacy of what is in the picture or recording, and failure modes that look different from text errors.",
    uses: [
      {
        who: "Be My Eyes",
        what: "Be My Eyes built a Virtual Volunteer on GPT-4 for blind and low-vision people: a user sends a photo and the model reasons about it, for example suggesting recipes from what is in a fridge or reading a transit map, and the feature was beta-tested with staff before wider release.",
        source: BE_MY_EYES,
      },
      {
        who: "Duolingo",
        what: "Duolingo's Video Call feature lets learners talk out loud with an AI character, Lily, built on OpenAI models. The company spent about a year iterating on it and adding guardrails so the conversation suits each learner's level.",
        source: DUOLINGO,
      },
    ],
    scenario: {
      title: "Adding photo input to a home-insurance claims app",
      context:
        "Customers file claims by typing a description of the damage. Adjusters then ask for photos and re-key details. The team wants customers to upload photos and get a draft claim filled in for them to confirm.",
      architecture:
        "The app sends the photos plus a structured-output prompt to a vision model, which returns damage type, affected area and visible details as JSON. The customer reviews and edits the draft; an adjuster sees both the photos and the draft.",
      tools: ["a vision-capable model API", "structured output (JSON schema)", "image resizing before upload", "an eval set of labelled claim photos"],
      steps: [
        "Collect 100 past claims with photos and the final adjuster notes as the reference answers.",
        "Write the prompt and schema, and run it on the set to see which fields the model gets right.",
        "Resize images to the size the model actually uses, to cut upload time and cost.",
        "Show the result as an editable draft, never as a decision, and log customer edits.",
        "Review the edits weekly to find fields the model gets wrong and fix the prompt or drop the field.",
      ],
    },
    example: {
      title: "Sending an image and a question in one request",
      lang: "python",
      code: `import base64, anthropic

client = anthropic.Anthropic()
with open("kitchen_ceiling.jpg", "rb") as f:
    data = base64.standard_b64encode(f.read()).decode()

msg = client.messages.create(
    model="claude-haiku-4-5",
    max_tokens=400,
    messages=[{"role": "user", "content": [
        # image first, then the instruction: the docs recommend this order
        {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": data}},
        {"type": "text", "text": "Describe the visible damage as JSON with keys "
                                 "damage_type, location, size_estimate, notes. "
                                 "Use null when you cannot tell from the photo."},
    ]}],
)
print(msg.content[0].text)`,
      notes:
        "The image is just another content block in the same message. Asking for null when unsure gives the model a way to avoid guessing, which matters more for images because the photo may simply not show the detail.",
    },
    tradeoffs: [
      { issue: "Photos and recordings often contain personal data you did not ask for.", response: "Tell users what is sent, strip metadata such as location, and set retention rules for uploaded files." },
      { issue: "A wrong answer about an image is harder for users to spot than a wrong sentence.", response: "Show the model's reading next to the image and make it an editable draft." },
      { issue: "Images and audio make requests larger and slower.", response: "Resize or compress before upload and measure latency on mobile connections." },
    ],
    junior: "Adds image upload because the model supports it, and shows the model's description as if it were certain.",
    senior: "Starts from a manual step the modality removes, measures the model on real user files, and designs the screen so users can check and correct the result.",
    reading: [BE_MY_EYES, CLAUDE_VISION, DUOLINGO],
  },
  {
    moduleId: "M12.2",
    howItWorks:
      "A vision model cuts an image into small patches, turns each patch into a vector with a vision encoder, and feeds those vectors to the language model as if they were tokens. More pixels means more patches, which means more tokens, more cost and more latency. Providers resize large images down to a maximum size before encoding, so sending a huge photo usually wastes upload time without adding detail. The practical skills are estimating the token cost of an image, resizing on your side to the size the model will use anyway, and cropping to the region that matters when fine detail is needed.",
    uses: [
      {
        who: "Claude vision",
        what: "Anthropic's docs give the image cost directly: tokens are roughly the image width divided by 28 times the height divided by 28, with images larger than the maximum size scaled down first, so resizing yourself keeps cost and latency predictable.",
        source: CLAUDE_VISION,
      },
      {
        who: "CLIP",
        what: "OpenAI's CLIP trained an image encoder and a text encoder together on 400 million image and caption pairs so matching pairs end up close together. This idea of learning image features from text is the basis for many vision encoders used in multimodal models.",
        source: CLIP,
      },
    ],
    scenario: {
      title: "Cutting the cost of a receipt-scanning feature",
      context:
        "An expenses app sends full 12-megapixel phone photos of receipts to a vision model. Uploads are slow on mobile and the image bill is higher than expected.",
      architecture:
        "The app resizes and compresses each photo on the device before upload, to the model's maximum useful size. For long receipts it crops to the receipt edges, and for very long ones it splits the image into two tiles.",
      tools: ["on-device image resizing", "a token estimate function", "an eval set of receipts with known totals", "cost dashboards"],
      steps: [
        "Measure current average image tokens, cost per receipt and upload time.",
        "Add resizing to the model's maximum size and re-run the eval to check accuracy did not drop.",
        "Add cropping to the receipt edges and compare again.",
        "Try tiling only for receipts where the totals are misread.",
        "Ship the version with the best accuracy per cost and keep tracking both.",
      ],
    },
    example: {
      title: "Estimating image tokens before sending",
      lang: "python",
      code: `import math

MAX_EDGE = 1568      # standard-resolution limit from the docs
MAX_TOKENS = 1568    # images above this are scaled down

def image_tokens(w: int, h: int) -> tuple[int, int, int]:
    """Return (new_w, new_h, approx_tokens) after the model's own downscaling."""
    scale = min(1.0, MAX_EDGE / max(w, h))
    w, h = int(w * scale), int(h * scale)
    while math.ceil(w / 28) * math.ceil(h / 28) > MAX_TOKENS:
        w, h = int(w * 0.95), int(h * 0.95)
    return w, h, math.ceil(w / 28) * math.ceil(h / 28)

print(image_tokens(4032, 3024))   # a 12 MP phone photo
print(image_tokens(800, 600))     # already small`,
      notes:
        "A 12-megapixel photo costs about the same as a resized one because the model scales it down anyway, so resizing on the device mainly saves upload time. Check the limits for your model, as newer models may support a higher-resolution tier.",
    },
    tradeoffs: [
      { issue: "Downscaling can make small print unreadable.", response: "Crop to the important region instead of shrinking the whole image, and measure on hard examples." },
      { issue: "Tiling an image into pieces multiplies the token cost.", response: "Tile only when the eval shows a real accuracy gain, and only for the inputs that need it." },
      { issue: "Different providers count image tokens differently.", response: "Use each provider's formula or token-count endpoint when comparing cost." },
    ],
    junior: "Sends the original photo and is surprised by slow uploads and the bill.",
    senior: "Knows how the model turns pixels into tokens, resizes and crops on purpose, and measures accuracy against cost for each change.",
    reading: [CLAUDE_VISION, CLIP],
  },
  {
    moduleId: "M12.3",
    howItWorks:
      "Vision models are good at describing scenes, reading clear text, and answering questions about charts and screenshots. They are weaker at exact counting, precise positions, small or rotated text, low-quality images and specialist images such as medical scans. Errors are often plausible, for example a total that is off by one digit, so they slip past casual review. In practice teams decide which jobs the model is trusted with, check numbers with rules (totals must add up), and route low-confidence or high-stakes cases to people.",
    uses: [
      {
        who: "Claude vision",
        what: "Anthropic's vision docs list known limits: the model will not identify people, can be wrong on very small, rotated or low-quality images, gives only approximate counts and positions, cannot tell whether an image is AI-generated, and should not be used to interpret medical scans.",
        source: CLAUDE_VISION,
      },
      {
        who: "CLIP",
        what: "The CLIP paper reports that despite strong zero-shot results, the model did poorly on counting objects, on satellite images and on fine-grained categories, and scored only 88% on handwritten digits, a reminder that a strong general model can fail badly on a narrow task.",
        source: CLIP,
      },
    ],
    scenario: {
      title: "Reading invoice totals safely",
      context:
        "An accounts team uses a vision model to extract line items and totals from scanned supplier invoices. A few totals were wrong by small amounts and nobody noticed until month end.",
      architecture:
        "The model returns line items and the total as JSON. Code checks that the line items add up to the total and that the date and supplier exist. Invoices that fail a check, or that exceed a value limit, go to a review queue.",
      tools: ["a vision model with structured output", "validation rules in code", "a review queue", "a labelled set of hard invoices"],
      steps: [
        "Collect invoices that went wrong plus a random sample, and label them by hand.",
        "Measure accuracy per field, not just overall, to find the weak fields.",
        "Add rule checks for every number that can be cross-checked.",
        "Route failures and high-value invoices to a person.",
        "Track how many go to review and how many reviewed ones the model had wrong.",
      ],
    },
    example: {
      title: "Checking a model's numbers before trusting them",
      lang: "python",
      code: `from decimal import Decimal

def check_invoice(inv: dict, review_limit: Decimal = Decimal("5000")) -> list[str]:
    problems = []
    items_sum = sum(Decimal(str(i["amount"])) for i in inv["line_items"])
    total = Decimal(str(inv["total"]))
    if abs(items_sum - total) > Decimal("0.01"):
        problems.append(f"line items add to {items_sum}, total says {total}")
    if not inv.get("invoice_date"):
        problems.append("missing date")
    if total > review_limit:
        problems.append("above review limit")
    return problems

issues = check_invoice(model_output)
route = "review_queue" if issues else "auto_approve"`,
      notes:
        "The model is never asked to grade itself. Simple arithmetic and business rules catch the plausible-looking mistakes that vision models make, and the value limit keeps a person in the loop where errors are expensive.",
    },
    tradeoffs: [
      { issue: "Rule checks only catch errors in numbers that can be cross-checked.", response: "Sample auto-approved cases for human review each week to find other error types." },
      { issue: "Sending many cases to review removes the time saving.", response: "Tune thresholds using review data and fix prompts for the most common failure." },
      { issue: "Image quality varies a lot between users.", response: "Check quality on upload and ask for a retake when an image is blurry or too small." },
    ],
    junior: "Tests on a few clean examples, sees good results and lets the model's numbers flow straight into the books without any rule checks.",
    senior: "Measures per field on hard real inputs, adds rule checks and human review for the known weak spots, and keeps sampling to catch new ones.",
    reading: [CLAUDE_VISION, CLIP],
  },
  {
    moduleId: "M12.4",
    howItWorks:
      "Many business documents are PDFs with tables, charts and layouts that plain text extraction mangles. There are two common approaches. One is to send the PDF pages to a vision model so it sees both the text and the page image. The other, for search across many documents, is visual retrieval: embed each page image directly and search those embeddings, instead of running OCR and embedding the extracted text. Visual RAG keeps charts and tables intact, but page embeddings are larger and you still need a model to read the retrieved pages.",
    uses: [
      {
        who: "Claude PDF support",
        what: "Anthropic's API turns each PDF page into extracted text plus an image of the page, so the model can read charts and tables, with limits on pages and file size, and the docs recommend caching the document when you ask several questions about it.",
        source: CLAUDE_PDF,
      },
      {
        who: "ColPali",
        what: "The ColPali researchers embedded page images directly with a vision language model and searched them with late interaction. On their visual document benchmark this beat pipelines built on OCR or captions, and indexing was simpler and faster.",
        source: COLPALI,
      },
    ],
    scenario: {
      title: "Search over scanned annual reports",
      context:
        "Analysts need to search 2,000 annual reports where the key numbers live in charts and tables. Text-only RAG keeps returning the wrong passages because tables come out of OCR as jumbled text.",
      architecture:
        "Each page is stored as an image and embedded with a visual retriever. A query returns the top pages, which are sent as images to a vision model that answers and cites the page numbers.",
      tools: ["a PDF-to-image converter", "a visual retriever such as ColPali", "a vector store that supports multi-vector search", "a vision model", "an eval set of chart and table questions"],
      steps: [
        "Write 50 questions whose answers are in charts or tables, with the correct page for each.",
        "Measure retrieval with the current text pipeline as the baseline.",
        "Index page images with a visual retriever and measure again on the same questions.",
        "Send the top pages to a vision model and measure answer accuracy and cost.",
        "Keep the text index for text-heavy pages if it is cheaper and just as good there.",
      ],
    },
    example: {
      title: "Asking several questions about one cached PDF",
      lang: "python",
      code: `import base64, anthropic

client = anthropic.Anthropic()
pdf = base64.standard_b64encode(open("annual_report.pdf", "rb").read()).decode()
doc = {"type": "document",
       "source": {"type": "base64", "media_type": "application/pdf", "data": pdf},
       "cache_control": {"type": "ephemeral"}}   # reuse across questions

for q in ["What was revenue by region in the chart on segment results?",
          "Which year had the highest operating margin?"]:
    r = client.messages.create(
        model="claude-sonnet-4-5", max_tokens=500,
        messages=[{"role": "user", "content": [doc, {"type": "text", "text": q + " Cite page numbers."}]}])
    print(q, "->", r.content[0].text)`,
      notes:
        "Each page costs both text and image tokens, so a long PDF is expensive. Caching the document block means the second and later questions mostly pay the cheaper cached rate.",
    },
    tradeoffs: [
      { issue: "Sending whole PDFs is expensive and hits page limits.", response: "Retrieve the relevant pages first and send only those." },
      { issue: "Page-image embeddings take much more storage than text embeddings.", response: "Use them for visually rich collections and keep text indexes for plain documents." },
      { issue: "Vision models can misread dense tables.", response: "Ask for page citations and validate key numbers against the source." },
    ],
    junior: "Runs basic text extraction on every PDF and wonders why answers about charts and tables are wrong.",
    senior: "Looks at what the documents contain, compares text and visual retrieval on real questions, and sends only the pages that matter.",
    reading: [CLAUDE_PDF, COLPALI],
  },
  {
    moduleId: "M12.5",
    howItWorks:
      "Image generation models, mostly diffusion models, start from noise and remove it step by step guided by a text prompt. In products they are used for marketing images, product mock-ups, variations and edits. Editing tools matter as much as generation: inpainting changes one region, image-to-image keeps a composition, and small adapters such as LoRAs teach a brand style or a product's look. The work around the model is review, brand and legal checks, and keeping track of which images are generated.",
    uses: [
      {
        who: "Klarna",
        what: "Klarna's marketing team used tools such as Midjourney, DALL-E and Firefly to make campaign images, cutting the image production cycle from about six weeks to seven days and producing over 1,000 images in one quarter, which it says saved about $1.5M.",
        source: KLARNA_IMAGES,
      },
      {
        who: "Hugging Face Diffusers",
        what: "The Diffusers library packages open diffusion models as pipelines that can load LoRA adapters, and supports offloading and quantization so large image models can run on machines with limited GPU memory.",
        source: DIFFUSERS,
      },
    ],
    scenario: {
      title: "Product photos for a furniture shop",
      context:
        "A furniture retailer needs lifestyle images of each product in different rooms. Photo shoots are slow and expensive, and the products must look exactly right.",
      architecture:
        "Real studio photos of each product are kept. Generation creates the room around the product with inpainting, so the product pixels are not regenerated. A designer reviews every image before publishing.",
      tools: ["an image model with inpainting", "product masks", "a review step", "labels for AI-generated images"],
      steps: [
        "Photograph each product on a plain background and make a mask of the product.",
        "Write room prompts that match the brand style guide.",
        "Generate several backgrounds per product with inpainting.",
        "Have a designer reject images with wrong details, odd shadows or brand problems.",
        "Record which images are generated and check the model's licence terms.",
      ],
    },
    example: {
      title: "Generating and editing with Diffusers",
      lang: "python",
      code: `import torch
from diffusers import AutoPipelineForText2Image, AutoPipelineForInpainting
from diffusers.utils import load_image

t2i = AutoPipelineForText2Image.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0", torch_dtype=torch.float16).to("cuda")
room = t2i("bright Scandinavian living room, soft morning light, wide shot").images[0]

inpaint = AutoPipelineForInpainting.from_pretrained(
    "diffusers/stable-diffusion-xl-1.0-inpainting-0.1", torch_dtype=torch.float16).to("cuda")
product = load_image("sofa_on_white.png")
mask = load_image("background_mask.png")   # white = regenerate, black = keep the sofa
scene = inpaint(prompt="cosy reading corner with plants", image=product,
                mask_image=mask, strength=0.9).images[0]
scene.save("sofa_scene.png")`,
      notes:
        "Inpainting keeps the real product pixels and only regenerates the background, which avoids the model inventing product details. Model names change often, so check the current recommended checkpoints and their licences.",
    },
    tradeoffs: [
      { issue: "Generated images can get product details, text or hands wrong.", response: "Keep a human review step and use inpainting so the real product is not regenerated." },
      { issue: "Licences and rights for generated images vary by model and use.", response: "Check model licences, avoid prompts naming artists or brands, and keep records." },
      { issue: "Users may feel misled by generated images.", response: "Label AI-generated images where required or expected." },
    ],
    junior: "Generates whole product scenes from a prompt and publishes the nicest-looking one.",
    senior: "Keeps real product pixels, builds review and licence checks into the workflow, and measures time and cost saved against the old process.",
    reading: [DIFFUSERS, DIFFUSERS_INPAINT, KLARNA_IMAGES],
  },
  {
    moduleId: "M12.6",
    howItWorks:
      "Speech models usually turn audio into a spectrogram, a picture of which frequencies are loud over time, and then encode it like an image or a sequence. Whisper, for example, takes 30-second windows of audio as log-Mel spectrograms into an encoder, and a decoder writes the text. Some newer models turn audio into discrete tokens so one model can both listen and speak. Knowing this explains practical behaviour: long recordings are processed in chunks, sample rate and noise matter, and silence or music can lead the decoder to invent words.",
    uses: [
      {
        who: "OpenAI Whisper",
        what: "Whisper was trained on 680,000 hours of labelled audio from the web, including speech in 96 other languages and translation data. It reads 30-second log-Mel spectrogram windows with an encoder-decoder transformer and made far fewer errors on unseen datasets than models trained on one clean dataset.",
        source: WHISPER,
      },
      {
        who: "Whisper model card",
        what: "The Whisper model card warns that because the model is trained on noisy web data it can hallucinate text that was never spoken and repeat itself, and that accuracy varies across languages, accents and speaker groups.",
        source: WHISPER_CARD,
      },
    ],
    scenario: {
      title: "Transcribing hour-long lecture recordings",
      context:
        "A university wants transcripts of recorded lectures. Early results had repeated sentences and invented text during long silences and music.",
      architecture:
        "Audio is resampled to 16 kHz, silence is detected and cut with a voice activity detector, and speech segments are sent to a speech model in chunks, with timestamps kept so text can be lined up with the video.",
      tools: ["ffmpeg for resampling", "a voice activity detector", "a Whisper model", "a word error rate script"],
      steps: [
        "Pick 10 lectures with different speakers and audio quality, and hand-correct 10 minutes of each.",
        "Measure word error rate for the plain pipeline.",
        "Add resampling and silence removal, and measure again.",
        "Look for repeated or invented text and check whether it lines up with silence or music.",
        "Choose the model size that meets the accuracy target at an acceptable cost.",
      ],
    },
    example: {
      title: "Seeing what Whisper actually reads",
      lang: "python",
      code: `import whisper

model = whisper.load_model("base")
audio = whisper.load_audio("lecture_clip.mp3")   # resampled to 16 kHz mono
audio = whisper.pad_or_trim(audio)               # exactly 30 seconds
mel = whisper.log_mel_spectrogram(audio).to(model.device)
print(mel.shape)                                 # (80, 3000): 80 frequency bands x time frames

_, probs = model.detect_language(mel)
print("language:", max(probs, key=probs.get))
result = whisper.decode(model, mel, whisper.DecodingOptions())
print(result.text)`,
      notes:
        "The model only ever sees a 30-second spectrogram. Longer audio is cut into windows, which is why chunk boundaries, silence and background noise affect quality.",
    },
    tradeoffs: [
      { issue: "Larger speech models are more accurate but slower and costlier.", response: "Measure word error rate per model size on your own audio and pick the smallest that meets the target." },
      { issue: "Silence and music can produce invented text.", response: "Remove non-speech with voice activity detection before transcription." },
      { issue: "Accuracy varies by language and accent.", response: "Build the eval set from your real users' speech, not a single clean speaker." },
    ],
    junior: "Sends whole recordings to a speech model and assumes the transcript is right.",
    senior: "Knows the model works on fixed windows of spectrogram, prepares audio to match, and measures error rates on real speakers.",
    reading: [WHISPER, WHISPER_CARD],
  },
  {
    moduleId: "M12.7",
    howItWorks:
      "Speech-to-text (STT) turns audio into text, and text-to-speech (TTS) turns text into audio. In products they wrap a text model: transcribe the user, run the LLM, speak the answer. STT is judged by word error rate on your own audio, with special attention to names, product terms and numbers. TTS is judged by naturalness, speed to first audio and how it handles numbers, dates and abbreviations. Both have hosted and open options, and the choice depends on languages, latency, cost and whether audio may leave your systems.",
    uses: [
      {
        who: "DoorDash",
        what: "DoorDash built its driver voice-support system on AWS with Amazon Connect, Lex, Bedrock knowledge bases and a model served through Bedrock, built and tested in about eight weeks, and now handling hundreds of thousands of calls a day.",
        source: DOORDASH_BEDROCK,
      },
      {
        who: "Whisper model card",
        what: "OpenAI's model card for Whisper says the models are not suited to high-risk decisions and should not be used to transcribe people without their consent, and that results differ across languages and accents, so teams need to test on their own speakers.",
        source: WHISPER_CARD,
      },
    ],
    scenario: {
      title: "Transcribing support calls with product names",
      context:
        "A telecom company wants searchable transcripts of support calls. Plan names, device models and account numbers are often transcribed wrongly, which breaks search and analytics.",
      architecture:
        "Calls are transcribed by an STT service with a custom vocabulary of product terms. Account numbers are checked against a pattern. Word error rate is tracked on a weekly sample that people correct.",
      tools: ["an STT service or Whisper", "a custom vocabulary list", "jiwer for word error rate", "a weekly correction sample"],
      steps: [
        "Collect 50 calls covering different accents, lines and noise levels and correct them by hand.",
        "Measure overall word error rate and error rate on product terms separately.",
        "Add a custom vocabulary or prompt with product names and measure again.",
        "Normalise numbers and dates before comparing so formatting differences do not count as errors.",
        "Keep correcting a weekly sample to catch new product names and drift.",
      ],
    },
    example: {
      title: "Measuring word error rate on your own audio",
      lang: "python",
      code: `import jiwer, whisper

model = whisper.load_model("small")
rows = [("call_001.wav", "i want to move to the unlimited max plan"),
        ("call_002.wav", "my pixel nine keeps dropping calls")]

refs, hyps = [], []
for path, reference in rows:
    text = model.transcribe(path, initial_prompt="Unlimited Max, Pixel 9, eSIM")["text"]
    refs.append(reference.lower())
    hyps.append(text.lower().strip(" ."))

print("WER:", round(jiwer.wer(refs, hyps), 3))
for r, h in zip(refs, hyps):
    if r != h:
        print("REF:", r, "\\nHYP:", h)`,
      notes:
        "The initial prompt nudges the model toward the right spelling of product names. Printing mismatches shows whether errors are real mistakes or just formatting such as 9 versus nine.",
    },
    tradeoffs: [
      { issue: "Hosted STT is easy but sends audio to a third party.", response: "Check data rules first and self-host an open model when audio must stay inside." },
      { issue: "Word error rate treats every word equally.", response: "Also measure errors on the terms that matter, such as product names and numbers." },
      { issue: "Natural-sounding TTS voices can be slower to start speaking.", response: "Measure time to first audio and choose voices that meet the latency budget." },
    ],
    junior: "Picks the STT service with the best published accuracy and never measures it on the company's own calls.",
    senior: "Measures accuracy on real audio, especially on the words the business depends on, and weighs data rules and latency when choosing.",
    reading: [WHISPER_CARD, KOKORO, DOORDASH_BEDROCK],
  },
  {
    moduleId: "M12.8",
    howItWorks:
      "A realtime voice agent must listen, decide when the user has finished, think, and start talking fast enough to feel like a conversation. There are two main designs. A chained pipeline runs speech-to-text, then the LLM, then text-to-speech, which gives transcripts, control and easy policy checks but adds delay at each step. A speech-to-speech model handles audio directly and responds faster but is harder to inspect. Either way, teams budget latency per stage, stream every stage, handle interruptions (barge-in), and measure the time from the user stopping to the agent's first audio.",
    uses: [
      {
        who: "DoorDash",
        what: "DoorDash designed its driver voice-support system around a hard requirement of answering within 2.5 seconds, because drivers call while driving, and built automated testing that ran thousands of tests per hour before rollout.",
        source: DOORDASH_BEDROCK,
      },
      {
        who: "Duolingo",
        what: "Duolingo found its AI video-call character worked best in English, and needed extra instructions for Japanese, Korean and Chinese, showing that voice agent quality has to be tested separately for each language.",
        source: DUOLINGO,
      },
      {
        who: "OpenAI voice agents guide",
        what: "OpenAI's voice agents guide compares speech-to-speech models with chained STT, agent and TTS pipelines, noting that chaining gives the most control and transcripts, and recommends measuring median and 95th-percentile time to audible response.",
        source: VOICE_AGENTS,
      },
    ],
    scenario: {
      title: "A voice agent for restaurant bookings",
      context:
        "A restaurant group wants a phone agent that takes bookings and answers questions about opening hours and menus. Callers hang up if there are long pauses.",
      architecture:
        "Phone audio streams over SIP into a voice pipeline: voice activity detection and turn detection, streaming STT, an LLM with a booking tool, and streaming TTS. Each turn's stage timings and transcript are logged.",
      tools: ["a voice agent framework such as LiveKit Agents", "a VAD model", "streaming STT and TTS", "a booking API tool", "latency logs"],
      steps: [
        "Set a latency budget per stage, for example turn detection, STT, LLM first token and TTS first audio.",
        "Build the pipeline with streaming at every stage and log timings per turn.",
        "Test with recorded calls including noise, interruptions and long pauses.",
        "Tune turn detection so the agent neither interrupts nor waits too long.",
        "Track p50 and p95 response time and booking success rate after launch.",
      ],
    },
    example: {
      title: "Logging latency per stage of every turn",
      lang: "python",
      code: `import time, statistics
from collections import defaultdict

timings = defaultdict(list)

class Turn:
    def __init__(self):
        self.t0 = time.perf_counter()   # moment the user stopped speaking
        self.marks = {}
    def mark(self, stage: str):
        self.marks[stage] = (time.perf_counter() - self.t0) * 1000

def finish(turn: Turn):
    for stage, ms in turn.marks.items():
        timings[stage].append(ms)

def report():
    for stage, values in timings.items():
        q = statistics.quantiles(values, n=20)
        print(f"{stage:15} p50={statistics.median(values):.0f}ms p95={q[18]:.0f}ms")
# call turn.mark("stt_final"), turn.mark("llm_first_token"), turn.mark("tts_first_audio")`,
      notes:
        "Measuring from the moment the user stops speaking matches what callers feel. The per-stage split shows where the delay is, and p95 matters because a few very slow turns are what make callers hang up.",
    },
    tradeoffs: [
      { issue: "Chained pipelines are easier to inspect but add delay at every step.", response: "Stream every stage and choose speech-to-speech only where the extra speed is worth less control." },
      { issue: "Aggressive turn detection makes the agent interrupt people.", response: "Tune on real recordings and use a turn-detection model, not only silence length." },
      { issue: "Quality varies by language and accent.", response: "Test and set targets per language before launching it." },
    ],
    junior: "Builds a voice bot that works in a quiet room and measures only total response time on a few calls.",
    senior: "Budgets and logs latency per stage, tests with noise and interruptions, and tracks p95 response time and task success per language.",
    reading: [VOICE_AGENTS, LIVEKIT, SILERO],
  },
  {
    moduleId: "M12.9",
    howItWorks:
      "Cross-modal search puts different kinds of content into the same embedding space so a text query can find images, or an image can find similar products. CLIP-style models train image and text encoders together so a photo and its caption get similar vectors. Once embedded, search works like text RAG: store vectors, find nearest neighbours, optionally rerank. Real systems often combine this with metadata filters and text search, because embeddings alone miss exact attributes such as size or brand.",
    uses: [
      {
        who: "OpenAI CLIP",
        what: "CLIP was trained on 400 million image and text pairs to match images with captions, and could then classify images it had never been trained on just from text labels, matching a fully supervised ResNet-50 on ImageNet zero-shot.",
        source: CLIP,
      },
      {
        who: "ColPali",
        what: "ColPali applies the same idea to documents, embedding page images so text queries retrieve pages directly, and its authors report better retrieval than text extraction pipelines on visually rich documents.",
        source: COLPALI,
      },
    ],
    scenario: {
      title: "Search by photo in a fashion shop",
      context:
        "A clothing shop wants customers to upload a photo or type a description such as 'green linen summer dress' and find similar items in stock.",
      architecture:
        "Every product image is embedded with a CLIP-style model and stored with metadata such as size, price and stock. Queries, whether text or image, are embedded with the same model, filtered by metadata, and the top results are reranked by stock and popularity.",
      tools: ["a CLIP-style embedding model", "a vector database with filtering", "product metadata", "click-through logs"],
      steps: [
        "Embed all product images and store them with metadata.",
        "Write 100 test queries (text and photos) with items a stylist marked as good matches.",
        "Measure recall at 10 and compare with keyword search.",
        "Add metadata filters for size and stock and check that results stay relevant.",
        "Launch to a share of users and track clicks and add-to-basket rate.",
      ],
    },
    example: {
      title: "Text and image embeddings in one space",
      lang: "python",
      code: `import torch
from PIL import Image
from transformers import CLIPModel, CLIPProcessor

model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
proc = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

images = [Image.open(p) for p in ["dress_01.jpg", "dress_02.jpg", "shirt_07.jpg"]]
with torch.no_grad():
    img = model.get_image_features(**proc(images=images, return_tensors="pt"))
    txt = model.get_text_features(**proc(text=["green linen summer dress"],
                                         return_tensors="pt", padding=True))
img = img / img.norm(dim=-1, keepdim=True)
txt = txt / txt.norm(dim=-1, keepdim=True)
scores = (txt @ img.T).squeeze(0)
print(scores.argsort(descending=True).tolist())`,
      notes:
        "Text and images go through different encoders but land in the same space, so a dot product compares them directly. In production you precompute the image vectors once and store them in a vector database.",
    },
    tradeoffs: [
      { issue: "General models miss fine product details such as fabric or fit.", response: "Combine embeddings with metadata filters, or fine-tune on your own catalogue." },
      { issue: "Embeddings can carry biases from web training data.", response: "Review results across product categories and customer groups." },
      { issue: "Page and image embeddings take more storage than text.", response: "Use compact models for large catalogues and measure whether bigger ones are worth it." },
    ],
    junior: "Builds image search with a CLIP model and judges it by trying a few queries.",
    senior: "Measures recall on labelled queries, combines embeddings with filters and text search, and tracks real user behaviour.",
    reading: [CLIP, COLPALI, SBERT_SEARCH],
  },
  {
    moduleId: "M12.10",
    howItWorks:
      "Choosing a multimodal model means testing on your own inputs, because general benchmarks say little about your photos, documents or speakers. The deciding factors are accuracy on your task, cost per item (images and audio can cost much more than text), latency, which modalities and languages are supported, file and page limits, and where data may be processed. Teams often end up with more than one model: a cheap fast one for simple items and a stronger one for hard ones, or a dedicated speech model in front of a text LLM.",
    uses: [
      {
        who: "Claude vision pricing",
        what: "Anthropic's vision docs work through the cost of images: a 1000 by 1000 pixel image is about 1,300 tokens, which comes to roughly $1.30 per thousand images on Haiku 4.5, so image volume should be priced before choosing a model.",
        source: CLAUDE_VISION,
      },
      {
        who: "Duolingo",
        what: "Duolingo launched its video-call feature in a few languages first, and found English worked best while some Asian languages needed extra instructions, so model quality had to be checked per language rather than assumed.",
        source: DUOLINGO,
      },
    ],
    scenario: {
      title: "Picking a model for ID document checks",
      context:
        "A lending app needs to read names, dates and document numbers from photos of identity documents from several countries, quickly and at low cost, with data kept in a specific region.",
      architecture:
        "Candidate models are tested on the same labelled set of document photos. The chosen setup uses a cheaper model for clear photos and a stronger one when fields fail validation, all served from an approved region.",
      tools: ["a labelled eval set across countries and photo quality", "two or three candidate models", "a cost and latency spreadsheet", "validation rules"],
      steps: [
        "Collect at least 200 labelled photos across countries, lighting and quality.",
        "Shortlist models that support images and are available in the required region.",
        "Measure field accuracy, cost per document and latency for each.",
        "Try a cascade: the cheap model first, the strong model when validation fails.",
        "Record the decision and re-run the comparison when new models are released.",
      ],
    },
    example: {
      title: "A model comparison scorecard",
      lang: "yaml",
      code: `eval_set: id_docs_v3   # 240 photos, 6 countries, 3 quality levels
results:
  - model: small-fast-vision
    field_accuracy: 0.91
    worst_country: 0.78
    cost_per_1k_docs_usd: 1.40
    p95_latency_s: 1.8
    region_ok: true
  - model: large-vision
    field_accuracy: 0.97
    worst_country: 0.93
    cost_per_1k_docs_usd: 9.80
    p95_latency_s: 4.1
    region_ok: true
decision: cascade (small first, large when validation fails)
expected_blended_cost_per_1k: 2.60
revisit: when a new model is released or accuracy drops below 0.95`,
      notes:
        "Recording the worst country, not just the average, shows where a model would fail real users. The blended cost of the cascade is what the business will actually pay.",
    },
    tradeoffs: [
      { issue: "The strongest model may be too slow or expensive at volume.", response: "Use a cascade so most items go to a cheaper model." },
      { issue: "Averages hide groups where a model does badly.", response: "Report accuracy by country, language or input type." },
      { issue: "Models change quickly.", response: "Keep the eval set and rerun it on each new candidate." },
    ],
    junior: "Picks the model that tops a public leaderboard for vision, without testing it on the company's own photos or checking cost.",
    senior: "Tests candidates on the team's own inputs, broken down by group, and chooses on accuracy, cost, latency and data rules together.",
    reading: [CLAUDE_VISION, AA_MODELS],
  },
  {
    moduleId: "M12.11",
    howItWorks:
      "Deep research and other long-horizon tasks run for many steps: plan, search, read, take notes, check, and write a report. They fail differently from single calls. Context fills up, early mistakes compound, agents stop too early or do far too much, and costs grow fast. Working designs split the job (a lead agent plans and sub-agents search in their own context), save progress outside the context window in files or notes, set effort limits, and check the output against the sources before finishing.",
    uses: [
      {
        who: "Anthropic research agent",
        what: "Anthropic's research feature uses a lead agent that plans and spawns sub-agents to search in parallel. They report it used far more tokens than a single agent and found early versions spawned too many sub-agents for simple queries, which they fixed with explicit effort rules in the prompts.",
        source: RESEARCH,
      },
      {
        who: "Anthropic long-running agents",
        what: "Anthropic found that agents tried to do too much at once or declared the job done early. Their harness fixed this with a setup agent, one feature per session, a startup routine that reads progress files, and testing before a feature counts as passing.",
        source: HARNESS,
      },
    ],
    scenario: {
      title: "A competitor research agent for a product team",
      context:
        "Product managers want a weekly report on what competitors launched, with sources. Doing it by hand takes a day, and a single long prompt produced shallow, sometimes made-up summaries.",
      architecture:
        "A lead agent plans the research by competitor, spawns sub-agents to search and read, and writes findings with source links to a notes file. A final step writes the report, and a checker verifies each claim against its cited page.",
      tools: ["an agent framework", "web search and fetch tools", "a notes file per run", "a citation checker", "token and cost tracking"],
      steps: [
        "Write five past research questions with good human-written answers as the eval set.",
        "Build the lead and sub-agent design with explicit effort rules for simple and complex questions.",
        "Save notes and sources to a file so the final writer does not depend on a full context.",
        "Add a citation check that flags claims not supported by the cited page.",
        "Track cost and time per run and compare report quality with the human answers.",
      ],
    },
    example: {
      title: "Effort rules in the lead agent's prompt",
      lang: "text",
      code: `You are the lead researcher. Plan before you search.

Scale effort to the question:
- Simple fact (one company, one date): 1 sub-agent, at most 5 tool calls.
- Comparison of 2-4 companies: 1 sub-agent per company, at most 10 calls each.
- Broad market question: up to 6 sub-agents with clearly separate topics.

Each sub-agent gets: the exact question, what NOT to cover,
the output format (claims with source URLs), and a call budget.

Write every finding to notes.md as: claim | source URL | date read.
Stop when every planned question has at least two sources,
or when the budget is spent. Never state a claim without a URL.`,
      notes:
        "Explicit effort rules stop the agent from spawning many sub-agents for simple questions, which was a problem Anthropic reported. Writing to a notes file means progress survives even if the context is cleared.",
    },
    tradeoffs: [
      { issue: "Multi-agent research uses many more tokens than a single agent.", response: "Use it only for questions where breadth matters and set budgets per run." },
      { issue: "Long runs compound early mistakes.", response: "Save notes and check claims against sources before writing the final report." },
      { issue: "Long-running jobs are hard to debug.", response: "Trace every step and keep the notes file so you can see where a run went wrong." },
    ],
    junior: "Gives one agent a big prompt and lets it run until it says it is done.",
    senior: "Splits the work, saves progress outside the context, sets effort and cost limits, and verifies claims against sources before the report goes out.",
    reading: [RESEARCH, HARNESS, DEEP_RESEARCH_COURSE],
  },
  {
    moduleId: "M12.12",
    howItWorks:
      "On-device AI runs the model on the phone, laptop or small board instead of in the cloud. That gives privacy, offline use and no per-call cost, but memory, battery and compute are limited. Teams make models fit by choosing small models, quantizing weights to fewer bits, and using the device's accelerator. A common pattern is hybrid: easy and private tasks run on the device, harder ones go to a server. The engineering work is measuring memory, speed and quality on the slowest devices you support.",
    uses: [
      {
        who: "Apple",
        what: "Apple runs a roughly 3-billion-parameter model on iPhones, compressed to under 4 bits per weight, with small swappable LoRA adapters for different tasks, and sends larger requests to its Private Cloud Compute servers.",
        source: APPLE_FM,
      },
      {
        who: "whisper.cpp",
        what: "whisper.cpp runs OpenAI's Whisper speech models in plain C and C++ on phones, Raspberry Pi boards and in the browser, supports quantized models to cut memory, and lists memory use from a few hundred megabytes for the smallest model to a few gigabytes for the largest.",
        source: WHISPER_CPP,
      },
    ],
    scenario: {
      title: "Offline voice notes for field engineers",
      context:
        "Engineers inspect equipment in places with no signal. They want to dictate notes on their phones and have them transcribed immediately, without audio leaving the device.",
      architecture:
        "A quantized speech model runs on the phone. Transcripts are saved locally and synced when there is a connection. A larger cloud model can re-transcribe later if the user asks.",
      tools: ["whisper.cpp or a similar on-device runtime", "a quantized model", "the phone's accelerator", "a test set of field recordings"],
      steps: [
        "Record 30 notes in real field conditions and transcribe them by hand.",
        "Test two or three model sizes and quantization levels for accuracy, speed and memory.",
        "Test on the oldest phone model the company supports.",
        "Pick the smallest setup that meets the accuracy and speed targets.",
        "Watch battery use and crash reports after rollout.",
      ],
    },
    example: {
      title: "Building, quantizing and running whisper.cpp",
      lang: "bash",
      code: `git clone https://github.com/ggml-org/whisper.cpp && cd whisper.cpp
cmake -B build && cmake --build build -j --config Release

# download a small English model and make a 5-bit quantized copy
./models/download-ggml-model.sh base.en
./build/bin/quantize models/ggml-base.en.bin models/ggml-base.en-q5_0.bin q5_0

# compare speed and output of the two versions on the same clip
./build/bin/whisper-cli -m models/ggml-base.en.bin      -f samples/jfk.wav
./build/bin/whisper-cli -m models/ggml-base.en-q5_0.bin -f samples/jfk.wav
ls -lh models/*.bin`,
      notes:
        "Comparing the full and quantized versions on the same audio shows the size saving and whether quality changed. Do the same test on the real target device, since laptop speed says little about an older phone.",
    },
    tradeoffs: [
      { issue: "Quantization saves memory but can lower quality.", response: "Measure accuracy on your own data at each quantization level." },
      { issue: "Device performance varies widely.", response: "Test on the slowest supported devices and fall back to the cloud when needed." },
      { issue: "Shipping model updates to devices is slower than updating a server.", response: "Keep models in downloadable packages separate from the app and version them." },
    ],
    junior: "Tests the on-device model on a new laptop and assumes it will run on every phone.",
    senior: "Measures memory, speed, battery and quality on the weakest devices, uses quantization deliberately, and designs a cloud fallback.",
    reading: [APPLE_FM, WHISPER_CPP],
  },
];
