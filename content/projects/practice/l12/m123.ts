import { practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");
const MM = ["Python 3.11 or newer", "A multimodal model API"];

export const P_M123: ProjectSrc[] = [
  practice("m12-3-what-vision-models-do-well", "extend",
    pj("Grow the strengths test", 35, "Extend a small test set with new task types and see which ones the model passes.",
      [
        ["Read the starter test set and list the task types it covers.", "Count them. Save your work so you can compare later."],
        ["Add three task types it lacks.", "For example reading signs."],
        ["Run the whole set and score it.", "Table. Ask what changed since the last run."],
        ["Mark which new types are strengths and which are weak.", "Two lines. Print the intermediate values to see them."],
      ],
      "An extended test set with three new task types, scores and strengths marked.",
      ["Types listed", "Three types added", "Strengths marked"],
      "Look at counting, space and dense tables next.", MM),
    { starter: code(
      "tests = [",
      "  ('cat.jpg', 'What animal is this?', 'cat'),",
      "  ('beach.jpg', 'Describe the scene.', 'beach with people'),",
      "]") }),
  practice("m12-3-counting-space-and-dense-tables", "debug",
    pj("The count that is always off by one", 40, "Find why a counting feature is wrong and fix the prompt or the design.",
      [
        ["Read the starter results and compute the error for each image.", "Table. Start with a single input before using many."],
        ["Look for a pattern in the errors such as grouped or overlapping objects.", "Sort by size. Take it one small step at a time."],
        ["Try two fixes such as cropping into halves or asking for a list first.", "Compare. Write down what you see before changing anything."],
        ["Report error before and after and say which fix you keep.", "Numbers. Re-read the step and try the smallest version first."],
      ],
      "A diagnosis of the counting errors with two fixes tried and error compared before and after.",
      ["Errors computed", "Pattern found", "Fix chosen with numbers"],
      "Look at fabricated visual detail next.", MM),
    { starter: code(
      "image: crowd_a.jpg true=12 model=10 | crowd_b.jpg true=30 model=24 | shelf.jpg true=8 model=8 | dots.jpg true=45 model=31") }),
  practice("m12-3-fabricated-visual-detail", "review",
    pj("Spot the invented details", 30, "Review model descriptions of images and mark every detail that is not in the picture.",
      [
        ["Read the starter descriptions next to the image notes.", "One line per image."],
        ["Mark each claim as visible, plausible or invented.", "Be strict. Check one example by hand to be sure."],
        ["Count invented claims per description.", "A number. Save your work so you can compare later."],
        ["Write a prompt change that might reduce invention and say how you would test it.", "A test. Ask what changed since the last run."],
      ],
      "A claim-by-claim review with invented details counted and a prompt change to test.",
      ["Claims marked", "Invented counted", "Test described"],
      "Look at why vision failures happen next.", ["A text editor"]),
    { starter: code(
      "Image note: a plain white mug on a wooden desk, no text, no logo.",
      "Model description: A white ceramic mug with a blue company logo sits on an oak desk beside a steaming cup of coffee.") }),
  practice("m12-3-why-vision-failures-happen", "reimplement",
    pj("Break a vision model on purpose", 40, "Design three small image tests that each isolate one cause of vision failure and run them.",
      [
        ["Pick three causes such as resolution, clutter and unusual viewpoint.", "One test each. Print the intermediate values to see them."],
        ["Make or find a pair of images per cause, easy and hard.", "Same content. Start with a single input before using many."],
        ["Run the model on each pair and compare answers.", "Table. Take it one small step at a time."],
        ["Write which cause hurt most and what that suggests for your product.", "Short. Write down what you see before changing anything."],
      ],
      "Three paired image tests, each isolating one cause of failure, with results and a conclusion.",
      ["Three causes picked", "Pairs run and confirmed", "Conclusion written"],
      "Look at asking how reliably for images next.", MM)),
  practice("m12-3-asking-how-reliably-for-images", "optimise",
    pj("Make reliability measurable", 40, "Improve a vague reliability claim into a measured rate with a confidence range.",
      [
        ["Read the starter claim and note why it cannot be checked.", "No test set. Re-read the step and try the smallest version first."],
        ["Define a task, a test set size and a pass rule.", "Specific. Check one example by hand to be sure."],
        ["Run the model repeatedly on the same images and record the spread.", "Five runs. Save your work so you can compare later."],
        ["Report the pass rate with a range and say whether the claim holds.", "Numbers. Ask what changed since the last run."],
      ],
      "A measured pass rate with run-to-run spread replacing a vague reliability claim.",
      ["Pass rule defined", "Repeated runs recorded", "Range reported"],
      "Look at safeguards when reliability is short next.", MM),
    { starter: code(
      "Release note: the model reads meter dials correctly almost every time, so we turned off human checks.") }),
  practice("m12-3-safeguards-when-reliability-is-short", "challenge",
    pj("Design the safety net", 55, "Design and test safeguards for a vision feature that is wrong about one time in ten, with no steps given.",
      [],
      "A tested set of safeguards that catch most vision errors before they reach a user, with measured miss and false alarm rates.",
      ["A task with a known error rate and a labelled set of at least 40 images", "At least two safeguards such as a second reading, a confidence check or a plausibility rule", "Miss rate and false alarm rate measured for each", "A decision on which to ship and what stays with a human"],
      "Return to the module capstone on a vision reliability report.", MM),
    { hints: ["Use a second independent reading and check how often two readings disagree on wrong answers.", "A plausibility rule such as a range check catches wild errors cheaply.", "Measure false alarms too; a safeguard that flags everything is no safeguard."] }),
];
