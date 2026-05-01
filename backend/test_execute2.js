const fs = require('fs');

const code = `import java.util.HashMap;
import java.util.Map;

public static int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
    
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        
        if (map.containsKey(complement)) {
            return new int[] { map.get(complement), i };
        }
        
        map.put(nums[i], i);
    }
    
    throw new IllegalArgumentException("No solution");
}`;

const imports = [];
const codeWithoutImports = code.replace(/import\\s+[^;]+;/g, match => {
    imports.push(match);
    return '';
});

const runClassName = "MainXYZ";
const testCode = `Object result = twoSum(new int[]{2,7,11,15}, 9);`;

const javaRunner = `${imports.join('\\n')}
public class ${runClassName} {
${codeWithoutImports}

    public static void main(String[] args) {
${testCode}
    }
}`;

fs.writeFileSync('MainXYZ.java', javaRunner);
console.log("Written to MainXYZ.java");
