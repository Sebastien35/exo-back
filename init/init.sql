CREATE DATABASE IF NOT EXISTS `template_db`;

-- Grant from any host
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'%' IDENTIFIED BY 'strongpassword';

-- Grant specifically for localhost (your host machine)
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'localhost' IDENTIFIED BY 'strongpassword';

FLUSH PRIVILEGES;
