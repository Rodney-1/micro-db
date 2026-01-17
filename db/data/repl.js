cat > db/repl.js << 'EOF'
const readline = require("readline");
const { execute } = require("./engine");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "micro-db> "
});

console.log("Welcome to Micro-DB!");
console.log("Type SQL commands or 'exit' to quit.\n");

rl.prompt();

rl.on("line", (line) => {
  line = line.trim();
  
  if (line.toLowerCase() === "exit" || line.toLowerCase() === "quit") {
    console.log("Goodbye!");
    process.exit(0);
  }

  if (!line) {
    rl.prompt();
    return;
  }

  try {
    const result = execute(line);
    if (typeof result === "string") {
      console.log(result);
    } else if (Array.isArray(result)) {
      if (result.length === 0) {
        console.log("Empty set");
      } else {
        console.table(result);
      }
    } else {
      console.log(result);
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
  
  rl.prompt();
});

rl.on("close", () => {
  console.log("\nGoodbye!");
  process.exit(0);
});
EOF
