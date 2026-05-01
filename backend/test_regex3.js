const codes = [
  "import java.util.HashMap;",
  "import java.util.HashMap; ",
  "import  java.util.HashMap;",
  "import java.util.Map;\r\nimport java.util.HashMap;",
  "import java.util.Map;\nimport java.util.HashMap;"
];

const regex = /import\s+[^;]+;/g;

codes.forEach((code, i) => {
  const match = code.match(regex);
  console.log(`Test ${i}:`, match);
});
