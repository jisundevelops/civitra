import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

// Secret key to prevent unauthorized database resets
const SETUP_SECRET = process.env.JWT_SECRET || "civitra_super_secret_key_2024";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secret } = body;

    // Verify authorization
    if (secret !== SETUP_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔧 Starting database setup...");

    // Push schema (handled by prisma db push in build script)
    // This endpoint focuses on seeding data

    // Check if admin user already exists
    const existingAdmin = await db.user.findUnique({
      where: { email: "admin@civitra.com" },
    });

    if (existingAdmin) {
      return NextResponse.json({
        message: "Database already seeded. Use reset=true to re-seed.",
        userCount: await db.user.count(),
      });
    }

    // --- Violation Types ---
    const violationTypes = await Promise.all([
      db.violationType.create({
        data: { name: "Signal Jump", description: "Jumping a red traffic signal", fineAmount: 500 },
      }),
      db.violationType.create({
        data: { name: "Over Speeding", description: "Exceeding the speed limit", fineAmount: 1000 },
      }),
      db.violationType.create({
        data: { name: "Wrong Parking", description: "Parking in a no-parking zone", fineAmount: 300 },
      }),
      db.violationType.create({
        data: { name: "No Helmet", description: "Riding a motorcycle without a helmet", fineAmount: 200 },
      }),
      db.violationType.create({
        data: { name: "No Seatbelt", description: "Driving without wearing a seatbelt", fineAmount: 200 },
      }),
      db.violationType.create({
        data: { name: "Phone While Driving", description: "Using a mobile phone while driving", fineAmount: 500 },
      }),
      db.violationType.create({
        data: { name: "Wrong Side", description: "Driving on the wrong side of the road", fineAmount: 800 },
      }),
      db.violationType.create({
        data: { name: "No Registration", description: "Driving an unregistered vehicle", fineAmount: 1500 },
      }),
    ]);
    console.log(`✅ Created ${violationTypes.length} violation types`);

    // --- Admin User ---
    const adminHash = await hashPassword("admin123");
    const admin = await db.user.create({
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
    const officer1Hash = await hashPassword("police123");
    const officer2Hash = await hashPassword("police123");
    const [officer1, officer2] = await Promise.all([
      db.user.create({
        data: {
          name: "Officer Rahman",
          email: "rahman@civitra.com",
          password: officer1Hash,
          phone: "01700000010",
          nid: "POL001",
          role: "police",
        },
      }),
      db.user.create({
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

    // --- Citizens ---
    const citizen1Hash = await hashPassword("citizen123");
    const citizen2Hash = await hashPassword("citizen123");
    const citizen3Hash = await hashPassword("citizen123");
    const [citizen1, citizen2, citizen3] = await Promise.all([
      db.user.create({
        data: {
          name: "Ahmed Ali",
          email: "ahmed@civitra.com",
          password: citizen1Hash,
          phone: "01700000100",
          nid: "CIT001",
          citizenId: "CIV-2025-1001",
          role: "citizen",
        },
      }),
      db.user.create({
        data: {
          name: "Fatima Begum",
          email: "fatima@civitra.com",
          password: citizen2Hash,
          phone: "01700000101",
          nid: "CIT002",
          citizenId: "CIV-2025-1002",
          role: "citizen",
        },
      }),
      db.user.create({
        data: {
          name: "Rafiq Hasan",
          email: "rafiq@civitra.com",
          password: citizen3Hash,
          phone: "01700000102",
          nid: "CIT003",
          citizenId: "CIV-2025-1003",
          role: "citizen",
        },
      }),
    ]);
    console.log("✅ Created 3 citizens");

    // --- Vehicles ---
    const [vehicle1, vehicle2, vehicle3, vehicle4, vehicle5] = await Promise.all([
      db.vehicle.create({
        data: { registrationNumber: "DHA-1234", ownerId: citizen1.id, vehicleType: "Car" },
      }),
      db.vehicle.create({
        data: { registrationNumber: "DHA-5678", ownerId: citizen1.id, vehicleType: "Motorcycle" },
      }),
      db.vehicle.create({
        data: { registrationNumber: "CTG-9012", ownerId: citizen2.id, vehicleType: "Car" },
      }),
      db.vehicle.create({
        data: { registrationNumber: "SYL-3456", ownerId: citizen3.id, vehicleType: "Bus" },
      }),
      db.vehicle.create({
        data: { registrationNumber: "RAJ-7890", ownerId: citizen3.id, vehicleType: "Truck" },
      }),
    ]);
    console.log("✅ Created 5 vehicles");

    // --- Sample Violations ---
    const violations = await Promise.all([
      db.violation.create({
        data: {
          vehicleId: vehicle1.id,
          officerId: officer1.id,
          violationTypeId: violationTypes[0].id,
          location: "Gulshan-2 Intersection, Dhaka",
          fineAmount: 500,
          status: "pending",
          notes: "Jumped red signal at 3:45 PM",
        },
      }),
      db.violation.create({
        data: {
          vehicleId: vehicle2.id,
          officerId: officer1.id,
          violationTypeId: violationTypes[3].id,
          location: "Banani Road-11, Dhaka",
          fineAmount: 200,
          status: "pending",
          notes: "Riding motorcycle without helmet",
        },
      }),
      db.violation.create({
        data: {
          vehicleId: vehicle3.id,
          officerId: officer2.id,
          violationTypeId: violationTypes[1].id,
          location: "Airport Road, Dhaka",
          fineAmount: 1000,
          status: "paid",
          notes: "Speed recorded at 85 km/h in 60 km/h zone",
        },
      }),
      db.violation.create({
        data: {
          vehicleId: vehicle4.id,
          officerId: officer2.id,
          violationTypeId: violationTypes[2].id,
          location: "DIT Road, Sylhet",
          fineAmount: 300,
          status: "pending",
          notes: "Parked in no-parking zone near hospital",
        },
      }),
      db.violation.create({
        data: {
          vehicleId: vehicle1.id,
          officerId: officer2.id,
          violationTypeId: violationTypes[5].id,
          location: "Mirpur Road, Dhaka",
          fineAmount: 500,
          status: "paid",
          notes: "Using mobile phone while driving",
        },
      }),
      db.violation.create({
        data: {
          vehicleId: vehicle5.id,
          officerId: officer1.id,
          violationTypeId: violationTypes[6].id,
          location: "Station Road, Rajshahi",
          fineAmount: 800,
          status: "pending",
          notes: "Driving on the wrong side of the road",
        },
      }),
      db.violation.create({
        data: {
          vehicleId: vehicle3.id,
          officerId: officer1.id,
          violationTypeId: violationTypes[4].id,
          location: "CDA Avenue, Chattogram",
          fineAmount: 200,
          status: "cancelled",
          notes: "Cancelled - evidence insufficient",
        },
      }),
    ]);
    console.log(`✅ Created ${violations.length} violations`);

    // --- Sample Payments ---
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

        return db.payment.create({
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

    return NextResponse.json({
      message: "Database seeded successfully!",
      data: {
        users: 6,
        violationTypes: violationTypes.length,
        vehicles: 5,
        violations: violations.length,
        payments: payments.length,
      },
      testAccounts: {
        admin: "admin@civitra.com / admin123",
        police: "rahman@civitra.com / police123",
        citizen: "ahmed@civitra.com / citizen123",
      },
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      {
        error: "Database setup failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
