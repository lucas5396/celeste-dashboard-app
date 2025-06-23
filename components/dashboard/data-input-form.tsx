// components/dashboard/data-input-form.tsx

"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { addHealthData } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import { HealthData } from "@/lib/types";

// Esquema de validación con Zod, ahora incluye los nuevos campos.
const formSchema = z.object({
  date: z.string().min(1, { message: "La fecha es requerida." }),
  weight: z.coerce.number().min(0, { message: "El peso debe ser positivo." }),
  fatPercentage: z.coerce.number().min(0).max(100),
  muscleMass: z.coerce.number().min(0),
  hydration: z.coerce.number().min(0).max(100),
  sleepHours: z.coerce.number().min(0).max(24),
  // Nuevas validaciones (opcionales para no forzar el llenado)
  sleepQuality: z.enum(['Reparador', 'Normal', 'Interrumpido', 'Poco profundo']).optional(),
  energyLevel: z.number().min(1).max(5).optional(),
  soreness: z.number().min(1).max(5).optional(),
  mood: z.enum(['Feliz', 'Normal', 'Estresada', 'Cansada']).optional(),
});

interface DataInputFormProps {
  onDataAdded: (newData: HealthData) => void;
}

export function DataInputForm({ onDataAdded }: DataInputFormProps) {
  const { toast } = useToast();
  // Valores por defecto para los sliders
  const [energy, setEnergy] = useState(3);
  const [soreness, setSoreness] = useState(1);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      weight: 0,
      fatPercentage: 0,
      muscleMass: 0,
      hydration: 0,
      sleepHours: 0,
      energyLevel: 3,
      soreness: 1,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const newEntry = await addHealthData(values as Omit<HealthData, 'id'>);
      onDataAdded(newEntry);
      toast({
        title: "¡Éxito!",
        description: "Tus datos se han guardado correctamente.",
        className: "bg-green-500 text-white",
      });
      form.reset({
        ...form.getValues(),
        date: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("Error al guardar los datos:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los datos. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4 border rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Campos existentes */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fatPercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>% Grasa Corporal</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="muscleMass"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Masa Muscular (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="hydration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>% Hidratación</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sleepHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horas de Sueño</FormLabel>
                <FormControl>
                  <Input type="number" step="0.5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <hr />

        <div className="space-y-6 pt-4">
            <h3 className="text-lg font-medium">Seguimiento Cualitativo</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nuevos Campos Cualitativos */}
                <FormField
                control={form.control}
                name="sleepQuality"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Calidad del Sueño</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona cómo dormiste" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="Reparador">Reparador</SelectItem>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="Interrumpido">Interrumpido</SelectItem>
                        <SelectItem value="Poco profundo">Poco profundo</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Estado de Ánimo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona tu estado de ánimo" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="Feliz">😄 Feliz</SelectItem>
                        <SelectItem value="Normal">🙂 Normal</SelectItem>
                        <SelectItem value="Estresada">😟 Estresada</SelectItem>
                        <SelectItem value="Cansada">😩 Cansada</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                 <FormField
                    control={form.control}
                    name="energyLevel"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nivel de Energía: <span className="font-bold text-blue-600">{energy}</span> / 5</FormLabel>
                            <FormControl>
                                <Slider
                                    defaultValue={[energy]}
                                    min={1} max={5} step={1}
                                    onValueChange={(value) => {
                                        field.onChange(value[0]);
                                        setEnergy(value[0]);
                                    }}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="soreness"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Dolor Muscular: <span className="font-bold text-red-600">{soreness}</span> / 5</FormLabel>
                            <FormControl>
                                <Slider
                                    defaultValue={[soreness]}
                                    min={1} max={5} step={1}
                                    onValueChange={(value) => {
                                        field.onChange(value[0]);
                                        setSoreness(value[0]);
                                    }}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
             </div>
        </div>
       
        <Button type="submit" className="w-full md:w-auto">Guardar Datos del Día</Button>
      </form>
    </Form>
  );
}
