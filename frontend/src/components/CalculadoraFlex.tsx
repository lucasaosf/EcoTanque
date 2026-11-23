import React, { useState } from 'react';
import { X, Sparkles, HelpCircle } from 'lucide-react';

interface CalculadoraFlexProps {
  aberto: boolean;
  onFechar: () => void;
  precoGasolinaInicial?: number;
  precoEtanolInicial?: number;
}

export const CalculadoraFlex: React.FC<CalculadoraFlexProps> = ({
  aberto,
  onFechar,
  precoGasolinaInicial = 5.59,
  precoEtanolInicial = 3.59,
}) => {
  const [gasolina, setGasolina] = useState<number>(precoGasolinaInicial);
  const [etanol, setEtanol] = useState<number>(precoEtanolInicial);
  const [paridadePercentual, setParidadePercentual] = useState<number>(70); // 70% padrão nacional
  const tanqueLitros = 50;

  if (!aberto) return null;

  const razaoAtual = gasolina > 0 ? (etanol / gasolina) * 100 : 0;
  const etanolCompensa = razaoAtual <= paridadePercentual;

  // Cálculo de custo para rodar a mesma distância equivalente
  // Se etanol rende 70% da gasolina, para rodar o mesmo que 50L de gasolina precisa de (50 / 0.70) = 71.4L de etanol
  const fatorRendimento = paridadePercentual / 100;
  const custoGasolinaTanque = tanqueLitros * gasolina;
  const custoEtanolEquivalente = (tanqueLitros / fatorRendimento) * etanol;
  const diferencaReais = Math.abs(custoGasolinaTanque - custoEtanolEquivalente);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">Calculadora Flex Inteligente</h2>
              <p className="text-xs text-slate-400">Etanol vs Gasolina na bomba</p>
            </div>
          </div>
          <button
            onClick={onFechar}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo */}
        <div className="p-5 space-y-4">
          {/* Inputs de Preço */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Gasolina (R$/L)
              </label>
              <input
                type="number"
                step="0.01"
                value={gasolina}
                onChange={(e) => setGasolina(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-base focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Etanol (R$/L)
              </label>
              <input
                type="number"
                step="0.01"
                value={etanol}
                onChange={(e) => setEtanol(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-base focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Ajuste de Rendimento do Carro */}
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1">
                Paridade do seu veículo: <strong>{paridadePercentual}%</strong>
              </span>
              <span className="text-[11px] text-slate-400">Padrão: 70%</span>
            </div>
            <input
              type="range"
              min="65"
              max="75"
              step="1"
              value={paridadePercentual}
              onChange={(e) => setParidadePercentual(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-slate-500" />
              O etanol custa atualmente <strong>{razaoAtual.toFixed(1)}%</strong> do valor da gasolina.
            </p>
          </div>

          {/* Veredito Visual */}
          <div
            className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
              etanolCompensa
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-wider">Resultado Recomendado</span>
            <h3 className="text-2xl font-black mt-1">
              {etanolCompensa ? 'ABASTEÇA COM ETANOL! 🌿' : 'ABASTEÇA COM GASOLINA! ⛽'}
            </h3>
            <p className="text-xs mt-2 text-slate-300">
              Economia estimada de <strong className="text-white">R$ {diferencaReais.toFixed(2)}</strong> a cada tanque cheio ({tanqueLitros}L equivalentes).
            </p>
          </div>
        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            onClick={onFechar}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-900/30"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
