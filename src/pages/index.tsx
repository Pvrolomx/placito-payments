import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { paymentConfig } from '@/lib/config';

export default function Home() {
  const router = useRouter();
  const { client, services, amount: presetAmount } = router.query;
  
  const [amount, setAmount] = useState('');
  const [showWire, setShowWire] = useState(false);
  const [showOther, setShowOther] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const displayAmount = presetAmount ? String(presetAmount) : amount;
  const hasInvoice = client || services || presetAmount;
  const canPay = displayAmount && parseFloat(displayAmount) > 0;

  const handlePayWithCard = async () => {
    if (!canPay) {
      alert('Ingresa un monto');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: { name: client?.toString() || 'Pago Rápido' },
          services: [{ 
            description: services?.toString() || 'Pago', 
            amount: parseFloat(displayAmount) 
          }],
          total: parseFloat(displayAmount),
          currency: 'MXN',
        }),
      });
      
      if (res.ok) {
        const invoice = await res.json();
        router.push(`/pay/${invoice.slug}`);
      } else {
        alert('Error al crear pago. Intenta de nuevo.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Error al crear pago. Intenta de nuevo.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FFFBF0] py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-light tracking-wide text-[#2C1810] mb-1">
            CARPINTERÍA PLACITO
          </h1>
          <p className="text-[#8B6914] text-sm italic">Desde 1982</p>
        </div>

        {/* Payment Card */}
        <div className="bg-white rounded-lg shadow-sm border border-[#e8dcc8] p-8">
          {/* Invoice info if present */}
          {hasInvoice && (
            <div className="mb-6 pb-6 border-b border-[#e8dcc8]">
              {client && (
                <div className="mb-3">
                  <label className="block text-xs uppercase tracking-wider text-[#8B6914] mb-1">Cliente</label>
                  <p className="text-[#2C1810] font-medium">{client}</p>
                </div>
              )}
              {services && (
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#8B6914] mb-1">Concepto</label>
                  <p className="text-[#5a4a3a]">{services}</p>
                </div>
              )}
            </div>
          )}

          {/* Amount */}
          <div className="mb-8">
            <label className="block text-xs uppercase tracking-wider text-[#8B6914] mb-2">
              Monto
            </label>
            <div className="flex items-center border-b-2 border-[#e8dcc8] focus-within:border-[#8B6914] transition-colors">
              <span className="text-2xl text-[#A0784C] mr-2">$</span>
              <input
                type="number"
                placeholder="0.00"
                className="flex-1 text-2xl text-[#2C1810] py-2 focus:outline-none bg-transparent"
                value={displayAmount}
                onChange={(e) => setAmount(e.target.value)}
                readOnly={!!presetAmount}
              />
              <span className="text-[#8B6914] text-sm">MXN</span>
            </div>
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePayWithCard}
            disabled={!canPay || loading}
            className={`block w-full text-white text-center py-4 rounded transition-colors mb-4 ${
              canPay && !loading
                ? 'bg-[#2C1810] hover:bg-[#3d2e1e] cursor-pointer'
                : 'bg-[#c4b69a] cursor-not-allowed'
            }`}
          >
            {loading ? 'Procesando...' : 'Pagar con Tarjeta'}
          </button>

          {/* Wire Transfer */}
          <div className="border-t border-[#e8dcc8] pt-4">
            <button
              onClick={() => setShowWire(!showWire)}
              className="w-full flex justify-between items-center text-[#5a4a3a] hover:text-[#2C1810] text-sm py-2"
            >
              <span>Transferencia Bancaria</span>
              <span className="text-xs">{showWire ? '▲' : '▼'}</span>
            </button>
            {showWire && (
              <div className="mt-3 space-y-3 text-sm text-[#5a4a3a] bg-[#F5F0E8] p-4 rounded-lg">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#8B6914]">Beneficiario</span>
                  <p className="font-medium text-[#2C1810]">{paymentConfig.wire.beneficiary}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#8B6914]">CLABE</span>
                  <p className="font-mono text-[#2C1810]">{paymentConfig.wire.clabe}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#8B6914]">Banco</span>
                  <p className="text-[#2C1810]">{paymentConfig.wire.bank}</p>
                </div>
                <p className="text-xs text-[#8B6914] italic mt-2">
                  Envía el comprobante por WhatsApp al {paymentConfig.whatsapp}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[#c4b69a] text-xs mt-8 tracking-wider">
          PUERTO VALLARTA · <a href="/admin" className="hover:text-[#8B6914]">MMXXVI</a>
        </p>
      </div>
    </div>
  );
}
