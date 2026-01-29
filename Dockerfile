FROM frappe/bench:latest

USER root

# Instalar dependencias del sistema para wkhtmltopdf
RUN apt-get update && apt-get install -y \
    libxrender1 \
    libfontconfig1 \
    libx11-dev \
    libjpeg62-turbo \
    libxtst6 \
    fontconfig \
    xfonts-base \
    xfonts-75dpi \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Instalar wkhtmltopdf
RUN wget -q https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6.1-2/wkhtmltox_0.12.6.1-2.jammy_amd64.deb \
    && dpkg -i wkhtmltox_0.12.6.1-2.jammy_amd64.deb || apt-get install -f -y \
    && rm wkhtmltox_0.12.6.1-2.jammy_amd64.deb

USER frappe
WORKDIR /home/frappe

# Configuración de bench
ENV PATH="/home/frappe/.local/bin:${PATH}"

# Script de inicialización
COPY --chown=frappe:frappe docker-entrypoint.sh /home/frappe/
RUN chmod +x /home/frappe/docker-entrypoint.sh

EXPOSE 8000 9000 6787

ENTRYPOINT ["/home/frappe/docker-entrypoint.sh"]
CMD ["bash"]
