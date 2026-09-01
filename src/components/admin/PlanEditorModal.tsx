import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Crown,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  DollarSign,
  Layers,
  Heart,
  Briefcase
} from 'lucide-react';
import { PlanDetails } from '../../types.ts';
import { toast } from '../../lib/toast.ts';

interface PlanEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanDetails | null;
  onSuccess: () => void;
}

export const PlanEditorModal: React.FC<PlanEditorModalProps> = ({
  isOpen,
  onClose,
  plan,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [badge, setBadge] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [billingPeriod, setBillingPeriod] = useState('');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeatureText, setNewFeatureText] = useState('');
  const [maxWeddings, setMaxWeddings] = useState<string>('1');
  const [ctaText, setCtaText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (plan) {
      setName(plan.name || '');
      setBadge(plan.badge || '');
      setPrice(plan.price || '');
      setOriginalPrice(plan.originalPrice || '');
      setBillingPeriod(plan.billingPeriod || '');
      setDescription(plan.description || '');
      setFeatures(plan.features ? [...plan.features] : []);
      setMaxWeddings(String(plan.maxWeddings || '1'));
      setCtaText(plan.ctaText || 'Elegir Plan');
    }
  }, [plan, isOpen]);

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFeatures([...features, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleFeatureChange = (index: number, val: string) => {
    const updated = [...features];
    updated[index] = val;
    setFeatures(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan?.id) return;

    setIsSubmitting(true);
    try {
      const updates = {
        name: name.trim(),
        badge: badge.trim(),
        price: price.trim(),
        originalPrice: originalPrice.trim() || undefined,
        billingPeriod: billingPeriod.trim(),
        description: description.trim(),
        features,
        maxWeddings: maxWeddings === 'unlimited' ? 'unlimited' : Number(maxWeddings) || 1,
        ctaText: ctaText.trim() || 'Elegir Plan',
      };

      const res = await fetch('/api/admin/ceo/plans/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          updates,
        }),
      });

      if (res.ok) {
        toast.success(`Plan "${name}" actualizado con éxito en la plataforma.`, 'Tarifa Guardada');
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Error al guardar cambios del plan.');
      }
    } catch (err) {
      console.error('Plan update error:', err);
      toast.error('Error de conexión con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !plan) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl bg-stone-900 border border-stone-700 rounded-3xl p-6 sm:p-8 text-stone-100 shadow-2xl my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-inner">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <span>Editar Plan & Tarifa: {plan.name}</span>
                </h3>
                <p className="text-xs text-stone-400">
                  ID: <span className="font-mono text-amber-300">{plan.id}</span> • Categoría: {plan.category}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-full hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Nombre del Plan:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-200 focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Etiqueta / Badge Promocional:
                </label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="Ej. El Más Elegido por Parejas"
                  className="w-full text-xs bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Precio Actual:
                </label>
                <input
                  type="text"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Ej. $29 USD o $0"
                  className="w-full text-xs bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Precio Regular (Tachado):
                </label>
                <input
                  type="text"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="Ej. $45 USD"
                  className="w-full text-xs bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-400 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Frecuencia de Cobro:
                </label>
                <input
                  type="text"
                  value={billingPeriod}
                  onChange={(e) => setBillingPeriod(e.target.value)}
                  placeholder="Ej. Pago único por boda"
                  className="w-full text-xs bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Descripción Comercial:
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs bg-stone-950 border border-stone-700 rounded-xl p-3 text-stone-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Capacidad de Bodas Permitidas:
                </label>
                <select
                  value={maxWeddings}
                  onChange={(e) => setMaxWeddings(e.target.value)}
                  className="w-full text-xs bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-200 focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="1">1 Boda</option>
                  <option value="5">5 Bodas</option>
                  <option value="15">15 Bodas</option>
                  <option value="unlimited">Ilimitadas (Sin Límite)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Texto Botón de Acción (CTA):
                </label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="Ej. Elegir Plan Atelier"
                  className="w-full text-xs bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Features List Manager */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-2 flex items-center justify-between">
                <span>Beneficios & Características Incluidas ({features.length}):</span>
              </label>

              <div className="max-h-48 overflow-y-auto space-y-2 mb-3 pr-1">
                {features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-stone-950 p-2 rounded-xl border border-stone-800">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => handleFeatureChange(idx, e.target.value)}
                      className="w-full text-xs bg-transparent border-none text-stone-200 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="p-1 text-stone-500 hover:text-rose-400 rounded-lg hover:bg-stone-900 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add feature input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Agregar nuevo beneficio (Ej. Soporte 24/7 VIP)..."
                  value={newFeatureText}
                  onChange={(e) => setNewFeatureText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                  className="flex-1 text-xs bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-stone-800 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                {isSubmitting ? (
                  <span>Guardando...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Guardar Cambios del Plan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
