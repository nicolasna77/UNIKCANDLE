import { AdminTableSkeleton } from "@/components/skeleton/admin-table-skeleton";

export default function LoadingAdminOrders() {
  return <AdminTableSkeleton rows={10} columns={6} />;
}
