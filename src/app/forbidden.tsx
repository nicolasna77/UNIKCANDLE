import Link from "next/link";
import { ShieldCheckIcon } from "lucide-react";

const Forbidden = () => {
  return (
    <div className="flex flex-col items-center  justify-center w-full min-h-[400px] py-12 space-y-4 md:space-y-8">
      <div className="flex flex-col items-center m-auto justify-center space-y-4">
        <div className="inline-flex items-center justify-center rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
          <ShieldCheckIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
        </div>
        <h1 className="text-3xl font-bold tracking-tighter">403 Forbidden</h1>
        <p className="max-w-[600px] text-center text-gray-500 md:text-xl/relaxed dark:text-gray-400">
          Vous n&apos;avez pas accès à cette ressource.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-md border  border-gray-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus-visible:ring-gray-300"
        prefetch={false}
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
};

export default Forbidden;
