import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage(props) {
  // Await searchParams as they are a Promise in Next.js 15+
  const searchParams = await props.searchParams;
  const impersonateDomain = searchParams?.domain;

  // 1. Get session token from HttpOnly cookies
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("spp_session")?.value;

  if (!sessionToken) {
    redirect("/login");
  }

  // 2. Verify JWT token
  const session = await verifyJWT(sessionToken);
  if (!session) {
    redirect("/login");
  }

  // 3. Resolve which website's telemetry to display
  let targetDomain = session.domain;
  
  // Allow Admin to impersonate other client domains
  if (session.role === "ADMIN" && impersonateDomain) {
    targetDomain = impersonateDomain.trim().toLowerCase();
  }

  // Fetch target website details
  const currentWebsite = await prisma.website.findUnique({
    where: { domain: targetDomain },
  });

  if (!currentWebsite) {
    // If target domain does not exist, fallback to logged in user's dashboard
    if (session.role === "ADMIN") {
      redirect("/dashboard");
    } else {
      redirect("/login");
    }
  }

  // 4. Fetch telemetry records for the target website
  const contactForms = await prisma.contactForm.findMany({
    where: { websiteId: currentWebsite.id },
    orderBy: { createdAt: "desc" },
  });

  const bookings = await prisma.booking.findMany({
    where: { websiteId: currentWebsite.id },
    orderBy: [
      { date: "desc" },
      { time: "desc" }
    ],
  });

  // Fetch API Key metadata (exclude hashes for security)
  const apiKeys = await prisma.websiteApiKey.findMany({
    where: { websiteId: currentWebsite.id },
    select: {
      id: true,
      name: true,
      createdAt: true,
      lastUsedAt: true,
      expiresAt: true,
    }
  });

  // 5. If Admin, fetch the list of all websites to populate the directory
  let allWebsites = [];
  if (session.role === "ADMIN") {
    allWebsites = await prisma.website.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  // Fetch Chatbot Knowledge
  const chatbotKnowledge = await prisma.chatbotKnowledge.findUnique({
    where: { websiteId: currentWebsite.id },
  });

  // Fetch User Notification Preferences for SSR
  let userNotificationPreference = null;
  try {
    userNotificationPreference = await prisma.userNotificationPreference.findUnique({
      where: { websiteId: currentWebsite.id },
    });
  } catch {
    // Graceful fallback if table is not yet created
  }

  // Fetch AI Usage Monthly
  const aiUsageRaw = await prisma.aiUsageMonthly.findMany({
    where: { websiteId: currentWebsite.id },
    orderBy: [
      { year: "desc" },
      { month: "desc" }
    ],
  });
  const aiUsage = aiUsageRaw.map(u => ({
    id: u.id,
    year: u.year,
    month: u.month,
    promptTokens: Number(u.promptTokens),
    completionTokens: Number(u.completionTokens),
    totalTokens: Number(u.totalTokens),
  }));

  // Fetch Notifications (Admin on spplabs.es sees all notifications; clients or impersonated view see global OR domain-specific notices)
  const isAdminMainDashboard = session.role === "ADMIN" && currentWebsite.domain === "spplabs.es";
  const rawNotifications = await prisma.notification.findMany({
    where: isAdminMainDashboard
      ? {}
      : {
          OR: [
            { websiteId: null },
            { websiteId: currentWebsite.id }
          ]
        },
    include: {
      website: {
        select: {
          id: true,
          domain: true,
          displayName: true,
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const notifications = rawNotifications.map(n => ({
    id: n.id,
    title: n.title,
    message: n.message,
    createdAt: n.createdAt,
    websiteId: n.websiteId,
    targetDomain: n.website?.domain || null,
    targetDisplayName: n.website?.displayName || null,
  }));

  // Fetch Support Requests / Petitions from PostgreSQL DB
  let supportRequests = [];
  if (currentWebsite.domain === "spplabs.es") {
    // Admin receives all petitions sent by client users
    const rawPetitions = await prisma.supportRequest.findMany({
      include: {
        website: {
          select: {
            domain: true,
            displayName: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    supportRequests = rawPetitions.map(p => ({
      id: p.id,
      title: p.title,
      message: p.message,
      createdAt: p.createdAt,
      websiteId: p.websiteId,
      domain: p.website?.domain || "Usuario",
      displayName: p.website?.displayName || "Cliente",
    }));
  } else {
    // Client user sees their own sent petitions
    const rawPetitions = await prisma.supportRequest.findMany({
      where: { websiteId: currentWebsite.id },
      orderBy: { createdAt: "desc" }
    });
    supportRequests = rawPetitions.map(p => ({
      id: p.id,
      title: p.title,
      message: p.message,
      createdAt: p.createdAt,
      websiteId: p.websiteId,
      domain: currentWebsite.domain,
      displayName: currentWebsite.displayName,
    }));
  }

  // Fetch AI Conversations (Admin on spplabs.es sees all client chats; client or impersonated view sees target site chats)
  const rawConversations = await prisma.chatConversation.findMany({
    where: isAdminMainDashboard ? {} : { websiteId: currentWebsite.id },
    include: {
      website: {
        select: {
          id: true,
          domain: true,
          displayName: true,
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  const initialConversations = rawConversations.map((c) => ({
    id: c.id,
    websiteId: c.websiteId,
    websiteDomain: c.website?.domain || currentWebsite.domain,
    websiteDisplayName: c.website?.displayName || currentWebsite.displayName,
    visitorId: c.visitorId,
    visitorName: c.visitorName || "Visitante",
    visitorEmail: c.visitorEmail || null,
    status: c.status,
    startedAt: c.startedAt.toISOString(),
    lastMessageAt: c.lastMessageAt.toISOString(),
    createdAt: c.startedAt.toISOString(),
    updatedAt: c.lastMessageAt.toISOString(),
    firstMessageSnippet: c.messages[0]?.content || "Conversación iniciada",
    messageCount: c.messages.length,
    messages: c.messages.map((m) => ({
      id: m.id,
      sender: m.sender,
      content: m.content,
      tokens: m.tokens,
      createdAt: m.createdAt.toISOString(),
    })),
  }));

  // Fetch Dashboard Notes / Directory
  const rawNotes = await prisma.dashboardNote.findMany({
    where: { websiteId: currentWebsite.id },
    orderBy: [
      { pinned: "desc" },
      { updatedAt: "desc" },
    ],
  });

  // Extract server tags catalog note if present
  const catalogNote = rawNotes.find((n) => n.role === "__SYSTEM_TAGS_CATALOG__");
  let serverCustomTags = [];
  if (catalogNote && catalogNote.content) {
    try {
      const parsed = JSON.parse(catalogNote.content);
      if (Array.isArray(parsed)) serverCustomTags = parsed;
    } catch {
      serverCustomTags = [];
    }
  }

  const dashboardNotes = rawNotes
    .filter((n) => n.role !== "__SYSTEM_TAGS_CATALOG__")
    .map((n) => ({
      id: n.id,
      websiteId: n.websiteId,
      type: n.type,
      title: n.title,
      content: n.content,
      email: n.email,
      phone: n.phone,
      role: n.role,
      tag: n.tag,
      color: n.color,
      pinned: n.pinned,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
    }));

  // Fetch Google Calendar Connection
  const rawGCal = await prisma.googleCalendarConnection.findUnique({
    where: { websiteId: currentWebsite.id },
    select: {
      id: true,
      googleAccountEmail: true,
      googleCalendarId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const googleCalendarConnection = rawGCal
    ? {
        id: rawGCal.id,
        googleAccountEmail: rawGCal.googleAccountEmail,
        googleCalendarId: rawGCal.googleCalendarId,
        createdAt: rawGCal.createdAt.toISOString(),
        updatedAt: rawGCal.updatedAt.toISOString(),
      }
    : null;

  // Fetch External Calendar Events imported from Google Calendar
  const rawExternalEvents = await prisma.externalCalendarEvent.findMany({
    where: { websiteId: currentWebsite.id },
    orderBy: { startDateTime: "asc" },
  });

  const externalCalendarEvents = rawExternalEvents.map((e) => ({
    id: e.id,
    googleEventId: e.googleEventId,
    title: e.title,
    description: e.description,
    startDateTime: e.startDateTime.toISOString(),
    endDateTime: e.endDateTime.toISOString(),
    isAllDay: e.isAllDay,
    status: e.status,
  }));

  // Fetch or initialize Dashboard State for this viewer on the target website
  let rawState = await prisma.websiteDashboardState.findUnique({
    where: {
      viewerWebsiteId_targetWebsiteId: {
        viewerWebsiteId: session.id,
        targetWebsiteId: currentWebsite.id,
      },
    },
  });

  const dashboardState = {
    lastContactView: rawState?.lastContactView?.toISOString() || null,
    lastBookingView: rawState?.lastBookingView?.toISOString() || null,
    lastNotificationView: rawState?.lastNotificationView?.toISOString() || null,
    lastSupportView: rawState?.lastSupportView?.toISOString() || null,
    lastAnalyticsView: rawState?.lastAnalyticsView?.toISOString() || null,
    lastConversationView: rawState?.lastConversationView?.toISOString() || null,
    viewedBookingIds: rawState?.viewedBookingIds || [],
  };

  const serializedCurrentWebsite = {
    ...currentWebsite,
    lastAnalyticsAt: currentWebsite.lastAnalyticsAt?.toISOString() || null,
  };

  const serializedNotificationPreferences = userNotificationPreference
    ? {
        ...userNotificationPreference,
        createdAt: userNotificationPreference.createdAt?.toISOString() || null,
        updatedAt: userNotificationPreference.updatedAt?.toISOString() || null,
      }
    : null;

  return (
    <DashboardClient
      session={session}
      allWebsites={allWebsites}
      currentWebsite={serializedCurrentWebsite}
      contactForms={contactForms}
      bookings={bookings}
      apiKeys={apiKeys}
      chatbotKnowledge={chatbotKnowledge}
      aiUsage={aiUsage}
      notifications={notifications}
      supportRequests={supportRequests}
      dashboardNotes={dashboardNotes}
      serverCustomTags={serverCustomTags}
      initialConversations={initialConversations}
      googleCalendarConnection={googleCalendarConnection}
      externalCalendarEvents={externalCalendarEvents}
      initialDashboardState={dashboardState}
      initialNotificationPreferences={serializedNotificationPreferences}
    />
  );
}
