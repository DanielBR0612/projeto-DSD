// --- CONFIGURAÇÕES ---
// Aponta para a raiz do Gateway. Os endpoints adicionam /banco/soap ou /banco/rest
const CODESPACE_NAME = window.location.hostname.split('-')[0] + '-' + window.location.hostname.split('-')[1] + '-' + window.location.hostname.split('-')[2];
const GATEWAY_URL = window.location.hostname.includes('github.dev') 
    ? `https://${window.location.hostname.replace('-5500', '-8000')}` 
    : 'http://localhost:8000';
const WS_URL = window.location.hostname.includes('github.dev')
    ? `wss://${window.location.hostname.replace('-5500', '-8083')}/ws`
    : 'ws://localhost:8083/ws';

console.log('🔧 CONFIGURAÇÃO DE URLs:');
console.log('   Gateway:', GATEWAY_URL);
console.log('   WebSocket:', WS_URL);
console.log('   Hostname:', window.location.hostname);

// Recupera token e conta salvos no login
let token = localStorage.getItem('banco_token');
let contaLogada = localStorage.getItem('banco_conta');

// Armazena notificações
let notificacoes = JSON.parse(localStorage.getItem('banco_notificacoes') || '[]');

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

// --- GERÊNCIA DE NOTIFICAÇÕES ---
function adicionarNotificacao(mensagem) {
    const notificacao = {
        id: Date.now(),
        mensagem: mensagem.mensagem || JSON.stringify(mensagem),
        tipo: mensagem.tipo || mensagem.event || 'info',
        timestamp: mensagem.timestamp || new Date().toISOString(),
        lida: false
    };
    
    notificacoes.unshift(notificacao); // Adiciona no início
    
    // Limita a 50 notificações
    if (notificacoes.length > 50) {
        notificacoes = notificacoes.slice(0, 50);
    }
    
    localStorage.setItem('banco_notificacoes', JSON.stringify(notificacoes));
    atualizarInterfaceNotificacoes();
}

function atualizarInterfaceNotificacoes() {
    const contador = document.getElementById('contadorNotificacoes');
    const lista = document.getElementById('listaNotificacoes');
    
    const naoLidas = notificacoes.filter(n => !n.lida).length;
    
    if (naoLidas > 0) {
        contador.textContent = naoLidas > 99 ? '99+' : naoLidas;
        contador.classList.remove('hidden');
    } else {
        contador.classList.add('hidden');
    }
    
    if (notificacoes.length === 0) {
        lista.innerHTML = '<div class="p-4 text-center text-gray-500 text-sm">Nenhuma notificação</div>';
        return;
    }
    
    lista.innerHTML = notificacoes.map(notif => {
        const data = new Date(notif.timestamp);
        const dataFormatada = data.toLocaleString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const icone = notif.tipo === 'nova-transacao' ? '💰' : '🔔';
        const corFundo = notif.lida ? 'bg-white' : 'bg-blue-50';
        
        return `
            <div class="${corFundo} p-4 hover:bg-gray-50 transition-colors cursor-pointer" onclick="marcarComoLida(${notif.id})">
                <div class="flex items-start gap-3">
                    <span class="text-2xl">${icone}</span>
                    <div class="flex-1">
                        <p class="text-sm text-gray-800 ${notif.lida ? '' : 'font-semibold'}">${notif.mensagem}</p>
                        <p class="text-xs text-gray-500 mt-1">${dataFormatada}</p>
                    </div>
                    ${!notif.lida ? '<span class="w-2 h-2 bg-blue-500 rounded-full"></span>' : ''}
                </div>
            </div>
        `;
    }).join('');
}

function marcarComoLida(id) {
    const notif = notificacoes.find(n => n.id === id);
    if (notif) {
        notif.lida = true;
        localStorage.setItem('banco_notificacoes', JSON.stringify(notificacoes));
        atualizarInterfaceNotificacoes();
    }
}

function limparNotificacoes() {
    if (confirm('Deseja realmente limpar todas as notificações?')) {
        notificacoes = [];
        localStorage.removeItem('banco_notificacoes');
        atualizarInterfaceNotificacoes();
    }
}

window.marcarComoLida = marcarComoLida;
window.limparNotificacoes = limparNotificacoes;

// --- CONTROLE DE LOGIN (Para funcionar com o HTML único) ---
// Se não tiver token, mostra o modal de login. Se tiver, inicia o WS.
function verificarLogin() {
    const overlay = document.getElementById('loginOverlay');
    if (!overlay) return; // Caso você tenha removido o modal do HTML

    if (token) {
        overlay.classList.add('hidden');
        conectarWebSocket(contaLogada);
        atualizarInterfaceNotificacoes(); // Atualiza contador ao carregar
    } else {
        overlay.classList.remove('hidden');
    }
}

// Toggle do dropdown de notificações
document.addEventListener('DOMContentLoaded', () => {
    const btnNotif = document.getElementById('btnNotificacoes');
    const dropdown = document.getElementById('dropdownNotificacoes');
    
    if (btnNotif && dropdown) {
        btnNotif.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        });
        
        // Fecha ao clicar fora
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !btnNotif.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
    }
});

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
                
                // Adiciona à fila de notificações
                adicionarNotificacao({
                    mensagem: `Você recebeu um ${tipo} de ${valorFormatado}`,
                    tipo: 'nova-transacao',
                    timestamp: timestamp || new Date().toISOString()
                });
                
                // Toca alerta visual
                showAlert(`💰 RECEBIDO! ${tipo} de ${valorFormatado}`, 'success');
            } else {
                // Outras mensagens genéricas
                adicionarNotificacao({
                    mensagem: mensagem.mensagem || JSON.stringify(mensagem.data || mensagem),
                    tipo: mensagem.event || 'info',
                    timestamp: mensagem.timestamp || new Date().toISOString()
                });
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
let ultimaTransacaoTED = null;
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
            
            // Armazena dados da última transação para o comprovante
            ultimaTransacaoTED = {
                tipo_transacao: 'TED',
                conta_origem: body.contaOrigem,
                conta_destino: body.contaDestino,
                valor: body.valor,
                data_hora: new Date().toISOString(),
                id_transacao: `TED_${Date.now()}`
            };
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
        tipo: document.getElementById('tipoChavePix').value,
        valor: document.getElementById('chavePixValor').value,
        numeroConta: document.getElementById('contaPix').value
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
let ultimaTransacaoPIX = null;
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
            
            // Armazena dados da última transação para o comprovante
            ultimaTransacaoPIX = {
                tipo_transacao: 'PIX',
                conta_origem: body.contaOrigem,
                conta_destino: body.chaveDestino,
                valor: body.valor,
                data_hora: new Date().toISOString(),
                id_transacao: `PIX_${Date.now()}`
            };
        } else {
            const error = await response.text(); // Use .text() para pegar erro bruto se não for json
            showAlert(`❌ Erro ${response.status}: ${error}`, 'error');
        }
    } catch (error) {
        showAlert(`❌ Erro de conexão: ${error.message}`, 'error');
    }
    
});

// 8. Gerar Comprovante TED
document.getElementById('btnGerarComprovanteTED').addEventListener('click', async () => {
    if (!ultimaTransacaoTED) {
        showAlert('❌ Nenhuma transação TED recente encontrada', 'error');
        return;
    }

    try {
        const response = await fetch(`${GATEWAY_URL}/comprovantes/gerar`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(ultimaTransacaoTED)
        });

        if (response.ok) {
            // Faz download do PDF
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `comprovante_ted_${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            showAlert('✅ Comprovante gerado e baixado!', 'success');
        } else {
            const error = await response.text();
            showAlert(`❌ Erro ao gerar comprovante: ${error}`, 'error');
        }
    } catch (error) {
        showAlert(`❌ Erro de conexão: ${error.message}`, 'error');
    }
});

// 9. Gerar Comprovante PIX
document.getElementById('btnGerarComprovantePIX').addEventListener('click', async () => {
    if (!ultimaTransacaoPIX) {
        showAlert('❌ Nenhuma transação PIX recente encontrada', 'error');
        return;
    }

    try {
        const response = await fetch(`${GATEWAY_URL}/comprovantes/gerar`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(ultimaTransacaoPIX)
        });

        if (response.ok) {
            // Faz download do PDF
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `comprovante_pix_${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            showAlert('✅ Comprovante gerado e baixado!', 'success');
        } else {
            const error = await response.text();
            showAlert(`❌ Erro ao gerar comprovante: ${error}`, 'error');
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