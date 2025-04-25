"use client";

import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient, useSession } from "@/lib/auth-client";
import { User, LogOut, Mail, Calendar, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

const AuthButton = () => {
  const router = useRouter();
  const { data: session } = useSession();

  if (!session?.user) {
    return (
      <div className="flex gap-2">
        <Link
          href="/auth/signin"
          className={buttonVariants({ variant: "default" })}
        >
          S&apos;identifier
        </Link>
      </div>
    );
  }

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth/signin");
        },
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full hover:opacity-80 transition-opacity">
        <Avatar className="size-10 border-2 border-primary/10">
          <AvatarImage src={session.user.image || undefined} />
          <AvatarFallback className="bg-primary/5">
            {session.user.name
              ?.split(" ")
              .map((name) => name[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="flex flex-col space-y-1">
          <div className="flex items-center gap-2">
            <User className="size-4" />
            <span className="font-medium">{session.user.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="size-3" />
            <span>{session.user.email}</span>
          </div>
        </DropdownMenuLabel>
        {session.user.role === "admin" && (
          <>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/admin" className="flex items-center gap-2">
                <Shield className="size-4" />
                <span>Admin</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profil" className="flex items-center gap-2">
            <User className="size-4" />
            <span>Mon profil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profil/orders" className="flex items-center gap-2">
            <Calendar className="size-4" />
            <span>Mes commandes</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={handleSignOut}
          className="flex items-center gap-2"
        >
          <LogOut className="size-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AuthButton;
