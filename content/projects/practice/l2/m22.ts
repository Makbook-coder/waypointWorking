import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M22: ProjectSrc[] = [
  practice("m2-2-rendering-output-incrementally", "extend",
    pj("Stream into a live terminal view", 40, "Extend a streaming script so it renders text as it arrives, with a spinner before the first token and a clean ending.",
      [
        ["Run the starter and see that it prints nothing until the whole reply is ready.", "That is the non-streaming version."],
        ["Switch to the streaming call and print each chunk without a newline, flushing the output.", "Use `print(chunk, end='', flush=True)`."],
        ["Show a waiting indicator until the first chunk arrives, then replace it with the text.", "A simple dots animation in a thread works."],
        ["Handle a stream that ends with an error and print a clear message after the partial text.", "Wrap the loop in `try/except`."],
        ["Print the final token count and total time after the stream ends.", "Usage often arrives in the last chunk."],
      ],
      "Text appearing word by word after a short wait indicator, with a clean error and a final summary line.",
      ["Chunks printed with flush", "Waiting indicator shown", "Errors end cleanly", "Summary printed"],
      "Measure time to first token next.", [LLM]),
    { starter: code(
      "reply = client.chat([{'role': 'user', 'content': 'Explain recursion in three paragraphs.'}])",
      "print(reply)") }),
  practice("m2-2-ttft-and-perceived-latency", "optimise",
    pj("Make it feel fast", 40, "Measure first-token and total time and use design changes to make a slow answer feel faster.",
      [
        ["Measure the starter with and without streaming and record both times for five runs.", "Use `perf_counter`."],
        ["Reduce first-token time by shortening the prompt and trimming old history, and measure again.", "Prefill time grows with input size."],
        ["Reduce total time by asking for a shorter answer or setting a sensible output limit.", "Decode time grows with output length."],
        ["Add a quick first sentence pattern, such as asking the model to start with a one-line answer.", "Users read while the rest streams."],
        ["Make a table of the four variants with median first-token and total times and say which felt best.", "Time to first token matters most for chat."],
      ],
      "A table of four variants with measured first-token and total times and a short judgement of what felt fastest.",
      ["Five runs per variant", "Medians reported", "Prompt and output changes measured separately", "Judgement written"],
      "Handle accumulating and interrupting streams next.", [LLM]),
    { starter: code(
      "import time",
      "def run(prompt, history):",
      "    t0 = time.perf_counter()",
      "    reply = client.chat(history + [{'role': 'user', 'content': prompt}])   # no streaming",
      "    return time.perf_counter() - t0") }),
  practice("m2-2-accumulating-and-interrupting-streams", "debug",
    pj("The truncated saved answer", 35, "Find why a streamed answer is saved incomplete and why stopping a stream leaves junk behind.",
      [
        ["Run the starter and compare what was printed with what was saved.", "The saved text is missing pieces."],
        ["Find the line that drops chunks, such as overwriting the buffer instead of appending.", "Print the chunk count and the length of the buffer."],
        ["Fix it and confirm the saved text equals the printed text.", "Join the pieces at the end."],
        ["Add a stop on Ctrl+C that saves the partial text with a `stopped` flag and closes the stream.", "Catch `KeyboardInterrupt`."],
        ["Test by stopping after two seconds and checking the saved record and that no request keeps running.", "Check that the connection is closed in a `finally`."],
      ],
      "Saved text that equals the printed text and a stopped stream that saves a flagged partial answer.",
      ["Dropped chunks found and fixed", "Ctrl+C saves a flagged partial answer", "Stream is closed after stopping"],
      "Move on to LangChain fundamentals next.", [LLM]),
    { starter: code(
      "saved = ''",
      "for chunk in stream(prompt):   # your provider's streaming call",
      "    print(chunk, end='', flush=True)",
      "    saved = chunk",
      "open('answer.txt', 'w').write(saved)") }),
];
