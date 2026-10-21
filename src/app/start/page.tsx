import type { Metadata } from "next";
import Link from "next/link";
import { LabCard } from "@/components/LabCard";
import { StartChecklist } from "@/components/StartChecklist";
import { Card, SectionTitle } from "@/components/ui";
import { getLab } from "@/lib/labs";

export const metadata: Metadata = { title: "Start here" };

const SETUP = [
  { title: "Install Python 3.10 or newer", detail: "From python.org. Check it worked: open a terminal and run `python --version` (or `python3 --version` on macOS)." },
  { title: "Install a code editor", detail: "VS Code is free and works everywhere. Add its Python extension." },
  { title: "Learn five terminal commands", detail: "`pwd` (where am I), `ls` or `dir` (what's here), `cd folder` (go in), `cd ..` (go up), `python file.py` (run a file)." },
  { title: "Install Git and make one commit", detail: "Run `git init`, `git add .` and `git commit -m \"first\"` in a practice folder. Then create a free GitHub account." },
  { title: "Make a virtual environment", detail: "`python -m venv .venv`, then activate it. Install packages with `pip install name` only inside it." },
  { title: "Keep secrets out of code", detail: "Put API keys in a `.env` file, add `.env` to `.gitignore`, and read them with `os.environ`. Never paste a key into a public repo or chat." },
  { title: "Know your no-install fallback", detail: "Every lab runs in this browser, and you can open colab.new to run Python with nothing installed." },
];

const LOOP = [
  ["Learn", "Read the module's Understand it note and the Explain simply note on each topic. Watch one video if it helps."],
  ["Build", "Do the module's guided lab or coding tasks. Type the code yourself; it sticks far better than copying."],
  ["Check", "Take the module quiz. Wrong answers come back for review automatically."],
  ["Explain", "Answer the interview question and a scenario out loud, then score yourself against the key points."],
  ["Prove", "At the end of a level, take the level exam and build the capstone with its milestone guide."],
] as const;

const REFRESHERS = [
  ["Vectors and similarity", "An embedding is a list of numbers. Two texts are similar when their vectors point the same way. Cosine similarity measures that, from -1 to 1. You'll use it from L4 onwards."],
  ["Probability and softmax", "A model scores every possible next token. Softmax turns those scores into probabilities that add up to 1. Temperature makes them more or less spread out (L1)."],
  ["Percentages, rates and averages", "Accuracy, error rate, recall, cost per request: almost every eval in L7 and L10 is a count divided by a total. Always say what the total was."],
  ["Big-O, informally", "How work grows with input size. Looping over every document for every query is fine for 100 documents and too slow for 10 million (L4, L9)."],
  ["HTTP and JSON", "Apps talk by sending requests (GET, POST) and getting a status code plus a JSON body back. Every LLM API works this way (L0, L2)."],
] as const;

export default function StartPage() {
  const warmup = getLab("python-warmup")!;
  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Start here</h1>
        <p className="mt-2 max-w-2xl text-muted">
          New to programming, or rusty? This page gets you ready for L0 in an afternoon: set up your computer, refresh the Python you&apos;ll need, and learn the study loop that turns reading into skill.
        </p>
      </header>

      <section aria-labelledby="loop-h">
        <SectionTitle id="loop-h">How to study with Waypoint</SectionTitle>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {LOOP.map(([title, text], i) => (
            <li key={title} className="rounded-lg border border-line bg-surface p-4">
              <p className="num text-xs text-muted">Step {i + 1}</p>
              <p className="font-semibold">{title}</p>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-3 max-w-3xl text-sm text-muted">
          Stuck on anything? Every lab step, coding task, scenario and mini project has a <span className="font-medium text-ink">Stuck? Start here</span> box: hint 1, then hint 2, then the answer. Take one rung at a time. Five honest minutes of trying before each hint is where the learning happens.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle>1 · Set up your computer</SectionTitle>
          <StartChecklist items={SETUP} />
        </Card>
        <Card>
          <SectionTitle>2 · Five ideas to refresh</SectionTitle>
          <dl className="space-y-3 text-sm">
            {REFRESHERS.map(([t, d]) => (
              <div key={t}>
                <dt className="font-medium">{t}</dt>
                <dd className="text-muted">{d}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      <section aria-labelledby="warm-h" className="max-w-4xl">
        <SectionTitle id="warm-h">3 · Python warm-up lab</SectionTitle>
        <LabCard lab={warmup} />
      </section>

      <Card className="max-w-3xl">
        <SectionTitle>4 · Then go</SectionTitle>
        <ul className="space-y-1.5 text-sm">
          <li>
            <Link href="/module/m0-1" className="underline underline-offset-2">Begin L0 with M0.1 Python for AI Engineering</Link>
          </li>
          <li>
            <Link href="/plan" className="underline underline-offset-2">Set your weekly hours</Link> to get dated weeks and a finish date.
          </li>
          <li>
            <Link href="/readiness" className="underline underline-offset-2">Check your readiness</Link> any time to see your biggest gaps for your target role.
          </li>
        </ul>
        <p className="mt-4 text-xs text-muted">
          Honest note: practice like this is what makes people ready for AI engineering interviews and exams, but nothing can guarantee a pass. What it can do is make sure you have done the work, many times, with feedback.
        </p>
      </Card>
    </div>
  );
}
