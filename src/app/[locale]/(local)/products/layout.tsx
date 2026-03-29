import Breadscrumb from "./breadcrumb";

function ProductsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container py-12 px-4 m-auto min-h-[calc(100vh-4rem)]">
      <div className="relative pb-8">
        <Breadscrumb />
      </div>
      {children}
    </div>
  );
}

export default ProductsLayout;
