'use client';

import { motion } from 'framer-motion';
import { celesteProfile } from '@/lib/utils';
import { Target, TrendingUp, Shield } from 'lucide-react';

export default function CelesteProfile() {
  return (
    <motion.div 
      className="card celeste-profile p-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-6 mb-6">
        <motion.div 
          className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          C
        </motion.div>
        <div>
          <h2 className="text-2xl font-display font-bold gradient-text">
            {celesteProfile.name}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {celesteProfile.profession}
          </p>
          {/* CORRECCIÓN: Se arreglaron los caracteres y se usaron emojis estándar */}
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span>🎂 {celesteProfile.age} años</span>
            <span>📏 {celesteProfile.height} cm</span>
            <span>🏆 {celesteProfile.experience} años de experiencia</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          className="objective-card p-4 rounded-lg"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-amber-600" />
            <h4 className="font-semibold text-amber-800 dark:text-amber-300">
              Objetivo Principal
            </h4>
          </div>
          <p className="text-sm">{celesteProfile.objectives[0]}</p>
        </motion.div>
        
        <motion.div 
          className="objective-card p-4 rounded-lg"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            <h4 className="font-semibold text-amber-800 dark:text-amber-300">
              Metas de Rendimiento
            </h4>
          </div>
          <p className="text-sm">{celesteProfile.objectives[1]}</p>
        </motion.div>
        
        <motion.div 
          className="objective-card p-4 rounded-lg"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-amber-600" />
            <h4 className="font-semibold text-amber-800 dark:text-amber-300">
              Consideraciones
            </h4>
          </div>
          <p className="text-sm">{celesteProfile.considerations.join(', ')}</p>
        </motion.div>
      </div>
    </motion.div>
  );
}