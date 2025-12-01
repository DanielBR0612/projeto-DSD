// --- CONFIGURAÇÕES ---
// Aponta para a raiz do Gateway. Os endpoints adicionam /banco/soap ou /banco/rest
const GATEWAY_URL = 'http://localhost:3000'; 
const WS_URL = 'ws://localhost:8083/ws'; // Ajuste a porta se seu WS estiver na 8083

// Recupera token e conta salvos no login
let token = localStorage.getItem('banco_token');
let contaLogada = localStorage.getItem('banco_conta');

// --- HELPER: Cabeçalhos com Autenticação ---
function getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

// --- HELPER: Exibir Alertas ---
function showAlert(message, type = 'success') {
    const alertBox = document.getElementById('alertBox');
    alertBox.className = `mb-6 p-4 rounded-lg ${type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}`;
    alertBox.textContent = message;
    alertBox.classList.remove('hidden');
    setTimeout(() => alertBox.classList.add('hidden'), 5000);
}

// --- CONTROLE DE LOGIN (Para funcionar com o HTML único) ---
// Se não tiver token, mostra o modal de login. Se tiver, inicia o WS.
function verificarLogin() {
    const overlay = document.getElementById('loginOverlay');
    if (!overlay) return; // Caso você tenha removido o modal do HTML

    if (token) {
        overlay.classList.add('hidden');
        conectarWebSocket(contaLogada);
    } else {
        overlay.classList.remove('hidden');
    }
}

// Handler do Formulário de Login
// Handler do Formulário de Login
const formLogin = document.getElementById('formLogin');

if (formLogin) {
    console.log("✅ Formulário de login encontrado no HTML");

    formLogin.addEventListener('submit', async (e) => {
        // 1. IMPEDE O RECARREGAMENTO DA PÁGINA (Crucial!)
        e.preventDefault(); 
        console.log("👉 1. Botão 'Entrar' clicado");

        const conta = document.getElementById('loginConta').value;
        const senha = document.getElementById('loginSenha').value;
        const btn = formLogin.querySelector('button');
        
        console.log(`👉 2. Tentando logar com Conta: ${conta} | Senha: ${senha}`);

        btn.textContent = "Autenticando...";
        btn.disabled = true;

        try {
            console.log(`👉 3. Enviando POST para: ${GATEWAY_URL}/auth/login`);
            
            const response = await fetch(`${GATEWAY_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conta, senha })
            });

            const jsonResponse = await response.json(); // Pega a resposta completa
            
            // CORREÇÃO AQUI: 
            // O interceptor HATEOAS coloca o resultado dentro de '.data'.
            // Então verificamos se existe jsonResponse.data ou usamos o próprio jsonResponse.
            const payload = jsonResponse.data || jsonResponse;

            console.log("👉 5. Payload processado:", payload);

            if (response.ok && payload.access_token) {
                console.log("👉 6. Token encontrado! Salvando...");
                
                // SALVA USANDO O PAYLOAD CORRETO
                localStorage.setItem('banco_token', payload.access_token);
                localStorage.setItem('banco_conta', conta);
                
                // Atualiza memória
                token = payload.access_token;
                contaLogada = conta;

                verificarLogin();
                showAlert(`Bem-vindo, conta ${conta}!`, 'success');
                
                formLogin.reset();
            } else {
                console.error("❌ Erro no login:", jsonResponse);
                // Exibe a mensagem de erro corretamente, mesmo envelopada
                const msgErro = payload.message || jsonResponse.message || "Credenciais inválidas";
                alert("Login falhou: " + msgErro);
            }
        } catch (error) {
            console.error("❌ Erro Técnico:", error);
            alert("Erro de conexão: " + error.message);
        } finally {
            btn.textContent = "ENTRAR NO SISTEMA";
            btn.disabled = false;
        }
    });
} else {
    console.error("❌ ERRO CRÍTICO: Não achei o elemento 'formLogin' no HTML. Verifique o ID.");
}

// --- WEBSOCKET ---
let socket = null;

function conectarWebSocket(clienteId) {
    if (!clienteId || !token) return;

    // Fecha conexão anterior se existir
    if (socket) {
        try { socket.close(); } catch (e) {}
        socket = null;
    }

    // Conecta enviando o Token na URL (padrão seguro)
    const url = `${WS_URL}?token=${token}`;
    console.log('Conectando WS em', url);

    socket = new WebSocket(url);

    socket.onopen = () => {
        console.log('WebSocket conectado para cliente', clienteId);
        showAlert(`🟢 Sistema de Notificações Online para conta ${clienteId}`, 'success');
    };

    socket.onmessage = (event) => {
        try {
            const mensagem = JSON.parse(event.data);
            
            // Filtra evento de nova transação
            if (mensagem.event === 'nova-transacao') {
                const { valor, tipo, timestamp } = mensagem.data;
                const valorFormatado = parseFloat(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                
                // Toca alerta visual e sonoro (opcional)
                showAlert(`💰 RECEBIDO! ${tipo} de ${valorFormatado}`, 'success');
                alert(`🔔 NOTIFICAÇÃO:\n\nVocê recebeu um ${tipo} de ${valorFormatado}!`);
            }
        } catch (e) {
            console.error('Erro ao processar mensagem WS', e);
        }
    };

    socket.onclose = (event) => {
        console.log('Conexão WebSocket fechada');
        if (event.code === 1008) {
            alert("Sessão expirada. Faça login novamente.");
            localStorage.clear();
            location.reload();
        }
    };
}

// --- FORMULÁRIOS DO SISTEMA ---

// 1. Criar Cliente (SOAP)
document.getElementById('formCriarCliente').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('nomeCliente').value;
    const cpf = document.getElementById('cpfCliente').value;

    try {
        const response = await fetch(`${GATEWAY_URL}/banco/soap/criarCliente`, {
            method: 'POST',
            headers: getHeaders(), // <--- INJETA O TOKEN AQUI
            body: JSON.stringify({ nome, cpf })
        });

        if (response.ok || response.status === 201) {
            const data = await response.json();
            document.getElementById('criarClienteData').textContent = JSON.stringify(data, null, 2);
            document.getElementById('resultCriarCliente').classList.remove('hidden');
            showAlert(`✅ Cliente criado! ID: ${data.data.id || 'N/A'}`, 'success');
        } else {
            const error = await response.text();
            showAlert(`❌ Erro ${response.status}: ${error}`, 'error');
        }
    } catch (error) {
        showAlert(`❌ Erro de conexão: ${error.message}`, 'error');
    }
});

// 2. Criar Nova Conta (SOAP)
document.getElementById('formCriarConta').addEventListener('submit', async (e) => {
    e.preventDefault();
    const clienteId = parseInt(document.getElementById('clienteIdCriarConta').value);
    const numeroConta = document.getElementById('numeroContaCriarConta').value;
    const saldoInicial = parseFloat(document.getElementById('saldoInicialCriarConta').value);

    try {
        const response = await fetch(`${GATEWAY_URL}/banco/soap/criarConta`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ clienteId, numeroConta, saldoInicial })
        });

        if (response.ok || response.status === 201) {
            const data = await response.json();
            document.getElementById('criarContaData').textContent = JSON.stringify(data, null, 2);
            document.getElementById('resultCriarConta').classList.remove('hidden');
            showAlert(`✅ Conta criada com sucesso!`, 'success');
        } else {
            const error = await response.text();
            showAlert(`❌ Erro ${response.status}: ${error}`, 'error');
        }
    } catch (error) {
        showAlert(`❌ Erro de conexão: ${error.message}`, 'error');
    }
});

// 3. Consultar Saldo (SOAP)
document.getElementById('formSaldoSoap').addEventListener('submit', async (e) => {
    e.preventDefault();
    const conta = document.getElementById('contaSaldoSoap').value;

    try {
        // Se estiver autenticado, o Gateway ignora o ?conta= e usa o token
        // Mas enviamos para manter compatibilidade caso retire o Guard
        const response = await fetch(`${GATEWAY_URL}/banco/soap/saldo?conta=${conta}`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('saldoSoapData').textContent = JSON.stringify(data, null, 2);
            document.getElementById('resultSaldoSoap').classList.remove('hidden');
            showAlert(`✅ Saldo consultado via SOAP!`, 'success');
        } else {
            const error = await response.text();
            showAlert(`❌ Erro ${response.status}: ${error}`, 'error');
        }
    } catch (error) {
        showAlert(`❌ Erro de conexão: ${error.message}`, 'error');
    }
});

// 4. Consultar Extrato (REST)
document.getElementById('formExtratoRest').addEventListener('submit', async (e) => {
    e.preventDefault();
    const conta = document.getElementById('contaExtratoRest').value;

    try {
        const response = await fetch(`${GATEWAY_URL}/banco/rest/extrato?conta=${conta}`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('extratoRestData').textContent = JSON.stringify(data, null, 2);
            document.getElementById('resultExtratoRest').classList.remove('hidden');
            showAlert(`✅ Extrato consultado via REST!`, 'success');
        } else {
            const error = await response.text();
            showAlert(`❌ Erro ${response.status}: ${error}`, 'error');
        }
    } catch (error) {
        showAlert(`❌ Erro de conexão: ${error.message}`, 'error');
    }
});

// 5. Transferência TED (SOAP)
document.getElementById('formTransferenciaTED').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
        contaOrigem: document.getElementById('contaOrigemTED').value,
        contaDestino: document.getElementById('contaDestinoTED').value,
        valor: parseFloat(document.getElementById('valorTED').value)
    };

    try {
        const response = await fetch(`${GATEWAY_URL}/banco/soap/TED`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(body)
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('resultadoTED').textContent = JSON.stringify(data, null, 2);
            document.getElementById('resultTransferenciaTED').classList.remove('hidden');
            showAlert(`✅ Transferência TED realizada!`, 'success');
        } else {
            const error = await response.text();
            showAlert(`❌ Erro ${response.status}: ${error}`, 'error');
        }
    } catch (error) {
        showAlert(`❌ Erro de conexão: ${error.message}`, 'error');
    }
});

// 6. Criar Chave PIX (REST)
document.getElementById('formCriarChavePix').addEventListener('submit', async (e) => {
    e.preventDefault();
    const clienteId = document.getElementById('clienteIdChavePix').value;
    const body = {
        tipoChave: document.getElementById('tipoChavePix').value,
        chave: document.getElementById('chavePixValor').value,
        tipoConta: 'CORRENTE',
        conta: document.getElementById('contaPix').value
    };

    try {
        const response = await fetch(`${GATEWAY_URL}/banco/rest/clientes/${clienteId}/chaves-pix`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(body)
        });

        if (response.ok || response.status === 201) {
            const data = await response.json();
            document.getElementById('criarChavePixData').textContent = JSON.stringify(data, null, 2);
            document.getElementById('resultCriarChavePix').classList.remove('hidden');
            showAlert(`✅ Chave PIX criada!`, 'success');
        } else {
            const error = await response.text();
            showAlert(`❌ Erro ${response.status}: ${error}`, 'error');
        }
    } catch (error) {
        showAlert(`❌ Erro de conexão: ${error.message}`, 'error');
    }
});

// 7. Transferência PIX (REST)
document.getElementById('formTransferenciaPIX').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
        contaOrigem: document.getElementById('contaOrigemPIX').value, // Ajuste para nome do DTO
        chaveDestino: document.getElementById('chaveDestinoPIX').value,
        valor: parseFloat(document.getElementById('valorPIX').value)
    };

    try {
        const response = await fetch(`${GATEWAY_URL}/banco/rest/pix`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(body)
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('resultadoPIX').textContent = JSON.stringify(data, null, 2);
            document.getElementById('resultTransferenciaPIX').classList.remove('hidden');
            showAlert(`✅ Transferência PIX realizada!`, 'success');
        } else {
            const error = await response.text(); // Use .text() para pegar erro bruto se não for json
            showAlert(`❌ Erro ${response.status}: ${error}`, 'error');
        }
    } catch (error) {
        showAlert(`❌ Erro de conexão: ${error.message}`, 'error');
    }
    
});

function fazerLogout() {
    localStorage.removeItem('banco_token');
    localStorage.removeItem('banco_conta');
    token = null;
    contaLogada = null;
    clienteIdWs = null;
    
    if (socket) {
        socket.close();
        socket = null;
    }
    
    alert("Logout realizado com sucesso!");
    location.reload(); 
}

window.fazerLogout = fazerLogout;


// Inicia verificação ao carregar a página
verificarLogin();