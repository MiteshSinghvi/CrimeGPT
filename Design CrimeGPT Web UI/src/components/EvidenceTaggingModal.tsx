import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabaseClient';
import { X, FileText, Download, Save, Copy, Loader2, ArrowRight, Database, UploadCloud, CheckCircle2, AlertTriangle, ShieldCheck, Tag } from 'lucide-react';
import { toast } from 'sonner';

export function EvidenceTaggingModal({
  isOpen,
  onClose,
  file,
  fileHash,
  cases,
  user,
  onSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
  fileHash: string;
  cases: any[];
  user: any;
  onSuccess: (newEvidence: any) => void;
}) {
  const [step, setStep] = useState(1);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [category, setCategory] = useState("");
  const [source, setSource] = useState("");
  const [notes, setNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedCaseId("");
      setCategory("");
      setSource("");
      setNotes("");
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handleUpload = async () => {
    if (!file) return;
    if (!selectedCaseId || !category || !source) {
      toast.error("Please fill all required fields (Case, Category, Source).");
      return;
    }

    setIsUploading(true);

    try {
      // 1. Create a clean, collision-free cloud file path
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const filePath = `${selectedCaseId}/${Date.now()}_${cleanFileName}`;

      // 2. Upload the physical file directly to the Supabase online storage bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('evidence-vault')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        if (uploadError.message.includes('bucket not found') || uploadError.message.includes('not found')) {
          throw new Error("Supabase Storage bucket 'evidence-vault' not found. Please create a public bucket named 'evidence-vault' in your Supabase dashboard!");
        }
        throw uploadError;
      }

      // 3. Get the online URL for downloading/viewing the evidence later
      const { data: { publicUrl } } = supabase.storage
        .from('evidence-vault')
        .getPublicUrl(filePath);

      // 4. Log the evidence metadata
      const payload: Record<string, any> = {
         filename: file.name,
         file_size: (file.size / (1024*1024)).toFixed(2) + " MB",
         sha256_hash: fileHash,
         user_id: user?.id || null,
         category: category || null,
         source: source || null,
         notes: notes || null,
         file_url: publicUrl
      };

      if (selectedCaseId) {
        payload.case_id = selectedCaseId;
      }

      const { data: newEvidence, error: dbError } = await supabase
        .from('evidence_metadata')
        .insert([payload])
        .select('*, cases(title, case_number)')
        .single();
      
      if (dbError) throw dbError;
      
      toast.success("Evidence fingerprinted, uploaded to cloud vault, and logged to chain of custody!");
      onSuccess(newEvidence);
      onClose();
    } catch (err: any) {
      if (err.message?.includes('row-level security')) {
        toast.error("Database RLS Error! Please run the SQL queries in 'fix_evidence_rls.sql' in your Supabase SQL Editor.");
      } else {
        toast.error(err.message || "Failed to upload evidence to cloud vault.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen || !file) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto w-screen h-screen">
      <div className="bg-[#1C2541] dark:bg-[#0B132B] border border-slate-700/50 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden anim-fadeup">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50 bg-[#0B132B]/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Outfit']">Evidence Tagging</h2>
              <p className="text-xs text-slate-400 font-mono">Sec 63 BSA Digital Integrity Lock</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: "thin" }}>
          <div className="space-y-6">
            
            {/* File Info Card */}
            <div className="bg-slate-800/40 border border-slate-600/30 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                 <div>
                    <p className="text-xs text-slate-400 font-mono mb-1">FILE NAME</p>
                    <p className="text-sm font-semibold text-white">{file.name}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-xs text-slate-400 font-mono mb-1">SIZE</p>
                    <p className="text-sm font-semibold text-white">{(file.size / (1024*1024)).toFixed(2)} MB</p>
                 </div>
              </div>
              <div className="mt-2 border-t border-slate-700/50 pt-3">
                 <p className="text-xs text-slate-400 font-mono mb-1">SHA-256 CRYPTOGRAPHIC HASH</p>
                 <p className="text-xs font-mono text-emerald-400 bg-slate-900 p-2 rounded break-all border border-emerald-900/50">
                   {fileHash}
                 </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {/* Case Link */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 font-['Outfit'] flex items-center gap-2">
                  <Database size={16} className="text-blue-400" /> Link to Case / FIR Number *
                </label>
                <select 
                  value={selectedCaseId} 
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Select related active case --</option>
                  {cases.map(c => {
                    const isUUID = (str: string) => str?.length === 36 && str?.includes('-');
                    const displayLabel = (c.id && !isUUID(c.id)) ? `FIR #${c.id} — ${c.title}` : (c.title || "Untitled Case");
                    return (
                      <option key={c.id} value={c.id}>
                        {displayLabel}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 font-['Outfit'] flex items-center gap-2">
                  <Tag size={16} className="text-emerald-400" /> Evidence Category *
                </label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">-- Select Category --</option>
                  <option value="Bank Statement / Financial Ledger">Bank Statement / Financial Ledger</option>
                  <option value="Call Data Record (CDR) / IPDR">Call Data Record (CDR) / IPDR</option>
                  <option value="Network Packet Capture (.pcap)">Network Packet Capture (.pcap)</option>
                  <option value="Screenshot / Social Media Media">Screenshot / Social Media Media</option>
                  <option value="Disk / Memory Dump (.img/.raw)">Disk / Memory Dump (.img/.raw)</option>
                  <option value="Audio / Video Recording">Audio / Video Recording</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Source */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 font-['Outfit'] flex items-center gap-2">
                  <UploadCloud size={16} className="text-amber-400" /> Seized From / Source *
                </label>
                <input 
                  type="text" 
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g., Suspect Laptop - Apple MacBook Pro or HDFC Nodal Officer"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 font-['Outfit']">
                  Brief Description / Notes
                </label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  placeholder="Enter details about this artifact..."
                />
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-700/50 bg-[#0B132B]/30 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleUpload}
            disabled={isUploading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #10b981, #047857)", boxShadow: "0 4px 15px rgba(16,185,129,0.3)" }}
          >
            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isUploading ? "Uploading file to secure cloud vault & logging SHA-256 hash..." : "Log to Evidence Vault"}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
