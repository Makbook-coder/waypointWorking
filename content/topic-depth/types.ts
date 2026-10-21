/**
 * Extra explanation for one topic, used by the explanation-level switch and the full topic page.
 * The beginner wording, analogy, example and mistake already live in content/topic-notes/.
 *
 * [topicId,
 *  why it matters (one sentence),
 *  how it works, as 2 to 4 short steps,
 *  where it's used (real products or situations),
 *  where the analogy breaks ("" when the topic has no analogy),
 *  before (life without it), after (life with it),
 *  developer wording (precise, technical),
 *  interview wording (a crisp answer you could say out loud),
 *  key takeaway (one short line)]
 * `backticks` render as inline code.
 */
export type TopicDepthSrc = [string, string, string[], string, string, string, string, string, string, string];
