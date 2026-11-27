import { useState, useEffect } from 'react';
import { X, PackageSearch } from 'lucide-react';

export type PolicyTopic = 'entrega' | 'devolucao' | 'privacidade' | 'rastreio' | null;

interface PolicyModalProps {
  topic: PolicyTopic;
  onClose: () => void;
}

const POLICY_CONTENT: Record<
  Exclude<PolicyTopic, null | 'rastreio'>,
  { title: string; paragraphs: string[] }
> = {
  entrega: {
    title: 'Política de Frete e Entrega',
    paragraphs: [
      'Oferecemos Frete Grátis para todo o Brasil em todos os pedidos da Escova Alisadora e Modeladora Elétrica 5 em 1 Bivolt Profissional MultiGlam.',
      'Pedidos confirmados via PIX ou Cartão de Crédito têm prioridade de separação e despacho em até 24 horas úteis.',
      'O prazo médio de entrega após a postagem é de 2 a 5 dias úteis, variando conforme a região. Assim que o pedido for enviado, você receberá o código de rastreamento por e-mail e WhatsApp.',
    ],
  },
  devolucao: {
    title: 'Política de Troca, Garantia e Reembolso',
    paragraphs: [
      'Você possui 14 dias corridos após o recebimento da mercadoria para solicitar devolução gratuita por arrependimento, com estorno integral de 100% do valor pago.',
      'Além disso, o aparelho conta com garantia contra defeitos de fabricação. Caso o produto apresente qualquer irregularidade técnica, realizamos a substituição sem custos adicionais.',
      'Para solicitar troca ou reembolso, basta entrar em contato com nossa central de atendimento informando o número do pedido.',
    ],
  },
  privacidade: {
    title: 'Privacidade e Segurança de Dados',
    paragraphs: [
      'Todos os dados informados durante a navegação e finalização do pedido são protegidos por criptografia SSL e utilizados exclusivamente para processamento de pagamento, emissão de nota e entrega do produto.',
      'Não compartilhamos, vendemos ou cedemos seus dados pessoais a terceiros para fins publicitários.',
    ],
  },
};

export function PolicyModal({ topic, onClose }: PolicyModalProps) {
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingResult, setTrackingResult] = useState<string | null>(null);

  useEffect(() => {
    if (!topic) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [topic, onClose]);

  if (!topic) return null;

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;
    setTrackingResult(
      `Código ${trackingCode.trim().toUpperCase()}: Pedido em trânsito para o centro de distribuição local. Previsão de entrega dentro do prazo de 2 a 5 dias úteis.`
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-xl border border-zinc-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
          <h3 className="text-lg font-bold text-[#111113]">
            {topic === 'rastreio' ? 'Rastreie seu Pedido' : POLICY_CONTENT[topic].title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela"
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm text-zinc-600 leading-relaxed">
          {topic === 'rastreio' ? (
            <div className="space-y-4">
              <p>
                Digite abaixo o código de rastreamento ou número do pedido enviado para o seu
                e-mail após a confirmação da compra.
              </p>
              <form onSubmit={handleTrack} className="flex gap-2">
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="Ex: MG-48219 ou BR123456789"
                  className="flex-1 px-3.5 py-2.5 rounded-lg border border-zinc-300 text-zinc-900 focus:outline-none focus:border-[#028030]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-lg bg-[#111113] text-white font-semibold hover:bg-zinc-800 transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <PackageSearch className="w-4 h-4" />
                  <span>Consultar</span>
                </button>
              </form>
              {trackingResult && (
                <div className="p-3.5 rounded-lg bg-[#028030]/5 border border-[#028030]/20 text-zinc-800">
                  {trackingResult}
                </div>
              )}
            </div>
          ) : (
            POLICY_CONTENT[topic].paragraphs.map((text, idx) => <p key={idx}>{text}</p>)
          )}
        </div>
      </div>
    </div>
  );
}
