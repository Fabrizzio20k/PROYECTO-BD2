# Proyecto de Base de Datos 2 - Recuperación de Texto utilizando SPIMI INDEX

## Introducción
### Objetivo del Proyecto
El objetivo de este proyecto es implementar un sistema de recuperación de información utilizando un índice invertido basado en el modelo de recuperación por ranking para consultas de texto libre. Esto permite buscar y recuperar documentos relevantes a partir de una consulta en lenguaje natural, optimizando la búsqueda mediante la similitud de coseno y el cálculo de pesos TF-IDF.

### Descripción del Dominio de Datos y la Importancia de Aplicar Indexación
El dataset utilizado proviene de Kaggle y contiene datos sobre canciones de Spotify, incluyendo letras, nombres de pistas, artistas y álbumes. Este contiene 18454 registros. Aplicar técnicas de indexación a estos datos es crucial para mejorar la eficiencia y precisión en la recuperación de información, especialmente cuando se trabaja con grandes volúmenes de datos textuales.

## Backend: Índice Invertido

### Construcción del Índice Invertido en Memoria Secundaria
La construcción del índice invertido se realiza en bloques utilizando el algoritmo SPIMI (Single-pass in-memory indexing). El proceso se detalla a continuación:

1. **Tokenización y Preprocesamiento**: Se tokenizan las letras de las canciones, eliminando stopwords y aplicando stemming.
2. **Creación de Bloques**: Los documentos se procesan en bloques manejables y se construye un diccionario temporal para cada bloque.
3. **Guardado de Bloques**: Cada bloque se guarda en la memoria secundaria como un archivo temporal.
4. **Fusión de Bloques**: Los bloques temporales se fusionan para crear el índice invertido final.

### Ejecución Óptima de Consultas Aplicando Similitud de Coseno
La similitud de coseno se utiliza para medir la relevancia de los documentos con respecto a una consulta. Esto se realiza mediante los siguientes pasos:

1. **Preprocesamiento de la Consulta**: La consulta se tokeniza, se eliminan stopwords y se aplica stemming.
2. **Cálculo de Pesos TF-IDF**: Se calculan los pesos TF-IDF para los términos de la consulta y los documentos.
3. **Cálculo de Similitud de Coseno**: Se calcula la similitud de coseno entre la consulta y cada documento utilizando los pesos TF-IDF normalizados.
4. **Recuperación de Documentos**: Se retornan los documentos con mayor similitud a la consulta, ordenados por relevancia.

### Índice Invertido en PostgreSQL/MongoDB
#### PostgreSQL
- "COMPLETAR AQUI"

## Frontend

### Diseño de la GUI
La interfaz gráfica de usuario (GUI) permite interactuar con el índice invertido a través de las siguientes funcionalidades:

- **Campo de Consulta**: Permite al usuario ingresar una consulta en lenguaje natural.
- **Selección de Top-K**: El usuario puede especificar la cantidad de documentos a recuperar.
- **Presentación de Resultados**: Los resultados se muestran de manera amigable, incluyendo el tiempo de respuesta de la consulta.

### Mini-manual de Usuario
1. **Ingresar la Consulta**: Escriba la consulta en el campo de texto.
2. **Especificar Top-K**: Seleccione la cantidad de documentos a recuperar.
3. **Seleccion atributos extra**: Seleccione los atributos extra que desea mostrar en los resultados.
4. **Ver Resultados**: Los resultados aparecerán en la pantalla, mostrando la información relevante de las canciones junto con la similitud de coseno y el tiempo de consulta.

### Screenshots de la GUI
(Screenshots deben ser añadidos aquí una vez disponibles)

### Análisis Comparativo Visual con Otras Implementaciones
Comparación visual del rendimiento y precisión entre la implementación propia y las realizadas con PostgreSQL y MongoDB.

## Experimentación

### Tablas y Gráficos de los Resultados Experimentales
Se realizaron pruebas con diferentes tamaños de dataset (N = 1000, 2000, 4000, 8000, 16000, 32000, 64000). A continuación se presentan las tablas y gráficos con los resultados obtenidos.

| N     | SPIMI INDEX Time (s) | PostgreSQL Time (s) |
|-------|-------------------|---------------------|
| 1000  | 0               | 0                 |
| 2000  | 0               | 0                |
| 4000  | 0             | 0                 |
| 8000  | 0              | 0                |
| 16000 | 0               | 0                 |
| 25000 | 0               | 0                |

### Análisis y Discusión
(COMPLETAR AQUI)

## Ejecución del Proyecto

### Backend
Para ejecutar el servidor backend, debe crear un entorno virtual e instalar las dependencias desde el archivo `requirements.txt`. Luego, ejecute el servidor con el siguiente comando:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
fastapi dev api.py
```

### Frontend
Para ejecutar el servidor frontend, debe instalar los módulos de Node.js y luego ejecutar el servidor con el siguiente comando:

```bash
cd frontend
npm install
npm run dev
```