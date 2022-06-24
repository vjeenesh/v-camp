# V camp
### A Full Stack web app with a recommender system to view, add, modify, review, rate, locate campgrounds all over the world.
There is zillions of pieces of data around us which can be effectively used to train computers to perform human-like tasks. A vast majority of human understandable data is **textual** in nature. A **Machine learning** model can be trained to build **Recommender systems** which can recommend things based on the similarity between the textual description of things.
V-camp uses a Machine learning model which recommends camps based on the location and textual description of camps and similarity with other campgrounds.

It uses concepts such as **TF-IDF Vectorization, Tokenization, Cosine similarity** to convert textual data into machine readable format and train a machine learning model off of it.

You can view the project here -> [V camp](https://vcamp.herokuapp.com/)
* Click on **View Campgrounds** button
* Click on **view** button for any campground (alternately you can locate campgrounds on the **map**)
* Scroll down to **Similar places to visit..** section

## Data Collection
The data was scraped from a travel website using *BeatifulSoup* and *requests* library. The data attributes include *name of place, textual description, location, rating, and image url*. The data was converted into a *pandas dataframe* was convenient handling of data.

## Recommender System
* The recommender system takes in a campground and filters other campgrounds by same location.
* The filtered campgrounds data is then passed to a *tf-idf vectorizer* to convert textual description to numeric vectors.
* The final step is to use cosine similarity to find campgrounds within same location using the campground descriptions.
* The output is five most similar campgrounds.
