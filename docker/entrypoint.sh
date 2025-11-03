#!/usr/bin/env sh
set -e

# Optional H2 toggle for local/testing in containers
# If SPRING_USE_H2=true|1, set sensible H2 defaults unless user already provided overrides.
if [ "${SPRING_USE_H2:-}" = "true" ] || [ "${SPRING_USE_H2:-}" = "1" ]; then
  DS_URL="${SPRING_DATASOURCE_URL:-}"
  APPLY_H2=1
  case "$DS_URL" in
    jdbc:h2:*) APPLY_H2=1 ;;
    "")      APPLY_H2=1 ;;
    *)        APPLY_H2=0 ;;
  esac

  if [ "$APPLY_H2" = "1" ]; then
    export SPRING_PROFILES_ACTIVE="${SPRING_PROFILES_ACTIVE:-local}"
    export SPRING_H2_CONSOLE_ENABLED="${SPRING_H2_CONSOLE_ENABLED:-true}"
    export SPRING_H2_CONSOLE_PATH="${SPRING_H2_CONSOLE_PATH:-/h2-console}"
    export SPRING_JPA_HIBERNATE_DDL_AUTO="${SPRING_JPA_HIBERNATE_DDL_AUTO:-create-drop}"
    # Use in-memory H2 in containers to avoid TCP server dependency
    export SPRING_DATASOURCE_URL="${SPRING_DATASOURCE_URL:-jdbc:h2:mem:itdaing;MODE=MySQL;DATABASE_TO_LOWER=TRUE;CASE_INSENSITIVE_IDENTIFIERS=TRUE;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE}"
    export SPRING_DATASOURCE_USERNAME="${SPRING_DATASOURCE_USERNAME:-sa}"
    export SPRING_DATASOURCE_PASSWORD="${SPRING_DATASOURCE_PASSWORD:-}"
    export SPRING_DATASOURCE_DRIVER_CLASS_NAME="${SPRING_DATASOURCE_DRIVER_CLASS_NAME:-org.h2.Driver}"
  else
    echo "[entrypoint] SPRING_USE_H2 is set, but non-H2 SPRING_DATASOURCE_URL is provided. Skipping H2 overrides." >&2
  fi
fi

exec sh -c "java $JAVA_OPTS -Duser.timezone=$TZ -jar /app/app.jar"
