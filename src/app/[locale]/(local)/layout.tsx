import Footer from "@/components/footer";
import Header from "@/components/header";
import AnnouncementBanner from "@/components/sections/AnnouncementBanner";
import TopBarSpacer from "@/components/TopBarSpacer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnnouncementBanner />
      <Header />
      <TopBarSpacer />
      <div className="bg-background">{children}</div>
      <Footer />
    </>
  );
}
