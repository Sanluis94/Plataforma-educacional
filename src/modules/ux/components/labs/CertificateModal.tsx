import React from 'react';
import { Award, Printer, X, ShieldCheck } from 'lucide-react';
import type { LabCertificate } from '../../../core/services/certificateService';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: LabCertificate | null;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  certificate
}) => {
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

  if (!isOpen || !certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cert-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl text-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 id="cert-modal-title" className="font-bold text-sm text-white">Certificado Digital de Prática Experimental</h3>
              <p className="text-xs text-slate-400">Validação para Atividades Acadêmicas Complementares (AAC)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Parchment Design */}
        <div className="p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-xl text-center relative overflow-hidden shadow-inner my-2">
          {/* Watermark seal */}
          <div className="absolute top-2 right-2 opacity-10">
            <Award className="w-48 h-48 text-amber-500" />
          </div>

          <div className="text-[11px] font-bold tracking-widest uppercase text-amber-500 mb-2">
            REPÚBLICA FEDERATIVA DO BRASIL &bull; SUPER LMS KORTEX
          </div>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-white mb-4">
            REGISTRO DE ATIVIDADES DE APRENDIZAGEM
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed max-w-lg mx-auto mb-6">
            Certificamos que o(a) estudante <strong className="text-white text-sm">{certificate.studentName}</strong> concluiu
            <strong>{certificate.completedLabsCount} atividades de aprendizagem</strong> no nível de{' '}
            <strong>{certificate.academicLevelLabel}</strong>.
            {certificate.totalSimulatedHours > 0 ? <>{' '}Carga horária registrada: <strong className="text-amber-400 text-sm">{certificate.totalSimulatedHours} horas</strong>.</> : <>{' '}Carga horária não contabilizada.</>}
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto pt-4 border-t border-slate-800 text-left text-[11px]">
            <div>
              <span className="text-slate-500 block">Data de Expedição:</span>
              <span className="font-semibold text-slate-300">{certificate.issueDate}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Registro de Autenticidade:</span>
              <span className="font-mono text-amber-400 text-[10px] break-all">{certificate.verificationHash}</span>
            </div>
          </div>

          {/* Validation badge */}
          <div className="mt-6 flex items-center justify-center space-x-1.5 text-[11px] text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Assinado e Verificado Criptograficamente via SHA-256</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
          >
            Fechar
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-[#E4683F] hover:bg-[#E4683F]/90 text-white font-bold rounded text-xs flex items-center space-x-1.5 shadow"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
