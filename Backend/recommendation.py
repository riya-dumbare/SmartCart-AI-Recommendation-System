import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

def get_recommendations(product_name):
    # Sample product dataset
    data = {
        "product_name": [
            "Laptop",
            "Gaming Laptop",
            "Mouse",
            "Keyboard",
            "Cooling Pad",
            "Laptop Bag",
            "Mobile",
            "Earphones",
            "Power Bank",
            "Phone Cover"
        ],
        "category": [
            "Electronics",
            "Electronics",
            "Accessories",
            "Accessories",
            "Accessories",
            "Accessories",
            "Electronics",
            "Accessories",
            "Accessories",
            "Accessories"
        ]
    }

    df = pd.DataFrame(data)

    # Convert category into numeric values
    df_encoded = pd.get_dummies(df["category"])

    # Calculate similarity
    similarity = cosine_similarity(df_encoded)

    # Find product index
    if product_name not in df["product_name"].values:
        return ["No recommendations found"]

    index = df[df["product_name"] == product_name].index[0]

    # Get similarity scores
    scores = list(enumerate(similarity[index]))

    # Sort highest similarity first
    scores = sorted(scores, key=lambda x: x[1], reverse=True)

    recommended_products = []

    for i in scores[1:5]:
        recommended_products.append(df.iloc[i[0]]["product_name"])

    return recommended_products