import React, { useState } from 'react';
import { FileSpreadsheet, Upload, Download, Check, X, Users } from 'lucide-react';

interface BatchClassManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  className: string;
  existingStudentsCount?: number;
  onImportStudents: (students: { name: string; email: string; enrollmentId?: string }[]) => void;
  onExportReportCsv: () => void;
}

export const BatchClassManagerModal: React.FC<BatchClassManagerModalProps> = ({
  isOpen,
  onClose,
  className,
  existingStudentsCount = 0,
  onImportStudents,
  onExportReportCsv
}) => {
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<{ name: string; email: string; enrollmentId?: string }[]>([]);
  const [statusMsg, setStatusMsg] = useState('');

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleParseCsv = (text: string) => {
    setCsvText(text);
    const lines = text.trim().split('\n');
    const result: { name: string; email: string; enrollmentId?: string }[] = [];

    lines.forEach((line, idx) => {
      if (!line.trim()) return;
      // Pula cabeçalho se contiver "nome" ou "email"
      if (idx === 0 && (line.toLowerCase().includes('nome') || line.toLowerCase().includes('name'))) return;

      const cols = line.split(/[,;\t]/).map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length >= 2) {
        result.push({
          name: cols[0],
          email: cols[1],
          enrollmentId: cols[2] || `MAT-${Math.floor(Math.random() * 9000 + 1000)}`
        });
      }
    });

    setParsedRows(result);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleParseCsv(content);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;
    onImportStudents(parsedRows);
    setStatusMsg(`Sucesso! ${parsedRows.length} estudantes importados para a turma.`);
    setTimeout(() => {
      setStatusMsg('');
      onClose();
    }, 1200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="batch-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-6 shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Gestão em Lote via Planilhas (CSV / Sheets)</h3>
              <p className="text-xs text-slate-400">Turma: <strong>{className}</strong> ({existingStudentsCount} alunos atuais)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Action */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg mb-4 flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-slate-200 block">Exportar Desempenho da Turma</span>
            <span className="text-slate-400 text-[11px]">Baixe notas, laboratórios concluídos e relatórios em formato CSV/Excel</span>
          </div>
          <button
            onClick={onExportReportCsv}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-semibold flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>

        {/* Import Area */}
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300">Importação em Massa de Alunos:</span>
            <label className="cursor-pointer text-[#E4683F] hover:underline flex items-center space-x-1">
              <Upload className="w-3.5 h-3.5" />
              <span>Selecionar Arquivo .csv</span>
              <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <textarea
            rows={4}
            value={csvText}
            onChange={e => handleParseCsv(e.target.value)}
            placeholder={`Cole os dados no formato (Nome, Email, Matrícula):\nAna Clara, ana@escola.edu.br, 202601\nBruno Silva, bruno@escola.edu.br, 202602\nCarlos Eduardo, carlos@escola.edu.br, 202603`}
            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-[#E4683F] resize-none"
          />

          {parsedRows.length > 0 && (
            <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded text-[11px] text-emerald-300 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Identificados <strong>{parsedRows.length} estudantes</strong> prontos para matrícula.</span>
              </div>
              <button
                onClick={handleConfirmImport}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded flex items-center space-x-1 shadow"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirmar Matrícula</span>
              </button>
            </div>
          )}

          {statusMsg && (
            <div className="p-2 bg-emerald-900/60 text-emerald-200 rounded text-center text-xs font-bold">
              {statusMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
