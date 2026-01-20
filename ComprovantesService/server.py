import grpc
from concurrent import futures
import time
from datetime import datetime
from io import BytesIO

# Importa os stubs gerados do .proto
import comprovante_pb2
import comprovante_pb2_grpc

# ReportLab para geração de PDF
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas
from reportlab.lib import colors


class ComprovanteServiceServicer(comprovante_pb2_grpc.ComprovanteServiceServicer):
    """Implementação do serviço de geração de comprovantes"""
    
    def GerarComprovante(self, request, context):
        """Gera um comprovante em PDF a partir dos dados da transação"""
        try:
            print(f"📄 Recebendo requisição para gerar comprovante {request.tipo_transacao}")
            print(f"   Origem: {request.conta_origem}, Destino: {request.conta_destino}, Valor: R$ {request.valor:.2f}")
            
            # Cria PDF em memória
            pdf_buffer = BytesIO()
            
            # Cria o canvas do PDF
            c = canvas.Canvas(pdf_buffer, pagesize=A4)
            width, height = A4
            
            # ========== CABEÇALHO ==========
            c.setFillColor(colors.HexColor("#1e3a8a"))  # Azul escuro
            c.rect(0, height - 3*cm, width, 3*cm, fill=True, stroke=False)
            
            c.setFillColor(colors.white)
            c.setFont("Helvetica-Bold", 24)
            c.drawCentredString(width/2, height - 1.5*cm, "COMPROVANTE DE TRANSAÇÃO")
            
            c.setFont("Helvetica", 12)
            c.drawCentredString(width/2, height - 2.2*cm, "Banco DSD - Sistema Distribuído")
            
            # ========== TIPO DE TRANSAÇÃO ==========
            y_position = height - 5*cm
            
            # Badge do tipo de transação
            tipo_color = colors.HexColor("#ea580c") if request.tipo_transacao == "PIX" else colors.HexColor("#16a34a")
            c.setFillColor(tipo_color)
            c.roundRect(3*cm, y_position - 0.8*cm, 4*cm, 1*cm, 0.3*cm, fill=True, stroke=False)
            
            c.setFillColor(colors.white)
            c.setFont("Helvetica-Bold", 16)
            c.drawCentredString(5*cm, y_position - 0.4*cm, request.tipo_transacao)
            
            # ========== INFORMAÇÕES DA TRANSAÇÃO ==========
            y_position -= 2.5*cm
            c.setFillColor(colors.black)
            c.setFont("Helvetica-Bold", 14)
            c.drawString(3*cm, y_position, "Dados da Transação")
            
            # Linha separadora
            y_position -= 0.3*cm
            c.setStrokeColor(colors.grey)
            c.setLineWidth(0.5)
            c.line(3*cm, y_position, width - 3*cm, y_position)
            
            # Informações
            y_position -= 1*cm
            c.setFont("Helvetica", 11)
            linha_height = 0.7*cm
            
            # ID da Transação
            c.setFont("Helvetica-Bold", 11)
            c.drawString(3*cm, y_position, "ID da Transação:")
            c.setFont("Helvetica", 11)
            c.drawString(8*cm, y_position, request.id_transacao)
            y_position -= linha_height
            
            # Data e Hora
            try:
                data_formatada = datetime.fromisoformat(request.data_hora.replace('Z', '+00:00'))
                data_str = data_formatada.strftime("%d/%m/%Y às %H:%M:%S")
            except:
                data_str = request.data_hora
            
            c.setFont("Helvetica-Bold", 11)
            c.drawString(3*cm, y_position, "Data e Hora:")
            c.setFont("Helvetica", 11)
            c.drawString(8*cm, y_position, data_str)
            y_position -= linha_height
            
            # Conta de Origem
            c.setFont("Helvetica-Bold", 11)
            c.drawString(3*cm, y_position, "Conta Origem:")
            c.setFont("Helvetica", 11)
            c.drawString(8*cm, y_position, request.conta_origem)
            y_position -= linha_height
            
            # Conta de Destino / Chave PIX
            label_destino = "Chave PIX:" if request.tipo_transacao == "PIX" else "Conta Destino:"
            c.setFont("Helvetica-Bold", 11)
            c.drawString(3*cm, y_position, label_destino)
            c.setFont("Helvetica", 11)
            c.drawString(8*cm, y_position, request.conta_destino)
            y_position -= linha_height * 1.5
            
            # ========== VALOR ==========
            # Destaque para o valor
            c.setFillColor(colors.HexColor("#f3f4f6"))
            c.roundRect(3*cm, y_position - 1.5*cm, width - 6*cm, 2*cm, 0.5*cm, fill=True, stroke=True)
            
            c.setFillColor(colors.black)
            c.setFont("Helvetica-Bold", 14)
            c.drawCentredString(width/2, y_position - 0.5*cm, "VALOR DA TRANSAÇÃO")
            
            c.setFillColor(colors.HexColor("#16a34a"))
            c.setFont("Helvetica-Bold", 24)
            valor_formatado = f"R$ {request.valor:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
            c.drawCentredString(width/2, y_position - 1.2*cm, valor_formatado)
            
            # ========== RODAPÉ ==========
            y_position = 4*cm
            c.setFillColor(colors.grey)
            c.setFont("Helvetica", 9)
            c.drawCentredString(width/2, y_position, "Este comprovante possui validade jurídica e pode ser usado como prova da transação.")
            
            y_position -= 0.5*cm
            c.drawCentredString(width/2, y_position, f"Gerado em {datetime.now().strftime('%d/%m/%Y às %H:%M:%S')}")
            
            y_position -= 0.5*cm
            c.setFont("Helvetica-Bold", 9)
            c.drawCentredString(width/2, y_position, "Banco DSD | Sistema Bancário Distribuído")
            
            # ========== MARCA D'ÁGUA ==========
            c.setFillColor(colors.Color(0, 0, 0, alpha=0.05))
            c.setFont("Helvetica-Bold", 60)
            c.saveState()
            c.translate(width/2, height/2)
            c.rotate(45)
            c.drawCentredString(0, 0, "BANCO DSD")
            c.restoreState()
            
            # Finaliza o PDF
            c.showPage()
            c.save()
            
            # Obtém os bytes do PDF
            pdf_bytes = pdf_buffer.getvalue()
            pdf_buffer.close()
            
            # Gera nome do arquivo
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"comprovante_{request.tipo_transacao.lower()}_{timestamp}.pdf"
            
            print(f"✅ Comprovante gerado com sucesso: {filename} ({len(pdf_bytes)} bytes)")
            
            # Retorna a resposta
            return comprovante_pb2.ComprovanteResponse(
                pdf_data=pdf_bytes,
                filename=filename,
                success=True,
                message=f"Comprovante gerado com sucesso"
            )
            
        except Exception as e:
            print(f"❌ Erro ao gerar comprovante: {str(e)}")
            return comprovante_pb2.ComprovanteResponse(
                pdf_data=b"",
                filename="",
                success=False,
                message=f"Erro ao gerar comprovante: {str(e)}"
            )


def serve():
    """Inicia o servidor gRPC"""
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    
    # Registra o serviço
    comprovante_pb2_grpc.add_ComprovanteServiceServicer_to_server(
        ComprovanteServiceServicer(), server
    )
    
    # Configura a porta
    port = "50051"
    server.add_insecure_port(f"0.0.0.0:{port}")
    
    # Inicia o servidor
    server.start()
    print(f"🚀 Servidor gRPC de Comprovantes iniciado na porta {port}")
    print(f"📄 Aguardando requisições de geração de comprovantes...")
    
    try:
        while True:
            time.sleep(86400)  # Mantém o servidor rodando
    except KeyboardInterrupt:
        print("\n⏹️  Encerrando servidor...")
        server.stop(0)


if __name__ == "__main__":
    serve()
