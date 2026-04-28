import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Panneau image - desktop uniquement */}
      <div className="hidden lg:block relative overflow-hidden">
        <Image
          src="/asset/image00001.png"
          alt=""
          fill
          className="object-cover"
          priority
          quality={100}
        />
      </div>

      {/* Panneau formulaire */}
      <div className="flex flex-col items-center justify-center min-h-screen p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
