import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M83: ProjectSrc[] = [
  practice("m8-3-jailbreaks-vs-injection", "review",
    pj("Label each report", 30, "Review incident reports and decide whether each is a jailbreak or an injection.",
      [
        ["Read the six reports below and write who the attacker is in each.", "Is it the user or a third party?"],
        ["Label each report as a jailbreak, an injection or both.", "Give a one-line reason."],
        ["For each, write which control would help most.", "Pick a control that fits the label."],
        ["Write one report that is hard to label and explain why.", "Say what extra detail would settle it."],
      ],
      "Six labelled incident reports with reasons and matching controls, plus one hard case.",
      ["Attacker named for each", "Labels with reasons", "Hard case written"],
      "Look at input and output guardrails next.", ["A text editor"]),
    { starter: code(
      "A. A user tells the bot to role-play a character with no rules and gets banned content.",
      "B. A pasted PDF contains hidden text telling the bot to email the user's notes elsewhere.",
      "C. A user asks the bot to repeat its hidden instructions word for word.",
      "D. A shared calendar invite tells the assistant to accept all future invites.") }),
  practice("m8-3-input-and-output-guardrails", "extend",
    pj("Add an output guardrail", 40, "Extend an input-only filter with an output check for leaked secrets.",
      [
        ["Run the starter filter on the test messages and note which unsafe replies still come out.", "List them. Try it on one small example first."],
        ["Write an output check that looks for secrets, personal data and banned topics.", "Return a reason. Write down what you see before changing anything."],
        ["Decide what to do on a failure, such as replacing the reply or asking again.", "Never show the blocked text."],
        ["Rerun the test messages and count blocked, passed and wrongly blocked.", "Report the three numbers."],
      ],
      "A filter with an output check that blocks leaks and a count of blocked, passed and wrongly blocked replies.",
      ["Remaining leaks listed", "Output check returns a reason", "Three counts reported"],
      "Look at why one layer is not enough next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "def reply(msg):",
      "    if is_unsafe(msg): return 'Sorry, I cannot help with that.'",
      "    return llm(SYSTEM + msg)     # nothing checks what comes back") }),
  practice("m8-3-why-one-layer-is-not-enough", "challenge",
    pj("Beat a single filter", 45, "Show that one filter fails and build a combination that holds, with no steps given.",
      [],
      "A single-filter app that is broken by at least five attacks and a layered version that stops most of them.",
      ["Five attacks that beat the single filter", "Two or more independent layers added", "Before and after success rates", "A note on the false blocks your layers cause"],
      "Look at testing with obfuscated input next.", ["Python 3.11 or newer", LLM]),
    { hints: ["Try rewording, other languages and splitting a request across messages against the single filter.", "Make each layer fail for different reasons, for example a keyword check and a model check.", "Measure legitimate requests too, because a filter that blocks everything is not a defence."] }),
  practice("m8-3-testing-against-obfuscated-input", "optimise",
    pj("Normalise before you filter", 40, "Make a filter harder to dodge by cleaning the input before it checks.",
      [
        ["Run the starter filter against the obfuscated attacks and record which ones pass.", "Save the list. Compare with a case you know the answer to."],
        ["Write a cleaning step that handles case, spacing, look-alike characters and encodings.", "Keep it small. Keep a note of each result."],
        ["Apply it before the filter and rerun the attacks.", "Count how many are now caught."],
        ["Check that normal messages are not damaged by the cleaning.", "Report any that changed."],
      ],
      "A filter with a cleaning step that catches more obfuscated attacks without damaging normal messages.",
      ["Starting misses recorded", "Cleaning step added", "Normal messages unchanged"],
      "Look at least privilege for agents next.", ["Python 3.11 or newer"]),
    { starter: code(
      "BLOCKED = ['ignore previous', 'system prompt']",
      "def is_unsafe(msg): return any(b in msg.lower() for b in BLOCKED)",
      "# misses: 'i g n o r e previous', base64 text, look-alike letters") }),
];
