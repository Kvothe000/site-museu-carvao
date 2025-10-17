import requests
from bs4 import BeautifulSoup
import json
import os

# --- 1. CONFIGURAÇÃO ---
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("Chave de API do Gemini não encontrada.")

# <<< A CORREÇÃO ESTÁ AQUI: NOME DO MODELO SIMPLIFICADO >>>
GEMINI_API_ENDPOINT = f"https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key={GEMINI_API_KEY}"

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

    request_body = { "contents": [{ "parts": [{"text": prompt}] }] }
    headers_gemini = {'Content-Type': 'application/json'}

    try:
        response_ia_raw = requests.post(GEMINI_API_ENDPOINT, headers=headers_gemini, json=request_body, timeout=30)
        response_ia_raw.raise_for_status() 
        response_ia_json = response_ia_raw.json()
        
        # Tentativa de extrair o texto - pode precisar de ajuste dependendo da estrutura exata da resposta
        if 'candidates' in response_ia_json and response_ia_json['candidates']:
             if 'content' in response_ia_json['candidates'][0] and 'parts' in response_ia_json['candidates'][0]['content'] and response_ia_json['candidates'][0]['content']['parts']:
                 resumo = response_ia_json['candidates'][0]['content']['parts'][0]['text'].replace("RESUMO:", "").strip()
             else: 
                 raise ValueError("Estrutura inesperada na resposta da IA (sem 'parts').")
        else:
             # Tratamento para caso de bloqueio de segurança ou resposta vazia
             print(f"WARN: A API do Gemini retornou uma resposta sem 'candidates'. Verifique possíveis bloqueios de segurança. Resposta: {response_ia_json}")
             resumo = "" # Deixa o resumo vazio em caso de problema

        print(f"IA gerou o resumo: {resumo}")

    except requests.exceptions.RequestException as e_req:
        print(f"Erro na requisição para a API do Gemini: {e_req}")
        if 'response_ia_raw' in locals() and response_ia_raw:
             print(f"Resposta da API: {response_ia_raw.text}") 
        exit(1)
    except (KeyError, IndexError, ValueError) as e_json:
         print(f"Erro ao processar a resposta JSON da API do Gemini: {e_json}")
         if 'response_ia_json' in locals():
              print(f"Resposta JSON recebida: {response_ia_json}")
         exit(1)


    # --- 4. SALVA OS DADOS ---
    nova_noticia = {
        "titulo": news_title,
        "resumo": resumo, # Agora pode estar vazio se a IA falhar ou bloquear
        "link": news_link,
        "imagem_url": "img/projeto-enchente.jpg" 
    }

    # Só salva se o resumo não estiver vazio (opcional, mas evita salvar lixo)
    if resumo:
        with open('noticias.json', 'w', encoding='utf-8') as f:
            json.dump(nova_noticia, f, ensure_ascii=False, indent=4)
        print("Arquivo noticias.json atualizado com sucesso!")
    else:
        print("Resumo vazio recebido da IA. O arquivo noticias.json não foi atualizado.")


except Exception as e:
    print(f"Ocorreu um erro geral: {e}")