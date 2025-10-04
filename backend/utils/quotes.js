// Motivational quotes for lottery capsules
const motivationalQuotes = [
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Life is what happens to you while you're busy making other plans. - John Lennon",
  "The way to get started is to quit talking and begin doing. - Walt Disney",
  "Don't be afraid to give up the good to go for the great. - John D. Rockefeller",
  "Innovation distinguishes between a leader and a follower. - Steve Jobs",
  "The future depends on what you do today. - Mahatma Gandhi",
  "It is during our darkest moments that we must focus to see the light. - Aristotle",
  "The only impossible journey is the one you never begin. - Tony Robbins",
  "Success is walking from failure to failure with no loss of enthusiasm. - Winston Churchill",
  "The way to get started is to quit talking and begin doing. - Walt Disney",
  "Don't let yesterday take up too much of today. - Will Rogers",
  "You learn more from failure than from success. - Unknown",
  "If you are working on something exciting that you really care about, you don't have to be pushed. - Steve Jobs",
  "Experience is a hard teacher because it gives the test first, the lesson afterward. - Vernon Law",
  "To live is the rarest thing in the world. Most people just exist. - Oscar Wilde",
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
  "It is never too late to be what you might have been. - George Eliot",
  "The only person you are destined to become is the person you decide to be. - Ralph Waldo Emerson"
];

// Get a random motivational quote
export const getRandomQuote = () => {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  return motivationalQuotes[randomIndex];
};

// Get a quote by index (for testing)
export const getQuoteByIndex = (index) => {
  return motivationalQuotes[index] || motivationalQuotes[0];
};

// Get all quotes (for admin purposes)
export const getAllQuotes = () => {
  return motivationalQuotes;
};
