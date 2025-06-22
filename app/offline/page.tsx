
'use client';

import { motion } from 'framer-motion';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-var(--bg-primary) flex items-center justify-center p-4">
      <motion.div
        className="card p-8 text-center max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <WifiOff className="w-10 h-10 text-gray-500" />
        </motion.div>

        <motion.h1
          className="text-2xl font-bold gradient-text mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Sin Conexión
        </motion.h1>

        <motion.p
          className="text-gray-600 dark:text-gray-300 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          No tienes conexión a internet. Los datos se han guardado localmente y se sincronizarán cuando recuperes la conexión.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={handleRetry}
            className="btn btn-primary"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>

          <Link href="/" className="btn btn-secondary">
            <Home className="w-4 h-4" />
            Ir al Inicio
          </Link>
        </motion.div>

        <motion.div
          className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 <strong>Modo Offline Activo:</strong> Puedes seguir usando la aplicación. 
            Todos los cambios se guardarán y sincronizarán automáticamente cuando vuelvas a estar online.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
