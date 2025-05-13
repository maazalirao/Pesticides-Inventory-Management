import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Inventory from '../server/models/inventoryModel.js';
import Store from '../server/models/storeModel.js';
import connectDB from '../server/config/db.js';

dotenv.config();

// Sample inventory data templates (without store reference)
const inventoryTemplates = [
  {
    name: 'EcoGuard Plus',
    sku: 'ECO-INV-001',
    category: 'Insecticide',
    quantity: 75,
    unit: 'Bottles',
    price: 1250.99,
    threshold: 15,
    status: 'In Stock',
    supplier: 'GreenEarth Biologicals',
    batches: [
      {
        batchId: 'ECO-B001',
        lotNumber: 'LOT-2023-05',
        quantity: 40,
        manufacturingDate: new Date('2023-05-10'),
        expiryDate: new Date('2025-05-10'),
        supplier: 'GreenEarth Biologicals',
        locationCode: 'W1-A1-S2',
        notes: 'First batch received in good condition'
      },
      {
        batchId: 'ECO-B002',
        lotNumber: 'LOT-2023-08',
        quantity: 35,
        manufacturingDate: new Date('2023-08-15'),
        expiryDate: new Date('2025-08-15'),
        supplier: 'GreenEarth Biologicals',
        locationCode: 'W1-A1-S3',
        notes: 'Second batch'
      }
    ]
  },
  {
    name: 'MaxiShield 500EC',
    sku: 'MAX-INV-002',
    category: 'Insecticide',
    quantity: 45,
    unit: 'Cans',
    price: 2450.50,
    threshold: 10,
    status: 'In Stock',
    supplier: 'AgriTech Solutions',
    batches: [
      {
        batchId: 'MAX-B001',
        lotNumber: 'LT-456-89',
        quantity: 45,
        manufacturingDate: new Date('2023-06-20'),
        expiryDate: new Date('2025-06-20'),
        supplier: 'AgriTech Solutions',
        locationCode: 'W1-B2-S1',
        notes: 'Premium quality batch'
      }
    ]
  },
  {
    name: 'WeedClear Pro',
    sku: 'WCP-INV-003',
    category: 'Herbicide',
    quantity: 60,
    unit: 'Bottles',
    price: 1875.25,
    threshold: 15,
    status: 'In Stock',
    supplier: 'FarmChem Industries',
    batches: [
      {
        batchId: 'WCP-B001',
        lotNumber: 'HRB-789-12',
        quantity: 60,
        manufacturingDate: new Date('2023-07-05'),
        expiryDate: new Date('2025-01-05'),
        supplier: 'FarmChem Industries',
        locationCode: 'W2-A3-S4',
        notes: 'Fresh stock'
      }
    ]
  },
  {
    name: 'FungoCure 250SC',
    sku: 'FGC-INV-004',
    category: 'Fungicide',
    quantity: 30,
    unit: 'Packets',
    price: 3250.00,
    threshold: 20,
    status: 'In Stock',
    supplier: 'BioDefend Ltd',
    batches: [
      {
        batchId: 'FGC-B001',
        lotNumber: 'FGC-123-45',
        quantity: 30,
        manufacturingDate: new Date('2023-09-05'),
        expiryDate: new Date('2025-09-05'),
        supplier: 'BioDefend Ltd',
        locationCode: 'W2-B2-S1',
        notes: 'New fungicide formula'
      }
    ]
  },
  {
    name: 'TermiShield Pro',
    sku: 'TSP-INV-005',
    category: 'Insecticide',
    quantity: 25,
    unit: 'Bags',
    price: 4500.75,
    threshold: 8,
    status: 'In Stock',
    supplier: 'PestGuard Solutions',
    batches: [
      {
        batchId: 'TSP-B001',
        lotNumber: 'TERM-321-45',
        quantity: 15,
        manufacturingDate: new Date('2023-09-10'),
        expiryDate: new Date('2025-09-10'),
        supplier: 'PestGuard Solutions',
        locationCode: 'W1-C1-S1',
        notes: 'Specialized for termite control'
      },
      {
        batchId: 'TSP-B002',
        lotNumber: 'TERM-322-46',
        quantity: 10,
        manufacturingDate: new Date('2023-10-15'),
        expiryDate: new Date('2025-10-15'),
        supplier: 'PestGuard Solutions',
        locationCode: 'W1-C1-S2',
        notes: 'New formulation'
      }
    ]
  },
  {
    name: 'BioDefense Neem Oil',
    sku: 'BDN-INV-006',
    category: 'Organic',
    quantity: 100,
    unit: 'Bottles',
    price: 950.25,
    threshold: 25,
    status: 'In Stock',
    supplier: 'Organic Crop Protectors',
    batches: [
      {
        batchId: 'BDN-B001',
        lotNumber: 'NEEM-111-22',
        quantity: 50,
        manufacturingDate: new Date('2023-11-01'),
        expiryDate: new Date('2024-11-01'),
        supplier: 'Organic Crop Protectors',
        locationCode: 'W2-B1-S3',
        notes: 'Organic certified batch'
      },
      {
        batchId: 'BDN-B002',
        lotNumber: 'NEEM-112-23',
        quantity: 50,
        manufacturingDate: new Date('2023-12-10'),
        expiryDate: new Date('2024-12-10'),
        supplier: 'Organic Crop Protectors',
        locationCode: 'W2-B1-S4',
        notes: 'Cold pressed oils'
      }
    ]
  },
  {
    name: 'RapidKill MAX',
    sku: 'RKM-INV-007',
    category: 'Insecticide',
    quantity: 5,
    unit: 'Cans',
    price: 3800.50,
    threshold: 10,
    status: 'Low Stock',
    supplier: 'Rapid Pest Solutions Inc.',
    batches: [
      {
        batchId: 'RKM-B001',
        lotNumber: 'RK-555-77',
        quantity: 5,
        manufacturingDate: new Date('2023-08-20'),
        expiryDate: new Date('2025-08-20'),
        supplier: 'Rapid Pest Solutions Inc.',
        locationCode: 'W3-A2-S1',
        notes: 'Professional grade only'
      }
    ]
  },
  {
    name: 'GrowSafe Seed Treatment',
    sku: 'GST-INV-008',
    category: 'Seed Treatment',
    quantity: 55,
    unit: 'Packets',
    price: 2250.00,
    threshold: 15,
    status: 'In Stock',
    supplier: 'SeedTech Innovations',
    batches: [
      {
        batchId: 'GST-B001',
        lotNumber: 'SEED-444-55',
        quantity: 30,
        manufacturingDate: new Date('2023-09-25'),
        expiryDate: new Date('2025-09-25'),
        supplier: 'SeedTech Innovations',
        locationCode: 'W2-C3-S2',
        notes: 'For corn and wheat'
      },
      {
        batchId: 'GST-B002',
        lotNumber: 'SEED-446-57',
        quantity: 25,
        manufacturingDate: new Date('2023-10-05'),
        expiryDate: new Date('2025-10-05'),
        supplier: 'SeedTech Innovations',
        locationCode: 'W2-C3-S3',
        notes: 'For vegetable seeds'
      }
    ]
  },
  {
    name: 'AquaShield Fish Safe',
    sku: 'AFS-INV-009',
    category: 'Aquatic Herbicide',
    quantity: 35,
    unit: 'Bottles',
    price: 1950.75,
    threshold: 10,
    status: 'In Stock',
    supplier: 'AquaCare Products',
    batches: [
      {
        batchId: 'AFS-B001',
        lotNumber: 'AQUA-222-33',
        quantity: 35,
        manufacturingDate: new Date('2023-10-12'),
        expiryDate: new Date('2025-10-12'),
        supplier: 'AquaCare Products',
        locationCode: 'W2-D1-S1',
        notes: 'Special aquatic formulation'
      }
    ]
  },
  {
    name: 'MosquitoGuard 365',
    sku: 'MGD-INV-010',
    category: 'Larvicide',
    quantity: 65,
    unit: 'Packets',
    price: 1750.25,
    threshold: 20,
    status: 'In Stock',
    supplier: 'Vector Control Systems',
    batches: [
      {
        batchId: 'MGD-B001',
        lotNumber: 'MOS-512-78',
        quantity: 40,
        manufacturingDate: new Date('2023-07-20'),
        expiryDate: new Date('2026-07-20'),
        supplier: 'Vector Control Systems',
        locationCode: 'W3-A1-S5',
        notes: 'Long-lasting formula'
      },
      {
        batchId: 'MGD-B002',
        lotNumber: 'MOS-514-80',
        quantity: 25,
        manufacturingDate: new Date('2023-09-10'),
        expiryDate: new Date('2026-09-10'),
        supplier: 'Vector Control Systems',
        locationCode: 'W3-A1-S6',
        notes: 'Enhanced effectiveness'
      }
    ]
  },
  {
    name: 'RodentStop Bait Blocks',
    sku: 'RSB-INV-011',
    category: 'Rodenticide',
    quantity: 80,
    unit: 'Boxes',
    price: 1200.00,
    threshold: 20,
    status: 'In Stock',
    supplier: 'PestAway Solutions',
    batches: [
      {
        batchId: 'RSB-B001',
        lotNumber: 'ROD-222-33',
        quantity: 50,
        manufacturingDate: new Date('2023-07-15'),
        expiryDate: new Date('2025-07-15'),
        supplier: 'PestAway Solutions',
        locationCode: 'W3-B1-S4',
        notes: 'Weather resistant blocks'
      },
      {
        batchId: 'RSB-B002',
        lotNumber: 'ROD-224-35',
        quantity: 30,
        manufacturingDate: new Date('2023-08-25'),
        expiryDate: new Date('2025-08-25'),
        supplier: 'PestAway Solutions',
        locationCode: 'W3-B1-S5',
        notes: 'Enhanced formula'
      }
    ]
  },
  {
    name: 'GreenGuard Nematicide',
    sku: 'GGN-INV-012',
    category: 'Nematicide',
    quantity: 30,
    unit: 'Bags',
    price: 2850.50,
    threshold: 10,
    status: 'In Stock',
    supplier: 'Soil Health Experts',
    batches: [
      {
        batchId: 'GGN-B001',
        lotNumber: 'NEM-777-88',
        quantity: 30,
        manufacturingDate: new Date('2023-11-15'),
        expiryDate: new Date('2025-11-15'),
        supplier: 'Soil Health Experts',
        locationCode: 'W2-E2-S1',
        notes: 'Soil-friendly formulation'
      }
    ]
  },
  {
    name: 'HarvestSafe Residue Free',
    sku: 'HSR-INV-013',
    category: 'Insecticide',
    quantity: 50,
    unit: 'Bottles',
    price: 2100.25,
    threshold: 15,
    status: 'In Stock',
    supplier: 'CleanCrop Technologies',
    batches: [
      {
        batchId: 'HSR-B001',
        lotNumber: 'HARV-333-44',
        quantity: 30,
        manufacturingDate: new Date('2023-10-20'),
        expiryDate: new Date('2024-10-20'),
        supplier: 'CleanCrop Technologies',
        locationCode: 'W1-D3-S2',
        notes: 'Short PHI formulation'
      },
      {
        batchId: 'HSR-B002',
        lotNumber: 'HARV-335-46',
        quantity: 20,
        manufacturingDate: new Date('2023-11-25'),
        expiryDate: new Date('2024-11-25'),
        supplier: 'CleanCrop Technologies',
        locationCode: 'W1-D3-S3',
        notes: 'For export crops'
      }
    ]
  },
  {
    name: 'StorageGuard Fumigant',
    sku: 'SGF-INV-014',
    category: 'Fumigant',
    quantity: 25,
    unit: 'Canisters',
    price: 3500.75,
    threshold: 8,
    status: 'In Stock',
    supplier: 'StoreSafe Products',
    batches: [
      {
        batchId: 'SGF-B001',
        lotNumber: 'FUM-888-99',
        quantity: 25,
        manufacturingDate: new Date('2023-09-05'),
        expiryDate: new Date('2026-09-05'),
        supplier: 'StoreSafe Products',
        locationCode: 'W3-C2-S1',
        notes: 'Handle with care - high toxicity'
      }
    ]
  },
  {
    name: 'CitrusShield EC',
    sku: 'CSE-INV-015',
    category: 'Insecticide',
    quantity: 35,
    unit: 'Bottles',
    price: 2750.00,
    threshold: 12,
    status: 'In Stock',
    supplier: 'Citrus Crop Solutions',
    batches: [
      {
        batchId: 'CSE-B001',
        lotNumber: 'CIT-123-45',
        quantity: 20,
        manufacturingDate: new Date('2023-08-30'),
        expiryDate: new Date('2025-08-30'),
        supplier: 'Citrus Crop Solutions',
        locationCode: 'W1-E1-S1',
        notes: 'Specialized for citrus'
      },
      {
        batchId: 'CSE-B002',
        lotNumber: 'CIT-125-47',
        quantity: 15,
        manufacturingDate: new Date('2023-10-12'),
        expiryDate: new Date('2025-10-12'),
        supplier: 'Citrus Crop Solutions',
        locationCode: 'W1-E1-S2',
        notes: 'New improved formula'
      }
    ]
  }
];

// Function to import inventory data with store references
const importInventory = async () => {
  try {
    // Connect to the database
    await connectDB();
    console.log('MongoDB Connected');
    
    // Get all stores
    const stores = await Store.find({});
    
    if (stores.length === 0) {
      console.error('No stores found. Please run seedStores.js first.');
      process.exit(1);
    }
    
    console.log(`Found ${stores.length} stores for inventory distribution`);
    
    // Clear existing inventory
    await Inventory.deleteMany({});
    console.log('Cleared existing inventory');
    
    // Array to hold all inventory items with store assignments
    const allInventoryItems = [];
    
    // Track used batch IDs to ensure uniqueness
    const usedBatchIds = new Set();
    
    // Loop through each store
    for (const store of stores) {
      console.log(`Creating 5 inventory items for store: ${store.name}`);
      
      // Create exactly 5 inventory items per store
      for (let i = 0; i < 5; i++) {
        const template = inventoryTemplates[i % inventoryTemplates.length];
        
        // Create store-specific SKU to ensure uniqueness
        const storePrefix = store._id.toString().substring(0, 3);
        const sku = `${storePrefix}-${template.sku}`;
        
        // Create store-specific inventory name
        const inventoryName = `${store.name.split(' ')[0]}'s ${template.name}`;
        
        // Modify batch IDs to be store-specific and unique across stores
        const modifiedBatches = template.batches.map(batch => {
          // Use store prefix, batch ID, and i to ensure uniqueness
          const uniqueBatchId = `${storePrefix}-${i}-${batch.batchId}`;
          
          // Make sure we haven't used this ID before
          if (usedBatchIds.has(uniqueBatchId)) {
            // If it's already used, add a random number
            const randomSuffix = Math.floor(Math.random() * 1000);
            const alternativeBatchId = `${uniqueBatchId}-${randomSuffix}`;
            usedBatchIds.add(alternativeBatchId);
            return {
              ...batch,
              batchId: alternativeBatchId
            };
          }
          
          usedBatchIds.add(uniqueBatchId);
          return {
            ...batch,
            batchId: uniqueBatchId
          };
        });
        
        allInventoryItems.push({
          ...template,
          name: inventoryName,
          sku,
          price: template.price,
          priceLabel: `PKR ${template.price.toFixed(2)}`,
          store: store._id,
          batches: modifiedBatches
        });
      }
    }
    
    // Insert all inventory items
    const insertedItems = await Inventory.insertMany(allInventoryItems);
    console.log(`Successfully inserted ${insertedItems.length} inventory items with ${usedBatchIds.size} unique batch IDs`);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run the import function
importInventory(); 