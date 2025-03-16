# Setting Up Sample Products

This guide will help you populate your database with sample pesticide products so you don't have to manually create them one by one.

## Prerequisites

1. Make sure your MongoDB connection is set up in the `.env` file
2. Ensure your server can connect to MongoDB Atlas

## Steps to Import Sample Products

1. Open your terminal in the project root folder
2. Run the following command to import the products:

```bash
npm run data:import
```

3. You should see a success message: `Products imported successfully!`
4. These products will now appear in your MongoDB Atlas database in the "products" collection

## What this does

The seed script:
- Creates 15 pesticide products with realistic data
- Sets up proper categories, prices, and product details
- Populates all required fields including manufacturer, toxicity level, and recommended use

## Viewing the Products

After importing the data:

1. Start your server with `npm run server` or `npm run dev:full`
2. Navigate to the Products page in your application
3. All 15 sample products should be displayed in the table

## Notes

- If you run the seed script again, it will first delete all existing products before importing the samples
- All products are given default image paths; you can update these later with real images
- The script adds SKUs ranging from ECO-001 to CITR-015 to ensure uniqueness

## Customizing the Sample Data

If you want to modify the sample data:
1. Open `server/utils/seedProducts.js`
2. Edit the `sampleProducts` array to change product details
3. Run the import script again to apply your changes 