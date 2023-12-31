import csv
from fastapi import FastAPI, File, UploadFile
from typing import List

from pydantic import BaseModel

from collections import Counter
from datetime import datetime
from statistics import mean

from simplejustwatchapi.justwatch import search

app = FastAPI()


class MovieData(BaseModel):
    imdb_id: str

    user_rating: int

    date_rated: datetime

    title: str

    genres: List[str]


class Report(BaseModel):
    total_movies_watched: int

    average_rating: float

    most_watched_genre: str

    highest_rated_movies: List[str]


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
                        runtime_mins=runtime_mins
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
                        runtime_mins=runtime_mins
                    )
                )

    total_movies_watched = len(movies_2023)
    total_series_watched = len(series_2023)

    # Perform analysis and generate report for movies and series separately
    movie_report = generate_report(movies_2023)
    series_report = generate_report(series_2023)

    return {
        "movie_report": movie_report,
        "series_report": series_report,
        "total_movies_watched": total_movies_watched,
        "total_series_watched": total_series_watched,
        "total_watch_time_hours": total_watch_time_hours
    }

def generate_report(movies: List[MovieData]) -> Report:
    # Calculate total movies watched

    total_movies_watched = len(movies)

    # Calculate average rating

    average_rating = mean(movie.user_rating for movie in movies)

    # Find the most-watched genre

    genre_counter = Counter(genre for movie in movies for genre in movie.genres)

    most_watched_genre = genre_counter.most_common(1)[0][0] if genre_counter else None

    # Find the highest-rated movie(s)

    highest_rated_movies = [
        movie.title
        for movie in movies
        if movie.user_rating == max(movie.user_rating for movie in movies)
    ]

    # Generate a simple report

    report = Report(
        total_movies_watched=total_movies_watched,
        average_rating=average_rating,
        most_watched_genre=most_watched_genre,
        highest_rated_movies=highest_rated_movies,
    )

    return report
