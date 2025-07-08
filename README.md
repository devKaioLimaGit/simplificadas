# Documentação de Comandos SQL

Este documento descreve três comandos SQL utilizados para gerenciar e consultar dados na tabela `User`, relacionados à validação de usuários e associação com administradores avaliadores.

## 1. Aprovar um Único Usuário

**Comando SQL:**
```sql
UPDATE User 
SET 
    available = NULL, 
    notice = NULL, 
    adminId = 2, 
    isValid = True, 
    description = ''
WHERE protocol = '0000000000000';
```
## 2. Resetar os Campos de Validação de Todos os Usuários

**Comando SQL:**
```sql

UPDATE User
SET 
    available = NULL, 
    notice = NULL, 
    adminId = NULL, 
    isValid = NULL, 
    description = '';
```

## 3. Listar Usuários Aprovados com Avaliadores, Sem Notas Registradas

**Comando SQL:**
```sql
SELECT 
    U.protocol AS "N° Inscrição", 
    U.name AS "Candidatos", 
    A.name AS "Avaliador",
    U.isValid AS "Aprovados", 
    U.notice AS "Notas"
FROM User U
LEFT JOIN Admin A ON U.adminId = A.id
WHERE U.isValid = 1 
  AND U.notice = '0'
ORDER BY U.name ASC;
  ```

## 4. Listar Usuários Avaliados pelo determinado Avaliador

**Comando SQL:**
```sql
SELECT 
    U.protocol AS "N° Inscrição", 
    U.name AS "Candidatos", 
    A.name AS "Avaliador",
    U.isValid AS "Aprovados", 
    U.notice AS "Notas"
FROM User U
LEFT JOIN Admin A ON U.adminId = A.id
WHERE A.name = 'JOANNE ALVES RODRIGUES DE LIMA'
ORDER BY U.name ASC;
```

## 5. Listar Todos os Usuários que não foram Avaliados

**Comando SQL:**
```sql
SELECT 
    protocol AS "N° Inscrição", 
    name AS "Candidatos", 
    available AS "Disponibilidade"
FROM User
WHERE available IS NULL
ORDER BY name ASC;
```





