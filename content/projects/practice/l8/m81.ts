import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M81: ProjectSrc[] = [
  practice("m8-1-how-the-attack-surface-changes", "review",
    pj("Review a design for new attack paths", 30, "Review a design for an AI feature and list the attack paths that a normal web app would not have.",
      [
        ["Read the design below and list every place where text from outside enters the system.", "Include documents, emails and web pages, not only the chat box."],
        ["For each entry point, write what an attacker could try to make the model do.", "Use one sentence per entry point."],
        ["Mark which paths exist only because a model is involved.", "Explain in a few words why a normal app would not have them."],
        ["Rank the top three paths by how much damage they could do and say what you would check first.", "Give one concrete check for each."],
      ],
      "A review listing every entry point, the attacks that the model makes possible and the top three paths ranked.",
      ["Every entry point listed", "Model-only paths marked", "Top three ranked with a check"],
      "Look at trust boundaries next.", ["A text editor"]),
    { starter: code(
      "Feature: an assistant reads a customer's inbox, summarises new mail and can send replies.",
      "It also searches the company wiki and calls a refund tool when the mail asks for a refund.",
      "Logs of every prompt are kept for a year and shown to the support team.") }),
  practice("m8-1-trust-boundaries", "debug",
    pj("Find the missing boundary", 40, "Find the place where an app treats untrusted text as trusted and fix it.",
      [
        ["Run the starter app with the sample email and write down what the model was told.", "Mark which parts came from the developer and which came from outside."],
        ["Find the line where outside text is joined to the instructions.", "Explain in one sentence why the model cannot tell them apart."],
        ["Move the outside text into a clearly labelled data section and add a check on what the model may do with it.", "Keep the rules in code, not only in the prompt."],
        ["Rerun the sample email and show that the app no longer follows the instruction hidden in it.", "Report what you changed."],
      ],
      "A fixed app that keeps outside text separate from instructions and ignores the instruction hidden in the sample email.",
      ["Mixed line found", "Outside text labelled as data", "Hidden instruction no longer followed"],
      "Look at why model output is untrusted next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "prompt = 'You are a helpful assistant. Summarise this email and do what it asks: ' + email_body",
      "reply = llm(prompt)",
      "if 'SEND:' in reply: send_mail(reply.split('SEND:')[1])") }),
  practice("m8-1-model-output-is-untrusted", "challenge",
    pj("Treat the output like user input", 45, "Make an app safe to use with a model whose output may contain attacks, with no steps given.",
      [],
      "An app that checks and escapes everything the model returns before it is shown, stored or run.",
      ["Model output rendered without running any markup in it", "Structured output checked against a schema before use", "At least five hostile outputs tested", "A note listing every place model output is used"],
      "Look at prompt injection next.", ["Python 3.11 or newer", LLM]),
    { hints: ["List every place the output goes first, such as a web page, a database query and a command.", "Treat the output the same way you would treat text typed by a stranger into a form.", "Write your hostile outputs by hand, including script tags and quote characters, and run them through each place."] }),
];
