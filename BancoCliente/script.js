const GATEWAY_URL = 'http://localhost:3000/banco';

        // Função para exibir alertas
        function showAlert(message, type = 'success') {
            const alertBox = document.getElementById('alertBox');
            alertBox.className = `mb-6 p-4 rounded-lg ${type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}`;
            alertBox.textContent = message;
            alertBox.classList.remove('hidden');
            
            setTimeout(() => alertBox.classList.add('hidden'), 5000);
        }
        // Cliente websocket para notificações
        const WS_URL = 'ws://localhost:4000'; // MESMA porta que o ws-service
   
        let clienteIdWs = null;
        let socket = null;

        // Função para abrir conexão WebSocket quando o usuário informar a conta
        function conectarWebSocket(clienteId) {
            if (!clienteId) return;
            if (clienteIdWs === clienteId && socket && socket.readyState === WebSocket.OPEN) {
                // já conectado para esse cliente
                return;
            }
            // se já existir uma conexão para outro cliente, fechar antes
            if (socket) {
                try { socket.close(); } catch (e) { /* ignore */ }
                socket = null;
            }

            clienteIdWs = clienteId;

            // permite passar token via input `id="wsToken"` ou via variável global `window.CLIENT_WS_TOKEN`
            const tokenInput = document.getElementById('wsToken');
            const token = (tokenInput && tokenInput.value) ? tokenInput.value.trim() : (window.CLIENT_WS_TOKEN ?? null);
            const url = token
                ? `${WS_URL}?clienteId=${encodeURIComponent(clienteIdWs)}&token=${encodeURIComponent(token)}`
                : `${WS_URL}?clienteId=${encodeURIComponent(clienteIdWs)}`;
            console.log('Conectando WS em', url);

            socket = new WebSocket(url);

            socket.onopen = () => {
                console.log('WebSocket conectado para cliente', clienteIdWs);
                showAlert(`WebSocket conectado para a conta/cliente: ${clienteIdWs}`, 'success');
            };

            socket.onmessage = (event) => {
                try {
                const mensagem = JSON.parse(event.data);
                if (mensagem.event === 'nova-transacao') {
                    const { valor, tipo, timestamp } = mensagem.data;
                    showAlert(
                    `💰 Você recebeu uma ${tipo} de R$ ${valor} em ${new Date(timestamp).toLocaleString()}`,
                    'success'
                    );
                    console.log('Notificação recebida via WS:', mensagem);
                }
                } catch (e) {
                console.error('Erro ao processar mensagem WS', e);
                }
            };

            socket.onclose = () => {
                console.log('Conexão WebSocket fechada para', clienteIdWs);
                socket = null;         // limpar referência
                clienteIdWs = null;    // permitir nova conexão futura
            };

            socket.onerror = (err) => {
                console.error('Erro no WebSocket', err);
                showAlert('❌ Erro na conexão WebSocket. Verifique se o ws-service está rodando.', 'error');
            };
        }
        
        // Criar Cliente (via SOAP)
        document.getElementById('formCriarCliente').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nome = document.getElementById('nomeCliente').value;
        const cpf = document.getElementById('cpfCliente').value;

        try {
            const response = await fetch(`${GATEWAY_URL}/soap/criarCliente`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, cpf })
            });

            if (response.ok || response.status === 201) {
            const data = await response.json();
            document.getElementById('criarClienteData').textContent = JSON.stringify(data, null, 2);
            document.getElementById('resultCriarCliente').classList.remove('hidden');
            showAlert(`✅ Cliente criado com sucesso! ID: ${data.data.id}`, 'success');
            document.getElementById('formCriarCliente').reset();
            } else {
            const error = await response.text();
            showAlert(`❌ Erro ${response.status}: ${error}`, 'error');
            }
        } catch (error) {
            showAlert(`❌ Erro de conexão: ${error.message}`, 'error');
        }
        });

        // Criar Nova Conta (via SOAP)
        document.getElementById('formCriarConta').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const clienteId = parseInt(document.getElementById('clienteIdCriarConta').value);
        const numeroConta = document.getElementById('numeroContaCriarConta').value;
        const saldoInicial = parseFloat(document.getElementById('saldoInicialCriarConta').value);

        try {
            const response = await fetch(`${GATEWAY_URL}/soap/criarConta`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ clienteId, numeroConta, saldoInicial })
            });

            if (response.ok || response.status === 201) {
            const data = await response.json();
            document.getElementById('criarContaData').textContent = JSON.stringify(data, null, 2);
            document.getElementById('resultCriarConta').classList.remove('hidden');
            showAlert(`✅ Conta criada com sucesso!`, 'success');
            document.getElementById('formCriarConta').reset();
            } else {
            const error = await response.text();
            showAlert(`❌ Erro ${response.status}: ${error}`, 'error');
            }
        } catch (error) {
            showAlert(`❌ Erro de conexão: ${error.message}`, 'error');
        }
        });

        // Consultar Saldo (SOAP)
        document.getElementById('formSaldoSoap').addEventListener('submit', async (e) => {
        e.preventDefault();
        const conta = document.getElementById('contaSaldoSoap').value;

        try {
            const response = await fetch(`${GATEWAY_URL}/soap/saldo?conta=${conta}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
            });

            if (response.ok) {
            const data = await response.json();
            document.getElementById('saldoSoapData').textContent = JSON.stringify(data, null, 2);
            document.getElementById('resultSaldoSoap').classList.remove('hidden');
            showAlert(`✅ Saldo consultado com sucesso via SOAP!`, 'success');
            } else {
            const error = await response.text();
            showAlert(`❌ Erro ${response.status}: ${error}`, 'error');
            }
        } catch (error) {
            showAlert(`❌ Erro de conexão: ${error.message}. Verifique se o Gateway está rodando`, 'error');
        }
        });

        // Consultar Extrato (REST)
        document.getElementById('formExtratoRest').addEventListener('submit', async (e) => {
        e.preventDefault();
        const conta = document.getElementById('contaExtratoRest').value;

        try {
            const response = await fetch(`${GATEWAY_URL}/rest/extrato?conta=${conta}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
            });

            if (response.ok) {
            const data = await response.json();
            document.getElementById('extratoRestData').textContent = JSON.stringify(data, null, 2);
            document.getElementById('resultExtratoRest').classList.remove('hidden');
            showAlert(`✅ Extrato consultado com sucesso via REST!`, 'success');
            } else {
            const error = await response.text();
            showAlert(`❌ Erro ${response.status}: ${error}`, 'error');
            }
        } catch (error) {
            showAlert(`❌ Erro de conexão: ${error.message}. Verifique se o Gateway está rodando`, 'error');
        }
        });

        // Criar Chave PIX (via REST)
        document.getElementById('formCriarChavePix').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const clienteId = parseInt(document.getElementById('clienteIdChavePix').value);
        const valor = document.getElementById('chavePixValor').value;  // AGORA É "valor"
        const tipo = document.getElementById('tipoChavePix').value;    // AGORA É "tipo"
        const numeroConta = document.getElementById('contaPix').value; // NOVO CAMPO

        const url = `${GATEWAY_URL}/rest/clientes/${clienteId}/chaves-pix`;
        const payload = { tipo, valor, numeroConta };  // CAMPOS CORRETOS!

        console.log('URL:', url);
        console.log('Payload:', payload);

        try {
            const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
            });

            if (response.ok || response.status === 201) {
            const data = await response.json();
            document.getElementById('criarChavePixData').textContent = JSON.stringify(data, null, 2);
            document.getElementById('resultCriarChavePix').classList.remove('hidden');
            showAlert(`✅ Chave PIX criada com sucesso!`, 'success');
            document.getElementById('formCriarChavePix').reset();
            } else {
            const error = await response.text();
            showAlert(`❌ Erro ${response.status}: ${error}`, 'error');
            }
        } catch (error) {
            showAlert(`❌ Erro de conexão: ${error.message}`, 'error');
        }
        });

        // Realizar Transferência
        //TED
        document.getElementById('formTransferenciaTED').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const contaOrigem = document.getElementById('contaOrigemTED').value;
        const contaDestino = document.getElementById('contaDestinoTED').value;
        const valor = parseFloat(document.getElementById('valorTED').value);

        try {
            const response = await fetch(`${GATEWAY_URL}/soap/TED`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contaOrigem, contaDestino, valor })
            });

            if (response.ok || response.status === 201) {
            const data = await response.json();
            document.getElementById('resultadoTED').textContent = JSON.stringify(data, null, 2);
            document.getElementById('resultTransferenciaTED').classList.remove('hidden');
            showAlert(`✅ Transferência TED realizada com sucesso!`, 'success');
            document.getElementById('formTransferenciaTED').reset();
            } else {
            const error = await response.text();
            showAlert(`❌ Erro ${response.status}: ${error}`, 'error');
            }
        } catch (error) {
            showAlert(`❌ Erro de conexão: ${error.message}`, 'error');
        }
        });
        
        //Pix
        document.getElementById('formTransferenciaPIX').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const numeroContaOrigem = document.getElementById('contaOrigemPIX').value.trim();
        const chaveDestino = document.getElementById('chaveDestinoPIX').value.trim();
        const valorStr = document.getElementById('valorPIX').value.trim();
        const valor = parseFloat(valorStr);

        console.log('=== DEBUG PIX TRANSFER ===');
        console.log('numeroContaOrigem:', numeroContaOrigem, 'type:', typeof numeroContaOrigem);
        console.log('chaveDestino:', chaveDestino, 'type:', typeof chaveDestino);
        console.log('valor:', valor, 'type:', typeof valor);
        console.log('=== END DEBUG ===');

        if (!numeroContaOrigem || !chaveDestino || isNaN(valor)) {
            showAlert('❌ Preencha todos os campos corretamente', 'error');
            return;
        }

        const url = `${GATEWAY_URL}/rest/pix`;
        const payload = { 
            numeroContaOrigem,
            chaveDestino, 
            valor 
        };

        console.log('Enviando para:', url);
        console.log('Payload:', JSON.stringify(payload));

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            console.log('Status HTTP:', response.status);
            const data = await response.json();
            console.log('Resposta do servidor:', data);

            if (response.ok || response.status === 201) {
                document.getElementById('resultadoPIX').textContent = JSON.stringify(data, null, 2);
                document.getElementById('resultTransferenciaPIX').classList.remove('hidden');
                showAlert(`✅ Transferência PIX realizada com sucesso!`, 'success');
                document.getElementById('formTransferenciaPIX').reset();
            } else {
                const errorMsg = data.message || data.error || JSON.stringify(data);
                console.error('Erro na resposta:', errorMsg);
                showAlert(`❌ Erro ${response.status}: ${errorMsg}`, 'error');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            showAlert(`❌ Erro de conexão: ${error.message}`, 'error');
        }
    });