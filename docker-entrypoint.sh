#!/bin/bash
set -e

BENCH_DIR="/home/frappe/frappe-bench"

# Función para esperar a que MariaDB esté listo
wait_for_mariadb() {
    echo "Esperando a que MariaDB esté disponible..."
    while ! mysqladmin ping -h mariadb -uroot -proot --silent 2>/dev/null; do
        sleep 2
    done
    echo "MariaDB está listo!"
}

# Función para inicializar bench si no existe
init_bench() {
    if [ ! -d "$BENCH_DIR/apps/frappe" ]; then
        echo "Inicializando Frappe Bench..."
        cd /home/frappe
        bench init --skip-redis-config-generation frappe-bench --frappe-branch version-15

        cd $BENCH_DIR

        # Configurar conexiones
        bench set-config -g db_host mariadb
        bench set-config -g redis_cache "redis://redis-cache:6379"
        bench set-config -g redis_queue "redis://redis-queue:6379"
        bench set-config -g redis_socketio "redis://redis-socketio:6379"

        # Instalar ERPNext
        echo "Instalando ERPNext v15..."
        bench get-app erpnext --branch version-15

        # Instalar dependencias Python adicionales
        echo "Instalando dependencias Python..."
        ./env/bin/pip install pycryptodome python-barcode

        # Crear sitio
        echo "Creando sitio de desarrollo..."
        bench new-site dev.localhost \
            --mariadb-root-password root \
            --admin-password admin \
            --no-mariadb-socket

        bench --site dev.localhost install-app erpnext

        # Habilitar modo desarrollador
        bench set-config -g developer_mode 1
        bench set-config -g server_script_enabled 1

        bench use dev.localhost

        echo "Bench inicializado correctamente!"
    fi
}

# Función para instalar erpnext_ec si está montado
install_erpnext_ec() {
    if [ -d "$BENCH_DIR/apps/erpnext_ec" ]; then
        cd $BENCH_DIR

        # Verificar si ya está instalada
        if ! bench --site dev.localhost list-apps 2>/dev/null | grep -q "erpnext_ec"; then
            echo "Instalando erpnext_ec..."
            bench get-app /home/frappe/frappe-bench/apps/erpnext_ec --skip-assets || true
            bench --site dev.localhost install-app erpnext_ec || true
        fi
    fi
}

# Ejecutar inicialización
wait_for_mariadb
init_bench
install_erpnext_ec

# Ejecutar el comando pasado
exec "$@"
