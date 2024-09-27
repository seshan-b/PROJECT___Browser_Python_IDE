// Initialize CodeMirror editor
var editor = CodeMirror.fromTextArea(document.getElementById("pythonCode"), {
    mode: { name: "python", version: 3, singleLineStringErrors: false },
    lineNumbers: true,
    indentUnit: 4,
    matchBrackets: true,
    theme: "monokai", // Use the Monokai theme
});

// Initialize Pyodide and set up code execution
async function main() {
    // Load Pyodide
    let pyodide = await loadPyodide();
    console.log("Pyodide loaded.");

    // Function to run Python code
    async function runCode() {
        let code = editor.getValue();
        let resultDiv = document.getElementById("result");
        resultDiv.innerHTML = ""; // Clear previous output
        try {
            // Redirect stdout and stderr
            let output = "";
            pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = sys.stderr = StringIO()
`);
            // Run user code
            await pyodide.runPythonAsync(code);
            // Get output
            output = pyodide.runPython("sys.stdout.getvalue()");
            resultDiv.innerHTML = "<pre>" + output + "</pre>";
        } catch (err) {
            // Display errors
            resultDiv.innerHTML = "<pre style='color: red;'>" + err + "</pre>";
        } finally {
            // Reset stdout and stderr
            pyodide.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
`);
        }
    }

    // Bind the click event of the button to the runCode function
    document.getElementById("runButton").addEventListener("click", runCode);
}

// Start the main function
main();
