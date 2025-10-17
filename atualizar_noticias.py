import requests
from bs4 import BeautifulSoup
import google.generativeai as genai
import json
import os
from urllib.parse import urljoin

# --- 1. CONFIGURAÇÃO ---
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("Chave de API do Gemini não encontrada.")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

# A NOVA FONTE: UMA BUSCA PRECISA NO GOOGLE NOTÍCIAS PARA O BRASIL
SEARCH_URL = 'https://news.google.com/search?q=%22Museu%20do%20Carv%C3%A3o%22&hl=pt-BR&gl=BR&ceid=BR%3Apt-419'
BASE_URL = 'https://news.google.com'

# --- 2. COLETA (WEB SCRAPING DO GOOGLE NOTÍCIAS) ---
print("Buscando notícias no Google News...")
try:
    # Usamos o mesmo disfarce completo de antes, pois é a melhor prática
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    }

    response = requests.get(SEARCH_URL, headers=headers, timeout=15)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, 'html.parser')

    # Encontra o primeiro artigo de notícia na lista de resultados do Google
    first_result = soup.find('article')
    
    if not first_result:
        print("Nenhuma notícia recente encontrada no Google News. Nenhuma atualização será feita.")
        exit()

    # Extrai o título e o link da notícia
    news_title = first_result.find('h3').get_text()
    relative_link = first_result.find('a')['href']
    # O link no Google é relativo (ex: ./articles/...), então construímos o link completo
    news_link = urljoin(BASE_URL, relative_link)
    
    # Pega o pequeno trecho (snippet) da notícia que o Google mostra
    snippet = first_result.find('span', class_='xBbh9').get_text()

    print(f"Notícia encontrada: {news_title}")

    # --- 3. PROCESSAMENTO (IA) ---
    print("Enviando texto para a IA para resumo...")
    prompt = f"""
    Com base no título e no trecho a seguir de uma notícia, crie um resumo conciso e chamativo de no máximo duas frases para a homepage de um site.
    
    Título: "{news_title}"
    Trecho: "{snippet}"
    
    Formate sua resposta EXATAMENTE assim, sem nenhuma palavra extra:
    RESUMO: [Seu resumo aqui]
    """

    response_ia = model.generate_content(prompt)
    resumo = response_ia.text.replace("RESUMO:", "").strip()

    print(f"IA gerou o resumo: {resumo}")

    # --- 4. SALVA OS DADOS ---
    # Nota: Não conseguimos pegar uma imagem principal de forma confiável com este método,
    # então usamos uma imagem placeholder padrão. A notícia em si é o mais importante.
    nova_noticia = {
        "titulo": news_title,
        "resumo": resumo,
        "link": news_link,
        "imagem_url": "img/projeto-enchente.jpg" # Usamos nossa imagem padrão de alta qualidade
    }

    with open('noticias.json', 'w', encoding='utf-8') as f:
        json.dump(nova_noticia, f, ensure_ascii=False, indent=4)

    print("Arquivo noticias.json atualizado com sucesso!")

except Exception as e:
    print(f"Ocorreu um erro geral: {e}")