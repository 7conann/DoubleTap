let currentUser = null; // Variável global para armazenar os dados do usuário atual
let supabaseData = null; // Variável global para armazenar os dados do Supabase
let perguntasData = null; // Variável global para armazenar os dados de perguntas do Supabase

const SUPABASE_URL = 'https://eunburxiqtzftppqvxtr.supabase.co'; // Substitua pela sua URL do Supabase
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1bmJ1cnhpcXR6ZnRwcHF2eHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU1Njc3MzEsImV4cCI6MjA0MTE0MzczMX0.y-EgwTJ-uEzbLa_bTSzbEN10dSyTVrSJ27zrl51MLKc'; // Substitua pela sua chave de API do Supabase
const TABLE_NAME = 'atm-dadosDoubleTap';
const TABLE_NAME_PERGUNTAS = 'modulos';

// Função para buscar dados do Supabase e atualizar o ranking
async function fetchData() {
    console.log('Iniciando fetchData');
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    let { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*');
    if (error) {
        console.error('Erro ao consultar o Supabase:', error);
    } else if (data.length === 0) {
        console.warn('Nenhum dado encontrado na tabela workez.');
    }
    console.log('Dados recebidos do Supabase:', data);
    supabaseData = data; // Armazena os dados do Supabase
    await fetchDataPerguntas(); // Aguarda a busca de perguntas antes de continuar
    loadWords(); // Chama loadWords após os dados de perguntas serem carregados
}

// Função para buscar dados de perguntas do Supabase
async function fetchDataPerguntas() {
    console.log('Iniciando fetchDataPerguntas');
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    let { data, error } = await supabase
        .from(TABLE_NAME_PERGUNTAS)
        .select('*');
    if (error) {
        console.error('Erro ao consultar o Supabase:', error);
    } else if (data.length === 0) {
        console.warn('Nenhum dado encontrado na tabela workez.');
    }
    console.log('Dados de perguntas recebidos do Supabase:', data);
    perguntasData = data; // Armazena os dados de perguntas do Supabase
}

// Verifica se a biblioteca do Supabase está carregada
if (window.supabase) {
    document.addEventListener('DOMContentLoaded', async () => {
        console.log('DOM totalmente carregado');

        // Função para receber mensagens do site principal
        window.addEventListener('message', async (event) => {
            if (event.data.type === 'USER_INFO') {
                const user = event.data.user;
                // Definir o usuário atual
                currentUser = user;
                console.log('Usuário atual:', currentUser);
                await fetchData(); // Busca os dados de perguntas do Supabase

                await startTimer(); // Busca os dados do Supabase
            }
        });

    });
} else {
    console.error('A biblioteca do Supabase não está carregada.');
}

let score = 0;
let timeLeft = 15; // 1 minuto
let selectedTerm = null; // Controla o termo selecionado

// Função para embaralhar os itens
function shuffleArray(array) {
    console.log('Embaralhando array:', array);
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    console.log('Array embaralhado:', array);
}

// Função para carregar os termos e explicações
function loadWords() {
    console.log('Iniciando loadWords');
    const businessColumn = document.getElementById("business-terms");
    const explanationColumn = document.getElementById("explanations");
    const loadingIndicator = document.getElementById("loading-indicator");

    // Exibe o indicador de carregamento
    loadingIndicator.style.display = "block";

    // Limpa as colunas
    businessColumn.innerHTML = "";
    explanationColumn.innerHTML = "";

    if (!perguntasData) {
        console.warn('Dados de perguntas não carregados.');
        loadingIndicator.style.display = "none"; // Oculta o indicador de carregamento
        return;
    }

    // Verifica se o módulo do usuário está definido
    const userModule = currentUser ? currentUser.modulo : null;
    if (!userModule) {
        console.warn('Módulo do usuário não definido.');
        loadingIndicator.style.display = "none"; // Oculta o indicador de carregamento
        return;
    }

    const filteredPerguntas = perguntasData.filter(pergunta => pergunta.modulo === userModule);
    console.log('Perguntas filtradas:', filteredPerguntas);

    if (filteredPerguntas.length > 0) {
        const perguntasString = filteredPerguntas[0].perguntas;
        console.log('String de perguntas:', perguntasString);

        try {
            // Corrige a string JSON para garantir que seja um array de objetos
            const formattedString = `[${perguntasString.replace(/}\s*,\s*{/g, '},{').replace(/(\w+):/g, '"$1":')}]`;
            const perguntas = JSON.parse(formattedString);
            console.log('Perguntas após parse:', perguntas);
            shuffleArray(perguntas);
            const currentPairs = perguntas.slice(0, 5); // Pega 5 pares
            console.log('Pares atuais:', currentPairs);

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

    // Oculta o indicador de carregamento após carregar os dados
    loadingIndicator.style.display = "none";
}

// Função para gerenciar os cliques e correspondência de termos e explicações
// Função para gerenciar os cliques e correspondência de termos e explicações
function addClickEvents() {
    console.log('Adicionando eventos de clique');
    const termButtons = document.querySelectorAll(".term-button");
    const explanationButtons = document.querySelectorAll(".explanation-button");

    termButtons.forEach(button => {
        button.addEventListener("click", function () {
            console.log('Termo clicado:', this.textContent);
            if (!selectedTerm) {
                selectedTerm = this;
                this.classList.add("selected"); // Adiciona a classe selecionada
            }
        });
    });

    explanationButtons.forEach(button => {
        button.addEventListener("click", function () {
            console.log('Explicação clicada:', this.textContent);
            if (selectedTerm && selectedTerm.dataset.index === this.dataset.index) {
                // Correspondência correta
                this.classList.add("correct");

                // Aguarda a transição para desaparecer os botões
                setTimeout(() => {
                    this.classList.add("correct-disappear");
                    loadWords(); // Recarrega a grade após a correspondência
                    selectedTerm.classList.remove("selected"); // Remove a classe selecionada
                    selectedTerm = null;
                }, 500);

                score++; // Incrementa a pontuação
                document.getElementById("score").textContent = `Pontuação: ${score}`;
            } else if (selectedTerm) {
                // Correspondência incorreta
                this.classList.add("wrong");

                // Reseta a seleção incorreta após um tempo
                setTimeout(() => {
                    this.classList.remove("wrong");
                    selectedTerm.classList.remove("selected"); // Remove a classe selecionada
                    selectedTerm = null;
                }, 500);
            }
        });
    });
}

// Função para exibir o ranking
async function displayRanking() {
    console.log('Exibindo ranking');
    if (supabaseData) {
        // Ordena os dados pelo score em ordem decrescente
        const sortedData = supabaseData.sort((a, b) => b.ranking.score - a.ranking.score);
        console.log('Dados ordenados:', sortedData);

        // Pega os top 3
        const top3 = sortedData.slice(0, 3);
        console.log('Top 3:', top3);

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
    } else {
        console.error('Dados do Supabase não estão disponíveis.');
    }
}

function startTimer() {
    const timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").innerHTML = ` <strong>${timeLeft}s</strong>`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            document.getElementById("timer").innerHTML = `<strong>0s</strong>`;
            // Verifica se o ID do usuário existe no Supabase
            if (currentUser) {
                const userExists = supabaseData.some(user => user.id === currentUser.id);
                const userData = supabaseData.find(user => user.id === currentUser.id);

                if (userExists && userData.ranking.score < score) {
                    // Atualiza o score se o novo score for maior
                    const url = 'https://n8nwebhook.iatom.site/webhook/f9592bf0-57e2-4ea4-a404-3b67c0bf978c';
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
                            // Aguarda 2 segundos antes de buscar os dados novamente
                            await new Promise(resolve => setTimeout(resolve, 2000));
                            await fetchData(); // Atualiza os dados do Supabase
                            // Exibe o ranking após enviar os dados
                            displayRanking();
                        })
                        .catch((error) => console.error('Erro:', error));
                } else if (!userExists) {
                    // Cria um novo registro se o usuário não existir
                    const url = 'https://n8nwebhook.iatom.site/webhook/857e706e-c7e4-40fe-b954-fde4a598909f';
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