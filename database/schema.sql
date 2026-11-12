-- Base de datos de desarrollo. Ampliar según los requisitos de cada módulo.
CREATE DATABASE IF NOT EXISTS healkit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE healkit;

CREATE TABLE IF NOT EXISTS productos (
 id INT AUTO_INCREMENT PRIMARY KEY,
 codigo VARCHAR(30) NOT NULL UNIQUE,
 nombre VARCHAR(180) NOT NULL,
 categoria VARCHAR(100),
 presentacion VARCHAR(100),
 stock INT NOT NULL DEFAULT 0,
 stock_minimo INT NOT NULL DEFAULT 10,
 vencimiento DATE NULL
);

CREATE TABLE IF NOT EXISTS clientes (
 id INT AUTO_INCREMENT PRIMARY KEY,
 nombre VARCHAR(160) NOT NULL,
 identificacion VARCHAR(30) UNIQUE,
 telefono VARCHAR(30),
 correo VARCHAR(180)
);

CREATE TABLE IF NOT EXISTS proveedores (
 id INT AUTO_INCREMENT PRIMARY KEY,
 nombre VARCHAR(160) NOT NULL,
 contacto VARCHAR(120),
 telefono VARCHAR(30)
);

-- Pendiente: entidades de ventas, órdenes, contabilidad y RRHH.
-- No utilizar datos de clientes reales hasta definir privacidad y seguridad.
