import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { SettingsForms } from "@/components/settings-forms";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Store Settings
        </h1>
        <p className="mt-1 text-sm text-muted">
          Configure store details, delivery costs, payment bank account, and admin security.
        </p>
      </div>

      <SettingsForms settings={settings} />
    </div>
  );
}
