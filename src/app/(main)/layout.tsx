import { Footer, Header } from "@/src/components";
import { getPropertyLandingData } from "@/src/features/property/servers";
import { headers } from "next/headers";

const landingData = getPropertyLandingData();

type CurrentUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isVerified: boolean;
  status: string;
};

type MeResponse = {
  success: boolean;
  data?: CurrentUser;
};

async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const headerStore = await headers();
    const host =
      headerStore.get("x-forwarded-host") ?? headerStore.get("host");

    if (!host) {
      return null;
    }

    const protocol =
      headerStore.get("x-forwarded-proto") ??
      (process.env.NODE_ENV === "development" ? "http" : "https");

    const cookieHeader = headerStore.get("cookie") ?? "";

    const res = await fetch(`${protocol}://${host}/api/v1/auth/me`, {
      method: "GET",
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as MeResponse;

    if (!data.success || !data.data) {
      return null;
    }

    return data.data;
  } catch {
    return null;
  }
}

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  return (
    <>
      <Header hotline={landingData.hotline} currentUser={currentUser} />
      {children}
      <Footer hotline={landingData.hotline} />
    </>
  );
}