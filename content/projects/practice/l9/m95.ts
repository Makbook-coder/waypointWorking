import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M95: ProjectSrc[] = [
  practice("m9-5-the-four-caches-in-an-ai-system", "reimplement",
    pj("Rebuild a prefix-friendly prompt", 40, "Rebuild a prompt layout so the provider's prefix cache can reuse the long fixed part.",
      [
        ["Read the starter prompt builder and mark which parts change on every request and which never do.", "Write two lists. Keep a note of each result."],
        ["Reorder the prompt so the fixed parts come first and the changing parts last.", "Keep the meaning the same."],
        ["Measure the prompt tokens that are now identical across requests.", "Compute the share."],
        ["Test that answers on ten questions did not get worse.", "Report the share of reusable tokens."],
      ],
      "A prompt layout with the fixed part first, a computed share of reusable tokens and unchanged answer quality.",
      ["Fixed and changing parts listed", "Prompt reordered", "Quality unchanged"],
      "Look at what is safe to cache next.", ["Python 3.11 or newer", LLM]) ),
  practice("m9-5-what-is-safe-to-cache", "review",
    pj("Review a caching plan", 30, "Review a caching plan and find the answers that must never be shared between users.",
      [
        ["Read the plan below and list every kind of response it caches.", "Note the key used."],
        ["Mark each as shared, per-user or never cached and compare with the plan.", "Highlight mismatches."],
        ["Write the worst leak the plan allows and how it would happen.", "Give an example. If it feels vague, add a number or an example."],
        ["Write the corrected keys and the tests that would catch the leak.", "At least two tests."],
      ],
      "A review of a caching plan with mismatches highlighted, the worst leak described and corrected keys with tests.",
      ["Responses listed", "Worst leak described", "Corrected keys and tests"],
      "Look at semantic caching next.", ["A text editor"]),
    { starter: code(
      "Plan: cache every reply for 24 hours, keyed on the lowercase question text.",
      "Replies include public FAQ answers, order status lookups and a summary of the user's own uploaded file.") }),
  practice("m9-5-semantic-caching", "extend",
    pj("Add guards to a semantic cache", 45, "Extend a semantic cache so near-miss questions are not answered with the wrong cached reply.",
      [
        ["Run the starter cache on the 20 labelled pairs and list the wrong hits.", "Note the similarity score of each."],
        ["Add a guard that compares numbers, dates and names in the two questions.", "Reject a hit if they differ."],
        ["Add a guard on the user and settings used.", "Test with two users."],
        ["Rerun and report wrong hits and hit rate before and after.", "Show the trade-off."],
      ],
      "A semantic cache with guards that removes the wrong hits and a report of the lost hit rate.",
      ["Wrong hits listed", "Guards added", "Trade-off reported"],
      "Look at freshness versus latency and cost next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "def lookup(question):",
      "    best = nearest(question)",
      "    return best.answer if best.score > 0.8 else None      # 'refund 50 dollars' matches 'refund 5000 dollars'") }),
  practice("m9-5-freshness-vs-latency-and-cost", "debug",
    pj("Why users saw old prices", 40, "Find why a cache served old prices after an update and fix the invalidation.",
      [
        ["Run the starter and update a price, then ask for it again.", "Record the answer you get."],
        ["Trace how the cache key and lifetime work for that item.", "Find why the update does not reach it."],
        ["Tag entries with the item and remove them on update.", "Keep the lifetime as a backup."],
        ["Repeat the test with three updates and show the answer is always fresh.", "Report the hit rate cost."],
      ],
      "A cache that serves fresh prices after each update using tags and a backup lifetime.",
      ["Stale answer reproduced", "Tags remove entries", "Three updates fresh"],
      "Look at measuring the hit rate next.", ["Python 3.11 or newer"]),
    { starter: code(
      "cache.set(key=question, value=answer, ttl=86400)      # a day",
      "def update_price(item, price): db.save(item, price)   # never touches the cache") }),
  practice("m9-5-measuring-the-hit-rate", "optimise",
    pj("Raise a low hit rate", 40, "Raise a cache's hit rate by fixing key design without raising wrong hits.",
      [
        ["Read the starter log and compute the hit rate and the most common missed questions.", "List the top five."],
        ["Find reasons for the misses such as case, spacing, extra words or a key that includes a changing value.", "Group them. Check it with someone else or a model if you can."],
        ["Normalise the keys and remove changing values that do not affect the answer.", "Keep user and settings."],
        ["Rerun the log and report the new hit rate and a sample of 20 hits checked for correctness.", "Report any wrong ones."],
      ],
      "A cache with normalised keys that has a higher hit rate and a checked sample showing no new wrong hits.",
      ["Miss reasons grouped", "Keys normalised", "Sample of hits checked"],
      "Look at the module capstone next.", ["Python 3.11 or newer"]),
    { starter: code(
      "key = question + str(time.time()) + user.session_id      # a new key for every request") }),
];
