import csv
from fastapi import FastAPI, File, UploadFile

from simplejustwatchapi.justwatch import search
from service_codes import service_codes

app = FastAPI()

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
    # Return 3 items
    return watchlist[:3]

@app.post("/watchlist_providers")
async def get_watchlist_providers(file: UploadFile = File(...)):
    # Save the uploaded CSV file temporarily
    with open("temp.csv", "wb") as f:
        f.write(file.file.read())

    # Get watchlist from the uploaded CSV
    csv_file_path = "temp.csv"
    watchlist = get_imdb_watchlist(csv_file_path)
    results = []

    for item in watchlist:
        search_results = search(item['title'], "US", "en", 5, True)

        if search_results:
            item_data = search_results[0]
            providers = []

            for offer in item_data.offers:
                if offer.monetization_type.lower() == 'flatrate':
                    provider_name = service_codes.get(offer.name, 'Unknown')
                    providers.append({'name': offer.name, 'url': offer.url})
                elif offer.monetization_type.lower() in ['rent', 'buy']:
                    provider_name = service_codes.get(offer.name, 'Unknown')
                    providers.append({'name': offer.name, 'url': offer.url, 'price': offer.price_string})

            # Remove duplicates
            providers = [dict(t) for t in {tuple(d.items()) for d in providers}]
            poster_url = f"{item_data.poster}" if item_data.poster else None

            # Add item information to the results list
            results.append({
                'title': item['title'],
                'year': item['year'],
                'providers': providers,
                'poster_url': poster_url
            })

    # Return the results as JSON response
    return {"watchlist_providers": results}
