import Footer from "@/components/footer";
import Header from "@/components/header";
import TopBarSpacer from "@/components/TopBarSpacer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <TopBarSpacer />
      <div className="bg-background">{children}</div>
      <Footer />
    </>
  );
}
