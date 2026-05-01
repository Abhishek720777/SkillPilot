const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const crypto = require('crypto');
const { authenticate } = require('../middleware/auth'); 

const execAsync = promisify(exec);

// Path to temporary directory where files will be written
const tmpDir = path.join(__dirname, '..', 'tmpCode');

// Helper to ensure the tmp directory exists
async function ensureTmpDir() {
  try {
    await fs.access(tmpDir);
  } catch (err) {
    await fs.mkdir(tmpDir, { recursive: true });
  }
}

/**
 * Strip server file paths from compiler/runtime output and format errors cleanly.
 * This prevents path leakage and makes errors readable to students.
 */
function sanitizeOutput(text, filePath, language) {
  if (!text) return '';

  let out = text;

  // Remove the full file path prefix that compilers include (e.g. "C:\...\Main123.java:6: error:")
  if (filePath) {
    const escaped = filePath.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
    out = out.replace(new RegExp(escaped, 'g'), '<source>');
    
    // Also strip the Docker container path
    const containerPath = '/code/' + path.basename(filePath);
    const escapedContainer = containerPath.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
    out = out.replace(new RegExp(escapedContainer, 'g'), '<source>');
  }

  // Also strip the tmpDir path generically in case file path wasn't set
  const escapedTmp = tmpDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  out = out.replace(new RegExp(escapedTmp + '[^\s:]*', 'g'), '<source>');

  // For Java: reformat  "<source>.java:LINE: error: MSG" → "Line LINE — MSG"
  if (language === 'java') {
    out = out
      .replace(/<source>\.java:(\d+):\s*error:\s*/g, 'Line $1 — ')
      .replace(/<source>\.java:(\d+):\s*/g, 'Line $1: ')
      .replace(/\d+ error[s]?\n?/g, '') // remove "1 error" summary line
      .replace(/\s*\^\s*\n?/g, '\n')    // remove caret-pointer lines (^^^)
      .trim();
  }

  // For Python: strip the temp file path from Traceback
  if (language === 'python') {
    out = out
      .replace(/File "<source>\.py", line (\d+)/g, 'Line $1')
      .replace(/File "[^"]*tmpCode[^"]*", line (\d+)/g, 'Line $1')
      .trim();
  }

  return out;
}

router.post('/run', authenticate, async (req, res) => {
  const { language, code, testInput } = req.body;

  if (!language || !code) {
    return res.status(400).json({ error: 'Language and code are required.' });
  }

  await ensureTmpDir();

  // Create a unique filename hash
  const fileHash = crypto.randomBytes(16).toString('hex');
  let filePath = '';
  let command = '';

  try {
    if (language === 'javascript') {
      filePath = path.join(tmpDir, `${fileHash}.js`);
      
      const runnerCode = `
      ${code}
      
      ${testInput ? `
      try {
        const result = eval(${JSON.stringify(testInput)});
        console.log("----TEST_RESULT----\\n" + (result !== undefined ? JSON.stringify(result) : "undefined"));
      } catch (e) {
        console.error("----TEST_RESULT----\\n" + e.message);
      }
      ` : ''}
      `;
      await fs.writeFile(filePath, runnerCode);
      const fileName = path.basename(filePath);
      command = `docker run --rm --network none --memory 256m -v "${tmpDir}":/code node:18-alpine node "/code/${fileName}"`;

    } else if (language === 'python') {
      filePath = path.join(tmpDir, `${fileHash}.py`);
      
      const pyRunner = testInput ? `
${code}

import json, ast
try:
    result = ${testInput}
    print("----TEST_RESULT----")
    if isinstance(result, str):
        print(json.dumps(result))
    elif isinstance(result, bool):
        print(str(result).lower())
    elif isinstance(result, list):
        print(json.dumps(result).replace(" ", ""))
    elif result is None:
        print("undefined")
    else:
        print(result)
except Exception as e:
    print("----TEST_RESULT----")
    print(str(e))
` : code;

      await fs.writeFile(filePath, pyRunner);
      const fileName = path.basename(filePath);
      command = `docker run --rm --network none --memory 256m -v "${tmpDir}":/code python:3.10-alpine python "/code/${fileName}"`;

    } else if (language === 'java') {
      const hasClass = /(?:public\\s+)?class\\s+[A-Za-z0-9_]+\\s*\\{/.test(code);
      
      let javaRunner = code;
      let runClassName = 'Main' + fileHash.slice(0, 6);
      
      let javaTestInput = testInput ? testInput.replace(/\[([\d\s,-]*)\]/g, 'new int[]{$1}') : '';

      if (hasClass) {
        const pubClassMatch = code.match(/public\\s+class\\s+([A-Za-z0-9_]+)\\s*\\{/);
        const classMatch = code.match(/class\\s+([A-Za-z0-9_]+)\\s*\\{/);
        
        if (pubClassMatch) {
            runClassName = pubClassMatch[1];
        } else if (classMatch) {
            runClassName = classMatch[1];
        }
        
        filePath = path.join(tmpDir, `${runClassName}.java`);
        
        if (testInput && !/public\\s+static\\s+void\\s+main/.test(code)) {
            const testRunnerName = "TestRunner_" + fileHash.slice(0, 6);
            javaRunner = code + `\n\nclass ${testRunnerName} {
    public static void main(String[] args) {
        try {
            Object result = ${runClassName}.${javaTestInput};
            System.out.println("----TEST_RESULT----");
            if (result instanceof int[]) {
                System.out.println(java.util.Arrays.toString((int[])result).replace(" ", ""));
            } else if (result instanceof Object[]) {
                System.out.println(java.util.Arrays.toString((Object[])result).replace(" ", ""));
            } else {
                System.out.println(result);
            }
        } catch (Exception e) {
            System.out.println("----TEST_RESULT----");
            System.out.println(e.getMessage());
        }
    }
}\n`;
            runClassName = testRunnerName;
        }
      } else {
        const imports = [];
        const codeWithoutImports = code.replace(/import\s+[^;]+;/g, match => {
            imports.push(match);
            return '';
        });

        filePath = path.join(tmpDir, `${runClassName}.java`);
        
        const testCode = testInput ? `
        try {
            Object result = ${javaTestInput};
            System.out.println("----TEST_RESULT----");
            if (result instanceof int[]) {
                System.out.println(java.util.Arrays.toString((int[])result).replace(" ", ""));
            } else if (result instanceof Object[]) {
                System.out.println(java.util.Arrays.toString((Object[])result).replace(" ", ""));
            } else {
                System.out.println(result);
            }
        } catch (Exception e) {
            System.out.println("----TEST_RESULT----");
            System.out.println(e.getMessage());
        }
        ` : '// Run and print inside your method';

        javaRunner = `${imports.join('\\n')}
public class ${runClassName} {
${codeWithoutImports}

    public static void main(String[] args) {
${testCode}
    }
}`;
      }

      await fs.writeFile(filePath, javaRunner);
      console.log("---- JAVA RUNNER ----\n" + javaRunner);
      const fileName = path.basename(filePath);
      command = `docker run --rm --network none --memory 256m -v "${tmpDir}":/code eclipse-temurin:17-alpine sh -c "javac /code/${fileName} -d /code && java -cp /code ${runClassName}"`;

    } else {
      return res.status(400).json({ error: 'Unsupported language. Supported: javascript, python, java.' });
    }

    // Execute the command securely with a 15000ms timeout to account for docker startup time
    const { stdout, stderr } = await execAsync(command, { timeout: 15000 });

    res.json({
      success: true,
      stdout: sanitizeOutput(stdout.trim(), filePath, language),
      stderr: sanitizeOutput(stderr.trim(), filePath, language),
    });

  } catch (error) {
    // child_process exec throws if the timeout is reached or command exits with non-zero
    const rawErr = error.stderr || error.message || '';
    const rawOut = error.stdout || '';
    res.json({
      success: false,
      error: sanitizeOutput(rawErr, filePath, language),
      stdout: sanitizeOutput(rawOut, filePath, language),
      stderr: sanitizeOutput(rawErr, filePath, language),
    });
  } finally {
    // Always attempt cleanup of source file
    if (filePath) {
      try { await fs.unlink(filePath); } catch {}
    }
    // Also clean up Java .class files
    if (language === 'java' && filePath) {
      const className = path.basename(filePath, '.java');
      try { await fs.unlink(path.join(tmpDir, `${className}.class`)); } catch {}
    }
  }
});

module.exports = router;
