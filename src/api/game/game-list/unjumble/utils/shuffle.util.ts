export const shuffleWord = (word: string): string => {
  const array = word.split('');

  for (let index = array.length - 1; index > 0; index--) {
    const index_ = Math.floor(Math.random() * (index + 1));
    [array[index], array[index_]] = [array[index_], array[index]];
  }

  const shuffled = array.join('');

  return shuffled === word ? shuffleWord(word) : shuffled;
};
