from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_mysqldb import MySQL
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from recommendation import get_recommendations

app = Flask(__name__)

app.secret_key = "smartcart_secret_key"

# MySQL Configuration
app.config["MYSQL_HOST"] = "localhost"
app.config["MYSQL_USER"] = "root"
app.config["MYSQL_PASSWORD"] = "riya"
app.config["MYSQL_DB"] = "smartcart"

mysql = MySQL(app)

@app.route("/")
def home():
    return "SmartCart Backend Running Successfully!"

@app.route("/test_db")
def test_db():
    cur = mysql.connection.cursor()
    cur.execute("SELECT 1")
    cur.close()
    return "MySQL Connected Successfully!"

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        name = request.form["name"]
        email = request.form["email"]
        password = request.form["password"]

        cur = mysql.connection.cursor()

        # Insert user into database
        cur.execute(
            "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
            (name, email, password)
        )

        mysql.connection.commit()
        cur.close()

        return "Registration Successful!"

    return '''
        <h2>User Registration</h2>
        <form method="POST">
            Name: <input type="text" name="name"><br><br>
            Email: <input type="email" name="email"><br><br>
            Password: <input type="password" name="password"><br><br>
            <button type="submit">Register</button>
        </form>
    '''

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]

        cur = mysql.connection.cursor()

        # Step 1: Check if email exists
        cur.execute("SELECT * FROM users WHERE email=%s", (email,))
        user = cur.fetchone()

        if not user:
            cur.close()
            return "User not registered! Please register first."

        # Step 2: Check password
        if user[3] != password:
            cur.close()
            return "Incorrect password!"

        # Step 3: Login success
        session["user_id"] = user[0]
        session["user_name"] = user[1]

        cur.close()
        return f"Welcome {user[1]}! Login Successful"

    return '''
        <h2>User Login</h2>
        <form method="POST">
            Email: <input type="email" name="email"><br><br>
            Password: <input type="password" name="password"><br><br>
            <button type="submit">Login</button>
        </form>
    '''

@app.route("/logout")
def logout():
    session.clear()
    return "Logged Out Successfully!"

@app.route("/add_product", methods=["GET", "POST"])
def add_product():
    if request.method == "POST":
        product_name = request.form["product_name"]
        category = request.form["category"]
        price = request.form["price"]
        description = request.form["description"]
        stock = request.form["stock"]

        cur = mysql.connection.cursor()

        cur.execute("""
            INSERT INTO products
            (product_name, category, price, description, stock)
            VALUES (%s, %s, %s, %s, %s)
        """, (product_name, category, price, description, stock))

        mysql.connection.commit()
        cur.close()

        return "Product Added Successfully!"

    return '''
        <h2>Add Product</h2>
        <form method="POST">
            Product Name: <input type="text" name="product_name"><br><br>
            Category: <input type="text" name="category"><br><br>
            Price: <input type="number" name="price"><br><br>
            Description: <input type="text" name="description"><br><br>
            Stock: <input type="number" name="stock"><br><br>
            <button type="submit">Add Product</button>
        </form>
    '''

@app.route("/view_products")
def view_products():
    cur = mysql.connection.cursor()

    cur.execute("SELECT * FROM products")
    products = cur.fetchall()

    cur.close()

    output = "<h2>All Products</h2><br>"

    for product in products:
        output += f"""
            ID: {product[0]} <br>
            Name: {product[1]} <br>
            Category: {product[2]} <br>
            Price: ₹{product[3]} <br>
            Description: {product[4]} <br>
            Stock: {product[5]} <br>
            <hr>
        """

    return output

@app.route("/api/products")
def get_products():
    cur = mysql.connection.cursor()

    cur.execute("SELECT * FROM products")
    products = cur.fetchall()

    cur.close()

    product_list = []

    for product in products:
        product_list.append({
            "product_id": product[0],
            "product_name": product[1],
            "category": product[2],
            "price": float(product[3]),
            "description": product[4],
            "stock": product[5]
        })

    return jsonify(product_list)

@app.route("/add_to_cart/<int:product_id>")
def add_to_cart(product_id):
    if "user_id" not in session:
        return "Please login first!"

    user_id = session["user_id"]

    cur = mysql.connection.cursor()

    # Check if product already exists in cart
    cur.execute("""
        SELECT * FROM cart
        WHERE user_id=%s AND product_id=%s
    """, (user_id, product_id))

    existing = cur.fetchone()

    if existing:
        cur.execute("""
            UPDATE cart
            SET quantity = quantity + 1
            WHERE user_id=%s AND product_id=%s
        """, (user_id, product_id))
    else:
        cur.execute("""
            INSERT INTO cart (user_id, product_id, quantity)
            VALUES (%s, %s, %s)
        """, (user_id, product_id, 1))

    mysql.connection.commit()
    cur.close()

    return "Product Added to Cart Successfully!"

@app.route("/view_cart")
def view_cart():
    if "user_id" not in session:
        return "Please login first!"

    user_id = session["user_id"]

    cur = mysql.connection.cursor()

    cur.execute("""
        SELECT products.product_name, products.price, cart.quantity
        FROM cart
        JOIN products
        ON cart.product_id = products.product_id
        WHERE cart.user_id=%s
    """, (user_id,))

    cart_items = cur.fetchall()
    cur.close()

    output = "<h2>Your Cart</h2><br>"

    total = 0

    for item in cart_items:
        subtotal = item[1] * item[2]
        total += subtotal

        output += f"""
            Product: {item[0]} <br>
            Price: ₹{item[1]} <br>
            Quantity: {item[2]} <br>
            Subtotal: ₹{subtotal} <br>
            <hr>
        """

    output += f"<h3>Total Amount: ₹{total}</h3>"

    return output

@app.route("/place_order")
def place_order():
    if "user_id" not in session:
        return "Please login first!"

    user_id = session["user_id"]

    cur = mysql.connection.cursor()

    # Get all cart items
    cur.execute("""
        SELECT product_id, quantity
        FROM cart
        WHERE user_id=%s
    """, (user_id,))

    cart_items = cur.fetchall()

    if not cart_items:
        cur.close()
        return "Cart is Empty!"

    # Move cart items to orders table
    for item in cart_items:
        cur.execute("""
            INSERT INTO orders (user_id, product_id, quantity)
            VALUES (%s, %s, %s)
        """, (user_id, item[0], item[1]))

    # Clear cart after order
    cur.execute("""
        DELETE FROM cart
        WHERE user_id=%s
    """, (user_id,))

    mysql.connection.commit()
    cur.close()

    return "Order Placed Successfully!"

@app.route("/recommend/<product_name>")
def recommend(product_name):
    recommended_products = get_recommendations(product_name)

    output = f"<h2>Recommendations for {product_name}</h2><br>"

    for product in recommended_products:
        output += f"{product}<br>"

    return output

@app.route("/admin")
def admin():
    return '''
        <h2>Admin Panel</h2>
        <a href="/add_product">Add Product</a><br><br>
        <a href="/view_products">View Products</a><br><br>
        <a href="/view_orders">View Orders</a><br><br>
        <a href="/sales_report">Sales Report</a>
    '''

@app.route("/view_orders")
def view_orders():
    cur = mysql.connection.cursor()

    cur.execute("""
        SELECT orders.order_id,
               users.name,
               products.product_name,
               orders.quantity,
               orders.order_date
        FROM orders
        JOIN users ON orders.user_id = users.user_id
        JOIN products ON orders.product_id = products.product_id
    """)

    orders = cur.fetchall()
    cur.close()

    output = "<h2>All Orders</h2><br>"

    for order in orders:
        output += f"""
            Order ID: {order[0]} <br>
            Customer: {order[1]} <br>
            Product: {order[2]} <br>
            Quantity: {order[3]} <br>
            Date: {order[4]} <br>
            <hr>
        """

    return output

@app.route("/sales_report")
def sales_report():
    cur = mysql.connection.cursor()

    cur.execute("""
        SELECT products.product_name,
               SUM(orders.quantity) as total_sold
        FROM orders
        JOIN products
        ON orders.product_id = products.product_id
        GROUP BY products.product_name
    """)

    report = cur.fetchall()
    cur.close()

    output = "<h2>Sales Report</h2><br>"

    for row in report:
        output += f"""
            Product: {row[0]} <br>
            Total Sold: {row[1]} <br>
            <hr>
        """

    return output



if __name__ == "__main__":
    app.run(debug=True)

