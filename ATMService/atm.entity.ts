import net from 'net';

export type AtmStatus = 'ONLINE' | 'OFFLINE' | 'BLOCKED';

export class AtmEntity {
    public id: string;
    public ip: string;
    public dinheiro: number;
    public status: AtmStatus;
    public lastSeen: Date;
    private tcpSocket?: net.Socket; 

    constructor(id: string) {
        this.id = id;
        this.ip = '0.0.0.0';
        this.dinheiro = 0;
        this.status = 'OFFLINE';
        this.lastSeen = new Date();
    }

    public updatePing(dinheiro: number, ip: string) {
        this.dinheiro = dinheiro;
        this.ip = ip;
        this.lastSeen = new Date();
        
        if (this.status === 'OFFLINE') {
            this.status = 'ONLINE';
        }
    }

    public registrarConexaoTcp(socket: net.Socket) {
        this.tcpSocket = socket;
        this.status = 'ONLINE';
        console.log(`[ATM-ENTITY] Socket TCP vinculado ao ID: ${this.id}`);
    }

    public bloquear(): boolean {
        if (!this.tcpSocket || this.tcpSocket.destroyed) {
            console.error(`[ATM-ENTITY] Falha ao bloquear ${this.id}: Sem conexão TCP.`);
            this.status = 'OFFLINE';
            return false;
        }

        try {
            this.tcpSocket.write('CMD_LOCK');
            this.status = 'BLOCKED';
            return true;
        } catch (error) {
            console.error(`[ATM-ENTITY] Erro ao enviar comando:`, error);
            return false;
        }
    }


    public verificarSaude(timeoutMs: number = 5000) {
        const agora = new Date().getTime();
        const ultimoVisto = this.lastSeen.getTime();

        if (agora - ultimoVisto > timeoutMs && this.status !== 'BLOCKED') {
            this.status = 'OFFLINE';
        }
    }

    public toJSON() {
        return {
            id: this.id,
            ip: this.ip,
            dinheiro: this.dinheiro,
            status: this.status,
            lastSeen: this.lastSeen,
        };
    }
}