import { PDFViewer } from '@react-pdf/renderer';
import { ReportePDF } from '../ReportePDF';
import { mockSnapshot } from '../mockSnapshot';

export default function TestPDF() {
  return (
    <div className="flex h-screen w-screen flex-col">
      <h1 className="m-0 bg-[#222] px-3 py-2 text-sm font-semibold text-white">
        Laboratorio de PDF
      </h1>
      <PDFViewer className="min-h-0 w-full flex-1 border-0">
        <ReportePDF snapshot={mockSnapshot} />
      </PDFViewer>
    </div>
  );
}
