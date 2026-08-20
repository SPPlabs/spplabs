import { prisma, withRLS } from "@/lib/prisma";

/**
 * Increment contact forms count for a given website and date (year/month).
 */
export async function incrementMonthlyContactForms(websiteId, date = new Date()) {
  if (!websiteId) return;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;

  try {
    const db = withRLS(websiteId);
    await db.websiteMonthlyMetrics.upsert({
      where: {
        websiteId_year_month: {
          websiteId,
          year,
          month,
        },
      },
      update: {
        contactFormsCount: { increment: 1 },
      },
      create: {
        websiteId,
        year,
        month,
        contactFormsCount: 1,
      },
    });
  } catch (error) {
    console.error("Failed to increment monthly contact forms metric:", error);
  }
}

/**
 * Increment bookings count for a given website and date.
 */
export async function incrementMonthlyBookings(websiteId, { date = new Date(), isOffHours = false, status = "PENDING" }) {
  if (!websiteId) return;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;

  const isConfirmed = status === "CONFIRMED";
  const isPending = status === "PENDING";

  try {
    const db = withRLS(websiteId);
    await db.websiteMonthlyMetrics.upsert({
      where: {
        websiteId_year_month: {
          websiteId,
          year,
          month,
        },
      },
      update: {
        totalBookingsCount: { increment: 1 },
        ...(isOffHours ? { offHoursBookings: { increment: 1 } } : {}),
        ...(isConfirmed ? { confirmedBookings: { increment: 1 } } : {}),
        ...(isPending ? { pendingBookings: { increment: 1 } } : {}),
      },
      create: {
        websiteId,
        year,
        month,
        totalBookingsCount: 1,
        offHoursBookings: isOffHours ? 1 : 0,
        confirmedBookings: isConfirmed ? 1 : 0,
        pendingBookings: isPending ? 1 : 0,
      },
    });
  } catch (error) {
    console.error("Failed to increment monthly bookings metric:", error);
  }
}

/**
 * Update booking status transitions (e.g., PENDING -> CONFIRMED).
 */
export async function updateMonthlyBookingStatus(websiteId, { date = new Date(), fromStatus, toStatus }) {
  if (!websiteId || !fromStatus || !toStatus || fromStatus === toStatus) return;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;

  try {
    const db = withRLS(websiteId);
    const updates = {};

    if (fromStatus === "PENDING") updates.pendingBookings = { decrement: 1 };
    if (fromStatus === "CONFIRMED") updates.confirmedBookings = { decrement: 1 };
    if (fromStatus === "CANCELLED") updates.cancelledBookings = { decrement: 1 };

    if (toStatus === "PENDING") updates.pendingBookings = { increment: 1 };
    if (toStatus === "CONFIRMED") updates.confirmedBookings = { increment: 1 };
    if (toStatus === "CANCELLED") updates.cancelledBookings = { increment: 1 };

    await db.websiteMonthlyMetrics.upsert({
      where: {
        websiteId_year_month: {
          websiteId,
          year,
          month,
        },
      },
      update: updates,
      create: {
        websiteId,
        year,
        month,
        confirmedBookings: toStatus === "CONFIRMED" ? 1 : 0,
        pendingBookings: toStatus === "PENDING" ? 1 : 0,
        cancelledBookings: toStatus === "CANCELLED" ? 1 : 0,
      },
    });
  } catch (error) {
    console.error("Failed to update monthly booking status metric:", error);
  }
}

/**
 * Increment chat conversations count for a given website and date.
 */
export async function incrementMonthlyChatConversations(websiteId, date = new Date()) {
  if (!websiteId) return;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;

  try {
    const db = withRLS(websiteId);
    await db.websiteMonthlyMetrics.upsert({
      where: {
        websiteId_year_month: {
          websiteId,
          year,
          month,
        },
      },
      update: {
        chatConversations: { increment: 1 },
      },
      create: {
        websiteId,
        year,
        month,
        chatConversations: 1,
      },
    });
  } catch (error) {
    console.error("Failed to increment monthly chat conversations metric:", error);
  }
}
