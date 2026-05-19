# public/logos/

Acá van los logos de cada municipio cliente.

## Cómo agregar el logo de Bolívar

1. Tomá el archivo `BOLIVAR_MUNICIPIO.png` que tenés
2. Copialo a esta carpeta con el nombre: `bolivar.png`

```bash
cp /ruta/a/BOLIVAR_MUNICIPIO.png public/logos/bolivar.png
```

3. Listo. El header lo carga automáticamente y lo invierte a blanco
   (el CSS `filter: brightness(0) invert(1)` convierte cualquier logo oscuro a blanco sobre fondo azul).

## Formatos recomendados

- PNG con fondo transparente → ideal (se ve perfecto sobre el header azul)
- PNG con fondo blanco → también funciona, el filtro lo convierte
- SVG → también funciona

## Convención de nombres

| Municipio | Archivo |
|---|---|
| Bolívar | `bolivar.png` |
| Olavarría | `olavarria.png` |
| Azul | `azul.png` |

El nombre debe coincidir con el `id` del tenant en `lib/tenants.ts`.
