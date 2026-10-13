// Datos quemados del MVP de CyberShield (Módulo 9 del documento).
// Todos los nombres de empresas y personas son ficticios.

const MIN = 60 * 1000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

export const PLANS = [
  { id: 'esencial', name: 'Esencial', usd: 600, crc: 300000, endpoints: 25, mix: 45,
    features: ['EDR gestionado', 'Monitoreo SIEM', 'Escaneo mensual', 'CyberScore', 'Reporte mensual'] },
  { id: 'profesional', name: 'Profesional', usd: 1200, crc: 600000, endpoints: 60, mix: 40,
    features: ['Todo lo de Esencial', 'Alertas por llamada 24/7', 'Simulacro de phishing trimestral', 'Revisión trimestral con gerencia'] },
  { id: 'avanzado', name: 'Avanzado', usd: 2000, crc: 1000000, endpoints: 100, mix: 15,
    features: ['Todo lo de Profesional', 'Analista asignado', 'Escaneos quincenales', 'Respuesta prioritaria < 15 min'] },
]

export const USERS = [
  { id: 'u-soc', email: 'analista@cybershield.cr', password: 'demo', name: 'Andrea Solís', role: 'soc', title: 'Ingeniera de Ciberseguridad Senior (SOC)' },
  { id: 'u-ciso', email: 'ciso@cybershield.cr', password: 'demo', name: 'Mauricio Vega', role: 'soc', title: 'Director de Ciberseguridad (CISO)' },
  { id: 'u-hotel', email: 'gerencia@hotelvistaarenal.cr', password: 'demo', name: 'Laura Quesada', role: 'cliente', clientId: 'hotel', title: 'Gerente General · Hotel Vista Arenal' },
  { id: 'u-clinica', email: 'direccion@clinicasantalucia.cr', password: 'demo', name: 'Dr. Pablo Arias', role: 'cliente', clientId: 'clinica', title: 'Director · Clínica Santa Lucía' },
]

const CLIENTS = [
  { id: 'hotel', name: 'Hotel Vista Arenal', sector: 'Hotelería y turismo', location: 'La Fortuna, San Carlos', plan: 'profesional', status: 'piloto', since: 62, contact: 'Laura Quesada', employees: 48, scoreStart: 46 },
  { id: 'clinica', name: 'Clínica Santa Lucía', sector: 'Salud privada', location: 'Ciudad Quesada, San Carlos', plan: 'profesional', status: 'piloto', since: 58, contact: 'Dr. Pablo Arias', employees: 35, scoreStart: 41 },
  { id: 'contable', name: 'Rojas & Asociados', sector: 'Despacho contable', location: 'San José', plan: 'esencial', status: 'piloto', since: 55, contact: 'Marcela Rojas', employees: 14, scoreStart: 52 },
  { id: 'tienda', name: 'TiendaVerde CR', sector: 'Comercio electrónico', location: 'Heredia', plan: 'esencial', status: 'activo', since: 30, contact: 'Diego Mora', employees: 22, scoreStart: 74 },
  { id: 'logistica', name: 'Logística del Norte', sector: 'Logística', location: 'Alajuela', plan: 'avanzado', status: 'activo', since: 24, contact: 'Ana Chaves', employees: 86, scoreStart: 80 },
]

// Equipos por cliente: [hostname, área, sistema operativo, estado del agente]
const ENDPOINTS = {
  hotel: [
    ['HVA-REC-01', 'Recepción', 'Windows 11', 'protegido'],
    ['HVA-REC-02', 'Recepción', 'Windows 10', 'desactualizado'],
    ['HVA-RES-01', 'Reservaciones', 'Windows 11', 'protegido'],
    ['HVA-RES-02', 'Reservaciones', 'Windows 11', 'protegido'],
    ['HVA-CON-01', 'Contabilidad', 'Windows 11', 'protegido'],
    ['HVA-GER-01', 'Gerencia', 'macOS 15', 'protegido'],
    ['HVA-SRV-PMS', 'Servidor PMS', 'Windows Server 2019', 'protegido'],
    ['HVA-RST-01', 'Restaurante (POS)', 'Windows 10', 'sin_agente'],
    ['HVA-MKT-01', 'Mercadeo', 'Windows 11', 'protegido'],
    ['HVA-MNT-01', 'Mantenimiento', 'Windows 10', 'sin_agente'],
    ['HVA-SPA-01', 'Spa', 'Windows 11', 'protegido'],
    ['HVA-RRHH-01', 'Recursos Humanos', 'Windows 11', 'protegido'],
  ],
  clinica: [
    ['CSL-ADM-01', 'Admisión', 'Windows 11', 'protegido'],
    ['CSL-ADM-02', 'Admisión', 'Windows 11', 'protegido'],
    ['CSL-CON-01', 'Consultorio 1', 'Windows 10', 'desactualizado'],
    ['CSL-CON-02', 'Consultorio 2', 'Windows 10', 'protegido'],
    ['CSL-CON-03', 'Consultorio 3', 'Windows 11', 'protegido'],
    ['CSL-LAB-01', 'Laboratorio', 'Windows 10', 'sin_agente'],
    ['CSL-RAY-01', 'Rayos X', 'Windows 7', 'sin_agente'],
    ['CSL-SRV-EXP', 'Servidor expediente', 'Windows Server 2016', 'protegido'],
    ['CSL-FAR-01', 'Farmacia', 'Windows 11', 'protegido'],
    ['CSL-DIR-01', 'Dirección', 'macOS 14', 'protegido'],
  ],
  contable: [
    ['RYA-SOC-01', 'Socia directora', 'Windows 11', 'protegido'],
    ['RYA-CNT-01', 'Contador', 'Windows 11', 'protegido'],
    ['RYA-CNT-02', 'Contador', 'Windows 11', 'protegido'],
    ['RYA-CNT-03', 'Contador', 'Windows 10', 'desactualizado'],
    ['RYA-ASI-01', 'Asistente', 'Windows 11', 'protegido'],
    ['RYA-NAS-01', 'NAS de archivos', 'Synology DSM 7', 'sin_agente'],
    ['RYA-LAP-01', 'Laptop visitas', 'Windows 11', 'protegido'],
  ],
  tienda: [
    ['TVC-WEB-01', 'Servidor tienda web', 'Ubuntu 22.04', 'protegido'],
    ['TVC-BOD-01', 'Bodega', 'Windows 11', 'protegido'],
    ['TVC-BOD-02', 'Bodega', 'Windows 10', 'protegido'],
    ['TVC-ATC-01', 'Atención al cliente', 'Windows 11', 'protegido'],
    ['TVC-ATC-02', 'Atención al cliente', 'Windows 11', 'desactualizado'],
    ['TVC-GER-01', 'Gerencia', 'macOS 15', 'protegido'],
    ['TVC-MKT-01', 'Mercadeo', 'macOS 14', 'protegido'],
    ['TVC-FIN-01', 'Finanzas', 'Windows 11', 'protegido'],
  ],
  logistica: [
    ['LDN-OPS-01', 'Operaciones', 'Windows 11', 'protegido'],
    ['LDN-OPS-02', 'Operaciones', 'Windows 11', 'protegido'],
    ['LDN-OPS-03', 'Operaciones', 'Windows 11', 'protegido'],
    ['LDN-DSP-01', 'Despacho', 'Windows 10', 'protegido'],
    ['LDN-DSP-02', 'Despacho', 'Windows 10', 'desactualizado'],
    ['LDN-FIN-01', 'Finanzas', 'Windows 11', 'protegido'],
    ['LDN-FIN-02', 'Finanzas', 'Windows 11', 'protegido'],
    ['LDN-SRV-ERP', 'Servidor ERP', 'Windows Server 2022', 'protegido'],
    ['LDN-SRV-GPS', 'Servidor rastreo GPS', 'Ubuntu 24.04', 'protegido'],
    ['LDN-GER-01', 'Gerencia', 'Windows 11', 'protegido'],
    ['LDN-RRHH-01', 'Recursos Humanos', 'Windows 11', 'protegido'],
    ['LDN-TAL-01', 'Taller', 'Windows 10', 'sin_agente'],
  ],
}

// Cuentas con acceso relevante (para el factor MFA y control de accesos)
const ACCOUNTS = {
  hotel: [
    ['admin@hotelvistaarenal.cr', 'Microsoft 365 (admin)', true, true],
    ['gerencia@hotelvistaarenal.cr', 'Microsoft 365', true, false],
    ['reservas@hotelvistaarenal.cr', 'Microsoft 365', false, false],
    ['recepcion', 'PMS Hotelero', false, false],
    ['contabilidad', 'Banca en línea', true, true],
    ['booking-extranet', 'Extranet de reservas', false, true],
  ],
  clinica: [
    ['admin@clinicasantalucia.cr', 'Google Workspace (admin)', true, true],
    ['direccion@clinicasantalucia.cr', 'Google Workspace', false, false],
    ['expediente-admin', 'Expediente clínico', false, true],
    ['admision', 'Expediente clínico', false, false],
    ['finanzas', 'Banca en línea', true, true],
  ],
  contable: [
    ['admin@rojasyasociados.cr', 'Microsoft 365 (admin)', true, true],
    ['marcela@rojasyasociados.cr', 'Microsoft 365', true, false],
    ['atv-despacho', 'ATV Hacienda', false, true],
    ['nas-admin', 'NAS de archivos', false, true],
  ],
  tienda: [
    ['admin@tiendaverde.cr', 'Google Workspace (admin)', true, true],
    ['shop-admin', 'Panel de la tienda en línea', true, true],
    ['pasarela', 'Pasarela de pagos', true, true],
    ['soporte@tiendaverde.cr', 'Google Workspace', false, false],
  ],
  logistica: [
    ['admin@logisticadelnorte.cr', 'Microsoft 365 (admin)', true, true],
    ['erp-admin', 'ERP', true, true],
    ['gps-admin', 'Plataforma GPS', true, true],
    ['operaciones@logisticadelnorte.cr', 'Microsoft 365', true, false],
    ['despacho@logisticadelnorte.cr', 'Microsoft 365', false, false],
    ['finanzas', 'Banca en línea', true, true],
  ],
}

const EMAIL = {
  hotel: { domain: 'hotelvistaarenal.cr', spf: true, dkim: false, dmarc: false },
  clinica: { domain: 'clinicasantalucia.cr', spf: true, dkim: true, dmarc: false },
  contable: { domain: 'rojasyasociados.cr', spf: true, dkim: true, dmarc: false },
  tienda: { domain: 'tiendaverde.cr', spf: true, dkim: true, dmarc: true },
  logistica: { domain: 'logisticadelnorte.cr', spf: true, dkim: true, dmarc: true },
}

const BACKUPS = {
  hotel: { lastHours: 20, frequency: 'Diario', tested: false, offsite: true },
  clinica: { lastHours: 96, frequency: 'Semanal', tested: false, offsite: false },
  contable: { lastHours: 30, frequency: 'Diario', tested: true, offsite: false },
  tienda: { lastHours: 6, frequency: 'Diario', tested: true, offsite: true },
  logistica: { lastHours: 4, frequency: 'Cada 12 h', tested: true, offsite: true },
}

// [cliente, CVE, título, severidad, CVSS, equipo, días desde detección, solución]
const VULNS = [
  ['hotel', 'CVE-2024-38063', 'Ejecución remota en pila TCP/IP IPv6 de Windows', 'critica', 9.8, 'HVA-REC-02', 12, 'Aplicar actualización acumulativa de Windows de agosto 2024 o posterior.'],
  ['hotel', 'CVE-2023-4966', 'Fuga de sesión en VPN NetScaler (Citrix Bleed)', 'critica', 9.4, 'Firewall perimetral', 12, 'Actualizar firmware del VPN e invalidar todas las sesiones activas.'],
  ['hotel', 'CVE-2024-21413', 'Ejecución remota en Microsoft Outlook (MonikerLink)', 'alta', 9.8, 'HVA-RES-01', 12, 'Actualizar Microsoft 365 Apps al canal actual.'],
  ['hotel', 'CS-CONF-001', 'Puerto RDP (3389) expuesto a Internet', 'alta', 8.1, 'HVA-SRV-PMS', 12, 'Cerrar el puerto y habilitar acceso solo por VPN con MFA.'],
  ['hotel', 'CS-CONF-014', 'Contraseña por defecto en impresora de red', 'media', 5.3, 'Impresora recepción', 12, 'Cambiar credenciales de administración de la impresora.'],
  ['hotel', 'CVE-2023-36884', 'Ejecución remota vía documentos de Office', 'media', 7.5, 'HVA-MKT-01', 40, 'Aplicar parche de Office.', 'remediada'],
  ['clinica', 'CVE-2019-0708', 'BlueKeep: ejecución remota en RDP de Windows 7', 'critica', 9.8, 'CSL-RAY-01', 9, 'Aislar el equipo de Rayos X en VLAN propia y deshabilitar RDP; planear reemplazo del SO.'],
  ['clinica', 'CVE-2024-38063', 'Ejecución remota en pila TCP/IP IPv6 de Windows', 'critica', 9.8, 'CSL-CON-01', 9, 'Aplicar actualización acumulativa de Windows.'],
  ['clinica', 'CS-CONF-007', 'Recurso compartido SMB con acceso de "Todos"', 'alta', 7.5, 'CSL-SRV-EXP', 9, 'Restringir permisos del recurso a grupos específicos.'],
  ['clinica', 'CVE-2024-3400', 'Inyección de comandos en firewall GlobalProtect', 'alta', 8.8, 'Firewall perimetral', 9, 'Actualizar PAN-OS a versión corregida.'],
  ['clinica', 'CS-CONF-021', 'TLS 1.0 habilitado en portal de citas', 'media', 5.9, 'Portal de citas', 9, 'Deshabilitar TLS 1.0/1.1 en el servidor web.'],
  ['contable', 'CVE-2024-10443', 'Ejecución remota en Synology Photos (NAS)', 'critica', 9.8, 'RYA-NAS-01', 7, 'Actualizar DSM y Synology Photos; no exponer el NAS a Internet.'],
  ['contable', 'CVE-2024-21413', 'Ejecución remota en Microsoft Outlook (MonikerLink)', 'alta', 9.8, 'RYA-CNT-03', 7, 'Actualizar Microsoft 365 Apps.'],
  ['contable', 'CS-CONF-003', 'Cuentas locales de administrador compartidas', 'media', 6.5, 'Todos los equipos', 7, 'Implementar LAPS o contraseñas únicas por equipo.'],
  ['tienda', 'CVE-2024-4577', 'Inyección de argumentos en PHP-CGI', 'alta', 9.8, 'TVC-WEB-01', 5, 'Actualizar PHP a 8.3.8 o superior.'],
  ['tienda', 'CS-CONF-030', 'Cabeceras de seguridad HTTP ausentes', 'baja', 3.1, 'Tienda web', 5, 'Agregar CSP, HSTS y X-Frame-Options.'],
  ['tienda', 'CS-CONF-012', 'Plugin de WordPress desactualizado', 'media', 6.1, 'Tienda web', 35, 'Actualizar plugin.', 'remediada'],
  ['logistica', 'CS-CONF-018', 'Servicio SSH con autenticación por contraseña', 'media', 5.3, 'LDN-SRV-GPS', 4, 'Permitir solo llaves SSH y deshabilitar root.'],
  ['logistica', 'CVE-2024-6387', 'regreSSHion: ejecución remota en OpenSSH', 'alta', 8.1, 'LDN-SRV-GPS', 20, 'Actualizar OpenSSH.', 'remediada'],
]

// [cliente, título, descripción, severidad, fuente, equipo, minutos atrás, respuesta (min) o null, estado, MITRE, confianza IA]
const ALERTS = [
  ['hotel', 'Posible ransomware: cifrado masivo de archivos', 'El EDR detectó renombrado de más de 300 archivos con extensión .lockd en 2 minutos desde un proceso no firmado.', 'critica', 'EDR', 'HVA-REC-02', 18, null, 'nueva', 'T1486 · Data Encrypted for Impact', 94],
  ['hotel', 'Inicio de sesión desde país inusual', 'Acceso exitoso a reservas@hotelvistaarenal.cr desde Países Bajos sin MFA.', 'alta', 'SIEM', null, 95, 12, 'en_analisis', 'T1078 · Valid Accounts', 81],
  ['hotel', 'Correo de phishing reportado', 'Mensaje suplantando a Booking.com con enlace a dominio recién registrado. Recibido por 6 usuarios.', 'media', 'Correo', null, 60 * 26, 9, 'resuelta', 'T1566 · Phishing', 88],
  ['hotel', 'Escaneo de puertos desde Internet', 'Más de 2.000 conexiones a puertos aleatorios del firewall en 5 minutos.', 'baja', 'SIEM', null, 60 * 50, 22, 'resuelta', 'T1046 · Network Service Discovery', 42],
  ['clinica', 'Ejecución de PowerShell ofuscado', 'Comando PowerShell codificado en Base64 lanzado desde una macro de Word.', 'critica', 'EDR', 'CSL-ADM-02', 42, 7, 'escalada', 'T1059.001 · PowerShell', 91],
  ['clinica', 'Múltiples intentos fallidos de acceso', '57 intentos fallidos contra expediente-admin en 10 minutos.', 'alta', 'SIEM', 'CSL-SRV-EXP', 60 * 5, 14, 'en_analisis', 'T1110 · Brute Force', 76],
  ['clinica', 'Dispositivo USB no autorizado', 'Memoria USB conectada en equipo de laboratorio.', 'baja', 'EDR', 'CSL-LAB-01', 60 * 30, 25, 'resuelta', 'T1091 · Removable Media', 55],
  ['contable', 'Regla de reenvío de correo sospechosa', 'Se creó una regla que reenvía correos con "factura" a una cuenta externa de Gmail.', 'alta', 'Correo', null, 130, 18, 'en_analisis', 'T1114.003 · Email Forwarding Rule', 87],
  ['contable', 'Software no autorizado instalado', 'Herramienta de acceso remoto AnyDesk instalada fuera del inventario.', 'media', 'EDR', 'RYA-CNT-03', 60 * 20, 11, 'resuelta', 'T1219 · Remote Access Software', 70],
  ['tienda', 'Inyección SQL bloqueada', 'El WAF bloqueó 140 intentos de inyección SQL contra /checkout.', 'media', 'SIEM', 'TVC-WEB-01', 60 * 8, 6, 'resuelta', 'T1190 · Exploit Public-Facing App', 83],
  ['tienda', 'Alto consumo de CPU en servidor web', 'Posible minero de criptomonedas; proceso kworkerds al 95 % de CPU.', 'alta', 'EDR', 'TVC-WEB-01', 75, null, 'nueva', 'T1496 · Resource Hijacking', 67],
  ['logistica', 'Acceso fuera de horario a ERP', 'Usuario de finanzas accedió al ERP a las 02:14.', 'baja', 'SIEM', 'LDN-FIN-02', 60 * 14, 19, 'falso_positivo', 'T1078 · Valid Accounts', 38],
  ['logistica', 'Comunicación con servidor C2 conocido', 'Conexión saliente hacia IP en lista de inteligencia de amenazas.', 'critica', 'SIEM', 'LDN-DSP-02', 60 * 3, 5, 'resuelta', 'T1071 · Application Layer Protocol', 96],
]

// Historial semanal de CyberScore (13 semanas ≈ 90 días)
function history(start, end, seed) {
  const pts = []
  let r = seed
  const rand = () => { r = (r * 9301 + 49297) % 233280; return r / 233280 }
  for (let i = 0; i < 13; i++) {
    const base = start + ((end - start) * i) / 12
    pts.push(Math.round(Math.max(0, Math.min(100, base + (rand() - 0.5) * 4))))
  }
  pts[0] = start
  return pts
}

export function buildSeed(now = Date.now()) {
  const endpoints = []
  Object.entries(ENDPOINTS).forEach(([clientId, list]) => {
    list.forEach(([hostname, area, os, agent], i) => {
      endpoints.push({
        id: `${clientId}-ep-${i}`, clientId, hostname, area, os, agent,
        ip: `10.${CLIENTS.findIndex(c => c.id === clientId) + 10}.1.${20 + i}`,
        lastSeen: agent === 'sin_agente' ? null : now - (agent === 'desactualizado' ? 3 * DAY : (i % 5 + 1) * MIN),
        agentVersion: agent === 'desactualizado' ? '4.2.1' : agent === 'sin_agente' ? null : '5.1.0',
      })
    })
  })

  const accounts = []
  Object.entries(ACCOUNTS).forEach(([clientId, list]) => {
    list.forEach(([name, system, mfa, privileged], i) => {
      accounts.push({ id: `${clientId}-ac-${i}`, clientId, name, system, mfa, privileged })
    })
  })

  const vulns = VULNS.map(([clientId, cve, title, severity, cvss, asset, days, fix, status], i) => ({
    id: `v-${i}`, clientId, cve, title, severity, cvss, asset, fix,
    detectedAt: now - days * DAY,
    status: status || 'abierta',
  }))

  const alerts = ALERTS.map(([clientId, title, description, severity, source, host, minAgo, respMin, status, mitre, ai], i) => {
    const ep = host ? endpoints.find(e => e.hostname === host) : null
    const createdAt = now - minAgo * MIN
    return {
      id: `a-${1000 + i}`, clientId, title, description, severity, source, mitre, aiConfidence: ai,
      endpointId: ep?.id || null, createdAt,
      firstResponseAt: respMin != null ? createdAt + respMin * MIN : null,
      resolvedAt: status === 'resuelta' || status === 'falso_positivo' ? createdAt + (respMin + 40) * MIN : null,
      status, notes: [],
    }
  })

  const clients = CLIENTS.map(c => ({
    ...c,
    since: now - c.since * DAY,
    email: EMAIL[c.id],
    backup: BACKUPS[c.id],
  }))

  const histories = {}
  const ends = { hotel: 52, clinica: 44, contable: 59, tienda: 90, logistica: 92 }
  CLIENTS.forEach((c, i) => { histories[c.id] = history(c.scoreStart, ends[c.id], 17 + i * 13) })

  const log = [
    { id: 'l-1', at: now - 2 * DAY, actor: 'Andrea Solís', clientId: 'hotel', action: 'Escaneo mensual de vulnerabilidades ejecutado (autorización firmada #HVA-2026-10).' },
    { id: 'l-2', at: now - 1 * DAY, actor: 'Mauricio Vega', clientId: 'clinica', action: 'Revisión de incidente crítico escalado por PowerShell ofuscado.' },
  ]

  return { clients, endpoints, accounts, vulns, alerts, histories, log, seededAt: now }
}
