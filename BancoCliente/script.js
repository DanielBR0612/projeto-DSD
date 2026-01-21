const CODESPACE_NAME = window.location.hostname.split('-')[0] + '-' + window.location.hostname.split('-')[1] + '-' + window.location.hostname.split('-')[2];
const GATEWAY_URL = window.location.hostname.includes('github.dev') 
    ? `https://${window.location.hostname.replace('-5500', '-3000')}` 
    : 'http://localhost:8000';
const WS_URL = window.location.hostname.includes('github.dev')
    ? `wss://${window.location.hostname.replace('-5500', '-8083')}/ws`
    : 'ws://localhost:8083/ws';

let token = localStorage.getItem('banco_token');
let contaLogada = localStorage.getItem('banco_conta');
let notificacoes = JSON.parse(localStorage.getItem('banco_notificacoes') || '[]');
let socket = null;

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

function adicionarNotificacao(mensagem) {
    const notificacao = {
        id: Date.now(),
        mensagem: mensagem.mensagem || JSON.stringify(mensagem),
        tipo: mensagem.tipo || mensagem.event || 'info',
        timestamp: mensagem.timestamp || new Date().toISOString(),
        lida: false
    };
    
    notificacoes.unshift(notificacao);
    
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
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit' 
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

function verificarLogin() {
    const overlay = document.getElementById('loginOverlay');
    if (!overlay) return;

    if (token) {
        overlay.classList.add('hidden');
        document.getElementById('labelConta').textContent = `Conta: ${contaLogada}`;
        conectarWebSocket(contaLogada);
        atualizarInterfaceNotificacoes();
        
        // Inicia o monitoramento de ATMs se estiver logado
        atualizarDashboard();
        setInterval(atualizarDashboard, 2000);
    } else {
        overlay.classList.remove('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const btnNotif = document.getElementById('btnNotificacoes');
    const dropdown = document.getElementById('dropdownNotificacoes');
    
    if (btnNotif && dropdown) {
        btnNotif.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        });
        
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !btnNotif.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
    }
});

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
                const msgErro = payload.message || jsonResponse.message || "Credenciais inválidas";
                alert("Login falhou: " + msgErro);
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

    if (socket) {
        try { socket.close(); } catch (e) {}
        socket = null;
    }

    const url = `${WS_URL}?token=${token}`;
    socket = new WebSocket(url);

    socket.onopen = () => {
        console.log('WebSocket conectado');
        showAlert(`🟢 Sistema de Notificações Online`, 'success');
    };

    socket.onmessage = (event) => {
        try {
            const mensagem = JSON.parse(event.data);
            
            if (mensagem.event === 'nova-transacao') {
                const { valor, tipo, timestamp } = mensagem.data;
                const valorFormatado = parseFloat(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                
                adicionarNotificacao({
                    mensagem: `Você recebeu um ${tipo} de ${valorFormatado}`,
                    tipo: 'nova-transacao',
                    timestamp: timestamp || new Date().toISOString()
                });
                
                showAlert(`💰 RECEBIDO! ${tipo} de ${valorFormatado}`, 'success');
            } else {
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
        if (event.code === 1008) {
            alert("Sessão expirada. Faça login novamente.");
            fazerLogout();
        }
    };
}

document.getElementById('formCriarCliente').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('nomeCliente').value;
    const cpf = document.getElementById('cpfCliente').value;

    try {
        const response = await fetch(`${GATEWAY_URL}/banco/soap/criarCliente`, {
            method: 'POST',
            headers: getHeaders(),
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

document.getElementById('formSaldoSoap').addEventListener('submit', async (e) => {
    e.preventDefault();
    const conta = document.getElementById('contaSaldoSoap').value;

    try {
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
        contaOrigem: document.getElementById('contaOrigemPIX').value,
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
            const error = await response.text();
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
    
    if (socket) {
        socket.close();
        socket = null;
    }
    
    alert("Logout realizado com sucesso!");
    location.reload(); 
}

async function bloquearAtm(id) {
    const confirmacao = confirm(`PERIGO: Você está prestes a BLOQUEAR o terminal ${id}.\n\nIsso enviará um comando TCP para desligar a máquina. Continuar?`);
    
    if (!confirmacao) return;

    try {
        const res = await fetch(`${GATEWAY_URL}/atms/block`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        
        const resultado = await res.json();
        
        if (res.ok) {
            alert(`Comando enviado! O terminal deve ficar offline em breve.`);
            atualizarDashboard(); 
        } else {
            alert(`Erro: ${resultado.message || 'Falha ao enviar comando'}`);
        }
        
    } catch (err) {
        console.error(err);
        alert('Erro de conexão com o Gateway.');
    }
}

async function atualizarDashboard() {
    try {
        const response = await fetch(`${GATEWAY_URL}/atms`);
        if (!response.ok) return;

        const jsonResponse = await response.json();
        const atms = jsonResponse.data || jsonResponse; 

        const tbody = document.getElementById('lista-atms');
        if (!tbody) return;

        tbody.innerHTML = ''; 

        const listaAtms = Object.values(atms);

        if (listaAtms.length === 0 || !atms) {
            tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">Nenhum ATM conectado.</td></tr>';
            return;
        }

        listaAtms.forEach(atm => {
            if (!atm || !atm.id) return; 

            const tr = document.createElement('tr');
            
            let statusClass = 'bg-red-500';
            let statusText = 'OFFLINE';
            let statusColor = 'text-red-600';
            let rowOpacity = 'opacity-100';
            
            if (atm.status === 'ONLINE') {
                statusClass = 'bg-green-500';
                statusText = 'ONLINE';
                statusColor = 'text-green-600';
            } else if (atm.status === 'BLOCKED') {
                statusClass = 'bg-yellow-500';
                statusText = 'BLOQUEADO';
                statusColor = 'text-yellow-600';
                rowOpacity = 'opacity-75 bg-gray-50'; 
            }

            const lastSeen = atm.lastSeen ? new Date(atm.lastSeen).toLocaleTimeString() : '---';
            const dinheiro = atm.dinheiro 
                ? parseFloat(atm.dinheiro).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : 'R$ 0,00';

            tr.className = rowOpacity; // Aplica opacidade na linha

            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${atm.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${atm.ip || '---'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">${dinheiro}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor} bg-opacity-10 bg-gray-100 border border-gray-200">
                        <span class="h-2 w-2 mr-1 rounded-full ${statusClass}"></span>
                        ${statusText}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${lastSeen}</td>
                
                <td class="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                    <button 
                        onclick="bloquearAtm('${atm.id}')" 
                        class="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        ${atm.status !== 'ONLINE' ? 'disabled' : ''}
                        title="Enviar comando TCP para desligar o terminal">
                        ⛔ BLOQUEAR
                    </button>

                    <button 
                        onclick="abastecerAtm('${atm.id}')" 
                        class="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        ${atm.status !== 'ONLINE' ? 'disabled' : ''}
                        title="Enviar comando TCP para resetar o saldo">
                        💵 ABASTECER
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Erro dashboard:", error);
    }
}

async function abastecerAtm(id) {
    const valor = 50000; 

    if (!confirm(`Deseja REINICIAR o saldo do terminal ${id} para R$ ${valor}?`)) return;

    try {
        const res = await fetch(`${GATEWAY_URL}/atms/refill`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, amount: valor })
        });

        if (res.ok) {
            alert(`Comando de abastecimento enviado!`);
        } else {
            alert('Erro ao abastecer.');
        }
    } catch (error) {
        console.error(error);
        alert('Erro de conexão.');
    }
}


window.abastecerAtm = abastecerAtm;
window.marcarComoLida = marcarComoLida;
window.limparNotificacoes = limparNotificacoes;
window.fazerLogout = fazerLogout;
window.atualizarDashboard = atualizarDashboard;
window.bloquearAtm = bloquearAtm;

verificarLogin();