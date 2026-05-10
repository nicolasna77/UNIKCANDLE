import { AdminTableSkeleton } from "@/components/skeleton/admin-table-skeleton";

export default function LoadingAdminProducts() {
  return <AdminTableSkeleton rows={8} columns={6} />;
}
