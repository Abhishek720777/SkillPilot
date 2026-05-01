const code = `import java.util.HashMap;
import java.util.Map;

public static int[] twoSum() {}`;

const imports = [];
const codeWithoutImports = code.replace(/import\s+[^;]+;/g, match => {
    imports.push(match);
    return '';
});

console.log("IMPORTS:");
console.log(imports);
console.log("CODE WITHOUT IMPORTS:");
console.log(codeWithoutImports);
