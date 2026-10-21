import type { QuizSrc } from "./types";

export const QUIZZES_L10_L13: QuizSrc[] = [
  // M10.1 What LLMOps adds
  ["M10.1", "e", "What does a release of an LLM application consist of?", "Code plus prompts, model versions, configs and retrieval data", ["Only the code", "Only the model weights", "Only the Docker image"], "Any of these can change behaviour, so all must be versioned."],
  ["M10.1", "m", "How does application LLMOps differ from model LLMOps?", "It operates apps built on hosted models rather than training and serving the model itself", ["It is identical", "It never uses prompts", "It only covers GPUs"], "Most teams call APIs, so their ops focus on prompts, evals and serving."],
  ["M10.1", "m", "Why are LLM systems harder to operate than typical services?", "Failures are often silent wrong answers rather than errors", ["They have no logs", "They cannot be deployed", "They never change"], "You need quality monitoring, not just uptime."],
  ["M10.1", "e", "LLMOps compared to MLOps adds emphasis on…", "Prompt versioning, eval gates and token cost", ["Feature stores only", "Training data labeling only", "Hyperparameter search only"], "Prompts and costs are first-class artifacts."],
  ["M10.1", "h", "Operating an agent differs from operating RAG mainly because…", "Agents take multi-step actions with variable cost and side effects", ["Agents have no prompts", "RAG has no retrieval", "They are the same"], "Agents need budgets, traces and action audits."],

  // M10.2 Prep for production
  ["M10.2", "e", "Why move prompts and model names into configuration?", "So they can change without code edits and be versioned separately", ["Config is faster to execute", "Code cannot hold strings", "It hides them from users"], "Configuration makes changes reviewable and reversible."],
  ["M10.2", "m", "Why pin a dated model version rather than a moving alias?", "An alias can silently update and change behaviour", ["Dated versions are cheaper", "Aliases are forbidden", "It improves latency"], "Pinning makes behaviour reproducible."],
  ["M10.2", "m", "Why make the app traceable from the first request?", "So production issues can be debugged with full context", ["To slow it down", "Tracing replaces tests", "It is required by Docker"], "Retrofitting tracing after an incident is too late."],
  ["M10.2", "e", "What serves as the quality yardstick for production changes?", "The eval set built earlier", ["User count", "Lines of code", "Model size"], "Every change is measured against the same suite."],
  ["M10.2", "h", "Why pin Python dependency versions too?", "Library updates can change prompts, parsing or defaults behind your back", ["Pins make images smaller", "Pip requires it", "It increases accuracy"], "Lockfiles keep builds reproducible."],

  // M10.3 MLflow & prompt registry
  ["M10.3", "e", "What should an experiment run record?", "Prompt version, parameters, scores and sample outputs", ["Only the final score", "Only the date", "Only the model name"], "Complete records allow fair comparison."],
  ["M10.3", "m", "How does label-based rollback work with a prompt registry?", "Move the production label back to the previous prompt version", ["Redeploy the whole app", "Delete the bad prompt", "Edit the prompt in place"], "Labels decouple deployment from version history."],
  ["M10.3", "m", "Why fetch prompts at runtime with a local fallback?", "Prompts can update without redeploys, and the app still works if the registry is down", ["It is faster than local", "Registries require it", "To avoid versioning"], "Fallbacks prevent a registry outage becoming an app outage."],
  ["M10.3", "e", "Why record a baseline run before making changes?", "To know whether a change actually improved anything", ["To fill the dashboard", "MLflow requires it", "To save tokens"], "No baseline, no comparison."],
  ["M10.3", "h", "Why link traces to prompt versions?", "To see which prompt produced a bad production answer", ["To speed up tracing", "To reduce storage", "To encrypt prompts"], "Linking closes the loop from incident to change."],

  // M10.4 Eval gate
  ["M10.4", "e", "What does an eval release gate do?", "Fails the pipeline when quality metrics fall below thresholds", ["Approves every change", "Deploys automatically", "Formats code"], "Gates block regressions."],
  ["M10.4", "m", "How do you handle non-determinism in gated evals?", "Use thresholds with margins, fixed settings and repeated runs where needed", ["Require exact string matches", "Ignore failures", "Run once and trust it"], "Gates must tolerate noise yet catch real drops."],
  ["M10.4", "m", "Why run a fast subset on every PR and the full suite before release?", "To balance feedback speed with thorough coverage", ["The full suite is wrong", "Subsets are more accurate", "CI cannot run long jobs"], "Tiered suites keep CI fast."],
  ["M10.4", "e", "Should a prompt-only change go through the eval gate?", "Yes, prompts change behaviour as much as code", ["No, prompts are text", "Only on Fridays", "Only if it is long"], "Prompt and model changes are releases."],
  ["M10.4", "h", "Synthetic test cases should be…", "Reviewed by a human before entering the suite", ["Added without review", "Used only in production", "Avoided entirely"], "Unreviewed synthetic data can encode wrong answers."],

  // M10.5 Runtime guardrails
  ["M10.5", "e", "What should happen when output fails schema validation?", "Re-ask the model with the error, up to a retry limit", ["Return it anyway", "Crash", "Retry forever"], "Bounded re-asking fixes most format slips."],
  ["M10.5", "m", "What is NeMo Guardrails used for?", "Defining programmable rails, such as keeping conversations on allowed topics", ["Training models", "Vector search", "Load balancing"], "It adds topical and safety rails around LLM apps."],
  ["M10.5", "m", "What is the cost of adding guardrails?", "Extra latency and some false positives", ["None", "Lower security", "Larger models"], "Measure both and tune."],
  ["M10.5", "e", "Why log every guardrail block?", "To audit attacks and tune false positives", ["To slow users down", "Regulations forbid it", "To train the model"], "Blocks are signals."],
  ["M10.5", "h", "Which runtime limits protect against a runaway agent?", "Tool-call, step and spend limits enforced in code", ["A polite system prompt", "A bigger context window", "Lower temperature only"], "Limits must be enforced outside the model."],

  // M10.6 Serving
  ["M10.6", "e", "What are server-sent events (SSE) used for in LLM apps?", "Streaming tokens from server to client over HTTP", ["Uploading files", "Authenticating users", "Database replication"], "SSE is a simple one-way stream over HTTP."],
  ["M10.6", "m", "What is the difference between health and readiness endpoints?", "Health says the process is alive; readiness says it can serve traffic now", ["They are the same", "Readiness checks disk only", "Health checks users"], "Load balancers route only to ready instances."],
  ["M10.6", "m", "Where should API keys come from in a containerized app?", "Runtime environment or a secrets manager, never baked into the image", ["The Dockerfile", "The image layers", "A public repo"], "Images get shared; secrets must not be in them."],
  ["M10.6", "h", "A client disconnects mid-stream. What should the server do?", "Detect it and cancel the upstream model call to stop paying for tokens", ["Keep generating", "Restart the server", "Retry the request"], "Cancellation saves cost and capacity."],
  ["M10.6", "e", "What does Docker Compose do?", "Defines and runs a multi-container stack from one file", ["Builds the model", "Hosts the cloud", "Writes tests"], "Compose wires backend, frontend and services together."],

  // M10.7 CI/CD
  ["M10.7", "e", "What is a sensible order for an LLM CI pipeline?", "Tests, then eval gate, then build and deploy", ["Deploy, then test", "Build, deploy, then eval", "Eval only"], "Fail fast before building artifacts."],
  ["M10.7", "m", "Why tag images with the commit SHA?", "Every deployment maps to exact code, enabling precise rollback", ["Shorter names", "Docker requires it", "Faster pulls"], "Immutable tags make releases traceable."],
  ["M10.7", "m", "How do GitHub Actions access secrets safely?", "Through encrypted repository or environment secrets referenced in the workflow", ["Hard-coded in YAML", "Committed to .env", "Printed in logs"], "Secrets are masked and scoped."],
  ["M10.7", "e", "Why require manual approval before production?", "A human checks before a risky release goes live", ["To slow everything", "Actions require it", "To save minutes"], "Environment protection rules add a gate."],
  ["M10.7", "h", "How should a rollback be performed?", "Redeploy the last known-good image tag", ["Rebuild from main", "Edit code on the server", "Delete the database"], "Rollback should be fast and boring."],

  // M10.8 AWS
  ["M10.8", "e", "Why give an EC2 instance an IAM role instead of access keys?", "Temporary credentials are issued automatically, so no long-lived keys sit on disk", ["Roles are faster", "Keys do not work on EC2", "Roles are free and keys are not"], "Roles remove static credentials."],
  ["M10.8", "m", "What is the default idle timeout of an AWS Application Load Balancer?", "60 seconds", ["5 seconds", "300 seconds", "No timeout"], "Long streams with quiet gaps can be cut at 60s unless you raise it or send keep-alives."],
  ["M10.8", "m", "What is a blue/green deployment?", "Running the new version alongside the old and switching traffic over", ["Updating servers one at a time in place", "Deploying only at night", "Using two clouds"], "Blue/green allows instant switch-back."],
  ["M10.8", "h", "Why scale LLM backends on concurrency rather than CPU?", "They mostly wait on provider I/O, so CPU stays low while requests pile up", ["CPU metrics are unavailable", "Concurrency is cheaper", "AWS requires it"], "In-flight requests reflect real load."],
  ["M10.8", "e", "What often caps throughput before your servers do?", "The model provider's rate limits", ["Disk space", "DNS", "The load balancer"], "Plan quotas alongside autoscaling."],

  // M10.9 Monitoring
  ["M10.9", "e", "What does Prometheus do?", "Scrapes and stores time-series metrics", ["Hosts models", "Stores documents", "Runs CI"], "Prometheus pulls metrics from exporters and apps."],
  ["M10.9", "m", "Which metrics are specific to LLM apps?", "Tokens per request, cost, time to first token and guardrail blocks", ["Only CPU", "Only disk", "Only memory"], "Add app metrics beyond host metrics."],
  ["M10.9", "m", "What makes a good alert?", "It signals something a human needs to act on", ["It fires often", "It covers every metric", "It is never silenced"], "Noisy alerts get ignored."],
  ["M10.9", "e", "What is Langfuse used for?", "Tracing LLM calls, prompts and costs, plus evaluations", ["Load balancing", "Container builds", "DNS"], "LLM-specific observability."],
  ["M10.9", "h", "How should production failures feed back?", "Reviewed traces become new cases in the eval suite", ["They are deleted", "They are emailed only", "They retrain the model automatically"], "Close the loop."],

  // M10.10 Incidents
  ["M10.10", "e", "What is a runbook?", "Step-by-step instructions for handling a known incident", ["A sprint plan", "A marketing doc", "A model card"], "Runbooks speed up response under stress."],
  ["M10.10", "m", "The provider silently updated a model and quality dropped. What lever applies?", "Pin or roll back the model version and re-run evals", ["Restart servers", "Scale up", "Clear the CDN"], "Match the lever to the cause."],
  ["M10.10", "m", "What is a blameless post-incident review?", "Focusing on systemic causes and fixes rather than individuals", ["Finding who to fire", "Skipping the review", "Only writing a timeline"], "Blamelessness encourages honest reporting."],
  ["M10.10", "e", "Which is an LLM-specific incident?", "A prompt change causing wrong answers without errors", ["A disk failure", "A DNS outage", "An expired TLS certificate"], "Quality incidents are unique to AI systems."],
  ["M10.10", "h", "When must you re-run the full eval suite?", "Whenever the model, prompt or retrieval data changes", ["Only yearly", "Only after outages", "Never"], "Any change can shift quality."],

  // M10.11 Capstone
  ["M10.11", "m", "How do you prove the CI gate works?", "Push a deliberate regression and show the pipeline blocks it", ["Say it in the README", "Show a green build", "Count tests"], "A demonstrated block is the evidence."],
  ["M10.11", "e", "What should the capstone runbook cover?", "How to detect, diagnose and roll back a bad release", ["How to install Python", "Team bios", "Marketing"], "Runbooks make recovery repeatable."],
  ["M10.11", "m", "Why include dashboards, alerts and traces together?", "Dashboards show trends, alerts prompt action and traces explain specific failures", ["They duplicate each other", "Only one is needed", "For decoration"], "Each answers a different question."],
  ["M10.11", "h", "What is the strongest rollback evidence?", "A recorded rollback to a previous tag with metrics recovering", ["A plan to roll back", "A diagram", "A Slack message"], "Do it, don't just describe it."],
  ["M10.11", "e", "Why use one app across the whole lifecycle?", "To show each stage working together end to end", ["It is easier to fake", "Apps are expensive", "CI requires it"], "Integration is the point."],

  // M11.1 Three ways
  ["M11.1", "e", "What are the three common ways to consume a model?", "A provider API, a cloud AI platform, or self-hosted open weights", ["CPU, GPU and TPU", "Python, Java and Go", "Train, tune and test"], "Each trades control, compliance and effort."],
  ["M11.1", "m", "Why might a regulated team avoid a public provider API?", "Data residency, network isolation and contractual controls they require", ["APIs are always slower", "APIs lack models", "APIs are illegal"], "Cloud platforms offer private networking and compliance terms."],
  ["M11.1", "m", "How can you use open-weight models without running GPUs?", "Through serverless inference providers or cloud model catalogs", ["You cannot", "By running them on a laptop CPU only", "By converting them to SQL"], "Hosted open weights avoid GPU ops."],
  ["M11.1", "e", "Platform and gateway can be used together because…", "The platform hosts models and the gateway routes across them", ["They are the same thing", "Gateways train models", "Platforms route traffic"], "They solve different problems."],
  ["M11.1", "h", "What is the main trade-off of self-hosting?", "Maximum control at the cost of operating GPUs and serving yourself", ["Lower control", "No cost", "No latency"], "Control comes with operational burden."],

  // M11.2 Platforms
  ["M11.2", "e", "Which are the three major cloud AI platforms?", "Amazon Bedrock, Google Vertex AI and Azure AI Foundry", ["Docker, Kubernetes and Helm", "MLflow, DVC and Airflow", "Postgres, Redis and Kafka"], "Each offers a model catalog with cloud integration."],
  ["M11.2", "m", "What does a platform model catalog tell you?", "Which models are available, in which regions, with what pricing and features", ["Model weights", "Training data", "Source code"], "Read it before designing."],
  ["M11.2", "m", "What does a platform typically NOT give you?", "Your application's evals, prompts and product logic", ["Model hosting", "IAM integration", "Billing"], "The platform hosts models; you still build the app."],
  ["M11.2", "e", "Why is swapping models within one catalog easier than across providers?", "The invocation API and auth stay the same", ["Models are identical", "Prompts never change", "Pricing is equal"], "But you still must re-evaluate."],
  ["M11.2", "h", "Amazon Bedrock's Converse API helps by…", "Providing one message format across supported models", ["Training models", "Hosting databases", "Running containers"], "A uniform API eases model swaps."],

  // M11.3 Identity & networking
  ["M11.3", "e", "Why use cloud IAM identity instead of API keys?", "Credentials are short-lived, scoped and auditable", ["Keys are faster", "IAM is free", "Keys cannot be rotated"], "Identity-based access removes shared secrets."],
  ["M11.3", "m", "What does private connectivity (e.g. PrivateLink) provide?", "Model traffic stays on the cloud network without public internet egress", ["Faster tokens", "Free inference", "Larger context"], "Often required for regulated workloads."],
  ["M11.3", "m", "What are customer-managed keys for?", "Encrypting data with keys you control and can revoke", ["Signing commits", "Authenticating users", "Compressing data"], "CMKs give control over encryption."],
  ["M11.3", "e", "How do you audit who invoked a model?", "Through cloud audit logs such as CloudTrail", ["By asking users", "From model outputs", "From DNS logs"], "Audit logs record API calls with identity."],
  ["M11.3", "h", "Tenant isolation on shared infrastructure requires…", "Separating data, permissions and logs per tenant", ["One shared key", "One shared index without filters", "Nothing"], "Shared infra must not mean shared data."],

  // M11.4 Regions
  ["M11.4", "e", "Why check model availability per region?", "Not every model is offered in every region", ["Regions have different prompts", "Models are free in some regions", "Regions change tokenizers"], "Your region may lack the model you want."],
  ["M11.4", "m", "What is data residency?", "A requirement that data is stored or processed within a specific geography", ["Data stored in RAM", "Data in a CDN", "Data in backups only"], "Laws and contracts can mandate it."],
  ["M11.4", "m", "What should you get in writing from a model provider?", "Data retention and whether your data is used for training", ["Model architecture", "GPU types", "Office locations"], "Contractual terms back compliance claims."],
  ["M11.4", "h", "Cross-region inference raises what concern?", "Data may be processed outside the required region", ["Lower quality", "Higher accuracy", "No concern"], "Check residency before enabling it."],
  ["M11.4", "e", "Compliance decisions connect back to…", "Your governance and risk documentation", ["UI design", "Marketing", "Code style"], "Record decisions for audits."],

  // M11.5 Capacity
  ["M11.5", "e", "What is provisioned throughput?", "Reserved model capacity at a fixed price for guaranteed throughput", ["Free tier", "Pay per token on demand", "A caching layer"], "It trades commitment for predictability."],
  ["M11.5", "m", "When does provisioned throughput usually win over on-demand?", "At high, steady volume where reserved capacity is well used", ["At low, spiky volume", "For prototypes", "Never"], "Unused reserved capacity is wasted money."],
  ["M11.5", "m", "Quotas are usually expressed as…", "Requests per minute and tokens per minute", ["GB per day", "Users per hour", "Images per week"], "Both can throttle you."],
  ["M11.5", "e", "Why set budget alerts?", "To catch runaway costs early", ["To slow traffic", "To improve quality", "Required by IAM"], "Alerts protect against surprise bills."],
  ["M11.5", "h", "How do you defend a quota increase request?", "Show measured traffic, growth forecasts and token usage per request", ["Ask politely", "Threaten to switch", "Request the maximum"], "Evidence gets quotas approved."],

  // M11.6 Open-weight platforms
  ["M11.6", "e", "What is vLLM?", "A high-throughput inference engine for serving LLMs", ["A vector database", "A training dataset", "A cloud provider"], "vLLM uses PagedAttention and continuous batching."],
  ["M11.6", "m", "Roughly how much GPU memory do the weights of a 7B model take in FP16?", "About 14 GB", ["About 1.4 GB", "About 70 GB", "About 140 GB"], "7 billion parameters × 2 bytes ≈ 14 GB, before KV cache and overhead."],
  ["M11.6", "m", "Per-token vs per-GPU-hour pricing: when does per-GPU-hour win?", "When you keep the GPU busy with high, steady utilization", ["At low volume", "For occasional use", "Never"], "Idle GPUs cost money; per-token pays only for use."],
  ["M11.6", "e", "What is a cold start in serverless inference?", "Delay while a model loads onto hardware after scaling from zero", ["A cache hit", "A network outage", "A failed request"], "Scale-to-zero saves money but adds start latency."],
  ["M11.6", "h", "Why check checkpoint trust on model hubs?", "Malicious files (e.g. pickle) can execute code; prefer safetensors from trusted publishers", ["Hubs are always safe", "Checkpoints are encrypted", "For licensing only"], "Loading untrusted weights is a supply-chain risk."],

  // M11.7 Routers
  ["M11.7", "e", "What does an LLM gateway such as LiteLLM provide?", "One API across many providers with routing, keys and usage tracking", ["Model training", "Vector search", "GPU hosting"], "Gateways unify access and control."],
  ["M11.7", "m", "Why is the router a risk?", "It sits on the critical path, so its outage takes down all model calls", ["It is slower than models", "It costs too much", "It cannot log"], "Make it highly available."],
  ["M11.7", "m", "What can a router not hide?", "Differences in model behaviour, features and output quality", ["Different URLs", "Different auth headers", "Different SDKs"], "Swapping providers still needs evals."],
  ["M11.7", "e", "What are virtual keys in a gateway?", "Per-team or per-app keys mapped to budgets and limits", ["Fake keys", "Provider master keys", "Encryption keys"], "They enable attribution and control."],
  ["M11.7", "h", "Automatic failover \"changes who answers\". Why does that matter?", "Users may get different quality, tone or policy behaviour from the fallback", ["It never matters", "It improves quality", "It reduces cost always"], "Test the fallback path."],

  // M11.8 Build or buy
  ["M11.8", "e", "What is a managed knowledge base?", "A hosted retrieval service that ingests, indexes and searches your documents", ["A wiki", "A model", "A dataset license"], "It replaces parts of a hand-built RAG stack."],
  ["M11.8", "m", "How should build vs buy be decided?", "Layer by layer, on quality, control, cost and portability", ["Always buy", "Always build", "By vendor popularity"], "Different layers deserve different answers."],
  ["M11.8", "m", "What is the portability cost of a managed component?", "The effort to move off it later", ["Its monthly price", "Its latency", "Its accuracy"], "Lock-in is a real cost to measure."],
  ["M11.8", "e", "When is buying the honest call?", "When the managed option meets requirements and building adds little value", ["Never", "Always", "Only for startups"], "Do not build undifferentiated infrastructure."],
  ["M11.8", "h", "How should a managed retrieval service be evaluated?", "Run your own retrieval eval set against it and your current stack", ["Trust the vendor demo", "Check the price only", "Count features"], "Same eval, side by side."],

  // M11.9 Portability
  ["M11.9", "e", "What travels easily between platforms?", "Your eval sets and application code behind an abstraction", ["Provisioned throughput", "Platform-specific agents", "IAM policies"], "Keep portable assets portable."],
  ["M11.9", "m", "What is catalog lag?", "New models appearing on a platform later than on the provider's own API", ["Slow API responses", "Old prompts", "Billing delays"], "Platforms may lag the newest releases."],
  ["M11.9", "m", "Why treat migration as an evaluation exercise?", "The new platform must reach the same quality on your eval suite", ["Migration is only infra", "Evals are optional", "Quality never changes"], "Behaviour changes when models or platforms change."],
  ["M11.9", "e", "Why run two platforms in parallel during migration?", "To compare live behaviour and roll back safely", ["To double costs", "To confuse users", "Required by clouds"], "Parallel runs reduce risk."],
  ["M11.9", "h", "An honest view of multi-cloud is…", "It adds real complexity and is worth it only for specific requirements", ["Always required", "Free", "Simpler than single-cloud"], "Use it for real needs, not by default."],

  // M11.10 Capstone
  ["M11.10", "e", "Why re-run evals after moving to a managed platform?", "Model, region or API differences can change quality", ["To fill time", "Platforms require it", "Evals expire"], "Prove nothing regressed."],
  ["M11.10", "m", "What should a platform decision record include?", "Options considered, criteria, evidence and the reasons for the choice", ["Only the winner", "Pricing only", "Team names"], "Decision records explain the why."],
  ["M11.10", "m", "How do you show the gateway fallback works?", "Force the primary to fail and show traffic served by the fallback", ["Describe it", "Show the config only", "Assume it works"], "Demonstrate it."],
  ["M11.10", "e", "\"Cloud identity, no API key\" means…", "The app authenticates using a cloud role", ["The app has no auth", "Keys are in env vars", "Users type keys"], "Roles replace static keys."],
  ["M11.10", "h", "Capacity sizing should be based on…", "Expected requests and tokens per minute at peak", ["Average daily users only", "Model size", "Guesswork"], "Size for peaks and quotas."],

  // M12.1 Multimodal
  ["M12.1", "e", "What makes a model multimodal?", "It can take in or produce more than one modality, such as text and images", ["It has many layers", "It runs on many GPUs", "It supports many languages"], "Modality means the type of data."],
  ["M12.1", "m", "How does a native multimodal model differ from a pipeline?", "It processes modalities jointly instead of converting everything to text first", ["It is always smaller", "It cannot do text", "It only does images"], "Pipelines lose information in conversion."],
  ["M12.1", "m", "What does a speech-to-text-to-LLM pipeline throw away?", "Tone, emotion, emphasis and speaker cues", ["The words", "The language", "Nothing"], "Transcripts keep words, not delivery."],
  ["M12.1", "e", "\"Text as the interlingua\" means…", "Converting other modalities to text so a text model can reason over them", ["Translating languages", "Using English only", "Ignoring text"], "A common bolted-on approach."],
  ["M12.1", "h", "What carries over from text LLMs to multimodal ones?", "Context limits, prompting, evals and cost per token", ["Nothing", "Only tokenizers", "Only training data"], "Much of the engineering discipline transfers."],

  // M12.2 Image tokens
  ["M12.2", "e", "How do vision transformers turn an image into tokens?", "By splitting it into patches and encoding each patch", ["By OCR only", "By pixel-by-pixel text", "By compressing to JPEG"], "Patches become embeddings in the context."],
  ["M12.2", "m", "Why does a high-resolution image cost many tokens?", "More patches or tiles are needed to cover it", ["Images are billed per byte", "Color adds tokens", "File names are long"], "Token count scales with resolution."],
  ["M12.2", "m", "What does downscaling an image risk?", "Losing small text and fine details", ["Larger files", "Higher cost", "Color changes only"], "Small print disappears first."],
  ["M12.2", "e", "Images in a prompt share…", "The same context window as text", ["A separate unlimited budget", "Nothing with text", "The output tokens only"], "Images consume context budget."],
  ["M12.2", "h", "A dense page has tiny text in one corner. A good strategy is…", "Send an overview plus a high-detail crop of that region", ["Downscale the whole page", "Send only text metadata", "Increase temperature"], "Crops give detail where needed."],

  // M12.3 Vision failures
  ["M12.3", "e", "Which task do vision models often struggle with?", "Counting many similar objects precisely", ["Describing a scene", "Recognizing common objects", "Reading large headings"], "Counting and spatial reasoning are weak spots."],
  ["M12.3", "m", "What is fabricated visual detail?", "The model describing things that are not in the image", ["Image compression artifacts", "Blurry photos", "Watermarks"], "Visual hallucination."],
  ["M12.3", "m", "How should you ask \"how reliably?\" for a vision task?", "Measure accuracy on a labeled set of your own images", ["Trust demos", "Ask the model", "Check the model card only"], "Reliability must be measured on your data."],
  ["M12.3", "e", "A safeguard when vision reliability is short is…", "Route low-confidence cases to human review", ["Hide the errors", "Always trust the model", "Increase image size forever"], "Humans backstop weak spots."],
  ["M12.3", "h", "Why do vision models misread dense tables?", "Fine grid structure and small text are lost in patching and resizing", ["Tables are illegal", "Tables are always images", "Models ignore tables"], "Resolution limits hurt dense layouts."],

  // M12.4 Documents & visual RAG
  ["M12.4", "e", "When can you skip OCR for a PDF?", "When it has a text layer that extracts cleanly", ["Never", "Always", "When it has images"], "Native text is cheaper and more accurate."],
  ["M12.4", "m", "Why define a schema before prompting for document extraction?", "It fixes what fields to return and enables validation", ["Prompts must be JSON", "It shortens documents", "It removes OCR"], "Schema first, then extraction and validation."],
  ["M12.4", "m", "What is visual RAG?", "Retrieving page images or regions and passing them to a vision model", ["RAG with colored text", "Text-only RAG", "Image generation"], "Pages as retrieval units preserve layout."],
  ["M12.4", "h", "Why ground extracted fields to page regions?", "So reviewers can verify each value against its source location", ["To compress output", "To speed up OCR", "For styling"], "Grounding enables audit."],
  ["M12.4", "e", "When does plain text beat visual retrieval?", "When documents are mostly prose with clean text layers", ["Always", "For charts", "For scanned forms"], "Visual retrieval costs more tokens."],

  // M12.5 Generation
  ["M12.5", "e", "How do diffusion models generate images?", "By iteratively denoising random noise into an image", ["By predicting the next pixel left to right", "By retrieving stock photos", "By compressing text"], "Denoising guided by the prompt."],
  ["M12.5", "m", "What does fixing the seed do?", "Makes generation reproducible given the same settings", ["Improves quality", "Reduces cost", "Changes style"], "Same seed, same noise, same result."],
  ["M12.5", "m", "What is inpainting?", "Regenerating a masked region of an existing image", ["Extending the canvas", "Upscaling", "Captioning"], "Outpainting extends beyond the edges."],
  ["M12.5", "e", "Why track cost per accepted image?", "Many generations are rejected, so per-call cost understates real cost", ["Images are free", "To pay artists", "For SEO"], "Acceptance rate drives true cost."],
  ["M12.5", "h", "What does video generation add over images?", "Temporal consistency and motion across frames", ["Only higher resolution", "Only audio", "Nothing"], "Time makes it harder and costlier."],

  // M12.6 Audio tokens
  ["M12.6", "e", "What is a spectrogram?", "A representation of audio frequencies over time", ["A transcript", "A waveform file format", "A volume meter"], "Many audio models consume spectrogram-like features."],
  ["M12.6", "m", "How is audio typically priced?", "Per second or minute of audio", ["Per word", "Per file", "Per speaker"], "Silence still costs."],
  ["M12.6", "m", "Why is audio latency-sensitive?", "Conversation breaks down if replies take more than a second or so", ["Audio files are large", "Speakers are slow", "Codecs are slow"], "Humans expect fast turn-taking."],
  ["M12.6", "e", "Transcribe-then-prompt loses…", "Paralinguistic cues like tone and hesitation", ["All words", "Language", "Nothing"], "Audio-native models can keep them."],
  ["M12.6", "h", "Where does speech recognition commonly break?", "Noise, accents, code-mixing and domain terms", ["Silence", "Short words only", "Never"], "Test on your real audio."],

  // M12.7 STT/TTS
  ["M12.7", "e", "How is word error rate (WER) computed?", "(Substitutions + Deletions + Insertions) / words in the reference", ["Correct words / total words", "Characters / seconds", "Errors per minute"], "Lower is better; it can exceed 100%."],
  ["M12.7", "m", "What is speaker diarization?", "Determining who spoke when", ["Removing noise", "Translating speech", "Detecting language"], "It labels segments by speaker."],
  ["M12.7", "m", "What does Whisper return besides text?", "Segments with timestamps and the detected language", ["Speaker names", "Emotion labels", "Video frames"], "Timestamps enable alignment and subtitles."],
  ["M12.7", "e", "What is Kokoro?", "An open-weight text-to-speech model", ["A speech recognizer", "A vector DB", "A cloud platform"], "It turns text into speech."],
  ["M12.7", "h", "Why use streaming synthesis in voice apps?", "Audio can start playing before the whole response is synthesized", ["Higher quality", "Lower cost always", "Better pronunciation"], "Streaming cuts time to first audio."],

  // M12.8 Voice agents
  ["M12.8", "e", "What is barge-in?", "The user interrupting while the agent is speaking", ["Joining a call late", "A network error", "A loud noise"], "Agents must stop and listen."],
  ["M12.8", "m", "How does a cascaded voice agent work?", "Speech-to-text, then an LLM, then text-to-speech", ["One model end to end", "Text only", "Video to text"], "Speech-to-speech models skip the text steps."],
  ["M12.8", "m", "What does voice activity detection (VAD) do?", "Detects when someone is speaking versus silence", ["Translates speech", "Identifies speakers", "Removes accents"], "VAD drives endpointing."],
  ["M12.8", "h", "Why is endpointing hard?", "Pauses can mean thinking or finishing, so cutoffs risk interrupting or lagging", ["Audio is always clean", "Users never pause", "Models are too fast"], "It trades responsiveness against interruptions."],
  ["M12.8", "e", "During a slow tool call, a voice agent should…", "Say something brief so the line is not silent", ["Stay silent", "Hang up", "Repeat the question"], "Dead air feels like a dropped call."],

  // M12.9 Cross-modal
  ["M12.9", "e", "How was CLIP trained?", "Contrastively, aligning image and caption embeddings", ["On pixel prediction", "On next-word prediction only", "With labeled classes only"], "Matching pairs are pulled together, others pushed apart."],
  ["M12.9", "m", "What does a shared embedding space enable?", "Searching images with text queries and vice versa", ["Image generation", "Faster OCR", "Video editing"], "Different modalities become comparable."],
  ["M12.9", "m", "Caption-then-search vs cross-modal search: what does captioning lose?", "Visual details the caption did not mention", ["Nothing", "Text", "Speed"], "Captions compress images into words."],
  ["M12.9", "e", "How should you evaluate cross-modal retrieval?", "On queries and items from your own collection", ["Only public benchmarks", "By looking at three results", "By model size"], "Domain matters."],
  ["M12.9", "h", "Where does CLIP-style retrieval commonly fail?", "Fine-grained details, counting and text inside images", ["Common objects", "Simple scenes", "Color names"], "Global embeddings blur specifics."],

  // M12.10 Choosing
  ["M12.10", "e", "Where should choosing a multimodal model start?", "From the modalities your task needs in and out", ["From the biggest model", "From price alone", "From popularity"], "Requirements first."],
  ["M12.10", "m", "Why does image context cost matter?", "Each image consumes many tokens, multiplying cost per request", ["Images are free", "Only output costs", "It does not"], "Budget image tokens explicitly."],
  ["M12.10", "m", "Which data raises extra privacy concerns?", "Voice recordings, faces and scanned IDs", ["Public product photos", "Stock images", "Charts"], "Biometric and identity data need care."],
  ["M12.10", "e", "After shortlisting models, you should…", "Test them on your own inputs", ["Pick the first", "Trust benchmarks", "Skip testing"], "Your data decides."],
  ["M12.10", "h", "When might managed speech or document services beat a general model?", "When they are specialized, cheaper and accurate enough for the task", ["Never", "Always", "Only offline"], "Specialized services can win on cost and accuracy."],

  // M12.11 Deep research
  ["M12.11", "e", "Why are long research runs different from chat?", "Errors and drift compound over many steps", ["They are shorter", "They need no tools", "They are free"], "Long runs need planning and checkpoints."],
  ["M12.11", "m", "A good deep research strategy is…", "Breadth first to map the space, then depth on promising leads", ["Depth only", "Random search", "One query"], "Survey, then focus."],
  ["M12.11", "m", "How should conflicting sources be handled?", "Report the disagreement with evidence instead of picking silently", ["Pick the first", "Ignore both", "Average them"], "Transparency about conflict builds trust."],
  ["M12.11", "e", "Why attach claims to sources in a research report?", "So a human can audit the report", ["To lengthen it", "For SEO", "Required by APIs"], "Auditability matters for research."],
  ["M12.11", "h", "How should a research agent decide when to stop?", "When new searches stop adding information or the budget is reached", ["Never", "After one search", "When the context is full"], "Stopping criteria prevent waste."],

  // M12.12 On-device
  ["M12.12", "e", "What does quantization do?", "Stores weights at lower precision to reduce memory and speed up inference", ["Adds parameters", "Improves accuracy always", "Encrypts the model"], "It may cost some quality."],
  ["M12.12", "m", "What does on-device inference buy you?", "Privacy, offline use and no per-call cost", ["Unlimited model size", "Better quality always", "Free GPUs"], "Data stays on the device."],
  ["M12.12", "m", "What limits on-device models most?", "Memory, compute and battery", ["Internet speed", "Cloud quotas", "API keys"], "Hardware caps model size."],
  ["M12.12", "e", "Which modalities particularly suit on-device processing?", "Camera and microphone input that is private and latency-sensitive", ["Large document archives", "Web crawling", "Batch analytics"], "Local sensors pair well with local models."],
  ["M12.12", "h", "A 4-bit model uses roughly what fraction of FP16 weight memory?", "About a quarter", ["About half", "The same", "About a tenth"], "4 bits vs 16 bits per weight."],

  // M12.13 Capstone
  ["M12.13", "e", "Why use real inputs instead of samples in the capstone?", "Real inputs expose the failures demos hide", ["Samples are illegal", "Real inputs are cheaper", "For speed"], "Reality is messier."],
  ["M12.13", "m", "What should you measure per request?", "Latency and cost for each modality step", ["Only total users", "Only accuracy", "Only file size"], "Multimodal costs add up per step."],
  ["M12.13", "m", "Why document one real failure?", "It shows you understand the system's limits", ["To lower the grade", "It is required by law", "For length"], "Honest failure analysis is valuable."],
  ["M12.13", "e", "\"Runnable by someone else\" means…", "Clear setup steps and dependencies so another person can run it", ["Only you can run it", "It runs on one laptop", "It has no README"], "Reproducibility matters."],
  ["M12.13", "h", "What is a modality-specific failure?", "A failure caused by one input type, like misheard audio or misread images", ["A server crash", "A billing error", "A typo in code"], "Each modality fails differently."],

  // M13.1 Should you fine-tune
  ["M13.1", "e", "Why is fine-tuning usually the last option?", "It is costly and ties you to one base model, so cheaper fixes come first", ["It never works", "It is illegal", "It is free"], "Try prompting, RAG and better context first."],
  ["M13.1", "m", "What is fine-tuning good for?", "Consistent format, style or narrow task behaviour", ["Adding fresh facts that change daily", "Real-time data", "Citations"], "It changes behaviour, not live knowledge."],
  ["M13.1", "m", "What should trigger a fine-tune?", "A measured failure that prompting and RAG cannot fix", ["A new model release", "Curiosity", "A large dataset"], "Start from evidence."],
  ["M13.1", "e", "What is the full cost of a tune?", "Data work, training, evaluation, serving and future re-tunes", ["Only GPU hours", "Only API fees", "Nothing"], "Hidden costs dominate."],
  ["M13.1", "h", "Why does a fine-tune tie you to one base model?", "The adapter or weights only work with that base, so upgrades mean retraining", ["Licenses forbid change", "Tokenizers never change", "It does not"], "Model upgrades become projects."],

  // M13.2 Data curation
  ["M13.2", "e", "What should you specify before collecting fine-tuning data?", "The exact behaviour you want the model to learn", ["The GPU type", "The learning rate", "The batch size"], "Behaviour spec drives examples."],
  ["M13.2", "m", "Why compute loss only on responses?", "So the model learns to produce answers, not to predict the prompts", ["It is faster", "Prompts have no tokens", "Required by GPUs"], "Masking prompt tokens focuses learning."],
  ["M13.2", "m", "Why must training data match the model's chat template?", "Mismatched formatting degrades behaviour at inference", ["Templates are optional", "It saves tokens", "For licensing"], "Train and serve with the same template."],
  ["M13.2", "e", "Few clean examples vs many noisy ones?", "Few clean examples usually win", ["Many noisy always win", "They are equal", "Neither works"], "Quality beats quantity."],
  ["M13.2", "h", "What is a leak-free split?", "No near-duplicate examples shared between train and test sets", ["Random split only", "Test set larger than train", "No test set"], "Leakage inflates scores."],

  // M13.3 SFT
  ["M13.3", "e", "What does supervised fine-tuning train on?", "Input–output demonstration pairs", ["Preference pairs", "Rewards only", "Unlabeled text only"], "SFT imitates demonstrations."],
  ["M13.3", "m", "What is catastrophic forgetting?", "Losing general abilities after training on a narrow task", ["Forgetting the prompt", "Losing the checkpoint", "Running out of memory"], "Check regressions outside the task."],
  ["M13.3", "m", "Validation loss rises while training loss falls. What is happening?", "Overfitting", ["Underfitting", "Perfect training", "A data bug only"], "Pick an earlier checkpoint or reduce epochs."],
  ["M13.3", "e", "Which library offers SFTTrainer?", "Hugging Face TRL", ["NumPy", "FastAPI", "Prometheus"], "TRL provides SFT, DPO and other trainers."],
  ["M13.3", "h", "Why read outputs, not just loss?", "Loss can improve while outputs get worse in ways that matter", ["Loss is always wrong", "Outputs are shorter", "It is faster"], "Qualitative checks catch real issues."],

  // M13.4 LoRA
  ["M13.4", "e", "What does LoRA train?", "Small low-rank adapter matrices while the base weights stay frozen", ["All weights", "Only embeddings", "Only the tokenizer"], "Adapters are tiny compared to the base."],
  ["M13.4", "m", "What does QLoRA add?", "Training LoRA adapters on a base model quantized to 4-bit (NF4)", ["Full fine-tuning in FP32", "Reinforcement learning", "Distillation"], "It cuts memory so larger models fit on one GPU."],
  ["M13.4", "m", "What does the LoRA rank control?", "The capacity of the adapter (size of the low-rank matrices)", ["Learning rate", "Batch size", "Sequence length"], "Higher rank, more parameters."],
  ["M13.4", "e", "Unsloth and Axolotl are…", "Tools for efficient fine-tuning", ["Vector DBs", "Cloud platforms", "Guardrail libraries"], "They streamline PEFT training."],
  ["M13.4", "h", "In LoRA, the update is scaled by…", "alpha divided by rank", ["rank times alpha", "the learning rate only", "batch size"], "The alpha/r scaling keeps update magnitude stable across ranks."],

  // M13.5 DPO
  ["M13.5", "e", "What data does preference tuning use?", "Pairs of chosen and rejected responses to the same prompt", ["Single demonstrations", "Unlabeled text", "Images"], "It learns which response is better."],
  ["M13.5", "m", "How does DPO differ from classic RLHF?", "It optimizes directly on preferences without training a separate reward model", ["It needs a reward model", "It uses no data", "It only works on images"], "DPO turns preference learning into a classification-style loss."],
  ["M13.5", "m", "What is length bias in preference data?", "Raters favouring longer answers regardless of quality", ["Short prompts", "Long training runs", "Token limits"], "Control for length when building pairs."],
  ["M13.5", "e", "DPO is usually applied…", "After SFT", ["Before pretraining", "Instead of any data", "Only at inference"], "SFT first, then preferences."],
  ["M13.5", "h", "When is SFT enough without preference tuning?", "When there is a clear correct output to demonstrate", ["Never", "Always", "When data is noisy"], "Preferences help when quality is relative."],

  // M13.6 RFT
  ["M13.6", "e", "What does reinforcement fine-tuning optimize?", "A reward computed by a grader on the model's outputs", ["Next-token loss on demonstrations", "Preference pairs only", "Nothing"], "RFT learns from graded attempts."],
  ["M13.6", "m", "Which tasks suit RFT?", "Tasks with outputs that can be graded automatically", ["Open-ended poetry", "Tasks with no right answer", "Pure style transfer"], "Gradable outputs enable rewards."],
  ["M13.6", "m", "What is reward hacking?", "The model exploits flaws in the grader instead of solving the task", ["Stealing GPUs", "Faster training", "Better generalization"], "Design rewards carefully and inspect outputs."],
  ["M13.6", "e", "SFT vs DPO vs RFT: which learns from graded attempts rather than examples?", "RFT", ["SFT", "DPO", "None"], "SFT imitates, DPO compares, RFT optimizes rewards."],
  ["M13.6", "h", "How can you detect reward hacking?", "Read high-reward outputs and check them against independent evals", ["Trust the reward", "Train longer", "Raise the learning rate"], "High reward is not proof of quality."],

  // M13.7 Distillation
  ["M13.7", "e", "What is distillation?", "Training a smaller student model on a larger teacher's outputs", ["Compressing files", "Removing data", "Quantization"], "It transfers capability for lower cost."],
  ["M13.7", "m", "Why filter teacher outputs?", "Teachers make mistakes that the student would copy", ["To save disk", "Teachers are always right", "Required by APIs"], "Bad teacher outputs become student habits."],
  ["M13.7", "m", "What should you check in a provider's terms before distilling?", "Whether using outputs to train competing models is allowed", ["Pricing only", "Region list", "Model size"], "Some terms restrict this."],
  ["M13.7", "e", "Distillation mainly buys…", "Lower cost and latency", ["Higher capability than the teacher", "Fresh knowledge", "Citations"], "Students are cheaper, usually not better."],
  ["M13.7", "h", "Why does low diversity in distillation data hurt?", "The student generalizes poorly outside the narrow examples", ["It makes training slower", "It increases cost", "It does not"], "Diverse prompts matter."],

  // M13.8 Eval fine-tunes
  ["M13.8", "e", "What must exist before training?", "A baseline score on a held-out set", ["A deployed model", "A marketing plan", "Nothing"], "Without a baseline you cannot claim improvement."],
  ["M13.8", "m", "Why use the same held-out set and judge for all candidates?", "So differences reflect the model, not the evaluation", ["To save time", "Judges are random", "It is required"], "Like-for-like comparison."],
  ["M13.8", "m", "Which regressions should you check?", "General abilities and safety outside the target task", ["Only the target metric", "Training loss", "GPU memory"], "Fine-tunes can break other things."],
  ["M13.8", "e", "Why write the decision down?", "So others know why the fine-tune was or was not adopted", ["For length", "Legal requirement", "To hide results"], "Decision records preserve reasoning."],
  ["M13.8", "h", "Before adopting a fine-tune, check one last time whether…", "A simpler prompting or RAG fix closes the gap", ["The GPU is fast", "The loss is zero", "The adapter is small"], "Simpler alternatives are cheaper to maintain."],

  // M13.9 Serving adapter
  ["M13.9", "e", "What is the difference between serving an adapter separately and merging it?", "Separate adapters can be swapped on one base; merged weights are a single standalone model", ["No difference", "Merged is always slower", "Separate cannot be served"], "Choose based on flexibility versus simplicity."],
  ["M13.9", "m", "What does multi-LoRA serving in vLLM enable?", "Serving many adapters on one base model in one deployment", ["Training adapters", "Merging models", "Quantizing to 1-bit"], "Efficient for many tenants or tasks."],
  ["M13.9", "m", "Why must the serving template and tokenizer match training?", "Mismatches change inputs and degrade outputs", ["For speed", "For licensing", "They never matter"], "Consistency from train to serve."],
  ["M13.9", "e", "How should a fine-tuned model be rolled out?", "Gradually, via the gateway, with monitoring and a rollback path", ["To everyone at once", "Without monitoring", "Only on weekends"], "Canary releases limit blast radius."],
  ["M13.9", "h", "Ollama typically runs models in which format?", "GGUF", ["ONNX only", "SavedModel", "CSV"], "Quantized GGUF exports run in llama.cpp-based tools like Ollama."],

  // M13.10 Capstone LoRA
  ["M13.10", "e", "Why set the metric and threshold before training?", "To avoid moving the goalposts after seeing results", ["For speed", "Required by TRL", "To save GPU"], "Pre-registration keeps the comparison honest."],
  ["M13.10", "m", "Why must the prompted baseline be strong?", "Beating a weak baseline proves little", ["To lose on purpose", "For cost", "For style"], "Compare against your best non-tuned effort."],
  ["M13.10", "m", "What makes the LoRA run reproducible?", "Pinned data version, config, seed and library versions", ["A screenshot", "One run", "A large GPU"], "Others should get the same numbers."],
  ["M13.10", "e", "The comparison should include…", "Quality on the same set plus serving cost", ["Only training loss", "Only GPU hours", "Only adapter size"], "Value is quality per cost."],
  ["M13.10", "h", "The LoRA beats the baseline by 1% at 3× serving cost. What is the honest conclusion?", "It probably does not justify adoption unless that 1% matters a lot", ["Adopt it", "Retrain bigger", "Hide the cost"], "Record the trade-off in the decision record."],
];
