import { practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");
const MM = ["Python 3.11 or newer", "A multimodal model API"];

export const P_M121: ProjectSrc[] = [
  practice("m12-1-what-makes-a-model-multimodal", "debug",
    pj("A model that is not multimodal", 35, "Find why a system sold as multimodal is really a text model behind a captioner and fix the claim or the design.",
      [
        ["Read the starter description and trace what reaches the language model.", "Write each hop down."],
        ["Mark every place the image is turned into text before the model sees it.", "Look for a captioner."],
        ["Test one question that needs pixel detail and show the answer fails.", "Use a small text-on-image example."],
        ["Rewrite the description honestly or change the design to pass pixels through.", "Pick one. Ask what changed since the last run."],
      ],
      "A corrected description or design with the captioning hop identified and one failing pixel-detail question shown.",
      ["Hops traced and confirmed", "Captioning step found", "Failing example shown"],
      "Look at native multimodal against bolted-on pipelines next.", MM),
    { starter: code(
      "Our assistant is fully multimodal. Flow: image -> caption model -> 'A photo of a receipt' -> chat LLM -> answer.",
      "Users ask for the total on the receipt and get 'I cannot see the total'.") }),
  practice("m12-1-native-multimodal-vs-bolted-on-pipeline", "review",
    pj("Review an architecture choice", 30, "Review a design document that chose a pipeline over a native model and judge the reasoning.",
      [
        ["Read the starter note and list the claims it makes about native models.", "Quote each. Print the intermediate values to see them."],
        ["Mark which claims are supported by evidence and which are assumed.", "Be strict. Start with a single input before using many."],
        ["List two risks the note missed.", "Think about cost and failure modes."],
        ["Write your verdict and the test that would settle the question.", "A concrete test. Take it one small step at a time."],
      ],
      "A review with supported and assumed claims marked, two missed risks and a settling test.",
      ["Claims listed", "Evidence judged", "Settling test described"],
      "Look at text as the interlingua next.", ["A text editor"]),
    { starter: code(
      "Decision: use OCR + LLM pipeline. Native models are slower, always cost more and hallucinate more. We tested nothing yet.",
      "Fallback: if the pipeline fails we will retry the same pipeline.") }),
  practice("m12-1-text-as-the-interlingua", "extend",
    pj("Add a second modality to a text chain", 40, "Extend a text-only chain so a second modality passes through text correctly and note what is lost.",
      [
        ["Read the starter chain and note that it only accepts text.", "List its stages. Write down what you see before changing anything."],
        ["Add a stage that turns an audio or image input into text.", "Pick one. Re-read the step and try the smallest version first."],
        ["Run three inputs and save the intermediate text.", "Look at it. Check one example by hand to be sure."],
        ["Write what the text lost and which question now fails.", "One example. Save your work so you can compare later."],
      ],
      "A chain accepting a second modality through text with the intermediate text saved and the loss named.",
      ["Stage added and confirmed", "Intermediate text saved", "Loss named and confirmed"],
      "Look at what carries over from text LLMs next.", MM),
    { starter: code(
      "def answer(question: str) -> str:",
      "    return llm(f'Answer briefly: {question}')") }),
  practice("m12-1-what-carries-over-from-text-llms", "challenge",
    pj("Port your text habits", 50, "Decide which of your text LLM habits still hold for a multimodal model and prove it, with no steps given.",
      [],
      "A tested list of text habits that carry over and ones that do not, with evidence for each.",
      ["At least six habits tested such as few-shot, JSON output, system prompts and temperature", "Each tested on text and on an image task", "Results tabulated with a verdict per habit", "One surprise explained"],
      "Look at what any-to-any really means next.", MM),
    { hints: ["Pick habits you actually use, then test each on an image task.", "Keep the task fixed and change only the habit so you can see its effect.", "Record cases where the habit hurt as well as where it helped."] }),
  practice("m12-1-what-any-to-any-really-means", "reimplement",
    pj("Rebuild any-to-any by hand", 45, "Rebuild an any-to-any feature from separate single-purpose models to see what the label hides.",
      [
        ["Choose two input and two output modalities, such as image and text in, text and speech out.", "Four paths. Ask what changed since the last run."],
        ["Wire the paths from separate models, one per conversion.", "Stubs allowed. Print the intermediate values to see them."],
        ["Run one example through every path and time each.", "A table. Start with a single input before using many."],
        ["List the paths that a true any-to-any model would shorten.", "Evidence from timing."],
      ],
      "A hand-built four-path any-to-any flow with timings and a list of the paths a single model would shorten.",
      ["Four paths wired", "Timings recorded", "Shortened paths listed"],
      "Look at what a pipeline throws away next.", MM)),
  practice("m12-1-what-a-pipeline-throws-away", "optimise",
    pj("Keep what the pipeline drops", 40, "Reduce the information a pipeline loses between stages without making it much slower.",
      [
        ["Read the starter pipeline and list what each stage discards.", "Stage by stage. Take it one small step at a time."],
        ["Pick the loss that hurts answers most.", "Test it. Write down what you see before changing anything."],
        ["Pass that information along, such as a crop, a confidence or the raw text.", "Smallest change. Re-read the step and try the smallest version first."],
        ["Compare accuracy and time before and after.", "Table. Check one example by hand to be sure."],
      ],
      "A pipeline that keeps the most damaging lost information with accuracy and time compared before and after.",
      ["Losses listed", "One loss recovered", "Before and after compared"],
      "Look at patches and the vision encoder in the next module.", MM),
    { starter: code(
      "image -> OCR (text only, no positions) -> LLM summary (max 100 words) -> classifier label",
      "Known problem: totals are confused with item prices; stamps and signatures vanish.") }),
];
