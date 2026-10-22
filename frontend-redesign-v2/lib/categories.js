// Categories used across the app (must match the CHECK / dropdown values in the database)
export const CATEGORIES = [
  { name: "ID Card", emoji: "🪪" },
  { name: "Bottle", emoji: "🧴" },
  { name: "Books", emoji: "📚" },
  { name: "Electronics", emoji: "🎧" },
  { name: "Keys", emoji: "🔑" },
  { name: "Clothing", emoji: "🧥" },
  { name: "Other", emoji: "✨" },
];

// Returns the emoji for a category name (used when an item has no photo)
export function emojiFor(category) {
  const found = CATEGORIES.find((c) => c.name === category);
  return found ? found.emoji : "📦";
}
