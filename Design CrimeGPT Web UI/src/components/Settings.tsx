import React, { useState, useEffect, useContext } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ShieldAlert, Building2, Cpu, Lock, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { LanguageContext } from "../app/App";

type AuthUser = {
  id: string;
  name: string;
  role: string;
  email: string;
};

export function SystemSettings({ user }: { user: AuthUser }) {
  const { t, language, setLanguage } = useContext(LanguageContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    agency_name: "",
    default_language: "English",
    session_timeout_minutes: 30,
    require_mfa: false,
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from("system_settings")
          .select("*")
          .eq("id", 1)
          .single();

        if (error) {
          if (error.code !== "PGRST116") {
            console.error("Fetch settings error:", error);
            toast.error("Failed to load settings");
          }
        } else if (data) {
          setSettings({
            agency_name: data.agency_name || "",
            default_language: data.default_language || "English",
            session_timeout_minutes: data.session_timeout_minutes || 30,
            require_mfa: data.require_mfa || false,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    if (user.role === "Administrator") {
      fetchSettings();
    }
  }, [user.role]);

  if (user.role !== "Administrator") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-full text-red-400">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-bold text-slate-100 font-['Outfit']">
          {t("restricted_area")}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-md text-center font-['DM_Sans']">
          {t("admin_clearance_settings")}
        </p>
      </div>
    );
  }

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("system_settings")
        .update({
          agency_name: settings.agency_name,
          default_language: settings.default_language,
          session_timeout_minutes: settings.session_timeout_minutes,
          require_mfa: settings.require_mfa,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1);

      if (error) throw error;

      // Sync global language toggle from settings
      const langMap: Record<string, string> = {
        English: "en",
        Hindi: "hi",
        Gujarati: "gu",
      };
      const newLang = langMap[settings.default_language];
      if (newLang && newLang !== language) {
        setLanguage(newLang);
      }

      toast.success("System settings updated successfully.");
    } catch (error: any) {
      console.error("Save settings error:", error);
      toast.error(`Failed to save settings: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50 dark:bg-[#0F172A]"
      style={{ scrollbarWidth: "none" }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-['Outfit']">
          {t("settings_title")}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm font-['DM_Sans'] mt-1">
          {t("settings_sub")}
        </p>
      </div>

      <div className="max-w-4xl space-y-6 pb-20">
        {/* Agency Details */}
        <div className="bg-white dark:bg-[#1C2541]/40 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="bg-slate-800/40 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
              {t("agency_details")}
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("agency_name")}
              </label>
              <input
                type="text"
                value={settings.agency_name}
                onChange={(e) =>
                  setSettings({ ...settings, agency_name: e.target.value })
                }
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="e.g. ACCB Cyber Command"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("default_lang")}
              </label>
              <select
                value={settings.default_language}
                onChange={(e) =>
                  setSettings({ ...settings, default_language: e.target.value })
                }
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none"
              >
                <option value="English">English</option>
                <option value="Hindi">हिन्दी</option>
                <option value="Gujarati">ગુજરાતી</option>
              </select>
            </div>
            </div>
        </div>

        {/* Security & Compliance */}
        <div className="bg-white dark:bg-[#1C2541]/40 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="bg-slate-800/40 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
              {t("security_compliance")}
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("idle_timeout")}
              </label>
              <input
                type="number"
                min="5"
                max="1440"
                value={settings.session_timeout_minutes}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    session_timeout_minutes: parseInt(e.target.value) || 30,
                  })
                }
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
            <div className="space-y-2 flex flex-col justify-center pt-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={settings.require_mfa}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        require_mfa: e.target.checked,
                      })
                    }
                  />
                  <div
                    className={`block w-10 h-6 rounded-full transition-colors ${settings.require_mfa ? "bg-emerald-500" : "bg-slate-700"}`}
                  ></div>
                  <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.require_mfa ? "transform translate-x-4" : ""}`}
                  ></div>
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:text-white transition-colors">
                  {t("enforce_mfa")}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-slate-900 dark:text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? t("saving") : t("save_configuration")}
          </button>
        </div>
      </div>
    </div>
  );
}
