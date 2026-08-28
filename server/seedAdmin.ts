import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User";
import Zone from "./models/Zone";

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("[SEED] Connected to MongoDB");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    // 1. Seed Demo Users with Bihar Addresses
    const demoUsers = [
      {
        name: "Platform Admin",
        email: "admin@farmfresh.com",
        password: hashedPassword,
        role: "admin",
        phone: "+91 98765 00001",
        address: "HQ Operational Command Center, Arwal Hub, Bihar",
        pincode: "804401",
      },
      {
        name: "Ramesh Ops (Arwal - Patna Route)",
        email: "ops.gomti@farmfresh.com",
        password: hashedPassword,
        role: "delivery_ops",
        phone: "+91 98765 00002",
        address: "Arwal Logistics & Dispatch Hub, Bihar",
        pincode: "804401",
      },
      {
        name: "Manjeet",
        email: "customer@farmfresh.com",
        password: hashedPassword,
        role: "customer",
        phone: "+91 98765 00003",
        address: "Main Market Road, Arwal, Bihar",
        pincode: "804401",
      },

    ];

    const createdUserMap: Record<string, any> = {};

    for (const demoUser of demoUsers) {
      let user = await User.findOne({ email: demoUser.email });
      if (!user) {
        user = await User.create(demoUser);
        console.log(`[SEED] Created ${demoUser.role.toUpperCase()} account: ${demoUser.email}`);
      } else {
        user.address = demoUser.address;
        user.pincode = demoUser.pincode;
        user.name = demoUser.name;
        await user.save();
        console.log(`[SEED] Updated User: ${demoUser.email}`);
      }
      createdUserMap[demoUser.email] = user;
    }

    // 2. Clear legacy zones and seed 4 Bihar Operational Routes
    await Zone.deleteMany({});
    console.log("[SEED] Reset legacy zones database");

    const demoZones = [
      {
        zoneCode: "ZN-BIH-01",
        name: "Arwal - Patna Route",
        city: "Arwal / Patna",
        state: "Bihar",
        pincodeRanges: ["804401", "804402", "800001", "800002", "800020"],
        cutoffTime: "21:30",
        dispatchDeadline: "04:30",
        dailyCapacity: 150,
        primaryStaffId: createdUserMap["ops.gomti@farmfresh.com"]?._id || null,
        isActive: true,
      },
      {
        zoneCode: "ZN-BIH-02",
        name: "Arwal - Jehanabad Route",
        city: "Arwal / Jehanabad",
        state: "Bihar",
        pincodeRanges: ["804401", "804408", "804417", "804425"],
        cutoffTime: "21:30",
        dispatchDeadline: "04:45",
        dailyCapacity: 120,
        primaryStaffId: null,
        isActive: true,
      },
      {
        zoneCode: "ZN-BIH-03",
        name: "Arwal - Aurangabad Route",
        city: "Arwal / Aurangabad",
        state: "Bihar",
        pincodeRanges: ["804401", "824101", "824102", "824123"],
        cutoffTime: "21:30",
        dispatchDeadline: "05:00",
        dailyCapacity: 100,
        primaryStaffId: null,
        isActive: true,
      },
      {
        zoneCode: "ZN-BIH-04",
        name: "Arwal - Gaya Route",
        city: "Arwal / Gaya",
        state: "Bihar",
        pincodeRanges: ["804401", "823001", "823002", "823003"],
        cutoffTime: "21:30",
        dispatchDeadline: "05:15",
        dailyCapacity: 110,
        primaryStaffId: null,
        isActive: true,
      },
    ];

    for (const zoneData of demoZones) {
      const zone = await Zone.create(zoneData);
      console.log(`[SEED] Created Bihar Zone: ${zoneData.name} (${zoneData.zoneCode})`);

      // Link ops staff zoneId
      if (zoneData.primaryStaffId) {
        await User.findByIdAndUpdate(zoneData.primaryStaffId, { zoneId: zone._id });
      }
    }

    console.log("\n✅ Bihar Operational Delivery Zones seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding demo data:", error);
    process.exit(1);
  }
};

seedData();
