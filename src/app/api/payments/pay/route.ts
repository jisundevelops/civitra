import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { sanitizeString } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (user.role !== "citizen") {
      return NextResponse.json({ error: "Access denied. Citizen role required." }, { status: 403 });
    }

    const body = await request.json();
    const { violation_id } = body;

    if (!violation_id) {
      return NextResponse.json({ error: "Violation ID is required" }, { status: 400 });
    }

    const sanitizedViolationId = sanitizeString(violation_id);

    // Find violation
    const violation = await db.violation.findUnique({
      where: { id: sanitizedViolationId },
      include: {
        vehicle: { include: { owner: true } },
      },
    });

    if (!violation) {
      return NextResponse.json({ error: "Violation not found" }, { status: 404 });
    }

    if (violation.status !== "pending") {
      return NextResponse.json({ error: "Violation is not pending. Cannot pay." }, { status: 400 });
    }

    // SECURITY: Verify the citizen owns the vehicle that received the violation
    if (!violation.vehicle.ownerId || violation.vehicle.ownerId !== user.id) {
      return NextResponse.json({ error: "You can only pay violations for your own vehicles" }, { status: 403 });
    }

    // Check if already paid (has a payment record)
    const existingPayment = await db.payment.findUnique({
      where: { violationId: violation.id },
    });

    if (existingPayment) {
      return NextResponse.json({ error: "Payment already exists for this violation" }, { status: 400 });
    }

    // Generate receipt number
    const receiptNumber = `RCP-${Date.now()}`;

    // Create payment and update violation status in a transaction
    const payment = await db.$transaction(async (tx) => {
      const newPayment = await tx.payment.create({
        data: {
          violationId: violation.id,
          citizenId: user.id,
          amount: violation.fineAmount,
          receiptNumber,
          status: "success",
        },
      });

      await tx.violation.update({
        where: { id: violation.id },
        data: { status: "paid" },
      });

      return newPayment;
    });

    return NextResponse.json({
      message: "Payment successful",
      receipt_number: payment.receiptNumber,
      amount: payment.amount,
    });
  } catch (error) {
    console.error("[PaymentsPay] error:", error);
    return NextResponse.json({ error: "An error occurred. Please try again." }, { status: 500 });
  }
}
