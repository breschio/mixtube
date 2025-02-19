
import sys
import json
import requests
from bs4 import BeautifulSoup

def scrape_youtube(url):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        title = soup.find('meta', property='og:title')
        description = soup.find('meta', property='og:description')
        
        result = {
            'title': title['content'] if title else None,
            'description': description['content'] if description else None,
            'recommendations': []
        }
        
        return json.dumps(result)
    except Exception as e:
        return json.dumps({'error': str(e)})

if __name__ == '__main__':
    if len(sys.argv) > 1:
        url = sys.argv[1]
        print(scrape_youtube(url))
