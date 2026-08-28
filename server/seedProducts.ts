import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

const catalogItems = [
  {
    name: "Farm Fresh A2 Cow Milk",
    category: "DAIRY",
    unit: "L",
    price: 75,
    dailyStockCeiling: 150,
    isAvailableToday: true,
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=600&auto=format&fit=crop",
    description: "Pure, unprocessed A2 Gir cow milk harvested fresh every morning.",
    isSubscriptionEligible: true,
    subscriptionDiscount: 5,
  },
  {
    name: "Organic Malai Paneer",
    category: "DAIRY",
    unit: "pack",
    price: 140,
    dailyStockCeiling: 60,
    isAvailableToday: true,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=600&auto=format&fit=crop",
    description: "Soft, handcrafted organic paneer made from fresh farm milk (200g pack).",
    isSubscriptionEligible: true,
    subscriptionDiscount: 5,
  },
  {
    name: "Farm Organic Red Tomatoes",
    category: "VEGETABLE",
    unit: "kg",
    price: 40,
    dailyStockCeiling: 80,
    isAvailableToday: true,
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=600&auto=format&fit=crop",
    description: "Sun-ripened, pesticide-free red tomatoes harvested same night.",
    isSubscriptionEligible: true,
    subscriptionDiscount: 5,
  },
  {
    name: "Sweet Cherry Tomatoes",
    category: "VEGETABLE",
    unit: "pack",
    price: 60,
    dailyStockCeiling: 40,
    isAvailableToday: true,
    image: "https://images.unsplash.com/photo-1561136594-7f68413baa99?q=80&w=600&auto=format&fit=crop",
    description: "Bite-sized sweet organic cherry tomatoes (250g pack). Ideal substitution for red tomatoes.",
    isSubscriptionEligible: true,
    subscriptionDiscount: 5,
  },
  {
    name: "Fresh Organic Spinach (Palak)",
    category: "VEGETABLE",
    unit: "kg",
    price: 35,
    dailyStockCeiling: 50,
    isAvailableToday: true,
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=600&auto=format&fit=crop",
    description: "Crisp, nutrient-dense organic spinach harvested straight from the bed.",
    isSubscriptionEligible: true,
    subscriptionDiscount: 5,
  },
  {
    name: "Hill Orchard Shimla Apples",
    category: "FRUIT",
    unit: "kg",
    price: 160,
    dailyStockCeiling: 70,
    isAvailableToday: true,
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6faa6?q=80&w=600&auto=format&fit=crop",
    description: "Juicy and crunchy natural Shimla apples directly from partner hill orchards.",
    isSubscriptionEligible: true,
    subscriptionDiscount: 5,
  },
  {
    name: "Fresh Cavendish Bananas",
    category: "FRUIT",
    unit: "dozen",
    price: 65,
    dailyStockCeiling: 90,
    isAvailableToday: true,
    image: "https://images.unsplash.com/photo-1571501679680-de32f1e7aad4?q=80&w=600&auto=format&fit=crop",
    description: "Naturally ripened, sweet chemical-free bananas.",
    isSubscriptionEligible: true,
    subscriptionDiscount: 5,
  },
  {
    name: "Raw Organic Turmeric Powder",
    category: "OTHER",
    unit: "pack",
    price: 190,
    dailyStockCeiling: 100,
    isAvailableToday: true,
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=600&auto=format&fit=crop",
    description: "High-curcumin organic turmeric ground from whole farm roots (250g pack).",
    isSubscriptionEligible: false,
    subscriptionDiscount: 0,
  },
  {
    name: "Pure Vedic Cow Ghee",
    category: "DAIRY",
    unit: "pack",
    price: 650,
    dailyStockCeiling: 30,
    isAvailableToday: true,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=600&auto=format&fit=crop",
    description: "Bilona-method churned pure A2 cow ghee (500ml jar).",
    isSubscriptionEligible: true,
    subscriptionDiscount: 5,
  },
  {
    name: "Fresh Green Broccoli Crown",
    category: "VEGETABLE",
    unit: "piece",
    price: 90,
    dailyStockCeiling: 45,
    isAvailableToday: true,
    image: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?q=80&w=600&auto=format&fit=crop",
    description: "Farm-fresh green broccoli head packed with vitamins.",
    isSubscriptionEligible: true,
    subscriptionDiscount: 5,
  },
];

async function seed() {
  try {
    console.log("[SEED] Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("[SEED] Connected!");

    console.log("[SEED] Resetting Product collection...");
    await Product.deleteMany({});

    console.log("[SEED] Seeding starter catalog items...");
    const createdMap: Record<string, any> = {};

    for (const item of catalogItems) {
      const created = await Product.create(item);
      createdMap[created.name] = created;
      console.log(`[SEED] Created product: ${created.name} (₹${created.price}/${created.unit})`);
    }

    // Link Substitution Mappings
    if (createdMap["Farm Organic Red Tomatoes"] && createdMap["Sweet Cherry Tomatoes"]) {
      createdMap["Farm Organic Red Tomatoes"].substituteProductId = createdMap["Sweet Cherry Tomatoes"]._id;
      await createdMap["Farm Organic Red Tomatoes"].save();
      console.log("[SEED] Linked substitution: Red Tomatoes -> Cherry Tomatoes");
    }

    console.log("\n✅ Starter catalog seeded successfully with 10 organic produce & dairy SKUs!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding catalog:", error);
    process.exit(1);
  }
}

seed();

