# Proyecto de Base de Datos 2 - Recuperación de Texto utilizando SPIMI INDEX

## Índice

- [Proyecto de Base de Datos 2 - Recuperación de Texto utilizando SPIMI INDEX](#proyecto-de-base-de-datos-2---recuperación-de-texto-utilizando-spimi-index)
  - [Introducción](#introducción)
    - [Objetivo del Proyecto](#objetivo-del-proyecto)
    - [Descripción del Dominio de Datos y la Importancia de Aplicar Indexación](#descripción-del-dominio-de-datos-y-la-importancia-de-aplicar-indexación)
  - [Backend: Índice Invertido](#backend-índice-invertido)
    - [Construcción del Índice Invertido en Memoria Secundaria](#construcción-del-índice-invertido-en-memoria-secundaria)
    - [Ejecución Óptima de Consultas Aplicando Similitud de Coseno](#ejecución-óptima-de-consultas-aplicando-similitud-de-coseno)
  - [Índice Invertido en PostgreSQL](#índice-invertido-en-postgresql)
    - [Creación de la Tabla](#creación-de-la-tabla)
    - [Carga de Datos](#carga-de-datos)
    - [Creación de Columnas para Vectores de Texto Ponderados](#creación-de-columnas-para-vectores-de-texto-ponderados)
    - [Actualización de Columnas con Valores Ponderados](#actualización-de-columnas-con-valores-ponderados)
    - [Creación del Índice GIN](#creación-del-índice-gin)
    - [Consultas de Búsqueda de Texto Completo](#consultas-de-búsqueda-de-texto-completo)
  - [Ejecución de Consultas en PostgreSQL](#ejecución-de-consultas-en-postgresql)
  - [Frontend](#frontend)
    - [Diseño de la GUI](#diseño-de-la-gui)
      - [Al crear el índice invertido](#al-crear-el-índice-invertido)
      - [Después de crear el índice invertido](#después-de-crear-el-índice-invertido)
    - [Mini-manual de Usuario](#mini-manual-de-usuario)
      - [Al crear el índice invertido](#al-crear-el-índice-invertido-1)
      - [Al realizar una consulta](#al-realizar-una-consulta)
    - [Screenshots de la GUI](#screenshots-de-la-gui)
      - [Creación del Índice Invertido](#creación-del-índice-invertido)
      - [Consulta de Texto Libre](#consulta-de-texto-libre)
    - [Análisis Comparativo Visual con Otras Implementaciones](#análisis-comparativo-visual-con-otras-implementaciones)
  - [Experimentación](#experimentación)
    - [Tablas y Gráficos de los Resultados Experimentales](#tablas-y-gráficos-de-los-resultados-experimentales)
      - [Tiempo de Creación del Índice Invertido](#tiempo-de-creación-del-índice-invertido)
      - [Tiempo de Ejecución de Consultas (Top-K = 10)](#tiempo-de-ejecución-de-consultas-top-k--10)
    - [Análisis y Discusión](#análisis-y-discusión)
  - [Ejecución del Proyecto](#ejecución-del-proyecto)
    - [Backend](#backend)
    - [Frontend](#frontend)
  - [Autores](#autores)
  - [Referencias](#referencias)


## Introducción
### Objetivo del Proyecto
El objetivo de este proyecto es implementar un sistema de recuperación de información utilizando un índice invertido basado en el modelo de recuperación por ranking para consultas de texto libre. Esto permite buscar y recuperar documentos relevantes a partir de una consulta en lenguaje natural, optimizando la búsqueda mediante la similitud de coseno y el cálculo de pesos TF-IDF.

### Descripción del Dominio de Datos y la Importancia de Aplicar Indexación
El dataset utilizado proviene de Kaggle y contiene datos sobre canciones de Spotify, incluyendo letras, nombres de pistas, artistas y álbumes. Este contiene 18454 registros. Aplicar técnicas de indexación a estos datos es crucial para mejorar la eficiencia y precisión en la recuperación de información, especialmente cuando se trabaja con grandes volúmenes de datos textuales.

## Backend: Índice Invertido

### Construcción del Índice Invertido en Memoria Secundaria

En base al algoritmo original propuesto por Manning, Raghavan y Schütze (2008), se implementó un índice invertido en memoria secundaria utilizando el algoritmo SPIMI (Single-Pass In-Memory Indexing). Este algoritmo divide el proceso de construcción del índice en dos fases principales: la fase de construcción de bloques y la fase de fusión de bloques.

1. **Inicialización**:
   - Se carga el dataset que contiene las letras de las canciones y los metadatos de las mismas.
   - Se define el tamaño de los bloques, el directorio temporal para almacenar los índices parciales y el archivo final donde se guardará el índice invertido completo.

2. **Preprocesamiento del Texto**:
   - **Tokenización**: Se divide el texto en palabras individuales (tokens).
   - **Eliminación de Stopwords**: Se eliminan las palabras comunes que no aportan significado significativo, tanto en español como en inglés. Tambien se eliminan los signos de puntuación.
   - **Stemming**: Se reduce cada palabra a su raíz, dependiendo del idioma detectado (español o inglés).

3. **Procesamiento en Bloques**:
   - Los documentos se procesan en bloques de un tamaño predefinido.
   - Para cada bloque, se crea un diccionario temporal donde cada término (palabra) se asocia con una lista de documentos en los que aparece junto con su frecuencia de aparición.

4. **Cálculo de Normas de Documentos**:
   - Para cada documento, se calcula la norma (longitud) del documento sumando los cuadrados de las frecuencias de los términos y tomando la raíz cuadrada del resultado.

5. **Almacenamiento Temporal**:
   - Cada bloque procesado se guarda como un archivo temporal en el directorio designado.
   - Los archivos temporales contienen el diccionario de términos y las normas de los documentos correspondientes al bloque.

6. **Fusión de Bloques**:
   - Los archivos temporales se cargan y se fusionan en un solo índice invertido.
   - Se utiliza una estructura de datos de tipo heap para ordenar y combinar las listas de postings de cada término de los diferentes bloques.
   - Las normas de los documentos también se combinan y se recalculan si es necesario.

7. **Índice Final**:
   - El índice invertido final, que contiene los términos, las listas de documentos asociados y las normas de los documentos, se guarda en un archivo en la memoria secundaria.

![Índice Invertido en Memoria Secundaria](assets/algorithm.png)

### Ejecución Óptima de Consultas Aplicando Similitud de Coseno

1. **Preprocesamiento de la Consulta**:
   - La consulta ingresada por el usuario se tokeniza, se eliminan las stopwords y se aplica stemming, siguiendo el mismo proceso que para los documentos.

2. **Cálculo de Pesos TF-IDF para la Consulta**:
   - Se calcula el peso TF-IDF para cada término de la consulta. TF (Term Frequency) es la frecuencia del término en la consulta, e IDF (Inverse Document Frequency) se calcula en función de la cantidad de documentos en los que aparece el término.

3. **Normalización del Vector de la Consulta**:
   - Se calcula la norma del vector de la consulta para normalizar los pesos TF-IDF.

4. **Cálculo de Similitud de Coseno**:
   - Para cada término en la consulta, se busca en el índice invertido los documentos que contienen el término.
   - Se calcula la similitud de coseno entre la consulta y cada documento relevante. Esto se hace multiplicando los pesos TF-IDF del término en la consulta y en el documento, y dividiendo por el producto de las normas de los vectores del documento y la consulta.

5. **Ranking de Documentos**:
   - Los documentos se ordenan en función de la similitud de coseno calculada, de mayor a menor.
   - Se seleccionan los documentos con la mayor similitud para formar el Top-K resultados.

6. **Presentación de Resultados**:
   - Los documentos más relevantes se presentan al usuario, incluyendo información como el nombre de la pista, el artista y la similitud de coseno.
   - Se muestra el tiempo total que tomó procesar la consulta.

Este proceso garantiza que las consultas se ejecuten de manera eficiente y que los documentos más relevantes se recuperen y presenten rápidamente al usuario.

### Índice Invertido en PostgreSQL

PostgreSQL es una base de datos relacional que soporta capacidades avanzadas de búsqueda de texto completo mediante el uso de índices GIN (Generalized Inverted Index). A continuación se describe cómo se implementa un índice invertido en PostgreSQL y cómo se realiza la búsqueda de texto completo utilizando este índice:

1. **Creación de la Tabla**:
   - Se crea una tabla `songs` que almacena las canciones con sus respectivos metadatos y letras.
   - Se definen las columnas necesarias para almacenar los datos.

   ```sql
   DROP TABLE IF EXISTS songs;
   CREATE TABLE songs (
       track_id TEXT PRIMARY KEY,
       track_name TEXT,
       track_artist TEXT NULL,
       track_album_name TEXT,
       lyrics TEXT
   );
   ```

2. **Carga de Datos**:
   - Se cargan los datos del archivo CSV a la tabla `songs`.

   ```sql
   COPY Public."songs" FROM 'PROYECTO-BD2/backend/csv/spotify_songs.csv' DELIMITER ',' CSV HEADER;
   ```

3. **Creación de Columnas para Vectores de Texto Ponderados**:
   - Se añaden nuevas columnas `weighted_tsv` y `weighted_tsv2` a la tabla `songs` para almacenar los vectores de texto ponderados.

   ```sql
   ALTER TABLE songs ADD COLUMN weighted_tsv tsvector;
   ALTER TABLE songs ADD COLUMN weighted_tsv2 tsvector;
   ```

4. **Actualización de Columnas con Valores Ponderados**:
   - Se actualizan las columnas `weighted_tsv` y `weighted_tsv2` con valores ponderados usando las funciones `setweight` y `to_tsvector`. Estas funciones asignan pesos a diferentes partes del texto (por ejemplo, mayor peso a los nombres de las pistas y menor peso a las letras).

   ```sql
   UPDATE songs SET
   weighted_tsv = x.weighted_tsv,
   weighted_tsv2 = x.weighted_tsv
   FROM (
       SELECT track_id,
       setweight(to_tsvector('english', COALESCE(track_name,'')), 'A') ||
       setweight(to_tsvector('english', COALESCE(lyrics,'')), 'B')
       AS weighted_tsv
       FROM songs
   ) AS x
   WHERE x.track_id = songs.track_id;
   ```

5. **Creación del Índice GIN**:
   - Se crea un índice GIN en la columna `weighted_tsv2` para optimizar las consultas de búsqueda de texto completo.

   ```sql
   CREATE INDEX weighted_tsv_idx1e3 ON songs USING GIN (weighted_tsv2);
   ```

6. **Consultas de Búsqueda de Texto Completo**:
   - Se realizan consultas de búsqueda de texto completo utilizando el operador `@@` y la función `ts_rank_cd` para calcular la relevancia de los documentos.
   - La consulta se ejecuta primero sin el índice para comparar el rendimiento, y luego con el índice para optimizar la búsqueda.

   ```sql
   -- Sin índice:
   vacuum analyze;
   EXPLAIN ANALYZE
   SELECT track_id, track_name, ts_rank_cd(weighted_tsv, query) AS rank
   FROM songs, to_tsquery('english', 'imagination') query
   WHERE query @@ weighted_tsv
   ORDER BY rank DESC
   LIMIT 10;

   -- Con índice:
   ANALYZE songs;
   SET enable_seqscan = OFF;
   EXPLAIN ANALYZE
   SELECT track_id, track_name, ts_rank_cd(weighted_tsv2, query) AS rank
   FROM songs, to_tsquery('english', 'imagination') query
   WHERE query @@ weighted_tsv2
   ORDER BY rank DESC
   LIMIT 10;
   ```

### Ejecución de Consultas en PostgreSQL
En PostgreSQL, la búsqueda de texto completo se realiza utilizando el tipo de datos `tsvector` para almacenar documentos y el tipo de datos `tsquery` para consultas. El índice GIN optimiza estas consultas permitiendo una búsqueda rápida y eficiente. La función `ts_rank_cd` calcula una puntuación de relevancia basada en la posición y frecuencia de los términos de la consulta en los documentos. 

## Frontend

### Diseño de la GUI
La interfaz gráfica de usuario (GUI) permite interactuar con el índice invertido mediante su creación, consulta y presentación de resultados. La GUI se desarrolló utilizando el framework de React.js y se comunica con el servidor backend a través de una API REST.

#### Al crear el indice invertido

- **Carga de Datos**: Permite al usuario cargar un archivo CSV que contiene los datos de las canciones.
- **Selección del número de bloques**: El usuario puede especificar la cantidad de bloques en los que se dividirá el índice invertido.

#### Después de crear el indice invertido

- **Campo de Consulta**: Permite al usuario ingresar una consulta en lenguaje natural.
- **Selección de Top-K**: El usuario puede especificar la cantidad de documentos a recuperar.
- **Presentación de Resultados**: Los resultados se muestran de manera amigable, incluyendo el tiempo de respuesta de la consulta.

### Mini-manual de Usuario

#### Al crear el indice invertido

1. **Cargar Datos**: Haga clic en el botón "Cargar Datos" y seleccione un archivo CSV que contenga los datos de las canciones.
2. **Especificar Bloques**: Ingrese el número de bloques en los que desea dividir el índice invertido.

#### Al realizar una consulta

1. **Ingresar la Consulta**: Escriba la consulta en el campo de texto.
2. **Especificar Top-K**: Seleccione la cantidad de documentos a recuperar.
3. **Seleccion atributos extra**: Seleccione los atributos extra que desea mostrar en los resultados.
4. **Ver Resultados**: Los resultados aparecerán en la pantalla, mostrando la información relevante de las canciones junto con la similitud de coseno y el tiempo de consulta.

### Screenshots de la GUI

#### Creación del Índice Invertido
![Creación del Índice Invertido](assets/create_index.png)

#### Consulta de Texto Libre
![Consulta de Texto Libre](assets/query.png)

### Análisis Comparativo Visual con Otras Implementaciones
Comparación visual del rendimiento y precisión entre la implementación propia y las realizadas con PostgreSQL.

## Experimentación

### Tablas y Gráficos de los Resultados Experimentales
Se realizaron pruebas con diferentes tamaños de dataset (N = 1000, 2000, 4000, 8000, 16000, 25000). A continuación se presentan las tablas y gráficos con los resultados obtenidos.

#### Tiempo de Creación del Índice Invertido

| N     | SPIMI INDEX Time (ms) | PostgreSQL Time (ms) |
|-------|-----------------------|----------------------|
| 1000  | 6881.005              | 745.129              |
| 2000  | 12410.748             | 930.547              |
| 4000  | 25872.752             | 1822.762             |
| 8000  | 49830.521             | 4255.685             |
| 16000 | 100109.318            | 8002.739             |
| 25000 | 113356.787            | 9142.129             |

![Gráfico de Tiempo de Creación del Índice Invertido](assets/grafico_1.png)

#### Tiempo de Ejecución de Consultas (Top-K = 10)

| N     | SPIMI INDEX (ms) | PostgreSQL sin índice (ms) | PostgreSQL con índice (ms) |
|-------|------------------|----------------------------|----------------------------|
| 1000  | 2.308            | 1.972                      |0.069|
| 2000  | 2.201            | 3.568                      |0.119|
| 4000  | 2.212            | 8.009                      |0.223|
| 8000  | 2.001            | 13.858                     |0.456|
| 16000 | 2.992            | 30.442                     |0.801|
| 25000 | 2.941            | 34.457                     |1.436|

![Gráfico de Tiempo de Ejecución de Consultas](assets/grafico_2.png)

### Análisis y Discusión
De acuerdo a los resultados obtenidos, se puede identificar que en cuanto al tiempo de creación del índice invertido, la implementación propia (SPIMI INDEX) tiende a ser mas lenta que la implementación con PostgreSQL. Esto es debido a que la implementación propia realiza un procesamiento más complejo y detallado de los datos, ya que para el análisis de los lyrics que se encuentran en el dataset, se realiza un preprocesamiento de los mismos, y para complementar, se hace un análisis del lenguaje previo para obtener resultados más relevantes y precisos al momento de hacer una consulta para devolver los resultados que, dependiendo del idioma de la consulta, se obtienen resultados más precisos. En cambio, la implementación con PostgreSQL, al no realizar un preprocesamiento de los datos, y no realizar un análisis del lenguaje, se obtienen resultados más rápidos, pero menos precisos. En cuanto al tiempo de ejecución de consultas, la implementación propia (SPIMI INDEX), al principio no es más rapida que la implementación de PostgreSQL, pero a medida que el dataset crece, la implementación propia tiende a mantener los mismos tiempos de ejecución, mientras que la implementación de PostgreSQL tiende a aumentar el tiempo de ejecución de las consultas a medida que el dataset crece. Esto se debe a que la implementación propia realiza un preprocesamiento de los datos, y un análisis del lenguaje, lo que permite obtener resultados más precisos y relevantes, mientras que la implementación de PostgreSQL, al no realizar un preprocesamiento de los datos, y no realizar un análisis del lenguaje, se obtienen resultados menos precisos y relevantes, lo que hace que el tiempo de ejecución de las consultas aumente a medida que el dataset crece. En ese caso, la implementación propia (SPIMI INDEX) es más eficiente y precisa que la implementación de PostgreSQL al momento de realizar consultas en un dataset grande, pero en un dataset pequeño, la implementación de PostgreSQL es más eficiente y precisa que la implementación propia (SPIMI INDEX).

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

## Autores

| **Benjamin Soto** | **Edgar Chambilla** | **Fabrizzio Vilchez** | **Ian Gonzales** | **Jeffrey Monja** |
|:------------:|:------------:|:------------:|:------------:|:------------:|
| ![Benjamin Soto](https://avatars.githubusercontent.com/u/104233590?v=4) | ![Edgar Chambilla](https://avatars.githubusercontent.com/u/39739752?v=4) | ![Fabrizzio Vilchez](https://avatars.githubusercontent.com/u/115495332?v=4) | ![Ian Gonzales](https://avatars.githubusercontent.com/u/122047216?v=4) | ![Jeffrey Monja](https://avatars.githubusercontent.com/u/104637993?v=4) |
| [https://github.com/SotoBenjamin](https://github.com/SotoBenjamin) | [https://github.com/Edgar5377](https://github.com/Edgar5377) | [https://github.com/Fabrizzio20k](https://github.com/Fabrizzio20k) | [https://github.com/mukanjy0](https://github.com/mukanjy0) | [https://github.com/jeffreymonjacastro](https://github.com/jeffreymonjacastro) |



## Referencias
Manning, C. D., Raghavan, P., & Schütze, H. (2008). *Introduction to Information Retrieval*. Cambridge University Press. Retrieved from https://nlp.stanford.edu/IR-book/html/htmledition/single-pass-in-memory-indexing-1.html