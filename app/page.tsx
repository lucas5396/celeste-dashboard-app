'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
    LayoutDashboard, BarChart3, Utensils, HeartPulse, GraduationCap, ShieldCheck, BedDouble, Info,
    Target, Heart, Moon, Dumbbell, PlusCircle, Droplet, Brain
} from 'lucide-react';

// --- CORE LOGIC AND DATA IMPORTS ---
import { dataSyncManager } from '@/lib/data-sync';
import { HealthMetric, SleepData } from '@/lib/types';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


// --- TYPE DEFINITIONS ---
type ViewName = 'overview' | 'tracking' | 'nutrition' | 'training' | 'sleep_recovery' | 'supplements' | 'education';
type NewMetricData = Omit<HealthMetric, 'id' | 'synced' | 'lastModified' | 'imc'>;

// --- UI SUB-COMPONENTS ---

const Sidebar: React.FC<{ activeView: ViewName, setActiveView: React.Dispatch<React.SetStateAction<ViewName>> }> = ({ activeView, setActiveView }) => {
    const navItems = [
        { id: 'overview', label: 'Resumen General', icon: LayoutDashboard },
        { id: 'tracking', label: 'Seguimiento', icon: BarChart3 },
        { id: 'nutrition', label: 'Nutrición', icon: Utensils },
        { id: 'training', label: 'Entrenamiento', icon: HeartPulse },
        { id: 'sleep_recovery', label: 'Sueño y Recuperación', icon: BedDouble },
        { id: 'supplements', label: 'Suplementación', icon: Pill },
        { id: 'education', label: 'Educación', icon: GraduationCap },
    ];
    return (
        <aside className="w-full md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700"><h2 className="text-xl font-bold text-gray-900 dark:text-white">Celeste<span className="text-amber-500">Dashboard</span></h2></div>
            <nav className="p-2 md:p-4 space-y-1">
                {navItems.map(item => (
                    <Button key={item.id} variant={activeView === item.id ? 'secondary' : 'ghost'} className="w-full justify-start gap-3" onClick={() => setActiveView(item.id as ViewName)}>
                        <item.icon className="w-5 h-5" /><span>{item.label}</span>
                    </Button>
                ))}
            </nav>
        </aside>
    );
};

const Overview: React.FC<{ progressData: HealthMetric[], setView: React.Dispatch<React.SetStateAction<ViewName>>, latestSleep: SleepData | null, hydration: number, setHydration: React.Dispatch<React.SetStateAction<number>> }> = ({ progressData, setView, latestSleep, hydration, setHydration }) => {
    const latestData = useMemo(() => progressData.length > 0 ? progressData[0] : null, [progressData]);
    if (!latestData) return (<div className="flex items-center justify-center h-full"><Card className="w-full max-w-lg p-8 text-center"><CardHeader><CardTitle className="text-2xl">¡Bienvenida, Celeste!</CardTitle><CardDescription>Aún no hay datos. Añade tu primer registro para activar tu dashboard.</CardDescription></CardHeader><CardContent><Button onClick={() => setView('tracking')} size="lg"><PlusCircle className="mr-2 h-5 w-5" />Añadir Primer Registro</Button></CardContent></Card></div>);
    const initialWeight = celesteProfile.currentWeight;
    const targetWeight = celesteProfile.targetWeight;
    const progressPercentage = Math.min(100, Math.max(0, ((initialWeight - latestData.weight) / (initialWeight - targetWeight)) * 100));
    const compositionData = [{ name: 'Masa Grasa', value: latestData.fatMass, fill: '#ffc658' }, { name: 'Masa Magra', value: latestData.leanMass, fill: '#8884d8' }];
    return (
        <div className="grid gap-6">
            <Card><CardHeader><CardTitle>Progreso Hacia el Objetivo de Peso</CardTitle><CardDescription>Meta: {targetWeight} kg. Estás a {(latestData.weight - targetWeight).toFixed(1)} kg de lograrlo.</CardDescription></CardHeader><CardContent><div className="flex items-center gap-4 mb-2"><span className="text-sm font-medium text-gray-500">{initialWeight} kg</span><Progress value={progressPercentage} className="flex-1" /><span className="text-sm font-bold text-amber-600">{targetWeight} kg</span></div><div className="text-center text-lg font-bold">{progressPercentage.toFixed(1)}% completado</div></CardContent></Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Peso Actual</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{latestData.weight.toFixed(1)} kg</div><p className="text-xs text-green-600 dark:text-green-400">{(latestData.weight - (progressData[1]?.weight || initialWeight)).toFixed(1)} kg desde el último registro</p></CardContent></Card><Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Hidratación</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{hydration.toFixed(1)} / 3.0 L</div><Button size="sm" variant="outline" onClick={() => setHydration(h => h + 0.25)}><Droplet className="w-4 h-4 mr-2" />Añadir vaso</Button></CardContent></Card><Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Calidad del Sueño</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{latestSleep?.hours || 'N/A'} hs</div><p className="text-xs text-gray-500 dark:text-gray-400">Sensación: {latestSleep?.quality || 'N/A'}</p></CardContent></Card><Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">IMC Actual</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{latestData.imc}</div><p className="text-xs text-gray-500 dark:text-gray-400">Rango saludable: 18.5-24.9</p></CardContent></Card></div>
            <Card><CardHeader><CardTitle>Composición Corporal</CardTitle><CardDescription>Visualización de tu masa grasa vs. masa magra.</CardDescription></CardHeader><CardContent className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={compositionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{compositionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></CardContent></Card>
        </div>);
};

const ProgressTracking: React.FC<{ progressData: HealthMetric[], onAddData: (data: NewMetricData) => void }> = ({ progressData, onAddData }) => {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const newData: NewMetricData = {
            date: new Date(formData.get('date') as string),
            weight: parseFloat(formData.get('weight') as string),
            fatMass: parseFloat(formData.get('fatMass') as string) || 0,
            leanMass: parseFloat(formData.get('leanMass') as string) || 0,
            musclePercentage: parseFloat(formData.get('musclePercentage') as string) || 0,
            bonePercentage: parseFloat(formData.get('bonePercentage') as string) || 0,
            waterPercentage: parseFloat(formData.get('waterPercentage') as string) || 0,
            sleepHours: parseFloat(formData.get('sleepHours') as string) || 0,
            trainingHours: parseFloat(formData.get('trainingHours') as string) || 0,
            notes: formData.get('notes') as string,
        };
        if (isNaN(newData.weight) || newData.weight <= 0) { toast({ title: "Error de Validación", description: "Por favor, introduce un peso válido.", variant: "destructive" }); return; }
        onAddData(newData);
        setIsDialogOpen(false);
    };
    const formattedData = useMemo(() => progressData.map(d => ({ ...d, name: new Date(d.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })})).reverse(), [progressData]);
    return (
        <div className="grid gap-6"><div className="flex justify-between items-center"><h1 className="text-3xl font-bold">Seguimiento de Progreso</h1><Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}><DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" />Añadir Registro</Button></DialogTrigger><DialogContent className="sm:max-w-[425px]"><DialogHeader><DialogTitle>Añadir Nuevo Registro</DialogTitle><DialogDescription>Completa los campos con tus métricas más recientes.</DialogDescription></DialogHeader><form onSubmit={handleSubmit} className="grid gap-4 py-4"><div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="date" className="text-right">Fecha</Label><Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="col-span-3" /></div><div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="weight" className="text-right">Peso (kg)</Label><Input id="weight" name="weight" type="number" step="0.1" className="col-span-3" required /></div><div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="fatMass" className="text-right">Masa Grasa (kg)</Label><Input id="fatMass" name="fatMass" type="number" step="0.1" className="col-span-3" /></div><div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="leanMass" className="text-right">Masa Magra (kg)</Label><Input id="leanMass" name="leanMass" type="number" step="0.1" className="col-span-3" /></div><div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="sleepHours" className="text-right">Sueño (hs)</Label><Input id="sleepHours" name="sleepHours" type="number" step="0.5" className="col-span-3" /></div><div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="notes" className="text-right">Notas</Label><Input id="notes" name="notes" className="col-span-3" /></div><DialogFooter><Button type="submit">Guardar Registro</Button></DialogFooter></form></DialogContent></Dialog></div>
            <Card><CardHeader><CardTitle>Evolución del Peso</CardTitle></CardHeader><CardContent className="h-80"><ResponsiveContainer width="100%" height="100%"><LineChart data={formattedData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis domain={['dataMin - 2', 'dataMax + 2']} /><Tooltip /><Legend /><Line type="monotone" dataKey="weight" stroke="#8b5cf6" name="Peso (kg)" activeDot={{ r: 8 }} /></LineChart></ResponsiveContainer></CardContent></Card>
        </div>);
};

const NutritionPlan: React.FC = () => (
    <div className="space-y-6"><h1 className="text-3xl font-bold">Plan de Nutrición de Precisión</h1><Alert><Info className="h-4 w-4" /><AlertTitle>Enfoque Científico</AlertTitle><AlertDescription>Lograr tu objetivo de peso depende principalmente de ajustes dietéticos estratégicos, no solo del ejercicio.</AlertDescription></Alert><Card><CardHeader><CardTitle>Objetivos de Macronutrientes Diarios</CardTitle></CardHeader><CardContent className="grid md:grid-cols-3 gap-4 text-center"><div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg"><h4 className="font-semibold">Carbohidratos (55-60%)</h4><p className="text-2xl font-bold">250-420g</p><p className="text-xs text-gray-500">Tu principal fuente de energía.</p></div><div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg"><h4 className="font-semibold">Proteínas (12-15%)</h4><p className="text-2xl font-bold">100-145g</p><p className="text-xs text-gray-500">Para reparar y construir músculo.</p></div><div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg"><h4 className="font-semibold">Grasas Saludables (20-35%)</h4><p className="text-2xl font-bold">~60-80g</p><p className="text-xs text-gray-500">Para energía sostenida y salud articular.</p></div></CardContent></Card><Card><CardHeader><CardTitle>Timing de Nutrientes</CardTitle></CardHeader><CardContent><Tabs defaultValue="pre-entreno"><TabsList><TabsTrigger value="pre-entreno">Antes</TabsTrigger><TabsTrigger value="durante-entreno">Durante</TabsTrigger><TabsTrigger value="post-entreno">Post (Crítico)</TabsTrigger></TabsList><TabsContent value="pre-entreno" className="pt-4">Comida ligera 1-2h antes, rica en carbs. Ej: Avena sin gluten, plátano.</TabsContent><TabsContent value="durante-entreno" className="pt-4">Para sesiones >1h, hidratación con electrolitos y carbs simples (30-45g/h).</TabsContent><TabsContent value="post-entreno" className="pt-4">Ventana de 30 min. Proteína y carbs para reparar músculo. Ej: Batido de proteína, yogur griego.</TabsContent></Tabs></CardContent></Card></div>
);

const TrainingPlan: React.FC = () => (
    <div className="space-y-6"><h1 className="text-3xl font-bold">Entrenamiento y Mantenimiento Corporal</h1><Alert><Brain className="h-4 w-4" /><AlertTitle>Entrenamiento Inteligente: EPOC y Periodización</AlertTitle><AlertDescription>El entrenamiento HIIT genera un "efecto post-combustión" (EPOC) que quema calorías por horas. La periodización te ayuda a progresar sin sobreentrenar.</AlertDescription></Alert><Card><CardHeader><CardTitle>Planificación Semanal Complementaria</CardTitle></CardHeader><CardContent><Accordion type="multiple" className="w-full"><AccordionItem value="item-1"><AccordionTrigger>Fuerza y Acondicionamiento (2x/sem)</AccordionTrigger><AccordionContent>Circuitos HIIT para maximizar EPOC. Foco en sentadillas, planchas, puentes de glúteos.</AccordionContent></AccordionItem><AccordionItem value="item-2"><AccordionTrigger>Cardio de Bajo Impacto (1-2x/sem)</AccordionTrigger><AccordionContent>Ciclismo o natación para mejorar la resistencia aeróbica, protegiendo articulaciones.</AccordionContent></AccordionItem><AccordionItem value="item-3"><AccordionTrigger>Técnica y Flexibilidad (Diario)</AccordionTrigger><AccordionContent>20 min de estiramientos y movilidad. Incluir "Barra al Suelo" para alineación.</AccordionContent></AccordionItem></Accordion></CardContent></Card></div>
);

const SleepRecovery: React.FC<{ latestSleep: SleepData | null, onAddSleep: (data: SleepData) => void }> = ({ latestSleep, onAddSleep }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); const formData = new FormData(e.currentTarget); onAddSleep({ hours: parseFloat(formData.get('sleep-hours') as string), quality: formData.get('sleep-quality') as SleepData['quality'], date: new Date() }); };
    return (<div className="space-y-6"><h1 className="text-3xl font-bold">Sueño y Recuperación</h1><Alert><Moon className="h-4 w-4" /><AlertTitle>Tu Herramienta de Recuperación Más Potente</AlertTitle><AlertDescription>Dormir menos de 8h aumenta drásticamente el riesgo de lesiones. Tu objetivo: 8-10 horas.</AlertDescription></Alert><Card><CardHeader><CardTitle>Registro de Sueño</CardTitle></CardHeader><CardContent className="space-y-4"><form onSubmit={handleSubmit} className="space-y-4"><div className="grid gap-2"><Label htmlFor="sleep-hours">Horas Dormidas</Label><Input id="sleep-hours" name="sleep-hours" type="number" step="0.5" defaultValue={latestSleep?.hours} required/></div><div className="grid gap-2"><Label htmlFor="sleep-quality">Calidad al despertar</Label><Select name="sleep-quality" defaultValue={latestSleep?.quality}><SelectTrigger><SelectValue placeholder="Selecciona calidad" /></SelectTrigger><SelectContent><SelectItem value="excelente">Excelente</SelectItem><SelectItem value="buena">Buena</SelectItem><SelectItem value="regular">Regular</SelectItem><SelectItem value="mala">Mala</SelectItem><SelectItem value="cansada">Cansada</SelectItem></SelectContent></Select></div><Button type="submit">Guardar Registro de Sueño</Button></form></CardContent></Card><Card><CardHeader><CardTitle>Técnicas de Recuperación Estratégica</CardTitle></CardHeader><CardContent><Accordion type="single" collapsible><AccordionItem value="item-1"><AccordionTrigger>Baños de Sales de Epsom</AccordionTrigger><AccordionContent>Relajan los músculos, reducen la inflamación y mejoran la circulación.</AccordionContent></AccordionItem><AccordionItem value="item-2"><AccordionTrigger>Rodillo de Espuma (Foam Rolling)</AccordionTrigger><AccordionContent>Libera la tensión en isquiotibiales, flexores de cadera y pantorrillas.</AccordionContent></AccordionItem><AccordionItem value="item-3"><AccordionTrigger>Recuperación Mental (Mindfulness)</AccordionTrigger><AccordionContent>Dedica 5-10 minutos a ejercicios de respiración profunda para calmar el sistema nervioso.</AccordionContent></AccordionItem></Accordion></CardContent></Card></div>);
};

const Supplements: React.FC = () => (
    <div className="space-y-6"><h1 className="text-3xl font-bold">Guía de Suplementación</h1><Alert variant="destructive"><ShieldCheck className="h-4 w-4" /><AlertTitle>¡Importante! Consulta Profesional</AlertTitle><AlertDescription>Consulta a un médico o dietista antes de tomar cualquier suplemento.</AlertDescription></Alert><div className="grid md:grid-cols-2 gap-6"><Card><CardHeader><CardTitle>Proteína en Polvo</CardTitle></CardHeader><CardContent>Para acelerar la reparación muscular post-entreno.</CardContent></Card><Card><CardHeader><CardTitle>Omega-3</CardTitle></CardHeader><CardContent>Reduce la inflamación y apoya la salud articular.</CardContent></Card><Card><CardHeader><CardTitle>Vitamina D</CardTitle></CardHeader><CardContent>Esencial para la salud ósea, crucial por ensayar en interiores.</CardContent></Card><Card><CardHeader><CardTitle>Magnesio</CardTitle></CardHeader><CardContent>Previene calambres y mejora la calidad del sueño.</CardContent></Card></div></div>
);

const Education: React.FC = () => (
    <div className="space-y-6"><h1 className="text-3xl font-bold">Educación y Ciencia</h1><Alert><Brain className="h-4 w-4" /><AlertTitle>Entender el "Porqué"</AlertTitle><AlertDescription>Aquí encontrarás los conceptos clave del informe para potenciar tu rendimiento.</AlertDescription></Alert><Accordion type="multiple" className="w-full"><AccordionItem value="item-1"><AccordionTrigger>Disponibilidad Energética (LEA y RED-S)</AccordionTrigger><AccordionContent>Comer muy poco, incluso para perder peso, puede hacer que tu metabolismo se vuelva lento y aumente el riesgo de lesiones. Es clave comer suficiente para tus necesidades básicas más el entrenamiento, creando un déficit pequeño y controlado.</AccordionContent></AccordionItem><AccordionItem value="item-2"><AccordionTrigger>El "Mito del Ejercicio" para Perder Peso</AccordionTrigger><AccordionContent>El ejercicio por sí solo tiene un impacto limitado en la pérdida de peso (aprox. 5% del gasto energético diario). La nutrición es el factor principal (aprox. 60% es tu metabolismo basal). El ejercicio es VITAL para la salud, la fuerza y para moldear tu cuerpo, pero la dieta controla el peso.</AccordionContent></AccordionItem><AccordionItem value="item-3"><AccordionTrigger>El Rol de la Inflamación</AccordionTrigger><AccordionContent>El azúcar añadido y los alimentos procesados pueden causar inflamación crónica, lo que dificulta la recuperación muscular y aumenta el riesgo de lesiones. Priorizar alimentos integrales es una estrategia anti-inflamatoria.</AccordionContent></AccordionItem></Accordion></div>
);

// --- MAIN DASHBOARD PAGE ---
export default function DashboardPage() {
    const [activeView, setActiveView] = useState<ViewName>('overview');
    const [healthData, setHealthData] = useState<HealthMetric[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    
    // --- State moved inside component ---
    const [latestSleep, setLatestSleep] = useState<SleepData | null>({ hours: 6, quality: 'cansada', date: new Date() });
    const [hydration, setHydration] = useState(1.5);

    useEffect(() => {
        const loadAndSubscribe = async () => {
            setIsLoading(true);
            try {
                const localData = dataSyncManager.getLocalData();
                setHealthData(localData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                await dataSyncManager.syncFromCloud();
            } catch (error) { console.error("Failed to load initial data:", error);
            } finally { setIsLoading(false); }
            const unsubscribe = dataSyncManager.subscribeToCloudUpdates((data) => {
                setHealthData(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            });
            return () => unsubscribe();
        };
        loadAndSubscribe();
    }, []);

    const handleAddData = async (newData: NewMetricData) => {
        const imc = calculateBMI(newData.weight, celesteProfile.height);
        const metricToAdd: HealthMetric = { id: Date.now().toString(), synced: false, lastModified: new Date(), ...newData, imc };
        try {
            await dataSyncManager.saveLocal(metricToAdd);
            toast({ title: "¡Éxito!", description: "Registro guardado y pendiente de sincronización." });
        } catch (error) {
            console.error("Failed to save new data:", error);
            toast({ title: "Error", description: "No se pudo guardar el registro.", variant: "destructive" });
        }
    };

    const handleAddSleep = (newSleepData: SleepData) => {
        setLatestSleep(newSleepData);
        // Here you would also save this to your data store (e.g., a new collection in Firebase)
        toast({ title: "Registro de sueño guardado." });
    };
    
    const renderContent = () => {
        if (isLoading && healthData.length === 0) {
            return (<div className="space-y-6 p-8"><Skeleton className="h-28 w-full" /><div className="grid grid-cols-4 gap-6"><Skeleton className="h-28 w-full" /><Skeleton className="h-28 w-full" /><Skeleton className="h-28 w-full" /><Skeleton className="h-28 w-full" /></div><Skeleton className="h-64 w-full" /></div>)
        }
        switch (activeView) {
            case 'overview': return <Overview progressData={healthData} setView={setActiveView} latestSleep={latestSleep} hydration={hydration} setHydration={setHydration} />;
            case 'tracking': return <ProgressTracking progressData={healthData} onAddData={handleAddData} />;
            case 'nutrition': return <NutritionPlan />;
            case 'training': return <TrainingPlan />;
            case 'sleep_recovery': return <SleepRecovery latestSleep={latestSleep} onAddSleep={handleAddSleep} />;
            case 'supplements': return <Supplements />;
            case 'education': return <Education />;
            default: return <Overview progressData={healthData} setView={setActiveView} latestSleep={latestSleep} hydration={hydration} setHydration={setHydration} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
            <div className="flex flex-col md:flex-row min-h-screen">
                <Sidebar activeView={activeView} setActiveView={setActiveView} />
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">{renderContent()}</main>
            </div>
        </div>
    );
}
