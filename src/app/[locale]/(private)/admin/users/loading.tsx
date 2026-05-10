import { AdminTableSkeleton } from "@/components/skeleton/admin-table-skeleton";

export default function LoadingAdminUsers() {
  return <AdminTableSkeleton rows={10} columns={5} />;
}
