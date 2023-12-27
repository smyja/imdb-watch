import csv
import json
import time
from simplejustwatchapi.justwatch import search
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

    csv_file_path = 'ratings.csv'

    watchlist = get_imdb_watchlist(csv_file_path)

    print(f"Movies and TV shows on your IMDb watchlist (User ID: {imdb_user_id}):")

    results = []


    for item in watchlist:

        search_results = search(item['title'], "US", "en", 5, True)

        if search_results:

            item_data = search_results[0]

            providers = []

            for offer in item_data.offers:

                if offer.monetization_type.lower() == 'flatrate':

                    provider_name = service_codes.get(offer.technical_name, 'Unknown')

                    providers.append({'name': provider_name, 'url': offer.url})

                elif offer.monetization_type.lower() in ['rent', 'buy']:

                    provider_name = service_codes.get(offer.technical_name, 'Unknown')

                    providers.append({'name': provider_name, 'url': offer.url, 'price': offer.price_string})


            # Remove duplicates

            providers = [dict(t) for t in {tuple(d.items()) for d in providers}]

            poster_url = f"https://images.justwatch.com{item_data.poster}" if item_data.poster else None


            # Add item information to the results list

            results.append({

                'title': item['title'],

                'year': item['year'],

                'providers': providers,

                'poster_url': poster_url

            })


    # Export the results as a JSON file

    with open('watchlist_providers.json', 'w', encoding='utf-8') as json_file:

        json.dump(results, json_file, ensure_ascii=False, indent=4)


if __name__ == "__main__":

    main()
