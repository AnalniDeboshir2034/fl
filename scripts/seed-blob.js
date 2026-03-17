#!/usr/bin/env node

/**
 * Seed script to upload initial data to Vercel Blob
 * Run this after deploying to Vercel to populate the database
 */

const { put } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'backend', 'data');
const FILES = ['users.json', 'products.json', 'baskets.json', 'orders.json'];

async function seed() {
  console.log('🌱 Starting Vercel Blob seed...\n');

  // Check if BLOB token is available
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ Error: BLOB_READ_WRITE_TOKEN not found!');
    console.error('Please make sure this script runs in Vercel environment');
    console.error('or set the token as an environment variable.');
    process.exit(1);
  }

  for (const file of FILES) {
    const filePath = path.join(DATA_DIR, file);
    const blobKey = `lshop-${file}`;

    try {
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping ${file} - file not found`);
        continue;
      }

      const data = fs.readFileSync(filePath, 'utf-8');
      const jsonData = JSON.parse(data);

      await put(blobKey, data, {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
      });

      console.log(`✅ Uploaded ${file} → ${blobKey}`);
    } catch (error) {
      console.error(`❌ Error uploading ${file}:`, error.message);
    }
  }

  console.log('\n✨ Seed completed!');
}

seed().catch(console.error);
