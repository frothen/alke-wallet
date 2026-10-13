# Alke Wallet — Módulo 2: Fundamentos del desarrollo Front-end

Prototipo académico responsive de una billetera digital. Implementa navegación, inicio de sesión de demostración, saldo, depósitos, retiros, contactos, transferencias simuladas e historial de movimientos.

## Requisitos cubiertos

- **HTML semántico:** páginas y formularios separados por funcionalidad.
- **CSS responsive:** estilos propios en `css/styles.css`, con adaptación a pantallas pequeñas.
- **Bootstrap 5:** navbar responsive, formularios, botones, tarjetas, alertas y modal de confirmación.
- **JavaScript:** validación de acceso, operaciones de saldo, contactos y transacciones.
- **jQuery:** eventos, mensajes dinámicos y efectos visuales.
- **Autocompletar:** búsqueda de contactos con jQuery UI en `sendmoney.html`.
- **Persistencia de demostración:** `localStorage` conserva datos en el mismo navegador.
- **Git/GitHub:** instrucciones sugeridas más abajo.

## Estructura

```text
alke-wallet/
├── index.html
├── login.html
├── menu.html
├── deposit.html
├── sendmoney.html
├── transactions.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── README.md
└── .gitignore
```

## Cómo ejecutar

1. Descomprime el archivo ZIP.
2. Abre la carpeta `alke-wallet` en Visual Studio Code.
3. Para una experiencia local más consistente, usa la extensión **Live Server** y selecciona `index.html` → **Open with Live Server**.
4. También puedes abrir `index.html` directamente en un navegador moderno. Se necesita conexión a Internet para cargar Bootstrap, jQuery, jQuery UI y Google Fonts desde sus CDN.

### Credenciales de demostración

- Correo: `demo@alkewallet.cl`
- Contraseña: `wallet123`

## Funcionalidades para probar

1. Inicia sesión con las credenciales anteriores.
2. En el menú, revisa el saldo inicial de demostración.
3. En **Depósitos y retiros**, ingresa un monto entero y realiza un depósito o retiro. No se permite retirar más que el saldo disponible.
4. En **Enviar dinero**, elige un contacto, ingresa un monto y confirma la operación. Puedes agregar contactos nuevos.
5. En **Últimos movimientos**, filtra por depósitos, retiros, transferencias y recepciones.
6. Cierra sesión con el botón de la barra de navegación.

## Publicar en GitHub

En la terminal de Visual Studio Code, desde la carpeta del proyecto:

```bash
git init
git add .
git commit -m "feat: crear prototipo inicial de Alke Wallet"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/alke-wallet.git
git push -u origin main
```

Para seguir el flujo de ramas sugerido en la evaluación:

```bash
git checkout -b feature/login
# realizar cambios y probar
git add .
git commit -m "feat: validar inicio de sesión"
git push -u origin feature/login
```

Después crea un Pull Request en GitHub hacia `main`. Puedes repetir el flujo para `feature/transacciones` y `feature/depositos`.

## Importante: alcance y seguridad

Este proyecto es solo una **simulación frontend**. No tiene backend, base de datos ni autenticación real. La contraseña de demostración está visible en el código y `localStorage` no es apropiado para guardar información financiera real. No ingresar datos bancarios verdaderos. Para una wallet de producción se requiere backend, autenticación segura, autorización, cifrado, validación del lado servidor y controles antifraude.
