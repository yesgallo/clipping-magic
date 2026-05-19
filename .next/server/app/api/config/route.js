/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/config/route";
exports.ids = ["app/api/config/route"];
exports.modules = {

/***/ "(rsc)/./app/api/config/route.ts":
/*!*********************************!*\
  !*** ./app/api/config/route.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_tenants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/tenants */ \"(rsc)/./lib/tenants.ts\");\n// app/api/config/route.ts\n// Returns public tenant config (no secrets).\n\n\nasync function GET(req) {\n    const { searchParams, hostname } = new URL(req.url);\n    const tenantId = (0,_lib_tenants__WEBPACK_IMPORTED_MODULE_1__.resolveTenantId)(hostname, searchParams);\n    const tenant = (0,_lib_tenants__WEBPACK_IMPORTED_MODULE_1__.getTenant)(tenantId);\n    if (!tenant) return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        error: \"Not found\"\n    }, {\n        status: 404\n    });\n    // Strip sensitive fields\n    const { adminPassword: _, ...publicConfig } = tenant;\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(publicConfig);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2NvbmZpZy9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSwwQkFBMEI7QUFDMUIsNkNBQTZDO0FBQ1c7QUFDRztBQUVwRCxlQUFlRyxJQUFJQyxHQUFnQjtJQUN4QyxNQUFNLEVBQUVDLFlBQVksRUFBRUMsUUFBUSxFQUFFLEdBQUcsSUFBSUMsSUFBSUgsSUFBSUksR0FBRztJQUNsRCxNQUFNQyxXQUFXUCw2REFBZUEsQ0FBQ0ksVUFBVUQ7SUFDM0MsTUFBTUssU0FBU1QsdURBQVNBLENBQUNRO0lBQ3pCLElBQUksQ0FBQ0MsUUFBUSxPQUFPVixxREFBWUEsQ0FBQ1csSUFBSSxDQUFDO1FBQUVDLE9BQU87SUFBWSxHQUFHO1FBQUVDLFFBQVE7SUFBSTtJQUU1RSx5QkFBeUI7SUFDekIsTUFBTSxFQUFFQyxlQUFlQyxDQUFDLEVBQUUsR0FBR0MsY0FBYyxHQUFHTjtJQUM5QyxPQUFPVixxREFBWUEsQ0FBQ1csSUFBSSxDQUFDSztBQUMzQiIsInNvdXJjZXMiOlsiL1VzZXJzL0FwcGxlL0Rldi9Qcm9qZWN0cy9jbGlwcGluZy1tYWdpYy9hcHAvYXBpL2NvbmZpZy9yb3V0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBhcHAvYXBpL2NvbmZpZy9yb3V0ZS50c1xuLy8gUmV0dXJucyBwdWJsaWMgdGVuYW50IGNvbmZpZyAobm8gc2VjcmV0cykuXG5pbXBvcnQgeyBOZXh0UmVxdWVzdCwgTmV4dFJlc3BvbnNlIH0gZnJvbSBcIm5leHQvc2VydmVyXCI7XG5pbXBvcnQgeyBnZXRUZW5hbnQsIHJlc29sdmVUZW5hbnRJZCB9IGZyb20gXCJAL2xpYi90ZW5hbnRzXCI7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHRVQocmVxOiBOZXh0UmVxdWVzdCkge1xuICBjb25zdCB7IHNlYXJjaFBhcmFtcywgaG9zdG5hbWUgfSA9IG5ldyBVUkwocmVxLnVybCk7XG4gIGNvbnN0IHRlbmFudElkID0gcmVzb2x2ZVRlbmFudElkKGhvc3RuYW1lLCBzZWFyY2hQYXJhbXMpO1xuICBjb25zdCB0ZW5hbnQgPSBnZXRUZW5hbnQodGVuYW50SWQpO1xuICBpZiAoIXRlbmFudCkgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6IFwiTm90IGZvdW5kXCIgfSwgeyBzdGF0dXM6IDQwNCB9KTtcblxuICAvLyBTdHJpcCBzZW5zaXRpdmUgZmllbGRzXG4gIGNvbnN0IHsgYWRtaW5QYXNzd29yZDogXywgLi4ucHVibGljQ29uZmlnIH0gPSB0ZW5hbnQ7XG4gIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihwdWJsaWNDb25maWcpO1xufVxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsImdldFRlbmFudCIsInJlc29sdmVUZW5hbnRJZCIsIkdFVCIsInJlcSIsInNlYXJjaFBhcmFtcyIsImhvc3RuYW1lIiwiVVJMIiwidXJsIiwidGVuYW50SWQiLCJ0ZW5hbnQiLCJqc29uIiwiZXJyb3IiLCJzdGF0dXMiLCJhZG1pblBhc3N3b3JkIiwiXyIsInB1YmxpY0NvbmZpZyJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/config/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/tenants.ts":
/*!************************!*\
  !*** ./lib/tenants.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getAllTenants: () => (/* binding */ getAllTenants),\n/* harmony export */   getTenant: () => (/* binding */ getTenant),\n/* harmony export */   resolveTenantId: () => (/* binding */ resolveTenantId)\n/* harmony export */ });\n// lib/tenants.ts\nconst TENANTS = {\n    bolivar: {\n        id: \"bolivar\",\n        name: \"Bolívar\",\n        municipality: \"San Carlos de Bolívar\",\n        province: \"Buenos Aires\",\n        logoText: \"B\",\n        logoUrl: \"/logos/bolivar.png\",\n        primaryColor: \"#1B3A5C\",\n        secondaryColor: \"#4A7FB5\",\n        accentColor: \"#B5D4F4\",\n        sources: {\n            local: [\n                \"presentenoticias.com\",\n                \"diariolamanana.com.ar\",\n                \"quepasaenbolivar.com.ar\",\n                \"fm10bolivar.com.ar\"\n            ],\n            regional: [\n                \"septimaseccion.com.ar\",\n                \"lapoliticaonline.com\",\n                \"infocielo.com\",\n                \"latecla.info\",\n                \"lanoticia1.com\",\n                \"grupolaprovincia.com\",\n                \"0221.com.ar\"\n            ],\n            national: [\n                \"infocampo.com.ar\"\n            ]\n        },\n        searchTerms: [\n            \"Bolívar Buenos Aires\",\n            \"Bali Bucca\",\n            \"municipio Bolívar\"\n        ],\n        adminPassword: process.env.BOLIVAR_ADMIN_PASSWORD || \"admin123\"\n    }\n};\nfunction getTenant(id) {\n    return TENANTS[id] ?? null;\n}\nfunction getAllTenants() {\n    return Object.values(TENANTS);\n}\nfunction resolveTenantId(hostname, searchParams) {\n    const override = searchParams?.get(\"tenant\");\n    if (override && TENANTS[override]) return override;\n    const parts = hostname.split(\".\");\n    if (parts.length >= 3 && TENANTS[parts[0]]) return parts[0];\n    return \"bolivar\";\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvdGVuYW50cy50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxpQkFBaUI7QUFvQmpCLE1BQU1BLFVBQXdDO0lBQzVDQyxTQUFTO1FBQ1BDLElBQUk7UUFDSkMsTUFBTTtRQUNOQyxjQUFjO1FBQ2RDLFVBQVU7UUFDVkMsVUFBVTtRQUNWQyxTQUFTO1FBQ1RDLGNBQWM7UUFDZEMsZ0JBQWdCO1FBQ2hCQyxhQUFhO1FBQ2JDLFNBQVM7WUFDUEMsT0FBTztnQkFDTDtnQkFDQTtnQkFDQTtnQkFDQTthQUNEO1lBQ0RDLFVBQVU7Z0JBQ1I7Z0JBQ0E7Z0JBQ0E7Z0JBQ0E7Z0JBQ0E7Z0JBQ0E7Z0JBQ0E7YUFDRDtZQUNEQyxVQUFVO2dCQUFDO2FBQW1CO1FBQ2hDO1FBQ0FDLGFBQWE7WUFBQztZQUF3QjtZQUFjO1NBQW9CO1FBQ3hFQyxlQUFlQyxRQUFRQyxHQUFHLENBQUNDLHNCQUFzQixJQUFJO0lBQ3ZEO0FBcUJGO0FBRU8sU0FBU0MsVUFBVWxCLEVBQVU7SUFDbEMsT0FBT0YsT0FBTyxDQUFDRSxHQUFHLElBQUk7QUFDeEI7QUFFTyxTQUFTbUI7SUFDZCxPQUFPQyxPQUFPQyxNQUFNLENBQUN2QjtBQUN2QjtBQUVPLFNBQVN3QixnQkFDZEMsUUFBZ0IsRUFDaEJDLFlBQThCO0lBRTlCLE1BQU1DLFdBQVdELGNBQWNFLElBQUk7SUFDbkMsSUFBSUQsWUFBWTNCLE9BQU8sQ0FBQzJCLFNBQVMsRUFBRSxPQUFPQTtJQUMxQyxNQUFNRSxRQUFRSixTQUFTSyxLQUFLLENBQUM7SUFDN0IsSUFBSUQsTUFBTUUsTUFBTSxJQUFJLEtBQUsvQixPQUFPLENBQUM2QixLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsT0FBT0EsS0FBSyxDQUFDLEVBQUU7SUFDM0QsT0FBTztBQUNUIiwic291cmNlcyI6WyIvVXNlcnMvQXBwbGUvRGV2L1Byb2plY3RzL2NsaXBwaW5nLW1hZ2ljL2xpYi90ZW5hbnRzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIGxpYi90ZW5hbnRzLnRzXG5leHBvcnQgaW50ZXJmYWNlIFRlbmFudENvbmZpZyB7XG4gIGlkOiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbiAgbXVuaWNpcGFsaXR5OiBzdHJpbmc7XG4gIHByb3ZpbmNlOiBzdHJpbmc7XG4gIGxvZ29UZXh0OiBzdHJpbmc7XG4gIGxvZ29Vcmw/OiBzdHJpbmc7ICAgICAgICAgLy8g4oaQIE5VRVZPOiBVUkwvcGF0aCBhbCBsb2dvIFNWRyBvIFBOR1xuICBwcmltYXJ5Q29sb3I6IHN0cmluZztcbiAgc2Vjb25kYXJ5Q29sb3I6IHN0cmluZztcbiAgYWNjZW50Q29sb3I6IHN0cmluZztcbiAgc291cmNlczoge1xuICAgIGxvY2FsOiBzdHJpbmdbXTtcbiAgICByZWdpb25hbDogc3RyaW5nW107XG4gICAgbmF0aW9uYWw6IHN0cmluZ1tdO1xuICB9O1xuICBzZWFyY2hUZXJtczogc3RyaW5nW107XG4gIGFkbWluUGFzc3dvcmQ6IHN0cmluZztcbn1cblxuY29uc3QgVEVOQU5UUzogUmVjb3JkPHN0cmluZywgVGVuYW50Q29uZmlnPiA9IHtcbiAgYm9saXZhcjoge1xuICAgIGlkOiBcImJvbGl2YXJcIixcbiAgICBuYW1lOiBcIkJvbMOtdmFyXCIsXG4gICAgbXVuaWNpcGFsaXR5OiBcIlNhbiBDYXJsb3MgZGUgQm9sw612YXJcIixcbiAgICBwcm92aW5jZTogXCJCdWVub3MgQWlyZXNcIixcbiAgICBsb2dvVGV4dDogXCJCXCIsXG4gICAgbG9nb1VybDogXCIvbG9nb3MvYm9saXZhci5wbmdcIiwgICAvLyDihpAgcG9uw6lzIGVsIGFyY2hpdm8gZW4gcHVibGljL2xvZ29zL2JvbGl2YXIucG5nXG4gICAgcHJpbWFyeUNvbG9yOiBcIiMxQjNBNUNcIixcbiAgICBzZWNvbmRhcnlDb2xvcjogXCIjNEE3RkI1XCIsXG4gICAgYWNjZW50Q29sb3I6IFwiI0I1RDRGNFwiLFxuICAgIHNvdXJjZXM6IHtcbiAgICAgIGxvY2FsOiBbXG4gICAgICAgIFwicHJlc2VudGVub3RpY2lhcy5jb21cIixcbiAgICAgICAgXCJkaWFyaW9sYW1hbmFuYS5jb20uYXJcIixcbiAgICAgICAgXCJxdWVwYXNhZW5ib2xpdmFyLmNvbS5hclwiLFxuICAgICAgICBcImZtMTBib2xpdmFyLmNvbS5hclwiLFxuICAgICAgXSxcbiAgICAgIHJlZ2lvbmFsOiBbXG4gICAgICAgIFwic2VwdGltYXNlY2Npb24uY29tLmFyXCIsXG4gICAgICAgIFwibGFwb2xpdGljYW9ubGluZS5jb21cIixcbiAgICAgICAgXCJpbmZvY2llbG8uY29tXCIsXG4gICAgICAgIFwibGF0ZWNsYS5pbmZvXCIsXG4gICAgICAgIFwibGFub3RpY2lhMS5jb21cIixcbiAgICAgICAgXCJncnVwb2xhcHJvdmluY2lhLmNvbVwiLFxuICAgICAgICBcIjAyMjEuY29tLmFyXCIsXG4gICAgICBdLFxuICAgICAgbmF0aW9uYWw6IFtcImluZm9jYW1wby5jb20uYXJcIl0sXG4gICAgfSxcbiAgICBzZWFyY2hUZXJtczogW1wiQm9sw612YXIgQnVlbm9zIEFpcmVzXCIsIFwiQmFsaSBCdWNjYVwiLCBcIm11bmljaXBpbyBCb2zDrXZhclwiXSxcbiAgICBhZG1pblBhc3N3b3JkOiBwcm9jZXNzLmVudi5CT0xJVkFSX0FETUlOX1BBU1NXT1JEIHx8IFwiYWRtaW4xMjNcIixcbiAgfSxcblxuICAvLyDilIDilIAgVEVNUExBVEUg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4gIC8vIG9sYXZhcnJpYToge1xuICAvLyAgIGlkOiBcIm9sYXZhcnJpYVwiLFxuICAvLyAgIG5hbWU6IFwiT2xhdmFycsOtYVwiLFxuICAvLyAgIG11bmljaXBhbGl0eTogXCJPbGF2YXJyw61hXCIsXG4gIC8vICAgcHJvdmluY2U6IFwiQnVlbm9zIEFpcmVzXCIsXG4gIC8vICAgbG9nb1RleHQ6IFwiT1wiLFxuICAvLyAgIGxvZ29Vcmw6IFwiL2xvZ29zL29sYXZhcnJpYS5wbmdcIixcbiAgLy8gICBwcmltYXJ5Q29sb3I6IFwiIzJENTAxNlwiLFxuICAvLyAgIHNlY29uZGFyeUNvbG9yOiBcIiM1QThBMzBcIixcbiAgLy8gICBhY2NlbnRDb2xvcjogXCIjQzVFOEEwXCIsXG4gIC8vICAgc291cmNlczoge1xuICAvLyAgICAgbG9jYWw6IFtcImVscG9wdWxhci5jb20uYXJcIl0sXG4gIC8vICAgICByZWdpb25hbDogW1wic2VwdGltYXNlY2Npb24uY29tLmFyXCIsIFwiaW5mb2NpZWxvLmNvbVwiXSxcbiAgLy8gICAgIG5hdGlvbmFsOiBbXCJpbmZvY2FtcG8uY29tLmFyXCJdLFxuICAvLyAgIH0sXG4gIC8vICAgc2VhcmNoVGVybXM6IFtcIk9sYXZhcnLDrWEgQnVlbm9zIEFpcmVzXCJdLFxuICAvLyAgIGFkbWluUGFzc3dvcmQ6IHByb2Nlc3MuZW52Lk9MQVZBUlJJQV9BRE1JTl9QQVNTV09SRCB8fCBcImFkbWluMTIzXCIsXG4gIC8vIH0sXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGVuYW50KGlkOiBzdHJpbmcpOiBUZW5hbnRDb25maWcgfCBudWxsIHtcbiAgcmV0dXJuIFRFTkFOVFNbaWRdID8/IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbGxUZW5hbnRzKCk6IFRlbmFudENvbmZpZ1tdIHtcbiAgcmV0dXJuIE9iamVjdC52YWx1ZXMoVEVOQU5UUyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlVGVuYW50SWQoXG4gIGhvc3RuYW1lOiBzdHJpbmcsXG4gIHNlYXJjaFBhcmFtcz86IFVSTFNlYXJjaFBhcmFtc1xuKTogc3RyaW5nIHtcbiAgY29uc3Qgb3ZlcnJpZGUgPSBzZWFyY2hQYXJhbXM/LmdldChcInRlbmFudFwiKTtcbiAgaWYgKG92ZXJyaWRlICYmIFRFTkFOVFNbb3ZlcnJpZGVdKSByZXR1cm4gb3ZlcnJpZGU7XG4gIGNvbnN0IHBhcnRzID0gaG9zdG5hbWUuc3BsaXQoXCIuXCIpO1xuICBpZiAocGFydHMubGVuZ3RoID49IDMgJiYgVEVOQU5UU1twYXJ0c1swXV0pIHJldHVybiBwYXJ0c1swXTtcbiAgcmV0dXJuIFwiYm9saXZhclwiO1xufVxuIl0sIm5hbWVzIjpbIlRFTkFOVFMiLCJib2xpdmFyIiwiaWQiLCJuYW1lIiwibXVuaWNpcGFsaXR5IiwicHJvdmluY2UiLCJsb2dvVGV4dCIsImxvZ29VcmwiLCJwcmltYXJ5Q29sb3IiLCJzZWNvbmRhcnlDb2xvciIsImFjY2VudENvbG9yIiwic291cmNlcyIsImxvY2FsIiwicmVnaW9uYWwiLCJuYXRpb25hbCIsInNlYXJjaFRlcm1zIiwiYWRtaW5QYXNzd29yZCIsInByb2Nlc3MiLCJlbnYiLCJCT0xJVkFSX0FETUlOX1BBU1NXT1JEIiwiZ2V0VGVuYW50IiwiZ2V0QWxsVGVuYW50cyIsIk9iamVjdCIsInZhbHVlcyIsInJlc29sdmVUZW5hbnRJZCIsImhvc3RuYW1lIiwic2VhcmNoUGFyYW1zIiwib3ZlcnJpZGUiLCJnZXQiLCJwYXJ0cyIsInNwbGl0IiwibGVuZ3RoIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./lib/tenants.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fconfig%2Froute&page=%2Fapi%2Fconfig%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fconfig%2Froute.ts&appDir=%2FUsers%2FApple%2FDev%2FProjects%2Fclipping-magic%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2FApple%2FDev%2FProjects%2Fclipping-magic&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fconfig%2Froute&page=%2Fapi%2Fconfig%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fconfig%2Froute.ts&appDir=%2FUsers%2FApple%2FDev%2FProjects%2Fclipping-magic%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2FApple%2FDev%2FProjects%2Fclipping-magic&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_Apple_Dev_Projects_clipping_magic_app_api_config_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/config/route.ts */ \"(rsc)/./app/api/config/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/config/route\",\n        pathname: \"/api/config\",\n        filename: \"route\",\n        bundlePath: \"app/api/config/route\"\n    },\n    resolvedPagePath: \"/Users/Apple/Dev/Projects/clipping-magic/app/api/config/route.ts\",\n    nextConfigOutput,\n    userland: _Users_Apple_Dev_Projects_clipping_magic_app_api_config_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZjb25maWclMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmNvbmZpZyUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmNvbmZpZyUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRkFwcGxlJTJGRGV2JTJGUHJvamVjdHMlMkZjbGlwcGluZy1tYWdpYyUyRmFwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9JTJGVXNlcnMlMkZBcHBsZSUyRkRldiUyRlByb2plY3RzJTJGY2xpcHBpbmctbWFnaWMmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQStGO0FBQ3ZDO0FBQ3FCO0FBQ2dCO0FBQzdGO0FBQ0E7QUFDQTtBQUNBLHdCQUF3Qix5R0FBbUI7QUFDM0M7QUFDQSxjQUFjLGtFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsc0RBQXNEO0FBQzlEO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQzBGOztBQUUxRiIsInNvdXJjZXMiOlsiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIvVXNlcnMvQXBwbGUvRGV2L1Byb2plY3RzL2NsaXBwaW5nLW1hZ2ljL2FwcC9hcGkvY29uZmlnL3JvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9jb25maWcvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9jb25maWdcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2NvbmZpZy9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIi9Vc2Vycy9BcHBsZS9EZXYvUHJvamVjdHMvY2xpcHBpbmctbWFnaWMvYXBwL2FwaS9jb25maWcvcm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICB3b3JrQXN5bmNTdG9yYWdlLFxuICAgICAgICB3b3JrVW5pdEFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fconfig%2Froute&page=%2Fapi%2Fconfig%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fconfig%2Froute.ts&appDir=%2FUsers%2FApple%2FDev%2FProjects%2Fclipping-magic%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2FApple%2FDev%2FProjects%2Fclipping-magic&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fconfig%2Froute&page=%2Fapi%2Fconfig%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fconfig%2Froute.ts&appDir=%2FUsers%2FApple%2FDev%2FProjects%2Fclipping-magic%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2FApple%2FDev%2FProjects%2Fclipping-magic&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();