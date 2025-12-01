const GATEWAY_URL = 'http://localhost:3000';
const WS_URL = 'ws://localhost:8083/ws';

let token = localStorage.getItem('banco_token');
let contaLogada = localStorage.getItem('banco_conta');
let socket = null;
let clienteIdWs = null;

function getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

function showAlert(message, type = 'success') {
    const alertBox = document.getElementById('alertBox');
    alertBox.className = `mb-6 p-4 rounded-lg ${type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}`;
    alertBox.textContent = message;
    alertBox.classList.remove('hidden');
    setTimeout(() => alertBox.classList.add('hidden'), 5000);
}

async function handleRequest(url, method, body, resultElementId) {
    try {
        const response = await fetch(url, {
            method: method,
            headers: getHeaders(),
            body: body ? JSON.stringify(body) : null
        });

        const data = await response.json().catch(() => ({ message: response.statusText }));
        const resultadoFinal = data.data || data;

        if (response.ok || response.status === 201) {
            if (resultElementId) {
                document.getElementById(resultElementId).textContent = JSON.stringify(resultadoFinal, null, 2);
                document.getElementById(resultElementId).parentElement.classList.remove('hidden');
            }
            showAlert('Operação realizada com sucesso!', 'success');
        } else {
            const errorMsg = data.message || JSON.stringify(data);
            showAlert(`Erro: ${errorMsg}`, 'error');
        }
    } catch (error) {
        showAlert(`Erro de conexão: ${error.message}`, 'error');
    }
}

function verificarLogin() {
    const overlay = document.getElementById('loginOverlay');
    if (!overlay) return;

    if (token) {
        overlay.classList.add('hidden');
        const labelConta = document.getElementById('labelConta');
        if (labelConta) labelConta.innerText = `Logado: ${contaLogada}`;
        
        conectarWebSocket(contaLogada);
    } else {
        overlay.classList.remove('hidden');
    }
}

const formLogin = document.getElementById('formLogin');
if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const conta = document.getElementById('loginConta').value;
        const senha = document.getElementById('loginSenha').value;
        const btn = formLogin.querySelector('button');
        
        btn.textContent = "Autenticando...";
        btn.disabled = true;

        try {
            const response = await fetch(`${GATEWAY_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conta, senha })
            });

            const jsonResponse = await response.json();
            const payload = jsonResponse.data || jsonResponse;

            if (response.ok && payload.access_token) {
                localStorage.setItem('banco_token', payload.access_token);
                localStorage.setItem('banco_conta', conta);
                
                token = payload.access_token;
                contaLogada = conta;

                verificarLogin();
                showAlert(`Bem-vindo, conta ${conta}!`, 'success');
                formLogin.reset();
            } else {
                alert("Login falhou: " + (payload.message || 'Verifique credenciais'));
            }
        } catch (error) {
            alert("Erro de conexão: " + error.message);
        } finally {
            btn.textContent = "ENTRAR NO SISTEMA";
            btn.disabled = false;
        }
    });
}

function conectarWebSocket(clienteId) {
    if (!clienteId || !token) return;
    
    if (clienteIdWs === clienteId && socket && socket.readyState === WebSocket.OPEN) {
        return;
    }

    if (socket) {
        try { socket.close(); } catch (e) {}
        socket = null;
    }

    clienteIdWs = clienteId;
    
    const url = `${WS_URL}?token=${token}`;
    console.log('Conectando WS em', url);

    socket = new WebSocket(url);

    socket.onopen = () => {
        console.log('[WS] Conectado!');
        showAlert(`Sistema de Notificações Online`, 'success');
    };

    socket.onmessage = (event) => {
        try {
            const msg = JSON.parse(event.data);
            
            if (msg.event === 'nova-transacao') {
                const { valor, tipo, timestamp } = msg.data;
                const valorFormatado = parseFloat(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                
                showAlert(`RECEBIDO! ${valorFormatado} via ${tipo}`, 'success');
                setTimeout(() => alert(`PIX RECEBIDO!\n\nValor: ${valorFormatado}\nDe: ${msg.data.destinatarioId || 'Desconhecido'}`), 100);
            }
        } catch (e) {
            console.error('[WS] Erro ao processar mensagem', e);
        }
    };

    socket.onclose = (event) => {
        console.log('[WS] Desconectado');
        if (event.code === 1008) {
            console.error("Token inválido ou expirado.");
            fazerLogout();
        }
    };
    
    socket.onerror = (err) => {
        console.error('[WS] Erro:', err);
    };
}

document.getElementById('formCriarCliente').addEventListener('submit', (e) => {
    e.preventDefault();
    const body = {
        nome: document.getElementById('nomeCliente').value,
        cpf: document.getElementById('cpfCliente').value
    };
    handleRequest(`${GATEWAY_URL}/banco/soap/criarCliente`, 'POST', body, 'criarClienteData');
});

document.getElementById('formCriarConta').addEventListener('submit', (e) => {
    e.preventDefault();
    const body = {
        clienteId: document.getElementById('clienteIdCriarConta').value,
        numeroConta: document.getElementById('numeroContaCriarConta').value,
        saldoInicial: document.getElementById('saldoInicialCriarConta').value
    };
    handleRequest(`${GATEWAY_URL}/banco/soap/criarConta`, 'POST', body, 'criarContaData');
});

document.getElementById('formSaldoSoap').addEventListener('submit', (e) => {
    e.preventDefault();
    const conta = document.getElementById('contaSaldoSoap').value;
    handleRequest(`${GATEWAY_URL}/banco/soap/saldo?conta=${conta}`, 'GET', null, 'saldoSoapData');
});

document.getElementById('formExtratoRest').addEventListener('submit', (e) => {
    e.preventDefault();
    const conta = document.getElementById('contaExtratoRest').value;
    handleRequest(`${GATEWAY_URL}/banco/rest/extrato?conta=${conta}`, 'GET', null, 'extratoRestData');
});

document.getElementById('formTransferenciaTED').addEventListener('submit', (e) => {
    e.preventDefault();
    const body = {
        contaOrigem: document.getElementById('contaOrigemTED').value,
        contaDestino: document.getElementById('contaDestinoTED').value,
        valor: parseFloat(document.getElementById('valorTED').value)
    };
    handleRequest(`${GATEWAY_URL}/banco/soap/TED`, 'POST', body, 'resultadoTED');
});

document.getElementById('formCriarChavePix').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('clienteIdChavePix').value;
    const body = {
        chave: document.getElementById('chavePixValor').value,
        tipoChave: document.getElementById('tipoChavePix').value,
        tipoConta: 'CORRENTE',
        conta: document.getElementById('contaPix').value
    };
    handleRequest(`${GATEWAY_URL}/banco/rest/clientes/${id}/chaves-pix`, 'POST', body, 'criarChavePixData');
});

document.getElementById('formTransferenciaPIX').addEventListener('submit', (e) => {
    e.preventDefault();
    const body = {
        contaOrigem: document.getElementById('contaOrigemPIX').value,
        chaveDestino: document.getElementById('chaveDestinoPIX').value,
        valor: parseFloat(document.getElementById('valorPIX').value)
    };
    handleRequest(`${GATEWAY_URL}/banco/rest/pix`, 'POST', body, 'resultadoPIX');
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

verificarLogin();