#!/bin/bash
set -euo pipefail

# smms_apply_patch.sh
# Usage: run as root on the SMMS host. Backups are created under /var/www/smms_backend.

TIMESTAMP=$(date +%s)
BACKUP_JAR=/var/www/smms_backend/app.jar.bak_${TIMESTAMP}
ORIG_JAR=/var/www/smms_backend/app.jar
BUILD_DIR=/tmp/smms_build
SRC_DIR=${BUILD_DIR}/src
CLS_DIR=${BUILD_DIR}/classes

echo "Backing up current JAR to ${BACKUP_JAR}"
cp "${ORIG_JAR}" "${BACKUP_JAR}"

echo "Preparing build workspace ${BUILD_DIR}"
rm -rf "${BUILD_DIR}"
mkdir -p "${SRC_DIR}/in/main/java/in/main/entities" \
         "${SRC_DIR}/in/main/java/in/main/dto" \
         "${SRC_DIR}/in/main/java/in/main/service"
mkdir -p "${CLS_DIR}"

# === Write updated source files (overwrite) ===
# Product.java
cat > "${SRC_DIR}/in/main/java/in/main/entities/Product.java" <<'EOF'
$(sed -n '1,240p' "d:/SuperMarket Project/SuperMarket/Super_market-main/SuperMarket Backend/src/main/java/in/main/entities/Product.java" 2>/dev/null || true)
EOF

# ProductResponse.java
cat > "${SRC_DIR}/in/main/java/in/main/dto/ProductResponse.java" <<'EOF'
$(sed -n '1,240p' "d:/SuperMarket Project/SuperMarket/Super_market-main/SuperMarket Backend/src/main/java/in/main/dto/ProductResponse.java" 2>/dev/null || true)
EOF

# Order.java
cat > "${SRC_DIR}/in/main/java/in/main/entities/Order.java" <<'EOF'
$(sed -n '1,240p' "d:/SuperMarket Project/SuperMarket/Super_market-main/SuperMarket Backend/src/main/java/in/main/entities/Order.java" 2>/dev/null || true)
EOF

# OrderResponse.java
cat > "${SRC_DIR}/in/main/java/in/main/dto/OrderResponse.java" <<'EOF'
$(sed -n '1,240p' "d:/SuperMarket Project/SuperMarket/Super_market-main/SuperMarket Backend/src/main/java/in/main/dto/OrderResponse.java" 2>/dev/null || true)
EOF

# OrderServiceImpl.java
cat > "${SRC_DIR}/in/main/java/in/main/service/OrderServiceImpl.java" <<'EOF'
$(sed -n '1,260p' "d:/SuperMarket Project/SuperMarket/Super_market-main/SuperMarket Backend/src/main/java/in/main/service/OrderServiceImpl.java" 2>/dev/null || true)
EOF

# ProductServiceImpl.java
cat > "${SRC_DIR}/in/main/java/in/main/service/ProductServiceImpl.java" <<'EOF'
$(sed -n '1,260p' "d:/SuperMarket Project/SuperMarket/Super_market-main/SuperMarket Backend/src/main/java/in/main/service/ProductServiceImpl.java" 2>/dev/null || true)
EOF

# DashboardServiceImpl.java (for DTO mapping)
cat > "${SRC_DIR}/in/main/java/in/main/service/DashboardServiceImpl.java" <<'EOF'
$(sed -n '1,240p' "d:/SuperMarket Project/SuperMarket/Super_market-main/SuperMarket Backend/src/main/java/in/main/service/DashboardServiceImpl.java" 2>/dev/null || true)
EOF

# === Compile changed classes ===
# Build CLASSPATH from the existing JAR libs
mkdir -p "${BUILD_DIR}/lib"
(cd "${BUILD_DIR}" && jar xf "${ORIG_JAR}" BOOT-INF/lib)
CLASSPATH=$(printf "%s:" "${BUILD_DIR}/BOOT-INF/lib/"*.jar)
CLASSPATH=${CLASSPATH}:${BUILD_DIR}/BOOT-INF/classes

echo "Compiling sources..."
javac -classpath "${CLASSPATH}" -d "${CLS_DIR}" \
  "${SRC_DIR}/in/main/java/in/main/entities/Product.java" \
  "${SRC_DIR}/in/main/java/in/main/dto/ProductResponse.java" \
  "${SRC_DIR}/in/main/java/in/main/entities/Order.java" \
  "${SRC_DIR}/in/main/java/in/main/dto/OrderResponse.java" \
  "${SRC_DIR}/in/main/java/in/main/service/OrderServiceImpl.java" \
  "${SRC_DIR}/in/main/java/in/main/service/ProductServiceImpl.java" \
  "${SRC_DIR}/in/main/java/in/main/service/DashboardServiceImpl.java"

# Verify compiled classes
echo "Compiled classes:" ; find "${CLS_DIR}" -type f -name '*.class' -print

# Update JAR with compiled classes
echo "Updating JAR with new classes"
jar uf "${ORIG_JAR}" -C "${CLS_DIR}" in/main/entities/Product.class \
  -C "${CLS_DIR}" in/main/dto/ProductResponse.class \
  -C "${CLS_DIR}" in/main/entities/Order.class \
  -C "${CLS_DIR}" in/main/dto/OrderResponse.class \
  -C "${CLS_DIR}" in/main/service/OrderServiceImpl.class \
  -C "${CLS_DIR}" in/main/service/ProductServiceImpl.class \
  -C "${CLS_DIR}" in/main/service/DashboardServiceImpl.class || true

# Inform about DB migration
echo "DB changes (run these on your MySQL database):"
echo "ALTER TABLE product ADD COLUMN net_rate DOUBLE DEFAULT NULL;"
echo "ALTER TABLE orders ADD COLUMN mrp_total DOUBLE DEFAULT 0, ADD COLUMN discount DOUBLE DEFAULT 0;"

# Restart container
echo "Restarting smms container"
docker restart smms || true

echo "Done. Please run the DB ALTER statements and then test the endpoints."

exit 0
