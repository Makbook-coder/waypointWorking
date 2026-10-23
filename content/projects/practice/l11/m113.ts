import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M113: ProjectSrc[] = [
  practice("m11-3-cloud-identity-instead-of-api-keys", "review",
    pj("Review a credential setup", 30, "Review how an app gets credentials and move it to cloud identity.",
      [
        ["Read the setup below and list every credential and where it lives.", "Mark long-lived ones."],
        ["Explain how each could leak.", "One scenario each."],
        ["Write how each would be replaced by an identity or short-lived token.", "Name the mechanism."],
        ["Write the migration order and the test after each step.", "Number them. Check it with someone else or a model if you can."],
      ],
      "A review of a credential setup with leak scenarios, identity replacements and an ordered migration.",
      ["Credentials listed", "Leaks explained", "Migration ordered"],
      "Look at least privilege for model access next.", ["A text editor"]),
    { starter: code(
      "The app reads MODEL_KEY from a .env file shared in the team chat. A CI job has the same key as a secret.",
      "A notebook on a laptop has a copy. The key has no expiry and full access to the account.") }),
  practice("m11-3-least-privilege-for-model-access", "debug",
    pj("Allowed to do far too much", 40, "Find the over-broad permission in a policy and cut it without breaking the app.",
      [
        ["Read the policy and list what each statement allows.", "Mark the broad ones."],
        ["Check the app logs to see which actions it really uses.", "List them. Do the easy part first, then return to the hard part."],
        ["Write the narrow policy for the app.", "Test the app still works."],
        ["Try one denied action and show it fails.", "Record the error. Save your work here so you can compare later."],
      ],
      "A narrowed policy that keeps the app working and denies an unneeded action.",
      ["Broad statements marked", "Used actions listed", "Denied action fails"],
      "Look at auditing who invoked what next.", ["A cloud account or text editor"]),
    { starter: code(
      "Allow: bedrock:* on *       (the app only calls InvokeModelWithResponseStream on one model in one region)") }),
  practice("m11-3-auditing-who-invoked-what", "extend",
    pj("Add alerts to an audit log", 40, "Extend an audit log with alerts for unusual model use.",
      [
        ["Run the starter and read a day of logs.", "Compute normal use per identity."],
        ["Write rules for a restricted model, a burst and use at odd hours.", "Choose thresholds."],
        ["Plant three suspicious events in the log and run the rules.", "Check they fire. Try it on one small example first."],
        ["Check normal days do not alert.", "Report any false alerts."],
      ],
      "An audit log with three alert rules that find planted events and do not fire on normal days.",
      ["Normal use computed", "Planted events found", "No false alerts"],
      "Look at private connectivity next.", ["Python 3.11 or newer"]),
    { starter: code(
      "{\"time\": \"2026-03-02T10:15:00Z\", \"identity\": \"svc-search\", \"model\": \"model-a\", \"tokens\": 1200}",
      "(only stored, never read)") }),
  practice("m11-3-private-connectivity-no-public-egress", "optimise",
    pj("Cheaper private path", 40, "Reduce the cost of private endpoints while keeping all traffic off the internet.",
      [
        ["Read the starter network cost sheet and list the monthly costs.", "Find the largest. Write down what you see before changing anything."],
        ["Find endpoints that are duplicated or unused.", "Mark them. Compare with a case you know the answer to."],
        ["Propose a design that shares endpoints and keeps the same isolation.", "Draw it. Keep a note of each result."],
        ["Compute the new cost and write the test that proves no public egress.", "Compare. If it feels vague, add a number or an example."],
      ],
      "A network design with shared private endpoints that costs less and still proves no public egress.",
      ["Costs listed", "Duplicates found", "Proof test written"],
      "Look at tenant isolation next.", ["A calculator"]),
    { starter: code(
      "One private endpoint per service per team: 12 endpoints at 8 dollars a month each, 3 unused, plus a NAT gateway with a route to the internet.") }),
  practice("m11-3-tenant-isolation-on-shared-infrastructure", "challenge",
    pj("Attack your own isolation", 50, "Try to break tenant isolation in a small service and fix what you find, with no steps given.",
      [],
      "A tenant-isolation test suite that breaks a weak service, a fix, and a passing suite.",
      ["At least six cross-tenant attacks written", "At least one attack succeeds on the weak version", "A fix for each success", "All attacks fail on the fixed version"],
      "Look at encryption and customer-managed keys next.", ["Python 3.11 or newer", LLM]),
    { hints: ["Look at every place a tenant id could be missing: cache keys, logs and stored memory.", "Include prompts that ask the model to reveal another tenant's data.", "Keep the attack list as regression tests."] }),
  practice("m11-3-encryption-and-customer-managed-keys", "reimplement",
    pj("Rebuild a key rotation plan", 40, "Rebuild a key rotation procedure from a description and rehearse it.",
      [
        ["Read the description and list the steps: create, enable, switch, re-encrypt and retire.", "Order them. Check it with someone else or a model if you can."],
        ["Write the commands or console steps for each.", "Mark which can lock you out."],
        ["Rehearse on test data and record the time.", "Keep a checklist. Do the easy part first, then return to the hard part."],
        ["Add a rollback for each risky step.", "Test one. Save your work here so you can compare later."],
      ],
      "A rehearsed key rotation procedure with timings and a rollback for risky steps.",
      ["Steps ordered", "Rehearsal timed", "Rollback tested"],
      "Look at the module capstone next.", ["A cloud account"])),
];
