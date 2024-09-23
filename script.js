let currentUser = null; // Variável global para armazenar os dados do usuário atual
let supabaseData = null; // Variável global para armazenar os dados do Supabase

const SUPABASE_URL = 'https://eunburxiqtzftppqvxtr.supabase.co'; // Substitua pela sua URL do Supabase
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1bmJ1cnhpcXR6ZnRwcHF2eHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU1Njc3MzEsImV4cCI6MjA0MTE0MzczMX0.y-EgwTJ-uEzbLa_bTSzbEN10dSyTVrSJ27zrl51MLKc'; // Substitua pela sua chave de API do Supabase
const TABLE_NAME = 'atm-dadosDoubleTap';

// Função para buscar dados do Supabase e atualizar o ranking
async function fetchData() {
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    let { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*');
    console.log('Dados do Supabase:', data);
    if (error) {
        console.error('Erro ao consultar o Supabase:', error);
    } else if (data.length === 0) {
        console.warn('Nenhum dado encontrado na tabela workez.');
    }
    supabaseData = data; // Armazena os dados do Supabase
}

// Verifica se a biblioteca do Supabase está carregada
if (window.supabase) {
    document.addEventListener('DOMContentLoaded', () => {
        fetchData();

        // Função para receber mensagens do site principal
        window.addEventListener('message', (event) => {
            if (event.data.type === 'USER_INFO') {
                const user = event.data.user;
                // Definir o usuário atual
                currentUser = user;
                console.log('Usuário atual:', currentUser);
            }
        });
    });
} else {
    console.error('A biblioteca do Supabase não está carregada.');
}

let businessTerms = [
    { term: "Empreendedorismo", explanation: "Ato de criar e gerenciar novos negócios visando lucro e inovação." },
    { term: "Marketing Digital", explanation: "Estratégias de promoção online para alcançar o público-alvo." },
    { term: "Pitch", explanation: "Apresentação rápida de uma ideia de negócio a investidores." },
    { term: "Branding", explanation: "Processo de construção e gestão da marca de uma empresa." },
    { term: "Networking", explanation: "Criação e manutenção de uma rede de contatos profissionais." },
    { term: "Escalabilidade", explanation: "Capacidade de um negócio crescer sem perder eficiência." },
    { term: "ROI", explanation: "Retorno sobre o investimento." },
    { term: "Growth Hacking", explanation: "Técnicas criativas para aumentar o crescimento rapidamente." },
    { term: "Lead", explanation: "Potencial cliente interessado no produto ou serviço." },
    { term: "SEO", explanation: "Otimização de motores de busca para melhorar a visibilidade online." },
    { term: "B2B", explanation: "Negócio entre duas empresas (business to business)." },
    { term: "B2C", explanation: "Negócio entre empresa e consumidor final (business to consumer)." },
    { term: "CAC", explanation: "Custo de Aquisição de Cliente." },
    { term: "Churn", explanation: "Taxa de cancelamento de clientes." },
    { term: "KPIs", explanation: "Indicadores-chave de desempenho para medir o sucesso de uma ação." },
    { term: "Funnel", explanation: "Estratégia que acompanha o cliente desde a atração até a compra." },
    { term: "Conversão", explanation: "Transformação de um lead em cliente pagante." },
    { term: "Call to Action (CTA)", explanation: "Chamada para ação que incentiva o usuário a executar algo específico." },
    { term: "Inbound Marketing", explanation: "Atração de clientes através de conteúdo relevante e valioso." },
    { term: "Outbound Marketing", explanation: "Marketing tradicional que vai atrás do cliente (ex.: anúncios)." },
    { term: "Persona", explanation: "Representação fictícia do cliente ideal para orientar a comunicação da marca." },
    { term: "Landing Page", explanation: "Página específica criada para conversão em uma campanha de marketing." },
    { term: "Viral Marketing", explanation: "Técnica de marketing que incentiva a propagação de uma mensagem de forma rápida." },
    { term: "Benchmarking", explanation: "Comparação das práticas de uma empresa com as melhores do mercado." },
    { term: "Lean Startup", explanation: "Metodologia que visa reduzir desperdícios e desenvolver produtos viáveis rapidamente." },
    { term: "Revenue", explanation: "Receita gerada por uma empresa." },
    { term: "Break Even", explanation: "Ponto de equilíbrio onde as receitas se igualam aos custos." },
    { term: "Escrow", explanation: "Serviço financeiro que retém pagamento até que as condições de um contrato sejam cumpridas." },
    { term: "Crowdfunding", explanation: "Financiamento coletivo onde várias pessoas investem em um projeto ou empresa." },
    { term: "Spin-off", explanation: "Criação de uma nova empresa a partir de uma divisão de uma empresa existente." },
    { term: "Stakeholders", explanation: "Todas as partes interessadas que afetam ou são afetadas pelas operações de uma empresa." },
    { term: "IPO", explanation: "Oferta pública inicial, quando uma empresa abre seu capital para o mercado de ações." },
    { term: "Joint Venture", explanation: "Parceria entre empresas para um projeto específico, mantendo a independência." },
    { term: "Valuation", explanation: "Avaliação do valor de mercado de uma empresa." },
    { term: "Bootstrapping", explanation: "Financiar um negócio sem recorrer a investidores externos, usando apenas recursos próprios." },
    { term: "MVP", explanation: "Produto mínimo viável para testar hipóteses com menor esforço possível." },
    { term: "Capital de Risco", explanation: "Investimento em startups e empresas inovadoras de alto risco." },
    { term: "Due Diligence", explanation: "Processo de investigação detalhada antes de uma aquisição ou investimento." }
];

let score = 0;
let timeLeft = 30; // 1 minuto
let selectedTerm = null; // Controla o termo selecionado

// Função para embaralhar os itens
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Função para carregar os termos e explicações
function loadWords() {
    const businessColumn = document.getElementById("business-terms");
    const explanationColumn = document.getElementById("explanations");

    // Limpa as colunas
    businessColumn.innerHTML = "";
    explanationColumn.innerHTML = "";

    // Pega 5 pares aleatórios e embaralha
    shuffleArray(businessTerms);
    const currentPairs = businessTerms.slice(0, 5); // Pega 5 pares

    // Coloca os termos e explicações embaralhados na tela
    const terms = currentPairs.map(pair => pair.term);
    const explanations = currentPairs.map(pair => pair.explanation);
    shuffleArray(terms);
    shuffleArray(explanations);

    terms.forEach((term, index) => {
        const termButton = document.createElement("button");
        termButton.textContent = term;
        termButton.dataset.index = currentPairs.findIndex(pair => pair.term === term);
        termButton.classList.add("term-button");
        businessColumn.appendChild(termButton);
    });

    explanations.forEach((explanation, index) => {
        const explanationButton = document.createElement("button");
        explanationButton.textContent = explanation;
        explanationButton.dataset.index = currentPairs.findIndex(pair => pair.explanation === explanation);
        explanationButton.classList.add("explanation-button");
        explanationColumn.appendChild(explanationButton);
    });

    addClickEvents();
}

// Função para gerenciar os cliques e correspondência de termos e explicações
function addClickEvents() {
    const termButtons = document.querySelectorAll(".term-button");
    const explanationButtons = document.querySelectorAll(".explanation-button");

    termButtons.forEach(button => {
        button.addEventListener("click", function () {
            if (!selectedTerm) {
                selectedTerm = this;
                this.style.backgroundColor = "#FFD700"; // Destaca o termo selecionado
            }
        });
    });

    explanationButtons.forEach(button => {
        button.addEventListener("click", function () {
            if (selectedTerm && selectedTerm.dataset.index === this.dataset.index) {
                // Correspondência correta
                selectedTerm.classList.add("correct");
                this.classList.add("correct");

                // Aguarda a transição para desaparecer os botões
                setTimeout(() => {
                    selectedTerm.classList.add("correct-disappear");
                    this.classList.add("correct-disappear");
                    loadWords(); // Recarrega a grade após a correspondência
                    selectedTerm = null;
                }, 500);

                score++; // Incrementa a pontuação
                document.getElementById("score").textContent = `Pontuação: ${score}`;
            } else if (selectedTerm) {
                // Correspondência incorreta
                selectedTerm.classList.add("wrong");
                this.classList.add("wrong")
                console.log(this.classList);

                // Reseta a seleção incorreta após um tempo
                setTimeout(() => {
                    selectedTerm.classList.remove("wrong");
                    this.classList.remove("wrong");
                    selectedTerm.style.backgroundColor = "#2c2c2e"; // Reseta o fundo para o original
                    selectedTerm = null;
                }, 500);
            }
        });
    });
}

async function displayRanking() {
    if (supabaseData) {
        console.log('Dados do Supabase:', supabaseData); // Log dos dados do Supabase

        // Filtra os dados para incluir apenas usuários com score definido
        const filteredData = supabaseData.filter(user => user.ranking.score !== undefined && user.ranking.score !== null);
        console.log('Dados filtrados:', filteredData); // Log dos dados filtrados
        
        // Ordena os dados pelo score em ordem decrescente
        const sortedData = filteredData.sort((a, b) => b.ranking.score - a.ranking.score);
        console.log('Dados ordenados:', sortedData); // Log dos dados ordenados
        
        // Pega os top 3
        const top3 = sortedData.slice(0, 3);
        console.log('Top 3:', top3); // Log dos top 3

        // Cria a estrutura HTML para exibir o ranking
        const rankingContainer = document.getElementById('rankingContainer');
        rankingContainer.innerHTML = ''; // Limpa o conteúdo anterior

        top3.forEach(user => {
            const userElement = document.createElement('div');
            userElement.textContent = `${user.name}: ${user.ranking.score}`;
            rankingContainer.appendChild(userElement);
        });
    } else {
        console.warn('supabaseData está vazio ou indefinido.');
    }
}
function startTimer() {
    const timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").textContent = `Tempo: ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert(`Tempo esgotado! Sua pontuação final foi: ${score}`);

            // Verifica se o ID do usuário existe no Supabase
            if (currentUser) {
                const userExists = supabaseData.some(user => user.id === currentUser.id);
                const userData = supabaseData.find(user => user.id === currentUser.id);
                
                if (userExists && userData.ranking.score < score) {
                    // Atualiza o score se o novo score for maior
                    const url = 'https://webhook.workez.online/webhook/939cda9f-fe23-4d1c-9c88-883f1be420e6';
                    fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            name: currentUser.name,
                            id: currentUser.id,
                            score: score
                        })
                    })
                    .then(response => response.json())
                    .then(async data => {
                        console.log('Sucesso:', data);
                        // Aguarda 2 segundos antes de buscar os dados novamente
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        await fetchData(); // Atualiza os dados do Supabase
                        // Exibe o ranking após enviar os dados
                        displayRanking();
                    })
                    .catch((error) => console.error('Erro:', error));
                } else if (!userExists) {
                    // Cria um novo registro se o usuário não existir
                    const url = 'https://webhook.workez.online/webhook/90663608-b1d7-48b6-bdbd-3892ff7b3788';
                    fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            name: currentUser.name,
                            id: currentUser.id,
                            score: score
                        })
                    })
                    .then(response => response.json())
                    .then(async data => {
                        console.log('Sucesso:', data);
                        // Aguarda 2 segundos antes de buscar os dados novamente
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        await fetchData(); // Atualiza os dados do Supabase
                        // Exibe o ranking após enviar os dados
                        displayRanking();
                    })
                    .catch((error) => console.error('Erro:', error));
                } else {
                    // Exibe o ranking sem atualizar o score
                    displayRanking();
                }
            } else {
                console.error('Usuário atual não está definido.');
                // Exibe o ranking mesmo que o usuário não esteja definido
                displayRanking();
            }
        }
    }, 1000);
}

// Inicia o jogo e o cronômetro
loadWords();
startTimer();