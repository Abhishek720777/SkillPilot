const axios = require('axios');

async function run() {
    try {
        const res = await axios.post('http://localhost:3001/api/execute/run', {
            language: 'java',
            code: `    // Write your Java method(s) here
    // The class wrapper is added automatically
import java.util.HashMap;
import java.util.Map;

public static int[] twoSum(int[] nums, int target) { return new int[]{1}; }`,
            testInput: 'twoSum(new int[]{1}, 1)'
        });
        console.log("STDOUT:", res.data.stdout);
        console.log("STDERR:", res.data.stderr);
        console.log("ERROR:", res.data.error);
    } catch(e) {
        console.error(e.response ? e.response.data : e.message);
    }
}
run();
