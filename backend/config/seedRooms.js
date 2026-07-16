import roomModel from "../models/roomModel.js"

const seedRooms = async () => {
    try {
        const count = await roomModel.countDocuments()
        if (count === 0) {
            const roomsToSeed = []

            // 1. General Ward (5 Rooms, Capacity 5 each)
            for (let i = 1; i <= 5; i++) {
                roomsToSeed.push({
                    roomNumber: `GW-${i}`,
                    category: "General Ward",
                    capacity: 5,
                    occupiedBeds: 0,
                    status: "Available",
                    patients: []
                })
            }

            // 2. ICU (3 Rooms, Capacity 1 each)
            for (let i = 1; i <= 3; i++) {
                roomsToSeed.push({
                    roomNumber: `ICU-${i}`,
                    category: "ICU",
                    capacity: 1,
                    occupiedBeds: 0,
                    status: "Available",
                    patients: []
                })
            }

            // 3. Semi Private / Twin Sharing (5 Rooms, Capacity 2 each)
            for (let i = 1; i <= 5; i++) {
                roomsToSeed.push({
                    roomNumber: `TS-${i}`,
                    category: "Semi Private / Twin Sharing",
                    capacity: 2,
                    occupiedBeds: 0,
                    status: "Available",
                    patients: []
                })
            }

            // 4. Private Room (5 Rooms, Capacity 1 each)
            for (let i = 1; i <= 5; i++) {
                roomsToSeed.push({
                    roomNumber: `PR-${i}`,
                    category: "Private Room",
                    capacity: 1,
                    occupiedBeds: 0,
                    status: "Available",
                    patients: []
                })
            }

            await roomModel.insertMany(roomsToSeed)
            console.log("✅ Room Management: Initial rooms seeded successfully.")
        } else {
            console.log("ℹ️ Room Management: Rooms already present in the database.")
        }
    } catch (error) {
        console.error("❌ Room Management: Seeding failed:", error.message)
    }
}

export default seedRooms
