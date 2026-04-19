import Footer from "@/components/footer";
import Header from "@/components/header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="bg-background pt-16">{children}</div>
      <Footer />
    </>
  );
}
