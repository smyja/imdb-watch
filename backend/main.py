import csv
import random
from collections import Counter
from datetime import datetime
from statistics import mean
from typing import List, Optional

import requests
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from simplejustwatchapi.justwatch import search

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
    allow_credentials=True,
    expose_headers=["Content-Disposition"],
)


class MovieData(BaseModel):
    imdb_id: str

    user_rating: int

    date_rated: datetime

    title: str

    genres: List[str]


class ItemWithPoster(BaseModel):
    title: str

    poster_url: str  # Poster URL can be None if not found


class Report(BaseModel):
    total_items_watched: int

    average_rating: float

    most_watched_genre: str

    highest_rated_items: List[ItemWithPoster]


def get_imdb_watchlist(file_path):
    watchlist = []
    with open(file_path, newline="", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            title = row["Title"]
            try:
                year = int(row["Year"])
            except ValueError:
                year = None
            watchlist.append({"title": title, "year": year})
    # Return 3 items
    return watchlist[:3]

@app.get("/proxy-image/")
async def proxy_image(url: str):
    response = requests.get(url, stream=True)
    return StreamingResponse(response.iter_content(2**20), media_type=response.headers['Content-Type'])

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
        search_results = search(item["title"], "US", "en", 5, True)

        if search_results:
            item_data = search_results[0]
            providers = []

            for offer in item_data.offers:
                if offer.monetization_type.lower() == "flatrate":
                    providers.append({"name": offer.name, "url": offer.url})
                elif offer.monetization_type.lower() in ["rent", "buy"]:
                    providers.append(
                        {
                            "name": offer.name,
                            "url": offer.url,
                            "price": offer.price_string,
                        }
                    )

            # Remove duplicates
            providers = [dict(t) for t in {tuple(d.items()) for d in providers}]
            poster_url = f"{item_data.poster}" if item_data.poster else None

            # Add item information to the results list
            results.append(
                {
                    "title": item["title"],
                    "year": item["year"],
                    "providers": providers,
                    "poster_url": poster_url,
                }
            )

    # Return the results as JSON response
    return {"watchlist_providers": results}


@app.post("/upload-csv/")
async def upload_csv(file: UploadFile = File(...)):
    movies_2023 = []
    series_2023 = []
    total_watch_time_hours = 0

    reader = csv.DictReader((line.decode() for line in file.file), delimiter=",")

    for row in reader:
        date_rated = datetime.strptime(row["Date Rated"], "%Y-%m-%d")

        if date_rated.year == 2023:
            genres = row["Genres"].split(", ") if row["Genres"] else []
            runtime_mins = int(row["Runtime (mins)"]) if row["Runtime (mins)"] else 0
            total_watch_time_hours += runtime_mins / 60

            if row["Title Type"] == "movie":
                movies_2023.append(
                    MovieData(
                        imdb_id=row["Const"],
                        user_rating=int(row["Your Rating"]),
                        date_rated=date_rated,
                        title=row["Title"],
                        genres=genres,
                        runtime_mins=runtime_mins,
                    )
                )
            else:
                series_2023.append(
                    MovieData(
                        imdb_id=row["Const"],
                        user_rating=int(row["Your Rating"]),
                        date_rated=date_rated,
                        title=row["Title"],
                        genres=genres,
                        runtime_mins=runtime_mins,
                    )
                )

    total_items_watched = len(movies_2023)
    total_series_watched = len(series_2023)

    # Perform analysis and generate report for movies and series separately
    movie_report = generate_report(movies_2023)
    series_report = generate_report(series_2023)

    response = {
        "movie_report": movie_report.dict(),
        "series_report": series_report.dict(),
        "total_movies_watched": total_items_watched,
        "total_series_watched": total_series_watched,
        "total_watch_time_hours": total_watch_time_hours,
    }

    # Exclude the irrelevant field based on the report type

    response["movie_report"].pop("highest_rated_series", None)

    response["series_report"].pop("highest_rated_movies", None)

    return response


def generate_report(items: List[MovieData], report_type: str = "movies") -> Report:
    # Calculate total items watched

    total_items_watched = len(items)

    # Calculate average rating

    average_rating = mean(item.user_rating for item in items)

    # Find the most-watched genre

    genre_counter = Counter(genre for item in items for genre in item.genres)

    most_watched_genre = genre_counter.most_common(1)[0][0] if genre_counter else None

    highest_rated = sorted(items, key=lambda x: x.user_rating, reverse=True)[:4]

    highest_rated_with_posters = []

    # Shuffle the list of highest-rated items
    random.shuffle(highest_rated)

    # Select the first three items
    selected_items = highest_rated[:2]

    for item in selected_items:
        search_results = search(item.title, "US", "en", 1, True)
        if search_results:
            poster_url = search_results[0].poster
            print(poster_url)
            backdrops = search_results[0].backdrops

            # Add a check for None before creating the instance
            if poster_url is not None:
                highest_rated_with_posters.append(ItemWithPoster(title=item.title, poster_url=poster_url, backdrops=backdrops))
            else:
                # Handle the case where poster_url is None
                print(f"Skipping {item.title} due to missing poster_url")

    # Now, proceed with the rest of your code


    # Generate a simple report

    report = Report(
        total_items_watched=total_items_watched,
        average_rating=average_rating,
        most_watched_genre=most_watched_genre,
        highest_rated_items=highest_rated_with_posters,
    )

    return report
