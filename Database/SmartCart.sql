CREATE DATABASE smartcart;
USE smartcart;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(100)
);

CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(150),
    category VARCHAR(100),
    price DECIMAL(10,2),
    description VARCHAR(255),
    stock INT
);

CREATE TABLE cart (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    product_id INT,
    quantity INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    product_id INT,
    quantity INT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE browsing_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    product_id INT,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE product_log (
    product_id INT,
    action VARCHAR(50)
);

DELIMITER $$

CREATE TRIGGER after_insert_product
AFTER INSERT ON products
FOR EACH ROW
BEGIN
    INSERT INTO product_log(product_id, action)
    VALUES (NEW.product_id, 'Product Added');
END $$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE show_all_products()
BEGIN
    SELECT * FROM products;
END $$

DELIMITER ;

CALL show_all_products();