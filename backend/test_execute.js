const fs = require('fs');

const code = `import java.util.HashMap;
import java.util.Map;

public class Solution {
    public static int[] twoSum(int[] nums, int target) {
        return new int[]{1};
    }
}`;

const hasClass = /class\s+[A-Za-z0-9_]+/.test(code);
let javaRunner = code;
let runClassName = 'Main123';

if (hasClass) {
    const pubClassMatch = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
    if (pubClassMatch) {
        runClassName = pubClassMatch[1];
    }
    const testRunnerName = "TestRunner_123";
    javaRunner = code + `\n\nclass ${testRunnerName} {
public static void main(String[] args) {
    Object result = ${runClassName}.twoSum(new int[]{1}, 1);
}
}\n`;
}

fs.writeFileSync('Solution.java', javaRunner);
console.log("Written to Solution.java");
