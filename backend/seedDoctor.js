import mongoose from "mongoose";
import bcrypt from "bcrypt";
import 'dotenv/config';
import doctorModel from "./models/doctorModel.js";

const seedDoctor = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error("❌ MONGODB_URI not found in .env");
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB");

    const email = "doctor@hospital.com";
    const password = "doctor123";

    // Check if doctor already exists
    const doctorExists = await doctorModel.findOne({ email });
    if (doctorExists) {
      console.log(`⚠️ Doctor with email ${email} already exists!`);
      // Update password just in case
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      doctorExists.password = hashedPassword;
      await doctorExists.save();
      console.log(`✅ Doctor password updated to "${password}" successfully!`);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const defaultDoctor = new doctorModel({
      name: "Dr. Richard Harris",
      email,
      password: hashedPassword,
      image: "https://res.cloudinary.com/dae1bxuxp/image/upload/v1721028741/doc1.png",
      speciality: "General Physician",
      degree: "MBBS",
      experience: "5 Years",
      about: "Dr. Richard Harris has a strong commitment to delivering high-quality, patient-centered care. He is dedicated to helping patients live healthy lives.",
      available: true,
      fees: 500,
      slots_booked: {},
      address: { line1: "17th Cross, Richmond", line2: "Richmond Road, Bangalore" },
      date: Date.now(),
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      workingHours: ["Morning", "Afternoon"],
      timeSlots: ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30"],
      hospital: "Richmond General Clinic",
      languages: ["English", "Hindi"]
    });

    await defaultDoctor.save();
    console.log(`✅ Default doctor seeded successfully!`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedDoctor();
