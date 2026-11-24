---
layout: page
sidebar: false
outline: false
title: YAT — Tuneles zero trust y redes WireGuard
description: Construye redes privadas basadas en identidad, publica servicios locales mediante túneles autenticados o crea una LAN virtual WireGuard entre dispositivos.
---

<HomeLanding
  badge="WireGuard ya está disponible"
  title="Tu red zero trust."
  titleAccent="Tuneles y LAN virtual."
  description="YAT combina túneles de servicios basados en identidad con redes WireGuard: publica aplicaciones locales, conecta dispositivos a una LAN virtual cifrada y mantiene el acceso controlado sin abrir puertos entrantes."
  :primary-action="{ text: 'Empezar gratis', link: 'https://dash.tunnel6.com/login?redirect=%2F&source=wiki&locale=es', target: '_blank' }"
  :secondary-action="{ text: 'Descargar cliente', link: '/es/download.html' }"
  github-action="Ver GitHub"
  :hero-chips="['Identidad zero trust', 'Tuneles de servicio', 'LAN virtual WireGuard', 'mTLS de extremo a extremo']"
  capability-eyebrow="Capacidades"
  capability-title="Una red privada con el control de infraestructura de producción"
  :capabilities="[
    {
      icon: '🔐',
      title: 'Conexión zero trust',
      description: 'Los dispositivos y nodos Edge se autentican mutuamente con mTLS; el acceso depende de la identidad, no de la ubicación de red ni de puertos abiertos.'
    },
    {
      icon: '🛰️',
      title: 'Tuneles y LAN virtual',
      description: 'Publica servicios HTTP, TCP y de escritorio, o crea redes WireGuard para interconectar varios dispositivos con seguridad.'
    },
    {
      icon: '🧩',
      title: 'Diseño extensible',
      description: 'Expón servicios HTTP, TCP y escritorio remoto, y amplía el cliente con aplicaciones personalizadas.'
    },
    {
      icon: '📦',
      title: 'Despliegue de producción',
      description: 'Autohospeda Edge en Linux, con scripts de despliegue, demonios y visibilidad del estado en ejecución.'
    },
    {
      icon: '🌐',
      title: 'Dominios propios',
      description: 'Usa tu dominio, configura el CNAME y haz que el tráfico pase por el nodo Edge que controlas.'
    },
    {
      icon: '👥',
      title: 'Redes inteligentes',
      description: 'WireGuard asigna IPs de subred, detecta rutas LAN y elige entre conexión directa y retransmisión.'
    }
  ]"
  workflow-eyebrow="Cómo funciona"
  workflow-title="Convierte un servicio local en una entrada pública controlada"
  workflow-description="No cambies el firewall entrante ni reescribas la infraestructura. Inicia el servicio local, conéctalo a YAT y publícalo mediante un Edge autenticado."
  :workflow-steps="[
    { title: 'Instala e inicia sesión', description: 'Instala el cliente YAT y autentica tu dispositivo con una cuenta segura.' },
    { title: 'Conecta un Edge', description: 'Suscríbete a un relé administrado o despliega tu propio Edge en un servidor público.' },
    { title: 'Crea el túnel', description: 'Elige servicio local, protocolo y Edge; YAT genera una dirección remota lista para compartir.' },
    { title: 'Controla el acceso', description: 'Inicia el túnel, supervisa tráfico, comparte la entrada o restríngela a identidades concretas.' }
  ]"
  terminal-title="Inicio rápido"
  :terminal-lines="[
    '$ python3 -m http.server 8080',
    '',
    '# En YAT',
    '# Tuneles → Crear túnel → Proxy HTTP',
    '# Puerto local: 8080 · Edge: production',
    '',
    '$ curl https://api.example.myroxy.dev',
    '200 OK · mTLS verificado'
  ]"
  use-case-eyebrow="Casos de uso"
  use-case-title="Pensado para redes reales, no solo demos"
  :use-cases="[
    { icon: '🏠', title: 'Servicios domésticos', description: 'Accede a paneles NAS, herramientas multimedia y aplicaciones internas sin exponer tu red.' },
    { icon: '💻', title: 'Entornos de desarrollo', description: 'Da acceso controlado a APIs locales y entornos de revisión a tu equipo.' },
    { icon: '🖥️', title: 'Escritorio remoto', description: 'Accede de forma segura a ARD y VNC en equipos macOS y Windows.' },
    { icon: '🎮', title: 'Servidores de juego', description: 'Ejecuta partidas multijugador para tu grupo sin abrir puertos en el firewall.' }
  ]"
  architecture-eyebrow="Dos modelos de red"
  architecture-title="Una aplicación para túneles y redes de dispositivos"
  architecture-description="YAT separa publicar un servicio de construir una red, para que no tengas que mantener otra herramienta VPN."
  :tunnel-mode="{
    icon: '🛣️',
    eyebrow: 'Acceso a servicios',
    title: 'Modo túnel',
    description: 'Los túneles punto a punto convierten un servicio local en una entrada remota controlada para visitantes seleccionados.',
    points: [
      'Publica HTTP, TCP, ARD y VNC',
      'Enruta por Edge autenticado con mTLS o P2P',
      'Usa dominios propios sin reglas entrantes de firewall',
      'Separa roles de publicador, consumidor y controlador'
    ],
    guideLink: '/es/guide/transport-modes.html',
    guideLabel: 'Leer la guía de túneles'
  }"
  :wireguard-mode="{
    icon: '🛡️',
    eyebrow: 'Interconexión de dispositivos',
    title: 'Redes WireGuard',
    description: 'Crea una LAN virtual cifrada en la que cada dispositivo aprobado recibe una dirección de la misma subred.',
    points: [
      'Asignación automática de IP en subred virtual',
      'Cifrado WireGuard de extremo a extremo en el kernel',
      'Selección automática de ruta LAN, pública o retransmitida',
      'Rendimiento casi nativo para archivos y bases de datos'
    ],
    guideLink: '/es/guide/wireguard-networking.html',
    guideLabel: 'Leer la guía de WireGuard'
  }"
  cta-title="Despliega hoy tu primer túnel seguro."
  cta-description="Descarga YAT, conecta un Edge y crea una entrada zero trust o una LAN virtual WireGuard en minutos."
  :cta-action="{ text: 'Empezar ahora', link: 'https://dash.tunnel6.com/login?redirect=%2F&source=wiki&locale=es', target: '_blank' }"
  :docs-action="{ text: 'Leer la documentación', link: '/es/guide/what-is-yat.html' }"
/>
