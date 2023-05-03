import csv
import json
import time
from justwatch import JustWatch
from service_codes import service_codes

def get_imdb_watchlist(file_path):
    watchlist = []
    with open(file_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            title = row['Title']
            try:
                year = int(row['Year'])
            except ValueError:
                year = None
            watchlist.append({'title': title, 'year': year})
    #return 3 items
    return watchlist[:3]


def main():
    imdb_user_id = "ur68581805"
    csv_file_path = 'a.csv'
    watchlist = get_imdb_watchlist(csv_file_path)
    print(f"Movies and TV shows on your IMDb watchlist (User ID: {imdb_user_id}):")
    justwatch = JustWatch(country='US')
    results = []

    paid_services = list(service_codes.keys())
    
    for item in watchlist:
        # Search for the item by title
        search_results = justwatch.search_for_item(query=item['title'], content_types=['movie', 'show'])
        time.sleep(1)
        if search_results['total_results'] > 0:
            item_data = search_results['items'][0]
            item_id = item_data['id']
            content_type = item_data['object_type']
            
            try:
                item_providers_data = justwatch.get_title(title_id=item_id, content_type=content_type)
                time.sleep(1)
            except Exception as e:
                print(f"Error getting providers for {item['title']} ({item['year']}): {str(e)}")
                continue
            
        providers = []
        if 'offers' in item_providers_data:
            for offer in item_providers_data['offers']:
                if offer['monetization_type'] == 'flatrate':
                    if offer['package_short_name'] in paid_services:
                        provider_name = service_codes[offer['package_short_name']]
                        provider_url = offer['urls'].get('standard_web')
                        if provider_url:
                            providers.append({'name': provider_name, 'url': provider_url})
                elif offer['monetization_type'] in ['rent', 'buy']:
                    provider_name = service_codes.get(offer['package_short_name'], 'Unknown')
                    provider_url = offer['urls'].get('standard_web')
                    if provider_url:
                        providers.append({'name': provider_name, 'url': provider_url})
                    
        providers = [dict(t) for t in {tuple(d.items()) for d in providers}] # remove duplicates
        poster_url = item_data.get('poster')
        if poster_url:
            poster_url = f"https://images.justwatch.com{poster_url}"
        
        # Add item information to the results list
        results.append({'title': item['title'], 'year': item['year'], 'providers': providers, 'poster_url': poster_url})
                
        # Export the results as a JSON file
        with open('watchlist_providers.json', 'w', encoding='utf-8') as json_file:
            json.dump(results, json_file, ensure_ascii=False, indent=4)


if __name__ == "__main__":
    main()
