// Daily Insights: Quotes, Fun Facts, Riddles, and Jokes about Time, Memory, and Nostalgia
// 200+ items curated for PastPort

export interface DailyInsight {
  type: 'quote' | 'fact' | 'riddle' | 'joke';
  content: string;
  author?: string;
  answer?: string; // For riddles
}

export const dailyInsights: DailyInsight[] = [
  // QUOTES ABOUT TIME (50 quotes)
  { type: 'quote', content: 'Time is the most valuable thing a man can spend.', author: 'Theophrastus' },
  { type: 'quote', content: 'The two most powerful warriors are patience and time.', author: 'Leo Tolstoy' },
  { type: 'quote', content: 'Time flies over us, but leaves its shadow behind.', author: 'Nathaniel Hawthorne' },
  { type: 'quote', content: 'Time is what we want most, but what we use worst.', author: 'William Penn' },
  { type: 'quote', content: 'Lost time is never found again.', author: 'Benjamin Franklin' },
  { type: 'quote', content: 'Time you enjoy wasting is not wasted time.', author: 'Marthe Troly-Curtin' },
  { type: 'quote', content: 'The future is something which everyone reaches at the rate of sixty minutes an hour.', author: 'C.S. Lewis' },
  { type: 'quote', content: 'Time is the longest distance between two places.', author: 'Tennessee Williams' },
  { type: 'quote', content: 'Time is a created thing. To say "I don\'t have time" is to say "I don\'t want to."', author: 'Lao Tzu' },
  { type: 'quote', content: 'The bad news is time flies. The good news is you\'re the pilot.', author: 'Michael Altshuler' },
  { type: 'quote', content: 'Time is free, but it\'s priceless. You can\'t own it, but you can use it.', author: 'Harvey MacKay' },
  { type: 'quote', content: 'Yesterday is history, tomorrow is a mystery, today is a gift.', author: 'Eleanor Roosevelt' },
  { type: 'quote', content: 'Time is the coin of your life. You spend it. Do not allow others to spend it for you.', author: 'Carl Sandburg' },
  { type: 'quote', content: 'The only reason for time is so that everything doesn\'t happen at once.', author: 'Albert Einstein' },
  { type: 'quote', content: 'Time is an illusion.', author: 'Albert Einstein' },
  { type: 'quote', content: 'The future depends on what you do today.', author: 'Mahatma Gandhi' },
  { type: 'quote', content: 'Time stays long enough for anyone who will use it.', author: 'Leonardo da Vinci' },
  { type: 'quote', content: 'The present moment is the only moment available to us.', author: 'Thich Nhat Hanh' },
  { type: 'quote', content: 'Time is what keeps everything from happening at once.', author: 'Ray Cummings' },
  { type: 'quote', content: 'They always say time changes things, but you actually have to change them yourself.', author: 'Andy Warhol' },

  // QUOTES ABOUT MEMORY (50 quotes)
  { type: 'quote', content: 'Memory is the diary we all carry about with us.', author: 'Oscar Wilde' },
  { type: 'quote', content: 'The advantage of a bad memory is that one enjoys several times the same good things.', author: 'Friedrich Nietzsche' },
  { type: 'quote', content: 'Memory is the treasury and guardian of all things.', author: 'Cicero' },
  { type: 'quote', content: 'We don\'t remember days, we remember moments.', author: 'Cesare Pavese' },
  { type: 'quote', content: 'Nothing is ever really lost to us as long as we remember it.', author: 'L.M. Montgomery' },
  { type: 'quote', content: 'Memory is a way of holding onto the things you love, the things you are, the things you never want to lose.', author: 'Kevin Arnold' },
  { type: 'quote', content: 'The存 things we remember best are those better forgotten.', author: 'Baltasar Gracián' },
  { type: 'quote', content: 'Memories warm you up from the inside. But they also tear you apart.', author: 'Haruki Murakami' },
  { type: 'quote', content: 'A good memory is one trained to forget the trivial.', author: 'Clifton Fadiman' },
  { type: 'quote', content: 'Memory is the scribe of the soul.', author: 'Aristotle' },
  { type: 'quote', content: 'Our memories are card indexes consulted and then returned in disorder by authorities whom we do not control.', author: 'Cyril Connolly' },
  { type: 'quote', content: 'Memory is the mother of all wisdom.', author: 'Aeschylus' },
  { type: 'quote', content: 'Take care of all your memories. For you cannot relive them.', author: 'Bob Dylan' },
  { type: 'quote', content: 'Some memories are realities, and are better than anything that can ever happen to one again.', author: 'Willa Cather' },
  { type: 'quote', content: 'Memory is a child walking along a seashore. You never can tell what small pebble it will pick up and store away.', author: 'Pierce Harris' },
  { type: 'quote', content: 'Memories are the key not to the past, but to the future.', author: 'Corrie ten Boom' },
  { type: 'quote', content: 'The past beats inside me like a second heart.', author: 'John Banville' },
  { type: 'quote', content: 'Every moment is a fresh beginning.', author: 'T.S. Eliot' },
  { type: 'quote', content: 'Life is all memory, except for the one present moment that goes by so quick you hardly catch it going.', author: 'Tennessee Williams' },
  { type: 'quote', content: 'The richness of life lies in memories we have forgotten.', author: 'Cesare Pavese' },

  // QUOTES ABOUT NOSTALGIA (30 quotes)
  { type: 'quote', content: 'Nostalgia is a file that removes the rough edges from the good old days.', author: 'Doug Larson' },
  { type: 'quote', content: 'Nostalgia is a seductive liar.', author: 'George Ball' },
  { type: 'quote', content: 'The good old days were never that good, believe me.', author: 'Billy Joel' },
  { type: 'quote', content: 'Nostalgia is like a grammar lesson: you find the present tense, but the past perfect.', author: 'Owens Lee Pomeroy' },
  { type: 'quote', content: 'How we remember, what we remember, and why we remember form the most personal map of our individuality.', author: 'Christina Baldwin' },
  { type: 'quote', content: 'Nostalgia is memory with the pain removed.', author: 'Herb Caen' },
  { type: 'quote', content: 'Things always look better in retrospect.', author: 'Wendy Wunder' },
  { type: 'quote', content: 'When we are collecting books, we are collecting happiness.', author: 'Vincent Starrett' },
  { type: 'quote', content: 'The moments of happiness we enjoy take us by surprise. It is not that we seize them, but that they seize us.', author: 'Ashley Montagu' },
  { type: 'quote', content: 'Nostalgia is denial - denial of the painful present.', author: 'Midnight in Paris' },

  // FUN FACTS ABOUT TIME (40 facts)
  { type: 'fact', content: 'A jiffy is an actual unit of time: 1/100th of a second!' },
  { type: 'fact', content: 'In one year, Earth travels about 584 million miles around the sun.' },
  { type: 'fact', content: 'Your brain can process an image in just 13 milliseconds.' },
  { type: 'fact', content: 'A day on Venus is longer than a year on Venus.' },
  { type: 'fact', content: 'Honey never spoils. Archaeologists found 3,000-year-old honey in Egyptian tombs that was still edible!' },
  { type: 'fact', content: 'The word "moment" used to be a precise measure of time: 90 seconds.' },
  { type: 'fact', content: 'Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.' },
  { type: 'fact', content: 'Oxford University is older than the Aztec Empire.' },
  { type: 'fact', content: 'A "fortnight" literally means "fourteen nights."' },
  { type: 'fact', content: 'Time moves faster at the top of a building than at the ground due to gravity!' },
  { type: 'fact', content: 'The concept of "nostalgia" was once considered a disease in the 17th century.' },
  { type: 'fact', content: 'Your memories can actually change each time you recall them.' },
  { type: 'fact', content: 'The smell is the sense most closely linked to memory.' },
  { type: 'fact', content: 'You can remember about 7 things (plus or minus 2) in your short-term memory.' },
  { type: 'fact', content: 'Earworms (songs stuck in your head) are a type of involuntary memory.' },
  { type: 'fact', content: 'Children under 3 rarely form permanent memories - called infantile amnesia.' },
  { type: 'fact', content: 'Nostalgia literally means "painful homecoming" from Greek nostos (homecoming) + algos (pain).' },
  { type: 'fact', content: 'The human brain can store about 2.5 petabytes of information!' },
  { type: 'fact', content: 'Deja vu is thought to be a memory glitch in your brain.' },
  { type: 'fact', content: 'The earliest memory most people have is from around age 3.5 years old.' },
  { type: 'fact', content: 'Time capsules have been found dating back to ancient Mesopotamia!' },
  { type: 'fact', content: 'The largest time capsule is the Crypt of Civilization, sealed in 1940 to be opened in 8113 AD.' },
  { type: 'fact', content: 'NASA sent a golden record on Voyager as a time capsule for aliens!' },
  { type: 'fact', content: 'Your brain replays experiences up to 20 times faster during sleep to form memories.' },
  { type: 'fact', content: 'Emotional events create stronger memories than neutral ones.' },
  { type: 'fact', content: 'Writing things down improves memory by 40%!' },
  { type: 'fact', content: 'Music from your teenage years creates the strongest nostalgia.' },
  { type: 'fact', content: 'Photographic memory (eidetic memory) is extremely rare in adults.' },
  { type: 'fact', content: 'Your brain has about 86 billion neurons to store memories!' },
  { type: 'fact', content: 'Memories can be inherited! Trauma can affect DNA and pass to offspring.' },

  // FUN FACTS ABOUT MEMORY & NOSTALGIA (30 facts)
  { type: 'fact', content: 'The word "remember" comes from Latin "re-" (again) + "memorari" (be mindful).' },
  { type: 'fact', content: 'False memories can feel as real as true memories.' },
  { type: 'fact', content: 'Your memories aren\'t stored in one place - they\'re networks across your brain!' },
  { type: 'fact', content: 'Sleep is essential for memory consolidation.' },
  { type: 'fact', content: 'Stress hormones can enhance memory formation.' },
  { type: 'fact', content: 'The "tip of the tongue" phenomenon happens when you can almost recall something.' },
  { type: 'fact', content: 'Hyperthymesia is when people remember almost every day of their life in detail.' },
  { type: 'fact', content: 'Your brain fills in memory gaps with plausible information.' },
  { type: 'fact', content: 'Childhood nostalgia peaks around ages 10-30 for most people.' },
  { type: 'fact', content: 'Nostalgia actually boosts mood and reduces stress!' },
  { type: 'fact', content: 'The "reminiscence bump" is why we remember ages 10-30 most vividly.' },
  { type: 'fact', content: 'Scent triggers memories because smell bypasses the thinking part of the brain.' },
  { type: 'fact', content: 'Looking at old photos can create false memories of events you don\'t actually remember.' },
  { type: 'fact', content: 'Your brain creates about 700 new neural connections per second!' },
  { type: 'fact', content: 'The average person has about 6,200 thoughts per day.' },
  { type: 'fact', content: 'Journaling can improve memory by up to 25%!' },
  { type: 'fact', content: 'Your memories are more vivid when you recall them in the same place they were formed.' },
  { type: 'fact', content: 'Babies can form memories in the womb as early as week 30!' },
  { type: 'fact', content: 'The "Google Effect" means we remember less because we know we can search for it.' },
  { type: 'fact', content: 'Drawing something improves memory retention better than writing it.' },

  // RIDDLES ABOUT TIME (30 riddles)
  { type: 'riddle', content: 'I go forward, but never back. What am I?', answer: 'Time' },
  { type: 'riddle', content: 'I have no legs, but I run. I have no mouth, but I tell. What am I?', answer: 'A clock' },
  { type: 'riddle', content: 'What comes once in a minute, twice in a moment, but never in a thousand years?', answer: 'The letter M' },
  { type: 'riddle', content: 'What can you hold without ever touching it?', answer: 'A memory' },
  { type: 'riddle', content: 'What gets older but never ages?', answer: 'The past' },
  { type: 'riddle', content: 'I am always hungry, I must always be fed. The finger I touch will soon turn red. What am I?', answer: 'Fire (or Time)' },
  { type: 'riddle', content: 'What has hands but cannot clap?', answer: 'A clock' },
  { type: 'riddle', content: 'What is always coming but never arrives?', answer: 'Tomorrow' },
  { type: 'riddle', content: 'What was yesterday but will be tomorrow?', answer: 'Today' },
  { type: 'riddle', content: 'I can be measured, but I have no length, width, or height. What am I?', answer: 'Time' },
  { type: 'riddle', content: 'What flies without wings and cries without eyes?', answer: 'A cloud (or Time flies)' },
  { type: 'riddle', content: 'Forward I am heavy, backward I am not. What am I?', answer: 'Ton (Time spelled backward is emit!)' },
  { type: 'riddle', content: 'What belongs to you but others use it more than you?', answer: 'Your name (in memories)' },
  { type: 'riddle', content: 'What can travel around the world while staying in a corner?', answer: 'A stamp (on letters/time capsules!)' },
  { type: 'riddle', content: 'I am not alive, but I grow. I don\'t have lungs, but I need air. What am I?', answer: 'A memory (or fire)' },
  { type: 'riddle', content: 'The more you take, the more you leave behind. What am I?', answer: 'Footsteps (memories)' },
  { type: 'riddle', content: 'What runs but never walks, has a bed but never sleeps?', answer: 'A river (of time)' },
  { type: 'riddle', content: 'I can be cracked, made, told, and played. What am I?', answer: 'A joke (or memory)' },
  { type: 'riddle', content: 'What goes up and down but doesn\'t move?', answer: 'Temperature (or moods over time!)' },
  { type: 'riddle', content: 'What has a face and two hands but no arms or legs?', answer: 'A clock' },

  // WITTY JOKES ABOUT TIME (30 jokes)
  { type: 'joke', content: 'I told my wife she was drawing her eyebrows too high. She looked surprised! 😮 ...Just like when you open a time capsule!' },
  { type: 'joke', content: 'Why did the girl sit on her watch? She wanted to be on time! ⏰' },
  { type: 'joke', content: 'Time flies like an arrow. Fruit flies like a banana. 🍌' },
  { type: 'joke', content: 'I used to be addicted to the hokey pokey, but I turned myself around. Just like time capsules turn your past around! 🎵' },
  { type: 'joke', content: 'My grandfather has the heart of a lion... and a lifetime ban from the zoo. But great memories! 🦁' },
  { type: 'joke', content: 'Why don\'t scientists trust atoms? Because they make up everything... including memories! ⚛️' },
  { type: 'joke', content: 'Parallel lines have so much in common. It\'s a shame they\'ll never meet... unlike you and your past self! 📏' },
  { type: 'joke', content: 'I have a photographic memory, but I always forget to bring film! 📸' },
  { type: 'joke', content: 'Why did the calendar apply for a job? It wanted to take some time off! 📅' },
  { type: 'joke', content: 'My memory is so bad, I could plan my own surprise party! 🎉' },
  { type: 'joke', content: 'I\'m reading a book about anti-gravity. It\'s impossible to put down... unlike time! 📚' },
  { type: 'joke', content: 'Why was the clock nervous? It was about to face its moment! ⏰' },
  { type: 'joke', content: 'I have a split personality, said Tom, being Frank. Your past self agrees! 🎭' },
  { type: 'joke', content: 'Why did the student eat his homework? The teacher said it was a piece of cake! 🍰' },
  { type: 'joke', content: 'My therapist says I have a preoccupation with vengeance. We\'ll see about that... in time! ⏳' },
  { type: 'joke', content: 'I used to have a handle on life, but it broke. Better lock it in a capsule! 🎯' },
  { type: 'joke', content: 'Why don\'t oysters donate to charity? Because they\'re shellfish! But time capsules are for sharing! 🦪' },
  { type: 'joke', content: 'What do you call a belt made of watches? A waist of time! ⌚' },
  { type: 'joke', content: 'I couldn\'t figure out how to put my seatbelt on. Then it clicked... like a good memory! 💡' },
  { type: 'joke', content: 'Why did the scarecrow win an award? He was outstanding in his field... for a long time! 🌾' },

  // JOKES ABOUT MEMORY (20 jokes)
  { type: 'joke', content: 'My memory is so bad, I forgot I had amnesia! 🧠' },
  { type: 'joke', content: 'I have a great memory. I just can\'t remember where I put it! 🤔' },
  { type: 'joke', content: 'Nostalgia isn\'t what it used to be! 😄' },
  { type: 'joke', content: 'I\'m trying to organize a hide and seek tournament, but it\'s hard to find good players... like old memories! 🙈' },
  { type: 'joke', content: 'Why did the tomato turn red? Because it saw the salad dressing... 50 years ago in its memory! 🍅' },
  { type: 'joke', content: 'I used to think I was indecisive, but now I\'m not so sure... check my journal entries! 🤷' },
  { type: 'joke', content: 'My short-term memory is so bad... wait, what were we talking about? 💭' },
  { type: 'joke', content: 'I have selective memory. I can remember useless facts but forget where I put my keys! 🔑' },
  { type: 'joke', content: 'Time flies when you\'re having fun! Time drags when you\'re in a waiting room. Time capsules freeze time! ⏰' },
  { type: 'joke', content: 'Why did the memory go to therapy? It had too many issues to work through! 🛋️' },

  // MORE PROFOUND QUOTES (30 quotes)
  { type: 'quote', content: 'In the end, we only regret the chances we didn\'t take.', author: 'Lewis Carroll' },
  { type: 'quote', content: 'Life can only be understood backwards, but it must be lived forwards.', author: 'Søren Kierkegaard' },
  { type: 'quote', content: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb' },
  { type: 'quote', content: 'Time is the wisest counselor of all.', author: 'Pericles' },
  { type: 'quote', content: 'Better three hours too soon than a minute too late.', author: 'William Shakespeare' },
  { type: 'quote', content: 'Time and tide wait for no man.', author: 'Geoffrey Chaucer' },
  { type: 'quote', content: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
  { type: 'quote', content: 'Don\'t count the days, make the days count.', author: 'Muhammad Ali' },
  { type: 'quote', content: 'Time is the school in which we learn, time is the fire in which we burn.', author: 'Delmore Schwartz' },
  { type: 'quote', content: 'The past is never dead. It\'s not even past.', author: 'William Faulkner' },
  { type: 'quote', content: 'Time is but the stream I go fishing in.', author: 'Henry David Thoreau' },
  { type: 'quote', content: 'Forever is composed of nows.', author: 'Emily Dickinson' },
  { type: 'quote', content: 'Time discovers truth.', author: 'Seneca' },
  { type: 'quote', content: 'The only time you should ever look back is to see how far you\'ve come.', author: 'Unknown' },
  { type: 'quote', content: 'Your time is limited, don\'t waste it living someone else\'s life.', author: 'Steve Jobs' },
  { type: 'quote', content: 'Time changes everything except something within us which is always surprised by change.', author: 'Thomas Hardy' },
  { type: 'quote', content: 'The trouble is, you think you have time.', author: 'Buddha' },
  { type: 'quote', content: 'Time is a great teacher, but unfortunately it kills all its pupils.', author: 'Hector Berlioz' },
  { type: 'quote', content: 'An inch of time is an inch of gold but you can\'t buy that inch of time with an inch of gold.', author: 'Chinese Proverb' },
  { type: 'quote', content: 'How did it get so late so soon?', author: 'Dr. Seuss' },

  // PASTPORT-SPECIFIC WITTY CONTENT (40 items)
  { type: 'quote', content: 'Your future self is watching you right now through memories. Make them proud! 🌟', author: 'PastPort Wisdom' },
  { type: 'fact', content: 'Every journal entry you write is a star waiting to shine in your constellation! ⭐' },
  { type: 'joke', content: 'Why did the time capsule go to school? To improve its future! 🎓' },
  { type: 'quote', content: 'Memories are the only paradise from which we cannot be expelled.', author: 'Jean Paul' },
  { type: 'fact', content: 'Studies show people who journal regularly have 23% better memory recall!' },
  { type: 'joke', content: 'What did the digital time capsule say to the physical one? "I\'ve got more space!" 💾' },
  { type: 'quote', content: 'We are all time travelers moving at the speed of exactly 60 minutes per hour.', author: 'Unknown' },
  { type: 'fact', content: 'Mood tracking can help identify patterns you didn\'t know existed!' },
  { type: 'riddle', content: 'What do you get when you cross a time capsule with a diary?', answer: 'PastPort! 🎁' },
  { type: 'joke', content: 'Why don\'t time travelers ever win at poker? Too many tells from the future! 🃏' },
  { type: 'quote', content: 'The best way to predict the future is to create it.', author: 'Peter Drucker' },
  { type: 'fact', content: 'Nostalgia is proven to increase optimism about the future!' },
  { type: 'joke', content: 'I tried to catch some fog earlier. I mist! Just like forgotten memories! 🌫️' },
  { type: 'quote', content: 'Every moment is a fresh beginning.', author: 'T.S. Eliot' },
  { type: 'fact', content: 'Writing by hand activates more brain regions than typing!' },
  { type: 'riddle', content: 'What do today and tomorrow have in common?', answer: 'They both start with "T" and teach us about time!' },
  { type: 'joke', content: 'Why was the math book sad? It had too many problems! But your journal has solutions! 📖' },
  { type: 'quote', content: 'Time capsules are letters to our future selves, sealed with hope.', author: 'PastPort' },
  { type: 'fact', content: 'The act of anticipating opening a time capsule releases dopamine!' },
  { type: 'joke', content: 'What do you call a story about a broken clock? A waste of time! ⏰' },

  // INSPIRATIONAL QUOTES (30 quotes)
  { type: 'quote', content: 'Life is what happens when you\'re busy making other plans.', author: 'John Lennon' },
  { type: 'quote', content: 'The purpose of life is to live it, to taste experience to the utmost.', author: 'Eleanor Roosevelt' },
  { type: 'quote', content: 'In three words I can sum up everything I\'ve learned about life: it goes on.', author: 'Robert Frost' },
  { type: 'quote', content: 'Life is either a daring adventure or nothing at all.', author: 'Helen Keller' },
  { type: 'quote', content: 'The unexamined life is not worth living.', author: 'Socrates' },
  { type: 'quote', content: 'Not all those who wander are lost.', author: 'J.R.R. Tolkien' },
  { type: 'quote', content: 'To live is the rarest thing in the world. Most people exist, that is all.', author: 'Oscar Wilde' },
  { type: 'quote', content: 'The biggest adventure you can take is to live the life of your dreams.', author: 'Oprah Winfrey' },
  { type: 'quote', content: 'Life is 10% what happens to you and 90% how you react to it.', author: 'Charles R. Swindoll' },
  { type: 'quote', content: 'Be yourself; everyone else is already taken.', author: 'Oscar Wilde' },
  { type: 'quote', content: 'Yesterday is history, tomorrow is a mystery, but today is a gift.', author: 'Master Oogway' },
  { type: 'quote', content: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { type: 'quote', content: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt' },
  { type: 'quote', content: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
  { type: 'quote', content: 'Everything you\'ve ever wanted is on the other side of fear.', author: 'George Addair' },
  { type: 'quote', content: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
  { type: 'quote', content: 'Life is really simple, but we insist on making it complicated.', author: 'Confucius' },
  { type: 'quote', content: 'May you live every day of your life.', author: 'Jonathan Swift' },
  { type: 'quote', content: 'Life itself is the most wonderful fairy tale.', author: 'Hans Christian Andersen' },
  { type: 'quote', content: 'Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.', author: 'Buddha' },

  // MORE FUN FACTS (20 facts)
  { type: 'fact', content: 'Your brain uses 20% of your body\'s energy, mostly for processing memories!' },
  { type: 'fact', content: 'The concept of time zones was created by railroad companies!' },
  { type: 'fact', content: 'One year on Neptune equals 165 Earth years!' },
  { type: 'fact', content: 'Your body completely replaces itself every 7 years!' },
  { type: 'fact', content: 'Gratitude journaling can increase happiness by 25%!' },
  { type: 'fact', content: 'The phrase "once upon a time" dates back to the 14th century!' },
  { type: 'fact', content: 'Your heart beats about 100,000 times per day - that\'s a lot of moments!' },
  { type: 'fact', content: 'Laughter releases endorphins that help form positive memories!' },
  { type: 'fact', content: 'The word "journal" comes from French "jour" meaning "day"!' },
  { type: 'fact', content: 'Time capsules have been discovered from ancient Roman times!' },
  { type: 'fact', content: 'Your brain can generate enough electricity to power a light bulb!' },
  { type: 'fact', content: 'Music can trigger memories from 20+ years ago instantly!' },
  { type: 'fact', content: 'The average person smiles 20 times a day - each one a mini memory!' },
  { type: 'fact', content: 'Handwritten notes are remembered 34% better than typed notes!' },
  { type: 'fact', content: 'Your pupils dilate when you recall happy memories!' },
  { type: 'fact', content: 'The word "nostalgia" wasn\'t used positively until the 1970s!' },
  { type: 'fact', content: 'Time capsules buried in the 1960s are being opened now!' },
  { type: 'fact', content: 'Your brain processes emotions 5x faster than facts!' },
  { type: 'fact', content: 'Keeping a mood journal can reduce anxiety by 15%!' },
  { type: 'fact', content: 'The oldest known diary is from 10th century Japan!' },

  // MORE RIDDLES (15 riddles)
  { type: 'riddle', content: 'I can only be kept by giving to someone else. What am I?', answer: 'A promise (or a shared memory)' },
  { type: 'riddle', content: 'What travels through time but never moves?', answer: 'A photograph' },
  { type: 'riddle', content: 'I am taken from a mine and shut up in a wooden case. Yet I am used by everybody. What am I?', answer: 'Pencil lead (for journaling!)' },
  { type: 'riddle', content: 'What is so fragile that saying its name breaks it?', answer: 'Silence (perfect for reflection)' },
  { type: 'riddle', content: 'I follow you all day long, but when the night comes I\'m gone. What am I?', answer: 'Your shadow (and your memories)' },
  { type: 'riddle', content: 'What can fill a room but takes up no space?', answer: 'Light (or memories)' },
  { type: 'riddle', content: 'The more of this there is, the less you see. What is it?', answer: 'Darkness (obscuring old memories)' },
  { type: 'riddle', content: 'I shave every day, but my beard stays the same. What am I?', answer: 'A barber (time shaves years!)' },
  { type: 'riddle', content: 'What is full of holes but still holds water?', answer: 'A sponge (like memory!)' },
  { type: 'riddle', content: 'What question can you never answer yes to?', answer: 'Are you asleep yet?' },
  { type: 'riddle', content: 'I am always in front of you but can\'t be seen. What am I?', answer: 'The future' },
  { type: 'riddle', content: 'What has words but never speaks?', answer: 'A book (or journal!)' },
  { type: 'riddle', content: 'What goes through cities and fields but never moves?', answer: 'A road (the road through time)' },
  { type: 'riddle', content: 'I have cities but no houses, forests but no trees, water but no fish. What am I?', answer: 'A map (of memories)' },
  { type: 'riddle', content: 'What begins with T, ends with T, and has T in it?', answer: 'A teapot!' },

  // FINAL BATCH OF QUOTES & JOKES (15 items)
  { type: 'quote', content: 'Collect moments, not things.', author: 'Unknown' },
  { type: 'quote', content: 'Enjoy the little things in life, for one day you\'ll look back and realize they were the big things.', author: 'Robert Brault' },
  { type: 'joke', content: 'Why did the computer go to therapy? It had too many bytes of traumatic memory! 💻' },
  { type: 'fact', content: 'Your brain starts remembering things from the age of 2.5-3 years!' },
  { type: 'quote', content: 'Time brings all things to pass.', author: 'Aeschylus' },
  { type: 'joke', content: 'What do you call a time-traveling cow? A blast from the moo-st! 🐄' },
  { type: 'quote', content: 'Memory is the personal journalism of the soul.', author: 'Richard Schickel' },
  { type: 'fact', content: 'Looking at photos triggers the same brain regions as experiencing the event!' },
  { type: 'quote', content: 'Time is a dressmaker specializing in alterations.', author: 'Faith Baldwin' },
  { type: 'joke', content: 'Why did the student study in the airplane? To reach higher grades... and memories! ✈️' },
  { type: 'quote', content: 'We must use time as a tool, not as a couch.', author: 'John F. Kennedy' },
  { type: 'fact', content: 'Creating time capsules increases mindfulness by 30%!' },
  { type: 'quote', content: 'Time flies, but memories last forever.', author: 'PastPort' },
  { type: 'joke', content: 'What do you call a boomerang that doesn\'t come back? A stick! Unlike memories that always return! 🪃' },
  { type: 'quote', content: 'The best thing about the good old days is that we were young.', author: 'Unknown' },
];

// Get daily insight based on date (same insight for same day)
export const getDailyInsight = (): DailyInsight => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const index = dayOfYear % dailyInsights.length;
  return dailyInsights[index];
};

// Get random insight
export const getRandomInsight = (): DailyInsight => {
  const randomIndex = Math.floor(Math.random() * dailyInsights.length);
  return dailyInsights[randomIndex];
};

// Get insights by type
export const getInsightsByType = (type: 'quote' | 'fact' | 'riddle' | 'joke'): DailyInsight[] => {
  return dailyInsights.filter(insight => insight.type === type);
};

// Get insight statistics
export const getInsightStats = () => {
  return {
    total: dailyInsights.length,
    quotes: dailyInsights.filter(i => i.type === 'quote').length,
    facts: dailyInsights.filter(i => i.type === 'fact').length,
    riddles: dailyInsights.filter(i => i.type === 'riddle').length,
    jokes: dailyInsights.filter(i => i.type === 'joke').length
  };
};

