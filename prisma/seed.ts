import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.payment.deleteMany();
  await prisma.violation.deleteMany();
  await prisma.violationType.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  // --- Violation Types ---
  const violationTypes = await Promise.all([
    prisma.violationType.create({
      data: { name: "Signal Jump", description: "Jumping a red traffic signal", fineAmount: 500 },
    }),
    prisma.violationType.create({
      data: { name: "Over Speeding", description: "Exceeding the speed limit", fineAmount: 1000 },
    }),
    prisma.violationType.create({
      data: { name: "Wrong Parking", description: "Parking in a no-parking zone", fineAmount: 300 },
    }),
    prisma.violationType.create({
      data: { name: "No Helmet", description: "Riding a motorcycle without a helmet", fineAmount: 200 },
    }),
    prisma.violationType.create({
      data: { name: "No Seatbelt", description: "Driving without wearing a seatbelt", fineAmount: 200 },
    }),
    prisma.violationType.create({
      data: { name: "Phone While Driving", description: "Using a mobile phone while driving", fineAmount: 500 },
    }),
    prisma.violationType.create({
      data: { name: "Wrong Side", description: "Driving on the wrong side of the road", fineAmount: 800 },
    }),
    prisma.violationType.create({
      data: { name: "No Registration", description: "Driving an unregistered vehicle", fineAmount: 1500 },
    }),
  ]);
  console.log(`✅ Created ${violationTypes.length} violation types`);

  // --- Admin User ---
  const adminHash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      name: "System Admin",
      email: "admin@civitra.com",
      password: adminHash,
      phone: "01700000001",
      nid: "ADMIN001",
      role: "admin",
    },
  });
  console.log("✅ Created admin user");

  // --- Police Officers ---
  const officer1Hash = await bcrypt.hash("police123", 10);
  const officer2Hash = await bcrypt.hash("police123", 10);
  const [officer1, officer2] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Officer Rahman",
        email: "rahman@civitra.com",
        password: officer1Hash,
        phone: "01700000010",
        nid: "POL001",
        role: "police",
      },
    }),
    prisma.user.create({
      data: {
        name: "Officer Karim",
        email: "karim@civitra.com",
        password: officer2Hash,
        phone: "01700000011",
        nid: "POL002",
        role: "police",
      },
    }),
  ]);
  console.log("✅ Created 2 police officers");

  // --- Citizens with Vehicles ---
  const citizen1Hash = await bcrypt.hash("citizen123", 10);
  const citizen2Hash = await bcrypt.hash("citizen123", 10);
  const citizen3Hash = await bcrypt.hash("citizen123", 10);

  const [citizen1, citizen2, citizen3] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Ahmed Ali",
        email: "ahmed@civitra.com",
        password: citizen1Hash,
        phone: "01700000100",
        nid: "CIT001",
        role: "citizen",
      },
    }),
    prisma.user.create({
      data: {
        name: "Fatima Begum",
        email: "fatima@civitra.com",
        password: citizen2Hash,
        phone: "01700000101",
        nid: "CIT002",
        role: "citizen",
      },
    }),
    prisma.user.create({
      data: {
        name: "Rafiq Hasan",
        email: "rafiq@civitra.com",
        password: citizen3Hash,
        phone: "01700000102",
        nid: "CIT003",
        role: "citizen",
      },
    }),
  ]);
  console.log("✅ Created 3 citizens");

  // --- Vehicles ---
  const [vehicle1, vehicle2, vehicle3, vehicle4, vehicle5] = await Promise.all([
    prisma.vehicle.create({
      data: { registrationNumber: "DHA-1234", ownerId: citizen1.id, vehicleType: "Car" },
    }),
    prisma.vehicle.create({
      data: { registrationNumber: "DHA-5678", ownerId: citizen1.id, vehicleType: "Motorcycle" },
    }),
    prisma.vehicle.create({
      data: { registrationNumber: "CTG-9012", ownerId: citizen2.id, vehicleType: "Car" },
    }),
    prisma.vehicle.create({
      data: { registrationNumber: "SYL-3456", ownerId: citizen3.id, vehicleType: "Bus" },
    }),
    prisma.vehicle.create({
      data: { registrationNumber: "RAJ-7890", ownerId: citizen3.id, vehicleType: "Truck" },
    }),
  ]);
  console.log("✅ Created 5 vehicles");

  // --- Sample Violations ---
  const violations = await Promise.all([
    prisma.violation.create({
      data: {
        vehicleId: vehicle1.id,
        officerId: officer1.id,
        violationTypeId: violationTypes[0].id, // Signal Jump
        location: "Gulshan-2 Intersection, Dhaka",
        fineAmount: 500,
        status: "pending",
        notes: "Jumped red signal at 3:45 PM",
      },
    }),
    prisma.violation.create({
      data: {
        vehicleId: vehicle2.id,
        officerId: officer1.id,
        violationTypeId: violationTypes[3].id, // No Helmet
        location: "Banani Road-11, Dhaka",
        fineAmount: 200,
        status: "pending",
        notes: "Riding motorcycle without helmet",
      },
    }),
    prisma.violation.create({
      data: {
        vehicleId: vehicle3.id,
        officerId: officer2.id,
        violationTypeId: violationTypes[1].id, // Over Speeding
        location: "Airport Road, Dhaka",
        fineAmount: 1000,
        status: "paid",
        notes: "Speed recorded at 85 km/h in 60 km/h zone",
      },
    }),
    prisma.violation.create({
      data: {
        vehicleId: vehicle4.id,
        officerId: officer2.id,
        violationTypeId: violationTypes[2].id, // Wrong Parking
        location: "DIT Road, Sylhet",
        fineAmount: 300,
        status: "pending",
        notes: "Parked in no-parking zone near hospital",
      },
    }),
    prisma.violation.create({
      data: {
        vehicleId: vehicle1.id,
        officerId: officer2.id,
        violationTypeId: violationTypes[5].id, // Phone While Driving
        location: "Mirpur Road, Dhaka",
        fineAmount: 500,
        status: "paid",
        notes: "Using mobile phone while driving",
      },
    }),
    prisma.violation.create({
      data: {
        vehicleId: vehicle5.id,
        officerId: officer1.id,
        violationTypeId: violationTypes[6].id, // Wrong Side
        location: "Station Road, Rajshahi",
        fineAmount: 800,
        status: "pending",
        notes: "Driving on the wrong side of the road",
      },
    }),
    prisma.violation.create({
      data: {
        vehicleId: vehicle3.id,
        officerId: officer1.id,
        violationTypeId: violationTypes[4].id, // No Seatbelt
        location: "CDA Avenue, Chattogram",
        fineAmount: 200,
        status: "cancelled",
        notes: "Cancelled - evidence insufficient",
      },
    }),
  ]);
  console.log(`✅ Created ${violations.length} violations`);

  // --- Sample Payments for paid violations ---
  const paidViolations = violations.filter((v) => v.status === "paid");
  const payments = await Promise.all(
    paidViolations.map((violation, idx) => {
      const citizenId =
        violation.vehicleId === vehicle1.id
          ? citizen1.id
          : violation.vehicleId === vehicle2.id
          ? citizen1.id
          : violation.vehicleId === vehicle3.id
          ? citizen2.id
          : violation.vehicleId === vehicle4.id
          ? citizen3.id
          : citizen3.id;

      return prisma.payment.create({
        data: {
          violationId: violation.id,
          citizenId: citizenId,
          amount: violation.fineAmount,
          receiptNumber: `RCP-${Date.now()}-${idx + 1}`,
          status: "success",
        },
      });
    })
  );
  console.log(`✅ Created ${payments.length} payments`);

  console.log("\n🎉 Seeding completed successfully!");
  console.log("\n📋 Test Accounts:");
  console.log("   Admin:   admin@civitra.com / admin123");
  console.log("   Police:  rahman@civitra.com / police123");
  console.log("   Police:  karim@civitra.com / police123");
  console.log("   Citizen: ahmed@civitra.com / citizen123");
  console.log("   Citizen: fatima@civitra.com / citizen123");
  console.log("   Citizen: rafiq@civitra.com / citizen123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
