
// Quick script to check environment variables
console.log("=== Environment Variable Checker ===");

const requiredVars = [
  "DATABASE_URL", 
  "YOUTUBE_API_KEY", 
  "SUPABASE_ANON_KEY", 
  "SUPABASE_URL"
];

console.log("\nChecking required environment variables:");
let missingVars = false;

for (const varName of requiredVars) {
  if (process.env[varName]) {
    const value = process.env[varName];
    const maskedValue = value.length > 8 
      ? value.substring(0, 4) + "..." + value.slice(-4) 
      : "****";
    console.log(`✅ ${varName}: ${maskedValue}`);
  } else {
    console.log(`❌ ${varName}: Missing`);
    missingVars = true;
  }
}

if (missingVars) {
  console.log("\n⚠️ Some required environment variables are missing.");
  console.log("For local development: Add them to client/.env file");
  console.log("For deployment: Add them in Deployments → Secrets");
} else {
  console.log("\n✅ All required environment variables are set!");
}

console.log("\nChecking port availability:");
const http = require('http');
const checkPort = (port) => {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.listen(port, () => {
      server.close();
      resolve(true);
    });
    server.on('error', () => {
      resolve(false);
    });
  });
};

(async () => {
  const port5000 = await checkPort(5000);
  console.log(`Port 5000: ${port5000 ? '✅ Available' : '❌ In use'}`);
  
  const port3333 = await checkPort(3333);
  console.log(`Port 3333: ${port3333 ? '✅ Available' : '❌ In use'}`);
})();
