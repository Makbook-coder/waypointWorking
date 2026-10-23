import { LLM, moduleCapstone, pj, topicProjects } from "../build";
import type { ProjectSrc } from "../types";

const AI = ["Python 3.11 or newer", LLM, "Speech and vision models or APIs"];

export const M146: ProjectSrc[] = [
  ...topicProjects("m14-6-realtime-voice-or-vision-pipeline", [
    pj("A first streaming pipeline", 45, "Build a pipeline that takes audio or images in and returns a streamed answer.",
      [
        ["Pick voice or vision and write down the result.", "One. Write down what you see before changing anything."],
        ["Capture input and send it to a model.", "Basic. Re-read the step and try the smallest version first."],
        ["Stream the answer back as soon as it starts.", "Streaming. Check one example by hand to be sure."],
        ["Time the first output and the full output for ten inputs.", "Table. Save your work so you can compare later."],
      ],
      "A streaming voice or vision pipeline with timings for first and full output over ten inputs.",
      ["Input captured", "Answer streams", "Ten timings recorded"],
      "Next, harden it for real conditions.", AI),
    pj("A pipeline that survives real input", 90, "Make the pipeline robust to noisy input, slow calls and interruptions.",
      [
        ["Test with noisy audio or poor images and record failures.", "Cases. Ask what changed since the last run."],
        ["Add endpointing or image quality checks.", "Gate. Print the intermediate values to see them."],
        ["Add interruption handling or cancellation.", "Cancel. Start with a single input before using many."],
        ["Add timeouts and a graceful failure message.", "UX. Take it one small step at a time."],
        ["Measure latency percentiles over 30 runs.", "Table. Write down what you see before changing anything."],
        ["Log each turn for later review.", "Trace. Re-read the step and try the smallest version first."],
      ],
      "A robust voice or vision pipeline with noisy input tests, cancellation, timeouts and latency percentiles.",
      ["Noisy input tested", "Cancellation works", "Percentiles reported"],
      "Next, the module capstone ships a voice or multimodal build.", AI),
  ]),
  moduleCapstone("M14.6", ["m14-6-realtime-voice-or-vision-pipeline"], pj("Voice or multimodal build", 480,
    "Ship a voice or multimodal application that works on real inputs with measured latency, cost and failure handling.",
    [
      ["Choose a realistic use case and the modalities it needs.", "Scope. Check one example by hand to be sure."],
      ["Collect real inputs and write 20 test cases with expected results.", "Not samples. Save your work so you can compare later."],
      ["Build the pipeline end to end with streaming where it matters.", "Working. Ask what changed since the last run."],
      ["Add validation, confidence handling and a human fallback.", "Safety. Print the intermediate values to see them."],
      ["Test modality-specific failures such as noise, blur and accents.", "Log. Start with a single input before using many."],
      ["Measure latency percentiles and cost per request.", "Numbers. Take it one small step at a time."],
      ["Add privacy controls for sensitive inputs.", "Redaction. Write down what you see before changing anything."],
      ["Record a demo with a real use.", "Evidence. Re-read the step and try the smallest version first."],
      ["Write a README with results, failures and next steps.", "Honest. Check one example by hand to be sure."],
    ],
    "A voice or multimodal app with real-input tests, measured latency and cost, failure handling, privacy controls and a demo.",
    ["Real-input cases scored", "Latency and cost reported", "Failures documented"],
    "Next, portfolio and positioning.", AI)),
];
