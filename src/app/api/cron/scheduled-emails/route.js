import { NextResponse } from "next/server";
import { dispatchPendingScheduledEmails } from "@/lib/emailCronWorker";

export async function GET(request) {
  return handleCronDispatch(request);
}

export async function POST(request) {
  return handleCronDispatch(request);
}

async function handleCronDispatch(request) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get("authorization");
    const secretParam = searchParams.get("secret");

    const expectedSecret = process.env.CRON_SECRET;
    if (expectedSecret && expectedSecret.trim() !== "") {
      const isAuthValid =
        secretParam === expectedSecret ||
        authHeader === `Bearer ${expectedSecret}`;
      if (!isAuthValid) {
        return NextResponse.json({ error: "Unauthorized", message: "Invalid cron secret" }, { status: 401 });
      }
    }

    const result = await dispatchPendingScheduledEmails();

    if (!result.success && result.error) {
      return NextResponse.json({ error: "DispatchError", message: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Cron scheduled-emails route error:", error);
    return NextResponse.json({ error: "InternalError", message: error.message }, { status: 500 });
  }
}

