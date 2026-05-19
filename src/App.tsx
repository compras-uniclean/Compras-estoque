import { useEffect, useMemo, useState } from 'react';
import {
  DashboardCard,
  Cotacao,
  getDashboardCompras,
  getListasBasicas,
  listarCotacoes,
  ListasBasicas,
} from './services/appsScriptClient';

type Aba = 'compras' | 'cotacoes' | 'recebimento';

function App() {
  const [aba, setAba] = useState<Aba>('compras');
  const [cards, setCards] = useState<DashboardCard[]>([]);
  const [cotacoes, setCotacoes] = useState<Cotacao[]>([]);
  const [listas, setListas] = useState<ListasBasicas | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const resumo = useMemo(() => {
    const totalComprar = cards.reduce((acc, item) => acc + item.qtdAComprar, 0);
    return {
      itensComprar: cards.length,
      totalComprar,
      cotacoesPendentes: cotacoes.filter((cotacao) => cotacao.status === 'Criada').length,
    };
  }, [cards, cotacoes]);

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        setErro(null);

        const [dashboard, listasBasicas, cotacoesResponse] = await Promise.all([
          getDashboardCompras(30),
          getListasBasicas(),
          listarCotacoes(30),
        ]);

        setCards(dashboard.cards);
        setListas(listasBasicas);
        setCotacoes(cotacoesResponse.cotacoes);
      } catch (error) {
        setErro(error instanceof Error ? error.message : 'Erro ao carregar dados.');
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <h1>Compras e Estoque</h1>
          <p>Controle de reposição, cotações e recebimentos da Uniclean.</p>
        </div>
        <span className="status-pill">Modo teste</span>
      </header>

      {erro ? <div className="error">{erro}</div> : null}

      <section className="card-grid" style={{ marginBottom: 20 }}>
        <div className="card">
          <h3>Itens para comprar</h3>
          <div className="metric-row">
            <div className="metric">
              <strong>{resumo.itensComprar}</strong>
              <span>cards encontrados</span>
            </div>
            <div className="metric">
              <strong>{resumo.totalComprar.toLocaleString('pt-BR')}</strong>
              <span>qtd. sugerida total</span>
            </div>
          </div>
        </div>
        <div className="card">
          <h3>Cotações</h3>
          <div className="metric-row">
            <div className="metric">
              <strong>{cotacoes.length}</strong>
              <span>criadas no app</span>
            </div>
            <div className="metric">
              <strong>{resumo.cotacoesPendentes}</strong>
              <span>pendentes</span>
            </div>
          </div>
        </div>
      </section>

      <nav className="tabs">
        <button className={`tab-button ${aba === 'compras' ? 'active' : ''}`} onClick={() => setAba('compras')}>
          Comprar
        </button>
        <button className={`tab-button ${aba === 'cotacoes' ? 'active' : ''}`} onClick={() => setAba('cotacoes')}>
          Cotações
        </button>
        <button className={`tab-button ${aba === 'recebimento' ? 'active' : ''}`} onClick={() => setAba('recebimento')}>
          Recebimento
        </button>
      </nav>

      {carregando ? <div className="notice">Carregando dados das planilhas...</div> : null}

      {!carregando && aba === 'compras' ? <Compras cards={cards} embalagens={listas?.embalagens || []} /> : null}
      {!carregando && aba === 'cotacoes' ? <Cotacoes cotacoes={cotacoes} /> : null}
      {!carregando && aba === 'recebimento' ? <Recebimento /> : null}
    </main>
  );
}

function Compras({ cards, embalagens }: { cards: DashboardCard[]; embalagens: string[] }) {
  if (!cards.length) {
    return <div className="notice">Nenhum item com necessidade de compra foi encontrado.</div>;
  }

  return (
    <section className="card-grid">
      {cards.map((item) => (
        <article className="card" key={`${item.codigo}-${item.descricao}`}>
          <h2>{item.descricao}</h2>
          <p><strong>Código:</strong> {item.codigo}</p>
          <p><strong>Tipo:</strong> {item.tipo}</p>
          <p><strong>Situação:</strong> {item.situacao}</p>

          <div className="metric-row">
            <div className="metric">
              <strong>{item.qtdAComprar.toLocaleString('pt-BR')}</strong>
              <span>qtd. a comprar</span>
            </div>
            <div className="metric">
              <strong>{item.disponivel.toLocaleString('pt-BR')}</strong>
              <span>disponível</span>
            </div>
            <div className="metric">
              <strong>{item.estoqueMinimo.toLocaleString('pt-BR')}</strong>
              <span>mínimo</span>
            </div>
            <div className="metric">
              <strong>{item.estoqueMaximo.toLocaleString('pt-BR')}</strong>
              <span>máximo</span>
            </div>
          </div>

          <div className="card-actions">
            <button className="primary-button" type="button">Emitir cotação</button>
            <button className="secondary-button" type="button">Ver detalhes</button>
          </div>
        </article>
      ))}
      {embalagens.length ? (
        <div className="notice">Embalagens carregadas: {embalagens.join(', ')}</div>
      ) : null}
    </section>
  );
}

function Cotacoes({ cotacoes }: { cotacoes: Cotacao[] }) {
  if (!cotacoes.length) {
    return <div className="notice">Nenhuma cotação criada pelo aplicativo até agora.</div>;
  }

  return (
    <section className="card-grid">
      {cotacoes.map((cotacao) => (
        <article className="card" key={cotacao.idCotacao}>
          <h2>{cotacao.descricaoItem}</h2>
          <p><strong>ID:</strong> {cotacao.idCotacao}</p>
          <p><strong>Status:</strong> {cotacao.status}</p>
          <p><strong>Quantidade:</strong> {cotacao.quantidadeSolicitada.toLocaleString('pt-BR')}</p>
          <p><strong>Embalagem:</strong> {cotacao.embalagem}</p>
          <p><strong>Fornecedores:</strong> {cotacao.fornecedores.length}</p>
          <div className="card-actions">
            <button className="primary-button" type="button">Enviar cotação</button>
            <button className="secondary-button" type="button">Responder fornecedor</button>
          </div>
        </article>
      ))}
    </section>
  );
}

function Recebimento() {
  return (
    <div className="notice">
      O dashboard de recebimento será ligado na próxima etapa, após criarmos as ações de ordens de compra e recebimentos no Apps Script.
    </div>
  );
}

export default App;
