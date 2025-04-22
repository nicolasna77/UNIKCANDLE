import ProfilMenu from "./profil-menu";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mt-16">
      <ProfilMenu />
      <main className="container m-auto min-h-[calc(100vh_-_theme(spacing.16))] py-12 px-4">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
