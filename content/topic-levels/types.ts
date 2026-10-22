/**
 * What the Developer and Interview levels show for one topic, on top of the wording in content/topic-depth/.
 * Beginner has its own sections already (content/topic-notes/), so nothing here is shown to beginners.
 *
 * [topicId,
 *  code: a short, real snippet (1 to 10 lines; "" for topics with no code, like career or process topics),
 *  gotchas: two things that bite you when you build it,
 *  trade-off: one sentence on when to choose it and what it costs,
 *  follow-ups: two [question, short answer] pairs an interviewer might ask next,
 *  edge case: one deeper point or edge case that shows real understanding,
 *  weak answer: what a weak interview answer says or misses]
 * `backticks` render as inline code everywhere except in the code snippet.
 */
export type TopicLevelSrc = [string, string, [string, string], string, [[string, string], [string, string]], string, string];
