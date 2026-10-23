import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M86: ProjectSrc[] = [
  practice("m8-6-identifying-sensitive-data", "challenge",
    pj("Find the sensitive fields", 45, "Build a detector for sensitive data in free text with no steps given.",
      [],
      "A detector that finds common personal data in text and reports its precision and recall on cases you labelled.",
      ["At least 30 labelled examples including tricky ones", "Detectors for at least four kinds of data", "Precision and recall reported", "A note on what the detector misses"],
      "Look at redaction and minimisation next.", ["Python 3.11 or newer"]),
    { hints: ["Start with patterns for emails, phone numbers and ids, then add a list of names if you need one.", "Label examples before you write the detector so you cannot tune to your own answers.", "Include look-alikes such as order numbers that resemble phone numbers."] }),
  practice("m8-6-redaction-and-minimization", "extend",
    pj("Reversible redaction", 40, "Extend a redactor so it replaces values with tokens and can restore them for the user.",
      [
        ["Run the starter redactor and note that it destroys the values.", "Show one example. Write down what you see before changing anything."],
        ["Replace each value with a stable token such as EMAIL_1 and keep the mapping in memory only.", "Never put the mapping in a prompt."],
        ["Send the redacted text to the model and restore tokens in the reply for the user.", "Handle a token the model changes."],
        ["Test with three messages and report which values reached the model.", "Check none were raw."],
      ],
      "A redactor that tokenises values before the model call and restores them afterwards, tested on three messages.",
      ["Destruction shown", "Mapping stays out of prompts", "No raw value reached the model"],
      "Look at keeping PII out of logs next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "def redact(text):",
      "    return re.sub(r'[\\w.]+@[\\w.]+', '[REDACTED]', text)     # the original is lost") }),
  practice("m8-6-keeping-pii-out-of-logs-and-traces", "debug",
    pj("Where the email address leaked", 40, "Find the places that write personal data to logs and fix them.",
      [
        ["Run the starter app with a test user and search every log file and trace for the email address.", "Write down every place it appears."],
        ["For each place, find the line of code that wrote it.", "Include error handlers and debug prints."],
        ["Add a scrubbing step to the logger and remove prints that dump whole requests.", "Keep enough detail to debug."],
        ["Rerun the app and search every log and trace again for the test email address.", "Show no personal data remains and an error is still understandable."],
      ],
      "An app whose logs and traces contain no personal data but remain useful for debugging.",
      ["Every leak location found", "Scrubber added", "Rerun search comes back clean"],
      "Look at retention, deletion and residency next.", ["Python 3.11 or newer"]),
    { starter: code(
      "log.info('request %s', request.json())            # whole body, including email",
      "except Exception as e: print('failed for', user.email, e)") }),
  practice("m8-6-retention-deletion-and-residency", "reimplement",
    pj("Rebuild deletion", 45, "Rebuild a user-deletion job so it removes data from every store.",
      [
        ["List every place a user's data lives, such as the database, cache, vector index, logs and backups.", "Include places you only suspect."],
        ["Write a deletion function that removes the data from each store and records what it did.", "Do not record the data itself."],
        ["Add a retention rule that deletes old data on a schedule.", "Make the period a setting."],
        ["Test by creating a user, deleting them and searching every store.", "Report what remained."],
      ],
      "A deletion job that removes a user from every store, with a retention rule and a test that searches each store.",
      ["Every store listed", "Deletion logged without data", "Test finds nothing left"],
      "Look at private connectivity and zero retention next.", ["Python 3.11 or newer"])),
  practice("m8-6-private-connectivity-and-zero-retention", "review",
    pj("Review a provider setup", 30, "Review how an app sends data to a model provider and find what leaves the network.",
      [
        ["Read the setup below and draw the path a request takes.", "Mark each hop. Compare with a case you know the answer to."],
        ["For each hop, write who can see the data and how long it is kept.", "Mark unknowns as questions."],
        ["List the contract and settings you would need, such as zero retention.", "Say how you would check each."],
        ["Write a short decision on whether this setup is acceptable for health data.", "Give your reasons."],
      ],
      "A reviewed data path with visibility and retention noted for each hop and a decision for health data.",
      ["Request path drawn", "Visibility and retention per hop", "Decision with reasons"],
      "Look at protecting secrets from the model next.", ["A text editor"]),
    { starter: code(
      "App server -> public internet -> provider API (default settings) -> provider logs.",
      "Prompts include patient notes. Traces are sent to a third-party monitoring service.",
      "No data processing agreement has been checked.") }),
  practice("m8-6-protecting-secrets-from-the-model", "optimise",
    pj("Keep keys out of prompts", 35, "Change an app so the model never sees a secret yet tools still work.",
      [
        ["Search the starter prompts, tool outputs and logs for keys and passwords.", "List where they appear."],
        ["Move secrets into the tool code so the model only names the action.", "Read them from the environment."],
        ["Scrub tool outputs so secrets cannot flow back to the model.", "Test with an error message that echoes a key."],
        ["Try three prompts that ask the model to reveal a key and report the results.", "None should succeed."],
      ],
      "An app where secrets live only in tool code and three reveal attempts fail.",
      ["Secret locations listed", "Tool code holds the secrets", "Three reveal attempts fail"],
      "Look at adversarial test suites next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "SYSTEM = 'You can call the API with key sk-test-12345. Use it when needed.'",
      "tool_result = http.get(url, headers={'Authorization': KEY}).text      # errors echo the header") }),
];
