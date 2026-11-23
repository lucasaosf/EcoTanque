import React, { useState } from 'react';
import { X, QrCode, Edit, CheckCircle, Sparkles } from 'lucide-react';
import type { Posto, CombustivelTipo } from '../types';
import { processarQRCodeNFCe } from '../services/postoService';

interface ModalAtualizarPrecoProps {
  aberto: boolean;
  onFechar: () => void;
  postos: Posto[];
  postoSelecionado?: Posto | null;
  onSalvarPreco: (postoId: string, combustivel: CombustivelTipo, novoPreco: number, fonte: Posto['fonte']) => void;
}

export const ModalAtualizarPreco: React.FC<ModalAtualizarPrecoProps> = ({
  aberto,
  onFechar,
  postos,
  postoSelecionado,
  onSalvarPreco,
}) => {
  const [aba, setAba] = useState<'manual' | 'nfce'>('manual');
  const [idPosto, setIdPosto] = useState<string>(postoSelecionado?.id || postos[0]?.id || '');
  const [combustivel, setCombustivel] = useState<CombustivelTipo>('gasolina_comum');
  const [novoPreco, setNovoPreco] = useState<string>('');
  const [urlQRCode, setUrlQRCode] = useState<string>('');
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  if (!aberto) return null;

  const handleSalvarManual = (e: React.FormEvent) => {
    e.preventDefault();
    const precoNum = parseFloat(novoPreco.replace(',', '.'));
    if (!precoNum || precoNum <= 0) return;

    onSalvarPreco(idPosto, combustivel, precoNum, 'Colaborativo');
    setMensagemSucesso('Preço atualizado com sucesso pela comunidade!');
    setTimeout(() => {
      setMensagemSucesso(null);
      onFechar();
    }, 1500);
  };

  const handleProcessarNFCe = () => {
    const resultado = processarQRCodeNFCe(urlQRCode || 'https://www.sefaz.rs.gov.br/NFCE/NFCE-COM.aspx?p=43231193015006004402651150005432101000543210');
    if (resultado.sucesso && resultado.dados) {
      onSalvarPreco(idPosto, resultado.dados.combustivel, resultado.dados.valorUnitario, 'NFC-e (SEFAZ)');
      setMensagemSucesso(`NFC-e validada! Preço R$ ${resultado.dados.valorUnitario.toFixed(2)} sincronizado direto da SEFAZ.`);
      setTimeout(() => {
        setMensagemSucesso(null);
        onFechar();
      }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Topo */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">Atualizar Preço em Tempo Real</h2>
              <p className="text-xs text-slate-400">Colabore ou envie o cupom fiscal (NFC-e)</p>
            </div>
          </div>
          <button
            onClick={onFechar}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas */}
        <div className="grid grid-cols-2 p-2 bg-slate-950/60 border-b border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setAba('manual')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              aba === 'manual'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Edit className="w-4 h-4" />
            Informar Manualmente
          </button>
          <button
            onClick={() => setAba('nfce')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              aba === 'nfce'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            QR Code NFC-e (SEFAZ)
          </button>
        </div>

        {/* Mensagem de Sucesso */}
        {mensagemSucesso && (
          <div className="m-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-emerald-300 text-xs font-medium">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{mensagemSucesso}</span>
          </div>
        )}

        {/* Formulário */}
        <div className="p-5">
          {aba === 'manual' ? (
            <form onSubmit={handleSalvarManual} className="space-y-4">
              {/* Seleção do Posto */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Selecione o Posto
                </label>
                <select
                  value={idPosto}
                  onChange={(e) => setIdPosto(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                >
                  {postos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} ({p.bandeira}) - {p.bairro}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seleção do Combustível */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tipo de Combustível
                  </label>
                  <select
                    value={combustivel}
                    onChange={(e) => setCombustivel(e.target.value as CombustivelTipo)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="gasolina_comum">Gasolina Comum</option>
                    <option value="gasolina_aditivada">Gasolina Aditivada</option>
                    <option value="etanol">Etanol</option>
                    <option value="diesel_s10">Diesel S10</option>
                    <option value="gnv">GNV</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Novo Preço (R$/Litro)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 5.49"
                    value={novoPreco}
                    onChange={(e) => setNovoPreco(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-900/30"
                >
                  Confirmar e Salvar Preço
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                  Validação Oficial via SEFAZ
                </div>
                <p>
                  Ao escanear a Nota Fiscal de Consumidor Eletrônica (NFC-e) impressa pelo posto, o sistema obtém o preço oficial pago na bomba em tempo real com 100% de confiabilidade.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cole o link ou chave de 44 dígitos da NFC-e
                </label>
                <input
                  type="text"
                  placeholder="https://sefaz.gov.br/... ou chave de acesso"
                  value={urlQRCode}
                  onChange={(e) => setUrlQRCode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleProcessarNFCe}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md"
                >
                  Validar Cupom Fiscal
                </button>
                <button
                  onClick={() => {
                    setUrlQRCode('https://www.sefaz.rs.gov.br/NFCE/NFCE-COM.aspx?p=43231193015006004402651150005432101000543210');
                    handleProcessarNFCe();
                  }}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-xl"
                  title="Simular leitura de QR Code real"
                >
                  Simular QR Code
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
