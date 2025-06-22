
import { HealthMetric } from './types';
import { exportToCSV, formatDate } from './utils';
import jsPDF from 'jspdf';

export class ExportManager {
  // Export to JSON
  static exportToJSON(data: HealthMetric[]): string {
    return JSON.stringify(data, null, 2);
  }

  // Export to CSV
  static exportToCSV(data: HealthMetric[]): string {
    return exportToCSV(data);
  }

  // Export to PDF
  static async exportToPDF(data: HealthMetric[], includeCharts = false): Promise<Blob> {
    const pdf = new jsPDF();
    
    // Title
    pdf.setFontSize(20);
    pdf.setTextColor(139, 90, 60); // Primary color
    pdf.text('Dashboard Elite - Celeste', 20, 30);
    pdf.setFontSize(14);
    pdf.setTextColor(107, 91, 79); // Secondary color
    pdf.text('Ballet Folklórico Argentino - Informe de Salud', 20, 45);
    
    // Date
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Generado: ${formatDate(new Date())}`, 20, 55);
    
    // Summary data
    if (data.length > 0) {
      const latest = data[0];
      let yPos = 75;
      
      pdf.setFontSize(16);
      pdf.text('Datos Actuales:', 20, yPos);
      yPos += 15;
      
      pdf.setFontSize(12);
      const summaryData = [
        `Peso: ${latest.weight} kg`,
        `IMC: ${latest.imc}`,
        `Masa Grasa: ${latest.fatMass} kg`,
        `Masa Magra: ${latest.leanMass} kg`,
        `Músculo: ${latest.musclePercentage}%`,
        `Hidratación: ${latest.waterPercentage}%`,
        `Sueño: ${latest.sleepHours} horas`,
        `Entrenamiento: ${latest.trainingHours} h/semana`
      ];
      
      summaryData.forEach((item, index) => {
        pdf.text(item, 20, yPos + (index * 8));
      });
      
      yPos += summaryData.length * 8 + 20;
      
      // Historical data table
      if (data.length > 1) {
        pdf.setFontSize(16);
        pdf.text('Historial (últimas 10 entradas):', 20, yPos);
        yPos += 15;
        
        pdf.setFontSize(8);
        const tableData = data.slice(0, 10);
        
        // Table headers
        const headers = ['Fecha', 'Peso', 'IMC', 'Sueño', 'Entrenamiento'];
        headers.forEach((header, index) => {
          pdf.text(header, 20 + (index * 35), yPos);
        });
        yPos += 10;
        
        // Table rows
        tableData.forEach((item, rowIndex) => {
          const row = [
            formatDate(item.date),
            `${item.weight}kg`,
            item.imc.toString(),
            `${item.sleepHours}h`,
            `${item.trainingHours}h`
          ];
          
          row.forEach((cell, colIndex) => {
            pdf.text(cell, 20 + (colIndex * 35), yPos + (rowIndex * 8));
          });
        });
      }
    }
    
    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text('Dashboard personalizado para bailarina de ballet folklórico', 20, 280);
    
    return pdf.output('blob');
  }

  // Download file helper
  static downloadFile(content: string | Blob, filename: string, mimeType: string) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Export with auto-generated filename
  static async export(
    data: HealthMetric[], 
    format: 'json' | 'csv' | 'pdf',
    includeCharts = false
  ): Promise<void> {
    const timestamp = new Date().toISOString().split('T')[0];
    const baseFilename = `celeste-dashboard-${timestamp}`;
    
    try {
      switch (format) {
        case 'json':
          const jsonContent = this.exportToJSON(data);
          this.downloadFile(jsonContent, `${baseFilename}.json`, 'application/json');
          break;
          
        case 'csv':
          const csvContent = this.exportToCSV(data);
          this.downloadFile(csvContent, `${baseFilename}.csv`, 'text/csv');
          break;
          
        case 'pdf':
          const pdfBlob = await this.exportToPDF(data, includeCharts);
          this.downloadFile(pdfBlob, `${baseFilename}.pdf`, 'application/pdf');
          break;
          
        default:
          throw new Error(`Formato no soportado: ${format}`);
      }
    } catch (error) {
      console.error('Error during export:', error);
      throw error;
    }
  }
}
