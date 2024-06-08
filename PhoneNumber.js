const KeyMap = {
    1: "",
    2: "abc",
    3: "def",
    4: "ghi",
    5: "jkl",
    6: "mno",
    7: "pqrs",
    8: "tuv",
    9: "wxyz",
  };
  
  function recur(digits, i, str, words) {
    if (i >= digits.length) {
      words.push(str);
      return;
    }
    
    const keys = KeyMap[digits[i]]; //abc
    for (let j = 0; j < keys.length; j++) {
      recur(digits, i + 1, str + keys[j], words);
    }
  }
  
  function splitNumberIntoDigits(number) {
    return number.toString().split("").map(Number);
  }
  
  function getWords(number) {
    const digits = splitNumberIntoDigits(number);
    const words = [];
    recur(digits, 0, "", words);
    return words;
  }
  
  const n = 234;
  const result = getWords(n);
  console.log(result);
  