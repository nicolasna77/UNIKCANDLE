import Footer from "@/components/footer";
import Header from "@/components/header";
import AnnouncementBanner from "@/components/sections/AnnouncementBanner";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnnouncementBanner />
      <Header />
      <div className="bg-background pt-10">{children}</div>
      <Footer />
    </>
  );
}
