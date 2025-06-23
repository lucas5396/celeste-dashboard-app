'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { 
    LayoutDashboard, BarChart3, Utensils, HeartPulse, GraduationCap, ShieldCheck, BedDouble, Info,
    Target, Heart, Moon, Dumbbell, PlusCircle, Droplet, Brain, Wind, Activity, Atom, Pill
} from 'lucide-react';

// --- CORE LOGIC AND DATA IMPORTS ---
import { dataSyncManager } from '@/lib/data-sync';
import { HealthMetric, SleepData } from '@/lib/types'; // Asumiendo que SleepData se añadirá a types.ts
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


// --- TYPE DEFINITIONS ---
type ViewName = 'overview' | 'tracking' | 'nutrition' | 'training' | 'sleep_recovery' | 'supplements' | 'education';

interface SidebarProps {
    activeView: ViewName;
    setActiveView: React.Dispatch<React.SetStateAction<ViewName>>;
}

type NewMetricData = Omit<HealthMetric, 'id' | 'synced' | 'lastModified' | 'imc'>;

// --- DUMMY DATA FOR NEW FEATURES ---
const [latestSleep, setLatestSleep] = useState<SleepData | null>({ hours: 6, quality: 'cansada', date: new Date() });
const [hydration, setHydration] = useState(1.5); // Litros

// --- UI SUB-COMPONENTS (Modularized for clarity) ---

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
    const navItems = [
        { id: 'overview', label: 'Resumen General', icon: LayoutDashboard },
        { id: 'tracking', label: 'Seguimiento de Progreso', icon: BarChart3 },
        { id: 'nutrition', label: 'Plan de Nutrición', icon: Utensils },
        { id: 'training', label: 'Entrenamiento', icon: HeartPulse },
        { id: 'sleep_recovery', label: 'Sueño y Recuperación', icon: BedDouble },
        { id: 'supplements', label: 'Suplementación', icon: Pill },
        { id: 'education', label: 'Educación y Ciencia', icon: GraduationCap },
    ];

    return (
        <aside className="w-full md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Celeste<span className="text-amber-500">Dashboard</span></h2>
            </div>
            <nav className="p-2 md:p-4 space-y-1">
                {navItems.map(item => (
                    <Button
                        key={item.id}
                        variant={activeView === item.id ? 'secondary' : 'ghost'}
                        className="w-full justify-start gap-3"
                        onClick={() => setActiveView(item.id as ViewName)}
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                    </Button>
                ))}
            </nav>
        </aside>
    );
};

const Overview: React.FC<{ progressData: HealthMetric[], setView: React.Dispatch<React.SetStateAction<ViewName>> }> = ({ progressData, setView }) => {
    const latestData = useMemo(() => progressData.length > 0 ? progressData[0] : null, [progressData]);

    if (!latestData) return (
        <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-lg p-8 text-center">
                <CardHeader>
                    <CardTitle className="text-2xl">¡Bienvenida, Celeste!</CardTitle>
                    <CardDescription>Aún no hay datos. Añade tu primer registro para activar tu dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => setView('tracking')} size="lg"><PlusCircle className="mr-2 h-5 w-5" />Añadir Primer Registro</Button>
                </CardContent>
            </Card>
        </div>
    );
    
    const initialWeight = celesteProfile.currentWeight;
    const targetWeight = celesteProfile.targetWeight;
    const progressPercentage = Math.min(100, Math.max(0, ((initialWeight - latestData.weight) / (initialWeight - targetWeight)) * 100));
    
    const compositionData = [
        { name: 'Masa Grasa', value: latestData.fatMass, fill: '#ffc658' },
        { name: 'Masa Magra', value: latestData.leanMass, fill: '#8884d8' },
    ];

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Progreso Hacia el Objetivo de Peso</CardTitle>
                    <CardDescription>Meta: {targetWeight} kg. Estás a {(latestData.weight - targetWeight).toFixed(1)} kg de lograrlo.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-2">
                        <span className="text-sm font-medium text-gray-500">{initialWeight} kg</span>
                        <Progress value={progressPercentage} className="flex-1" />
                        <span className="text-sm font-bold text-amber-600">{targetWeight} kg</span>
                    </div>
                    <div className="text-center text-lg font-bold">{progressPercentage.toFixed(1)}% completado</div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Peso Actual</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{latestData.weight.toFixed(1)} kg</div>
                        <p className="text-xs text-green-600 dark:text-green-400">{(latestData.weight - progressData[progressData.length - 1].weight).toFixed(1)} kg desde el último registro</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Hidratación</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{hydration.toFixed(1)} / 3.0 L</div>
                        <Button size="sm" variant="outline" onClick={() => setHydration(h => h + 0.25)}><Droplet className="w-4 h-4 mr-2" />Añadir vaso</Button>
                    </CardContent>
                </Card>
                <Card>
                     <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Calidad del Sueño</CardTitle></CardHeader>
                     <CardContent>
                        <div className="text-3xl font-bold">{latestSleep?.hours || 'N/A'} hs</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Sensación: {latestSleep?.quality || 'N/A'}</p>
                     </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">IMC Actual</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{latestData.imc}</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Rango saludable: 18.5-24.9</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Composición Corporal</CardTitle>
                    <CardDescription>Visualización de tu masa grasa vs. masa magra.</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={compositionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {compositionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
};

const NutritionPlan: React.FC = () => (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold">Plan de Nutrición de Precisión</h1>
        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Enfoque Científico</AlertTitle>
            <AlertDescription>
                Como indica el informe, lograr tu objetivo de peso depende principalmente de ajustes dietéticos estratégicos, no solo del ejercicio. Esta sección te guiará.
            </AlertDescription>
        </Alert>
        <Card>
            <CardHeader><CardTitle>Objetivos de Macronutrientes Diarios</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <h4 className="font-semibold">Carbohidratos (55-60%)</h4>
                    <p className="text-2xl font-bold">250-420g</p>
                    <p className="text-xs text-gray-500">Tu principal fuente de energía.</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                    <h4 className="font-semibold">Proteínas (12-15%)</h4>
                    <p className="text-2xl font-bold">100-145g</p>
                    <p className="text-xs text-gray-500">Esenciales para reparar y construir músculo.</p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                    <h4 className="font-semibold">Grasas Saludables (20-35%)</h4>
                    <p className="text-2xl font-bold">~60-80g</p>
                    <p className="text-xs text-gray-500">Para energía sostenida y salud articular.</p>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Timing de Nutrientes: Qué y Cuándo Comer</CardTitle></CardHeader>
            <CardContent>
                <Tabs defaultValue="pre-entreno">
                    <TabsList>
                        <TabsTrigger value="pre-entreno">Antes de Entrenar</TabsTrigger>
                        <TabsTrigger value="durante-entreno">Durante</TabsTrigger>
                        <TabsTrigger value="post-entreno">Post-Entreno (Crítico)</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pre-entreno" className="pt-4">Comida ligera 1-2h antes, rica en carbohidratos. Ej: Avena sin gluten, plátano con mantequilla de almendras.</TabsContent>
                    <TabsContent value="durante-entreno" className="pt-4">Para sesiones de >1h, enfócate en hidratación con electrolitos y carbohidratos simples (30-45g/h).</TabsContent>
                    <TabsContent value="post-entreno" className="pt-4">Ventana de 30 min. ¡La más importante! Combina proteína y carbohidratos para reparar músculo y reponer energía. Ej: Batido de proteína con fruta, yogur griego con granola sin gluten.</TabsContent>
                </Tabs>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Menú Ejemplo (Sin Gluten)</CardTitle></CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {/* Accordion items... */}
                </Accordion>
            </CardContent>
        </Card>
    </div>
);

const TrainingPlan: React.FC = () => (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold">Entrenamiento y Mantenimiento Corporal</h1>
        <Alert>
            <Brain className="h-4 w-4" />
            <AlertTitle>Entrenamiento Inteligente: EPOC y Periodización</AlertTitle>
            <AlertDescription>
                El informe explica que la intensidad es clave. El entrenamiento HIIT genera un "efecto post-combustión" (EPOC) que quema calorías por horas. La periodización te ayuda a progresar sin sobreentrenar.
            </AlertDescription>
        </Alert>
         <Card>
            <CardHeader><CardTitle>Planificación Semanal Complementaria</CardTitle></CardHeader>
            <CardContent>
                <Accordion type="multiple" className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Fuerza y Acondicionamiento (2 veces/semana)</AccordionTrigger>
                        <AccordionContent>Circuitos de alta intensidad (HIIT) para maximizar EPOC. Foco en sentadillas, planchas, puentes de glúteos. Usar bandas de resistencia.</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>Cardio de Bajo Impacto (1-2 veces/semana)</AccordionTrigger>
                        <AccordionContent>Ciclismo o natación para mejorar la resistencia aeróbica que el ballet por sí solo no desarrolla, protegiendo las articulaciones.</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>Técnica y Flexibilidad (Diario)</AccordionTrigger>
                        <AccordionContent>Además del ensayo, dedicar 20 min a estiramientos y trabajo de movilidad. Incluir ejercicios de "Barra al Suelo" para la alineación.</AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    </div>
);

const SleepRecovery: React.FC = () => (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold">Sueño y Recuperación</h1>
        <Alert>
             <Moon className="h-4 w-4" />
             <AlertTitle>Tu Herramienta de Recuperación Más Potente</AlertTitle>
             <AlertDescription>
                 El informe es claro: dormir menos de 8 horas aumenta drásticamente el riesgo de lesiones. El sueño es donde tu cuerpo se repara y fortalece. Tu objetivo: 8-10 horas.
             </AlertDescription>
        </Alert>
        <Card>
            <CardHeader><CardTitle>Registro de Sueño</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                 {/* Dummy form, in a real app this would save data */}
                 <div className="grid gap-2"><Label htmlFor="sleep-hours">Horas Dormidas</Label><Input id="sleep-hours" type="number" defaultValue={latestSleep?.hours} /></div>
                 <div className="grid gap-2"><Label htmlFor="sleep-quality">¿Cómo te sentiste al despertar?</Label><Input id="sleep-quality" defaultValue={latestSleep?.quality} /></div>
                 <Button>Guardar Registro de Sueño</Button>
            </CardContent>
        </Card>
         <Card>
            <CardHeader><CardTitle>Técnicas de Recuperación Estratégica</CardTitle></CardHeader>
            <CardContent>
                 <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Baños de Sales de Epsom</AccordionTrigger>
                        <AccordionContent>Relajan los músculos, reducen la inflamación y mejoran la circulación. Ideal para después de ensayos intensos.</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>Rodillo de Espuma (Foam Rolling)</AccordionTrigger>
                        <AccordionContent>Libera la tensión en isquiotibiales, flexores de cadera y pantorrillas para mejorar la flexibilidad y reducir el dolor.</AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-3">
                        <AccordionTrigger>Recuperación Mental (Mindfulness)</AccordionTrigger>
                        <AccordionContent>El estrés mental impide la recuperación física. Dedica 5-10 minutos a ejercicios de respiración profunda o meditación guiada para calmar el sistema nervioso.</AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    </div>
);

const Supplements: React.FC = () => (
     <div className="space-y-6">
        <h1 className="text-3xl font-bold">Guía de Suplementación</h1>
        <Alert variant="destructive">
             <ShieldCheck className="h-4 w-4" />
             <AlertTitle>¡Importante! Consulta Profesional</AlertTitle>
             <AlertDescription>
                 Los suplementos deben complementar una dieta equilibrada, no reemplazarla. Consulta siempre a un médico o dietista antes de empezar a tomar cualquier suplemento.
             </AlertDescription>
        </Alert>
        <div className="grid md:grid-cols-2 gap-6">
            <Card><CardHeader><CardTitle>Proteína en Polvo</CardTitle></CardHeader><CardContent>Para asegurar la ingesta proteica post-entreno y acelerar la reparación muscular.</CardContent></Card>
            <Card><CardHeader><CardTitle>Omega-3 (Aceite de Pescado)</CardTitle></CardHeader><CardContent>Reduce la inflamación general y apoya la salud de tus articulaciones.</CardContent></Card>
            <Card><CardHeader><CardTitle>Vitamina D</CardTitle></CardHeader><CardContent>Esencial para la absorción del calcio y la salud ósea. Crucial por pasar mucho tiempo en interiores.</CardContent></Card>
            <Card><CardHeader><CardTitle>Magnesio</CardTitle></CardHeader><CardContent>Ayuda a la relajación muscular, previene calambres y mejora la calidad del sueño.</CardContent></Card>
            <Card><CardHeader><CardTitle>Calcio</CardTitle></CardHeader><CardContent>Fundamental para la densidad ósea y prevenir fracturas por estrés.</CardContent></Card>
            <Card><CardHeader><CardTitle>Suplementos Articulares</CardTitle></CardHeader><CardContent>Glucosamina, Condroitina y Colágeno pueden ayudar a mantener el cartílago sano.</CardContent></Card>
        </div>
    </div>
);


// --- MAIN DASHBOARD PAGE ---
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
            useToast().toast({ title: "¡Éxito!", description: "Registro guardado localmente y pendiente de sincronización." });
        } catch (error) {
            console.error("Failed to save new data:", error);
            useToast().toast({ title: "Error", description: "No se pudo guardar el registro.", variant: "destructive" });
        }
    };
    
    const renderContent = () => {
        if (isLoading && healthData.length === 0) {
            return (
                 <div className="space-y-6 p-8">
                    <Skeleton className="h-28 w-full" />
                    <div className="grid grid-cols-4 gap-6"><Skeleton className="h-28 w-full" /><Skeleton className="h-28 w-full" /><Skeleton className="h-28 w-full" /><Skeleton className="h-28 w-full" /></div>
                    <Skeleton className="h-64 w-full" />
                </div>
            )
        }
    
        switch (activeView) {
            case 'overview': return <Overview progressData={healthData} setView={setActiveView} />;
            case 'tracking': return <p>Progress Tracking Component Here...</p>; // Placeholder for ProgressTracking
            case 'nutrition': return <NutritionPlan />;
            case 'training': return <TrainingPlan />;
            case 'sleep_recovery': return <SleepRecovery />;
            case 'supplements': return <Supplements />;
            case 'education': return <p>Education Component Here...</p>; // Placeholder for Education
            default: return <Overview progressData={healthData} setView={setActiveView} />;
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

