import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Order of script execution is important
const scripts = [
  'resetDB.js',         // Reset the database first
  'seedStores.js',      // Must run first to create stores for Maaz, Ali, and Rao
  'seedSuppliers.js',   // Create 5 suppliers for each store
  'seedProducts.js',    // Create 5 products for each store
  'seedInventory.js',   // Create 5 inventory items for each store
  'seedCustomers.js',   // Create 5 customers for each store
  // Add any other seed scripts here if needed
];

// Run scripts sequentially
async function runScripts() {
  for (const script of scripts) {
    console.log(`\n===== RUNNING ${script} =====\n`);
    
    try {
      // Wait for each script to complete before moving to the next
      await new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, script);
        
        console.log(`Executing: node ${scriptPath}`);
        
        // Create child process with stdio inheritance
        const child = spawn('node', [scriptPath], { 
          stdio: 'inherit',
          shell: true // Use shell on Windows to ensure correct path resolution
        });
        
        child.on('close', (code) => {
          if (code === 0) {
            console.log(`\n✅ ${script} completed successfully\n`);
            resolve();
          } else {
            console.error(`\n❌ ${script} failed with code ${code}\n`);
            reject(new Error(`Script ${script} exited with code ${code}`));
          }
        });
        
        child.on('error', (err) => {
          console.error(`\n❌ Failed to start ${script}: ${err}\n`);
          reject(err);
        });
      });
    } catch (error) {
      console.error(`Error running ${script}:`, error);
      process.exit(1);
    }
  }
  
  console.log('\n✅ All seed scripts completed successfully!');
  console.log('\n✅ Each store now has 5 suppliers, 5 products, 5 inventory items, and 5 customers.');
}

console.log('Starting seed process...');
runScripts().catch(err => {
  console.error('Seeding process failed:', err);
  process.exit(1);
}); 