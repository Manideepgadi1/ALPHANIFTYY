/**
 * Investment wisdom quotes for loading states
 */

export const investmentQuotes = [
  "The stock market is a device for transferring money from the impatient to the patient. - Warren Buffett",
  "Time in the market beats timing the market.",
  "Diversification is the only free lunch in investing.",
  "Don't put all your eggs in one basket.",
  "Invest for the long term, not for quick gains.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Risk comes from not knowing what you're doing. - Warren Buffett",
  "An investment in knowledge pays the best interest. - Benjamin Franklin",
  "The individual investor should act consistently as an investor and not as a speculator.",
  "Price is what you pay. Value is what you get. - Warren Buffett",
  "Compound interest is the eighth wonder of the world. - Albert Einstein",
  "Start early, invest regularly, stay invested.",
  "Buy when there's blood in the streets, even if the blood is your own.",
  "The goal of a successful investor is to do nothing - most of the time.",
  "Patience is the key to successful investing.",
  "Index funds outperform most active managers over time.",
  "SIP your way to wealth creation.",
  "Market corrections are buying opportunities for long-term investors.",
  "Your temperament is more important than your intelligence in investing.",
  "Never invest in a business you cannot understand. - Warren Buffett",
  "Investing should be boring, like watching paint dry.",
  "The four most dangerous words in investing are: 'This time it's different.'",
  "Stay calm and invested during market volatility.",
  "Regular investing beats perfect timing.",
  "Financial freedom is a mindset, investing is the vehicle.",
];

/**
 * Get a random investment quote
 */
export const getRandomQuote = (): string => {
  return investmentQuotes[Math.floor(Math.random() * investmentQuotes.length)];
};
