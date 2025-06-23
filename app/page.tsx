'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
    LayoutDashboard, BarChart3, Utensils, HeartPulse, GraduationCap, 
    Target, Heart, Moon, Dumbbell, PlusCircle
} from 'lucide-react';

// --- CORE LOGIC AND DATA IMPORTS ---
import { dataSyncManager } from '@/lib/data-sync';
import { HealthMetric } from '@/lib/types';
import { calculateBMI, celesteProfile } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";

// --- REAL SHADCN UI COMPONENT IMPORTS ---
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';


// --- TYPE DEFINITIONS FOR COMPONENTS AND VIEWS ---
type ViewName = 'overview' | 'tracking' | 'nutrition' | 'training' | 'education';

interface SidebarProps {
    activeView: ViewName;
    setActiveView: React.Dispatch<React.SetStateAction<ViewName>>;
}

interface OverviewProps {
    progressData: HealthMetric[];
    setView: React.Dispatch<React.SetStateAction<ViewName>>;
}

// Define a more specific type for the data being added
type NewMetricData = Omit<HealthMetric, 'id' | 'synced' | 'lastModified' | 'imc'>;

interface ProgressTrackingProps {
    progressData: HealthMetric[];
    onAddData: (data: NewMetricData) => Promise<void>;
}


// --- SIDEBAR COMPONENT ---
const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
    const navItems = [
        { id: 'overview', label: 'Resumen General', icon: LayoutDashboard },
        { id: 'tracking', label: 'Seguimiento', icon: BarChart3 },
        { id: 'nutrition', label: 'Nutrición', icon: Utensils },
        { id: 'training', label: 'Entrenamiento', icon: HeartPulse },
        { id: 'education', label: 'Educación', icon: GraduationCap },
    ];

    return (
        <aside className="w-full md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Celeste<span className="text-amber-500">Dashboard</span></h2>
            </div>
            <nav className="p-2 md:p-4">
                <ul>
                    {navItems.map(item => (
                        <li key={item.id}>
                            <button
                                onClick={() => setActiveView(item.id as ViewName)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    activeView === item.id 
                                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' 
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};


// --- OVERVIEW COMPONENT ---
const Overview: React.FC<OverviewProps> = ({ progressData, setView }) => {
    const latestData = useMemo(() => progressData.length > 0 ? progressData[0] : null, [progressData]);

    if (!latestData) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                 <Card className="w-full max-w-lg p-8">
                    <CardHeader>
                        <CardTitle className="text-2xl">¡Bienvenida, Celeste!</CardTitle>
                        <CardDescription>Aún no hay datos registrados. Añade tu primer seguimiento para empezar.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => setView('tracking')} size="lg">
                            <PlusCircle className="mr-2 h-5 w-5" />
                            Añadir Nuevo Registro
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    const initialWeight = celesteProfile.currentWeight;
    const targetWeight = celesteProfile.targetWeight;
    const progressPercentage = Math.min(100, Math.max(0, ((initialWeight - latestData.weight) / (initialWeight - targetWeight)) * 100));

    return (
        <div className="grid gap-6 md:gap-8">
            <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                    <CardTitle>Progreso Hacia el Objetivo</CardTitle>
                    <CardDescription>Estás a { (latestData.weight - targetWeight).toFixed(1) } kg de tu meta.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <span className="font-medium">{initialWeight} kg</span>
                        <Progress value={progressPercentage} className="flex-1" />
                        <span className="font-bold text-amber-600">{targetWeight} kg</span>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Peso Actual</CardTitle>
                        <Target className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{latestData.weight} kg</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                           { (latestData.weight - initialWeight).toFixed(1) } kg desde el inicio
                        </p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">IMC</CardTitle>
                        <Heart className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{latestData.imc}</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Índice de Masa Corporal</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Horas de Sueño</CardTitle>
                        <Moon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{latestData.sleepHours} hs</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Última noche</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Entrenamiento</CardTitle>
                        <Dumbbell className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{latestData.trainingHours} hs</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Última semana</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};


// --- PROGRESS TRACKING COMPONENT ---
const ProgressTracking: React.FC<ProgressTrackingProps> = ({ progressData, onAddData }) => {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const newData: NewMetricData = {
            date: new Date(formData.get('date') as string),
            weight: parseFloat(formData.get('weight') as string),
            fatMass: parseFloat(formData.get('fatMass') as string),
            leanMass: parseFloat(formData.get('leanMass') as string),
            musclePercentage: parseFloat(formData.get('musclePercentage') as string),
            bonePercentage: parseFloat(formData.get('bonePercentage') as string),
            waterPercentage: parseFloat(formData.get('waterPercentage') as string),
            sleepHours: parseFloat(formData.get('sleepHours') as string),
            trainingHours: parseFloat(formData.get('trainingHours') as string),
            notes: formData.get('notes') as string,
        };

        if (isNaN(newData.weight) || newData.weight <= 0) {
             toast({ title: "Error de Validación", description: "Por favor, introduce un peso válido.", variant: "destructive" });
             return;
        }

        onAddData(newData);
        toast({ title: "¡Éxito!", description: "Nuevo registro añadido correctamente." });
        setIsDialogOpen(false);
    };

    const formattedData = useMemo(() => 
        progressData.map(d => ({
            ...d,
            name: new Date(d.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
        })).reverse(), 
    [progressData]);

    return (
        <div className="grid gap-6 md:gap-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl md:text-3xl font-bold">Seguimiento de Progreso</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2 h-4 w-4" />Añadir Registro</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Añadir Nuevo Registro</DialogTitle>
                            <DialogDescription>Completa los campos con tus métricas más recientes.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="date" className="text-right">Fecha</Label>
                                <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="weight" className="text-right">Peso (kg)</Label>
                                <Input id="weight" name="weight" type="number" step="0.1" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="fatMass" className="text-right">Masa Grasa (kg)</Label>
                                <Input id="fatMass" name="fatMass" type="number" step="0.1" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="leanMass" className="text-right">Masa Magra (kg)</Label>
                                <Input id="leanMass" name="leanMass" type="number" step="0.1" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="musclePercentage" className="text-right">Músculo (%)</Label>
                                <Input id="musclePercentage" name="musclePercentage" type="number" step="0.1" className="col-span-3" />
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="bonePercentage" className="text-right">Hueso (%)</Label>
                                <Input id="bonePercentage" name="bonePercentage" type="number" step="0.1" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="waterPercentage" className="text-right">Agua (%)</Label>
                                <Input id="waterPercentage" name="waterPercentage" type="number" step="0.1" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="sleepHours" className="text-right">Sueño (hs)</Label>
                                <Input id="sleepHours" name="sleepHours" type="number" step="0.5" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="trainingHours" className="text-right">Entrenamiento (hs)</Label>
                                <Input id="trainingHours" name="trainingHours" type="number" step="0.5" className="col-span-3" />
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="notes" className="text-right">Notas</Label>
                                <Input id="notes" name="notes" className="col-span-3" />
                            </div>
                            <DialogFooter>
                                <Button type="submit">Guardar Registro</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
             <Card>
                <CardHeader><CardTitle>Evolución del Peso</CardTitle></CardHeader>
                <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={formattedData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="weight" stroke="#8884d8" name="Peso (kg)" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
};

// --- NUTRITION PLAN COMPONENT ---
const NutritionPlan = () => (
    <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Plan de Nutrición</h1>
        <Card>
            <CardHeader>
                <CardTitle>Ejemplo de Menú Diario</CardTitle>
                <CardDescription>Adaptado a tus objetivos y consideraciones (sin gluten).</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Desayuno (8:00 AM)</AccordionTrigger>
                        <AccordionContent>Arepas de yuca con huevo revuelto y palta. Café con leche de almendras.</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>Almuerzo (1:00 PM)</AccordionTrigger>
                        <AccordionContent>Pechuga de pollo a la plancha con quinoa y ensalada de hojas verdes, tomate y zanahoria.</AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-3">
                        <AccordionTrigger>Merienda (5:00 PM)</AccordionTrigger>
                        <AccordionContent>Yogur griego con frutos rojos y un puñado de nueces.</AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-4">
                        <AccordionTrigger>Cena (9:00 PM)</AccordionTrigger>
                        <AccordionContent>Salmón al horno con batatas asadas y brócoli al vapor.</AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    </div>
);


// --- TRAINING PLAN COMPONENT ---
const TrainingPlan = () => (
    <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Entrenamiento y Recuperación</h1>
         <Card>
            <CardHeader>
                <CardTitle>Planificación Semanal</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="mb-4">Estructura de entrenamiento enfocada en el ballet folklórico, combinando técnica, fuerza y flexibilidad.</p>
                 <Accordion type="multiple" className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Técnica y Ensayo (3 veces/semana)</AccordionTrigger>
                        <AccordionContent>Lunes, Miércoles, Viernes: 2 horas de ensayo de coreografías, zapateo y técnica de pañuelo.</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>Fuerza y Acondicionamiento (2 veces/semana)</AccordionTrigger>
                        <AccordionContent>Martes y Jueves: Circuito de fuerza funcional. Foco en piernas (sentadillas, estocadas), core (planchas) y tren superior ligero.</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>Flexibilidad y Recuperación (Diario)</AccordionTrigger>
                        <AccordionContent>Rutina de 20 minutos de estiramientos post-entrenamiento. Sábado: Yoga o stretching profundo. Domingo: Descanso activo (caminata suave).</AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    </div>
);

// --- EDUCATION COMPONENT ---
const Education = () => (
     <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Centro de Educación</h1>
         <Card>
            <CardHeader><CardTitle>Recursos y Consejos</CardTitle></CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Manejo de la Fatiga</AccordionTrigger>
                        <AccordionContent>Asegura una correcta hidratación durante el día y considera un snack ligero rico en carbohidratos complejos 30-60 minutos antes de ensayar.</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>Nutrición para Bailarines (Sin Gluten)</AccordionTrigger>
                        <AccordionContent>Prioriza fuentes de carbohidratos como la batata, quinoa y arroz integral para energía sostenida. Las proteínas magras son clave para la reparación muscular.</AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    </div>
);


// --- MAIN DASHBOARD PAGE COMPONENT ---
export default function DashboardPage() {
    const [activeView, setActiveView] = useState<ViewName>('overview');
    const [healthData, setHealthData] = useState<HealthMetric[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadAndSubscribe = async () => {
            setIsLoading(true);
            try {
                const localData = dataSyncManager.getLocalData();
                setHealthData(localData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                await dataSyncManager.syncFromCloud();
            } catch (error) {
                console.error("Failed to load initial data:", error);
            } finally {
                setIsLoading(false);
            }
            const unsubscribe = dataSyncManager.subscribeToCloudUpdates((data) => {
                setHealthData(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            });
            return () => unsubscribe();
        };
        loadAndSubscribe();
    }, []);

    const handleAddData = async (newData: NewMetricData) => {
        const imc = calculateBMI(newData.weight, celesteProfile.height);
        const metricToAdd: HealthMetric = {
            id: Date.now().toString(),
            synced: false,
            lastModified: new Date(),
            ...newData,
            imc,
        };
        try {
            await dataSyncManager.saveLocal(metricToAdd);
        } catch (error) {
            console.error("Failed to save new data:", error);
        }
    };
    
    const renderContent = () => {
        if (isLoading && healthData.length === 0) {
            return (
                 <div className="space-y-4 p-8">
                    <Skeleton className="h-24 w-full" />
                    <div className="grid grid-cols-4 gap-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </div>
            )
        }
    
        switch (activeView) {
            case 'overview':
                return <Overview progressData={healthData} setView={setActiveView} />;
            case 'tracking':
                return <ProgressTracking progressData={healthData} onAddData={handleAddData} />;
            case 'nutrition':
                return <NutritionPlan />;
            case 'training':
                return <TrainingPlan />;
            case 'education':
                return <Education />;
            default:
                return <Overview progressData={healthData} setView={setActiveView} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
            <div className="flex flex-col md:flex-row min-h-screen">
                <Sidebar activeView={activeView} setActiveView={setActiveView} />
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}
