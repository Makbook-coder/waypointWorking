import { practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");
const AUD = ["Python 3.11 or newer", "A few short audio clips", "ffmpeg"];

export const P_M126: ProjectSrc[] = [
  practice("m12-6-waveform-to-spectrogram-to-tokens", "reimplement",
    pj("A spectrogram from scratch", 40, "Compute a spectrogram with a short-time Fourier transform you write yourself and check it.",
      [
        ["Slice a clip into overlapping windows with a window function.", "numpy. Check one example by hand to be sure."],
        ["Take the magnitude of the Fourier transform of each window.", "A matrix. Save your work so you can compare later."],
        ["Plot the result and compare it with a library spectrogram.", "Side by side. Ask what changed since the last run."],
        ["Report the shape and explain how window and hop set the frame rate.", "Arithmetic. Print the intermediate values to see them."],
      ],
      "A hand-written spectrogram that matches a library version and a note on how window and hop set the frame rate.",
      ["Windows sliced", "Transform computed", "Matches library"],
      "Look at cost per second of audio next.", ["Python 3.11 or newer", "numpy", "matplotlib"])),
  practice("m12-6-cost-per-second-not-per-word", "debug",
    pj("An audio budget that was too low", 30, "Find why an audio feature cost three times the forecast and fix the forecast.",
      [
        ["Read the starter forecast and the actual usage.", "Compute the gap. Start with a single input before using many."],
        ["Find the hidden audio that was billed such as silence and hold music.", "Share of the call."],
        ["Recompute cost per useful minute.", "Arithmetic. Take it one small step at a time."],
        ["Propose a cheaper handling such as trimming silence and test the saving.", "Number. Write down what you see before changing anything."],
      ],
      "A corrected audio forecast with the hidden billed audio found and a trimming saving estimated.",
      ["Gap computed", "Hidden audio found", "Saving estimated"],
      "Look at transcribe-then-prompt versus audio native next.", AUD),
    { starter: code(
      "Forecast: 5,000 calls x 4 minutes of talking = 20,000 minutes. Actual billed: 62,000 minutes.",
      "Call recording includes hold music, IVR menus and 40 seconds of ringing.") }),
  practice("m12-6-transcribe-then-prompt-vs-audio-native", "review",
    pj("Review a routing decision", 30, "Review a decision to use audio native everywhere and say when the transcript route is better.",
      [
        ["Read the starter decision and list the reasons.", "Quote them. Re-read the step and try the smallest version first."],
        ["Mark which reasons depend on tone and which do not.", "Two groups. Check one example by hand to be sure."],
        ["Name two question types the transcript route handles fine and cheaper.", "With why. Save your work so you can compare later."],
        ["Write a routing rule and the test that would check it.", "Concrete. Ask what changed since the last run."],
      ],
      "A review of the audio native decision with a routing rule and a test.",
      ["Reasons listed", "Question types named", "Rule written"],
      "Look at what a transcript discards next.", ["A text editor"]),
    { starter: code(
      "Decision: send raw audio to the audio model for all questions. Reason: transcripts lose nuance.",
      "Questions asked of calls: what was the order number, did the caller sound upset, how long was the wait.") }),
  practice("m12-6-what-a-transcript-discards", "extend",
    pj("Give the transcript back its tone", 40, "Extend a transcript with cheap annotations for what it normally drops.",
      [
        ["Read the starter transcript and list what is missing from it.", "Pauses, volume, overlap."],
        ["Add pause lengths from the word timestamps.", "Compute gaps. Print the intermediate values to see them."],
        ["Add a marker for overlapping speech or very long pauses.", "A rule. Start with a single input before using many."],
        ["Show one sentence where the annotation changes the reading.", "Example. Take it one small step at a time."],
      ],
      "An annotated transcript with pauses and overlaps marked and one sentence whose meaning shifts.",
      ["Missing items listed", "Pauses added", "Example shown"],
      "Look at why audio is latency sensitive next.", AUD),
    { starter: code(
      "00:01 Speaker 1 [0.2-1.5]: Fine. 00:02 Speaker 2 [1.9-3.0]: Great. 00:04 Speaker 1 [6.8-7.1]: Okay.") }),
  practice("m12-6-why-audio-is-latency-sensitive", "challenge",
    pj("Hit the budget", 55, "Bring a spoken reply under a latency budget you choose and prove it with percentiles, with no steps given.",
      [],
      "A voice reply path measured against a budget with medians and tail latencies and the changes that got it there.",
      ["A stated budget in milliseconds with a reason", "At least 30 timed runs per version", "Median and 95th percentile reported per stage", "At least two changes shown with their effect"],
      "Look at where speech recognition breaks next.", AUD),
    { hints: ["Tail latency matters more than the median for spoken conversations.", "Start by finding the largest stage before changing anything.", "Streaming synthesis usually helps time to first sound more than a faster model does."] }),
  practice("m12-6-where-speech-recognition-breaks", "optimise",
    pj("Recover accuracy on noisy audio", 40, "Raise recognition accuracy on noisy clips with pre-processing and settings.",
      [
        ["Read the starter results and note the word error rate on noisy clips.", "Baseline. Write down what you see before changing anything."],
        ["Try a noise filter and a volume normalisation.", "Separately. Re-read the step and try the smallest version first."],
        ["Try a language or vocabulary hint if the model allows it.", "Another try. Check one example by hand to be sure."],
        ["Pick what to keep and check clean audio did not get worse.", "Control. Save your work so you can compare later."],
      ],
      "A pre-processing setup that lowers word error rate on noisy clips without hurting clean audio.",
      ["Baseline noted", "Two ideas tried", "Control checked"],
      "Return to the capstone: a speech route decision report.", AUD),
    { starter: code(
      "clean clips WER 6% | noisy clips WER 28% | phone-quality clips WER 19%. Product names are often wrong: 'Kubernetes', 'Zendesk'.") }),
];
