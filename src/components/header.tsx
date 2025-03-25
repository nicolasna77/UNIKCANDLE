import Link from "next/link";

const Header = () => {
  return (
    <header className="bg-white">
      <div className="mx-auto flex h-16 max-w-screen-xl flex-1 items-center gap-8 px-4 sm:px-6 lg:px-8">
        <Link className="block text-primary-foreground font-bold" href="/">
          UNIKCANDLE
        </Link>
      </div>
    </header>
  );
};

export default Header;
