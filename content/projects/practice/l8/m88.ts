import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M88: ProjectSrc[] = [
  practice("m8-8-bias-transparency-and-human-oversight", "debug",
    pj("Why one group was refused more", 45, "Find why a screening assistant treats groups differently and add oversight.",
      [
        ["Run the starter assistant on the paired test cases and record the decision for each group.", "Put results in a table."],
        ["Compare the decisions and find where the difference starts.", "Check the prompt and any features used."],
        ["Remove or change the cause and add a human review step for borderline cases.", "Explain the reason to the reviewer."],
        ["Rerun the pairs and report the gap before and after.", "Say what is still unknown."],
      ],
      "An assistant with a smaller gap between groups, a human review step, and an honest note on what remains unknown.",
      ["Gap measured", "Cause changed", "Human review added"],
      "Look at documenting use, limits and risks next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "Prompt: 'Rate this applicant. Prefer candidates from well-known universities and short career gaps.'",
      "Paired cases: identical resumes except for the name and a two-year gap for caring duties.",
      "Result: the pair with the gap is rated lower in 8 of 10 runs.") }),
  practice("m8-8-documenting-use-limits-and-risks", "challenge",
    pj("Write a model card for your app", 45, "Write a short and honest model card for an app you built, with no steps given.",
      [],
      "A model card that states the intended use, the limits and the known risks, backed by evidence from your own tests.",
      ["Intended and out-of-scope uses stated", "At least three limits shown with test evidence", "Risks with mitigations listed", "A named owner and a review date"],
      "Look at the EU AI Act and India's DPDP next.", ["A text editor"]),
    { hints: ["Run a few cases that show where the app fails and cite them in the limits section.", "Write out-of-scope uses plainly, such as medical or legal advice.", "Include what you do not know yet, because honest gaps build trust."] }),
  practice("m8-8-the-eu-ai-act-and-india-s-dpdp", "review",
    pj("Review a product against the rules", 35, "Review a product description and mark where the EU AI Act and DPDP would apply.",
      [
        ["Read the product description below and list the kinds of data it handles and the decisions it makes.", "Note who is affected."],
        ["Decide which risk category of the EU AI Act it might fall in and give your reason.", "Say what you are unsure about."],
        ["List the duties under the DPDP, such as consent and notice, that the product would have.", "Match each to a feature."],
        ["Write three questions you would ask a lawyer.", "This is not legal advice."],
      ],
      "A review noting the likely risk category, data protection duties and three questions for a lawyer.",
      ["Data and decisions listed", "Category with reasons", "Three lawyer questions"],
      "Look at auditability next.", ["A text editor"]),
    { starter: code(
      "Product: a hiring assistant used by companies in Europe and India that ranks applicants,",
      "reads resumes with names and phone numbers, stores them for two years, and reports a score to recruiters.") }),
  practice("m8-8-auditability", "optimise",
    pj("Better audit logs", 40, "Improve an audit log so any decision can be explained later without storing personal data.",
      [
        ["Read the starter log and write which questions an auditor could not answer from it.", "List at least three."],
        ["Add fields for the model version, prompt version, inputs by reference and outcome.", "Store ids, not raw personal data."],
        ["Make the log append-only and add a timestamp and a chain hash.", "Detect a changed entry."],
        ["Replay one decision from the log and show the answer to an auditor's question.", "Change a line and show it is caught."],
      ],
      "An audit log that explains a decision, avoids raw personal data and detects tampering.",
      ["Unanswerable questions listed", "Fields added using ids", "Tampering detected"],
      "Look at attacking an app you already built next.", ["Python 3.11 or newer"]),
    { starter: code(
      "log.info('decision made')",
      "log.info('user said: ' + message)       # raw text, and no model version or outcome") }),
];
