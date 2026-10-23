import { practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");
const MM = ["Python 3.11 or newer", "A multimodal model API"];

export const P_M122: ProjectSrc[] = [
  practice("m12-2-patches-and-the-vision-encoder", "reimplement",
    pj("Cut an image into patches", 35, "Write the patch splitting step of a vision encoder yourself and check the counts.",
      [
        ["Load an image and split it into square patches of a size you choose.", "Use numpy. Print the intermediate values to see them."],
        ["Flatten each patch into a vector and print the shape.", "Patches by values."],
        ["Check that the patch count matches the formula for the image size.", "Rows times columns."],
        ["Reassemble the patches and confirm you get the same image back.", "Compare pixels. Start with a single input before using many."],
      ],
      "A patch splitter whose count matches the formula and which reassembles to the original image.",
      ["Patches produced", "Count matches formula", "Reassembly matches"],
      "Look at why one image costs many tokens next.", ["Python 3.11 or newer", "numpy", "Pillow"])),
  practice("m12-2-why-one-image-costs-many-tokens", "debug",
    pj("The bill that was ten times too high", 35, "Find why a feature costs far more than its estimate and fix the estimate and the design.",
      [
        ["Read the starter estimate and the real usage numbers.", "Spot the gap. Take it one small step at a time."],
        ["Work out the real tokens per image from the usage.", "Divide. Write down what you see before changing anything."],
        ["Find which assumption in the estimate was wrong.", "Count of images? Size?"],
        ["Fix the estimate and propose one change that cuts the cost.", "Show the new number."],
      ],
      "A corrected cost estimate with the wrong assumption found and one cost reduction proposed.",
      ["Real tokens computed", "Wrong assumption found", "New estimate shown"],
      "Look at tiling and detail settings next.", MM),
    { starter: code(
      "Estimate: 1 image = 200 tokens. 50,000 images per day => 10M tokens per day.",
      "Actual usage: 640M tokens per day. Images are 2048x1536 photos at default detail.") }),
  practice("m12-2-tiling-and-detail-settings", "optimise",
    pj("Pick the cheapest setting that still works", 40, "Find the lowest detail setting that still answers a set of questions correctly.",
      [
        ["Read the starter question set and note which need fine detail.", "Mark them. Re-read the step and try the smallest version first."],
        ["Run all questions at each detail setting and record tokens.", "Table. Check one example by hand to be sure."],
        ["Find the cheapest setting where accuracy stays acceptable.", "State the bar. Save your work so you can compare later."],
        ["Route the detail-hungry questions to a higher setting and compute the blended cost.", "Weighted. Ask what changed since the last run."],
      ],
      "A routing rule between detail settings with a blended cost against always using high detail.",
      ["All settings tested", "Cheapest passing setting found", "Blended cost computed"],
      "Look at what downscaling destroys next.", MM),
    { starter: code(
      "Q1: What colour is the car? Q2: What is the licence plate? Q3: How many people are in the photo?",
      "Q4: What does the small print say? Q5: Is it day or night?") }),
  practice("m12-2-what-downscaling-destroys", "review",
    pj("Review a downscaling policy", 30, "Review a policy that shrinks every image and say what it will break.",
      [
        ["Read the starter policy and list the images it affects.", "Types of image. Print the intermediate values to see them."],
        ["Mark the content types that lose information when shrunk.", "Text, small objects."],
        ["Propose an exception rule with a clear trigger.", "Measurable. Start with a single input before using many."],
        ["Describe the test that would show the exception works.", "Before and after. Take it one small step at a time."],
      ],
      "A review naming content hurt by shrinking, an exception rule and a test to prove it.",
      ["Affected images listed", "Exception rule proposed", "Test described"],
      "Look at images sharing the context window next.", ["A text editor"]),
    { starter: code(
      "Policy: all uploads are resized so the longest side is 512 pixels before analysis.",
      "Uploads include phone photos, screenshots of tables, scanned receipts and medical charts.") }),
  practice("m12-2-images-share-the-context-window", "extend",
    pj("Add an image budget to a chat", 40, "Extend a chat loop so images cannot silently use up the context window.",
      [
        ["Read the starter loop and note it counts only text tokens.", "Trace the code. Write down what you see before changing anything."],
        ["Add an estimate of tokens per image.", "A constant at first."],
        ["Drop or shrink the oldest images when the budget is passed.", "A policy. Re-read the step and try the smallest version first."],
        ["Test with a conversation of 15 images and print context use per turn.", "Check it stays under the limit."],
      ],
      "A chat loop that tracks image tokens and keeps context under the limit across fifteen images.",
      ["Image estimate added", "Policy works", "Fifteen image test passes"],
      "Look at full images, crops and overviews next.", MM),
    { starter: code(
      "history = []",
      "def turn(text, images):",
      "    history.append({'text': text, 'images': images})",
      "    if sum(len(h['text']) for h in history) > 12000: history.pop(0)") }),
  practice("m12-2-full-image-crops-or-overview", "challenge",
    pj("Crops against the whole picture", 55, "Decide when to send the whole image, crops or an overview and prove it on tasks of your own, with no steps given.",
      [],
      "A tested policy for full image, crops and overview with accuracy and token cost per task type.",
      ["At least three task types such as counting, small text and scene description", "Each run with whole image, crops and overview", "Accuracy and token cost tabulated", "A policy that picks per task with the evidence"],
      "Return to the module capstone on native or pipeline.", MM),
    { hints: ["Choose tasks where the answer depends on small details and tasks where it does not.", "Keep the question fixed and only change how the image is supplied.", "Include the cost of making the crops in your totals."] }),
];
