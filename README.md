This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# Prescriptions Frontend (Next.js)

Aplicación web que consume la **Prescriptions API** para autenticación y operación del sistema por roles (**admin / doctor / patient**), incluyendo vistas de gestión y métricas, y acciones como **descarga de PDF** de prescripciones.

> Ruta de ejemplo (producción):  
> `/admin/prescriptions/metrics`

---

## 🚀 Despliegue

- **Frontend (Vercel):** https://frontend-pt-steel.vercel.app
- **API (Railway):** https://backendpt-production.up.railway.app/
- **Swagger (Docs):** https://backendpt-production.up.railway.app/docs

## ✅ Stack / Versiones principales

- **Next.js:** `16.0.10`
- **React:** `19.2.1`
- **Zustand:** `^5.0.9` (estado de sesión)
- **Recharts:** `^3.5.1` (métricas/gráficas)
- **react-hot-toast:** `^2.6.0` (notificaciones)
- **TailwindCSS:** `^4`

---

## 🧰 Setup local

### 1) Requisitos

- Node.js (recomendado LTS)
- npm
- Backend corriendo (local o remoto)

### 2) Instalar dependencias

````bash
npm install

## ✅ Arquitectura del proyecto

```bash
src/
├─ app/
│  ├─ admin/        # Rutas/páginas del rol admin
│  ├─ doctor/       # Rutas/páginas del rol doctor
│  ├─ patient/      # Rutas/páginas del rol patient
│  ├─ login/        # Pantalla de login
│  ├─ layout.tsx
│  ├─ page.tsx
│  └─ globals.css
│
├─ components/
│  ├─ admin/        # Componentes/pantallas admin (Home, Doctors, Patients, CreateUser, etc.)
│  └─ ui/           # UI reusable (Button, Card, Input, Alert, containers, toasts, logout, etc.)
│     └─ prescriptions/  # UI específica de prescripciones (si aplica)
│
├─ lib/             # Helpers (por ejemplo, capa de requests / utils)
├─ store/
│  └─ auth.store.ts # Estado de autenticación/sesión (Zustand)
└─ types/           # Tipos compartidos (roles, DTOs, etc.)

````

## scripts

```bash
# desarrollo
npm run dev

# build
npm run build

# producción (local)
npm run start

# lint
npm run lint
```
