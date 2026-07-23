import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BookOpen, Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTranslation } from 'react-i18next';

export function Logbook({ user }: { user: any }) {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Supabase read error:", error.message, error.details);
          return;
        }

        console.log("Fetched logs from Supabase:", data); // Check browser console
        setLogs(data || []);
      } catch (err) {
        console.error("Unexpected fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("CrimeGPT Audit Logbook", 14, 15);

    const tableData = logs.map(log => [
      new Date(log.created_at).toLocaleString(),
      log.user_email || 'Unknown',
      log.action,
      log.ip_address || 'N/A'
    ]);

    autoTable(doc, {
      head: [['Timestamp', 'Officer Email', 'Action', 'IP Address']],
      body: tableData,
      startY: 20,
    });

    doc.save(`CrimeGPT_Audit_Logs_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (user?.role !== 'Administrator') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0F172A]">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-white font-['Outfit'] mb-2">Restricted Area</h2>
        <p className="text-slate-400 text-sm">Administrator clearance required to view audit logs.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6 bg-[#0F172A] overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 font-['Outfit'] flex items-center gap-2">
            <BookOpen size={24} className="text-blue-500" />
            {t("Logbook")}
          </h2>
          <p className="text-sm text-slate-400 mt-1">Immutable audit trail of system access and critical actions.</p>
        </div>
        
        <button
          onClick={handleDownloadPDF}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors"
        >
          <Download size={16} />
          Export PDF
        </button>
      </div>

      <div className="bg-[#1C2541]/40 border border-slate-800 rounded-xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-800/40 border-b border-slate-700/50 text-slate-300 text-sm">
                <th className="px-6 py-4 font-semibold">Timestamp</th>
                <th className="px-6 py-4 font-semibold">Officer Email</th>
                <th className="px-6 py-4 font-semibold">Action</th>
                <th className="px-6 py-4 font-semibold">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center">
                    <Loader2 className="w-6 h-6 text-slate-400 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400 text-sm">
                    No logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors text-sm text-slate-300">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-xs font-mono">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">
                      {log.user_email || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-blue-400">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                      {log.ip_address || 'N/A'}
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
