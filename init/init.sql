CREATE DATABASE IF NOT EXISTS `template_db`;

-- Grant from any host
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'%' IDENTIFIED BY 'strongpassword';

-- Grant specifically for localhost (your host machine)
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'localhost' IDENTIFIED BY 'strongpassword';

FLUSH PRIVILEGES;

ALTER USER 'admin'@'%' IDENTIFIED VIA mysql_native_password USING PASSWORD('strongpassword');
FLUSH PRIVILEGES;

CREATE DATABASE IF NOT EXISTS central_db;
USE central_db;

CREATE TABLE IF NOT EXISTS tenants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    db_name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

GRANT ALL PRIVILEGES ON *.* TO 'admin'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;