-- =========================================================================
-- SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS: BD_JBA
-- Generado para el sistema de control de acceso ApiJBA.
-- Diseñado con enfoque en alto rendimiento y optimización.
-- =========================================================================

-- Opcional: Crear la base de datos si no existe
-- CREATE DATABASE [BD_JBA];
-- GO
-- USE [BD_JBA];
-- GO

IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [personal] (
    [ci_p] varchar(16) NOT NULL,
    [nombre_p] varchar(50) NOT NULL,
    [contrasena] varchar(255) NOT NULL,
    [nivel] int NOT NULL,
    [estado] bit NOT NULL,
    [cargo] varchar(25) NOT NULL,
    [fecha_registro] datetime NOT NULL,
    [fecha_salida] datetime NULL,
    [direccion_p] varchar(50) NOT NULL,
    [correo_p] varchar(25) NULL,
    [foto_p] varchar(255) NULL,
    [fecha_voucher] datetime NULL,
    [tipo_preparacion] varchar(255) NULL,
    CONSTRAINT [PK_personal] PRIMARY KEY ([ci_p])
);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260520032153_InitialMigration', N'8.0.10');
GO

COMMIT;
GO
