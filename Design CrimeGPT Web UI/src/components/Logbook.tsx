import React, { useState, useEffect, useContext } from "react";
import { supabase } from "@/lib/supabaseClient";
import { BookOpen, Download, Loader2, ShieldAlert, Trash2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { LanguageContext } from "../app/App";

export function Logbook({ user }: { user: any }) {
  const { t } = useContext(LanguageContext);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("audit_logs")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Supabase read error:", error.message, error.details);
          return;
        }

        setLogs(data || []);
      } catch (err) {
        console.error("Unexpected fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const handleDeleteLog = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this log? This action cannot be undone.");
    if (!confirmDelete) return;

    try {
      const { data, error } = await supabase
        .from('audit_logs') 
        .delete()
        .eq('id', id)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        alert("Could not delete log. Please check database RLS permissions.");
        return;
      }

      setLogs((prevLogs) => prevLogs.filter((log) => log.id !== id));
      
    } catch (err: any) {
      console.error("Failed to delete log:", err);
      alert(err.message || "Failed to delete log from database.");
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("CrimeGPT Audit Logbook", 14, 15);

    const tableData = logs.map((log) => [
      new Date(log.created_at).toLocaleString(),
      log.username || "Unknown",
      log.user_email || "Unknown",
      log.action,
      log.ip_address || "N/A",
    ]);

    autoTable(doc, {
      head: [
        [
          t("th_timestamp"),
          t("th_username"),
          t("th_officer_email"),
          t("th_action"),
          t("th_ip_address"),
        ],
      ],
      body: tableData,
      startY: 20,
    });

    doc.save(
      `CrimeGPT_Audit_Logs_${new Date().toISOString().split("T")[0]}.pdf`,
    );
  };

  if (user?.role !== "Administrator") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#0F172A]">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit'] mb-2">
          {t("restricted_area")}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm">{t("admin_clearance_logbook")}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6 bg-slate-50 dark:bg-[#0F172A] overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-['Outfit'] flex items-center gap-2">
            <BookOpen size={24} className="text-blue-500" />
            {t("logbook_title")}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t("logbook_sub")}</p>
        </div>

        <button
          onClick={handleDownloadPDF}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors"
        >
          <Download size={16} />
          {t("export_pdf")}
        </button>
      </div>

      <div className="bg-white dark:bg-[#1C2541]/40 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto overflow-y-auto flex-1 max-h-[calc(100vh-220px)]">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="sticky top-0 bg-slate-100 dark:bg-[#0F172A] z-10 shadow-md">
              <tr className="border-b border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 text-sm">
                <th className="px-6 py-4 font-semibold">{t("th_timestamp")}</th>
                <th className="px-6 py-4 font-semibold">{t("th_username")}</th>
                <th className="px-6 py-4 font-semibold">
                  {t("th_officer_email")}
                </th>
                <th className="px-6 py-4 font-semibold">{t("th_action")}</th>
                <th className="px-6 py-4 font-semibold">
                  {t("th_ip_address")}
                </th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <Loader2 className="w-6 h-6 text-slate-400 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-slate-600 dark:text-slate-400 text-sm"
                  >
                    {t("no_logs_found")}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-slate-200 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors text-sm text-slate-700 dark:text-slate-300"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400 text-xs font-mono">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">
                      {log.username || "Unknown"}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">
                      {log.user_email || "Unknown"}
                    </td>
                    <td className={`px-6 py-4 ${log.action?.includes('Failed') ? 'text-red-600 dark:text-red-500' : 'text-blue-600 dark:text-blue-400'}`}>{log.action}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                      {log.ip_address || "N/A"}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete Log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
