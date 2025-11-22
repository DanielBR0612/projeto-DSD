import requests
import sys

# Configuração do Gateway
GATEWAY_URL = "http://localhost:3000/banco"

def consultar_saldo():
    print("\n--- Consultar Saldo ---")
    conta = input("Digite o número da conta: ")
    print("Escolha o sistema:")
    print("1. REST (Kotlin)")
    print("2. SOAP (Java)")
    escolha = input("Opção: ")
    
    tipo = "soap" if escolha == "2" else "rest"
    
    try:
        # Chamada GET ao Gateway
        response = requests.get(f"{GATEWAY_URL}/saldo", params={"conta": conta, "tipo": tipo})
        
        if response.status_code == 200:
            dados = response.json()
            print(f"\n✅ Sucesso [{tipo.upper()}]:")
            print(dados)
        else:
            print(f"\n❌ Erro {response.status_code}: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("\n❌ Erro: Não foi possível conectar ao Gateway (localhost:3000). Ele está rodando?")

def realizar_transferencia():
    print("\n--- Realizar Transferência (Pix/TED) ---")
    origem = input("Conta Origem: ")
    destino = input("Conta Destino: ")
    valor = input("Valor: ")
    
    print("Escolha o sistema:")
    print("1. Pix (REST)")
    print("2. TED (SOAP)")
    escolha = input("Opção: ")
    
    tipo = "soap" if escolha == "2" else "rest"
    
    # Monta o payload (ajuste as chaves conforme seu DTO real no Java/Kotlin)
    payload = {
        "contaOrigem": origem,
        "contaDestino": destino,
        "valor": float(valor)
    }
    
    try:
        # Chamada POST ao Gateway
        response = requests.post(f"{GATEWAY_URL}/pix", json=payload, params={"tipo": tipo})
        
        if response.status_code == 201 or response.status_code == 200:
            dados = response.json()
            print(f"\n✅ Transferência realizada [{tipo.upper()}]:")
            print(dados)
        else:
            print(f"\n❌ Erro {response.status_code}: {response.text}")

    except ValueError:
        print("\n❌ Erro: O valor deve ser numérico (ex: 100.50)")
    except requests.exceptions.ConnectionError:
        print("\n❌ Erro: Gateway indisponível.")

def menu():
    while True:
        print("\n=== CLIENTE BANCÁRIO (PYTHON) ===")
        print("1. Consultar Saldo")
        print("2. Realizar Transferência")
        print("0. Sair")
        opcao = input("Escolha: ")

        if opcao == "1":
            consultar_saldo()
        elif opcao == "2":
            realizar_transferencia()
        elif opcao == "0":
            print("Saindo...")
            sys.exit()
        else:
            print("Opção inválida!")

if __name__ == "__main__":
    menu()