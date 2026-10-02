"use client";

import { useParams } from "next/navigation";
import { ManageCita } from "@/components/ManageCita";

export default function CitaTokenPage() {
  const params = useParams<{ token: string }>();
  const token = params.token ?? "";
  if (!token) return null;
  return <ManageCita token={token} />;
}
