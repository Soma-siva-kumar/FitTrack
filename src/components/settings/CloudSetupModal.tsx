import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useFitness } from '../../context/FitnessContext';
import { Cloud, CheckCircle2, AlertTriangle, RefreshCw, UploadCloud, Copy, ExternalLink } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudSetupModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { cloudStatus, refreshCloudStatus, syncLocalToCloud, isSaving } = useFitness();
  const [testing, setTesting] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleTestConnection = async () => {
    setTesting(true);
    await refreshCloudStatus();
    setTesting(false);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Google Sheets Cloud Storage Setup"
      subtitle="Connect FitTrack with your private Google Spreadsheet"
      maxWidth="xl"
    >
      <div className="space-y-5 text-sm">
        {/* Status Box */}
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 ${
            cloudStatus.connected
              ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
              : 'bg-amber-950/30 border-amber-800/80 text-amber-200'
          }`}
        >
          {cloudStatus.connected ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1">
            <div className="font-semibold text-white">
              {cloudStatus.connected
                ? 'Cloud Database Connected & Active'
                : 'Local Storage Mode Active (Cloud Unconfigured)'}
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {cloudStatus.connected
                ? `Successfully synced with Google Sheet ID: ${cloudStatus.sheetId || 'Configured'}. All updates persist directly to Google Sheets.`
                : 'FitTrack is currently storing data in your browser local storage. You can record workouts and food freely. To sync across your phone and laptop, follow the 4 setup steps below.'}
            </p>
            {cloudStatus.errorMessage && (
              <p className="text-xs text-rose-300 mt-1.5 font-mono bg-charcoal-900/60 p-2 rounded border border-rose-900/50">
                {cloudStatus.errorMessage}
              </p>
            )}
          </div>
        </div>

        {/* Setup Steps */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
            Step-by-Step Setup Guide
          </h4>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-800 space-y-1">
              <span className="font-semibold text-emerald-400">Step 1: Create a Google Sheet</span>
              <p>Create a blank Google Sheet in your Google Drive (e.g. named <code>FitTrack Database</code>). Copy the Sheet ID from its URL.</p>
              <div className="text-[11px] text-slate-400 font-mono">
                docs.google.com/spreadsheets/d/<strong>[SPREADSHEET_ID]</strong>/edit
              </div>
            </div>

            <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-800 space-y-1">
              <span className="font-semibold text-emerald-400">Step 2: Create a Google Cloud Service Account</span>
              <p>
                In Google Cloud Console, enable the <strong>Google Sheets API</strong>, create a Service Account, and download its JSON Key.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-800 space-y-1">
              <span className="font-semibold text-emerald-400">Step 3: Share the Sheet</span>
              <p>
                Open your Google Sheet, click <strong>Share</strong>, and paste your Service Account email with <strong>Editor</strong> permission.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-800 space-y-2">
              <span className="font-semibold text-emerald-400">Step 4: Configure Netlify Environment Variables</span>
              <p>In Netlify Site Settings &rarr; Environment variables, add these 3 variables:</p>

              <div className="space-y-1.5 font-mono text-[11px]">
                {[
                  { key: 'GOOGLE_SERVICE_ACCOUNT_EMAIL', desc: 'service-account@project.iam.gserviceaccount.com' },
                  { key: 'GOOGLE_PRIVATE_KEY', desc: '-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n' },
                  { key: 'GOOGLE_SHEET_ID', desc: 'Your 44-character spreadsheet ID from Step 1' },
                ].map(({ key, desc }) => (
                  <div key={key} className="flex items-center justify-between p-2 rounded bg-charcoal-900 border border-charcoal-800">
                    <div>
                      <div className="text-emerald-400 font-bold">{key}</div>
                      <div className="text-slate-400 text-[10px] truncate max-w-xs">{desc}</div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(key, key)}
                      className="p-1 hover:text-white text-slate-400"
                      title="Copy variable name"
                    >
                      {copiedKey === key ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-white font-medium text-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Testing...' : 'Test Cloud Connection'}</span>
          </button>

          {cloudStatus.connected && (
            <button
              onClick={syncLocalToCloud}
              disabled={isSaving}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition shadow-lg shadow-emerald-950/40"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Syncing...' : 'Sync Local Data to Cloud'}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 text-slate-300 text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
