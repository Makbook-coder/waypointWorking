import { practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M107: ProjectSrc[] = [
  practice("m10-7-tests-eval-gate-build", "debug",
    pj("The pipeline that never fails", 40, "Find why a workflow reports success while tests fail and fix it.",
      [
        ["Read the workflow below and break a test on purpose.", "Note that the run is green."],
        ["Find the line that hides the failure, such as continue-on-error or a missing exit code.", "Quote it. If it feels vague, add a number or an example."],
        ["Fix it so a failing test fails the job.", "Rerun. Check it with someone else or a model if you can."],
        ["Add the gate job and make the build depend on it.", "Show the build skipped on failure."],
      ],
      "A workflow that fails on a failing test and skips the build when the gate fails.",
      ["Green run reproduced", "Cause of the fault fixed", "Build depends on gate"],
      "Look at commit-tagged images next.", ["A GitHub repository", "Python 3.11 or newer"]),
    { starter: code(
      "- name: tests",
      "  run: pytest || true",
      "  continue-on-error: true",
      "- name: build",
      "  run: docker build -t app .") }),
  practice("m10-7-commit-tagged-images", "extend",
    pj("Add provenance to images", 40, "Extend an image build so each image says exactly what it was built from.",
      [
        ["Build the starter image and try to answer what commit and prompt version it holds.", "Note you cannot. Do the easy part first, then return to the hard part."],
        ["Add labels for the commit id, build time and run link.", "Pass them as build arguments."],
        ["Write the release manifest into the image.", "Print it from the running container."],
        ["Write a script that reads a running container's version and checks it against git.", "Test. Save your work here so you can compare later."],
      ],
      "Images that carry commit, time, run link and manifest, and a script that verifies a running container.",
      ["Labels added", "Manifest in image", "Verification script works"],
      "Look at pipeline secrets next.", ["Docker", "A GitHub repository"]),
    { starter: code(
      "docker build -t app:latest .          # nothing says what is inside") }),
  practice("m10-7-pipeline-secrets", "review",
    pj("Review a workflow for secrets", 30, "Review a workflow file and find the ways it could leak or misuse secrets.",
      [
        ["Read the workflow below and list every secret use.", "Note the permissions."],
        ["Find unsafe patterns, such as echoing a secret or running forked code with secrets.", "Quote them. Try it on one small example first."],
        ["Rewrite the risky lines safely.", "Show the new lines."],
        ["Write a rotation checklist for the secrets in the file.", "Order the steps. Write down what you see before changing anything."],
      ],
      "A review of a workflow with unsafe patterns quoted, safe rewrites and a rotation checklist.",
      ["Secret uses listed", "Unsafe lines quoted", "Rotation checklist"],
      "Look at manual approval for production next.", ["A text editor"]),
    { starter: code(
      "on: pull_request_target",
      "permissions: write-all",
      "run: echo ${{ secrets.AWS_KEY }} && ./deploy.sh      # runs code from the pull request") }),
  practice("m10-7-manual-approval-for-production", "challenge",
    pj("Approval you can trust", 50, "Design a production approval flow that cannot be bypassed, with no steps given.",
      [],
      "A production deploy flow that cannot be bypassed and shows reviewers the evidence they need.",
      ["Deploy only possible through the protected environment", "Reviewers see eval scores and the prompt diff", "A rejected run deploys nothing", "A record of who approved which version"],
      "Look at rollback to a known tag next.", ["A GitHub repository"]),
    { hints: ["Make the deploy job the only place that holds the production secrets.", "Put the evidence in the job summary so it is on the same screen as the approve button.", "Test by trying to deploy from another workflow and from a branch."] }),
  practice("m10-7-rollback-to-a-known-tag", "optimise",
    pj("Faster rollback", 40, "Shorten the time from deciding to roll back to traffic being healthy again.",
      [
        ["Time the starter rollback steps from the decision to a healthy check.", "List each step and its time."],
        ["Find the three slowest steps.", "Note why. Compare with a case you know the answer to."],
        ["Automate or remove the slowest, for example by keeping the previous image on the host.", "Implement one. Keep a note of each result."],
        ["Time the rollback again and compare.", "Report both totals."],
      ],
      "A faster rollback with the slowest step automated and measured times before and after.",
      ["Each step timed", "Slowest step improved", "Totals compared"],
      "Look at the module capstone next.", ["Docker"]),
    { starter: code(
      "rollback today: find the old tag in the registry, edit the compose file, pull, restart, wait, test by hand (about 25 minutes)") }),
];
