import { useEffect, useMemo, useState } from 'react';
import {
  Cotacao,
  DashboardCard,
  Fornecedor,
  getDashboardCompras,
  getFornecedores,
  getListasBasicas,
  ListasBasicas,
  listarCotacoes,
  criarCotacao,
  enviarCotacoes,
} from './services/appsScriptClient';

type Aba = 'compras' | 'cotacoes' | 'recebimento';

function App() {
  const [aba, setAba] = useState<Aba>('compras');
  const [cards, setCards] = useState<DashboardCard[]>([]);
  const [cotacoes, setCotacoes] = useState<Cotacao[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [listas, setListas] = useState<ListasBasicas | null>(null);
  const [cardSelecionado, setCardSelecionado] = useState<DashboardCard | null>(null);
  const [cotacaoEnviando, setCotacaoEnviando] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const resumo = useMemo(() => {
    const totalComprar = cards.reduce((acc, item) => acc + item.qtdAComprar, 0);
    return {
      itensComprar: cards.length,
      totalComprar,
      cotacoesPendentes: cotacoes.filter((cotacao) => cotacao.status === 'Criada').length,
    };
  }, [cards, cotacoes]);

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro(null);

      const [dashboard, listasBasicas, cotacoesResponse, fornecedoresResponse] = await Promise.all([
        getDashboardCompras(30),
        getListasBasicas(),
        listarCotacoes(30),
        getFornecedores('', 200),
      ]);

      setCards(dashboard.cards);
      setListas(listasBasicas);
      setCotacoes(cotacoesResponse.cotacoes);
      setFornecedores(fornecedoresResponse.fornecedores.filter((fornecedor) => fornecedor.email));
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao carregar dados.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function handleCriarCotacao(payload: {
    item: DashboardCard;
    quantidadeSolicitada: number;
    embalagem: string;
    fornecedores: Fornecedor[];
  }) {
    try {
      setErro(null);
      setSucesso(null);

      const response = await criarCotacao({
        codigoItem: payload.item.codigo,
        descricaoItem: payload.item.descricao,
        estoqueAtual: payload.item.estoqueAtual,
        estoqueMinimo: payload.item.estoqueMinimo,
        estoqueMaximo: payload.item.estoqueMaximo,
        quantidadeSugerida: payload.item.qtdAComprar,
        quantidadeSolicitada: payload.quantidadeSolicitada,
        embalagem: payload.embalagem,
        fornecedores: payload.fornecedores.map((fornecedor) => ({
          codigo: fornecedor.codigo,
          nome: fornecedor.nome,
          email: fornecedor.email,
        })),
      });

      setSucesso(
        `Cotação ${response.idCotacao} criada para ${response.fornecedoresCriados.length} fornecedor(es). Nenhum e-mail foi enviado.`,
      );
      setCardSelecionado(null);
      setAba('cotacoes');
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao criar cotação.');
    }
  }

  async function handleEnviarCotacao(idCotacao: string) {
    try {
      setErro(null);
      setSucesso(null);
      setCotacaoEnviando(idCotacao);

      const response = await enviarCotacoes(idCotacao);

      setSucesso(
        `${response.idCotacao} marcada como ${response.status}. Fornecedores atualizados: ${response.fornecedoresAtualizados}. Nenhum e-mail real foi enviado.`,
      );
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao enviar cotação.');
    } finally {
      setCotacaoEnviando(null);
    }
  }

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
      {sucesso ? <div className="success">{sucesso}</div> : null}

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

      {!carregando && aba === 'compras' ? (
        <Compras cards={cards} onEmitirCotacao={setCardSelecionado} />
      ) : null}
      {!carregando && aba === 'cotacoes' ? (
        <Cotacoes cotacoes={cotacoes} onEnviarCotacao={handleEnviarCotacao} cotacaoEnviando={cotacaoEnviando} />
      ) : null}
      {!carregando && aba === 'recebimento' ? <Recebimento /> : null}

      {cardSelecionado ? (
        <EmitirCotacaoModal
          item={cardSelecionado}
          embalagens={listas?.embalagens || []}
          fornecedores={fornecedores}
          onClose={() => setCardSelecionado(null)}
          onConfirm={handleCriarCotacao}
        />
      ) : null}
    </main>
  );
}

function Compras({
  cards,
  onEmitirCotacao,
}: {
  cards: DashboardCard[];
  onEmitirCotacao: (item: DashboardCard) => void;
}) {
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
            <button className="primary-button" type="button" onClick={() => onEmitirCotacao(item)}>
              Emitir cotação
            </button>
            <button className="secondary-button" type="button">Ver detalhes</button>
          </div>
        </article>
      ))}
    </section>
  );
}

function EmitirCotacaoModal({
  item,
  embalagens,
  fornecedores,
  onClose,
  onConfirm,
}: {
  item: DashboardCard;
  embalagens: string[];
  fornecedores: Fornecedor[];
  onClose: () => void;
  onConfirm: (payload: {
    item: DashboardCard;
    quantidadeSolicitada: number;
    embalagem: string;
    fornecedores: Fornecedor[];
  }) => Promise<void>;
}) {
  const [quantidade, setQuantidade] = useState(String(item.qtdAComprar || ''));
  const [embalagem, setEmbalagem] = useState(embalagens[0] || '');
  const [fornecedorCodigo, setFornecedorCodigo] = useState('');
  const [fornecedoresSelecionados, setFornecedoresSelecionados] = useState<Fornecedor[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erroModal, setErroModal] = useState<string | null>(null);

  const fornecedorSelecionado = fornecedores.find((fornecedor) => fornecedor.codigo === fornecedorCodigo);

  function adicionarFornecedor() {
    if (!fornecedorSelecionado) {
      setErroModal('Selecione um fornecedor para adicionar.');
      return;
    }

    const jaAdicionado = fornecedoresSelecionados.some(
      (fornecedor) => fornecedor.codigo === fornecedorSelecionado.codigo,
    );

    if (jaAdicionado) {
      setErroModal('Este fornecedor já foi adicionado à cotação.');
      return;
    }

    setFornecedoresSelecionados((atuais) => [...atuais, fornecedorSelecionado]);
    setFornecedorCodigo('');
    setErroModal(null);
  }

  function removerFornecedor(codigo: string) {
    setFornecedoresSelecionados((atuais) => atuais.filter((fornecedor) => fornecedor.codigo !== codigo));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const quantidadeNumero = Number(quantidade.replace(',', '.'));

    if (!quantidadeNumero || quantidadeNumero <= 0) {
      setErroModal('Informe uma quantidade maior que zero.');
      return;
    }

    if (!embalagem) {
      setErroModal('Selecione uma embalagem.');
      return;
    }

    if (!fornecedoresSelecionados.length) {
      setErroModal('Adicione pelo menos um fornecedor à cotação.');
      return;
    }

    try {
      setSalvando(true);
      setErroModal(null);
      await onConfirm({
        item,
        quantidadeSolicitada: quantidadeNumero,
        embalagem,
        fornecedores: fornecedoresSelecionados,
      });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="emitir-cotacao-title">
        <div className="modal-header">
          <div>
            <h2 id="emitir-cotacao-title">Emitir cotação</h2>
            <p>{item.descricao}</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </div>

        {erroModal ? <div className="error">{erroModal}</div> : null}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Quantidade disponível para compra
            <input value={quantidade} onChange={(event) => setQuantidade(event.target.value)} />
            <small>Sugestão: {item.qtdAComprar.toLocaleString('pt-BR')}</small>
          </label>

          <label>
            Embalagem
            <select value={embalagem} onChange={(event) => setEmbalagem(event.target.value)}>
              <option value="">Selecione...</option>
              {embalagens.map((opcao) => (
                <option key={opcao} value={opcao}>{opcao}</option>
              ))}
            </select>
          </label>

          <label>
            Fornecedor
            <select value={fornecedorCodigo} onChange={(event) => setFornecedorCodigo(event.target.value)}>
              <option value="">Selecione...</option>
              {fornecedores.map((fornecedor) => (
                <option key={fornecedor.codigo} value={fornecedor.codigo}>
                  {fornecedor.nome}
                </option>
              ))}
            </select>
          </label>

          <label>
            E-mail
            <input value={fornecedorSelecionado?.email || ''} readOnly placeholder="Preenchido automaticamente" />
          </label>

          <div className="full-width">
            <button className="secondary-button" type="button" onClick={adicionarFornecedor}>
              Adicionar fornecedor à cotação
            </button>
          </div>

          <div className="full-width selected-suppliers">
            <strong>Fornecedores adicionados</strong>
            {fornecedoresSelecionados.length ? (
              <div className="supplier-list">
                {fornecedoresSelecionados.map((fornecedor) => (
                  <div className="supplier-chip" key={fornecedor.codigo}>
                    <span>{fornecedor.nome}</span>
                    <small>{fornecedor.email}</small>
                    <button type="button" onClick={() => removerFornecedor(fornecedor.codigo)}>Remover</button>
                  </div>
                ))}
              </div>
            ) : (
              <p>Nenhum fornecedor adicionado ainda.</p>
            )}
          </div>

          <div className="notice full-width">
            Este botão apenas cria a cotação no app. Nenhum e-mail será enviado nesta etapa.
          </div>

          <div className="modal-actions full-width">
            <button className="secondary-button" type="button" onClick={onClose}>Cancelar</button>
            <button className="primary-button" type="submit" disabled={salvando}>
              {salvando ? 'Salvando...' : 'Criar cotação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Cotacoes({
  cotacoes,
  onEnviarCotacao,
  cotacaoEnviando,
}: {
  cotacoes: Cotacao[];
  onEnviarCotacao: (idCotacao: string) => void;
  cotacaoEnviando: string | null;
}) {
  if (!cotacoes.length) {
    return <div className="notice">Nenhuma cotação criada pelo aplicativo até agora.</div>;
  }

  return (
    <section className="card-grid">
      {cotacoes.map((cotacao) => {
        const podeEnviar = cotacao.status === 'Criada';
        const enviandoEsta = cotacaoEnviando === cotacao.idCotacao;

        return (
          <article className="card" key={cotacao.idCotacao}>
            <h2>{cotacao.descricaoItem}</h2>
            <p><strong>ID:</strong> {cotacao.idCotacao}</p>
            <p><strong>Status:</strong> {cotacao.status}</p>
            <p><strong>Quantidade:</strong> {cotacao.quantidadeSolicitada.toLocaleString('pt-BR')}</p>
            <p><strong>Embalagem:</strong> {cotacao.embalagem}</p>
            <p><strong>Fornecedores:</strong> {cotacao.fornecedores.length}</p>
            <div className="card-actions">
              <button
                className="primary-button"
                type="button"
                disabled={!podeEnviar || enviandoEsta}
                onClick={() => onEnviarCotacao(cotacao.idCotacao)}
              >
                {enviandoEsta ? 'Enviando...' : podeEnviar ? 'Enviar cotação' : 'Cotação enviada'}
              </button>
              <button className="secondary-button" type="button">Responder fornecedor</button>
            </div>
          </article>
        );
      })}
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
