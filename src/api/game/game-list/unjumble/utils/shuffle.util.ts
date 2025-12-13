export const shuffleWord = (word: string): string => {
  const array = [...word];

  for (let index = array.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
  }

  const shuffled = array.join('');

  return shuffled === word ? shuffleWord(word) : shuffled;
};
