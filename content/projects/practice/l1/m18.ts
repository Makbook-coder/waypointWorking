import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M18: ProjectSrc[] = [
  practice("m1-8-what-occupies-the-context-window", "extend",
    pj("A context budget meter", 40, "Extend a chat loop to show how full the context window is and warn before it overflows.",
      [
        ["Run the starter chat and chat for a few turns.", "It keeps the whole history."],
        ["Count tokens for the system prompt, history and the new message with a tokenizer.", "`tiktoken` is fine as an estimate for any model."],
        ["Print a line after each turn such as `context: 1,240 / 8,192 tokens (15%)` with a split between system, history and reply.", "Reserve space for the reply."],
        ["Warn at 80 percent and, at 95 percent, drop the oldest turns while keeping the system prompt.", "Never drop the system message."],
        ["Chat long enough to trigger both and check the meter matches the usage the API reports.", "Compare the numbers."],
      ],
      "A chat that prints a context meter each turn, warns at 80 percent and trims safely.",
      ["Meter shows system, history and reply parts", "Oldest turns trimmed first", "System prompt is never dropped", "Estimate compared with reported usage"],
      "Understand context versus knowledge versus memory next.", [LLM, "tiktoken"]),
    { starter: code(
      "history = [{'role': 'system', 'content': 'You are concise.'}]",
      "while True:",
      "    history.append({'role': 'user', 'content': input('you> ')})",
      "    reply = chat(history)          # your provider call",
      "    history.append({'role': 'assistant', 'content': reply})",
      "    print(reply)") }),
  practice("m1-8-context-knowledge-memory", "debug",
    pj("My chatbot forgets", 30, "Find why a chatbot forgets what you told it, and separate context, knowledge and memory.",
      [
        ["Run the starter, tell the bot your name and then ask for it.", "It will not know your name, because the second call sends only the new message."],
        ["Print the messages sent on the second call and see what is missing.", "Each call is independent."],
        ["Fix it by sending the earlier turns, and confirm the name is remembered.", "Keep a list of messages."],
        ["Restart the program and ask again; it forgets once more. Save history to a file and load it on start.", "Use `json.dump` to save the message list and `json.load` to read it back on start."],
        ["Write which of the three it was each time: something in context, something the model knows from training, or memory your code holds.", "Add one example of each."],
      ],
      "A bot that remembers within a session and across restarts, and three labelled examples of context, knowledge and memory.",
      ["Bug found by printing the messages", "Within-session memory fixed", "History saved across restarts", "Three concepts explained with examples"],
      "See what goes wrong in long contexts next.", [LLM]),
    { starter: code(
      "def ask(user_text):",
      "    return chat([{'role': 'user', 'content': user_text}])   # your provider call",
      "print(ask('My name is Priya.'))",
      "print(ask('What is my name?'))") }),
  practice("m1-8-what-goes-wrong-in-long-contexts", "challenge",
    pj("Needle in a haystack", 50, "Measure how well a model finds a fact hidden at different places in a long text, with no steps given.",
      [],
      "A grid of results showing retrieval accuracy by document length and needle position.",
      ["A hidden fact is inserted at the start, middle and end of filler text", "At least three document lengths are tested", "Each cell is repeated at least three times", "Results are shown as a grid or heat map", "You also test a question that needs two facts from different places", "You state where and why the model got worse"],
      "Learn why a big window is not enough next.", [LLM]),
    { hints: ["Use a made-up fact so the model cannot know it already, such as a fictional code word.", "Build the filler from any long public text repeated or concatenated.", "A pass is when the reply contains the exact code word."] }),
  practice("m1-8-why-a-big-window-is-not-enough", "optimise",
    pj("Trim the context, keep the answer", 45, "Reduce what you send to a model from the whole document to just what matters, and compare cost and accuracy.",
      [
        ["Take a long document (at least 10,000 words) and ten questions whose answers are in it.", "Write the answers first."],
        ["Ask all ten with the whole document in the prompt, and record accuracy, tokens and cost.", "That is the baseline."],
        ["Split the document into paragraphs, embed them and send only the top five matching paragraphs per question.", "Use cosine similarity."],
        ["Compare accuracy and cost with the baseline.", "Look for questions that now fail."],
        ["Write when sending everything is better and when selecting is better.", "Think about questions that need the whole document."],
      ],
      "A comparison of whole-document and selected-context runs on accuracy and cost.",
      ["Baseline recorded", "Selection pipeline works", "Failures inspected", "Trade-off explained"],
      "Next, capabilities and failure modes in the following module.", [LLM, "An embedding model"]),
    { starter: code(
      "questions = [('Who founded the company?', 'Ada Verma'), ('In which year did it list?', '2019')]",
      "doc = open('annual_report.txt').read()",
      "prompt = f'Document:\\n{doc}\\n\\nQuestion: {{q}}'") }),
];
