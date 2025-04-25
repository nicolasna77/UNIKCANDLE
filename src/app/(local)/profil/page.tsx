"use client";
import { PageHeader } from "@/components/page-header";

// import { DeleteAccountForm } from "./delete-account-form";
import { DisplayNameForm } from "./display-name-form";
import { authClient } from "@/lib/auth-client";
import ChangePasswordForm from "./change-password-form";
import DeleteAccountForm from "./delete-account-form";
import Loading from "@/components/loading";
export default function ProfilPage() {
  const {
    data: session,
    isPending, //loading state
  } = authClient.useSession();
  return (
    <div className="space-y-2">
      <PageHeader
        title="Profile"
        description="Manage your personal information."
      />
      {isPending && <Loading />}
      {session?.user && (
        <>
          <DisplayNameForm session={session.user} isPending={isPending} />
          <ChangePasswordForm />
          <DeleteAccountForm />
        </>
      )}

      {/* <DeleteAccountForm session={session || ({} as User)} /> */}
    </div>
  );
}
