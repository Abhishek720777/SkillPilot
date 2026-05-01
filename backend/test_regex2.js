const code = `    // Write your Java method(s) here
    // The class wrapper is added automatically
    public static int[] twoSum() {}`;
const hasClass = /class\s+[A-Za-z0-9_]+/.test(code);
console.log("hasClass:", hasClass);
