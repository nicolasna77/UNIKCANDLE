"use client";
import { PageHeader } from "@/components/page-header";
import { DisplayNameForm } from "./display-name-form";
import { authClient } from "@/lib/auth-client";
import ChangePasswordForm from "./change-password-form";
import DeleteAccountForm from "./delete-account-form";
import LoadingPage from "../loading";

export default function ProfilPage() {
  const { data: session, isPending } = authClient.useSession();
  return (
    <div className="space-y-2">
      <PageHeader
        title="Profil"
        description="Gérer vos informations personnelles."
      />
      {isPending && <LoadingPage />}
      {session?.user && (
        <>
          <DisplayNameForm session={session.user} isPending={isPending} />
          <ChangePasswordForm />
          <DeleteAccountForm />
        </>
      )}
    </div>
  );
}
