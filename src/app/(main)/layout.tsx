import { Footer, Header } from "@/src/components";
import { getPropertyLandingData } from "@/src/features/property/servers";

const landingData = getPropertyLandingData();

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header hotline={landingData.hotline} />
      {children}
      <Footer hotline={landingData.hotline} />
    </>
  );
}