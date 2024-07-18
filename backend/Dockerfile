# Usa la imagen oficial de Python 3.12
FROM python:3.12

# Establece el directorio de trabajo en /app
WORKDIR /app

# Copia el archivo requirements.txt en el contenedor
COPY requirements.txt .

# Instala las dependencias del archivo requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copia el resto de los archivos del proyecto en el contenedor
COPY . .

# Exponer el puerto que usará la aplicación FastAPI
EXPOSE 8000

# Define el comando por defecto para ejecutar cuando el contenedor se inicie
CMD ["fastapi", "run"]
