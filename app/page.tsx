import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar as CalendarIcon, ChevronDown, Droplet, Flame, Zap, Dumbbell, Target, Heart, Brain, BookOpen, Apple, Fish, Carrot, Coffee, CheckCircle, Clock, Moon, PlusCircle, ArrowRight, TrendingUp, Info } from 'lucide-react';

// ShadCN UI Components (simulated for self-contained example)
// In a real project, these would be imported from your UI library.
const Card = ({ children, className = '' }) => <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm ${className}`}>{children}</div>;
const CardHeader = ({ children, className = '' }) => <div className={`p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 ${className}`}>{children}</div>;
const CardContent = ({ children, className = '' }) => <div className={`p-4 md:p-6 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = '' }) => <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`}>{children}</h3>;
const CardDescription = ({ children, className = '' }) => <p className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}>{children}</p>;
const Button = ({ children, onClick, className = '' }) => <button onClick={onClick} className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4 ${className}`}>{children}</button>;
const Input = (props) => <input {...props} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${props.className}`} />;
const Label = (props) => <label {...props} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-300 ${props.className}`} />;
const Dialog = ({ children, open, onClose }) => open ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}><div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>{children}</div></div> : null;
const DialogContent = ({ children }) => <div>{children}</div>;
const DialogHeader = ({ children }) => <div className="pb-4 border-b dark:border-gray-700">{children}</div>;
const DialogTitle = ({ children }) => <h2 className="text-xl font-bold dark:text-white">{children}</h2>;
const DialogDescription = ({ children }) => <p className="text-sm text-gray-500 dark:text-gray-400">{children}</p>;
const DialogFooter = ({ children }) => <div className="pt-4 border-t dark:border-gray-700 flex justify-end gap-2">{children}</div>;

const AccordionContext = React.createContext({});
const Accordion = ({ children, type = "single", collapsible = true, defaultValue, className }) => {
    const [value, setValue] = useState(defaultValue);
    return <AccordionContext.Provider value={{ value, setValue, type, collapsible }}><div className={`w-full ${className}`}>{children}</div></AccordionContext.Provider>;
};
const AccordionItem = ({ children, value, className }) => <div className={`border-b dark:border-gray-700 ${className}`}>{React.Children.map(children, child => React.cloneElement(child, { itemValue: value }))}</div>;
const AccordionTrigger = ({ children, itemValue }) => {
    const { value, setValue, type, collapsible } = React.useContext(AccordionContext);
    const isOpen = Array.isArray(value) ? value.includes(itemValue) : value === itemValue;
    const handleClick = () => {
        if (type === "single") {
            setValue(isOpen && collapsible ? undefined : itemValue);
        } else {
            // Multiple
            const newValue = isOpen ? value.filter(v => v !== itemValue) : [...(value || []), itemValue];
            setValue(newValue);
        }
    };
    return (<button onClick={handleClick} className="flex items-center justify-between w-full py-4 font-medium text-left text-gray-800 dark:text-gray-100"><span>{children}</span><ChevronDown className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} /></button>);
};
const AccordionContent = ({ children, itemValue }) => {
    const { value } = React.useContext(AccordionContext);
    const isOpen = Array.isArray(value) ? value.includes(itemValue) : value === itemValue;
    return isOpen ? <div className="pb-4 pt-0 text-gray-600 dark:text-gray-300">{children}</div> : null;
};
const TooltipWrapper = ({ children, content }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative inline-block" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      {children}
      {visible && (
        <div className="absolute z-10 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm dark:bg-gray-700 w-max max-w-xs bottom-full mb-2">
          {content}
        </div>
      )}
    </div>
  );
};


// --- MOCK DATA BASED ON THE REPORT ---
const initialUserData = {
    name: "Celeste",
    age: 32,
    initialWeight: 58, // kg
    height: 165, // cm
};

const goals = {
    bodyFatPercentage: { target: 18, unit: '%' }, // target range 18-20%
    muscleMass: { target: 46, unit: 'kg' }, // Increase 1-2kg from baseline
    waterIntake: { target: 3, unit: 'L' },
    proteinIntake: { target: 115, unit: 'g' }, // 58kg * ~2.0g/kg
    calories: { target: 2250, unit: 'kcal' }
};

const mockProgressData = [
    { date: "01/06", weight: 58.0, bodyFat: 21.0, energy: 7, sleep: 6, water: 1.5, protein: 80, calories: 1900 },
    { date: "08/06", weight: 57.5, bodyFat: 20.5, energy: 8, sleep: 7, water: 2.0, protein: 95, calories: 2100 },
    { date: "15/06", weight: 57.2, bodyFat: 20.1, energy: 8, sleep: 8, water: 2.5, protein: 110, calories: 2200 },
    { date: "22/06", weight: 57.0, bodyFat: 19.8, energy: 9, sleep: 8, water: 3.0, protein: 115, calories: 2250 },
];

// --- SUB-COMPONENTS ---

const Sidebar = ({ activeView, setActiveView }) => {
    const navItems = [
        { id: 'overview', label: 'Resumen', icon: Target },
        { id: 'tracking', label: 'Registro y Progreso', icon: TrendingUp },
        { id: 'nutrition', label: 'Plan de Nutrición', icon: Apple },
        { id: 'training', label: 'Entrenamiento y Recuperación', icon: Dumbbell },
        { id: 'education', label: 'Educación', icon: BookOpen },
    ];

    return (
        <aside className="w-full md:w-64 bg-white dark:bg-gray-800/50 border-r dark:border-gray-700 p-4 md:p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    C
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Celeste</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Bailarina Profesional</p>
                </div>
            </div>
            <nav className="flex-1 space-y-2">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                            ${activeView === item.id 
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-white' 
                                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'}`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>
            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg text-center">
                 <p className="text-xs text-gray-500 dark:text-gray-400">"El cuerpo de la bailarina es su instrumento principal."</p>
            </div>
        </aside>
    );
};

const Overview = ({ progressData, setView }) => {
    const latestData = progressData[progressData.length - 1];
    const muscleMass = (latestData.weight * (1 - latestData.bodyFat / 100)).toFixed(1);

    const dailyTasks = [
        { id: 1, text: `Beber ${goals.waterIntake.target}L de agua`, completed: latestData.water >= goals.waterIntake.target },
        { id: 2, text: `Consumir ${goals.proteinIntake.target}g de proteína`, completed: latestData.protein >= goals.proteinIntake.target },
        { id: 3, text: "Snack pre-entrenamiento (1-2h antes)", completed: true },
        { id: 4, text: "Comida post-entrenamiento (30-60min después)", completed: true },
        { id: 5, text: "Dormir 7-9 horas", completed: latestData.sleep >= 7 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hola, {initialUserData.name}!</h1>
                    <p className="text-gray-500 dark:text-gray-400">Aquí está el resumen de tu progreso y tu foco para hoy.</p>
                </div>
                 <Button onClick={() => setView('tracking')}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Registro
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>Grasa Corporal</CardTitle>
                        <Target className="w-5 h-5 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <span className="text-3xl font-bold">{latestData.bodyFat}%</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Objetivo: {goals.bodyFatPercentage.target}%</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>Masa Muscular</CardTitle>
                        <Dumbbell className="w-5 h-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <span className="text-3xl font-bold">{muscleMass}kg</span>
                         <p className="text-sm text-gray-500 dark:text-gray-400">Objetivo: {goals.muscleMass.target}kg</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>Hidratación Hoy</CardTitle>
                        <Droplet className="w-5 h-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <span className="text-3xl font-bold">{latestData.water}L</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Objetivo: {goals.waterIntake.target}L</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>Energía / Sueño</CardTitle>
                        <Zap className="w-5 h-5 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <span className="text-3xl font-bold">{latestData.energy}/10</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Anoche: {latestData.sleep} horas</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Progress Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Evolución del Peso y Grasa Corporal</CardTitle>
                        <CardDescription>Últimas 4 semanas</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={progressData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis dataKey="date" tick={{ fill: 'rgb(107, 114, 128)'}} />
                                <YAxis yAxisId="left" label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft', fill: 'rgb(107, 114, 128)' }} tick={{ fill: 'rgb(107, 114, 128)'}} />
                                <YAxis yAxisId="right" orientation="right" label={{ value: '% Grasa', angle: -90, position: 'insideRight', fill: 'rgb(107, 114, 128)' }} tick={{ fill: 'rgb(107, 114, 128)'}}/>
                                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ddd' }} />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="weight" name="Peso" stroke="#3b82f6" strokeWidth={2} />
                                <Line yAxisId="right" type="monotone" dataKey="bodyFat" name="% Grasa" stroke="#a855f7" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Daily Focus */}
                <Card>
                    <CardHeader>
                        <CardTitle>Foco del Día</CardTitle>
                        <CardDescription>Tu plan de acción para hoy.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {dailyTasks.map(task => (
                                <li key={task.id} className="flex items-center gap-3">
                                    <CheckCircle className={`w-5 h-5 ${task.completed ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'}`} />
                                    <span className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>{task.text}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const ProgressTracking = ({ progressData, onAddData }) => {
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [newData, setNewData] = useState({
      date: new Date().toISOString().split('T')[0],
      weight: '',
      bodyFat: '',
      energy: '8',
      sleep: '8',
      water: '',
      protein: '',
      calories: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        const dataToAdd = {
            date: new Date(newData.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
            weight: parseFloat(newData.weight),
            bodyFat: parseFloat(newData.bodyFat),
            energy: parseInt(newData.energy),
            sleep: parseInt(newData.sleep),
            water: parseFloat(newData.water),
            protein: parseInt(newData.protein),
            calories: parseInt(newData.calories),
        };
        onAddData(dataToAdd);
        setDialogOpen(false);
    };

    const muscleMassData = progressData.map(d => ({
      ...d,
      muscleMass: (d.weight * (1 - d.bodyFat / 100)).toFixed(1)
    }));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Registro y Progreso</h1>
                <Button onClick={() => setDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nuevo Registro
                </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader><CardTitle>Evolución de Composición Corporal</CardTitle></CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={muscleMassData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis dataKey="date" tick={{ fill: 'rgb(107, 114, 128)'}} />
                                <YAxis yAxisId="left" dataKey="weight" name="Peso" tick={{ fill: 'rgb(107, 114, 128)'}} />
                                <YAxis yAxisId="right" orientation="right" dataKey="muscleMass" name="Masa Muscular" tick={{ fill: 'rgb(107, 114, 128)'}}/>
                                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ddd' }} />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="weight" name="Peso (kg)" stroke="#3b82f6" strokeWidth={2}/>
                                <Line yAxisId="right" type="monotone" dataKey="muscleMass" name="M. Muscular (kg)" stroke="#10b981" strokeWidth={2}/>
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Nivel de Energía y Calidad del Sueño</CardTitle></CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={progressData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis dataKey="date" tick={{ fill: 'rgb(107, 114, 128)'}} />
                                <YAxis tick={{ fill: 'rgb(107, 114, 128)'}} />
                                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ddd' }} />
                                <Legend />
                                <Bar dataKey="energy" name="Energía (1-10)" fill="#facc15" />
                                <Bar dataKey="sleep" name="Sueño (horas)" fill="#818cf8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card className="lg:col-span-2">
                    <CardHeader><CardTitle>Consumo de Nutrientes y Calorías</CardTitle></CardHeader>
                    <CardContent className="h-80">
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={progressData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis dataKey="date" tick={{ fill: 'rgb(107, 114, 128)'}} />
                                <YAxis yAxisId="left" label={{ value: 'Gramos', angle: -90, position: 'insideLeft', fill: 'rgb(107, 114, 128)' }} tick={{ fill: 'rgb(107, 114, 128)'}} />
                                <YAxis yAxisId="right" orientation="right" label={{ value: 'Kcal', angle: -90, position: 'insideRight', fill: 'rgb(107, 114, 128)' }} tick={{ fill: 'rgb(107, 114, 128)'}}/>
                                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ddd' }} />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="protein" name="Proteína (g)" stroke="#f97316" strokeWidth={2} />
                                <Line yAxisId="right" type="monotone" dataKey="calories" name="Calorías (kcal)" stroke="#ec4899" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
            
            <Dialog open={isDialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Añadir Nuevo Registro</DialogTitle>
                        <DialogDescription>
                            Registra tus métricas diarias para seguir tu evolución.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="col-span-2">
                            <Label htmlFor="date">Fecha</Label>
                            <Input id="date" name="date" type="date" value={newData.date} onChange={handleInputChange} />
                        </div>
                        <div>
                            <Label htmlFor="weight">Peso (kg)</Label>
                            <Input id="weight" name="weight" type="number" placeholder="57.0" value={newData.weight} onChange={handleInputChange} />
                        </div>
                         <div>
                            <Label htmlFor="bodyFat">Grasa Corporal (%)</Label>
                            <Input id="bodyFat" name="bodyFat" type="number" placeholder="19.8" value={newData.bodyFat} onChange={handleInputChange} />
                        </div>
                         <div>
                            <Label htmlFor="water">Agua (L)</Label>
                            <Input id="water" name="water" type="number" placeholder="3.0" value={newData.water} onChange={handleInputChange}/>
                        </div>
                        <div>
                            <Label htmlFor="protein">Proteína (g)</Label>
                            <Input id="protein" name="protein" type="number" placeholder="115" value={newData.protein} onChange={handleInputChange}/>
                        </div>
                         <div className="col-span-2">
                            <Label htmlFor="calories">Calorías (kcal)</Label>
                            <Input id="calories" name="calories" type="number" placeholder="2250" value={newData.calories} onChange={handleInputChange}/>
                        </div>
                        <div className="col-span-2">
                            <Label htmlFor="energy">Nivel de Energía (1-10)</Label>
                            <Input id="energy" name="energy" type="range" min="1" max="10" value={newData.energy} onChange={handleInputChange}/>
                        </div>
                        <div className="col-span-2">
                            <Label htmlFor="sleep">Horas de Sueño</Label>
                            <Input id="sleep" name="sleep" type="range" min="1" max="12" step="0.5" value={newData.sleep} onChange={handleInputChange}/>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setDialogOpen(false)} className="bg-gray-200 text-gray-800 hover:bg-gray-300">Cancelar</Button>
                        <Button onClick={handleSubmit}>Guardar Registro</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const NutritionPlan = () => {
    const weight = 58; // kg, could be dynamic
    const proteinGrams = (weight * 1.8).toFixed(0);
    const fatGrams = (weight * 1.1).toFixed(0);
    const proteinKcal = proteinGrams * 4;
    const fatKcal = fatGrams * 9;
    const totalKcal = goals.calories.target;
    const carbKcal = totalKcal - proteinKcal - fatKcal;
    const carbGrams = (carbKcal / 4).toFixed(0);

    const macrosData = [
        { name: 'Proteínas', value: proteinKcal, grams: proteinGrams },
        { name: 'Carbohidratos', value: carbKcal, grams: carbGrams },
        { name: 'Grasas', value: fatKcal, grams: fatGrams },
    ];
    const COLORS = ['#f97316', '#3b82f6', '#eab308'];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Plan de Nutrición</h1>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Distribución de Macronutrientes</CardTitle>
                        <CardDescription>Objetivo diario: {totalKcal} kcal</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80 flex flex-col md:flex-row items-center gap-6">
                        <div className="w-full md:w-1/2 h-full">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={macrosData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} labelLine={false}
                                      label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                        const RADIAN = Math.PI / 180;
                                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                        return (
                                          <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                            {`${(percent * 100).toFixed(0)}%`}
                                          </text>
                                        );
                                      }}
                                    >
                                        {macrosData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value, name, props) => [`${value.toFixed(0)} kcal (${props.payload.grams}g)`, name]} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                         <div className="w-full md:w-1/2 space-y-3">
                            {macrosData.map((macro, index) => (
                                <div key={macro.name} className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full mr-3`} style={{ backgroundColor: COLORS[index] }}></div>
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{macro.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{macro.grams}g / {macro.value.toFixed(0)} kcal</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                 <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="flex items-center gap-3">
                           <Droplet className="w-6 h-6 text-blue-500"/>
                           <div>
                                <CardTitle>Hidratación Esencial</CardTitle>
                                <CardDescription>{goals.waterIntake.target} Litros / día</CardDescription>
                           </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm mb-2">Prepara tu bebida electrolítica casera para reponer minerales durante y después del entrenamiento:</p>
                             <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                <li>1 Litro de agua</li>
                                <li>Jugo de 1 limón o lima</li>
                                <li>1/4 cucharadita de sal (Sodio)</li>
                                <li>1/4 cucharadita de cloruro de potasio (opcional)</li>
                                <li>1-2 cucharaditas de miel o sirope de arce (energía)</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
            
             <Card>
                <CardHeader>
                    <CardTitle>Timing de Nutrientes: Cuándo Comer</CardTitle>
                    <CardDescription>Optimiza tu energía y recuperación comiendo en los momentos clave.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Accordion type="single" collapsible defaultValue="item-2">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>
                                <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-yellow-500" /> Pre-Entrenamiento (1-3 horas antes)</div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="font-semibold">Foco: Carbohidratos de fácil digestión y algo de proteína.</p>
                                <p>Esto llenará tus depósitos de glucógeno para tener energía disponible durante el baile.</p>
                                <ul className="list-disc list-inside mt-2">
                                    <li>Un plátano con un puñado de almendras.</li>
                                    <li>Tostada integral con aguacate y un huevo.</li>
                                    <li>Yogur griego con frutas y un poco de granola.</li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>
                                <div className="flex items-center gap-3"><Zap className="w-5 h-5 text-blue-500" /> Durante el Entrenamiento (si dura {'>'} 90 min)</div>
                            </AccordionTrigger>
                            <AccordionContent>
                               <p className="font-semibold">Foco: Hidratación y electrolitos. Carbohidratos simples si es necesario.</p>
                                <p>Mantén el rendimiento y retrasa la fatiga.</p>
                                <ul className="list-disc list-inside mt-2">
                                    <li>Bebida electrolítica casera (sorbos pequeños y frecuentes).</li>
                                    <li>Un gel energético o un par de dátiles si sientes que la energía decae.</li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>
                                <div className="flex items-center gap-3"><Dumbbell className="w-5 h-5 text-green-500" /> Post-Entrenamiento (30-60 minutos después)</div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="font-semibold">Foco: Proteínas para reparar músculos y Carbohidratos para reponer energía.</p>
                                <p>Esta es la "ventana anabólica" crucial para la recuperación y adaptación muscular.</p>
                                 <ul className="list-disc list-inside mt-2">
                                    <li>Batido de proteína de suero con un plátano.</li>
                                    <li>Pechuga de pollo a la plancha con arroz integral y brócoli.</li>
                                    <li>Salmón al horno con batata y espárragos.</li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
};

const TrainingPlan = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Entrenamiento y Recuperación</h1>
             <p className="text-gray-500 dark:text-gray-400">La recuperación es parte del entrenamiento. Aquí tienes tus herramientas clave.</p>

            <Card>
                <CardHeader>
                    <CardTitle>Guía de Suplementación Estratégica</CardTitle>
                    <CardDescription>Basado en evidencia para potenciar tu rendimiento de forma segura.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="multiple" defaultValue={['item-1']}>
                        <AccordionItem value="item-1">
                            <AccordionTrigger>
                                <div className="flex items-center gap-3"><Dumbbell className="w-5 h-5 text-purple-500" /> Creatina Monohidrato</div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <p><strong>Dosis:</strong> 3-5 gramos al día.</p>
                                <p><strong>Cuándo:</strong> A cualquier hora, pero tomarla post-entrenamiento con tu batido puede mejorar su absorción.</p>
                                <p><strong>Beneficios:</strong> Aumenta la fuerza, la potencia y ayuda a la ganancia de masa muscular. Es uno de los suplementos más estudiados y seguros.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>
                                <div className="flex items-center gap-3"><Zap className="w-5 h-5 text-orange-500" /> Beta-Alanina</div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <p><strong>Dosis:</strong> 2-5 gramos al día, divididos en tomas más pequeñas si causa parestesia (hormigueo).</p>
                                <p><strong>Cuándo:</strong> Usualmente se toma pre-entrenamiento.</p>
                                <p><strong>Beneficios:</strong> Mejora la resistencia muscular al reducir la acidez en los músculos, permitiéndote realizar esfuerzos de alta intensidad por más tiempo.</p>
                            </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="item-3">
                            <AccordionTrigger>
                                <div className="flex items-center gap-3"><Coffee className="w-5 h-5 text-yellow-800" /> Cafeína</div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <p><strong>Dosis:</strong> 3-6 mg por kg de peso corporal.</p>
                                <p><strong>Cuándo:</strong> 30-60 minutos antes del entrenamiento o actuación.</p>
                                <p><strong>Beneficios:</strong> Reduce la percepción del esfuerzo, aumenta el estado de alerta y mejora la resistencia. Cuidado con la tolerancia y el impacto en el sueño.</p>
                            </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="item-4">
                            <AccordionTrigger>
                                <div className="flex items-center gap-3"><Heart className="w-5 h-5 text-red-500" /> Colágeno Hidrolizado</div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <p><strong>Dosis:</strong> 10-15 gramos al día.</p>
                                <p><strong>Cuándo:</strong> Puede tomarse en cualquier momento.</p>
                                <p><strong>Beneficios:</strong> Apoya la salud de las articulaciones, tendones y ligamentos, componentes cruciales para la prevención de lesiones en bailarinas.</p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Pilares de la Recuperación</CardTitle>
                    <CardDescription>Tu rendimiento mejora cuando descansas.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Moon className="w-5 h-5 text-indigo-500" />
                          <h4 className="font-semibold">Sueño de Calidad (7-9 horas)</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Es la herramienta de recuperación más potente. Durante el sueño profundo, tu cuerpo libera hormona del crecimiento para reparar tejidos.</p>
                    </div>
                     <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-500" />
                          <h4 className="font-semibold">Recuperación Activa</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Días de descanso no significan inactividad total. Estiramientos suaves, foam roller o caminatas ligeras mejoran el flujo sanguíneo y aceleran la recuperación.</p>
                    </div>
                     <div className="space-y-2">
                        <div className="flex items-center gap-2">
                           <Brain className="w-5 h-5 text-pink-500" />
                          <h4 className="font-semibold">Gestión del Estrés</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">El estrés crónico (cortisol elevado) puede dificultar la recuperación y la pérdida de grasa. Practica meditación, respiración profunda o journaling.</p>
                    </div>
                     <div className="space-y-2">
                        <div className="flex items-center gap-2">
                           <Info className="w-5 h-5 text-gray-500" />
                          <h4 className="font-semibold">Escucha a tu Cuerpo</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Aprende a diferenciar entre el dolor muscular de un buen entrenamiento y el dolor de una posible lesión. Ajusta la intensidad cuando sea necesario.</p>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
};

const Education = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Centro de Conocimiento</h1>
            <p className="text-gray-500 dark:text-gray-400">Entender el "porqué" de cada recomendación te dará autonomía y poder sobre tu proceso.</p>
             <Card>
                <CardHeader>
                    <CardTitle>Conceptos Clave para tu Rendimiento</CardTitle>
                </CardHeader>
                <CardContent>
                   <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                            <AccordionTrigger>
                                <div className="flex items-center gap-3"><Fish className="w-5 h-5 text-orange-500" /> ¿Por qué son tan importantes las Proteínas?</div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <p>Las proteínas son los "ladrillos" de tu cuerpo. No solo construyen y reparan el tejido muscular dañado durante el entrenamiento intenso, sino que también son cruciales para producir enzimas y hormonas que regulan todo tu metabolismo. Para una bailarina, una ingesta adecuada (1.4-2.0 g/kg) es fundamental para una recuperación rápida, prevenir la pérdida muscular y mantener un sistema inmunológico fuerte.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>
                                <div className="flex items-center gap-3"><Carrot className="w-5 h-5 text-blue-500" /> Los Carbohidratos son tu Combustible Principal</div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <p>Los carbohidratos son la fuente de energía preferida de tu cuerpo para actividades de alta intensidad como el baile. Se almacenan en tus músculos e hígado como glucógeno. Cuando estos depósitos están llenos, tienes la energía necesaria para ensayos largos y actuaciones potentes. Reducirlos demasiado puede llevar a la fatiga, bajo rendimiento y dificultad para concentrarse.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>
                                <div className="flex items-center gap-3"><Target className="w-5 h-5 text-purple-500" /> Composición Corporal vs. Peso en la Balanza</div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <p>El número en la balanza no cuenta toda la historia. La composición corporal se refiere a la proporción de masa grasa y masa magra (músculos, huesos, agua) en tu cuerpo. El objetivo no es simplemente "bajar de peso", sino optimizar esta proporción: reducir el porcentaje de grasa corporal mientras se mantiene o aumenta la masa muscular. Esto resulta en un cuerpo más fuerte, más eficiente y estéticamente atlético, incluso si el peso total cambia poco.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>
                                <div className="flex items-center gap-3"><Flame className="w-5 h-5 text-red-500" /> Entendiendo tu Metabolismo: TMB y GET</div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <p><strong>Tasa Metabólica Basal (TMB):</strong> Es la cantidad de energía (calorías) que tu cuerpo necesita en reposo absoluto para mantener funciones vitales (respirar, circular la sangre, etc.).</p>
                                <p><strong>Gasto Energético Total (GET):</strong> Es la TMB más la energía que gastas en la actividad física (bailar, entrenar) y la digestión de los alimentos (efecto térmico de los alimentos). Tu objetivo calórico diario se basa en tu GET para asegurar que tienes suficiente energía para rendir al máximo y recuperarte adecuadamente.</p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
};


// --- MAIN APP COMPONENT ---
export default function App() {
    const [activeView, setActiveView] = useState('overview');
    const [progressData, setProgressData] = useState(mockProgressData);

    const handleAddData = (newData) => {
        setProgressData(prev => [...prev, newData]);
    };

    const renderContent = () => {
        switch (activeView) {
            case 'overview':
                return <Overview progressData={progressData} setView={setActiveView} />;
            case 'tracking':
                return <ProgressTracking progressData={progressData} onAddData={handleAddData} />;
            case 'nutrition':
                return <NutritionPlan />;
            case 'training':
                return <TrainingPlan />;
            case 'education':
                return <Education />;
            default:
                return <Overview progressData={progressData} setView={setActiveView} />;
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
