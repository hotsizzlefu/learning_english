// Expanded word list with difficulty levels AND Emoji mappings
// Using Twemoji (Twitter Emoji) ensures consistent "Cartoon" style and zero-latency loading (SVG)

// Helper to convert emoji to Twemoji URL
const getTwemojiUrl = (emoji) => {
  // Convert emoji string to hex code point sequence
  // We MUST filter out VS16 (fe0f) because Twemoji filenames usually omit it for basic emojis
  const code = [...emoji]
    .map(char => char.codePointAt(0).toString(16))
    .filter(hex => hex !== 'fe0f') // Filter out variation selector
    .join('-');
    
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${code}.svg`;
};

const createWord = (word, emoji) => ({ word, emoji, imageUrl: getTwemojiUrl(emoji) });

const LEVEL_1_WORDS = [
  createWord('Cat', '🐱'), createWord('Dog', '🐶'), createWord('Pig', '🐷'), createWord('Cow', '🐮'), createWord('Rat', '🐀'),
  createWord('Bat', '🦇'), createWord('Ant', '🐜'), createWord('Bee', '🐝'), createWord('Hen', '🐔'), createWord('Fox', '🦊'),
  createWord('Sun', '☀️'), createWord('Map', '🗺️'), createWord('Hat', '🧢'), createWord('Cup', '🥤'), createWord('Bus', '🚌'),
  createWord('Car', '🚗'), createWord('Van', '🚐'), createWord('Box', '📦'), createWord('Pen', '🖊️'), createWord('Bag', '🎒'),
  createWord('Red', '🔴'), createWord('Blue', '🔵'), createWord('One', '1️⃣'), createWord('Two', '2️⃣'), createWord('Six', '6️⃣'),
  createWord('Ten', '🔟'), createWord('Eye', '👁️'), createWord('Ear', '👂'), createWord('Leg', '🦵'), createWord('Arm', '💪'),
  createWord('Book', '📖'), createWord('Ball', '⚽'), createWord('Doll', '🎎'), createWord('Kite', '🪁'), createWord('Door', '🚪'),
  createWord('Tree', '🌳'), createWord('Leaf', '🍃'), createWord('Rose', '🌹'), createWord('Duck', '🦆'), createWord('Fish', '🐟'),
  createWord('Bird', '🐦'), createWord('Frog', '🐸'), createWord('Goat', '🐐'), createWord('Lion', '🦁'), createWord('Bear', '🐻'),
  createWord('Wolf', '🐺'), createWord('Corn', '🌽'), createWord('Cake', '🍰'), createWord('Milk', '🥛'), createWord('Egg', '🥚')
];

const LEVEL_2_WORDS = [
  createWord('Apple', '🍎'), createWord('Grape', '🍇'), createWord('Lemon', '🍋'), createWord('Melon', '🍈'), createWord('Peach', '🍑'),
  createWord('Mango', '🥭'), createWord('Berry', '🍓'), createWord('Onion', '🧅'), createWord('Bread', '🍞'), createWord('Pizza', '🍕'),
  createWord('Tiger', '🐯'), createWord('Zebra', '🦓'), createWord('Horse', '🐴'), createWord('Sheep', '🐑'), createWord('Mouse', '🐭'),
  createWord('Snake', '🐍'), createWord('Panda', '🐼'), createWord('Koala', '🐨'), createWord('Whale', '🐋'), createWord('Shark', '🦈'),
  createWord('Chair', '🪑'), createWord('Table', '🛋️'), createWord('House', '🏠'), createWord('Clock', '⏰'), createWord('Radio', '📻'),
  createWord('Phone', '📱'), createWord('Watch', '⌚'), createWord('Spoon', '🥄'), createWord('Knife', '🔪'), createWord('Plate', '🍽️'),
  createWord('Green', '🟢'), createWord('Black', '⚫'), createWord('White', '⚪'), createWord('Brown', '🟤'), createWord('Seven', '7️⃣'),
  createWord('Eight', '8️⃣'), createWord('Three', '3️⃣'), createWord('Nine', '9️⃣'), createWord('Zero', '0️⃣'), createWord('Five', '5️⃣'),
  createWord('Mouth', '👄'), createWord('Teeth', '🦷'), createWord('Hands', '👐'), createWord('Heart', '❤️'), createWord('Smile', '🙂'),
  createWord('Happy', '😄'), createWord('Sleep', '😴'), createWord('Drink', '🥤'), createWord('Water', '💧'), createWord('Juice', '🧃')
];

const LEVEL_3_WORDS = [
  createWord('Elephant', '🐘'), createWord('Giraffe', '🦒'), createWord('Penguin', '🐧'), createWord('Dolphin', '🐬'), createWord('Octopus', '🐙'),
  createWord('Chicken', '🐔'), createWord('Hamster', '🐹'), createWord('Buffalo', '🐃'), createWord('Gorilla', '🦍'), createWord('Leopard', '🐆'),
  createWord('Umbrella', '☂️'), createWord('Computer', '💻'), createWord('Bicycle', '🚲'), createWord('Airplane', '✈️'), createWord('Balloon', '🎈'),
  createWord('Camera', '📷'), createWord('Guitar', '🎸'), createWord('Trumpet', '🎺'), createWord('Violin', '🎻'), createWord('Picture', '🖼️'),
  createWord('Sandwich', '🥪'), createWord('Hamburger', '🍔'), createWord('Broccoli', '🥦'), createWord('Cucumber', '🥒'), createWord('Pumpkin', '🎃'),
  createWord('Spinach', '🥬'), createWord('Coconut', '🥥'), createWord('Pineapple', '🍍'), createWord('Strawberry', '🍓'), createWord('Chocolate', '🍫'),
  createWord('Teacher', '👩‍🏫'), createWord('Student', '👨‍🎓'), createWord('Doctor', '👨‍⚕️'), createWord('Police', '👮'), createWord('Farmer', '👨‍🌾'),
  createWord('Driver', '🚕'), createWord('Sister', '👧'), createWord('Brother', '👦'), createWord('Family', '👨‍👩‍👧‍👦'), createWord('Friend', '🤝'),
  createWord('Morning', '🌅'), createWord('Evening', '🌇'), createWord('Kitchen', '🍳'), createWord('Bedroom', '🛏️'), createWord('School', '🏫'),
  createWord('Garden', '🏡'), createWord('Library', '📚'), createWord('Hospital', '🏥'), createWord('Station', '🚉'), createWord('Airport', '🛫')
];

export const generateQuestions = (levelWords, count = 30) => {
  const questions = [];
  
  for (let i = 0; i < count; i++) {
    // Pick a random correct item
    const correctItem = levelWords[Math.floor(Math.random() * levelWords.length)];
    
    // Generate 3 unique wrong options (words only) from the SAME level
    const options = new Set();
    options.add(correctItem.word);
    
    while (options.size < 4) {
      const wrong = levelWords[Math.floor(Math.random() * levelWords.length)];
      if (wrong.word !== correctItem.word) {
        options.add(wrong.word);
      }
    }
    
    // Shuffle options
    const shuffledOptions = Array.from(options).sort(() => Math.random() - 0.5);
    
    questions.push({
      id: i,
      word: correctItem.word,
      emoji: correctItem.emoji, // Pass emoji for fallback
      imageUrl: correctItem.imageUrl,
      options: shuffledOptions,
      correctOption: correctItem.word
    });
  }
  
  return questions;
};

// Progressive Difficulty Logic
export const getQuestionsForDay = (dayIndex) => {
    // dayIndex: 0 (Mon) -> 6 (Sun)
    
    let wordPool = [];
    
    switch (dayIndex) {
        case 0: // Monday: Very Easy (Level 1)
            wordPool = LEVEL_1_WORDS;
            break;
        case 1: // Tuesday: Easy (Level 1 + some Level 2)
            wordPool = [...LEVEL_1_WORDS, ...LEVEL_2_WORDS.slice(0, 10)];
            break;
        case 2: // Wednesday: Medium (Level 2)
            wordPool = LEVEL_2_WORDS;
            break;
        case 3: // Thursday: Medium+ (Level 2 + some Level 3)
            wordPool = [...LEVEL_2_WORDS, ...LEVEL_3_WORDS.slice(0, 10)];
            break;
        case 4: // Friday: Hard (Level 3)
            wordPool = LEVEL_3_WORDS;
            break;
        case 5: // Saturday: Review (Mixed Level 1 & 2)
            wordPool = [...LEVEL_1_WORDS, ...LEVEL_2_WORDS];
            break;
        case 6: // Sunday: Challenge (All Levels)
            wordPool = [...LEVEL_1_WORDS, ...LEVEL_2_WORDS, ...LEVEL_3_WORDS];
            break;
        default:
            wordPool = LEVEL_1_WORDS;
    }
    
    // Ensure we have enough words for 30 questions
    // If pool is small, words will repeat, which is fine for learning
    return generateQuestions(wordPool, 30); 
}
