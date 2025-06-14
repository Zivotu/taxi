import React, { useState, useCallback, useEffect } from 'react';
import { DailyRecord, Shift } from '../types';
import { getTodayDateString } from '../utils/dateUtils';
import { calculateTotalWorkHours, calculateShiftDuration } from '../utils/timeUtils';

interface DataEntryFormProps {
  onSaveRecord: (record: DailyRecord) => void;
  existingDates: string[];
  recordToEdit: DailyRecord | null;
  onCancelEdit: () => void;
}

const InputField: React.FC<{
  label: string;
  id: string;
  type: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  min?: string | number;
  step?: string;
  className?: string;
  placeholder?: string;
  list?: string;
}> = ({ label, id, type, value, onChange, required = true, min = "0", step = "any", className = "", placeholder, list }) => (
  <div className={`mb-4 ${className}`}>
    <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      required={required}
      min={min}
      step={step}
      placeholder={placeholder}
      list={list}
      className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-slate-100 placeholder-slate-400"
    />
  </div>
);


export const DataEntryForm: React.FC<DataEntryFormProps> = ({ onSaveRecord, existingDates, recordToEdit, onCancelEdit }) => {
  const initialShift: Shift = { startTime: '', endTime: '' };
  const getInitialFormData = () => ({
    date: getTodayDateString(),
    grossRevenue: '',
    kilometers: '',
    fuelLiters: '',
    fuelCost: '',
    otherExpenses: '',
    numberOfRides: '',
  });

  const [formData, setFormData] = useState(getInitialFormData());
  const [shifts, setShifts] = useState<Shift[]>([initialShift]);
  const [error, setError] = useState<string | null>(null);
  const [shiftError, setShiftError] = useState<string | null>(null);

  useEffect(() => {
    if (recordToEdit) {
      setFormData({
        date: recordToEdit.date,
        grossRevenue: recordToEdit.grossRevenue.toString(),
        kilometers: recordToEdit.kilometers.toString(),
        fuelLiters: recordToEdit.fuelLiters.toString(),
        fuelCost: recordToEdit.fuelCost.toString(),
        otherExpenses: recordToEdit.otherExpenses.toString(),
        numberOfRides: recordToEdit.numberOfRides.toString(),
      });
      setShifts(recordToEdit.shifts.length > 0 ? recordToEdit.shifts.map(s => ({...s})) : [initialShift]);
      setError(null);
      setShiftError(null);
    } else {
      setFormData(getInitialFormData());
      setShifts([initialShift]);
      setError(null);
      setShiftError(null);
    }
  }, [recordToEdit]);


  const validateShifts = useCallback((currentShifts: Shift[]): string | null => {
    // Ako postoji samo jedna smjena i oba polja su prazna, smatraj validnim (korisnik možda ne želi unijeti smjenu)
    if (currentShifts.length === 1 && !currentShifts[0].startTime && !currentShifts[0].endTime) {
        return null;
    }

    for (const shift of currentShifts) {
      // Ako je jedno polje popunjeno, drugo mora biti također
      if ((shift.startTime && !shift.endTime) || (!shift.startTime && shift.endTime)) {
        return "Za svaku smjenu potrebno je unijeti i početno i završno vrijeme.";
      }
      // Ako su oba popunjena, provjeri valjanost
      if (shift.startTime && shift.endTime) {
        if (calculateShiftDuration(shift.startTime, shift.endTime) < 0) {
            return `Vrijeme završetka smjene (${shift.endTime}) ne može biti prije vremena početka (${shift.startTime}).`;
        }
      }
    }
    return null;
  }, []);
  
  useEffect(() => {
    setShiftError(validateShifts(shifts));
  }, [shifts, validateShifts]);


  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'date') {
        let isError = false;
        if (recordToEdit) { // Mod uređivanja
            if (value !== recordToEdit.date && existingDates.includes(value)) {
                isError = true;
            }
        } else { // Mod dodavanja
            if (existingDates.includes(value)) {
                isError = true;
            }
        }
        if (isError) {
            setError(`Zapis za ${value} već postoji. Molimo odaberite drugi datum.`);
        } else {
            setError(null);
        }
    }
  }, [existingDates, recordToEdit]);

  const handleShiftChange = useCallback((index: number, field: keyof Shift, value: string) => {
    setShifts(prevShifts => {
      const newShifts = prevShifts.map((s, i) => i === index ? { ...s, [field]: value } : s);
      return newShifts;
    });
  }, []);

  const addShift = useCallback(() => {
    setShifts(prevShifts => [...prevShifts, {...initialShift}]);
  }, []);

  const removeShift = useCallback((index: number) => {
    setShifts(prevShifts => prevShifts.filter((_, i) => i !== index));
  }, []);


  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let dateError = null;
    if (recordToEdit) {
        if (formData.date !== recordToEdit.date && existingDates.includes(formData.date)) {
            dateError = `Zapis za ${formData.date} već postoji. Molimo odaberite drugi datum.`;
        }
    } else {
        if (existingDates.includes(formData.date)) {
            dateError = `Zapis za ${formData.date} već postoji. Nemoguće dodati duplikat.`;
        }
    }
    if (dateError) {
        setError(dateError);
        return;
    }
    
    const currentShiftError = validateShifts(shifts);
    if (currentShiftError) {
        setShiftError(currentShiftError);
        return;
    }
    setError(null); // Clear date error if previously set and submit is now fine
    setShiftError(null);

    const grossRevenue = parseFloat(formData.grossRevenue) || 0;
    const fuelCost = parseFloat(formData.fuelCost) || 0;
    const otherExpenses = parseFloat(formData.otherExpenses) || 0;
    const netEarnings = grossRevenue - fuelCost - otherExpenses;
    
    const validShifts = shifts.filter(s => s.startTime && s.endTime);
    const totalWorkHours = calculateTotalWorkHours(validShifts);


    const recordData: DailyRecord = {
      id: recordToEdit ? recordToEdit.id : `${Date.now().toString()}-${Math.random().toString(36).substring(2, 9)}`,
      date: formData.date,
      grossRevenue,
      kilometers: parseFloat(formData.kilometers) || 0,
      fuelLiters: parseFloat(formData.fuelLiters) || 0,
      fuelCost,
      otherExpenses,
      shifts: validShifts,
      workHours: totalWorkHours,
      numberOfRides: parseInt(formData.numberOfRides, 10) || 0,
      netEarnings,
    };
    onSaveRecord(recordData);
    // Resetting form is handled by App.tsx navigating or by useEffect if recordToEdit becomes null
  }, [formData, onSaveRecord, existingDates, shifts, validateShifts, recordToEdit]);

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-slate-800 shadow-xl rounded-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-sky-400 mb-6">{recordToEdit ? 'Uredi Dnevni Zapis' : 'Unesi Dnevni Zapis'}</h2>
      {error && <div className="mb-4 p-3 bg-red-500 text-white rounded-md">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <InputField label="Datum" id="date" type="date" value={formData.date} onChange={handleChange} />
        <InputField label="Bruto Prihod (€)" id="grossRevenue" type="number" value={formData.grossRevenue} onChange={handleChange} placeholder="npr., 150.50"/>
        <InputField label="Prijeđeni Kilometri" id="kilometers" type="number" value={formData.kilometers} onChange={handleChange} placeholder="npr., 250"/>
        <InputField label="Potrošeno Goriva (Litre)" id="fuelLiters" type="number" value={formData.fuelLiters} onChange={handleChange} placeholder="npr., 20.5"/>
        <InputField label="Trošak Goriva (€)" id="fuelCost" type="number" value={formData.fuelCost} onChange={handleChange} placeholder="npr., 35.70"/>
        <InputField label="Ostali Troškovi (€)" id="otherExpenses" type="number" value={formData.otherExpenses} onChange={handleChange} placeholder="npr., 5.00"/>
        <InputField label="Broj Vožnji" id="numberOfRides" type="number" value={formData.numberOfRides} onChange={handleChange} min="0" step="1" placeholder="npr., 15"/>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-700">
        <h3 className="text-lg font-semibold text-slate-200 mb-3">Radne Smjene</h3>
        {shiftError && <div className="mb-3 p-2 bg-red-500/80 text-white text-sm rounded-md">{shiftError}</div>}
        {shifts.map((shift, index) => (
          <div key={index} className="flex items-end gap-x-3 mb-3 p-3 bg-slate-700/50 rounded-md">
            <InputField 
                label={`Smjena ${index + 1} Početak`} 
                id={`shift-start-${index}`} 
                type="time" 
                value={shift.startTime} 
                onChange={(e) => handleShiftChange(index, 'startTime', e.target.value)}
                className="mb-0 flex-grow"
                required={false} // Polja nisu obavezna ako korisnik ne želi unijeti smjenu
            />
            <InputField 
                label={`Smjena ${index + 1} Kraj`}
                id={`shift-end-${index}`}
                type="time"
                value={shift.endTime}
                onChange={(e) => handleShiftChange(index, 'endTime', e.target.value)}
                className="mb-0 flex-grow"
                required={false} // Polja nisu obavezna
            />
            {shifts.length > 1 && (
              <button 
                type="button" 
                onClick={() => removeShift(index)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md h-10 mb-0"
                aria-label={`Ukloni smjenu ${index + 1}`}
              >
                Ukloni
              </button>
            )}
          </div>
        ))}
        <button 
          type="button" 
          onClick={addShift}
          className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-md"
        >
          Dodaj Smjenu
        </button>
      </div>
      
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        {recordToEdit && (
            <button
            type="button"
            onClick={onCancelEdit}
            className="w-full sm:w-auto bg-slate-500 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
            >
            Odustani
            </button>
        )}
        <button 
            type="submit"
            disabled={!!error || !!shiftError}
            className="w-full flex-grow bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition duration-150 ease-in-out disabled:opacity-50"
        >
            {recordToEdit ? 'Ažuriraj Zapis' : 'Dodaj Zapis'}
        </button>
      </div>
    </form>
  );
};