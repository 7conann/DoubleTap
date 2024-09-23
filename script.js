let currentUser = null; // Variável global para armazenar os dados do usuário atual
let supabaseData = null; // Variável global para armazenar os dados do Supabase
let perguntasData = null; // Variável global para armazenar os dados de perguntas do Supabase

const SUPABASE_URL = 'https://eunburxiqtzftppqvxtr.supabase.co'; // Substitua pela sua URL do Supabase
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1bmJ1cnhpcXR6ZnRwcHF2eHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU1Njc3MzEsImV4cCI6MjA0MTE0MzczMX0.y-EgwTJ-uEzbLa_bTSzbEN10dSyTVrSJ27zrl51MLKc'; // Substitua pela sua chave de API do Supabase
const TABLE_NAME = 'atm-dadosDoubleTap';
const TABLE_NAME_PERGUNTAS = 'modulos';

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
    await fetchDataPerguntas(); // Aguarda a busca de perguntas antes de continuar
    loadWords(); // Chama loadWords após os dados de perguntas serem carregados
}

// Função para buscar dados de perguntas do Supabase
async function fetchDataPerguntas() {
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    let { data, error } = await supabase
        .from(TABLE_NAME_PERGUNTAS)
        .select('*');
    console.log('Dados do Supabase Perguntas:', data);
    if (error) {
        console.error('Erro ao consultar o Supabase:', error);
    } else if (data.length === 0) {
        console.warn('Nenhum dado encontrado na tabela workez.');
    }
    perguntasData = data; // Armazena os dados de perguntas do Supabase
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

    if (!perguntasData) {
        console.warn('Dados de perguntas não carregados.');
        return;
    }

    // Filtra as perguntas pelo módulo do usuário
    const userModule = currentUser ? currentUser.modulo : null;
    const filteredPerguntas = perguntasData.filter(pergunta => pergunta.modulo === userModule);
    console.log('Perguntas filtradas:', filteredPerguntas);
    if (filteredPerguntas.length > 0) {
        const perguntasString = filteredPerguntas[0].perguntas;
        console.log('String de perguntas:', perguntasString); // Log da string JSON

        try {
            const perguntas = JSON.parse(`[${perguntasString}]`); // Corrige a string JSON
            shuffleArray(perguntas);
            const currentPairs = perguntas.slice(0, 5); // Pega 5 pares

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
        } catch (error) {
            console.error('Erro ao analisar a string JSON de perguntas:', error);
        }
    } else {
        console.warn('Nenhuma pergunta encontrada para o módulo do usuário.');
    }
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

// Função para exibir o ranking
async function displayRanking() {
    if (supabaseData) {
        console.log('Dados do Supabase:', supabaseData); // Log dos dados do Supabase

        // Ordena os dados pelo score em ordem decrescente
        const sortedData = supabaseData.sort((a, b) => b.ranking.score - a.ranking.score);
        console.log('Dados ordenados:', sortedData); // Log dos dados ordenados

        // Pega os top 3
        const top3 = sortedData.slice(0, 3);
        console.log('Top 3:', top3); // Log dos top 3

        // Cria a estrutura HTML para exibir o ranking
        const rankingContainer = document.getElementById('rankingContainer');
        if (!rankingContainer) {
            console.error('Elemento rankingContainer não encontrado.');
            return;
        }
        rankingContainer.innerHTML = ''; // Limpa o conteúdo anterior

        top3.forEach((user, index) => {
            const userElement = document.createElement('div');
            userElement.classList.add('rank-item');
            if (index === 0) {
                userElement.classList.add('first');
            } else if (index === 1) {
                userElement.classList.add('second');
            } else if (index === 2) {
                userElement.classList.add('third');
            }
            userElement.innerHTML = `
                <span>#${index + 1}</span>
                <p>${user.ranking.name}</p>
                <p class="seg">${user.ranking.score} pontos</p>
            `;
            rankingContainer.appendChild(userElement);
        });

        // Oculta a seção do jogo
        document.querySelector('.game').style.display = 'none';

        // Exibe a seção de ranking
        document.getElementById('rankingSection').style.display = 'block';
        console.log('Ranking atualizado no HTML.');
    } else {
        console.error('Dados do Supabase não estão disponíveis.');
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
                            name: