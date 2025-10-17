import requests
from bs4 import BeautifulSoup
import json
import os

# --- 1. CONFIGURAÇÃO ---
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("Chave de API do Gemini não encontrada.")

# O ENDPOINT CORRETO E ESTÁVEL DA API v1
GEMINI_API_ENDPOINT = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent?key={GEMINI_API_KEY}"

RSS_URL = 'https://news.google.com/rss/search?q=%22Museu%20do%20Carv%C3%A3o%22&hl=pt-BR&gl=BR&ceid=BR:pt-419'

# --- 2. COLETA (LENDO O FEED RSS) ---
print("Lendo o feed RSS do Google News...")
try:
    headers_rss = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 1.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
    }

    response = requests.get(RSS_URL, headers=headers_rss, timeout=15)
    response.raise_for_status()
    soup = BeautifulSoup(response.content, 'xml')

    first_item = soup.find('item')
    if not first_item:
        print("Nenhuma notícia recente encontrada no feed RSS. Nenhuma atualização será feita.")
        exit()

    news_title = first_item.find('title').get_text()
    news_link = first_item.find('link').get_text()

    print(f"Notícia encontrada: {news_title}")

    # --- 3. PROCESSAMENTO (IA VIA API REST DIRETA) ---
    print("Enviando título para a API REST do Gemini...")
    
    prompt = f"""
    Com base no seguinte título de uma notícia, crie um resumo conciso e chamativo de no máximo duas frases para a homepage de um site.
    
    Título: "{news_title}"
    
    Formate sua resposta EXATAMENTE assim, sem nenhuma palavra extra:
    RESUMO: [Seu resumo aqui]
    """

    # Montamos o corpo da requisição JSON manualmente
    request_body = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }
    
    # Cabeçalho necessário para a API REST
    headers_gemini = {'Content-Type': 'application/json'}

    # Fazemos a chamada POST direta para o endpoint
    try:
        response_ia_raw = requests.post(GEMINI_API_ENDPOINT, headers=headers_gemini, json=request_body, timeout=30)
        response_ia_raw.raise_for_status() # Verifica erros HTTP (como 404, 403, etc)
        
        response_ia_json = response_ia_raw.json()
        
        # Extraímos o texto da resposta JSON (a estrutura pode variar um pouco)
        resumo = response_ia_json['candidates'][0]['content']['parts'][0]['text'].replace("RESUMO:", "").strip()
        
        print(f"IA gerou o resumo: {resumo}")

    except requests.exceptions.RequestException as e_req:
        print(f"Erro na requisição para a API do Gemini: {e_req}")
        if response_ia_raw:
             print(f"Resposta da API: {response_ia_raw.text}") # Mostra a resposta completa se houver erro
        exit(1)
    except (KeyError, IndexError) as e_json:
         print(f"Erro ao processar a resposta JSON da API do Gemini: {e_json}")
         print(f"Resposta JSON recebida: {response_ia_json}")
         exit(1)


    # --- 4. SALVA OS DADOS ---
    nova_noticia = {
        "titulo": news_title,
        "resumo": resumo,
        "link": news_link,
        "imagem_url": "img/projeto-enchente.jpg" # Mantemos nossa imagem padrão
    }

    with open('noticias.json', 'w', encoding='utf-8') as f:
        json.dump(nova_noticia, f, ensure_ascii=False, indent=4)

    print("Arquivo noticias.json atualizado com sucesso!")

except Exception as e:
    print(f"Ocorreu um erro geral: {e}")