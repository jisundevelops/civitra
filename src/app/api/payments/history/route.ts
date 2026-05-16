import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (user.role !== "citizen") {
    return NextResponse.json({ error: "Access denied. Citizen role required." }, { status: 403 });
  }

  const payments = await db.payment.findMany({
    where: { citizenId: user.id },
    include: {
      violation: {
        include: {
          violationType: { select: { name: true } },
          vehicle: { select: { registrationNumber: true } },
        },
      },
    },
    orderBy: { paymentDate: "desc" },
  });

  const formatted = payments.map((payment) => ({
    id: payment.id,
    amount: payment.amount,
    receiptNumber: payment.receiptNumber,
    status: payment.status,
    paymentDate: payment.paymentDate,
    violation: {
      id: payment.violation.id,
      violationType: payment.violation.violationType.name,
      registrationNumber: payment.violation.vehicle.registrationNumber,
      location: payment.violation.location,
    },
  }));

  return NextResponse.json({ payments: formatted });
}
