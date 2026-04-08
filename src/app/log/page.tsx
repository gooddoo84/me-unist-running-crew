import { getMembers, addRunningLog } from "@/actions";
import { redirect } from "next/navigation";
import { LogForm } from "./log-form";

export default async function LogPage() {
  const members = await getMembers();

  async function handleSubmit(formData: FormData) {
    "use server";
    await addRunningLog(formData);
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <div className="pt-2">
        <h1 className="text-2xl font-extrabold tracking-tight">러닝 기록</h1>
        <p className="text-sm text-muted-foreground mt-1">
          오늘도 달렸나요? 기록을 남겨보세요! ✏️
        </p>
      </div>

      <LogForm members={members} action={handleSubmit} />
    </div>
  );
}
