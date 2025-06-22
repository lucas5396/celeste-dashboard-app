
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { dataSyncManager } from '@/lib/data-sync';
import { validateHealthMetric, calculateBMI, formatDateForInput } from '@/lib/utils';
import { HealthMetric } from '@/lib/types';
import { Upload, Download, Save, Info } from 'lucide-react';
import toast from 'react-hot-toast';

interface DataInputFormProps {
  onDataUpdate: (data: HealthMetric) => void;
}

export default function DataInputForm({ onDataUpdate }: DataInputFormProps) {
  const [formData, setFormData] = useState({
    weight: 84.6,
    fatMass: 31.91,
    leanMass: 49.78,
    musclePercentage: 55.2,
    bonePercentage: 3.6,
    waterPercentage: 42.7,
    sleepHours: 6.0,
    trainingHours: 3.0,
    date: formatDateForInput(new Date()),
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const imc = calculateBMI(formData.weight, 170);
      const healthMetric: HealthMetric = {
        id: Date.now().toString(),
        date: new Date(formData.date),
        weight: formData.weight,
        fatMass: formData.fatMass,
        leanMass: formData.leanMass,
        musclePercentage: formData.musclePercentage,
        bonePercentage: formData.bonePercentage,
        waterPercentage: formData.waterPercentage,
        sleepHours: formData.sleepHours,
        trainingHours: formData.trainingHours,
        imc,
        notes: formData.notes,
        synced: false,
        lastModified: new Date()
      };

      // Validate data
      const errors = validateHealthMetric(healthMetric);
      if (errors.length > 0) {
        toast.error(errors.join(', '));
        return;
      }

      // Save data
      await dataSyncManager.saveLocal(healthMetric);
      onDataUpdate(healthMetric);
      
      toast.success('Datos actualizados correctamente');
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Error al guardar los datos');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = () => {
    try {
      const data = dataSyncManager.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `celeste-dashboard-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Datos exportados correctamente');
    } catch (error) {
      toast.error('Error al exportar los datos');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonData = event.target?.result as string;
        await dataSyncManager.importData(jsonData);
        toast.success('Datos importados correctamente');
        // Refresh the page or update state
        window.location.reload();
      } catch (error) {
        toast.error('Error al importar los datos');
      }
    };
    reader.readAsText(file);
  };

  const formFields = [
    {
      id: 'weight',
      label: 'Peso Actual (kg)',
      value: formData.weight,
      tooltip: 'Peso corporal actual. Meta: reducir 13.6 kg manteniendo masa muscular',
      target: 'Meta: 71 kg'
    },
    {
      id: 'fatMass',
      label: 'Masa Grasa (kg)',
      value: formData.fatMass,
      tooltip: 'Grasa subcutánea actual. Objetivo: reducir manteniendo salud'
    },
    {
      id: 'leanMass',
      label: 'Masa Magra (kg)',
      value: formData.leanMass,
      tooltip: 'Masa muscular a preservar/aumentar para fuerza y resistencia',
      target: 'Preservar'
    },
    {
      id: 'musclePercentage',
      label: 'Músculo (%)',
      value: formData.musclePercentage,
      tooltip: 'Porcentaje de masa muscular'
    },
    {
      id: 'bonePercentage',
      label: 'Hueso (%)',
      value: formData.bonePercentage,
      tooltip: 'Porcentaje de masa ósea'
    },
    {
      id: 'waterPercentage',
      label: 'Agua (%)',
      value: formData.waterPercentage,
      tooltip: 'Nivel de hidratación corporal'
    },
    {
      id: 'sleepHours',
      label: 'Horas de Sueño',
      value: formData.sleepHours,
      tooltip: 'Horas de sueño por noche',
      target: 'Optimizar calidad'
    },
    {
      id: 'trainingHours',
      label: 'Entrenamiento (h/semana)',
      value: formData.trainingHours,
      tooltip: 'Horas de entrenamiento por semana'
    }
  ];

  return (
    <motion.div
      className="card p-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold gradient-text">
          Actualizar Datos de Celeste
        </h3>
        <div className="flex gap-2">
          <label className="btn btn-secondary cursor-pointer">
            <Upload className="w-4 h-4" />
            Importar
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          <button
            onClick={handleExport}
            className="btn btn-secondary"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {formFields.map((field, index) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <label className="block text-sm font-medium mb-2">
                {field.label}
                {field.tooltip && (
                  <span className="tooltip ml-1" data-tooltip={field.tooltip}>
                    <Info className="w-3 h-3 text-gray-400 inline" />
                  </span>
                )}
              </label>
              <input
                type="number"
                value={field.value}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className="input-field"
                step="0.1"
                min="0"
                required
              />
              {field.target && (
                <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  {field.target}
                </div>
              )}
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: formFields.length * 0.05 }}
          >
            <label className="block text-sm font-medium mb-2">Fecha</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="input-field"
              required
            />
          </motion.div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Notas (opcional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="input-field resize-none"
            rows={3}
            placeholder="Ej: Día de ensayo intenso, cambio en rutina, etc."
          />
        </div>

        <motion.button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Save className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
          {isSubmitting ? 'Guardando...' : 'Actualizar Datos de Celeste'}
        </motion.button>
      </form>
    </motion.div>
  );
}
