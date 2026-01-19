/**
 * Cliente de Chat TCP/UDP para o Banco DSD
 * Suporta três modos de conexão:
 * - REST: Via API HTTP para enviar/receber mensagens
 * - TCP: Conexão direta via WebSocket (ponte TCP)
 * - UDP: Simulação via polling REST
 */

class ChatClient {
    constructor() {
        this.connected = false;
        this.protocol = 'rest'; // 'rest', 'tcp', 'udp'
        this.username = '';
        this.messages = [];
        this.users = [];
        this.unreadCount = 0;
        this.pollInterval = null;
        this.lastMessageId = 0;
        
        // URLs do servidor
        this.CHAT_API_URL = GATEWAY_URL + '/chat';
        
        this.initElements();
        this.initEventListeners();
    }

    initElements() {
        // Elementos principais
        this.btnOpenChat = document.getElementById('btnOpenChat');
        this.btnCloseChat = document.getElementById('btnCloseChat');
        this.chatWindow = document.getElementById('chatWindow');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatForm = document.getElementById('chatForm');
        this.chatInput = document.getElementById('chatInput');
        this.btnSendMessage = document.getElementById('btnSendMessage');
        this.chatStatus = document.getElementById('chatStatus');
        this.protocolSelect = document.getElementById('protocoloChat');
        this.btnConnectChat = document.getElementById('btnConnectChat');
        this.btnDisconnectChat = document.getElementById('btnDisconnectChat');
        this.chatUnreadBadge = document.getElementById('chatUnreadBadge');
        this.btnToggleUsers = document.getElementById('btnToggleUsers');
        this.chatUsers = document.getElementById('chatUsers');
        this.userList = document.getElementById('userList');
        this.userCount = document.getElementById('userCount');
    }

    initEventListeners() {
        // Abrir/Fechar chat
        this.btnOpenChat.addEventListener('click', () => this.toggleChat());
        this.btnCloseChat.addEventListener('click', () => this.toggleChat());
        
        // Conectar/Desconectar
        this.btnConnectChat.addEventListener('click', () => this.connect());
        this.btnDisconnectChat.addEventListener('click', () => this.disconnect());
        
        // Enviar mensagem
        this.chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });
        
        // Trocar protocolo
        this.protocolSelect.addEventListener('change', (e) => {
            if (this.connected) {
                if (confirm('Deseja desconectar e trocar para ' + e.target.value.toUpperCase() + '?')) {
                    this.disconnect();
                    this.protocol = e.target.value;
                } else {
                    e.target.value = this.protocol;
                }
            } else {
                this.protocol = e.target.value;
            }
        });
        
        // Toggle lista de usuários
        this.btnToggleUsers.addEventListener('click', () => {
            this.chatUsers.classList.toggle('hidden');
        });
    }

    toggleChat() {
        const isHidden = this.chatWindow.classList.contains('hidden');
        
        if (isHidden) {
            this.chatWindow.classList.remove('hidden');
            this.btnOpenChat.classList.add('scale-0');
            this.unreadCount = 0;
            this.updateUnreadBadge();
        } else {
            this.chatWindow.classList.add('hidden');
            this.btnOpenChat.classList.remove('scale-0');
        }
    }

    async connect() {
        // Usar nome da conta logada ou pedir nome
        this.username = contaLogada || prompt('Digite seu nome de usuário:');
        
        if (!this.username) {
            this.addSystemMessage('❌ Nome de usuário é obrigatório');
            return;
        }

        this.updateStatus('Conectando...');
        this.btnConnectChat.disabled = true;

        try {
            switch (this.protocol) {
                case 'rest':
                    await this.connectREST();
                    break;
                case 'tcp':
                    await this.connectTCP();
                    break;
                case 'udp':
                    await this.connectUDP();
                    break;
            }
        } catch (error) {
            console.error('Erro ao conectar:', error);
            this.addSystemMessage('❌ Erro ao conectar: ' + error.message);
            this.updateStatus('Desconectado');
            this.btnConnectChat.disabled = false;
        }
    }

    async connectREST() {
        try {
            // Buscar histórico e informações
            const response = await fetch(`${this.CHAT_API_URL}/info`, {
                headers: getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Erro ao conectar ao servidor');
            }

            const info = await response.json();
            
            this.connected = true;
            this.updateStatus(`Conectado (REST)`);
            this.btnConnectChat.classList.add('hidden');
            this.btnDisconnectChat.classList.remove('hidden');
            this.chatInput.disabled = false;
            this.btnSendMessage.disabled = false;
            
            this.addSystemMessage(`✅ Conectado como ${this.username} via REST`);
            
            // Carregar mensagens recentes
            await this.loadMessages();
            await this.loadUsers();
            
            // Iniciar polling para novas mensagens
            this.startPolling();
            
        } catch (error) {
            throw error;
        }
    }

    async connectTCP() {
        this.addSystemMessage('⚠️ TCP: Conecte diretamente via tcp-client.js');
        this.addSystemMessage('ℹ️ Execute: node tcp-client.js ' + this.username);
        
        // Simular conexão para demonstração
        this.connected = true;
        this.updateStatus('TCP (simulado)');
        this.btnConnectChat.classList.add('hidden');
        this.btnDisconnectChat.classList.remove('hidden');
        
        // Carregar via REST para visualização
        await this.loadMessages();
        this.startPolling();
    }

    async connectUDP() {
        this.addSystemMessage('⚠️ UDP: Conecte diretamente via udp-client.js');
        this.addSystemMessage('ℹ️ Execute: node udp-client.js ' + this.username);
        
        // Simular conexão para demonstração
        this.connected = true;
        this.updateStatus('UDP (simulado)');
        this.btnConnectChat.classList.add('hidden');
        this.btnDisconnectChat.classList.remove('hidden');
        
        // Carregar via REST para visualização
        await this.loadMessages();
        this.startPolling();
    }

    disconnect() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }

        this.connected = false;
        this.updateStatus('Desconectado');
        this.btnConnectChat.classList.remove('hidden');
        this.btnDisconnectChat.classList.add('hidden');
        this.chatInput.disabled = true;
        this.btnSendMessage.disabled = true;
        this.btnConnectChat.disabled = false;
        
        this.addSystemMessage('👋 Desconectado do chat');
    }

    async loadMessages() {
        try {
            const response = await fetch(`${this.CHAT_API_URL}/messages?limit=50`, {
                headers: getHeaders()
            });
            
            if (!response.ok) return;
            
            const result = await response.json();
            
            if (result.success && result.data.messages) {
                // Limpar mensagens antigas
                this.chatMessages.innerHTML = '';
                
                result.data.messages.forEach(msg => {
                    this.displayMessage(msg, false);
                    if (msg.id > this.lastMessageId) {
                        this.lastMessageId = parseInt(msg.id);
                    }
                });
                
                this.scrollToBottom();
            }
        } catch (error) {
            console.error('Erro ao carregar mensagens:', error);
        }
    }

    async loadUsers() {
        try {
            const response = await fetch(`${this.CHAT_API_URL}/users`, {
                headers: getHeaders()
            });
            
            if (!response.ok) return;
            
            const result = await response.json();
            
            if (result.success && result.data.users) {
                this.users = result.data.users;
                this.updateUserList();
            }
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
        }
    }

    startPolling() {
        // Atualizar mensagens a cada 2 segundos
        this.pollInterval = setInterval(async () => {
            await this.checkNewMessages();
            await this.loadUsers();
        }, 2000);
    }

    async checkNewMessages() {
        try {
            const response = await fetch(`${this.CHAT_API_URL}/messages?limit=100`, {
                headers: getHeaders()
            });
            
            if (!response.ok) return;
            
            const result = await response.json();
            
            if (result.success && result.data.messages) {
                const newMessages = result.data.messages.filter(msg => 
                    parseInt(msg.id) > this.lastMessageId
                );
                
                newMessages.forEach(msg => {
                    this.displayMessage(msg, true);
                    this.lastMessageId = parseInt(msg.id);
                    
                    // Incrementar contador se janela estiver fechada
                    if (this.chatWindow.classList.contains('hidden')) {
                        this.unreadCount++;
                        this.updateUnreadBadge();
                    }
                });
                
                if (newMessages.length > 0) {
                    this.scrollToBottom();
                }
            }
        } catch (error) {
            console.error('Erro ao verificar novas mensagens:', error);
        }
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        
        if (!message || !this.connected) return;
        
        this.chatInput.value = '';
        
        try {
            // Enviar via REST API (funciona para todos os protocolos)
            const response = await fetch(`${this.CHAT_API_URL}/message`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    username: this.username,
                    message: message
                })
            });
            
            if (!response.ok) {
                throw new Error('Erro ao enviar mensagem');
            }
            
            // A mensagem será exibida quando vier do polling
            
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            this.addSystemMessage('❌ Erro ao enviar mensagem');
        }
    }

    displayMessage(msg, isNew = false) {
        const messageDiv = document.createElement('div');
        const isOwnMessage = msg.username === this.username;
        const isSystem = msg.username === 'Sistema';
        
        if (isSystem) {
            messageDiv.className = 'text-center';
            messageDiv.innerHTML = `
                <div class="inline-block bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs">
                    ${this.escapeHtml(msg.message)}
                </div>
            `;
        } else {
            messageDiv.className = `flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`;
            
            const time = new Date(msg.timestamp).toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            const protocolBadge = msg.protocol ? `
                <span class="text-xs px-1.5 py-0.5 rounded ${
                    msg.protocol === 'TCP' ? 'bg-blue-100 text-blue-700' :
                    msg.protocol === 'UDP' ? 'bg-green-100 text-green-700' :
                    'bg-purple-100 text-purple-700'
                }">
                    ${msg.protocol}
                </span>
            ` : '';
            
            messageDiv.innerHTML = `
                <div class="max-w-xs ${isOwnMessage ? 'bg-blue-600 text-white' : 'bg-white'} rounded-2xl px-4 py-2 shadow">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="font-semibold text-sm ${isOwnMessage ? 'text-white' : 'text-gray-800'}">${this.escapeHtml(msg.username)}</span>
                        ${protocolBadge}
                    </div>
                    <p class="text-sm ${isOwnMessage ? 'text-white' : 'text-gray-700'}">${this.escapeHtml(msg.message)}</p>
                    <div class="text-xs ${isOwnMessage ? 'text-blue-200' : 'text-gray-500'} mt-1">${time}</div>
                </div>
            `;
        }
        
        if (isNew) {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateY(10px)';
        }
        
        this.chatMessages.appendChild(messageDiv);
        
        if (isNew) {
            setTimeout(() => {
                messageDiv.style.transition = 'all 0.3s ease';
                messageDiv.style.opacity = '1';
                messageDiv.style.transform = 'translateY(0)';
            }, 10);
        }
    }

    addSystemMessage(message) {
        this.displayMessage({
            username: 'Sistema',
            message: message,
            timestamp: new Date().toISOString(),
            protocol: 'WS'
        }, true);
        this.scrollToBottom();
    }

    updateUserList() {
        this.userCount.textContent = this.users.length;
        
        if (this.users.length === 0) {
            this.userList.innerHTML = '<p class="text-xs text-gray-500 text-center py-2">Nenhum usuário online</p>';
            return;
        }
        
        this.userList.innerHTML = this.users.map(user => `
            <div class="flex items-center gap-2 text-xs p-2 bg-white rounded hover:bg-gray-50 transition-colors">
                <div class="w-2 h-2 rounded-full bg-green-500"></div>
                <span class="flex-1 text-gray-700 font-medium">${this.escapeHtml(user.username)}</span>
                <span class="px-1.5 py-0.5 rounded text-xs ${
                    user.protocol === 'TCP' ? 'bg-blue-100 text-blue-700' :
                    user.protocol === 'UDP' ? 'bg-green-100 text-green-700' :
                    'bg-purple-100 text-purple-700'
                }">
                    ${user.protocol}
                </span>
            </div>
        `).join('');
    }

    updateUnreadBadge() {
        if (this.unreadCount > 0) {
            this.chatUnreadBadge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
            this.chatUnreadBadge.classList.remove('hidden');
        } else {
            this.chatUnreadBadge.classList.add('hidden');
        }
    }

    updateStatus(status) {
        this.chatStatus.textContent = status;
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inicializar cliente de chat quando a página carregar
let chatClient;

window.addEventListener('DOMContentLoaded', () => {
    chatClient = new ChatClient();
    console.log('💬 Cliente de chat inicializado');
});
