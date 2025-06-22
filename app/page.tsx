
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/header';
import CelesteProfile from '@/components/dashboard/celeste-profile';
import QuickStats from '@/components/dashboard/quick-stats';
import BodyComposition from '@/components/dashboard/body-composition';
import DataInputForm from '@/components/dashboard/data-input-form';
import ProgressChart from '@/components/charts/progress-chart';
import CompositionChart from '@/components/charts/composition-chart';
import { dataSyncManager } from '@/lib/data-sync';
import { HealthMetric } from '@/lib/types';
import { generateSampleData, celesteProfile } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [healthData, setHealthData] = useState<HealthMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Initialize with sample data if no data exists
        const localData = dataSyncManager.getLocalData();
        if (localData.length === 0) {
          const sampleData = generateSampleData();
          for (const item of sampleData) {
            await dataSyncManager.saveLocal(item);
          }
          setHealthData(sampleData);
        } else {
          setHealthData(localData);
        }

        // Try to sync from cloud
        const cloudData = await dataSyncManager.syncFromCloud();
        setHealthData(cloudData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Error al cargar los datos');
        // Fallback to sample data
        setHealthData(generateSampleData());
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Subscribe to real-time updates
    const unsubscribe = dataSyncManager.subscribeToCloudUpdates((data) => {
      setHealthData(data);
    });

    return unsubscribe;
  }, []);

  const handleDataUpdate = (newData: HealthMetric) => {
    setHealthData(prev => [newData, ...prev].slice(0, 50)); // Keep last 50 entries
  };

  const latestMetric = healthData[0];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-var(--bg-primary) flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-lg font-medium gradient-text">
            Cargando datos de Celeste...
          </p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Hero Section */}
            <div className="mb-8 text-center">
              <motion.h1
                className="text-3xl font-display font-bold mb-2 gradient-text"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Panel de Control Personalizado
              </motion.h1>
              <motion.p
                className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Monitoreo integral basado en tu perfil específico como bailarina de ballet folklórico argentino
              </motion.p>
            </div>

            {/* Profile Section */}
            <CelesteProfile />

            {/* Quick Stats */}
            <QuickStats latestMetric={latestMetric} />

            {/* Body Composition Metrics */}
            <BodyComposition latestMetric={latestMetric} />

            {/* Data Input Form */}
            <DataInputForm onDataUpdate={handleDataUpdate} />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ProgressChart
                data={healthData}
                title="Progreso de Peso"
                dataKey="weight"
                color="var(--warning-color)"
                unit=" kg"
                target={celesteProfile.targetWeight}
              />
              <ProgressChart
                data={healthData}
                title="Evolución del IMC"
                dataKey="imc"
                color="var(--primary-color)"
                unit=""
                target={24.5}
              />
              <ProgressChart
                data={healthData}
                title="Calidad del Sueño"
                dataKey="sleepHours"
                color="var(--info-color)"
                unit=" h"
                target={8}
              />
              <CompositionChart latestMetric={latestMetric} />
            </div>
          </motion.div>
        );
      
      case 'analytics':
        return (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="text-center py-20"
          >
            <h2 className="text-2xl font-bold gradient-text mb-4">
              📈 Análisis Avanzado
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Análisis detallado de progreso y tendencias - Próximamente
            </p>
          </motion.div>
        );
      
      case 'informe':
        return (
          <motion.div
            key="informe"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="text-center py-20"
          >
            <h2 className="text-2xl font-bold gradient-text mb-4">
              📋 Informe de Salud
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Generación de informes personalizados - Próximamente
            </p>
          </motion.div>
        );
      
      case 'tools':
        return (
          <motion.div
            key="tools"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="text-center py-20"
          >
            <h2 className="text-2xl font-bold gradient-text mb-4">
              🛠️ Herramientas
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Calculadoras y utilidades para danza - Próximamente
            </p>
          </motion.div>
        );
      
      case 'settings':
        return (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="text-center py-20"
          >
            <h2 className="text-2xl font-bold gradient-text mb-4">
              ⚙️ Configuración
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Preferencias y configuración de la aplicación - Próximamente
            </p>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-var(--bg-primary)">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>

      {/* Floating Action Button */}
      <motion.button
        className="floating-action"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        ⬆️
      </motion.button>
    </div>
  );
}
