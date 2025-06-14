import React, { useState, useCallback, useMemo } from 'react';
import { DataEntryForm } from './components/DataEntryForm';
import { MetricsDashboard } from './components/MetricsDashboard';
import { DailyRecord } from './types';
import { useAppStorage } from './hooks/useAppStorage';

// Ikone (jednostavni SVG-ovi za kartice)
const PlusCircleIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const ChartBarIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
);


const App: React.FC = () => {
  const [records, setRecords] = useAppStorage<DailyRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'entry' | 'dashboard'>('entry');
  const [recordToEdit, setRecordToEdit] = useState<DailyRecord | null>(null);

  const handleSaveRecord = useCallback((recordData: DailyRecord) => {
    setRecords(prevRecords => {
      const existingRecordIndex = prevRecords.findIndex(r => r.id === recordData.id);
      let updatedRecords;
      if (existingRecordIndex > -1) {
        // Ažuriranje postojećeg zapisa
        updatedRecords = [...prevRecords];
        updatedRecords[existingRecordIndex] = recordData;
      } else {
        // Dodavanje novog zapisa
        updatedRecords = [...prevRecords, recordData];
      }
      // Sortiraj po datumu silazno nakon dodavanja/ažuriranja
      updatedRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return updatedRecords;
    });
    setRecordToEdit(null); // Resetiraj zapis za uređivanje
    setActiveTab('dashboard'); // Prebaci na kontrolnu ploču nakon spremanja
  }, [setRecords]);

  const handleEditRecordRequest = useCallback((recordId: string) => {
    const record = records.find(r => r.id === recordId);
    if (record) {
      setRecordToEdit(record);
      setActiveTab('entry');
    }
  }, [records]);
  
  const handleCancelEdit = useCallback(() => {
    setRecordToEdit(null);
    setActiveTab('dashboard'); // Vrati na dashboard ili ostavi na formi, ovisno o željenom UX
  }, []);


  // existingDates se koristi za provjeru duplikata pri unosu/uređivanju
  const existingDates = useMemo(() => records.map(r => r.date), [records]);

  const TabButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }> = ({ isActive, onClick, children }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg focus:outline-none transition-colors duration-150
        ${isActive 
          ? 'bg-slate-800 text-sky-400 border-b-2 border-sky-400' 
          : 'text-slate-400 hover:text-sky-300 hover:bg-slate-700/50'
        }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      <header className="text-center mb-10">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
          TaxiLog
        </h1>
        <p className="text-slate-400 mt-2 text-lg">Vaš Osobni Dnevnik Taksi Poslovanja</p>
      </header>

      <div className="mb-8 border-b border-slate-700">
        <nav className="flex -mb-px space-x-1 justify-center">
          <TabButton isActive={activeTab === 'entry'} onClick={() => { setActiveTab('entry'); setRecordToEdit(null); /* Resetiraj edit mod ako se prebaci na entry tab manuano */ }}>
            <PlusCircleIcon />
            <span>Unos Podataka</span>
          </TabButton>
          <TabButton isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>
            <ChartBarIcon />
            <span>Kontrolna Ploča</span>
          </TabButton>
        </nav>
      </div>

      <main>
        {activeTab === 'entry' && (
            <DataEntryForm 
                onSaveRecord={handleSaveRecord} 
                existingDates={existingDates}
                recordToEdit={recordToEdit}
                onCancelEdit={handleCancelEdit}
            />
        )}
        {activeTab === 'dashboard' && (
            <MetricsDashboard 
                records={records} 
                onEditRecordRequest={handleEditRecordRequest}
            />
        )}
      </main>

      <footer className="text-center mt-12 py-6 border-t border-slate-700">
        <p className="text-sm text-slate-500">
          TaxiLog &copy; {new Date().getFullYear()}. Izrađeno s React & Tailwind CSS.
        </p>
      </footer>
    </div>
  );
};

export default App;