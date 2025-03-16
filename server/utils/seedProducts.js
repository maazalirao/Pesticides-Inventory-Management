import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/productModel.js';
import connectDB from '../config/db.js';

dotenv.config();

const sampleProducts = [
  {
    name: 'EcoGuard Plus',
    description: 'Organic pesticide for vegetables and fruits. Safe for use up to day of harvest.',
    category: 'Organic',
    price: 1250.99,
    stockQuantity: 75,
    sku: 'ECO-001',
    image: 'https://picsum.photos/seed/ecoguard/300/300',
    manufacturer: 'GreenEarth Biologicals',
    toxicityLevel: 'Low',
    recommendedUse: 'Vegetables, fruits, ornamentals',
    tags: ['organic', 'safe', 'vegetables', 'fruits']
  },
  {
    name: 'MaxiShield 500EC',
    description: 'Broad-spectrum insecticide for cotton and rice crops. Controls major pests effectively.',
    category: 'Insecticide',
    price: 2450.50,
    stockQuantity: 45,
    sku: 'MAXI-002',
    image: 'https://picsum.photos/seed/maxishield/300/300',
    manufacturer: 'AgriTech Solutions',
    toxicityLevel: 'Medium',
    recommendedUse: 'Cotton, rice, wheat',
    tags: ['insecticide', 'broad-spectrum', 'cotton', 'rice']
  },
  {
    name: 'WeedClear Pro',
    description: 'Selective herbicide for eliminating broadleaf weeds without harming crops.',
    category: 'Herbicide',
    price: 1875.25,
    stockQuantity: 60,
    sku: 'WEED-003',
    image: 'https://picsum.photos/seed/weedclear/300/300',
    manufacturer: 'FarmChem Industries',
    toxicityLevel: 'Medium',
    recommendedUse: 'Wheat, maize, sugarcane',
    tags: ['herbicide', 'selective', 'broadleaf']
  },
  {
    name: 'FungoCure 250SC',
    description: 'Systemic fungicide for controlling powdery mildew and rust in various crops.',
    category: 'Fungicide',
    price: 3250.00,
    stockQuantity: 30,
    sku: 'FUNG-004',
    image: 'https://picsum.photos/seed/fungocure/300/300',
    manufacturer: 'BioDefend Ltd',
    toxicityLevel: 'Medium',
    recommendedUse: 'Vegetables, cereals, ornamentals',
    tags: ['fungicide', 'mildew', 'rust']
  },
  {
    name: 'TermiShield Pro',
    description: 'Specialized termiticide for soil treatment and structure protection.',
    category: 'Termiticide',
    price: 4500.75,
    stockQuantity: 25,
    sku: 'TERM-005',
    image: 'https://picsum.photos/seed/termishield/300/300',
    manufacturer: 'PestGuard Solutions',
    toxicityLevel: 'High',
    recommendedUse: 'Building foundations, soil barriers',
    tags: ['termiticide', 'soil', 'structure']
  },
  {
    name: 'BioDefense Neem Oil',
    description: '100% organic neem oil extract for natural pest control. Safe for organic farming.',
    category: 'Organic',
    price: 950.25,
    stockQuantity: 100,
    sku: 'BIO-006',
    image: 'https://picsum.photos/seed/neem/300/300',
    manufacturer: 'Organic Crop Protectors',
    toxicityLevel: 'Low',
    recommendedUse: 'All crops, household plants',
    tags: ['organic', 'neem', 'natural', 'multi-purpose']
  },
  {
    name: 'RapidKill MAX',
    description: 'Fast-acting insecticide for emergency pest outbreaks. Controls a wide range of insects.',
    category: 'Insecticide',
    price: 3800.50,
    stockQuantity: 40,
    sku: 'RAPID-007',
    image: 'https://picsum.photos/seed/rapidkill/300/300',
    manufacturer: 'Rapid Pest Solutions Inc.',
    toxicityLevel: 'High',
    recommendedUse: 'Cotton, vegetables, orchards',
    tags: ['insecticide', 'fast-acting', 'emergency']
  },
  {
    name: 'GrowSafe Seed Treatment',
    description: 'Protective seed coating that guards against soil-borne diseases and early-stage pests.',
    category: 'Seed Treatment',
    price: 2250.00,
    stockQuantity: 55,
    sku: 'SEED-008',
    image: 'https://picsum.photos/seed/growsafe/300/300',
    manufacturer: 'SeedTech Innovations',
    toxicityLevel: 'Low',
    recommendedUse: 'Corn, wheat, vegetable seeds',
    tags: ['seed', 'treatment', 'protective']
  },
  {
    name: 'AquaShield Fish Safe',
    description: 'Aquatic herbicide for controlling water weeds. Safe for fish and aquatic life.',
    category: 'Aquatic Herbicide',
    price: 1950.75,
    stockQuantity: 35,
    sku: 'AQUA-009',
    image: 'https://picsum.photos/seed/aquashield/300/300',
    manufacturer: 'AquaCare Products',
    toxicityLevel: 'Low',
    recommendedUse: 'Ponds, lakes, water reservoirs',
    tags: ['aquatic', 'herbicide', 'fish-safe']
  },
  {
    name: 'MosquitoGuard 365',
    description: 'Long-lasting mosquito larvicide for standing water. Controls mosquito breeding for up to 1 year.',
    category: 'Larvicide',
    price: 1750.25,
    stockQuantity: 65,
    sku: 'MOSQ-010',
    image: 'https://picsum.photos/seed/mosquitoguard/300/300',
    manufacturer: 'Vector Control Systems',
    toxicityLevel: 'Medium',
    recommendedUse: 'Standing water, drainage systems',
    tags: ['mosquito', 'larvicide', 'long-lasting']
  },
  {
    name: 'RodentStop Bait Blocks',
    description: 'Professional-grade rodenticide in weather-resistant block form. Controls rats and mice.',
    category: 'Rodenticide',
    price: 1200.00,
    stockQuantity: 80,
    sku: 'ROD-011',
    image: 'https://picsum.photos/seed/rodentstop/300/300',
    manufacturer: 'PestAway Solutions',
    toxicityLevel: 'High',
    recommendedUse: 'Storage areas, warehouses, perimeter control',
    tags: ['rodenticide', 'bait', 'rat', 'mouse']
  },
  {
    name: 'GreenGuard Nematicide',
    description: 'Soil treatment for controlling harmful nematodes while preserving beneficial soil organisms.',
    category: 'Nematicide',
    price: 2850.50,
    stockQuantity: 30,
    sku: 'NEM-012',
    image: 'https://picsum.photos/seed/greenguard/300/300',
    manufacturer: 'Soil Health Experts',
    toxicityLevel: 'Medium',
    recommendedUse: 'Vegetables, ornamentals, soil preparation',
    tags: ['nematicide', 'soil', 'selective']
  },
  {
    name: 'HarvestSafe Residue Free',
    description: 'Short PHI pesticide with minimal residue. Ideal for use close to harvest time.',
    category: 'Insecticide',
    price: 2100.25,
    stockQuantity: 50,
    sku: 'HARV-013',
    image: 'https://media.istockphoto.com/id/468867687/photo/farmer-spraying-pesticide.jpg?s=612x612&w=0&k=20&c=AGcFwPIeR-U4DD1Jz5nyMWNOuccxoSXMYXvaqp3axu0=',
    manufacturer: 'CleanCrop Technologies',
    toxicityLevel: 'Low',
    recommendedUse: 'Vegetables, fruits, export crops',
    tags: ['insecticide', 'residue-free', 'harvest']
  },
  {
    name: 'StorageGuard Fumigant',
    description: 'Grain storage fumigant that protects against storage pests without affecting grain quality.',
    category: 'Fumigant',
    price: 3500.75,
    stockQuantity: 25,
    sku: 'STOR-014',
    image: 'https://picsum.photos/seed/storageguard/300/300',
    manufacturer: 'StoreSafe Products',
    toxicityLevel: 'High',
    recommendedUse: 'Grain storages, silos, warehouses',
    tags: ['fumigant', 'storage', 'grain']
  },
  {
    name: 'CitrusShield EC',
    description: 'Specialized insecticide for citrus crops targeting leaf miners and scale insects.',
    category: 'Insecticide',
    price: 2750.00,
    stockQuantity: 35,
    sku: 'CITR-015',
    image: 'https://picsum.photos/seed/citrusshield/300/300',
    manufacturer: 'Citrus Crop Solutions',
    toxicityLevel: 'Medium',
    recommendedUse: 'Citrus orchards, nurseries',
    tags: ['insecticide', 'citrus', 'specialized']
  }
];

// Connect to MongoDB
const importProducts = async () => {
  try {
    // Connect to the database
    await connectDB();
    
    // Clear the existing data
    await Product.deleteMany({});
    
    // Insert the sample products
    await Product.insertMany(sampleProducts);
    
    console.log('Products imported successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run the script
importProducts(); 