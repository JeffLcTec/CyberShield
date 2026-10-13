# CyberShield — MVP

Prototipo funcional de la plataforma de CyberShield (Módulo 9 de la propuesta): ciberseguridad administrada para PYMEs costarricenses. Usa **datos quemados** (empresas y personas ficticias); todos los cambios se guardan en el navegador (`localStorage`) y se pueden restablecer desde el menú.

## Cómo ejecutarlo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/ (sitio estático, se puede abrir en cualquier hosting)
```

## Usuarios de demostración (contraseña `demo`)

| Usuario | Rol | Qué ve |
|---|---|---|
| analista@cybershield.cr | Analista SOC | Todos los clientes, cola de alertas, bitácora, planes |
| ciso@cybershield.cr | CISO | Igual que el analista |
| gerencia@hotelvistaarenal.cr | Cliente (Hotel Vista Arenal) | Solo su empresa, en lenguaje para gerencia |
| direccion@clinicasantalucia.cr | Cliente (Clínica Santa Lucía) | Solo su empresa |

En la pantalla de inicio también hay botones de acceso rápido.

## Qué incluye

- **Centro de operaciones (SOC):** métricas de éxito del MVP (cobertura ≥ 95 %, respuesta a críticos < 30 min, falsos positivos < 20 %, +10 pts de CyberScore en 90 días), ingreso mensual, carga por analista y tendencia del CyberScore.
- **CyberScore v1 (0–100):** calculado en vivo con los cinco factores del documento — cobertura EDR 25 %, parches/vulnerabilidades 25 %, MFA 20 %, correo SPF/DKIM/DMARC 15 % y respaldos 15 % — con recomendaciones priorizadas por los puntos que suman.
- **Alertas e incidentes:** cola priorizada, detalle con técnica MITRE ATT&CK y confianza del modelo de IA, acciones (tomar, aislar equipo, escalar, resolver, falso positivo), notas, control del SLA y botón **Simular ataque**.
- **Equipos (EDR):** inventario, instalar/actualizar agente, aislar y liberar equipos, registrar equipos nuevos.
- **Vulnerabilidades:** resultados del escaneo mensual autorizado, marcar como remediada o aceptar el riesgo, ejecutar un escaneo.
- **Accesos, correo y respaldos:** activar MFA por cuenta, configurar SPF/DKIM/DMARC y registrar respaldos y pruebas de restauración.
- **Reporte mensual** para gerencia, exportable a PDF (imprimir → guardar como PDF).
- **Clientes:** fichas y alta de nuevos clientes piloto.
- **Planes y precios** con simulador de punto de equilibrio basado en el presupuesto del Módulo 8.
- **Bitácora de acciones** para la trazabilidad (Ley N.º 9048).

Todo cambio (activar MFA, remediar una vulnerabilidad, instalar un agente…) recalcula de inmediato el CyberScore y las métricas.

## Tecnología

React 19 · Vite · Tailwind CSS 4 · Recharts · lucide-react. Sin backend: el estado vive en `src/store.jsx` y los datos semilla en `src/data/seed.js`. La fórmula del CyberScore está en `src/lib/score.js`.
