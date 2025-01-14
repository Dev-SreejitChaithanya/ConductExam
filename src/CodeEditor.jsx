//>>>>>>>>>>>>>PYTHON IMPLEMENTED
import { useState, useEffect } from "react";
import { Button, Card, Snackbar, Alert } from "@mui/material";


const CodeEditor = () => {
    const [language, setLanguage] = useState("javascript");
    const [code, setCode] = useState('');
    const [output, setOutput] = useState([]);
    const [pyodide, setPyodide] = useState(null);
    const [openAlert, setOpenAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    // Initialize Pyodide
    useEffect(() => {
        const loadPyodide = async () => {
            try {
                const pyodideInstance = await window.loadPyodide(); // Load Pyodide from the CDN
                await pyodideInstance.loadPackage("numpy"); // Load numpy package
                await pyodideInstance.loadPackage("pandas");
                setPyodide(pyodideInstance); // Set the Pyodide instance to state
                console.log("Pyodide and numpy loaded successfully.");
            } catch (error) {
                console.error("Error loading Pyodide:", error);
            }
        };
        if (language === "python" && !pyodide) {
            loadPyodide()
        }
    }, [language, pyodide]);
    useEffect(() => {
        // Disable right-click globally
        const handleContextMenu = (e) => {
            e.preventDefault();
            showAlert("Right-click is disabled!");
        };
        //Disable drag and drop feature
        const disableDragAndDrop = (e) => {
            e.preventDefault();
            showAlert("Drag and Drop disabled");
          };
        //disable ctrl shift combinations
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || (e.ctrlKey && e.shiftKey)) &&
                (e.key !== 'Control' && e.key !== 'Shift')) {
                e.preventDefault();
                showAlert("Ctrl/Shift key is disabled!");
            }
        }

        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('dragover', disableDragAndDrop);
        document.addEventListener('drop', disableDragAndDrop);
        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);
    const showAlert = (message) => {
        setAlertMessage(message);
        setOpenAlert(true);
    };

    const handleClipboardAction = (e, action) => {
        e.preventDefault();
        showAlert(`${action} is not allowed!`);
    };

    const runCode = async () => {
        setOutput([]); // Clear previous output

        if (language === "javascript") {
            try {
                const logs = [];
                const originalConsoleLog = console.log;

                console.log = (...args) => {
                    logs.push(args.map(arg => (typeof arg === "object" ? JSON.stringify(arg) : arg)).join(" "));
                };

                const wrappedCode = `
          async function executeCode() {
            try {
              ${code}
            } catch (error) {
              console.log("Error:", error.message);
            }
          }
          executeCode();
        `;
                const evaluate = new Function(wrappedCode);
                evaluate();
                console.log = originalConsoleLog;

                setTimeout(() => {
                    setOutput(logs);
                }, 100);
            } catch (error) {
                setOutput([`Error: ${error.message}`]);
            }
        } else if (language === "python") {
            if (!pyodide) {
                setOutput(["Pyodide is still loading. Please wait..."]);
                return;
            }
            try {
                // Redirect Python's stdout
                await pyodide.runPythonAsync(`
          import sys
          from io import StringIO
          sys.stdout = StringIO()
          sys.stderr = sys.stdout
        `);

                // Execute the code
                await pyodide.runPythonAsync(code);

                // Retrieve stdout
                const output = await pyodide.runPythonAsync("sys.stdout.getvalue()");
                setOutput(output.split("\n").filter(line => line.trim() !== ""));
            } catch (error) {
                setOutput([`Error: ${error.message}`]);
            } finally {
                // Reset stdout
                await pyodide.runPythonAsync(`
          import sys
          sys.stdout = sys.__stdout__
          sys.stderr = sys.__stderr__
        `);
            }
        }
    };
    const clearOutput = () => {
        setOutput([]);
    };
    return (
        <div className="w-full max-w-8xl mx-auto p-4 h-full flex">
            <Card className="mb-4" style={{ backgroundColor: "gray" }}>
                <div className="p-4">
                    <div className="mb-4">
                        <div className="flex justify-between items-center">
                            <span>
                                Code Editor Language:
                                <select
                                    className="text-lg bg-green-400"
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    style={{ color: 'black', marginLeft: "8px", border: "2px solid", borderRadius: '10px', padding: '0.3pc' }}
                                >
                                    <option value="javascript">JavaScript</option>
                                    <option value="python">Python</option>
                                </select>
                            </span>
                            <div className="space-x-2">
                                <Button variant="outlined" color="black" onClick={runCode} className=" font-mono font-bold hover:bg-green-400 text-sm" size="sm" style={{ color: 'black' }}>
                                    Run Code
                                </Button>
                                <Button
                                    onClick={clearOutput}
                                    variant="outlined" color="black"
                                    size="sm"
                                    className="text-sm bg-gray-700 hover:bg-green-400 font-mono font-bold"
                                    style={{ color: 'black' }}>
                                    Clear Output
                                </Button>
                                <Button
                                    onClick={() => setCode('')}
                                    variant="outlined" color="black"
                                    size="sm"
                                    className="font-mono font-bold text-sm bg-gray-700 hover:bg-green-400"
                                    style={{ color: 'black' }}
                                >
                                    Reset Code
                                </Button>
                            </div>
                        </div>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            onPaste={(e) => handleClipboardAction(e, "Pasting")}
                            onCopy={(e) => handleClipboardAction(e, "Copying")}
                            onCut={(e) => handleClipboardAction(e, "Cutting")}
                            className="w-full h-64 font-mono mt-2 p-4 text-xl bg-gray-900 text-white rounded-b-lg focus:outline-none resize-y"
                            spellCheck="false"
                            placeholder={language == 'javascript' ? "Write your JS code here..." : "Write your Python code here..."}
                        />
                    </div>
                </div>
            </Card>

            <Card  style={{ backgroundColor: "gray" ,height:'40vh'}}>
                <div className="p-4 h-36" >
                    <h3 className="text-xl font-bold mb-2  ">Console Output:</h3>
                    <pre style={{ height: "15pc", color: 'white', overflowY: "scroll" }} className="p-4 bg-gray-900 rounded-lg min-h-24 font-mono text-xl whitespace-pre-wrap">
                        {output.length > 0
                            ? output.map((log, index) => (
                                <div key={index} className="py-1">
                                    {log}
                                </div>
                            ))
                            : "No output yet"}
                    </pre>
                </div>
            </Card>
            <Snackbar
                open={openAlert}
                autoHideDuration={3000}
                onClose={() => setOpenAlert(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                size='large'
            >
                <Alert
                    onClose={() => setOpenAlert(false)}
                    severity="warning"
                    variant="filled"
                    sx={{ width: "100%" }}
                    
                >
                    {alertMessage}
                </Alert>
            </Snackbar>


        </div>
    );
};

export default CodeEditor;




