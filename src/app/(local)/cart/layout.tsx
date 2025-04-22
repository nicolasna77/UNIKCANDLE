function CartLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container  px-4 py-24 m-auto min-h-[calc(100vh_-_theme(spacing.16))] ">
      {children}
    </div>
  );
}

export default CartLayout;
