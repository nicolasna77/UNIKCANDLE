import Breadscrumb from "./breadcrumb";

function ProductsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container py-24 px-4 m-auto min-h-[calc(100vh_-_theme(spacing.16))] ">
      <div className="relative pb-8">
        <Breadscrumb />
      </div>
      {children}
    </div>
  );
}

export default ProductsLayout;
