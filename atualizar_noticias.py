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

SEARCH_URL = 'https://news.google.com/search?q=%22Museu%20do%20Carv%C3%A3o%22&hl=pt-BR&gl=BR&ceid=BR%3Apt-419'
BASE_URL = 'https://news.google.com'

# --- 2. COLETA (WEB SCRAPING DO GOOGLE NOTÍCIAS) ---
print("Buscando notícias no Google News com seletores robustos...")
try:
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    }

    response = requests.get(SEARCH_URL, headers=headers, timeout=15)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, 'html.parser')

    # Encontra todos os artigos na página
    articles = soup.select('article')
    
    if not articles:
        print("Nenhuma notícia recente encontrada no Google News. Nenhuma atualização será feita.")
        exit()

    # Pega apenas o primeiro artigo da lista
    first_result = articles[0]

    # --- INÍCIO DA CORREÇÃO FINAL ---
    # Passo 1: Use um seletor CSS para encontrar o título. A classe 'gPFEn' parece ser a usada atualmente para o link do título.
    title_link_tag = first_result.select_one('a.gPFEn')
    if not title_link_tag:
        raise ValueError("Não foi possível encontrar o link do título com o seletor 'a.gPFEn'. O HTML do Google pode ter mudado.")
    news_title = title_link_tag.get_text()

    # O link da notícia está nesta mesma tag 'a'
    relative_link = title_link_tag['href']
    news_link = urljoin(BASE_URL, relative_link)
    
    # Passo 2: O snippet também pode ser encontrado com um seletor mais robusto
    snippet_tag = first_result.select_one('span.xBbh9')
    snippet = snippet_tag.get_text() if snippet_tag else "" 
    # --- FIM DA CORREÇÃO FINAL ---

    print(f"Notícia encontrada: {news_title}")

    # --- 3. PROCESSAMENTO (IA) ---
    print("Enviando texto para a IA para resumo...")
    prompt_text = f"Título: \"{news_title}\"\nTrecho: \"{snippet}\""

    prompt = f"""
    Com base no título e no trecho a seguir de uma notícia, crie um resumo conciso e chamativo de no máximo duas frases para a homepage de um site.
    
    {prompt_text}
    
    Formate sua resposta EXATAMENTE assim, sem nenhuma palavra extra:
    RESUMO: [Seu resumo aqui]
    """

    response_ia = model.generate_content(prompt)
    resumo = response_ia.text.replace("RESUMO:", "").strip()

    print(f"IA gerou o resumo: {resumo}")

    # --- 4. SALVA OS DADOS ---
    nova_noticia = {
        "titulo": news_title,
        "resumo": resumo,
        "link": news_link,
        "imagem_url": "img/projeto-enchente.jpg"
    }

    with open('noticias.json', 'w', encoding='utf-8') as f:
        json.dump(nova_noticia, f, ensure_ascii=False, indent=4)

    print("Arquivo noticias.json atualizado com sucesso!")

except Exception as e:
    print(f"Ocorreu um erro geral: {e}")